/**
 * 隐藏天赋维度中文标签：
 * 用于输出本地叙事和维度摘要。
 */
const HIDDEN_TALENT_DIMENSION_LABELS = {
  intuition: "直觉洞察",
  patternSense: "模式识别",
  observation: "观察力",
  systemsThinking: "系统思维",
  execution: "行动落地",
  empathy: "共情感知",
  expression: "表达传递",
  creativity: "创意生成",
  persuasion: "影响说服",
  resilience: "韧性恢复",
};

/**
 * 维度字段数组。
 */
const HIDDEN_TALENT_DIMENSION_KEYS = Object.keys(
  HIDDEN_TALENT_DIMENSION_LABELS,
);

/**
 * 隐藏天赋画像库：
 * profile 与题库选项向量位于同一维度空间，便于统一评分。
 */
const TALENT_PROFILES = [
  {
    talent: "趋势洞察者",
    profile: {
      intuition: 10,
      patternSense: 10,
      observation: 8,
      systemsThinking: 7,
      execution: 6,
      empathy: 6,
      expression: 6,
      creativity: 7,
      persuasion: 6,
      resilience: 6,
    },
    trait: "你擅长在复杂信息里提前看见关键变化，是机会预判型人才。",
  },
  {
    talent: "系统架构师",
    profile: {
      intuition: 6,
      patternSense: 8,
      observation: 7,
      systemsThinking: 10,
      execution: 8,
      empathy: 5,
      expression: 7,
      creativity: 7,
      persuasion: 6,
      resilience: 8,
    },
    trait: "你能把混乱任务拆成稳定流程，适合做结构搭建与长期优化。",
  },
  {
    talent: "共情疗愈者",
    profile: {
      intuition: 8,
      patternSense: 6,
      observation: 7,
      systemsThinking: 6,
      execution: 6,
      empathy: 10,
      expression: 8,
      creativity: 7,
      persuasion: 7,
      resilience: 8,
    },
    trait: "你对情绪和关系变化非常敏感，擅长稳定团队状态与人际连接。",
  },
  {
    talent: "创意炼金师",
    profile: {
      intuition: 8,
      patternSense: 7,
      observation: 8,
      systemsThinking: 6,
      execution: 6,
      empathy: 6,
      expression: 8,
      creativity: 10,
      persuasion: 7,
      resilience: 7,
    },
    trait: "你擅长把灵感变成新体验，能够持续输出有辨识度的创意方案。",
  },
  {
    talent: "影响沟通者",
    profile: {
      intuition: 7,
      patternSense: 7,
      observation: 6,
      systemsThinking: 7,
      execution: 7,
      empathy: 7,
      expression: 10,
      creativity: 7,
      persuasion: 10,
      resilience: 6,
    },
    trait: "你能让复杂想法被快速理解并被采纳，是天然的连接与推动者。",
  },
  {
    talent: "行动破局者",
    profile: {
      intuition: 7,
      patternSense: 7,
      observation: 6,
      systemsThinking: 7,
      execution: 10,
      empathy: 6,
      expression: 7,
      creativity: 7,
      persuasion: 7,
      resilience: 9,
    },
    trait: "你在高压场景里更能出成绩，擅长先启动再迭代，推动结果落地。",
  },
  {
    talent: "审美策展人",
    profile: {
      intuition: 7,
      patternSense: 8,
      observation: 10,
      systemsThinking: 6,
      execution: 6,
      empathy: 6,
      expression: 8,
      creativity: 9,
      persuasion: 6,
      resilience: 6,
    },
    trait: "你对细节与风格有高敏感度，擅长把信息转译成更具吸引力的呈现。",
  },
  {
    talent: "稳态调度者",
    profile: {
      intuition: 6,
      patternSense: 7,
      observation: 7,
      systemsThinking: 8,
      execution: 8,
      empathy: 7,
      expression: 7,
      creativity: 6,
      persuasion: 6,
      resilience: 10,
    },
    trait: "你能稳住节奏并持续交付，长期任务中的可靠性是你的核心竞争力。",
  },
];

/**
 * 创建零向量。
 * @returns {{ [key: string]: number }} 零向量对象。
 */
function createZeroVector() {
  return HIDDEN_TALENT_DIMENSION_KEYS.reduce((accumulator, key) => {
    accumulator[key] = 0;
    return accumulator;
  }, {});
}

