import {
  TYPEOLOGY_TEST_ORDER,
  getTypeologyTestConfig,
} from "../data/typeologyCatalog";
import {
  TYPEOLOGY_CROSS_VALIDATION_RULES,
  TYPEOLOGY_SOFT_INTERVENTION_RULES,
} from "../config/typeologyProfileRules";

/**
 * 规范化对象输入：
 * 关键逻辑：统一把非法值回退为空对象，降低跨模块调用时的空值分支复杂度。
 * @param {unknown} value 任意输入值。
 * @returns {Record<string, any>} 可安全访问的普通对象。
 */
function toSafeObject(value) {
  return value && typeof value === "object" ? value : {};
}

/**
 * 规范化字符串。
 * @param {unknown} value 任意输入值。
 * @returns {string} 去空白后的字符串。
 */
function toSafeString(value) {
  return String(value ?? "").trim();
}

/**
 * 规范化分值映射。
 * 关键逻辑：确保所有分值都转成 number，避免后续叠加时出现 NaN 污染。
 * @param {Record<string, number>} rawScoreMap 原始分值映射。
 * @returns {Record<string, number>} 规范化后的分值映射。
 */
function normalizeScoreMap(rawScoreMap) {
  const safeScoreMap = {};
  const sourceScoreMap = toSafeObject(rawScoreMap);

  Object.keys(sourceScoreMap).forEach((scoreKey) => {
    const numericScore = Number(sourceScoreMap[scoreKey] ?? 0);
    safeScoreMap[scoreKey] = Number.isFinite(numericScore) ? numericScore : 0;
  });

  return safeScoreMap;
}

/**
 * 从单个 MBTI 结果对象中解析 4 位类型码。
 * @param {object|null|undefined} resultItem 单测结果对象。
 * @returns {string} MBTI 4 位类型码；缺失时返回空字符串。
 */
function resolveMbtiTypeFromResult(resultItem) {
  const normalizedDisplayValue = toSafeString(resultItem?.displayValue).toUpperCase();
  if (/^[EI][SN][TF][JP]$/.test(normalizedDisplayValue)) {
    return normalizedDisplayValue;
  }

  const normalizedMainKey = toSafeString(resultItem?.mainResult?.key).toUpperCase();
  if (/^[EI][SN][TF][JP]$/.test(normalizedMainKey)) {
    return normalizedMainKey;
  }

  const normalizedMainLabel = toSafeString(resultItem?.mainResult?.label).toUpperCase();
  const matchedType = normalizedMainLabel.match(/[EI][SN][TF][JP]/);
  return matchedType?.[0] ?? "";
}

/**
 * 解析当前缓存中的 MBTI 基石类型。
 * @param {Record<string, object>} resultCache 类型学结果缓存。
 * @returns {string} MBTI 4 位类型码；未完成时返回空字符串。
 */
export function resolveTypeologyFoundationMbti(resultCache) {
  const safeResultCache = toSafeObject(resultCache);
  return resolveMbtiTypeFromResult(safeResultCache.mbti);
}

/**
 * 判断柔性干预规则是否命中当前 MBTI。
 * @param {string} baseMbti 基石 MBTI 类型码。
 * @param {object} ruleItem 柔性干预规则。
 * @returns {boolean} 是否命中。
 */
function matchesSoftInterventionRule(baseMbti, ruleItem) {
  const normalizedMbti = toSafeString(baseMbti).toUpperCase();
  const mbtiLetters = Array.isArray(ruleItem?.mbtiLetters) ? ruleItem.mbtiLetters : [];
  if (!normalizedMbti || mbtiLetters.length === 0) {
    return false;
  }

  const matchMode = toSafeString(ruleItem?.matchMode).toLowerCase();
  if (matchMode === "all") {
    return mbtiLetters.every((letterItem) =>
      normalizedMbti.includes(toSafeString(letterItem).toUpperCase()),
    );
  }

  return mbtiLetters.some((letterItem) =>
    normalizedMbti.includes(toSafeString(letterItem).toUpperCase()),
  );
}

/**
 * 对通用测试结果施加柔性干预。
 * 关键逻辑：
 * 1. 仅在已有 MBTI 基石结果时做轻量偏置。
 * 2. 偏置只作用于结果维度分值，不回写题目答案，保证真实答卷可追溯。
 * 3. 若用户在后续测试中持续选择相反方向，真实作答仍可覆盖系统偏置。
 * 复杂度评估：O(R * O)，R 为命中规则数，O 为每条规则影响的 outcome 数；两者均为固定小常数。
 * @param {object} params 参数对象。
 * @param {string} params.baseMbti 基石 MBTI 类型码。
 * @param {string} params.currentTestKey 当前测试键。
 * @param {Record<string, number>} params.rawScoreMap 原始分值映射。
 * @returns {{ adjustedScoreMap: Record<string, number>, meta: object }} 调整后的分值与元数据。
 */
