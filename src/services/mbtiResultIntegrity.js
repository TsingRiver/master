import { getTypeologyTestConfig } from "../data/typeologyCatalog";
import {
  buildMbtiPersonalitySummary,
  buildTypeologyPersonalitySummary,
  buildTypeologyOutcomeMetaMap,
  formatTypeologyOutcomeLabel,
  isTypeologyCodeLikeLabel,
  normalizeTypeologyShortSummary,
  normalizeTypeologyTextList,
  resolveTypeologyOutcomeContext,
  stripTrailingPunctuation,
} from "./typeologyCopyUtils";

/**
 * MBTI 16 型白名单：
 * 关键逻辑：统一由共享常量管理，避免不同模块各自维护导致类型判断漂移。
 */
export const MBTI_TYPE_CODE_LIST = Object.freeze([
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
]);

const MBTI_TYPE_CODE_SET = new Set(MBTI_TYPE_CODE_LIST);
const MBTI_TYPE_CODE_PATTERN = new RegExp(`\\b(?:${MBTI_TYPE_CODE_LIST.join("|")})\\b`, "gi");

/**
 * 限制百分比分值到 [0, 100]，并保留指定小数位。
 * @param {number} rawScore 原始分值。
 * @param {number} [digits=1] 小数位数。
 * @returns {number} 合法百分比分值。
 */
function clampPercentage(rawScore, digits = 1) {
  if (!Number.isFinite(rawScore)) {
    return 0;
  }

  const safeDigits = Math.max(0, Math.floor(digits));
  const precisionBase = 10 ** safeDigits;
  const clampedScore = Math.max(0, Math.min(100, rawScore));
  return Math.round(clampedScore * precisionBase) / precisionBase;
}

/**
 * 规范化 MBTI 类型码。
 * @param {unknown} rawTypeCode 原始类型码。
 * @returns {string} 合法 4 位类型码；非法时返回空字符串。
 */
export function normalizeMbtiTypeCode(rawTypeCode) {
  const normalizedTypeCode = String(rawTypeCode ?? "").trim().toUpperCase();
  return MBTI_TYPE_CODE_SET.has(normalizedTypeCode) ? normalizedTypeCode : "";
}

/**
 * 从文本中提取 MBTI 类型码。
 * 复杂度评估：O(L)，L 为文本长度。
 * @param {unknown} rawText 原始文本。
 * @returns {Array<string>} 去重后的类型码列表。
 */
export function extractMbtiTypeCodesFromText(rawText) {
  const normalizedText = String(rawText ?? "").trim().toUpperCase();
  if (!normalizedText) {
    return [];
  }

  const matchedTypeCodeList = normalizedText.match(MBTI_TYPE_CODE_PATTERN) ?? [];
  return Array.from(
    new Set(
      matchedTypeCodeList
        .map((typeCode) => normalizeMbtiTypeCode(typeCode))
        .filter(Boolean),
    ),
  );
}

/**
 * 判断文本是否出现与锁定主类型不一致的 MBTI 类型码。
 * 关键逻辑：结果摘要区不允许出现其他 4 位类型码，否则会造成同页自相矛盾。
 * 复杂度评估：O(L)，L 为文本长度。
 * @param {unknown} rawText 原始文本。
 * @param {string} lockedTypeCode 锁定主类型码。
 * @returns {boolean} 是否出现冲突类型码。
 */
export function hasForeignMbtiTypeReference(rawText, lockedTypeCode) {
  const normalizedLockedTypeCode = normalizeMbtiTypeCode(lockedTypeCode);
  if (!normalizedLockedTypeCode) {
    return false;
  }

  return extractMbtiTypeCodesFromText(rawText).some(
    (typeCode) => typeCode !== normalizedLockedTypeCode,
  );
}

/**
 * 规范化单条 MBTI 文案。
 * 关键逻辑：若 AI 文案出现外部类型码，则回退到本地锚点文案，避免主结果与摘要分裂。
 * @param {object} params 参数对象。
 * @param {unknown} params.text 待校正文案。
 * @param {string} params.lockedTypeCode 锁定主类型码。
 * @param {string} params.fallbackText 兜底文案。
 * @returns {string} 安全文案。
 */
export function sanitizeMbtiCopyText({ text, lockedTypeCode, fallbackText }) {
  const normalizedFallbackText = String(fallbackText ?? "").trim();
  const normalizedText = String(text ?? "").trim();
  if (!normalizedText) {
    return normalizedFallbackText;
  }

  if (hasForeignMbtiTypeReference(normalizedText, lockedTypeCode)) {
    return normalizedFallbackText;
  }

  return normalizedText;
}

/**
 * 规范化 MBTI 文案数组。
 * 关键逻辑：数组中任一项出现冲突类型码时整体回退，保证标签/建议语义一致。
 * 复杂度评估：O(N * L)，N 为数组长度，L 为平均文本长度。
 * @param {object} params 参数对象。
 * @param {unknown} params.textList 待校正文案数组。
 * @param {string} params.lockedTypeCode 锁定主类型码。
 * @param {Array<string>} params.fallbackList 兜底文案数组。
 * @param {number} [params.limit=3] 返回条数上限。
 * @returns {Array<string>} 安全文案数组。
 */
