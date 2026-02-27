import { DIMENSION_KEYS, DIMENSION_LABELS } from "../constants/dimensions";

/**
 * 城市优先级分组配置：
 * 1. 国内版：轻量提高核心大城市命中率（北京/上海/广州/深圳/杭州）。
 * 2. 国际版：轻量提高热门旅游城市命中率。
 * 3. 通过“激活阈值 + 基础分门槛 + 加分上限”三重约束，避免压死小众城市结果。
 */
const CITY_PRIORITY_GROUPS = Object.freeze([
  {
    groupKey: "domestic-core",
    cityNames: Object.freeze(["北京", "上海", "广州", "深圳", "杭州"]),
    bonusCap: 8,
    minBaseScore: 74,
    activationRatio: 0.56,
    dimensions: Object.freeze({
      paceFast: { direction: "high", threshold: 6.8, weight: 1.4 },
      careerTech: { direction: "high", threshold: 6.8, weight: 1.4 },
      transitPublic: { direction: "high", threshold: 6.6, weight: 1.3 },
      budgetHigh: { direction: "high", threshold: 6.2, weight: 1.1 },
      foodDiversity: { direction: "high", threshold: 6.4, weight: 1.1 },
      naturePreference: { direction: "low", threshold: 7.2, weight: 0.6 },
    }),
    cityOverrides: Object.freeze({
      上海: { bonusCap: 9, activationRatio: 0.54 },
      深圳: { minBaseScore: 73 },
    }),
  },
  {
    groupKey: "global-hot-tourism",
    cityNames: Object.freeze([
      "东京",
      "新加坡",
      "伦敦",
      "纽约",
      "巴黎",
      "悉尼",
      "巴塞罗那",
      "首尔",
      "曼谷",
      "迪拜",
      "里斯本",
      "洛杉矶",
    ]),
    bonusCap: 6,
    minBaseScore: 71,
    activationRatio: 0.52,
    dimensions: Object.freeze({
      foodDiversity: { direction: "high", threshold: 6.5, weight: 1.3 },
      transitPublic: { direction: "high", threshold: 6.0, weight: 1.0 },
      paceFast: { direction: "high", threshold: 5.5, weight: 0.9 },
      naturePreference: { direction: "high", threshold: 5.5, weight: 0.9 },
      climateWarm: { direction: "high", threshold: 4.8, weight: 0.8 },
    }),
    cityOverrides: Object.freeze({
      东京: { bonusCap: 7 },
      巴黎: { bonusCap: 7 },
    }),
  },
]);

/**
 * 维度权重兜底值：
 * 未覆盖维度保留低权重，避免“完全不计”带来的极端偏差。
 */
const MIN_DIMENSION_WEIGHT = 0.6;

/**
 * 构建城市优先级查询表：
 * 将分组配置展开成“城市名 -> 策略配置”的 O(1) 查询结构。
 * @returns {Record<string, object>} 城市优先级查询映射。
 */
function buildCityPriorityLookup() {
  return CITY_PRIORITY_GROUPS.reduce((lookupMap, groupConfig) => {
    groupConfig.cityNames.forEach((cityName) => {
      const cityOverride = groupConfig.cityOverrides?.[cityName] ?? {};
      lookupMap[cityName] = {
        groupKey: groupConfig.groupKey,
        bonusCap: Number(cityOverride.bonusCap ?? groupConfig.bonusCap),
        minBaseScore: Number(cityOverride.minBaseScore ?? groupConfig.minBaseScore),
        activationRatio: Number(
          cityOverride.activationRatio ?? groupConfig.activationRatio,
        ),
        dimensions: cityOverride.dimensions ?? groupConfig.dimensions,
      };
    });

    return lookupMap;
  }, {});
}

/**
 * 城市优先级配置查询表（只读）。
 */
const CITY_PRIORITY_LOOKUP = Object.freeze(buildCityPriorityLookup());

/**
 * 创建零向量：
 * 通过统一初始化函数避免在多个算法函数中重复创建对象结构。
 * @returns {{ [key: string]: number }} 所有维度均为 0 的对象。
 */
function createZeroVector() {
  return DIMENSION_KEYS.reduce((accumulator, dimensionKey) => {
    accumulator[dimensionKey] = 0;
    return accumulator;
  }, {});
}

/**
 * 构建问卷答案摘要：
 * 把“题目 + 选择”归档成可直接展示和传给 AI 的结构化数据。
 * @param {Array} questions 题库。
 * @param {Array<string|null>} answerIds 用户答案 ID 列表。
 * @returns {Array<object>} 答卷摘要数组。
 */
export function buildAnswerSummary(questions, answerIds) {
  return questions.map((question, questionIndex) => {
    const selectedOptionId = answerIds[questionIndex];
    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    );

    return {
      questionId: question.id,
      questionTitle: question.title,
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      weight: question.weight,
      vector: selectedOption?.vector ?? {},
    };
  });
}

