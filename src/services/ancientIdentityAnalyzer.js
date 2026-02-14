/**
 * 古代身份维度标签。
 */
const ANCIENT_DIMENSION_LABELS = {
  wisdom: "谋略判断",
  leadership: "统筹号召",
  courage: "临场胆识",
  scholarship: "学识底蕴",
  diplomacy: "周旋协调",
  craftsmanship: "匠作落地",
  healing: "仁心济世",
  tradeSense: "经营盘活",
  mobility: "机动应变",
  discipline: "秩序执行",
};

/**
 * 维度字段数组。
 */
const ANCIENT_DIMENSION_KEYS = Object.keys(ANCIENT_DIMENSION_LABELS);

/**
 * 古代身份画像库。
 */
const IDENTITY_PROFILES = [
  {
    identity: "中枢谋士",
    profile: {
      wisdom: 10,
      leadership: 8,
      courage: 6,
      scholarship: 9,
      diplomacy: 8,
      craftsmanship: 4,
      healing: 4,
      tradeSense: 6,
      mobility: 6,
      discipline: 8,
    },
    archetype: "善于定势与破局，擅长在复杂局面中做关键判断。",
  },
  {
    identity: "边关将领",
    profile: {
      wisdom: 7,
      leadership: 10,
      courage: 10,
      scholarship: 5,
      diplomacy: 5,
      craftsmanship: 6,
      healing: 4,
      tradeSense: 4,
      mobility: 9,
      discipline: 8,
    },
    archetype: "遇险不退，能稳军心、带队伍，是高压场景中的核心人物。",
  },
  {
    identity: "行商掌柜",
    profile: {
      wisdom: 7,
      leadership: 6,
      courage: 6,
      scholarship: 5,
      diplomacy: 9,
      craftsmanship: 5,
      healing: 4,
      tradeSense: 10,
      mobility: 8,
      discipline: 7,
    },
    archetype: "对流通与价值极敏感，能把零散资源变成持续收益。",
  },
  {
    identity: "工部巧匠",
    profile: {
      wisdom: 6,
      leadership: 6,
      courage: 6,
      scholarship: 6,
      diplomacy: 4,
      craftsmanship: 10,
      healing: 4,
      tradeSense: 5,
      mobility: 6,
      discipline: 8,
    },
    archetype: "擅长把抽象问题变成可用成果，重实效与可靠性。",
  },
  {
    identity: "太医院医官",
    profile: {
      wisdom: 7,
      leadership: 6,
      courage: 6,
      scholarship: 8,
      diplomacy: 7,
      craftsmanship: 5,
      healing: 10,
      tradeSense: 4,
      mobility: 6,
      discipline: 8,
    },
    archetype: "以仁心和专业稳定局势，是团队中的安全感来源。",
  },
  {
    identity: "书院先生",
    profile: {
      wisdom: 9,
      leadership: 6,
      courage: 5,
      scholarship: 10,
      diplomacy: 6,
      craftsmanship: 4,
      healing: 6,
      tradeSense: 4,
      mobility: 5,
      discipline: 8,
    },
    archetype: "擅长沉淀方法与传承体系，长于长期影响力建设。",
  },
  {
    identity: "江湖游侠",
    profile: {
      wisdom: 6,
      leadership: 6,
      courage: 9,
      scholarship: 4,
      diplomacy: 7,
      craftsmanship: 6,
      healing: 5,
      tradeSense: 5,
      mobility: 10,
      discipline: 5,
    },
    archetype: "适应性强、行动果断，在变化中更容易找到机会。",
  },
  {
    identity: "钦天史官",
    profile: {
      wisdom: 9,
      leadership: 5,
      courage: 4,
      scholarship: 9,
      diplomacy: 5,
      craftsmanship: 6,
      healing: 4,
      tradeSense: 4,
      mobility: 5,
      discipline: 9,
    },
    archetype: "擅长观察规律和长期趋势，判断稳健且耐心。",
  },
];

/**
 * 创建零向量。
 * @returns {{ [key: string]: number }} 零向量对象。
 */