export function sanitizeMbtiCopyList({
  textList,
  lockedTypeCode,
  fallbackList,
  limit = 3,
}) {
  const safeLimit = Math.max(1, Math.floor(limit));
  const normalizedFallbackList = Array.isArray(fallbackList)
    ? fallbackList
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
        .slice(0, safeLimit)
    : [];

  if (!Array.isArray(textList)) {
    return normalizedFallbackList;
  }

  const normalizedTextList = textList
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, safeLimit);

  if (normalizedTextList.length === 0) {
    return normalizedFallbackList;
  }

  const hasConflictItem = normalizedTextList.some((textItem) =>
    hasForeignMbtiTypeReference(textItem, lockedTypeCode),
  );
  if (hasConflictItem) {
    return normalizedFallbackList;
  }

  return normalizedTextList;
}

/**
 * 从统一结果中构建锁定主类型。
 * @param {object} resultPayload 统一结果对象。
 * @returns {{ name: string, score: number } | null} 锁定主类型对象。
 */
function buildLockedMainTypeFromResult(resultPayload) {
  const lockedTypeCode = normalizeMbtiTypeCode(
    resultPayload?.mainResult?.key ?? resultPayload?.mbtiLocalResult?.topType?.type,
  );
  if (!lockedTypeCode) {
    return null;
  }

  return {
    name: lockedTypeCode,
    score: clampPercentage(resultPayload?.mainResult?.score),
  };
}

/**
 * 从统一结果中构建锁定 Top 3。
 * @param {object} resultPayload 统一结果对象。
 * @returns {Array<{ name: string, score: number }>} 锁定 Top 3。
 */
function buildLockedTopThreeFromResult(resultPayload) {
  const lockedMainType = buildLockedMainTypeFromResult(resultPayload);
  const normalizedTopThree = (Array.isArray(resultPayload?.topThree) ? resultPayload.topThree : [])
    .map((topItem) => ({
      name: normalizeMbtiTypeCode(topItem?.key ?? String(topItem?.label ?? "").slice(0, 4)),
      score: clampPercentage(topItem?.score),
    }))
    .filter((topItem) => topItem.name);
  const dedupedTopThree = [];
  const usedTypeSet = new Set();

  if (lockedMainType?.name && !usedTypeSet.has(lockedMainType.name)) {
    dedupedTopThree.push({
      name: lockedMainType.name,
      score: lockedMainType.score,
    });
    usedTypeSet.add(lockedMainType.name);
  }

  normalizedTopThree.forEach((topItem) => {
    if (dedupedTopThree.length >= 3 || usedTypeSet.has(topItem.name)) {
      return;
    }

    dedupedTopThree.push(topItem);
    usedTypeSet.add(topItem.name);
  });

  return dedupedTopThree.slice(0, 3);
}

/**
 * 构建锁定 Top 3 的展示标签。
 * @param {object} resultPayload 统一结果对象。
 * @returns {Array<string>} Top 3 展示文本。
 */
function buildLockedTopThreeTagLines(topThreeList, resultPayload) {
  const topThreeLabelMap = new Map(
    (Array.isArray(resultPayload?.topThree) ? resultPayload.topThree : []).map((topItem) => [
      normalizeMbtiTypeCode(topItem?.key ?? String(topItem?.label ?? "").slice(0, 4)),
      String(topItem?.label ?? "").trim(),
    ]),
  );

  return (Array.isArray(topThreeList) ? topThreeList : [])
    .map((topItem) => {
      const normalizedTypeCode = normalizeMbtiTypeCode(topItem?.name);
      const normalizedLabel =
        topThreeLabelMap.get(normalizedTypeCode) ||
        (normalizedTypeCode ? normalizedTypeCode : "");
      const normalizedScore = clampPercentage(topItem?.score);
      return normalizedLabel ? `${normalizedLabel} ${normalizedScore}%` : "";
    })
    .filter(Boolean)
    .slice(0, 3);
}

/**
 * 构建通用类型学主卡摘要兜底。
 * 关键逻辑：结果摘要统一使用单句人格描述，不再混入 Top3、建议和方法论说明。
 * @param {object} params 参数对象。
 * @param {string} params.testName 测试名称。
 * @param {object} params.mainResult 主结果。
 * @param {Array<object>} params.topThree Top3。
 * @param {object|null} [params.dualHighProfile] 双高配置。
 * @returns {string} 兜底解读文案。
 */
function buildGenericFallbackInsightText({
  testName,
  mainResult,
  topThree,
  dualHighProfile = null,
  outcomeMetaMap = null,
}) {
  return buildTypeologyPersonalitySummary({
    mainResult,
    outcomeMetaMap,
    dualHighProfile,
  });
}