/**
 * 根据答案构建用户偏好向量。
 * @param {Array} questions 题库。
 * @param {Array<string|null>} answerIds 用户答案 ID 列表。
 * @returns {{ preferenceVector: object, dimensionWeights: object }} 用户偏好向量与维度权重。
 */
export function buildPreferenceVector(questions, answerIds) {
  const dimensionWeightedSum = createZeroVector();
  const dimensionWeights = createZeroVector();

  questions.forEach((question, questionIndex) => {
    const selectedOptionId = answerIds[questionIndex];
    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    );

    if (!selectedOption) {
      return;
    }

    Object.entries(selectedOption.vector).forEach(([dimensionKey, value]) => {
      // 关键逻辑：每题权重直接参与维度累加，确保核心问题更有决定性。
      dimensionWeightedSum[dimensionKey] += value * question.weight;
      dimensionWeights[dimensionKey] += question.weight;
    });
  });

  const preferenceVector = createZeroVector();

  DIMENSION_KEYS.forEach((dimensionKey) => {
    const currentWeight = dimensionWeights[dimensionKey];
    // 若该维度没有被覆盖，回落到中性值 5，防止该维度参与比较时失真。
    preferenceVector[dimensionKey] =
      currentWeight > 0 ? dimensionWeightedSum[dimensionKey] / currentWeight : 5;
  });

  return { preferenceVector, dimensionWeights };
}

/**
 * 计算城市匹配得分。
 * @param {object} cityProfile 城市画像向量。
 * @param {object} preferenceVector 用户偏好向量。
 * @param {object} dimensionWeights 维度权重。
 * @returns {number} 匹配得分（0~100，越高越匹配）。
 */
function calculateCityScore(cityProfile, preferenceVector, dimensionWeights) {
  let weightedDistanceSquare = 0;
  let weightedMaxDistanceSquare = 0;

  DIMENSION_KEYS.forEach((dimensionKey) => {
    // 关键逻辑：维度最小权重设为 0.6，避免低覆盖维度被完全忽略。
    const weight = Math.max(dimensionWeights[dimensionKey], MIN_DIMENSION_WEIGHT);
    const gap = cityProfile[dimensionKey] - preferenceVector[dimensionKey];
    weightedDistanceSquare += weight * gap * gap;
    weightedMaxDistanceSquare += weight * 100;
  });

  const normalizedDistance =
    Math.sqrt(weightedDistanceSquare) / Math.sqrt(weightedMaxDistanceSquare);
  const score = Math.round((1 - normalizedDistance) * 100);
  return Math.min(100, Math.max(0, score));
}

/**
 * 计算城市优先级加分：
 * 1. 仅在城市命中优先级名单时生效；
 * 2. 基础分达标且标签匹配率达标才加分；
 * 3. 加分与基础分/匹配率共同相关，确保“轻推不硬锁”。
 * @param {object} params 加分参数。
 * @param {string} params.cityName 城市名。
 * @param {number} params.baseScore 城市基础分（未加优先级分）。
 * @param {object} params.cityProfile 城市画像向量。
 * @param {object} params.preferenceVector 用户偏好向量。
 * @param {object} params.dimensionWeights 维度权重。
 * @returns {number} 城市优先级加分。
 */
function calculateCityPriorityBonus({
  cityName,
  baseScore,
  cityProfile,
  preferenceVector,
  dimensionWeights,
}) {
  const cityPriorityConfig = CITY_PRIORITY_LOOKUP[cityName];
  if (!cityPriorityConfig) {
    return 0;
  }

  if (baseScore < cityPriorityConfig.minBaseScore) {
    return 0;
  }

  let matchedSignalWeight = 0;
  let totalSignalWeight = 0;

  Object.entries(cityPriorityConfig.dimensions).forEach(
    ([dimensionKey, dimensionRule]) => {
      const dimensionWeight =
        Math.max(dimensionWeights[dimensionKey], MIN_DIMENSION_WEIGHT) *
        Number(dimensionRule.weight ?? 1);
      totalSignalWeight += dimensionWeight;

      const userValue = Number(preferenceVector[dimensionKey] ?? 5);
      const cityValue = Number(cityProfile[dimensionKey] ?? 5);
      const threshold = Number(dimensionRule.threshold ?? 5);
      const direction = String(dimensionRule.direction ?? "high");

      const isDirectionMatched =
        direction === "low" ? userValue <= threshold : userValue >= threshold;
      if (!isDirectionMatched) {
        return;
      }

      const normalizedGap = Math.min(10, Math.abs(cityValue - userValue)) / 10;
      const closeness = 1 - normalizedGap;
      // 关键逻辑：只在“方向匹配 + 城市画像接近”时累计命中权重。
      matchedSignalWeight += dimensionWeight * closeness;
    },
  );

  if (totalSignalWeight <= 0) {
    return 0;
  }

  const matchedRatio = matchedSignalWeight / totalSignalWeight;
  if (matchedRatio < cityPriorityConfig.activationRatio) {
    return 0;
  }

  const baseScoreConfidence =
    (baseScore - cityPriorityConfig.minBaseScore) /
    (100 - cityPriorityConfig.minBaseScore);
  const normalizedConfidence = Math.min(1, Math.max(0, baseScoreConfidence));
  const rawBonus =
    cityPriorityConfig.bonusCap * matchedRatio * normalizedConfidence;
  const roundedBonus = Math.round(rawBonus);
  return Math.min(cityPriorityConfig.bonusCap, Math.max(0, roundedBonus));
}

