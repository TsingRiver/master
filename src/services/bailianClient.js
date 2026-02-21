/**
 * 百炼基础配置：
 * 统一由 Vite 环境变量注入，便于多个测试页面共享。
 */
const BAILIAN_ENDPOINT =
  import.meta.env.VITE_BAILIAN_ENDPOINT ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const BAILIAN_MODEL =
  import.meta.env.VITE_BAILIAN_MODEL ?? "qwen3.5-plus-2026-02-15";
const BAILIAN_MODEL_FALLBACKS =
  import.meta.env.VITE_BAILIAN_MODEL_FALLBACKS ?? "";
const BAILIAN_MODEL_PRIORITY = import.meta.env.VITE_BAILIAN_MODEL_PRIORITY ?? "";
const BAILIAN_API_KEY = import.meta.env.VITE_BAILIAN_API_KEY ?? "";

/**
 * 解析布尔配置值。
 * @param {unknown} rawValue 原始配置值。
 * @param {boolean} fallbackValue 兜底值。
 * @returns {boolean} 布尔结果。
 */
function parseBooleanValue(rawValue, fallbackValue) {
  const normalizedValue = String(rawValue ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["false", "0", "no", "n", "off"].includes(normalizedValue)) {
    return false;
  }

  return fallbackValue;
}

const BAILIAN_ENABLE_THINKING_DEFAULT = parseBooleanValue(
  import.meta.env.VITE_BAILIAN_ENABLE_THINKING,
  false,
);
const BAILIAN_STREAM_DEFAULT = parseBooleanValue(
  import.meta.env.VITE_BAILIAN_STREAM,
  true,
);

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
 * 解析模型列表字符串。
 * @param {unknown} rawModelList 原始模型列表（逗号分隔）。
 * @returns {Array<string>} 模型数组。
 */
function parseModelList(rawModelList) {
  return String(rawModelList ?? "")
    .split(",")
    .map((modelItem) => String(modelItem ?? "").trim())
    .filter(Boolean);
}

/**
 * 对模型列表做去重和清洗。
 * @param {Array<string>} modelList 原始模型列表。
 * @returns {Array<string>} 去重后模型列表。
 */
function dedupeModelList(modelList) {
  const uniqueModelMap = new Map();

  modelList.forEach((modelItem) => {
    const normalizedModelName = String(modelItem ?? "").trim();
    if (!normalizedModelName) {
      return;
    }

    const dedupeKey = normalizedModelName.toLowerCase();
    if (!uniqueModelMap.has(dedupeKey)) {
      uniqueModelMap.set(dedupeKey, normalizedModelName);
    }
  });

  return Array.from(uniqueModelMap.values());
}

/**
 * 构建全局模型候选序列：
 * 1. `VITE_BAILIAN_MODEL_PRIORITY`（完整优先级）优先级最高。
 * 2. 若未配置，则使用 `VITE_BAILIAN_MODEL + VITE_BAILIAN_MODEL_FALLBACKS`。
 * 3. 最后补默认降级模型，避免单模型不可用时直接失败。
 * @returns {Array<string>} 全局模型候选序列。
 */
function resolveGlobalModelCandidates() {
  const priorityModels = dedupeModelList(parseModelList(BAILIAN_MODEL_PRIORITY));
  if (priorityModels.length > 0) {
    return priorityModels;
  }

  const fallbackModels = dedupeModelList(parseModelList(BAILIAN_MODEL_FALLBACKS));
  const defaultFallbackModels = ["qwen3.5-plus", "qwen-turbo"];

  return dedupeModelList([BAILIAN_MODEL, ...fallbackModels, ...defaultFallbackModels]);
}

/**
 * 当前会话的全局模型候选序列。
 */
const BAILIAN_MODEL_CANDIDATES = resolveGlobalModelCandidates();

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
 * 归一化模型 content 字段，兼容字符串、数组和对象结构。
 * @param {unknown} rawContent 模型原始 content。
 * @returns {string} 归一化后的文本内容。
 */
function normalizeModelContent(rawContent) {
  if (typeof rawContent === "string") {
    return rawContent;
  }

  if (Array.isArray(rawContent)) {
    return rawContent
      .map((contentItem) => {
        if (typeof contentItem === "string") {
          return contentItem;
        }

        if (typeof contentItem?.text === "string") {
          return contentItem.text;
        }

        if (typeof contentItem?.content === "string") {
          return contentItem.content;
        }

        if (typeof contentItem?.output_text === "string") {
          return contentItem.output_text;
        }

        return "";
      })
      .join("");
  }

  if (rawContent && typeof rawContent === "object") {
    if (typeof rawContent.text === "string") {
      return rawContent.text;
    }

    if (typeof rawContent.content === "string") {
      return rawContent.content;
    }
  }

  return "";
}

