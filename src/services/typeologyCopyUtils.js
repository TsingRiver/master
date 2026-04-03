import { sanitizeAiCopyText } from "./aiCopySanitizer.js";

/**
 * 去除句尾标点，便于拼接更自然的兜底文案。
 * @param {unknown} value 任意值。
 * @returns {string} 清洗后的文本。
 */
export function stripTrailingPunctuation(value) {
  return String(value ?? "")
    .trim()
    .replace(/[。！？!?；;，,]+$/g, "");
}

/**
 * 规范化 AI 短摘要文本。
 * 关键逻辑：主结果摘要只做脏词与空值清洗，不再对 AI 返回内容做长度截断，避免用户可见文案被硬裁剪。
 * @param {unknown} value 任意值。
 * @returns {string} 规范化后的短摘要。
 */
export function normalizeTypeologyShortSummary(value) {
  const normalizedText = sanitizeAiCopyText({
    text: value,
    fallbackText: "",
  });
  if (!normalizedText) {
    return "";
  }

  return normalizedText;
}

/**
 * 将特质列表拼成适合自然语言展示的短语。
 * @param {Array<string>} traitList 特质列表。
 * @returns {string} 中文并列短语。
 */
function joinTypeologyTraitPhrase(traitList) {
  const normalizedTraitList = normalizeTypeologyTextList(traitList, 3);
  if (normalizedTraitList.length === 0) {
    return "";
  }

  if (normalizedTraitList.length === 1) {
    return normalizedTraitList[0];
  }

  if (normalizedTraitList.length === 2) {
    return `${normalizedTraitList[0]}和${normalizedTraitList[1]}`;
  }

  return `${normalizedTraitList[0]}、${normalizedTraitList[1]}和${normalizedTraitList[2]}`;
}

/**
 * 提取带前缀的标签值。
 * @param {Array<string>} tagList 标签列表。
 * @param {string} prefix 标签前缀。
 * @returns {string} 去前缀后的值。
 */
function extractTaggedTraitValue(tagList, prefix) {
  const matchedTag = normalizeTypeologyTextList(tagList, 6).find((tagItem) =>
    String(tagItem ?? "").startsWith(prefix),
  );
  if (!matchedTag) {
    return "";
  }

  return String(matchedTag.slice(prefix.length)).trim();
}

/**
 * 判断是否为九型人格结果标签组。
 * @param {Array<string>} tagList 标签列表。
 * @returns {boolean} 是否为九型人格标签。
 */
function isEnneagramTraitTagList(tagList) {
  const normalizedTagList = normalizeTypeologyTextList(tagList, 6);
  return (
    normalizedTagList.some((tagItem) => tagItem.startsWith("主型：")) &&
    normalizedTagList.some((tagItem) => tagItem.startsWith("侧翼：")) &&
    normalizedTagList.some((tagItem) => tagItem.startsWith("本能："))
  );
}

/**
 * 构建通用类型学主卡摘要。
 * 关键逻辑：结果摘要统一输出一条人格描述句，不再承担建议、Top3 比较或方法论说明。
 * @param {object} params 参数对象。
 * @param {object} params.mainResult 主结果。
 * @param {Map<string, object>|null} [params.outcomeMetaMap=null] 结果元信息索引。
 * @param {object|null} [params.dualHighProfile=null] 双高配置。
 * @returns {string} 约 100 字的人格描述。
 */
export function buildTypeologyPersonalitySummary({
  mainResult,
  outcomeMetaMap = null,
  dualHighProfile = null,
}) {
  if (dualHighProfile?.isDualHigh) {
    return "你是一个同时保留两套高频特质的人，在不同任务、关系和表达场景里会灵活切换风格，但长期仍会围绕更稳定的价值偏好、判断方式与行为节奏来展开自己。";
  }

  const outcomeContext = resolveTypeologyOutcomeContext({
    outcome: mainResult,
    outcomeMetaMap,
    fallbackText: "当前风格",
  });
  const traitPhrase = joinTypeologyTraitPhrase(
    outcomeContext.tags.length > 0 ? outcomeContext.tags : mainResult?.tags,
  );
  const summaryLead = stripTrailingPunctuation(outcomeContext.summary || mainResult?.summary);
  const labelText = String(outcomeContext.displayLabel ?? "当前风格").trim();
  const normalizedTagList =
    outcomeContext.tags.length > 0 ? outcomeContext.tags : normalizeTypeologyTextList(mainResult?.tags, 6);

  if (isEnneagramTraitTagList(normalizedTagList)) {
    const coreTrait = extractTaggedTraitValue(normalizedTagList, "主型：");
    const wingTrait = extractTaggedTraitValue(normalizedTagList, "侧翼：");
    const tritypeTrait = extractTaggedTraitValue(normalizedTagList, "三型：");
    const instinctTrait = extractTaggedTraitValue(normalizedTagList, "本能：");

    return normalizeTypeologyShortSummary(
      `你是一个核心动机很鲜明的人，内在更接近${coreTrait || "当前主型"}这一路径，平时会带着${wingTrait || "侧翼特征"}的处理方式去应对关系和压力，并常通过${tritypeTrait || "三型组合"}来平衡表达与行动，本能上则更偏${instinctTrait || "当前本能堆叠"}。`,
    );
  }

  return normalizeTypeologyShortSummary(
    [
      `你整体给人的感觉更偏${labelText}`,
      traitPhrase ? `通常会表现出${traitPhrase}这组特质` : "通常会表现出比较稳定而鲜明的个人风格",
      `在做选择、处理问题、与人相处和面对变化时，也会自然沿着${summaryLead || "这条稳定的性格主线"}去表达自己`,
    ].join("，") + "。",
  );
}