/**
 * 提取“高权重且匹配好”的重点维度，用于解释结果。
 * @param {object} cityProfile 城市画像向量。
 * @param {object} preferenceVector 用户偏好向量。
 * @param {object} dimensionWeights 维度权重。
 * @returns {Array<string>} 维度中文名数组（最多 3 个）。
 */
function extractTopMatchedDimensions(
  cityProfile,
  preferenceVector,
  dimensionWeights,
) {
  return DIMENSION_KEYS.map((dimensionKey) => {
    const gap = Math.abs(cityProfile[dimensionKey] - preferenceVector[dimensionKey]);
    return {
      label: DIMENSION_LABELS[dimensionKey],
      // 关键逻辑：偏差越小、权重越高，排序值越优。
      sortScore: gap - dimensionWeights[dimensionKey] * 0.12,
    };
  })
    .sort((left, right) => left.sortScore - right.sortScore)
    .slice(0, 3)
    .map((item) => item.label);
}

/**
 * 构建本地分析解释文本。
 * @param {object} bestCity 最佳城市对象。
 * @param {object} preferenceVector 用户偏好向量。
 * @param {object} dimensionWeights 维度权重。
 * @returns {string} 文本解释。
 */
function buildLocalInsight(bestCity, preferenceVector, dimensionWeights) {
  const matchedDimensions = extractTopMatchedDimensions(
    bestCity.profile,
    preferenceVector,
    dimensionWeights,
  );

  return `${bestCity.name}与您在${matchedDimensions.join("、")}上更契合，同时在生活效率与长期居住稳定性之间表现均衡。`;
}

/**
 * 生成可读答卷摘要行。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<string>} 面向用户与 AI 的可读文本列表。
 */
export function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (item, index) => `${index + 1}. ${item.questionTitle} -> ${item.optionLabel}`,
  );
}

/**
 * 本地规则城市分析。
 * 复杂度评估：
 * 1. 构建偏好向量：O(Q * D)
 * 2. 城市评分计算（含优先级轻量加分）：O(C * D)
 * 3. 城市排序：O(C log C)
 * 总体复杂度：O(Q * D + C * D + C log C)
 * @param {object} params 分析参数对象。
 * @param {Array} params.questions 题库。
 * @param {Array<string|null>} params.answerIds 用户答案 ID 列表。
 * @param {Array<object>} params.cities 城市画像库。
 * @returns {{ topCity: object, topThree: Array<object>, scoredCities: Array<object>, preferenceVector: object, dimensionWeights: object, answerSummary: Array<object>, summaryLines: Array<string>, localInsight: string }} 本地分析结果。
 */
export function analyzeCitiesLocally({ questions, answerIds, cities }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const { preferenceVector, dimensionWeights } = buildPreferenceVector(
    questions,
    answerIds,
  );

  const scoredCities = cities
    .map((cityItem) => {
      const baseScore = calculateCityScore(
        cityItem.profile,
        preferenceVector,
        dimensionWeights,
      );
      const priorityBonus = calculateCityPriorityBonus({
        cityName: cityItem.name,
        baseScore,
        cityProfile: cityItem.profile,
        preferenceVector,
        dimensionWeights,
      });
      return {
        ...cityItem,
        baseScore,
        priorityBonus,
        // 关键逻辑：最终分由基础匹配分 + 优先级轻量加分组成，并限制在 0~100。
        score: Math.min(100, Math.max(0, baseScore + priorityBonus)),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return right.baseScore - left.baseScore;
    });

  const topCity = scoredCities[0];
  const topThree = scoredCities.slice(0, 3);
  const localInsight = buildLocalInsight(
    topCity,
    preferenceVector,
    dimensionWeights,
  );

  return {
    topCity,
    topThree,
    scoredCities,
    preferenceVector,
    dimensionWeights,
    answerSummary,
    summaryLines,
    localInsight,
  };
}
