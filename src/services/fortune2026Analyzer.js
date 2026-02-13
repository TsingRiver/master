/**
 * 转运维度中文标签：
 * 用于本地解释文案和答卷展示。
 */
const FORTUNE_DIMENSION_LABELS = {
  discipline: "执行纪律",
  execution: "落地速度",
  clarity: "决策清晰度",
  vision: "机会视野",
  opportunitySense: "机会感知",
  network: "连接能力",
  expression: "表达协同",
  recovery: "恢复能力",
  emotionalStability: "情绪稳定度",
  courage: "行动勇气",
  riskControl: "风险控制",
  growth: "成长投入",
};

/**
 * 维度字段数组。
 */
const FORTUNE_DIMENSION_KEYS = Object.keys(FORTUNE_DIMENSION_LABELS);

/**
 * 关键词画像库：
 * profile 使用同一维度空间，便于统一匹配评分。
 */
const KEYWORD_PROFILES = [
  {
    keyword: "破局",
    profile: {
      discipline: 7,
      execution: 10,
      clarity: 7,
      vision: 8,
      opportunitySense: 9,
      network: 6,
      expression: 7,
      recovery: 5,
      emotionalStability: 6,
      courage: 10,
      riskControl: 5,
      growth: 7,
    },
    meaning: "先行动再修正，2026 的机会会在“启动后”出现。",
  },
  {
    keyword: "聚焦",
    profile: {
      discipline: 10,
      execution: 8,
      clarity: 10,
      vision: 6,
      opportunitySense: 6,
      network: 5,
      expression: 6,
      recovery: 6,
      emotionalStability: 7,
      courage: 6,
      riskControl: 8,
      growth: 8,
    },
    meaning: "减少分散投入，把资源集中到一个主战场更容易转运。",
  },
  {
    keyword: "链接",
    profile: {
      discipline: 6,
      execution: 7,
      clarity: 7,
      vision: 8,
      opportunitySense: 8,
      network: 10,
      expression: 9,
      recovery: 6,
      emotionalStability: 7,
      courage: 7,
      riskControl: 6,
      growth: 7,
    },
    meaning: "贵人和协作机会是你的放大器，关系经营会带来关键转折。",
  },
  {
    keyword: "复利",
    profile: {
      discipline: 9,
      execution: 7,
      clarity: 8,
      vision: 7,
      opportunitySense: 7,
      network: 6,
      expression: 6,
      recovery: 7,
      emotionalStability: 8,
      courage: 6,
      riskControl: 9,
      growth: 9,
    },
    meaning: "稳定积累会在 2026 下半年显化，关键是连续性而非爆发。",
  },
  {
    keyword: "出圈",
    profile: {
      discipline: 6,
      execution: 8,
      clarity: 6,
      vision: 10,
      opportunitySense: 9,
      network: 9,
      expression: 10,
      recovery: 5,
      emotionalStability: 6,
      courage: 8,
      riskControl: 5,
      growth: 7,
    },
    meaning: "曝光度和表达力将决定你的增量，主动展示会带来新机会。",
  },
  {
    keyword: "稳场",
    profile: {
      discipline: 8,
      execution: 6,
      clarity: 8,
      vision: 6,
      opportunitySense: 6,
      network: 7,
      expression: 6,
      recovery: 9,
      emotionalStability: 10,
      courage: 5,
      riskControl: 10,
      growth: 7,
    },
    meaning: "先稳状态再提速度，你的好运来自高质量、低波动的节奏。",
  },
  {
    keyword: "提速",
    profile: {
      discipline: 7,
      execution: 10,
      clarity: 7,
      vision: 7,
      opportunitySense: 8,
      network: 6,
      expression: 7,
      recovery: 5,
      emotionalStability: 5,
      courage: 9,
      riskControl: 6,
      growth: 8,
    },
    meaning: "减少犹豫和内耗，你的关键收益点在于“更快交付”。",
  },
  {
    keyword: "蓄能",
    profile: {
      discipline: 7,
      execution: 5,
      clarity: 8,
      vision: 6,
      opportunitySense: 6,
      network: 6,
      expression: 5,
      recovery: 10,
      emotionalStability: 9,
      courage: 5,
      riskControl: 8,
      growth: 7,
    },
    meaning: "转运不是硬冲，而是先把能量场调到稳定可持续状态。",
  },
];

/**
 * 创建零向量。
 * @returns {{ [key: string]: number }} 零向量对象。
 */
function createZeroVector() {
  return FORTUNE_DIMENSION_KEYS.reduce((accumulator, key) => {
    accumulator[key] = 0;
    return accumulator;
  }, {});
}