/**
 * 构建结构化答卷摘要。
 * @param {Array} questions 题库。
 * @param {Array<string|null>} answerIds 用户答案 ID 列表。
 * @returns {Array<object>} 答卷摘要对象数组。
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
 * 生成可读摘要文本。
 * @param {Array<object>} answerSummary 答卷摘要对象数组。
 * @returns {Array<string>} 摘要文本。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (item, index) => `${index + 1}. ${item.questionTitle} -> ${item.optionLabel}`,
  );
}

/**
 * 由答卷构建用户偏好向量。
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
      // 关键逻辑：把题目权重叠加到维度值，保证核心题影响更高。
      weightedSum[dimension] += value * question.weight;
      dimensionWeights[dimension] += question.weight;
    });
  });

  const preferenceVector = createZeroVector();
  HIDDEN_TALENT_DIMENSION_KEYS.forEach((dimension) => {
    const currentWeight = dimensionWeights[dimension];
    preferenceVector[dimension] =
      currentWeight > 0 ? weightedSum[dimension] / currentWeight : 5;
  });

  return { preferenceVector, dimensionWeights };
}

/**
 * 计算单天赋匹配分值。
 * @param {object} talentProfile 天赋画像向量。
 * @param {object} preferenceVector 用户向量。
 * @param {object} dimensionWeights 维度权重。
 * @returns {number} 匹配分值（0~100）。
 */
function calculateTalentScore(talentProfile, preferenceVector, dimensionWeights) {
  let weightedDistanceSquare = 0;
  let weightedMaxDistanceSquare = 0;

  HIDDEN_TALENT_DIMENSION_KEYS.forEach((dimension) => {
    // 关键逻辑：为弱覆盖维度设置最小权重，避免评估偏差。
    const weight = Math.max(dimensionWeights[dimension], 0.6);
    const gap = talentProfile[dimension] - preferenceVector[dimension];
    weightedDistanceSquare += weight * gap * gap;
    weightedMaxDistanceSquare += weight * 100;
  });

  const normalizedDistance =
    Math.sqrt(weightedDistanceSquare) / Math.sqrt(weightedMaxDistanceSquare);
  const score = Math.round((1 - normalizedDistance) * 100);
  return Math.max(0, Math.min(100, score));
}

/**
 * 提取用户优势维度。
 * @param {object} preferenceVector 用户偏好向量。
 * @returns {Array<string>} 中文维度标签（最多 3 项）。
 */
function extractTopDimensions(preferenceVector) {
  return HIDDEN_TALENT_DIMENSION_KEYS.map((dimension) => ({
    label: HIDDEN_TALENT_DIMENSION_LABELS[dimension],
    value: preferenceVector[dimension],
  }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 3)
    .map((item) => item.label);
}

/**
 * 构建本地叙事文本。
 * @param {object} topTalent 主天赋对象。
 * @param {object} preferenceVector 用户偏好向量。
 * @returns {string} 本地结论文本。
 */
function buildLocalNarrative(topTalent, preferenceVector) {
  const topDimensions = extractTopDimensions(preferenceVector);
  return `你的隐藏天赋更接近“${topTalent.talent}”，因为你在${topDimensions.join("、")}上表现更突出。${topTalent.trait}`;
}

/**
 * 隐藏天赋本地分析。
 * 复杂度评估：
 * 1. 用户向量构建：O(Q * D)
 * 2. 天赋评分：O(T * D)
 * 3. 排序：O(T log T)
 * 总体复杂度：O(Q * D + T * D + T log T)
 * @param {object} params 参数对象。
 * @param {Array} params.questions 题库。
 * @param {Array<string|null>} params.answerIds 用户答案列表。
 * @returns {{ topTalent: object, topThree: Array<object>, scoredTalents: Array<object>, preferenceVector: object, dimensionWeights: object, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string }} 本地分析结果。
 */
export function analyzeHiddenTalentLocally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const { preferenceVector, dimensionWeights } = buildPreferenceVector(
    questions,
    answerIds,
  );

  const scoredTalents = TALENT_PROFILES.map((talentItem) => ({
    ...talentItem,
    score: calculateTalentScore(
      talentItem.profile,
      preferenceVector,
      dimensionWeights,
    ),
  })).sort((left, right) => right.score - left.score);

  const topTalent = scoredTalents[0];
  const topThree = scoredTalents.slice(0, 3);
  const localNarrative = buildLocalNarrative(topTalent, preferenceVector);

  return {
    topTalent,
    topThree,
    scoredTalents,
    preferenceVector,
    dimensionWeights,
    answerSummary,
    summaryLines,
    localNarrative,
  };
}