const MBTI_DIMENSION_SUMMARY_MAP = Object.freeze({
  E: "更愿意边说边想，也常主动接话",
  I: "更习惯先想清楚，再慢慢开口",
  S: "会先看眼前细节和现实情况",
  N: "会先抓趋势、感觉和可能性",
  T: "更常按道理和判断标准来定",
  F: "更会顾及感受和彼此关系",
  J: "喜欢先定安排，不爱临时改动",
  P: "会留些余地，边做边再调整",
});

/**
 * 构建 MBTI 主卡摘要。
 * 关键逻辑：MBTI 摘要聚焦“你通常如何思考、判断和行动”，保持单句人格描述风格。
 * @param {object} params 参数对象。
 * @param {string} params.typeCode MBTI 类型码。
 * @param {string} params.typeTitle MBTI 中文标题。
 * @returns {string} 约 60~80 字的人格描述。
 */
export function buildMbtiPersonalitySummary({ typeCode, typeTitle }) {
  const normalizedTypeCode = String(typeCode ?? "").trim().toUpperCase();
  const normalizedTypeTitle = String((typeTitle ?? normalizedTypeCode) || "当前类型").trim();
  const [energyLetter = "I", perceptionLetter = "N", decisionLetter = "T", lifestyleLetter = "J"] =
    normalizedTypeCode.split("");

  return normalizeTypeologyShortSummary(
    `你给人的感觉更像${normalizedTypeTitle}型，平时${MBTI_DIMENSION_SUMMARY_MAP[energyLetter] ?? "有自己稳定的表达节奏"}；看事情时${MBTI_DIMENSION_SUMMARY_MAP[perceptionLetter] ?? "会先形成自己的观察框架"}，拿主意时${MBTI_DIMENSION_SUMMARY_MAP[decisionLetter] ?? "会按自己的判断来定"}，做事也${MBTI_DIMENSION_SUMMARY_MAP[lifestyleLetter] ?? "会按照适合自己的节奏推进事情"}。`,
  );
}

/**
 * 规范化文本数组。
 * @param {unknown} value 任意值。
 * @param {number} [limit=3] 输出上限。
 * @returns {Array<string>} 清洗后的文本数组。
 */
export function normalizeTypeologyTextList(value, limit = 3) {
  const safeLimit = Math.max(1, Math.floor(limit));
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => stripTrailingPunctuation(item))
    .filter(Boolean)
    .slice(0, safeLimit);
}

/**
 * 从摘要中提取适合做标题的短标签。
 * 关键逻辑：像“均衡高分型，适应场景较广”这类摘要，标题应优先使用前半段短语。
 * @param {unknown} summaryText 原始摘要。
 * @returns {string} 适合标题展示的短标签。
 */
function extractTypeologySummaryLead(summaryText) {
  const normalizedSummary = stripTrailingPunctuation(summaryText);
  if (!normalizedSummary) {
    return "";
  }

  const summaryLead = normalizedSummary.split(/[，、；;：:]/)[0] ?? "";
  return String(summaryLead ?? "").trim() || normalizedSummary;
}

/**
 * 判断结果标签是否更像内部编码，而不是适合直接给用户阅读的名称。
 * 关键逻辑：像 `SCOEI`、`--C-I` 这类纯英文大写短码不应直接作为摘要主语。
 * 复杂度评估：O(L)，L 为标签长度。
 * @param {unknown} rawLabel 原始标签。
 * @returns {boolean} 是否为编码型标签。
 */
export function isTypeologyCodeLikeLabel(rawLabel) {
  const normalizedLabel = String(rawLabel ?? "").trim();
  if (!normalizedLabel) {
    return false;
  }

  if (/[\u3400-\u9fff]/u.test(normalizedLabel)) {
    return false;
  }

  return /^[A-Z0-9-]{3,12}$/.test(normalizedLabel);
}

