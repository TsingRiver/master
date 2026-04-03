/**
 * 统一 AI 提供方配置：
 * 1. 通过 `VITE_AI_PROVIDER` 选择当前生效的提供方。
 * 2. 保留既有 `VITE_BAILIAN_*` 配置，避免影响现有 Qwen/百炼接入。
 * 3. 为 GLM 增加独立配置块，保证切换回 Qwen 时无需改业务代码。
 */
const DEFAULT_AI_PROVIDER = "qwen";
const ACTIVE_AI_PROVIDER_KEY = normalizeProviderKey(
  import.meta.env.VITE_AI_PROVIDER ?? DEFAULT_AI_PROVIDER,
);

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
 * 归一化 AI 提供方标识：
 * 兼容历史/别名写法，降低配置切换时的误配风险。
 * @param {unknown} rawProviderKey 原始提供方标识。
 * @returns {string} 归一化后的提供方标识。
 */
function normalizeProviderKey(rawProviderKey) {
  const normalizedProviderKey = String(rawProviderKey ?? "")
    .trim()
    .toLowerCase();

  if (!normalizedProviderKey) {
    return DEFAULT_AI_PROVIDER;
  }

  if (["qwen", "bailian", "dashscope", "aliyun", "tongyi"].includes(normalizedProviderKey)) {
    return "qwen";
  }

  if (["glm", "zhipu", "bigmodel"].includes(normalizedProviderKey)) {
    return "glm";
  }

  return normalizedProviderKey;
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
 * 全局超时与重试配置：
 * 1. 可通过环境变量覆盖。
 * 2. 用于提升移动网络和高峰期接口稳定性。
 */
const AI_TIMEOUT_DEFAULT_MS = parsePositiveInteger(
  import.meta.env.VITE_AI_TIMEOUT_MS ?? import.meta.env.VITE_BAILIAN_TIMEOUT_MS,
  26000,
);
const AI_RETRY_COUNT_DEFAULT = parsePositiveInteger(
  import.meta.env.VITE_AI_RETRY_COUNT ?? import.meta.env.VITE_BAILIAN_RETRY_COUNT,
  1,
);
const AI_RETRY_DELAY_DEFAULT_MS = parsePositiveInteger(
  import.meta.env.VITE_AI_RETRY_DELAY_MS ??
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
 * AI 提供方配置字典：
 * 1. `qwen` 继续复用既有百炼环境变量，保证历史配置零迁移。
 * 2. `glm` 使用智谱 OpenAI 兼容接口，支持独立模型与 API Key。
 */
const AI_PROVIDER_CONFIG_MAP = Object.freeze({
  qwen: {
    providerKey: "qwen",
    displayName: "Qwen（阿里百炼）",
    endpoint:
      import.meta.env.VITE_BAILIAN_ENDPOINT ??
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    apiKey: import.meta.env.VITE_BAILIAN_API_KEY ?? "",
    apiKeyEnvName: "VITE_BAILIAN_API_KEY",
    model: import.meta.env.VITE_BAILIAN_MODEL ?? "qwen3.5-plus-2026-02-15",
    modelFallbacks: import.meta.env.VITE_BAILIAN_MODEL_FALLBACKS ?? "",
    modelPriority: import.meta.env.VITE_BAILIAN_MODEL_PRIORITY ?? "",
    enableThinkingDefault: parseBooleanValue(
      import.meta.env.VITE_BAILIAN_ENABLE_THINKING ??
        import.meta.env.VITE_AI_ENABLE_THINKING,
      false,
    ),
    streamDefault: parseBooleanValue(
      import.meta.env.VITE_BAILIAN_STREAM ?? import.meta.env.VITE_AI_STREAM,
      true,
    ),
    defaultFallbackModels: ["qwen3.5-plus", "qwen-turbo"],
    /**
     * 构建 Qwen/百炼专属请求扩展字段。
     * @param {boolean} enableThinking 是否启用思考模式。
     * @returns {object} 请求扩展字段。
     */
    buildExtraRequestBody(enableThinking) {
      return {
        enable_thinking: Boolean(enableThinking),
      };
    },
  },
  glm: {
    providerKey: "glm",
    displayName: "GLM（智谱 AI）",
    endpoint:
      import.meta.env.VITE_GLM_ENDPOINT ??
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    apiKey: import.meta.env.VITE_GLM_API_KEY ?? "",
    apiKeyEnvName: "VITE_GLM_API_KEY",
    model: import.meta.env.VITE_GLM_MODEL ?? "glm-4.5-air",
    modelFallbacks: import.meta.env.VITE_GLM_MODEL_FALLBACKS ?? "",
    modelPriority: import.meta.env.VITE_GLM_MODEL_PRIORITY ?? "",
    enableThinkingDefault: parseBooleanValue(
      import.meta.env.VITE_GLM_ENABLE_THINKING ??
        import.meta.env.VITE_AI_ENABLE_THINKING,
      false,
    ),
    streamDefault: parseBooleanValue(
      import.meta.env.VITE_GLM_STREAM ?? import.meta.env.VITE_AI_STREAM,
      true,
    ),
    defaultFallbackModels: [],
    /**
     * 构建 GLM 专属请求扩展字段。
     * 关键逻辑：GLM OpenAI 兼容接口使用 `thinking.type` 控制思考模式。
     * @param {boolean} enableThinking 是否启用思考模式。
     * @returns {object} 请求扩展字段。
     */
    buildExtraRequestBody(enableThinking) {
      return {
        thinking: {
          type: Boolean(enableThinking) ? "enabled" : "disabled",
        },
      };
    },
  },
});

/**
 * 解析当前生效的 AI 提供方配置。
 * @returns {object | null} 提供方配置；若配置不支持则返回 null。
 */
function resolveActiveProviderConfig() {
  return AI_PROVIDER_CONFIG_MAP[ACTIVE_AI_PROVIDER_KEY] ?? null;
}

/**
 * 判断 API Key 是否仍为占位值。
 * @param {string} apiKey 已归一化的 API Key。
 * @returns {boolean} 是否为占位值。
 */
function isPlaceholderApiKey(apiKey) {
  return (
    apiKey === "your_api_key" ||
    apiKey === "your_bailian_api_key" ||
    apiKey === "your_glm_api_key" ||
    apiKey.toLowerCase().includes("your_api_key") ||
    apiKey.toLowerCase().includes("your_bailian_api_key") ||
    apiKey.toLowerCase().includes("your_glm_api_key")
  );
}

/**
 * 校验提供方是否具备可执行条件。
 * 关键逻辑：Provider 级兜底场景下，这里返回字符串而不是直接抛错，
 * 便于 GLM 不可用时继续回退到 Qwen。
 * @param {object | null} providerConfig 当前提供方配置。
 * @returns {string} 空字符串表示可执行；非空表示不可执行原因。
 */
function resolveProviderValidationError(providerConfig) {
  if (!providerConfig) {
    return `VITE_AI_PROVIDER=${ACTIVE_AI_PROVIDER_KEY} 不受支持，请改为 qwen 或 glm`;
  }

  const activeApiKey = String(providerConfig.apiKey ?? "").trim();
  if (!activeApiKey) {
    return `缺少 ${providerConfig.apiKeyEnvName}，无法调用 ${providerConfig.displayName} 接口`;
  }

  if (isPlaceholderApiKey(activeApiKey)) {
    return `${providerConfig.apiKeyEnvName} 仍是占位值，请在 .env 中替换为真实 ${providerConfig.displayName} API Key`;
  }

  return "";
}

/**
 * 构建全局模型候选序列：
 * 1. `MODEL_PRIORITY`（完整优先级）优先级最高。
 * 2. 若未配置，则使用 `主模型 + 备用模型列表`。
 * 3. 最后补默认降级模型，避免单模型不可用时直接失败。
 * @param {object | null} providerConfig 当前提供方配置。
 * @returns {Array<string>} 全局模型候选序列。
 */
function resolveGlobalModelCandidates(providerConfig) {
  if (!providerConfig) {
    return [];
  }

  const priorityModels = dedupeModelList(
    parseModelList(providerConfig.modelPriority),
  );
  if (priorityModels.length > 0) {
    return priorityModels;
  }

  const fallbackModels = dedupeModelList(
    parseModelList(providerConfig.modelFallbacks),
  );
  return dedupeModelList([
    providerConfig.model,
    ...fallbackModels,
    ...(providerConfig.defaultFallbackModels ?? []),
  ]);
}

/**
 * 构建提供方执行计划。
 * 关键逻辑：
 * 1. 默认只执行当前 provider。
 * 2. 当当前 provider 为 GLM 时，自动追加 Qwen 作为兜底 provider。
 * 3. Qwen 兜底阶段禁用请求级模型覆盖，强制按 `VITE_BAILIAN_MODEL -> VITE_BAILIAN_MODEL_FALLBACKS` 规则尝试。
 * @param {object | null} activeProviderConfig 当前主提供方配置。
 * @returns {Array<object>} 提供方执行计划。
 */
function resolveProviderExecutionPlan(activeProviderConfig) {
  if (!activeProviderConfig) {
    return [];
  }

  const providerExecutionPlan = [
    {
      providerConfig: activeProviderConfig,
      allowRequestModelOverride: true,
      forceAdvanceToNextModelOnFailure: false,
    },
  ];

  if (activeProviderConfig.providerKey === "glm") {
    providerExecutionPlan.push({
      providerConfig: AI_PROVIDER_CONFIG_MAP.qwen ?? null,
      allowRequestModelOverride: false,
      forceAdvanceToNextModelOnFailure: true,
    });
  }

  return providerExecutionPlan.filter((planItem) => Boolean(planItem.providerConfig));
}

/**
 * 当前会话的主提供方与执行计划。
 */
const ACTIVE_PROVIDER_CONFIG = resolveActiveProviderConfig();
const ACTIVE_PROVIDER_EXECUTION_PLAN =
  resolveProviderExecutionPlan(ACTIVE_PROVIDER_CONFIG);

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
 * 读取 AI 提供方响应中的助手文本，兼容 JSON 与 SSE 两种返回格式。
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
 * @param {object | null} providerConfig 当前提供方配置。
 * @returns {string} 友好错误文本。
 */
function resolveReadableErrorMessage(error, timeoutMs, providerConfig) {
  const providerDisplayName = providerConfig?.displayName ?? "AI";

  if (isTimeoutError(error)) {
    return `${providerDisplayName} 接口请求超时（${timeoutMs}ms），请稍后重试`;
  }

  const rawMessage = String(error?.message ?? "").trim();
  return rawMessage || `${providerDisplayName} 接口调用失败，请稍后重试`;
}

/**
 * 解析本次请求使用的模型候选序列。
 * @param {string | undefined} model 单模型覆盖配置（可选）。
 * @param {Array<string> | undefined} modelCandidates 多模型覆盖配置（可选）。
 * @param {Array<string>} defaultModelCandidates 当前提供方的默认模型候选序列。
 * @returns {Array<string>} 归一化模型候选序列。
 */
function resolveRequestModelCandidates(
  model,
  modelCandidates,
  defaultModelCandidates,
) {
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

  return defaultModelCandidates;
}

/**
 * 构建聊天补全请求体。
 * @param {object} params 请求参数。
 * @param {object} params.providerConfig 当前提供方配置。
 * @param {string} params.activeModelName 当前模型名。
 * @param {string} params.systemPrompt 系统提示词。
 * @param {string} params.userPrompt 用户提示词。
 * @param {number} params.temperature 采样温度。
 * @param {boolean} params.stream 是否启用流式输出。
 * @param {number} params.safeMaxTokens 输出 token 上限。
 * @param {boolean} params.enableThinking 是否启用思考模式。
 * @returns {object} 标准化后的请求体。
 */
function buildChatCompletionRequestBody({
  providerConfig,
  activeModelName,
  systemPrompt,
  userPrompt,
  temperature,
  stream,
  safeMaxTokens,
  enableThinking,
}) {
  return {
    model: activeModelName,
    temperature,
    stream: Boolean(stream),
    ...(safeMaxTokens > 0 ? { max_tokens: safeMaxTokens } : {}),
    ...(typeof providerConfig?.buildExtraRequestBody === "function"
      ? providerConfig.buildExtraRequestBody(enableThinking)
      : {}),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
}

/**
 * AI chat/completions 通用请求。
 * 关键逻辑：为兼容既有业务调用，继续保留 `requestBailianJson` 导出名。
 * Provider 兜底规则：
 * 1. 默认仅调用当前 `VITE_AI_PROVIDER`。
 * 2. 当 `VITE_AI_PROVIDER=glm` 时，GLM 失败后会自动回退到 Qwen。
 * 3. Qwen 兜底阶段优先使用 `VITE_BAILIAN_MODEL`，失败后再按 `VITE_BAILIAN_MODEL_FALLBACKS` 顺序降级。
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
  timeoutMs = AI_TIMEOUT_DEFAULT_MS,
  temperature = 0.2,
  retryCount = AI_RETRY_COUNT_DEFAULT,
  retryDelayMs = AI_RETRY_DELAY_DEFAULT_MS,
  model,
  modelCandidates,
  maxTokens,
  switchModelOnTimeout = false,
  enableThinking = ACTIVE_PROVIDER_CONFIG?.enableThinkingDefault ?? false,
  stream = ACTIVE_PROVIDER_CONFIG?.streamDefault ?? true,
  onTextUpdate,
  signal,
}) {
  if (!ACTIVE_PROVIDER_CONFIG) {
    throw new Error(
      `VITE_AI_PROVIDER=${ACTIVE_AI_PROVIDER_KEY} 不受支持，请改为 qwen 或 glm`,
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
  const providerFailureMessageList = [];

  /**
   * 总复杂度评估：O(P * M * R)
   * P 为 provider 数量，M 为每个 provider 的模型候选数，R 为单模型重试次数（retryCount + 1）。
   * 当前仅支持 glm -> qwen 双 provider 兜底，默认 P<=2，属于可控常量级扩展。
   */
  for (
    let providerIndex = 0;
    providerIndex < ACTIVE_PROVIDER_EXECUTION_PLAN.length;
    providerIndex += 1
  ) {
    const providerExecutionItem = ACTIVE_PROVIDER_EXECUTION_PLAN[providerIndex];
    const activeProviderConfig = providerExecutionItem.providerConfig;
    const activeProviderDisplayName = activeProviderConfig.displayName;
    const providerValidationError = resolveProviderValidationError(
      activeProviderConfig,
    );

    if (providerValidationError) {
      providerFailureMessageList.push(
        `${activeProviderDisplayName} 未执行：${providerValidationError}`,
      );
      continue;
    }

    const activeApiKey = String(activeProviderConfig.apiKey ?? "").trim();
    const activeModelCandidates = resolveRequestModelCandidates(
      providerExecutionItem.allowRequestModelOverride ? model : undefined,
      providerExecutionItem.allowRequestModelOverride
        ? modelCandidates
        : undefined,
      resolveGlobalModelCandidates(activeProviderConfig),
    );
    let providerLastError = null;

    for (
      let modelIndex = 0;
      modelIndex < activeModelCandidates.length;
      modelIndex += 1
    ) {
      const activeModelName = activeModelCandidates[modelIndex];
      const hasNextModel = modelIndex < activeModelCandidates.length - 1;
      let switchedByModelStrategy = false;
      let stopCurrentProviderStrategy = false;

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
          const response = await fetch(activeProviderConfig.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeApiKey}`,
            },
            body: JSON.stringify(
              buildChatCompletionRequestBody({
                providerConfig: activeProviderConfig,
                activeModelName,
                systemPrompt,
                userPrompt,
                temperature,
                stream,
                safeMaxTokens,
                enableThinking,
              }),
            ),
            signal: requestAbortController.signal,
          });

          if (!response.ok) {
            const errorText = await response.text();
            const requestError = new Error(
              `${activeProviderDisplayName} 接口调用失败（HTTP ${response.status}，模型 ${activeModelName}）：${errorText}`,
            );

            // 关键逻辑：将 HTTP 状态与模型信息挂到错误对象，供重试与降级策略判定。
            requestError.status = response.status;
            requestError.model = activeModelName;
            requestError.errorText = errorText;
            throw requestError;
          }

          const textContent = await readAssistantTextFromResponse(
            response,
            onTextUpdate,
          );
          return parseJsonFromText(textContent);
        } catch (error) {
          providerLastError = error;

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

          // 关键逻辑：Qwen 兜底阶段按模型序列强制降级，确保先试主模型，再试 fallback 列表。
          if (
            hasNextModel &&
            providerExecutionItem.forceAdvanceToNextModelOnFailure
          ) {
            switchedByModelStrategy = true;
            if (safeRetryDelayMs > 0) {
              await sleep(Math.round(safeRetryDelayMs * 0.35));
            }
            break;
          }

          const hasNextAttempt = attemptIndex < safeRetryCount;
          if (hasNextAttempt && isRetriableError(error)) {
            await sleep(safeRetryDelayMs * (attemptIndex + 1));
            continue;
          }

          // 关键逻辑：主 provider 在当前模型最终失败后，结束本 provider，
          // 由外层 provider 兜底链决定是否切换到下一个 provider。
          stopCurrentProviderStrategy = true;
          break;
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

      if (stopCurrentProviderStrategy) {
        break;
      }
    }

    const readableLastError = resolveReadableErrorMessage(
      providerLastError,
      timeoutMs,
      activeProviderConfig,
    );
    providerFailureMessageList.push(
      `${activeProviderDisplayName}（已尝试：${activeModelCandidates.join(" -> ")}）：${readableLastError}`,
    );
  }

  throw new Error(
    `AI 模型调用失败：${providerFailureMessageList.join("；随后回退到下一个 provider 仍失败：")}`,
  );
}