/**
 * 从单个响应块提取助手内容。
 * @param {unknown} chunkJson 流式事件或普通响应块。
 * @returns {string} 当前块的文本内容。
 */
function extractAssistantContentFromChunk(chunkJson) {
  const firstChoice = chunkJson?.choices?.[0];
  if (!firstChoice) {
    return "";
  }

  const rawContent =
    firstChoice?.delta?.content ??
    firstChoice?.message?.content ??
    firstChoice?.text ??
    "";
  return normalizeModelContent(rawContent);
}

/**
 * 解析 SSE 文本并拼接模型最终输出。
 * 复杂度评估：O(N)，N 为 SSE 原始文本长度。
 * @param {string} rawSseText SSE 原始文本。
 * @returns {string} 拼接后的助手文本。
 */
function parseSseTextContent(rawSseText) {
  if (!rawSseText || typeof rawSseText !== "string") {
    return "";
  }

  const eventBlockList = rawSseText.split(/\r?\n\r?\n/);
  return eventBlockList.map(extractTextFromSseEventBlock).join("");
}

/**
 * 从单个 SSE 事件块提取文本。
 * 复杂度评估：O(L)，L 为事件块长度。
 * @param {string} eventBlock SSE 事件块文本。
 * @returns {string} 当前事件块提取到的文本。
 */
function extractTextFromSseEventBlock(eventBlock) {
  if (!eventBlock) {
    return "";
  }

  const dataLineList = eventBlock
    .split(/\r?\n/)
    .filter((lineItem) => lineItem.startsWith("data:"))
    .map((lineItem) => lineItem.slice(5).trim())
    .filter(Boolean);

  if (dataLineList.length === 0) {
    return "";
  }

  const eventDataText = dataLineList.join("\n").trim();
  if (!eventDataText || eventDataText === "[DONE]") {
    return "";
  }

  try {
    const parsedChunkJson = JSON.parse(eventDataText);
    return extractAssistantContentFromChunk(parsedChunkJson);
  } catch {
    // 关键逻辑：忽略异常事件块，避免单块格式问题导致整次请求失败。
    return "";
  }
}

/**
 * 安全触发流式文本更新回调。
 * @param {(fullText: string, deltaText: string) => void | undefined} onTextUpdate 流式文本回调。
 * @param {string} fullText 当前累计文本。
 * @param {string} deltaText 本次新增文本。
 */
function emitTextUpdate(onTextUpdate, fullText, deltaText) {
  if (typeof onTextUpdate !== "function") {
    return;
  }

  try {
    onTextUpdate(fullText, deltaText);
  } catch {
    // 关键逻辑：UI 回调异常不影响主流程，保证模型请求可完成。
  }
}

/**
 * 使用 Reader 增量读取 SSE，并实时回调文本进度。
 * 关键逻辑：优先走增量读取，提升“边生成边展示”体验；不支持 Reader 时由上层兜底回退。
 * 复杂度评估：O(N)，N 为 SSE 总文本长度。
 * @param {Response} response fetch 响应对象。
 * @param {(fullText: string, deltaText: string) => void | undefined} onTextUpdate 流式文本回调。
 * @returns {Promise<string>} 最终拼接后的完整文本。
 */
async function readAssistantTextFromSseStream(response, onTextUpdate) {
  const reader = response.body?.getReader?.();
  if (!reader) {
    const rawSseText = await response.text();
    const fullText = parseSseTextContent(rawSseText);
    emitTextUpdate(onTextUpdate, fullText, fullText);
    return fullText;
  }

  const textDecoder = new TextDecoder("utf-8");
  let sseBuffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    sseBuffer += textDecoder.decode(value, { stream: true });
    const eventBlockList = sseBuffer.split(/\r?\n\r?\n/);
    sseBuffer = eventBlockList.pop() ?? "";

    eventBlockList.forEach((eventBlock) => {
      const deltaText = extractTextFromSseEventBlock(eventBlock);
      if (!deltaText) {
        return;
      }

      fullText += deltaText;
      emitTextUpdate(onTextUpdate, fullText, deltaText);
    });
  }

  // 关键逻辑：流结束后 flush 解码器尾部缓存，避免 UTF-8 多字节字符被截断。
  sseBuffer += textDecoder.decode();
  const tailEventBlockList = sseBuffer.split(/\r?\n\r?\n/);
  tailEventBlockList.forEach((eventBlock) => {
    const deltaText = extractTextFromSseEventBlock(eventBlock);
    if (!deltaText) {
      return;
    }

    fullText += deltaText;
    emitTextUpdate(onTextUpdate, fullText, deltaText);
  });

  return fullText;
}