/**
 * 构建通用类型学进阶标题兜底。
 * @param {object} params 参数对象。
 * @param {string} params.testName 测试名称。
 * @param {object} params.mainResult 主结果。
 * @param {object|null} [params.dualHighProfile] 双高配置。
 * @returns {string} 进阶标题。
 */
function buildGenericFallbackAiTitle({ testName, mainResult, dualHighProfile = null }) {
  if (dualHighProfile?.isDualHigh) {
    return `${String(testName ?? "").trim()} · 双高观察`;
  }

  const mainOutcomeContext = resolveTypeologyOutcomeContext({
    outcome: mainResult,
    fallbackText: String(testName ?? "当前结果").trim(),
  });
  return `${mainOutcomeContext.displayLabel} · 深入观察`;
}

/**
 * 构建通用类型学进阶叙事兜底。
 * @param {object} params 参数对象。
 * @param {string} params.testName 测试名称。
 * @param {object} params.mainResult 主结果。
 * @param {Array<object>} params.topThree Top3。
 * @param {object|null} [params.dualHighProfile] 双高配置。
 * @returns {string} 进阶叙事文案。
 */
function buildGenericFallbackAiNarrative({
  testName,
  mainResult,
  topThree,
  dualHighProfile = null,
  outcomeMetaMap = null,
}) {
  if (dualHighProfile?.isDualHigh) {
    return [
      `「${String(testName ?? "").trim()}」出现双高结果，说明你的偏好结构不是单一路径，而是两组高频特征并行存在。`,
      "真正需要观察的不是“到底是哪一个标签”，而是你在不同任务压力、关系密度和表达要求下，会更稳定地调用哪一组优势。",
      "把双高结果放回真实场景复盘，才能更快看清长期主线和临场切换规律。",
    ].join("");
  }

  const mainOutcomeContext = resolveTypeologyOutcomeContext({
    outcome: mainResult,
    outcomeMetaMap,
    fallbackText: String(testName ?? "当前结果").trim(),
  });
  const normalizedSummary = mainOutcomeContext.summary;
  const normalizedTagList =
    mainOutcomeContext.tags.length > 0
      ? mainOutcomeContext.tags.slice(0, 3)
      : normalizeTypeologyTextList(mainResult?.tags, 3);
  const secondLabel = formatTypeologyOutcomeLabel({
    outcome: topThree?.[1],
    outcomeMetaMap,
    fallbackText: "无",
  });
  const thirdLabel = formatTypeologyOutcomeLabel({
    outcome: topThree?.[2],
    outcomeMetaMap,
    fallbackText: "无",
  });

  return [
    `进一步看，「${mainOutcomeContext.displayLabel}」排在首位，不只是表层偏好明显，更说明你在长期行为里更稳定地落在「${normalizedSummary || "当前这组特征"}」这条主线上。`,
    normalizedTagList.length > 0
      ? `从关键词看，${normalizedTagList.join("、")} 这些信号最容易在你的日常决策与协作里反复出现。`
      : "",
    `和次高匹配「${secondLabel}」「${thirdLabel}」相比，你并不是没有其他倾向，而是当前这一路径更容易成为默认策略。`,
  ]
    .filter(Boolean)
    .join("");
}

/**
 * 构建通用类型学进阶优势信号兜底。
 * @param {object} mainResult 主结果。
 * @param {Array<object>} topThree Top3。
 * @returns {Array<string>} 优势信号列表。
 */
function buildGenericFallbackAiStrengths(mainResult, topThree, outcomeMetaMap = null) {
  const mainOutcomeContext = resolveTypeologyOutcomeContext({
    outcome: mainResult,
    outcomeMetaMap,
  });
  const normalizedTagList =
    mainOutcomeContext.tags.length > 0
      ? mainOutcomeContext.tags.slice(0, 3)
      : normalizeTypeologyTextList(mainResult?.tags, 3);
  const secondLabel = formatTypeologyOutcomeLabel({
    outcome: topThree?.[1],
    outcomeMetaMap,
    fallbackText: "无",
  });
  const thirdLabel = formatTypeologyOutcomeLabel({
    outcome: topThree?.[2],
    outcomeMetaMap,
    fallbackText: "无",
  });

  return [
    normalizedTagList.length > 0
      ? `主结果持续指向 ${normalizedTagList.join("、")} 这组特征，说明你的风格重心已经比较清晰。`
      : "当前主结果能稳定排在第一位，说明你的行为偏好已经形成可识别主线。",
    `次高匹配仍保留在「${secondLabel}」「${thirdLabel}」，说明你具备一定的场景适应弹性。`,
    `这份结果的价值不只是告诉你“像谁”，更在提示「${mainOutcomeContext.displayLabel}」这条路径最容易在哪些熟悉场景里被持续放大。`,
  ];
}

/**
 * 构建通用类型学进阶提醒信号兜底。
 * @returns {Array<string>} 提醒信号列表。
 */