export function applyTypeologySoftIntervention({
  baseMbti,
  currentTestKey,
  rawScoreMap,
}) {
  const normalizedBaseMbti = toSafeString(baseMbti).toUpperCase();
  const normalizedTestKey = toSafeString(currentTestKey);
  const adjustedScoreMap = normalizeScoreMap(rawScoreMap);
  const ruleList = TYPEOLOGY_SOFT_INTERVENTION_RULES[normalizedTestKey];
  const appliedBoosts = [];

  if (!normalizedBaseMbti || !Array.isArray(ruleList) || ruleList.length === 0) {
    return {
      adjustedScoreMap,
      meta: {
        applied: false,
        baseMbti: normalizedBaseMbti,
        boosts: [],
        totalDelta: 0,
      },
    };
  }

  ruleList.forEach((ruleItem) => {
    if (!matchesSoftInterventionRule(normalizedBaseMbti, ruleItem)) {
      return;
    }

    const normalizedOutcomeKeys = Array.isArray(ruleItem?.outcomeKeys)
      ? ruleItem.outcomeKeys
      : [];
    const buffValue = Number(ruleItem?.buffValue ?? 0);
    if (!Number.isFinite(buffValue) || buffValue <= 0) {
      return;
    }

    normalizedOutcomeKeys.forEach((outcomeKey) => {
      const normalizedOutcomeKey = toSafeString(outcomeKey);
      if (!normalizedOutcomeKey || typeof adjustedScoreMap[normalizedOutcomeKey] !== "number") {
        return;
      }

      adjustedScoreMap[normalizedOutcomeKey] += buffValue;
      appliedBoosts.push({
        ruleId: toSafeString(ruleItem?.id),
        outcomeKey: normalizedOutcomeKey,
        delta: buffValue,
        reason: toSafeString(ruleItem?.reason),
      });
    });
  });

  const totalDelta = appliedBoosts.reduce(
    (accumulator, boostItem) => accumulator + Number(boostItem.delta ?? 0),
    0,
  );

  return {
    adjustedScoreMap,
    meta: {
      applied: appliedBoosts.length > 0,
      baseMbti: normalizedBaseMbti,
      boosts: appliedBoosts,
      totalDelta,
    },
  };
}

/**
 * 构建单个测试结果的结构化快照。
 * @param {string} testKey 测试键。
 * @param {object|null|undefined} resultItem 单测结果对象。
 * @returns {object|null} 结构化快照；无效时返回 null。
 */
function buildTypeologyTraitSnapshot(testKey, resultItem) {
  const normalizedTestKey = toSafeString(testKey);
  if (!normalizedTestKey || !resultItem || typeof resultItem !== "object") {
    return null;
  }

  const testConfig = getTypeologyTestConfig(normalizedTestKey);
  const resultKey = toSafeString(resultItem?.mainResult?.key);
  const resultLabel = toSafeString(resultItem?.mainResult?.label);
  const displayValue = toSafeString(resultItem?.displayValue) || resultLabel;
  const resultCode =
    normalizedTestKey === "mbti" ? resolveMbtiTypeFromResult(resultItem) : resultKey;

  if (!resultKey && !resultLabel && !displayValue) {
    return null;
  }

  return {
    testKey: normalizedTestKey,
    testName: toSafeString(resultItem?.testName) || toSafeString(testConfig?.name),
    resultKey,
    resultLabel,
    displayValue,
    resultCode,
    source: toSafeString(resultItem?.source) || "local",
  };
}

/**
 * 读取条件对应的快照字段值。
 * @param {object|null|undefined} traitSnapshot 单测快照。
 * @param {string} fieldName 字段名。
 * @returns {string} 可比较的字段值。
 */
function resolveConditionFieldValue(traitSnapshot, fieldName) {
  const normalizedFieldName = toSafeString(fieldName);
  if (!traitSnapshot || !normalizedFieldName) {
    return "";
  }

  if (normalizedFieldName === "resultKey") {
    return toSafeString(traitSnapshot.resultKey);
  }

  if (normalizedFieldName === "resultLabel") {
    return toSafeString(traitSnapshot.resultLabel);
  }

  if (normalizedFieldName === "displayValue") {
    return toSafeString(traitSnapshot.displayValue);
  }

  if (normalizedFieldName === "resultCode") {
    return toSafeString(traitSnapshot.resultCode);
  }

  return "";
}

/**
 * 判断单条跨测评条件是否命中。
 * @param {Map<string, object>} traitSnapshotMap 快照映射表。
 * @param {object} conditionItem 条件对象。
 * @returns {boolean} 是否命中。
 */
function matchesCrossValidationCondition(traitSnapshotMap, conditionItem) {
  const normalizedTestType = toSafeString(conditionItem?.testType);
  const candidateValueList = Array.isArray(conditionItem?.value)
    ? conditionItem.value.map((item) => toSafeString(item))
    : [];
  if (!normalizedTestType || candidateValueList.length === 0) {
    return false;
  }

  const traitSnapshot = traitSnapshotMap.get(normalizedTestType);
  if (!traitSnapshot) {
    return false;
  }

  const actualFieldValue = resolveConditionFieldValue(
    traitSnapshot,
    conditionItem?.field ?? "resultKey",
  );
  if (!actualFieldValue) {
    return false;
  }

  return candidateValueList.includes(actualFieldValue);
}