/**
 * 读取百炼响应中的助手文本，兼容 JSON 与 SSE 两种返回格式。
 * @param {Response} response fetch 响应对象。
 * @param {(fullText: string, deltaText: string) => void} [onTextUpdate] 流式文本回调。
 * @returns {Promise<string>} 助手文本。
 */
async function readAssistantTextFromResponse(response, onTextUpdate) {
  const responseContentType = String(
    response.headers.get("content-type") ?? "",
  ).toLowerCase();
  const isStreamContent = responseContentType.includes("text/event-stream");

  if (isStreamContent) {
    return readAssistantTextFromSseStream(response, onTextUpdate);
  }

  const responseJson = await response.json();
  const fullText = extractAssistantContentFromChunk(responseJson);
  emitTextUpdate(onTextUpdate, fullText, fullText);
  return fullText;
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
 * 判断文本是否包含任一关键字。
 * @param {string} sourceText 源文本。
 * @param {Array<string>} keywordList 关键字列表。
 * @returns {boolean} 是否命中。
 */
function containsAnyKeyword(sourceText, keywordList) {
  const normalizedText = String(sourceText ?? "").toLowerCase();
  return keywordList.some((keywordItem) => normalizedText.includes(keywordItem));
}

/**
 * 判断错误是否适合切换到备用模型。
 * 关键逻辑：
 * 1. 429 直接允许切换（限流场景）。
 * 2. 403/400/404 仅在命中“额度/模型不可用”关键词时切换。
 * @param {unknown} error 错误对象。
 * @returns {boolean} 是否应切换模型。
 */
function shouldSwitchToNextModel(error) {
  const statusCode = Number(error?.status ?? 0);

  if (statusCode === 429) {
    return true;
  }

  if (![400, 403, 404].includes(statusCode)) {
    return false;
  }

  return containsAnyKeyword(String(error?.message ?? ""), [
    "quota",
    "insufficient",
    "exhausted",
    "forbidden",
    "permission",
    "resource",
    "model",
    "unsupported",
    "not exist",
    "out of",
    "额度",
    "限额",
    "用尽",
    "不足",
    "配额",
    "模型",
    "不可用",
    "不支持",
    "无权限",
  ]);
}

/**
 * 归一化错误输出文本。
 * @param {unknown} error 错误对象。
 * @param {number} timeoutMs 本轮超时（毫秒）。
 * @returns {string} 友好错误文本。
 */
function resolveReadableErrorMessage(error, timeoutMs) {
  if (isTimeoutError(error)) {
    return `百炼接口请求超时（${timeoutMs}ms），请稍后重试`;
  }

  const rawMessage = String(error?.message ?? "").trim();
  return rawMessage || "百炼接口调用失败，请稍后重试";
}

/**
 * 解析本次请求使用的模型候选序列。
 * @param {string | undefined} model 单模型覆盖配置（可选）。
 * @param {Array<string> | undefined} modelCandidates 多模型覆盖配置（可选）。
 * @returns {Array<string>} 归一化模型候选序列。
 */
function resolveRequestModelCandidates(model, modelCandidates) {
  if (Array.isArray(modelCandidates) && modelCandidates.length > 0) {
    const normalizedModelCandidates = dedupeModelList(modelCandidates);
    if (normalizedModelCandidates.length > 0) {
      return normalizedModelCandidates;
    }
  }

  const singleModel = String(model ?? "").trim();
  if (singleModel) {
    return [singleModel];
  }

  return BAILIAN_MODEL_CANDIDATES;
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
 * @param {string} [params.model] 本次请求指定模型（可选）。
 * @param {Array<string>} [params.modelCandidates] 本次请求指定模型候选序列（可选）。
 * @param {number} [params.maxTokens] 本次请求输出 token 上限（可选）。
 * @param {boolean} [params.switchModelOnTimeout=false] 超时时是否自动切换到下一个模型。
 * @param {boolean} [params.enableThinking=false] 是否启用思考模式。
 * @param {boolean} [params.stream=true] 是否启用流式输出。
 * @param {(fullText: string, deltaText: string) => void} [params.onTextUpdate] 流式文本增量回调（可选）。
 * @param {AbortSignal} [params.signal] 外部取消信号（可选）。
 * @returns {Promise<object|null>} 解析后的 JSON；若解析失败返回 null。
 */
export async function requestBailianJson({
  systemPrompt,
  userPrompt,
  timeoutMs = BAILIAN_TIMEOUT_DEFAULT_MS,
  temperature = 0.2,
  retryCount = BAILIAN_RETRY_COUNT_DEFAULT,
  retryDelayMs = BAILIAN_RETRY_DELAY_DEFAULT_MS,
  model,
  modelCandidates,
  maxTokens,
  switchModelOnTimeout = false,
  enableThinking = BAILIAN_ENABLE_THINKING_DEFAULT,
  stream = BAILIAN_STREAM_DEFAULT,
  onTextUpdate,
  signal,
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
  const safeMaxTokens = Math.max(
    0,
    Number.parseInt(String(maxTokens ?? ""), 10) || 0,
  );
  const activeModelCandidates = resolveRequestModelCandidates(model, modelCandidates);

  let lastError = null;

  /**
   * 重试复杂度评估：O(M * R)
   * M 为模型候选数量，R 为每个模型的重试总次数（retryCount + 1）。
   * 默认 M<=3，R=2，总尝试次数常量级。
   */
  for (
    let modelIndex = 0;
    modelIndex < activeModelCandidates.length;
    modelIndex += 1
  ) {
    const activeModelName = activeModelCandidates[modelIndex];
    const hasNextModel = modelIndex < activeModelCandidates.length - 1;
    let switchedByModelStrategy = false;

    for (let attemptIndex = 0; attemptIndex <= safeRetryCount; attemptIndex += 1) {
      if (signal?.aborted) {
        throw new Error("请求已取消");
      }

      // 关键逻辑：每次重试按比例放宽超时，避免首轮边缘超时后仍然过早取消。
      const attemptTimeoutMs =
        attemptIndex === 0
          ? timeoutMs
          : Math.round(timeoutMs * (1 + attemptIndex * 0.55));

      const requestAbortController = new AbortController();
      let removeExternalAbortListener = null;
      if (signal && typeof signal.addEventListener === "function") {
        if (signal.aborted) {
          requestAbortController.abort();
        } else {
          const handleExternalAbort = () => {
            requestAbortController.abort();
          };
          signal.addEventListener("abort", handleExternalAbort, { once: true });
          removeExternalAbortListener = () => {
            signal.removeEventListener("abort", handleExternalAbort);
          };
        }
      }

      const timeoutHandle = setTimeout(
        () => requestAbortController.abort(),
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
            model: activeModelName,
            temperature,
            stream: Boolean(stream),
            enable_thinking: Boolean(enableThinking),
            ...(safeMaxTokens > 0 ? { max_tokens: safeMaxTokens } : {}),
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
          signal: requestAbortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          const requestError = new Error(
            `百炼接口调用失败（HTTP ${response.status}，模型 ${activeModelName}）：${errorText}`,
          );

          // 关键逻辑：将 HTTP 状态与模型信息挂到错误对象，供重试与降级策略判定。
          requestError.status = response.status;
          requestError.model = activeModelName;
          requestError.errorText = errorText;
          throw requestError;
        }

        const textContent = await readAssistantTextFromResponse(response, onTextUpdate);
        return parseJsonFromText(textContent);
      } catch (error) {
        lastError = error;

        if (signal?.aborted) {
          throw new Error("请求已取消");
        }

        // 关键逻辑：额度/模型不可用等场景触发自动切模型，减少 403 直接失败。
        if (hasNextModel && shouldSwitchToNextModel(error)) {
          switchedByModelStrategy = true;
          if (safeRetryDelayMs > 0) {
            await sleep(Math.round(safeRetryDelayMs * 0.5));
          }
          break;
        }

        // 关键逻辑：当主模型响应过慢时，允许自动切换到后备模型以降低总等待时长。
        if (hasNextModel && switchModelOnTimeout && isTimeoutError(error)) {
          switchedByModelStrategy = true;
          if (safeRetryDelayMs > 0) {
            await sleep(Math.round(safeRetryDelayMs * 0.4));
          }
          break;
        }

        const hasNextAttempt = attemptIndex < safeRetryCount;
        if (!hasNextAttempt || !isRetriableError(error)) {
          throw new Error(resolveReadableErrorMessage(error, attemptTimeoutMs));
        }

        await sleep(safeRetryDelayMs * (attemptIndex + 1));
      } finally {
        clearTimeout(timeoutHandle);
        if (typeof removeExternalAbortListener === "function") {
          removeExternalAbortListener();
        }
      }
    }

    if (switchedByModelStrategy) {
      continue;
    }
  }

  const readableLastError = resolveReadableErrorMessage(lastError, timeoutMs);
  throw new Error(
    `百炼模型调用失败（已尝试：${activeModelCandidates.join(" -> ")}）：${readableLastError}`,
  );
}