/**
 * 构建结果元信息索引。
 * 关键逻辑：摘要文案和缓存修复都需要通过 key 反查 summary / tags，避免只拿到编码标签。
 * 复杂度评估：O(N)，N 为输入结果总数。
 * @param {...(Array<object>|Map<string, object>|null|undefined)} sourceList 数据源列表。
 * @returns {Map<string, { key: string, label: string, summary: string, tags: Array<string> }>} 结果元信息索引。
 */
export function buildTypeologyOutcomeMetaMap(...sourceList) {
  const outcomeMetaMap = new Map();

  /**
   * 将单条结果写入索引。
   * @param {object} outcomeItem 结果项。
   */
  const registerOutcomeMeta = (outcomeItem) => {
    const normalizedKey = String(outcomeItem?.key ?? "").trim();
    if (!normalizedKey || outcomeMetaMap.has(normalizedKey)) {
      return;
    }

    outcomeMetaMap.set(normalizedKey, {
      key: normalizedKey,
      label: String(outcomeItem?.label ?? "").trim(),
      summary: stripTrailingPunctuation(outcomeItem?.summary),
      tags: normalizeTypeologyTextList(outcomeItem?.tags, 6),
    });
  };

  sourceList.forEach((sourceItem) => {
    if (Array.isArray(sourceItem)) {
      sourceItem.forEach((outcomeItem) => registerOutcomeMeta(outcomeItem));
      return;
    }

    if (sourceItem instanceof Map) {
      sourceItem.forEach((outcomeItem, outcomeKey) => {
        registerOutcomeMeta({
          key: outcomeKey,
          ...outcomeItem,
        });
      });
    }
  });

  return outcomeMetaMap;
}

/**
 * 解析适合展示在文案里的结果名称。
 * 关键逻辑：若标签是编码型短码，则优先回退到摘要或标签关键词，必要时再附带编码提示。
 * 复杂度评估：O(1)。
 * @param {object} params 参数对象。
 * @param {object} params.outcome 当前结果项。
 * @param {Map<string, object>|null} [params.outcomeMetaMap=null] 结果元信息索引。
 * @param {string} [params.fallbackText="当前结果"] 默认兜底文本。
 * @returns {{ key: string, rawLabel: string, displayLabel: string, summary: string, tags: Array<string>, codeLabel: string }} 解析后的展示信息。
 */
export function resolveTypeologyOutcomeContext({
  outcome,
  outcomeMetaMap = null,
  fallbackText = "当前结果",
}) {
  const normalizedKey = String(outcome?.key ?? "").trim();
  const outcomeMeta =
    outcomeMetaMap instanceof Map && normalizedKey
      ? outcomeMetaMap.get(normalizedKey) ?? null
      : null;
  const rawLabel = String(outcome?.label ?? outcomeMeta?.label ?? "").trim();
  const summary = stripTrailingPunctuation(outcome?.summary ?? outcomeMeta?.summary);
  const tagList =
    normalizeTypeologyTextList(outcome?.tags, 6).length > 0
      ? normalizeTypeologyTextList(outcome?.tags, 6)
      : normalizeTypeologyTextList(outcomeMeta?.tags, 6);
  const isCodeLikeLabel = isTypeologyCodeLikeLabel(rawLabel);
  const summaryLead = extractTypeologySummaryLead(summary);
  const displayLabel =
    (!isCodeLikeLabel && rawLabel) ||
    summaryLead ||
    summary ||
    tagList[0] ||
    normalizedKey ||
    rawLabel ||
    fallbackText;

  return {
    key: normalizedKey,
    rawLabel,
    displayLabel: String(displayLabel ?? "").trim() || fallbackText,
    summary,
    tags: tagList,
    codeLabel: isCodeLikeLabel ? rawLabel : "",
  };
}

/**
 * 格式化结果展示名称。
 * @param {object} params 参数对象。
 * @param {object} params.outcome 当前结果项。
 * @param {Map<string, object>|null} [params.outcomeMetaMap=null] 结果元信息索引。
 * @param {boolean} [params.includeCodeHint=false] 是否在文案中附带编码提示。
 * @param {string} [params.fallbackText="当前结果"] 默认兜底文本。
 * @returns {string} 可直接用于自然语言文案的展示名称。
 */
export function formatTypeologyOutcomeLabel({
  outcome,
  outcomeMetaMap = null,
  includeCodeHint = false,
  fallbackText = "当前结果",
}) {
  const outcomeContext = resolveTypeologyOutcomeContext({
    outcome,
    outcomeMetaMap,
    fallbackText,
  });

  if (
    includeCodeHint &&
    outcomeContext.codeLabel &&
    outcomeContext.codeLabel !== outcomeContext.displayLabel
  ) {
    return `${outcomeContext.displayLabel}（${outcomeContext.codeLabel}）`;
  }

  return outcomeContext.displayLabel;
}
