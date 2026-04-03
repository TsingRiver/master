/**
 * AI 提示模板脏词模式：
 * 关键逻辑：当模型把字段说明、占位符或示例模板原样回传时，需要统一识别并回退到本地文案。
 */
const AI_PROMPT_PLACEHOLDER_PATTERN_LIST = Object.freeze([
  /\b\d{1,3}\s*[~～-]\s*\d{1,3}\s*字\b/u,
  /(?:一句话|单句)[^，。；]{0,12}人格描述/u,
  /只描述当前测试下的你/u,
  /不写(?:建议|top\s*3(?:比较|对比))/iu,
  /top\s*3(?:比较|对比)/iu,
  /\d{1,2}\s*字以内(?:标题|小标题)/u,
  /^(?:建议|提醒|行动建议|风险信号|标签|要点|回放)\d+$/u,
  /^(?:高亮标题|风险场景名|该场景典型反应|颜色key|颜色名称|关键词|一句古风判词)$/u,
  /^(?:第一段：核心侧写|第二段：矛盾与张力分析|第三段：破局建议)$/u,
  /^你通常会先在心里梳理信息，再用相对稳定的判断框架推进关键决定。?$/u,
  /^你整体给人的感觉更偏稳定清醒，做选择时会沿着一条相对鲜明的内在主线持续推进。?$/u,
  /^当前结果更接近\s*[A-Z]{4}\s*，因为你的作答在四条轴上呈现出相对稳定的偏好重心。?$/u,
  /^当前结果说明你的行为偏好已经有比较稳定的重心，但在边界场景里仍保留一定切换弹性。?$/u,
  /^这些看似相反的特质并不是误差，而是你在不同场景调度心理资源的证据。?$/u,
  /^真正的成长不是抹平张力，而是学会识别何时放大优势、何时收束能量。?$/u,
  /^(?:主线偏好清晰|行为风格稳定|场景切换有弹性)$/u,
  /^(?:把结果放回真实场景复盘|观察压力下的切换规律|把标签转成可执行动作)$/u,
  /^(?:把核心优势放进关键任务持续复用|定期练习次弱维度保持弹性|用真实场景复盘长期主线)$/u,
  /^(?:高压下容易固化路径|节奏差异可能放大误解)$/u,
]);

/**
 * 统一压缩 AI 文案中的空白字符。
 * @param {unknown} value 任意输入值。
 * @returns {string} 压缩后的字符串。
 */
function normalizeAiCopyWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 截断字符串到安全长度。
 * @param {string} text 原始文本。
 * @param {number} maxLength 最大长度。
 * @returns {string} 截断后的文本。
 */
function truncateAiCopyText(text, maxLength) {
  if (!Number.isFinite(maxLength)) {
    return text;
  }

  const safeMaxLength = Math.max(1, Math.floor(maxLength));
  return text.slice(0, safeMaxLength);
}

/**
 * 判断文本是否更像 AI 提示模板占位词，而不是用户可见文案。
 * 复杂度评估：O(P * L)，P 为模式数量，L 为文本长度；当前 P 为固定小常量。
 * @param {unknown} value 任意输入值。
 * @returns {boolean} 是否命中模板占位词。
 */
export function isLikelyAiPromptPlaceholderText(value) {
  const normalizedText = normalizeAiCopyWhitespace(value);
  if (!normalizedText) {
    return false;
  }

  return AI_PROMPT_PLACEHOLDER_PATTERN_LIST.some((patternItem) =>
    patternItem.test(normalizedText),
  );
}

/**
 * 规范化单条 AI 文案：
 * 关键逻辑：命中模板占位词时直接回退，避免把提示词本身展示给用户。
 * @param {object} params 参数对象。
 * @param {unknown} params.text 待清洗文本。
 * @param {string} [params.fallbackText=""] 兜底文本。
 * @param {number} [params.maxLength=Infinity] 最大长度。
 * @returns {string} 安全文案。
 */
export function sanitizeAiCopyText({
  text,
  fallbackText = "",
  maxLength = Number.POSITIVE_INFINITY,
}) {
  const normalizedFallbackText = truncateAiCopyText(
    normalizeAiCopyWhitespace(fallbackText),
    maxLength,
  );
  const normalizedText = normalizeAiCopyWhitespace(text);
  if (!normalizedText || isLikelyAiPromptPlaceholderText(normalizedText)) {
    return normalizedFallbackText;
  }

  return truncateAiCopyText(normalizedText, maxLength);
}

/**
 * 规范化 AI 文案数组。
 * 关键逻辑：只保留有效用户可见文案；若数组整体失效则整体回退，保证 UI 文案完整。
 * @param {object} params 参数对象。
 * @param {unknown} params.textList 待清洗数组。
 * @param {Array<string>} [params.fallbackList=[]] 兜底数组。
 * @param {number} [params.limit=3] 返回条数上限。
 * @param {number} [params.maxItemLength=Infinity] 单项最大长度。
 * @returns {Array<string>} 安全文案数组。
 */
export function sanitizeAiCopyList({
  textList,
  fallbackList = [],
  limit = 3,
  maxItemLength = Number.POSITIVE_INFINITY,
}) {
  const safeLimit = Math.max(1, Math.floor(limit));
  const normalizedFallbackList = Array.isArray(fallbackList)
    ? fallbackList
        .map((item) =>
          sanitizeAiCopyText({
            text: item,
            fallbackText: "",
            maxLength: maxItemLength,
          }),
        )
        .filter(Boolean)
        .slice(0, safeLimit)
    : [];

  if (!Array.isArray(textList)) {
    return normalizedFallbackList;
  }

  const normalizedTextList = textList
    .map((item) =>
      sanitizeAiCopyText({
        text: item,
        fallbackText: "",
        maxLength: maxItemLength,
      }),
    )
    .filter(Boolean)
    .slice(0, safeLimit);

  return normalizedTextList.length > 0 ? normalizedTextList : normalizedFallbackList;
}