function buildGenericFallbackAiRisks() {
  return [
    "如果只记住类型标签，而不看真实行为证据，容易把一次结果误当成长期定论。",
    "当外部要求与你的主结果相反时，最容易出现节奏失衡、表达失真或临时用力过猛。",
    "次高匹配接近时，说明你的风格边界并不僵硬，压力场景下可能出现短时切换。",
  ];
}

/**
 * 构建通用类型学进阶行动建议兜底。
 * @param {Array<string>} actionList 本地行动建议列表。
 * @returns {Array<string>} 行动建议列表。
 */
function buildGenericFallbackAiSuggestions(actionList) {
  const normalizedActionList = Array.isArray(actionList)
    ? actionList
        .map((actionItem) => String(actionItem ?? "").trim().replace(/[。！？!?]+$/g, ""))
        .filter(Boolean)
        .slice(0, 3)
    : [];

  if (normalizedActionList.length >= 3) {
    return [
      `${normalizedActionList[0]}，优先放进最近最真实的工作或关系场景里验证。`,
      `${normalizedActionList[1]}，观察 2 到 4 周后再判断它是不是你的稳定策略。`,
      `${normalizedActionList[2]}，把测评结论转成具体动作，比记住标签本身更有价值。`,
    ];
  }

  return [
    "先用一个最熟悉的真实场景验证主结果，看它是否能稳定解释你的行为选择。",
    "把次高匹配也当成备用策略，而不是把自己锁死在唯一标签里。",
    "每隔一段时间复盘一次行为证据，确认当前结果到底是长期主线还是短期状态。",
  ];
}

/**
 * 构建 MBTI 进阶叙事兜底。
 * @param {object} resultPayload 统一结果对象。
 * @returns {string} 进阶叙事文案。
 */
function buildMbtiFallbackAiNarrative(resultPayload) {
  const axisSummaryLineList = Array.isArray(resultPayload?.mbtiLocalResult?.axisSummaryLines)
    ? resultPayload.mbtiLocalResult.axisSummaryLines
        .map((lineItem) => String(lineItem ?? "").trim().replace(/[。！？!?]+$/g, ""))
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const topTypeCode = String(resultPayload?.mainResult?.key ?? "").trim();
  const secondTypeCode = String(resultPayload?.topThree?.[1]?.key ?? "").trim();
  const thirdTypeCode = String(resultPayload?.topThree?.[2]?.key ?? "").trim();

  return [
    `进一步看，${topTypeCode} 排在第一位，并不是单纯因为字母组合碰巧命中，而是你的维度偏好在长期作答里形成了稳定方向。`,
    axisSummaryLineList.length > 0
      ? `其中最关键的信号包括：${axisSummaryLineList.join("；")}。`
      : "",
    secondTypeCode || thirdTypeCode
      ? `你与 ${secondTypeCode || "次高类型"}、${thirdTypeCode || "第三类型"} 仍然接近，这说明某些边界场景下会出现次级风格，但长期主线依然更接近 ${topTypeCode}。`
      : "",
  ]
    .filter(Boolean)
    .join("");
}

/**
 * 转义正则元字符，便于检测历史弱文案。
 * @param {unknown} rawText 原始文本。
 * @returns {string} 可用于正则的安全文本。
 */
