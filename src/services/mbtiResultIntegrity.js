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
  const fallbackNarrative = sanitizeMbtiCopyText({
    text:
      resultPayload?.mbtiLocalResult?.localNarrative ??
      resultPayload?.mainResult?.summary ??
      resultPayload?.insight,
    lockedTypeCode: lockedMainType.name,
    fallbackText: "",
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
  };

  if (!resultPayload.aiInsight || typeof resultPayload.aiInsight !== "object") {
    nextResultPayload.insight = sanitizeMbtiCopyText({
      text: resultPayload?.insight,
      lockedTypeCode: lockedMainType.name,
      fallbackText: fallbackNarrative,
    });
    return nextResultPayload;
  }

  const nextAiInsight = {
    ...resultPayload.aiInsight,
    title: sanitizeMbtiCopyText({
      text: resultPayload.aiInsight.title,
      lockedTypeCode: lockedMainType.name,
      fallbackText: `${String(resultPayload?.mainResult?.label ?? lockedMainType.name).trim()} · 进阶解读`,
    }),
    narrative: sanitizeMbtiCopyText({
      text: resultPayload.aiInsight.narrative,
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
  nextResultPayload.insight = nextAiInsight.narrative;
  nextResultPayload.detailTags = nextAiInsight.strengths;
  nextResultPayload.detailActions = nextAiInsight.suggestions;

  return nextResultPayload;
}