/**
 * 构建答卷摘要。
 * @param {Array} questions 题库。
 * @param {Array<string|null>} answerIds 用户答案 ID 列表。
 * @returns {Array<object>} 结构化答卷摘要。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((question, questionIndex) => {
    const selectedOption = question.options.find(
      (option) => option.id === answerIds[questionIndex],
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
 * 将答卷摘要转为可读文本。
 * @param {Array<object>} answerSummary 答卷摘要。
 * @returns {Array<string>} 摘要文本数组。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (item, index) => `${index + 1}. ${item.questionTitle} -> ${item.optionLabel}`,
  );
}

/**
 * 由答卷构建用户向量。
 * @param {Array} questions 题库。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {{ preferenceVector: object, dimensionWeights: object }} 偏好向量与维度权重。
 */
function buildPreferenceVector(questions, answerIds) {
  const weightedSum = createZeroVector();
  const dimensionWeights = createZeroVector();

  questions.forEach((question, questionIndex) => {
    const selectedOption = question.options.find(
      (option) => option.id === answerIds[questionIndex],
    );

    if (!selectedOption) {
      return;
    }

    Object.entries(selectedOption.vector).forEach(([dimension, value]) => {
      // 关键逻辑：把题目权重乘到维度值，强化关键题目的影响力。
      weightedSum[dimension] += value * question.weight;
      dimensionWeights[dimension] += question.weight;
    });
  });

  const preferenceVector = createZeroVector();
  FORTUNE_DIMENSION_KEYS.forEach((dimension) => {
    const currentWeight = dimensionWeights[dimension];
    preferenceVector[dimension] =
      currentWeight > 0 ? weightedSum[dimension] / currentWeight : 5;
  });

  return { preferenceVector, dimensionWeights };
}

/**
 * 计算关键词匹配分值。
 * @param {object} keywordProfile 关键词画像向量。
 * @param {object} preferenceVector 用户向量。
 * @param {object} dimensionWeights 维度权重。
 * @returns {number} 匹配分值（0~100）。
 */
function calculateKeywordScore(keywordProfile, preferenceVector, dimensionWeights) {
  let weightedDistanceSquare = 0;
  let weightedMaxDistanceSquare = 0;

  FORTUNE_DIMENSION_KEYS.forEach((dimension) => {
    // 关键逻辑：保留最小权重，避免弱覆盖维度被完全忽略。
    const weight = Math.max(dimensionWeights[dimension], 0.6);
    const gap = keywordProfile[dimension] - preferenceVector[dimension];
    weightedDistanceSquare += weight * gap * gap;
    weightedMaxDistanceSquare += weight * 100;
  });

  const normalizedDistance =
    Math.sqrt(weightedDistanceSquare) / Math.sqrt(weightedMaxDistanceSquare);
  const score = Math.round((1 - normalizedDistance) * 100);
  return Math.max(0, Math.min(100, score));
}

/**
 * 提取用户最强维度。
 * @param {object} preferenceVector 用户向量。
 * @returns {Array<string>} 维度中文标签（最多 3 个）。
 */
function extractTopDimensions(preferenceVector) {
  return FORTUNE_DIMENSION_KEYS.map((dimension) => ({
    label: FORTUNE_DIMENSION_LABELS[dimension],
    value: preferenceVector[dimension],
  }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 3)
    .map((item) => item.label);
}

/**
 * 构建本地说明文本。
 * @param {object} topKeyword 主关键词对象。
 * @param {object} preferenceVector 用户向量。
 * @returns {string} 本地说明。
 */
function buildLocalNarrative(topKeyword, preferenceVector) {
  const topDimensions = extractTopDimensions(preferenceVector);
  return `你的 2026 主轴更偏向“${topKeyword.keyword}”，因为你在${topDimensions.join("、")}方面势能更强。${topKeyword.meaning}`;
}

/**
 * 2026 转运关键词本地分析。
 * 复杂度评估：
 * 1. 用户向量构建：O(Q * D)
 * 2. 关键词评分：O(K * D)
 * 3. 排序：O(K log K)
 * 总体复杂度：O(Q * D + K * D + K log K)
 * @param {object} params 参数对象。
 * @param {Array} params.questions 题库。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @returns {{ topKeyword: object, topThree: Array<object>, scoredKeywords: Array<object>, preferenceVector: object, dimensionWeights: object, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string }} 本地分析结果。
 */
export function analyzeFortune2026Locally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const { preferenceVector, dimensionWeights } = buildPreferenceVector(
    questions,
    answerIds,
  );

  const scoredKeywords = KEYWORD_PROFILES.map((keywordItem) => ({
    ...keywordItem,
    score: calculateKeywordScore(
      keywordItem.profile,
      preferenceVector,
      dimensionWeights,
    ),
  })).sort((left, right) => right.score - left.score);

  const topKeyword = scoredKeywords[0];
  const topThree = scoredKeywords.slice(0, 3);
  const localNarrative = buildLocalNarrative(topKeyword, preferenceVector);

  return {
    topKeyword,
    topThree,
    scoredKeywords,
    preferenceVector,
    dimensionWeights,
    answerSummary,
    summaryLines,
    localNarrative,
  };
}