/**
 * 运行跨测评稀有规则。
 * @param {Map<string, object>} traitSnapshotMap 结果快照映射表。
 * @returns {Array<object>} 命中的稀有规则列表。
 */
function evaluateCrossValidationRules(traitSnapshotMap) {
  return TYPEOLOGY_CROSS_VALIDATION_RULES.filter((ruleItem) => {
    const conditionList = Array.isArray(ruleItem?.conditions) ? ruleItem.conditions : [];
    if (conditionList.length === 0) {
      return false;
    }

    return conditionList.every((conditionItem) =>
      matchesCrossValidationCondition(traitSnapshotMap, conditionItem),
    );
  }).map((ruleItem) => ({
    ...ruleItem,
    relatedTestKeys: Array.isArray(ruleItem?.conditions)
      ? [...new Set(ruleItem.conditions.map((conditionItem) => toSafeString(conditionItem?.testType)).filter(Boolean))]
      : [],
  }));
}

/**
 * 构建最终画像聚合结果。
 * 关键逻辑：
 * 1. 基石 MBTI 作为后续规则与 AI 画像的唯一锚点。
 * 2. `specialTags` 与 `systemInsightTexts` 全部由同一规则引擎产出，避免 UI 与 AI 语义分裂。
 * 3. 返回 `relatedInsightsByTestKey`，便于结果页按当前测试做局部展示。
 * 复杂度评估：O(T + R * C)，T 为已完成测试数，R 为规则数，C 为每条规则条件数；当前均为小常数。
 * @param {Record<string, object>} resultCache 类型学结果缓存。
 * @returns {{
 *   foundationReady: boolean,
 *   baseMbti: string,
 *   allTraits: Record<string, string>,
 *   completedTraits: Array<object>,
 *   otherResults: Array<object>,
 *   isSpecial: boolean,
 *   specialTags: Array<string>,
 *   systemInsightTexts: Array<string>,
 *   activeInsights: Array<object>,
 *   relatedInsightsByTestKey: Record<string, Array<object>>,
 *   completedCount: number
 * }} 最终画像对象。
 */
export function buildTypeologyFinalProfile(resultCache) {
  const safeResultCache = toSafeObject(resultCache);
  const traitSnapshotMap = new Map();
  const completedTraits = [];
  const testOrderIndexMap = new Map(
    TYPEOLOGY_TEST_ORDER.map((testKey, orderIndex) => [testKey, orderIndex]),
  );

  Object.keys(safeResultCache).forEach((testKey) => {
    const traitSnapshot = buildTypeologyTraitSnapshot(testKey, safeResultCache[testKey]);
    if (!traitSnapshot) {
      return;
    }

    traitSnapshotMap.set(traitSnapshot.testKey, traitSnapshot);
    completedTraits.push(traitSnapshot);
  });

  completedTraits.sort((leftItem, rightItem) => {
    const leftOrder = testOrderIndexMap.get(leftItem.testKey) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = testOrderIndexMap.get(rightItem.testKey) ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return leftItem.testKey.localeCompare(rightItem.testKey, "zh-Hans-CN");
  });

  const baseMbti = resolveTypeologyFoundationMbti(safeResultCache);
  const activeInsights = evaluateCrossValidationRules(traitSnapshotMap);
  const relatedInsightsByTestKey = {};

  activeInsights.forEach((insightItem) => {
    const relatedTestKeys = Array.isArray(insightItem?.relatedTestKeys)
      ? insightItem.relatedTestKeys
      : [];
    relatedTestKeys.forEach((testKey) => {
      if (!relatedInsightsByTestKey[testKey]) {
        relatedInsightsByTestKey[testKey] = [];
      }
      relatedInsightsByTestKey[testKey].push(insightItem);
    });
  });

  const allTraits = completedTraits.reduce((accumulator, traitItem) => {
    accumulator[traitItem.testKey] =
      traitItem.resultLabel || traitItem.displayValue || traitItem.resultKey;
    return accumulator;
  }, {});

  return {
    foundationReady: Boolean(baseMbti),
    baseMbti,
    allTraits,
    completedTraits,
    otherResults: completedTraits.filter((traitItem) => traitItem.testKey !== "mbti"),
    isSpecial: activeInsights.length > 0,
    specialTags: activeInsights.map((insightItem) => toSafeString(insightItem?.uiTag)).filter(Boolean),
    systemInsightTexts: activeInsights
      .map((insightItem) => toSafeString(insightItem?.insightText))
      .filter(Boolean),
    activeInsights,
    relatedInsightsByTestKey,
    completedCount: completedTraits.length,
  };
}
