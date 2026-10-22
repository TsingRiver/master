/**
 * 前端 AI 代理客户端：
 * 1. 所有 AI 提供方密钥（API Key）、接口地址（BaseURL/Endpoint）与模型白名单均已迁移至后端服务（`asking-license-server`）。
 * 2. 前端仅通过 `/api/ai/analyze` 调用后端接口，彻底避免在前端打包产物中暴露任何密钥。
 * 3. 保留 `requestBailianJson` 导出函数签名及 SSE 流式解析能力，确保全部业务分析模块零改动无缝衔接。
 */

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
 * 全局超时与重试默认配置（仅用于控制前端到后端接口的超时与配置透传）。
 */
const AI_TIMEOUT_DEFAULT_MS = parsePositiveInteger(
  import.meta.env.VITE_AI_TIMEOUT_MS,
  26000,
);
const AI_RETRY_COUNT_DEFAULT = parsePositiveInteger(
  import.meta.env.VITE_AI_RETRY_COUNT,
  1,
);
const AI_RETRY_DELAY_DEFAULT_MS = parsePositiveInteger(
  import.meta.env.VITE_AI_RETRY_DELAY_MS,
  650,
);
const AI_ENABLE_THINKING_DEFAULT = parseBooleanValue(
  import.meta.env.VITE_AI_ENABLE_THINKING,
  false,
);
const AI_STREAM_DEFAULT = parseBooleanValue(
  import.meta.env.VITE_AI_STREAM,
  true,
);

/**
 * 规范化基础服务地址（去除末尾斜杠）。
 * @param {unknown} rawBaseUrl 原始环境变量值。
 * @returns {string} 规范化后的基础地址。
 */
function normalizeApiBaseUrl(rawBaseUrl) {
  return String(rawBaseUrl ?? "").trim().replace(/\/+$/, "");
}

/**
 * 解析后端 AI 分析接口地址。
 * 关键逻辑：
 * 1. 默认返回相对路径 `/api/ai/analyze`，复用 Vite 本地代理、Vercel Rewrite 或 1Panel/Nginx 同源反代。
 * 2. 如需指定独立后端域名，可通过 `VITE_AI_API_BASE_URL` 或 `VITE_LICENSE_API_BASE_URL` 配置。
 * @returns {string} 后端 AI 接口完整请求路径。
 */
function resolveAiBackendEndpoint() {
  const baseUrl = normalizeApiBaseUrl(
    import.meta.env.VITE_AI_API_BASE_URL ??
      import.meta.env.VITE_LICENSE_API_BASE_URL ??
      "",
  );
  return `${baseUrl}/api/ai/analyze`;
}

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
 * 读取后端 AI 响应中的助手文本，兼容 JSON 与 SSE 两种返回格式。
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
 * 通过后端接口发起 AI 分析请求并解析返回的 JSON。
 * 关键逻辑：
 * 1. 保持 `requestBailianJson` 导出名与入参结构不变，兼容全部现有业务调用方。
 * 2. 密钥认证、模型白名单校验、失败重试与多提供方降级（GLM -> Qwen）统一由后端 `/api/ai/analyze` 完成。
 * @param {object} params 请求参数对象。
 * @param {string} params.systemPrompt 系统提示词。
 * @param {string} params.userPrompt 用户提示词。
 * @param {number} [params.timeoutMs=26000] 超时时间（毫秒）。
 * @param {number} [params.temperature=0.2] 采样温度。
 * @param {number} [params.retryCount=1] 超时/网络抖动时后端重试次数。
 * @param {number} [params.retryDelayMs=650] 每次重试前等待时长（毫秒）。
 * @param {string} [params.model] 本次请求指定模型（可选，受后端白名单约束）。
 * @param {Array<string>} [params.modelCandidates] 本次请求指定模型候选序列（可选，受后端白名单约束）。
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
  timeoutMs = AI_TIMEOUT_DEFAULT_MS,
  temperature = 0.2,
  retryCount = AI_RETRY_COUNT_DEFAULT,
  retryDelayMs = AI_RETRY_DELAY_DEFAULT_MS,
  model,
  modelCandidates,
  maxTokens,
  switchModelOnTimeout = false,
  enableThinking = AI_ENABLE_THINKING_DEFAULT,
  stream = AI_STREAM_DEFAULT,
  onTextUpdate,
  signal,
}) {
  if (signal?.aborted) {
    throw new Error("请求已取消");
  }

  const safeTimeoutMs = Math.max(
    3000,
    Number.parseInt(String(timeoutMs ?? ""), 10) || AI_TIMEOUT_DEFAULT_MS,
  );
  const safeRetryCount = Math.max(
    0,
    Number.parseInt(String(retryCount ?? ""), 10) || 0,
  );
  // 关键逻辑：前端总超时预留后端多模型切换与重试缓冲时间，防止后端正在降级重试时前端提前断开。
  const clientTotalTimeoutMs = Math.round(
    safeTimeoutMs * (1 + Math.min(safeRetryCount, 2) * 0.6) + 4000,
  );

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
    clientTotalTimeoutMs,
  );

  try {
    const response = await fetch(resolveAiBackendEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        timeoutMs: safeTimeoutMs,
        temperature,
        retryCount: safeRetryCount,
        retryDelayMs,
        model,
        modelCandidates,
        maxTokens,
        switchModelOnTimeout: Boolean(switchModelOnTimeout),
        enableThinking: Boolean(enableThinking),
        stream: Boolean(stream),
      }),
      signal: requestAbortController.signal,
    });

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorJson = await response.json();
        errorDetail = String(errorJson?.message ?? errorJson?.code ?? "").trim();
      } catch {
        errorDetail = (await response.text()).trim();
      }

      throw new Error(
        errorDetail || `AI 分析接口调用失败（HTTP ${response.status}）`,
      );
    }

    const textContent = await readAssistantTextFromResponse(
      response,
      onTextUpdate,
    );
    return parseJsonFromText(textContent);
  } catch (error) {
    if (signal?.aborted) {
      throw new Error("请求已取消");
    }

    if (isTimeoutError(error)) {
      throw new Error(`AI 接口请求超时（${safeTimeoutMs}ms），请稍后重试`);
    }

    throw error instanceof Error
      ? error
      : new Error(String(error ?? "AI 接口调用失败，请稍后重试"));
  } finally {
    clearTimeout(timeoutHandle);
    if (typeof removeExternalAbortListener === "function") {
      removeExternalAbortListener();
    }
  }
}
