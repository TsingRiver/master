import { DIMENSION_KEYS, DIMENSION_LABELS } from "../constants/dimensions";

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
    const weight = Math.max(dimensionWeights[dimensionKey], 0.6);
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
 * 2. 城市评分计算：O(C * D)
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
    .map((cityItem) => ({
      ...cityItem,
      score: calculateCityScore(
        cityItem.profile,
        preferenceVector,
        dimensionWeights,
      ),
    }))
    .sort((left, right) => right.score - left.score);

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
