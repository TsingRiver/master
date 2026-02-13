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
 * 百炼 chat/completions 通用请求。
 * @param {object} params 请求参数对象。
 * @param {string} params.systemPrompt 系统提示词。
 * @param {string} params.userPrompt 用户提示词。
 * @param {number} [params.timeoutMs=18000] 超时时间（毫秒）。
 * @param {number} [params.temperature=0.2] 采样温度。
 * @returns {Promise<object|null>} 解析后的 JSON；若解析失败返回 null。
 */
export async function requestBailianJson({
  systemPrompt,
  userPrompt,
  timeoutMs = 18000,
  temperature = 0.2,
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

  const timeoutController = new AbortController();
  const timeoutHandle = setTimeout(() => timeoutController.abort(), timeoutMs);

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
      throw new Error(
        `百炼接口调用失败（HTTP ${response.status}）：${errorText}`,
      );
    }

    const responseJson = await response.json();
    const rawContent = responseJson?.choices?.[0]?.message?.content ?? "";
    const textContent =
      typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
    return parseJsonFromText(textContent);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
