/**
 * 贵人星座维度中文标签：
 * 用于输出本地叙事、维度摘要与结果解释。
 */
const BENEFACTOR_DIMENSION_LABELS = {
  action: "行动节奏",
  social: "社交协同",
  empathy: "共情承接",
  reason: "理性判断",
  stability: "稳定执行",
  exploration: "探索意愿",
  expression: "表达张力",
  support: "支持力度",
};

/**
 * 维度字段数组。
 */
const BENEFACTOR_DIMENSION_KEYS = Object.keys(BENEFACTOR_DIMENSION_LABELS);

/**
 * 贵人星座画像库：
 * profile 与题库选项向量处于同一维度空间，便于统一匹配评分。
 */
const BENEFACTOR_SIGN_PROFILES = [
  {
    sign: "白羊座",
    code: "ARIES",
    profile: {
      action: 10,
      social: 7,
      empathy: 5,
      reason: 5,
      stability: 4,
      exploration: 9,
      expression: 8,
      support: 5,
    },
    supportStyle: "关键时刻敢推你一把，帮助你把想法快速落地。",
  },
  {
    sign: "金牛座",
    code: "TAURUS",
    profile: {
      action: 5,
      social: 5,
      empathy: 6,
      reason: 8,
      stability: 10,
      exploration: 3,
      expression: 4,
      support: 8,
    },
    supportStyle: "擅长提供稳定资源和长期支持，让你少走弯路。",
  },
  {
    sign: "双子座",
    code: "GEMINI",
    profile: {
      action: 7,
      social: 10,
      empathy: 6,
      reason: 7,
      stability: 4,
      exploration: 8,
      expression: 10,
      support: 5,
    },
    supportStyle: "信息面广、反应快，常能给你带来关键机会线索。",
  },
  {
    sign: "巨蟹座",
    code: "CANCER",
    profile: {
      action: 4,
      social: 6,
      empathy: 10,
      reason: 5,
      stability: 7,
      exploration: 4,
      expression: 7,
      support: 10,
    },
    supportStyle: "在你压力高时很会托住情绪和节奏，提供安全感。",
  },
  {
    sign: "狮子座",
    code: "LEO",
    profile: {
      action: 9,
      social: 9,
      empathy: 6,
      reason: 6,
      stability: 5,
      exploration: 7,
      expression: 9,
      support: 6,
    },
    supportStyle: "会在公开场合为你站台，帮你放大影响力。",
  },
  {
    sign: "处女座",
    code: "VIRGO",
    profile: {
      action: 6,
      social: 5,
      empathy: 6,
      reason: 10,
      stability: 9,
      exploration: 4,
      expression: 5,
      support: 7,
    },
    supportStyle: "擅长补细节与查漏补缺，帮你把结果做扎实。",
  },
  {
    sign: "天秤座",
    code: "LIBRA",
    profile: {
      action: 6,
      social: 9,
      empathy: 8,
      reason: 7,
      stability: 6,
      exploration: 6,
      expression: 8,
      support: 8,
    },
    supportStyle: "擅长协调关系和资源，能帮你减少人际摩擦成本。",
  },
  {
    sign: "天蝎座",
    code: "SCORPIO",
    profile: {
      action: 7,
      social: 5,
      empathy: 9,
      reason: 8,
      stability: 6,
      exploration: 6,
      expression: 7,
      support: 6,
    },
    supportStyle: "洞察深、判断准，常在关键节点给你定向建议。",
  },
  {
    sign: "射手座",
    code: "SAGITTARIUS",
    profile: {
      action: 8,
      social: 8,
      empathy: 5,
      reason: 6,
      stability: 3,
      exploration: 10,
      expression: 8,
      support: 4,
    },
    supportStyle: "会为你打开视野和新路径，带来外部增量机会。",
  },
  {
    sign: "摩羯座",
    code: "CAPRICORN",
    profile: {
      action: 7,
      social: 4,
      empathy: 5,
      reason: 9,
      stability: 10,
      exploration: 3,
      expression: 4,
      support: 7,
    },
    supportStyle: "擅长目标拆解与长期推进，帮你稳住主线节奏。",
  },
  {
    sign: "水瓶座",
    code: "AQUARIUS",
    profile: {
      action: 7,
      social: 7,
      empathy: 5,
      reason: 8,
      stability: 5,
      exploration: 8,
      expression: 9,
      support: 5,
    },
    supportStyle: "创意与策略兼具，常帮你找到非标准解法。",
  },
  {
    sign: "双鱼座",
    code: "PISCES",
    profile: {
      action: 4,
      social: 7,
      empathy: 10,
      reason: 4,
      stability: 4,
      exploration: 7,
      expression: 8,
      support: 9,
    },
    supportStyle: "共情与灵感很强，能在你低谷期给到温柔支持。",
  },
];

/**
 * 创建零向量。
 * @returns {{ [key: string]: number }} 零向量对象。
 */