function createZeroVector() {
  return ANCIENT_DIMENSION_KEYS.reduce((accumulator, key) => {
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
 * 把答卷摘要转为可读文本。
 * @param {Array<object>} answerSummary 答卷摘要。
 * @returns {Array<string>} 摘要文本数组。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (item, index) => `${index + 1}. ${item.questionTitle} -> ${item.optionLabel}`,
  );
}

/**
 * 构建用户偏好向量。
 * @param {Array} questions 题库。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {{ preferenceVector: object, dimensionWeights: object }} 用户向量与维度权重。
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
      // 关键逻辑：题目权重参与计算，保证核心题的影响更大。
      weightedSum[dimension] += value * question.weight;
      dimensionWeights[dimension] += question.weight;
    });
  });

  const preferenceVector = createZeroVector();
  ANCIENT_DIMENSION_KEYS.forEach((dimension) => {
    const currentWeight = dimensionWeights[dimension];
    preferenceVector[dimension] =
      currentWeight > 0 ? weightedSum[dimension] / currentWeight : 5;
  });

  return { preferenceVector, dimensionWeights };
}

/**
 * 计算单身份匹配得分。
 * @param {object} identityProfile 身份画像向量。
 * @param {object} preferenceVector 用户向量。
 * @param {object} dimensionWeights 维度权重。
 * @returns {number} 匹配分值（0~100）。
 */
function calculateIdentityScore(
  identityProfile,
  preferenceVector,
  dimensionWeights,
) {
  let weightedDistanceSquare = 0;
  let weightedMaxDistanceSquare = 0;

  ANCIENT_DIMENSION_KEYS.forEach((dimension) => {
    // 关键逻辑：维度权重设置最小值，避免弱覆盖维度被完全忽略。
    const weight = Math.max(dimensionWeights[dimension], 0.6);
    const gap = identityProfile[dimension] - preferenceVector[dimension];
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
  return ANCIENT_DIMENSION_KEYS.map((dimension) => ({
    label: ANCIENT_DIMENSION_LABELS[dimension],
    value: preferenceVector[dimension],
  }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 3)
    .map((item) => item.label);
}

/**
 * 构建本地结论文本。
 * @param {object} topIdentity 主身份对象。
 * @param {object} preferenceVector 用户向量。
 * @returns {string} 本地结论。
 */
function buildLocalNarrative(topIdentity, preferenceVector) {
  const topDimensions = extractTopDimensions(preferenceVector);
  return `你的古代身份更接近“${topIdentity.identity}”，因为你在${topDimensions.join("、")}上优势更明显。${topIdentity.archetype}`;
}

/**
 * 古代身份本地分析。
 * 复杂度评估：
 * 1. 用户向量构建：O(Q * D)
 * 2. 身份评分：O(I * D)
 * 3. 排序：O(I log I)
 * 总体复杂度：O(Q * D + I * D + I log I)
 * @param {object} params 参数对象。
 * @param {Array} params.questions 题库。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @returns {{ topIdentity: object, topThree: Array<object>, scoredIdentities: Array<object>, preferenceVector: object, dimensionWeights: object, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string }} 本地分析结果。
 */
export function analyzeAncientIdentityLocally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const { preferenceVector, dimensionWeights } = buildPreferenceVector(
    questions,
    answerIds,
  );

  const scoredIdentities = IDENTITY_PROFILES.map((identityItem) => ({
    ...identityItem,
    score: calculateIdentityScore(
      identityItem.profile,
      preferenceVector,
      dimensionWeights,
    ),
  })).sort((left, right) => right.score - left.score);

  const topIdentity = scoredIdentities[0];
  const topThree = scoredIdentities.slice(0, 3);
  const localNarrative = buildLocalNarrative(topIdentity, preferenceVector);

  return {
    topIdentity,
    topThree,
    scoredIdentities,
    preferenceVector,
    dimensionWeights,
    answerSummary,
    summaryLines,
    localNarrative,
  };
}
