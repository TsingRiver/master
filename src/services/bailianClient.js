/**
 * 百炼基础配置：
 * 统一由 Vite 环境变量注入，便于多个测试页面共享。
 */
const BAILIAN_ENDPOINT =
  import.meta.env.VITE_BAILIAN_ENDPOINT ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const BAILIAN_MODEL = import.meta.env.VITE_BAILIAN_MODEL ?? "qwen-plus";
const BAILIAN_API_KEY = import.meta.env.VITE_BAILIAN_API_KEY ?? "";

/**
 * 解析正整数配置值。
 * @param {unknown} rawValue 原始配置值。
 * @param {number} fallbackValue 兜底值。
 * @returns {number} 合法正整数。
 */
function parsePositiveInteger(rawValue, fallbackValue) {
  const parsedValue = Number.parseInt(String(rawValue ?? ""), 10);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallbackValue;
}

/**
 * 全局超时与重试配置：
 * 1. 可通过环境变量覆盖。
 * 2. 用于提升移动网络和高峰期接口稳定性。
 */
const BAILIAN_TIMEOUT_DEFAULT_MS = parsePositiveInteger(
  import.meta.env.VITE_BAILIAN_TIMEOUT_MS,
  26000,
);
const BAILIAN_RETRY_COUNT_DEFAULT = parsePositiveInteger(
  import.meta.env.VITE_BAILIAN_RETRY_COUNT,
  1,
);
const BAILIAN_RETRY_DELAY_DEFAULT_MS = parsePositiveInteger(
  import.meta.env.VITE_BAILIAN_RETRY_DELAY_MS,
  650,
);

/**
 * 从模型返回文本中提取 JSON。
 * @param {string} text 模型原始文本。
 * @returns {object|null} 解析后的对象，失败返回 null。
 */
function parseJsonFromText(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  const jsonCandidate = fencedMatch?.[1] ?? text;

  try {
    return JSON.parse(jsonCandidate);
  } catch {
    // 关键逻辑：兼容“解释文本 + JSON”混合输出。
    const broadMatch = text.match(/\{[\s\S]*\}/);
    if (!broadMatch) {
      return null;
    }

    try {
      return JSON.parse(broadMatch[0]);
    } catch {
      return null;
    }
  }
}

/**
 * 休眠等待。
 * @param {number} durationMs 等待时长（毫秒）。
 * @returns {Promise<void>} Promise。
 */
function sleep(durationMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, Number(durationMs) || 0));
  });
}

/**
 * 判断是否为请求超时错误。
 * @param {unknown} error 错误对象。
 * @returns {boolean} 是否超时。
 */
function isTimeoutError(error) {
  const errorName = String(error?.name ?? "");
  if (errorName === "AbortError") {
    return true;
  }

  const errorMessage = String(error?.message ?? "").toLowerCase();
  return errorMessage.includes("aborted") || errorMessage.includes("timeout");
}

/**
 * 判断错误是否可重试。
 * @param {unknown} error 错误对象。
 * @returns {boolean} 是否可重试。
 */
function isRetriableError(error) {
  if (isTimeoutError(error)) {
    return true;
  }

  const statusCode = Number(error?.status ?? 0);
  if (statusCode === 408 || statusCode === 429 || statusCode >= 500) {
    return true;
  }

  return error instanceof TypeError;
}

/**
 * 百炼 chat/completions 通用请求。
 * @param {object} params 请求参数对象。
 * @param {string} params.systemPrompt 系统提示词。
 * @param {string} params.userPrompt 用户提示词。
 * @param {number} [params.timeoutMs=26000] 超时时间（毫秒）。
 * @param {number} [params.temperature=0.2] 采样温度。
 * @param {number} [params.retryCount=1] 超时/网络抖动时重试次数。
 * @param {number} [params.retryDelayMs=650] 每次重试前等待时长（毫秒）。
 * @returns {Promise<object|null>} 解析后的 JSON；若解析失败返回 null。
 */
export async function requestBailianJson({
  systemPrompt,
  userPrompt,
  timeoutMs = BAILIAN_TIMEOUT_DEFAULT_MS,
  temperature = 0.2,
  retryCount = BAILIAN_RETRY_COUNT_DEFAULT,
  retryDelayMs = BAILIAN_RETRY_DELAY_DEFAULT_MS,
}) {
  if (!BAILIAN_API_KEY) {
    throw new Error("缺少 VITE_BAILIAN_API_KEY，无法调用百炼接口");
  }

  // 关键逻辑：识别常见占位符，避免请求发出后才得到 401。
  if (
    BAILIAN_API_KEY === "your_bailian_api_key" ||
    BAILIAN_API_KEY.toLowerCase().includes("your_bailian_api_key")
  ) {
    throw new Error(
      "VITE_BAILIAN_API_KEY 仍是占位值，请在 .env 中替换为真实百炼 API Key",
    );
  }

  const safeRetryCount = Math.max(0, Number.parseInt(String(retryCount), 10) || 0);
  const safeRetryDelayMs = Math.max(
    0,
    Number.parseInt(String(retryDelayMs), 10) || 0,
  );

  let lastError = null;

  /**
   * 重试复杂度评估：O(R)
   * R 为重试总尝试次数（retryCount + 1），当前默认 R=2。
   */
  for (let attemptIndex = 0; attemptIndex <= safeRetryCount; attemptIndex += 1) {
    // 关键逻辑：每次重试按比例放宽超时，避免首轮边缘超时后仍然过早取消。
    const attemptTimeoutMs =
      attemptIndex === 0
        ? timeoutMs
        : Math.round(timeoutMs * (1 + attemptIndex * 0.55));

    const timeoutController = new AbortController();
    const timeoutHandle = setTimeout(
      () => timeoutController.abort(),
      attemptTimeoutMs,
    );

    try {
      const response = await fetch(BAILIAN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BAILIAN_API_KEY}`,
        },
        body: JSON.stringify({
          model: BAILIAN_MODEL,
          temperature,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: timeoutController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const requestError = new Error(
          `百炼接口调用失败（HTTP ${response.status}）：${errorText}`,
        );

        // 关键逻辑：将 HTTP 状态挂到错误对象，供重试策略判定是否可重试。
        requestError.status = response.status;
        throw requestError;
      }

      const responseJson = await response.json();
      const rawContent = responseJson?.choices?.[0]?.message?.content ?? "";
      const textContent =
        typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      return parseJsonFromText(textContent);
    } catch (error) {
      lastError = error;

      const hasNextAttempt = attemptIndex < safeRetryCount;
      if (!hasNextAttempt || !isRetriableError(error)) {
        if (isTimeoutError(error)) {
          throw new Error(
            `百炼接口请求超时（${attemptTimeoutMs}ms），请稍后重试`,
          );
        }

        throw error;
      }

      await sleep(safeRetryDelayMs * (attemptIndex + 1));
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  throw lastError ?? new Error("百炼接口调用失败，请稍后重试");
}