function createZeroVector() {
  return BENEFACTOR_DIMENSION_KEYS.reduce((accumulator, dimensionKey) => {
    accumulator[dimensionKey] = 0;
    return accumulator;
  }, {});
}

/**
 * 构建结构化答卷摘要。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案 ID 列表。
 * @returns {Array<object>} 答卷摘要对象数组。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    return {
      questionId: questionItem.id,
      questionTitle: questionItem.title,
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      weight: Number(questionItem.weight ?? 1),
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
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 由答卷构建用户偏好向量。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案列表。
 * @returns {{ preferenceVector: object, dimensionWeights: object }} 偏好向量与维度权重。
 */
function buildPreferenceVector(questions, answerIds) {
  const weightedSum = createZeroVector();
  const dimensionWeights = createZeroVector();

  questions.forEach((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    if (!selectedOption) {
      return;
    }

    Object.entries(selectedOption.vector).forEach(([dimensionKey, dimensionValue]) => {
      const value = Number(dimensionValue ?? 0);
      if (!Number.isFinite(value)) {
        return;
      }

      const questionWeight = Number(questionItem.weight ?? 1);

      // 关键逻辑：向量值叠加题目权重，确保关键题影响力更高。
      weightedSum[dimensionKey] += value * questionWeight;
      dimensionWeights[dimensionKey] += questionWeight;
    });
  });

  const preferenceVector = createZeroVector();
  BENEFACTOR_DIMENSION_KEYS.forEach((dimensionKey) => {
    const currentWeight = dimensionWeights[dimensionKey];
    preferenceVector[dimensionKey] =
      currentWeight > 0 ? weightedSum[dimensionKey] / currentWeight : 5;
  });

  return { preferenceVector, dimensionWeights };
}

/**
 * 计算单星座匹配分值。
 * @param {object} signProfile 星座画像向量。
 * @param {object} preferenceVector 用户偏好向量。
 * @param {object} dimensionWeights 维度权重。
 * @returns {number} 匹配分值（0~100）。
 */
function calculateSignScore(signProfile, preferenceVector, dimensionWeights) {
  let weightedDistanceSquare = 0;
  let weightedMaxDistanceSquare = 0;

  BENEFACTOR_DIMENSION_KEYS.forEach((dimensionKey) => {
    // 关键逻辑：设置最小权重，避免弱覆盖维度被完全忽略。
    const weight = Math.max(Number(dimensionWeights[dimensionKey] ?? 0), 0.6);
    const gap = Number(signProfile[dimensionKey] ?? 0) - Number(preferenceVector[dimensionKey] ?? 0);
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
  return BENEFACTOR_DIMENSION_KEYS.map((dimensionKey) => ({
    label: BENEFACTOR_DIMENSION_LABELS[dimensionKey],
    value: Number(preferenceVector[dimensionKey] ?? 0),
  }))
    .sort((leftItem, rightItem) => rightItem.value - leftItem.value)
    .slice(0, 3)
    .map((item) => item.label);
}

/**
 * 构建本地叙事文本。
 * @param {object} topSign 主匹配星座对象。
 * @param {object} preferenceVector 用户偏好向量。
 * @returns {string} 本地结论文本。
 */
function buildLocalNarrative(topSign, preferenceVector) {
  const topDimensions = extractTopDimensions(preferenceVector);
  return `2026 年与你最容易形成“贵人同频”的星座是「${topSign.sign}」。你在${topDimensions.join("、")}上与该星座的支持方式更契合。${topSign.supportStyle}`;
}

/**
 * 2026 贵人星座本地分析。
 * 复杂度评估：
 * 1. 用户向量构建：O(Q * D)
 * 2. 星座评分：O(S * D)
 * 3. 排序：O(S log S)
 * 总体复杂度：O(Q * D + S * D + S log S)
 * 其中：
 * Q 为题量（本项目单轮 10~15 题），D 为维度数量（8），S 为星座数量（12）。
 * @param {object} params 参数对象。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案列表。
 * @returns {{ topSign: object, topThree: Array<object>, scoredSigns: Array<object>, preferenceVector: object, dimensionWeights: object, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string }} 本地分析结果。
 */
export function analyzeBenefactor2026Locally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const { preferenceVector, dimensionWeights } = buildPreferenceVector(
    questions,
    answerIds,
  );

  const scoredSigns = BENEFACTOR_SIGN_PROFILES.map((signItem) => ({
    ...signItem,
    score: calculateSignScore(signItem.profile, preferenceVector, dimensionWeights),
  })).sort((leftItem, rightItem) => rightItem.score - leftItem.score);

  const topSign = scoredSigns[0];
  const topThree = scoredSigns.slice(0, 3);

  return {
    topSign,
    topThree,
    scoredSigns,
    preferenceVector,
    dimensionWeights,
    answerSummary,
    summaryLines,
    localNarrative: buildLocalNarrative(topSign, preferenceVector),
  };
}