function escapeForRegExp(rawText) {
  return String(rawText ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 判断文本是否仍带有“直接把编码当结果名”的旧模板痕迹。
 * @param {unknown} text 待检测文本。
 * @param {unknown} rawLabel 原始结果标签。
 * @returns {boolean} 是否命中旧模板。
 */
function hasLegacyCodeHeadlineText(text, rawLabel) {
  const normalizedText = String(text ?? "").trim();
  const normalizedRawLabel = String(rawLabel ?? "").trim();
  if (!normalizedText || !isTypeologyCodeLikeLabel(normalizedRawLabel)) {
    return false;
  }

  const legacyHeadlinePattern = new RegExp(
    `当前最匹配的是「${escapeForRegExp(normalizedRawLabel)}」`,
  );
  return legacyHeadlinePattern.test(normalizedText);
}

/**
 * 判断通用摘要是否需要升级为更自然的本地兜底文案。
 * @param {object} params 参数对象。
 * @param {unknown} params.text 当前摘要文本。
 * @param {object} params.mainResult 主结果。
 * @param {unknown} [params.aiNarrative] 当前进阶叙事。
 * @returns {boolean} 是否需要升级。
 */
function shouldUpgradeGenericSummaryText({ text, mainResult, aiNarrative }) {
  const normalizedText = String(text ?? "").trim();
  const normalizedAiNarrative = String(aiNarrative ?? "").trim();
  if (!normalizedText) {
    return true;
  }

  if (normalizedAiNarrative && normalizedText === normalizedAiNarrative) {
    return true;
  }

  return hasLegacyCodeHeadlineText(normalizedText, mainResult?.label);
}

/**
 * 判断通用 AI 标题是否需要升级。
 * @param {object} params 参数对象。
 * @param {unknown} params.text 当前标题。
 * @param {object} params.mainResult 主结果。
 * @returns {boolean} 是否需要升级。
 */
function shouldUpgradeGenericAiTitle({ text, mainResult }) {
  const normalizedText = String(text ?? "").trim();
  const normalizedRawLabel = String(mainResult?.label ?? "").trim();
  if (!normalizedText) {
    return true;
  }

  return Boolean(normalizedRawLabel) &&
    isTypeologyCodeLikeLabel(normalizedRawLabel) &&
    normalizedText.startsWith(normalizedRawLabel);
}

/**
 * 判断通用 AI 叙事是否需要升级。
 * @param {object} params 参数对象。
 * @param {unknown} params.text 当前叙事。
 * @param {unknown} params.summaryText 摘要文本。
 * @param {object} params.mainResult 主结果。
 * @returns {boolean} 是否需要升级。
 */
function shouldUpgradeGenericAiNarrative({ text, summaryText, mainResult }) {
  const normalizedText = String(text ?? "").trim();
  const normalizedSummaryText = String(summaryText ?? "").trim();
  if (!normalizedText) {
    return true;
  }

  if (normalizedSummaryText && normalizedText === normalizedSummaryText) {
    return true;
  }

  return hasLegacyCodeHeadlineText(normalizedText, mainResult?.label);
}

/**
 * 判断通用 AI 短摘要是否需要升级。
 * @param {object} params 参数对象。
 * @param {unknown} params.text 当前短摘要。
 * @param {unknown} params.narrative 当前进阶叙事。
 * @param {object} params.mainResult 主结果。
 * @returns {boolean} 是否需要升级。
 */
function shouldUpgradeGenericAiShortSummary({ text, narrative, mainResult }) {
  const normalizedText = String(text ?? "").trim();
  const normalizedShortSummary = normalizeTypeologyShortSummary(text);
  const normalizedNarrative = String(narrative ?? "").trim();
  if (!normalizedShortSummary) {
    return true;
  }

  if (
    normalizedNarrative &&
    (normalizedText === normalizedNarrative || normalizedShortSummary === normalizedNarrative)
  ) {
    return true;
  }

  return hasLegacyCodeHeadlineText(normalizedShortSummary, mainResult?.label);
}

/**
 * 判断 MBTI 进阶叙事是否需要升级。
 * @param {object} params 参数对象。
 * @param {unknown} params.text 当前叙事。
 * @param {unknown} params.summaryText 当前摘要。
 * @returns {boolean} 是否需要升级。
 */
function shouldUpgradeMbtiAiNarrative({ text, summaryText }) {
  const normalizedText = String(text ?? "").trim();
  const normalizedSummaryText = String(summaryText ?? "").trim();
  if (!normalizedText) {
    return true;
  }

  return Boolean(normalizedSummaryText) && normalizedText === normalizedSummaryText;
}

/**
 * 判断 MBTI 短摘要是否需要升级。
 * @param {object} params 参数对象。
 * @param {unknown} params.text 当前短摘要。
 * @param {unknown} params.narrative 当前进阶叙事。
 * @returns {boolean} 是否需要升级。
 */
function shouldUpgradeMbtiAiShortSummary({ text, narrative }) {
  const normalizedText = String(text ?? "").trim();
  const normalizedShortSummary = normalizeTypeologyShortSummary(text);
  const normalizedNarrative = String(narrative ?? "").trim();
  if (!normalizedShortSummary) {
    return true;
  }

  return (
    Boolean(normalizedNarrative) &&
    (normalizedText === normalizedNarrative || normalizedShortSummary === normalizedNarrative)
  );
}

/**
 * 规范化字符串数组字段。
 * @param {unknown} value 任意值。
 * @param {Array<string>} fallbackList 兜底数组。
 * @param {number} [limit=3] 返回上限。
 * @returns {Array<string>} 清洗后的数组。
 */
function sanitizeStringList(value, fallbackList, limit = 3) {
  const normalizedValueList = Array.isArray(value)
    ? value
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
        .slice(0, limit)
    : [];

  if (normalizedValueList.length > 0) {
    return normalizedValueList;
  }

  return Array.isArray(fallbackList)
    ? fallbackList
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
        .slice(0, limit)
    : [];
}

/**
 * 统一修复通用测试的 AI 兜底文案。
 * 关键逻辑：旧缓存里若仍是“摘要复用进阶”或“编码直出”，读取时自动升级成人话版进阶解读。
 * @param {object} params 参数对象。
 * @param {object} params.resultPayload 当前结果对象。
 * @param {object} params.mainResult 主结果。
 * @param {Array<object>} params.topThree Top3。
 * @param {object|null} params.dualHighProfile 双高配置。
 * @param {object|null} params.testConfig 测试配置。
 * @param {Map<string, object>} params.outcomeMetaMap 结果元信息索引。
 * @param {string} params.summaryText 当前摘要。
 * @returns {object} 修复后的结果对象。
 */
function sanitizeGenericAiInsightPayload({
  resultPayload,
  mainResult,
  topThree,
  dualHighProfile,
  testConfig,
  outcomeMetaMap,
  summaryText,
}) {
  if (!resultPayload?.aiInsight || typeof resultPayload.aiInsight !== "object") {
    return resultPayload;
  }

  const fallbackTitle = buildGenericFallbackAiTitle({
    testName: resultPayload?.testName ?? testConfig?.name,
    mainResult,
    dualHighProfile,
    outcomeMetaMap,
  });
  const fallbackNarrative = buildGenericFallbackAiNarrative({
    testName: resultPayload?.testName ?? testConfig?.name,
    mainResult,
    topThree,
    dualHighProfile,
    outcomeMetaMap,
  });
  const fallbackStrengthList = buildGenericFallbackAiStrengths(
    mainResult,
    topThree,
    outcomeMetaMap,
  );
  const fallbackRiskList = buildGenericFallbackAiRisks();
  const fallbackSuggestionList = buildGenericFallbackAiSuggestions(
    mainResult?.actions ?? resultPayload?.detailActions ?? [],
  );
  const currentAiInsight = resultPayload.aiInsight;
  const fallbackShortSummary = summaryText;
  const resolvedTitle = shouldUpgradeGenericAiTitle({
    text: currentAiInsight.title,
    mainResult,
  })
    ? fallbackTitle
    : String(currentAiInsight.title ?? "").trim();
  const resolvedNarrative = shouldUpgradeGenericAiNarrative({
    text: currentAiInsight.narrative,
    summaryText,
    mainResult,
  })
    ? fallbackNarrative
    : String(currentAiInsight.narrative ?? "").trim();
  const resolvedShortSummary = shouldUpgradeGenericAiShortSummary({
    text: currentAiInsight.shortSummary,
    narrative: currentAiInsight.narrative,
    mainResult,
  })
    ? fallbackShortSummary
    : normalizeTypeologyShortSummary(currentAiInsight.shortSummary);
  const resolvedStrengthList = sanitizeStringList(
    currentAiInsight.strengths,
    fallbackStrengthList,
    3,
  );
  const resolvedRiskList = sanitizeStringList(currentAiInsight.risks, fallbackRiskList, 3);
  const resolvedSuggestionList = sanitizeStringList(
    currentAiInsight.suggestions,
    fallbackSuggestionList,
    3,
  );

  return {
    ...resultPayload,
    aiInsight: {
      ...currentAiInsight,
      shortSummary: resolvedShortSummary,
      title: resolvedTitle,
      narrative: resolvedNarrative,
      strengths: resolvedStrengthList,
      risks: resolvedRiskList,
      suggestions: resolvedSuggestionList,
    },
    detailTags: resolvedStrengthList,
    detailActions: resolvedSuggestionList,
  };
}

/**
 * 校正通用类型学结果对象中的主结果与 Top3 一致性。
 * 关键逻辑：
 * 1. 非 MBTI 测试理论上都由同一份 scoreBoard 产出 mainResult 与 Top3；
 * 2. 一旦缓存或后续改动导致二者分裂，统一以 Top3 第一名为准做修复。
 * 复杂度评估：O(1)。
 * @param {object} resultPayload 统一结果对象。
 * @returns {object} 校正后的结果对象。
 */
function sanitizeGenericTypeologyResult(resultPayload) {
  const normalizedTestKey = String(resultPayload?.testKey ?? "").trim();
  if (
    !normalizedTestKey ||
    normalizedTestKey === "mbti" ||
    !resultPayload ||
    typeof resultPayload !== "object"
  ) {
    return resultPayload;
  }

  const testConfig = getTypeologyTestConfig(normalizedTestKey);
  const currentTopThree = Array.isArray(resultPayload?.topThree) ? resultPayload.topThree : [];
  const topRank = currentTopThree[0];
  if (!topRank || typeof topRank !== "object") {
    return resultPayload;
  }

  const currentMainResult = resultPayload?.mainResult;
  if (!currentMainResult || typeof currentMainResult !== "object") {
    return resultPayload;
  }

  const normalizedTopKey = String(topRank?.key ?? "").trim();
  const normalizedMainKey = String(currentMainResult?.key ?? "").trim();
  const normalizedTopLabel = String(topRank?.label ?? "").trim();
  const normalizedMainLabel = String(currentMainResult?.label ?? "").trim();
  const normalizedTopScore = clampPercentage(topRank?.score);
  const normalizedMainScore = clampPercentage(currentMainResult?.score);
  const outcomeMetaMap = buildTypeologyOutcomeMetaMap(
    resultPayload?.scoreBoard,
    [currentMainResult],
    currentTopThree,
    testConfig?.outcomeMap instanceof Map ? testConfig.outcomeMap : null,
  );
  const dualHighProfile =
    resultPayload?.dualHighProfile && typeof resultPayload.dualHighProfile === "object"
      ? resultPayload.dualHighProfile
      : null;
  const normalizedDualHighLeftKey = String(dualHighProfile?.leftKey ?? "").trim();
  const normalizedDualHighRightKey = String(dualHighProfile?.rightKey ?? "").trim();
  const hasStructuredDualHighProfile =
    normalizedTestKey === "jung-classic" &&
    Boolean(dualHighProfile?.isDualHigh) &&
    Boolean(normalizedDualHighLeftKey) &&
    Boolean(normalizedDualHighRightKey) &&
    [normalizedDualHighLeftKey, normalizedDualHighRightKey].includes(normalizedTopKey) &&
    normalizedMainScore === normalizedTopScore;
  const fallbackSummaryText = buildGenericFallbackInsightText({
    testName: resultPayload?.testName ?? testConfig?.name,
    mainResult: currentMainResult,
    topThree: currentTopThree,
    dualHighProfile,
    outcomeMetaMap,
  });
  const hasAiInsight = Boolean(resultPayload?.aiInsight && typeof resultPayload.aiInsight === "object");
  const resolvedSummaryText = fallbackSummaryText;
  const finalizeGenericPayload = (nextPayload) =>
    sanitizeGenericAiInsightPayload({
      resultPayload: nextPayload,
      mainResult: nextPayload?.mainResult ?? currentMainResult,
      topThree: currentTopThree,
      dualHighProfile,
      testConfig,
      outcomeMetaMap,
      summaryText: nextPayload?.summaryText ?? fallbackSummaryText,
    });

  if (hasStructuredDualHighProfile) {
    return finalizeGenericPayload({
      ...resultPayload,
      summaryText: resolvedSummaryText,
      insight: resolvedSummaryText,
    });
  }

  const isAlreadyAligned =
    normalizedTopKey &&
    normalizedTopKey === normalizedMainKey &&
    normalizedTopScore === normalizedMainScore &&
    (normalizedTestKey === "enneagram" || normalizedTopLabel === normalizedMainLabel);
  const outcomeConfig =
    normalizedTestKey === "enneagram"
      ? null
      : testConfig?.outcomeMap instanceof Map
        ? testConfig.outcomeMap.get(normalizedTopKey) ?? null
        : null;
  const nextMainResult =
    isAlreadyAligned
      ? currentMainResult
      : normalizedTestKey === "enneagram"
        ? {
            ...currentMainResult,
            key: normalizedTopKey || normalizedMainKey,
            score: normalizedTopScore,
          }
        : {
            ...currentMainResult,
            key: normalizedTopKey || normalizedMainKey,
            label: normalizedTopLabel || normalizedMainLabel,
            score: normalizedTopScore,
            summary: stripTrailingPunctuation(outcomeConfig?.summary) || currentMainResult.summary,
            tags: Array.isArray(outcomeConfig?.tags)
              ? outcomeConfig.tags
              : currentMainResult.tags ?? [],
            actions: Array.isArray(outcomeConfig?.actions)
              ? outcomeConfig.actions
              : currentMainResult.actions ?? [],
          };
  const nextFallbackSummaryText = buildGenericFallbackInsightText({
    testName: resultPayload?.testName ?? testConfig?.name,
    mainResult: nextMainResult,
    topThree: currentTopThree,
    dualHighProfile,
    outcomeMetaMap,
  });
  const finalSummaryText =
    nextFallbackSummaryText;
  const nextResultPayload = {
    ...resultPayload,
    mainResult: nextMainResult,
    summaryText: finalSummaryText,
    insight: finalSummaryText,
  };

  if (!hasAiInsight && normalizedTestKey !== "enneagram") {
    nextResultPayload.detailTags = nextMainResult.tags ?? resultPayload?.detailTags ?? [];
    nextResultPayload.detailActions = nextMainResult.actions ?? resultPayload?.detailActions ?? [];
  }

  return finalizeGenericPayload(nextResultPayload);
}

/**
 * 校正 MBTI 统一结果对象中的 AI 文案。
 * 关键逻辑：MBTI 主结果以本地算法为唯一真源，AI 只能解释结果，不能改判结果。
 * 复杂度评估：O(N * L)，N 为可见文案条数，L 为平均文本长度。
 * @param {object} resultPayload 统一结果对象。
 * @returns {object} 校正后的结果对象。
 */
export function sanitizeMbtiTypeologyResult(resultPayload) {
  const normalizedTestKey = String(resultPayload?.testKey ?? "").trim();
  if (normalizedTestKey !== "mbti" || !resultPayload || typeof resultPayload !== "object") {
    return resultPayload;
  }

  const lockedMainType = buildLockedMainTypeFromResult(resultPayload);
  if (!lockedMainType) {
    return resultPayload;
  }

  const lockedTopThree = buildLockedTopThreeFromResult(resultPayload);
  const normalizedTopThree = lockedTopThree.map((topItem) => ({
    key: topItem.name,
    label:
      String(
        (Array.isArray(resultPayload?.topThree) ? resultPayload.topThree : []).find(
          (candidateItem) =>
            normalizeMbtiTypeCode(
              candidateItem?.key ?? String(candidateItem?.label ?? "").slice(0, 4),
            ) === topItem.name,
        )?.label ?? topItem.name,
      ).trim() || topItem.name,
    score: topItem.score,
  }));
  const fallbackSummaryText = buildMbtiPersonalitySummary({
    typeCode: lockedMainType.name,
    typeTitle:
      String(resultPayload?.mainResult?.label ?? "")
        .split("·")[1]
        ?.trim() || String(resultPayload?.mbtiLocalResult?.topType?.title ?? "").trim(),
  });
  const fallbackNarrative = buildMbtiFallbackAiNarrative({
    ...resultPayload,
    summaryText: fallbackSummaryText,
    topThree: normalizedTopThree,
  });
  const fallbackTagList = buildLockedTopThreeTagLines(lockedTopThree, resultPayload);
  const fallbackSuggestionList = Array.isArray(resultPayload?.mainResult?.actions)
    ? resultPayload.mainResult.actions
        .map((actionItem) => String(actionItem ?? "").trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const fallbackRiskList = [
    "高压下可能回到单一路径",
    "沟通节奏差异会放大误解",
  ];

  const nextResultPayload = {
    ...resultPayload,
    topThree: normalizedTopThree,
    summaryText: fallbackSummaryText,
    insight: fallbackSummaryText,
  };

  if (!resultPayload.aiInsight || typeof resultPayload.aiInsight !== "object") {
    nextResultPayload.summaryText = sanitizeMbtiCopyText({
      text: resultPayload?.summaryText ?? resultPayload?.insight,
      lockedTypeCode: lockedMainType.name,
      fallbackText: fallbackSummaryText,
    });
    nextResultPayload.insight = nextResultPayload.summaryText;
    return nextResultPayload;
  }

  const nextAiInsight = {
    ...resultPayload.aiInsight,
    // 关键逻辑：旧缓存没有 shortSummary 时，直接回退到新的本地人格摘要，避免从长文里硬截一句导致语义跑偏。
    shortSummary: sanitizeMbtiCopyText({
      text:
        shouldUpgradeMbtiAiShortSummary({
          text: resultPayload.aiInsight.shortSummary,
          narrative: resultPayload.aiInsight.narrative,
        })
          ? ""
          : normalizeTypeologyShortSummary(resultPayload.aiInsight.shortSummary),
      lockedTypeCode: lockedMainType.name,
      fallbackText: fallbackSummaryText,
    }),
    title: sanitizeMbtiCopyText({
      text: resultPayload.aiInsight.title,
      lockedTypeCode: lockedMainType.name,
      fallbackText: `${String(resultPayload?.mainResult?.label ?? lockedMainType.name).trim()} · 进阶解读`,
    }),
    narrative: sanitizeMbtiCopyText({
      text: shouldUpgradeMbtiAiNarrative({
        text: resultPayload.aiInsight.narrative,
        summaryText: fallbackSummaryText,
      })
        ? ""
        : resultPayload.aiInsight.narrative,
      lockedTypeCode: lockedMainType.name,
      fallbackText: fallbackNarrative,
    }),
    strengths: sanitizeMbtiCopyList({
      textList: resultPayload.aiInsight.strengths,
      lockedTypeCode: lockedMainType.name,
      fallbackList: fallbackTagList,
      limit: 3,
    }),
    risks: sanitizeMbtiCopyList({
      textList: resultPayload.aiInsight.risks,
      lockedTypeCode: lockedMainType.name,
      fallbackList: fallbackRiskList,
      limit: 3,
    }),
    suggestions: sanitizeMbtiCopyList({
      textList: resultPayload.aiInsight.suggestions,
      lockedTypeCode: lockedMainType.name,
      fallbackList: fallbackSuggestionList,
      limit: 3,
    }),
    // 关键逻辑：缓存命中旧脏数据时，强制把深度层主类型拉回本地主结果。
    deepMainType: lockedMainType,
    deepTopThree: lockedTopThree,
  };

  nextResultPayload.aiInsight = nextAiInsight;
  nextResultPayload.summaryText = fallbackSummaryText;
  nextResultPayload.insight = fallbackSummaryText;
  nextResultPayload.detailTags = nextAiInsight.strengths;
  nextResultPayload.detailActions = nextAiInsight.suggestions;

  return nextResultPayload;
}

/**
 * 统一校正类型学结果对象。
 * 关键逻辑：所有类型学测试都走同一入口做结果一致性修复，避免页面层分别兜底。
 * @param {object} resultPayload 统一结果对象。
 * @returns {object} 校正后的结果对象。
 */
export function sanitizeTypeologyResult(resultPayload) {
  const normalizedTestKey = String(resultPayload?.testKey ?? "").trim();
  if (!normalizedTestKey) {
    return resultPayload;
  }

  if (normalizedTestKey === "mbti") {
    return sanitizeMbtiTypeologyResult(resultPayload);
  }

  return sanitizeGenericTypeologyResult(resultPayload);
}
