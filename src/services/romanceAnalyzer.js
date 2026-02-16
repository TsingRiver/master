/**
 * 浪漫维度定义：
 * 1. ritualSense：仪式感。
 * 2. empathyPower：共情力。
 * 3. creativeSpark：创造力。
 * 4. practicalCommitment：务实度。
 */
export const ROMANCE_DIMENSION_CONFIG = {
  ritualSense: {
    label: "仪式感",
    color: "#E88AA8",
  },
  empathyPower: {
    label: "共情力",
    color: "#9D88D8",
  },
  creativeSpark: {
    label: "创造力",
    color: "#6F9DEB",
  },
  practicalCommitment: {
    label: "务实度",
    color: "#75BFA1",
  },
};

/**
 * 宿命解锁默认参数。
 */
export const ROMANCE_DESTINY_GATE_DEFAULTS = {
  gateQuestionNumber: 13,
  thresholdPercent: 80,
};

/**
 * 维度键列表。
 */
const ROMANCE_DIMENSION_KEYS = Object.keys(ROMANCE_DIMENSION_CONFIG);

/**
 * 宿命结局配置：
 * 1. `locked`：止步 13 题（遗憾美）。
 * 2. `unlocked`：突破后解锁 14 题（圆满结局）。
 */
const ROMANCE_DESTINY_OUTCOME_CONFIG = {
  locked: {
    key: "locked",
    title: "理智的遗憾收藏家",
    posterQuote: "有时候，遗憾也是一种美。",
    insight:
      "你的理性保护了你，也让你停在了第 13 章。你不是不懂爱，而是更懂得代价。",
    highlightTitle: "遗憾美结局",
    highlightContent:
      "有时候，遗憾也是一种美。你的理性保护了你，也让你停在了第 13 章。—— 故事至此终结。",
    tags: ["理智清醒", "边界感", "遗憾之美"],
    avoidSignals: [
      "过度评估风险，让真实情感长期处于“待确认”状态。",
      "把“理性”当作唯一标准，错过关系升温窗口。",
    ],
    visualKey: "city-night",
  },
  unlocked: {
    key: "unlocked",
    title: "打破宿命的极致浪漫信徒",
    posterQuote: "你的坚定，为你赢得了第 14 次机会。",
    insight:
      "你在关键时刻选择了坚定，完成了对“得失计算”的反叛。你是会为爱打破规则的人。",
    highlightTitle: "圆满突破结局",
    highlightContent:
      "检测到过量浪漫因子。你跨过了第 13 章的分水岭，成功解锁第 14 次机会。",
    tags: ["天选浪漫", "极致坚定", "打破规则"],
    avoidSignals: [
      "只靠情绪冲锋，忽略长期关系中的现实协同。",
      "把“坚定”误用为“控制”，削弱关系中的平等感。",
    ],
    visualKey: "starlight",
  },
};

/**
 * 每个维度的成长动作建议库。
 */
const ROMANCE_DIMENSION_ACTIONS = {
  ritualSense: [
    "每周固定一个“只属于你们”的小仪式，比如散步或夜聊。",
    "把重要日子提前写入日程，并准备一句专属表达。",
  ],
  empathyPower: [
    "沟通时先复述对方感受，再表达自己的需求。",
    "每周一次“情绪校准”，确认彼此最近最在意的事。",
  ],
  creativeSpark: [
    "每月设计一次“低成本新体验”，打破关系惯性。",
    "用你们的共同记忆做成小物，让情感有可见载体。",
  ],
  practicalCommitment: [
    "把“想和你长久”拆解成可执行计划并持续跟进。",
    "在忙碌周期提前沟通支持方式，减少误解与内耗。",
  ],
};

/**
 * 创建零向量，避免重复书写对象初始化逻辑。
 * @returns {{ [key: string]: number }} 维度值均为 0 的对象。
 */
function createZeroVector() {
  return ROMANCE_DIMENSION_KEYS.reduce((accumulator, dimensionKey) => {
    accumulator[dimensionKey] = 0;
    return accumulator;
  }, {});
}

/**
 * 限制分值到 [0, 100] 区间。
 * @param {number} score 原始分值。
 * @returns {number} 合法分值。
 */
function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 规范化信念分值（允许 0~10）。
 * @param {number} rawWeight 原始分值。
 * @returns {number} 合法信念分值。
 */
function normalizeBeliefWeight(rawWeight) {
  const safeWeight = Number(rawWeight ?? 0);
  if (!Number.isFinite(safeWeight)) {
    return 0;
  }

  return Math.max(0, Math.min(10, safeWeight));
}

/**
 * 构建答卷摘要。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 答案列表。
 * @returns {Array<object>} 结构化答卷摘要。
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
      beliefWeight: selectedOption ? resolveBeliefWeight(selectedOption) : 0,
    };
  });
}

/**
 * 构建答卷可读摘要文本。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<string>} 文本摘要。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 计算 4 维度原始分值与维度权重。
 * 复杂度评估：O(Q * D)
 * Q 为题量，D 为维度数（固定 4）。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 答案列表。
 * @returns {{ weightedSum: object, dimensionWeights: object }} 原始加权结果。
 */
function buildDimensionWeightedScore(questions, answerIds) {
  const weightedSum = createZeroVector();
  const dimensionWeights = createZeroVector();

  questions.forEach((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );
    if (!selectedOption) {
      return;
    }

    const questionWeight = Number(questionItem.weight ?? 1);
    Object.entries(selectedOption.vector ?? {}).forEach(([dimensionKey, rawValue]) => {
      if (typeof weightedSum[dimensionKey] !== "number") {
        return;
      }

      const safeValue = Number(rawValue ?? 0);
      if (!Number.isFinite(safeValue)) {
        return;
      }

      // 关键逻辑：题目权重直接参与维度累计，让关键题影响更高。
      weightedSum[dimensionKey] += safeValue * questionWeight;
      dimensionWeights[dimensionKey] += questionWeight;
    });
  });

  return { weightedSum, dimensionWeights };
}

/**
 * 归一化维度分值并构建可展示列表。
 * @param {{ weightedSum: object, dimensionWeights: object }} params 原始加权结果。
 * @returns {{ scoreMap: object, dimensionList: Array<object> }} 归一化结果。
 */
function buildNormalizedDimensionScore({ weightedSum, dimensionWeights }) {
  const scoreMap = createZeroVector();

  ROMANCE_DIMENSION_KEYS.forEach((dimensionKey) => {
    const currentWeight = Number(dimensionWeights[dimensionKey] ?? 0);
    const normalizedTenScale =
      currentWeight > 0 ? Number(weightedSum[dimensionKey] ?? 0) / currentWeight : 5;
    scoreMap[dimensionKey] = clampScore(normalizedTenScale * 10);
  });

  const dimensionList = ROMANCE_DIMENSION_KEYS.map((dimensionKey) => ({
    key: dimensionKey,
    label: ROMANCE_DIMENSION_CONFIG[dimensionKey].label,
    color: ROMANCE_DIMENSION_CONFIG[dimensionKey].color,
    score: scoreMap[dimensionKey],
  })).sort((leftItem, rightItem) => {
    const scoreDiff = rightItem.score - leftItem.score;
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return String(leftItem.key).localeCompare(String(rightItem.key), "zh-Hans-CN");
  });

  return { scoreMap, dimensionList };
}

/**
 * 从选项向量推导信念分（仅在未显式配置 beliefWeight 时使用）。
 * 规则说明：
 * 1. 高仪式感 / 高共情 / 高创造力会提升信念分。
 * 2. 过高“务实度”会拉低信念分（并非负面，只是更偏现实策略）。
 * @param {object} vector 选项维度向量。
 * @returns {number} 0~2 的推导分值。
 */
function inferBeliefWeightFromVector(vector) {
  const ritualSense = Number(vector?.ritualSense ?? 5);
  const empathyPower = Number(vector?.empathyPower ?? 5);
  const creativeSpark = Number(vector?.creativeSpark ?? 5);
  const practicalCommitment = Number(vector?.practicalCommitment ?? 5);

  const romanticDrive =
    ritualSense * 0.38 + empathyPower * 0.34 + creativeSpark * 0.28;
  const realismDrag = practicalCommitment * 0.22;
  const destinySignal = romanticDrive - realismDrag;

  if (destinySignal >= 4.8) {
    return 2;
  }

  if (destinySignal >= 3.2) {
    return 1;
  }

  return 0;
}

/**
 * 解析单个选项的信念分。
 * @param {object} optionItem 选项对象。
 * @returns {number} 信念分。
 */
function resolveBeliefWeight(optionItem) {
  if (Number.isFinite(Number(optionItem?.beliefWeight))) {
    return normalizeBeliefWeight(optionItem.beliefWeight);
  }

  return normalizeBeliefWeight(inferBeliefWeightFromVector(optionItem?.vector));
}

/**
 * 统计答题数量。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {number} 已作答题数。
 */
function resolveAnsweredCount(answerIds) {
  if (!Array.isArray(answerIds)) {
    return 0;
  }

  return answerIds.filter((answerItem) => Boolean(answerItem)).length;
}

/**
 * 计算信念值（belief_score）。
 * 复杂度评估：O(Q * O)
 * Q 为题量，O 为单题选项数（当前固定为 4）。
 * @param {Array<object>} questions 题目列表。
 * @param {Array<string|null>} answerIds 答案列表。
 * @returns {{ rawScore: number, maxScore: number, scorePercent: number }} 信念值统计结果。
 */
function buildBeliefScore(questions, answerIds) {
  let rawScore = 0;
  let maxScore = 0;

  questions.forEach((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    if (selectedOption) {
      rawScore += resolveBeliefWeight(selectedOption);
    }

    const maxQuestionBelief = questionItem.options.reduce(
      (maxValue, optionItem) => Math.max(maxValue, resolveBeliefWeight(optionItem)),
      0,
    );
    maxScore += maxQuestionBelief;
  });

  const safeMaxScore = Math.max(1, maxScore);
  const scorePercent = clampScore((rawScore / safeMaxScore) * 100);

  return {
    rawScore: Math.round(rawScore * 100) / 100,
    maxScore: Math.round(maxScore * 100) / 100,
    scorePercent,
  };
}

/**
 * 守门员判定：根据 Q1~Q13 的信念值决定是否解锁 Q14。
 * 复杂度评估：O(Q * O)，Q 默认为 13，实际为常数级。
 * @param {object} params 判定参数。
 * @param {Array<object>} params.questions 题目列表。
 * @param {Array<string|null>} params.answerIds 答案列表。
 * @param {number} [params.gateQuestionNumber=13] 守门员题号（从 1 开始）。
 * @param {number} [params.thresholdPercent=80] 阈值百分比。
 * @returns {{ rawScore: number, maxScore: number, scorePercent: number, gateQuestionNumber: number, thresholdPercent: number, passed: boolean }} 判定结果。
 */
export function evaluateRomanceDestinyGate({
  questions,
  answerIds,
  gateQuestionNumber = ROMANCE_DESTINY_GATE_DEFAULTS.gateQuestionNumber,
  thresholdPercent = ROMANCE_DESTINY_GATE_DEFAULTS.thresholdPercent,
}) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const normalizedGateQuestionNumber = Math.max(
    1,
    Math.floor(Number(gateQuestionNumber) || 1),
  );
  const normalizedThresholdPercent = clampScore(thresholdPercent);

  const gateQuestions = normalizedQuestions.slice(0, normalizedGateQuestionNumber);
  const beliefScore = buildBeliefScore(gateQuestions, answerIds);

  return {
    ...beliefScore,
    gateQuestionNumber: normalizedGateQuestionNumber,
    thresholdPercent: normalizedThresholdPercent,
    passed: beliefScore.scorePercent >= normalizedThresholdPercent,
  };
}

/**
 * 解析当前宿命结局。
 * @param {object} destinyGate 守门员判定结果。
 * @param {number} answeredCount 已作答题数。
 * @returns {object} 结局配置。
 */
function resolveDestinyOutcomeConfig(destinyGate, answeredCount) {
  const isUnlocked = Boolean(destinyGate?.passed) && answeredCount >= 14;
  return isUnlocked
    ? ROMANCE_DESTINY_OUTCOME_CONFIG.unlocked
    : ROMANCE_DESTINY_OUTCOME_CONFIG.locked;
}

/**
 * 计算浪漫指数（融合维度表现 + 信念值）。
 * @param {{ [key: string]: number }} scoreMap 维度分值映射。
 * @param {object} destinyGate 守门员判定结果。
 * @param {number} answeredCount 已作答题数。
 * @returns {number} 浪漫指数（0~100）。
 */
function calculateRomanceIndex(scoreMap, destinyGate, answeredCount) {
  const dimensionWeightedBase =
    scoreMap.ritualSense * 0.3 +
    scoreMap.empathyPower * 0.32 +
    scoreMap.creativeSpark * 0.23 +
    scoreMap.practicalCommitment * 0.15;
  const destinyContribution = Number(destinyGate?.scorePercent ?? 0);
  const unlockBonus =
    Boolean(destinyGate?.passed) && answeredCount >= 14 ? 8 : 0;

  return clampScore(dimensionWeightedBase * 0.62 + destinyContribution * 0.38 + unlockBonus);
}

/**
 * 选择海报主视觉键。
 * @param {object} outcomeConfig 结局配置。
 * @param {Array<object>} dimensionList 维度排序列表。
 * @returns {string} 海报视觉键。
 */
function resolvePosterVisualKey(outcomeConfig, dimensionList) {
  if (outcomeConfig.visualKey) {
    return outcomeConfig.visualKey;
  }

  const topDimensionKey = dimensionList[0]?.key ?? "ritualSense";
  if (topDimensionKey === "ritualSense") {
    return "candlelight";
  }

  if (topDimensionKey === "creativeSpark") {
    return "sunset-park";
  }

  return "warm-home";
}

/**
 * 构建标签文案。
 * @param {Array<object>} dimensionList 维度排序结果。
 * @param {object} outcomeConfig 宿命结局配置。
 * @param {object} destinyGate 守门员判定结果。
 * @returns {Array<string>} 标签列表。
 */
function buildTagChips(dimensionList, outcomeConfig, destinyGate) {
  const topDimensionLabels = dimensionList.slice(0, 2).map((dimensionItem) => {
    return `${dimensionItem.label}高敏感`;
  });

  const beliefTag =
    destinyGate.scorePercent >= 80
      ? "宿命突破"
      : destinyGate.scorePercent >= 60
        ? "浪漫潜势"
        : "理智防线";

  return [
    ...new Set([...topDimensionLabels, beliefTag, ...(outcomeConfig.tags ?? [])]),
  ].slice(0, 8);
}

/**
 * 构建成长动作建议。
 * @param {Array<object>} weakestDimensions 低分维度列表。
 * @param {object} outcomeConfig 宿命结局配置。
 * @returns {Array<string>} 建议动作列表。
 */
function buildGrowthActions(weakestDimensions, outcomeConfig) {
  const candidateActions = weakestDimensions.flatMap((dimensionItem) => {
    return ROMANCE_DIMENSION_ACTIONS[dimensionItem.key] ?? [];
  });

  const outcomeSpecificAction =
    outcomeConfig.key === "unlocked"
      ? "把这次“突破宿命”的勇气变成长期行动，而不是一次性冲动。"
      : "下一次在关键时刻，允许自己先表达爱，再评估得失。";

  return [...new Set([...candidateActions, outcomeSpecificAction])].slice(0, 4);
}

/**
 * 构建本地叙事文案。
 * @param {object} outcomeConfig 宿命结局配置。
 * @param {Array<object>} topDimensions 高分维度列表。
 * @param {object} destinyGate 守门员判定结果。
 * @returns {string} 叙事文案。
 */
function buildLocalNarrative(outcomeConfig, topDimensions, destinyGate) {
  const topDimensionLabels = topDimensions.map((dimensionItem) => dimensionItem.label);
  const topDimensionText = topDimensionLabels.length
    ? topDimensionLabels.join("、")
    : "情绪表达";

  return `你在${topDimensionText}维度表现突出。当前宿命信念值 ${destinyGate.scorePercent}%（阈值 ${destinyGate.thresholdPercent}%）。${outcomeConfig.insight}`;
}

/**
 * 兼容旧调用：按浪漫指数返回分段。
 * 关键逻辑：宿命机制上线后，该方法只用于极少数兼容场景。
 * @param {number} romanceIndex 浪漫指数。
 * @returns {object} 兼容分段对象。
 */
export function resolveRomanceTier(romanceIndex) {
  const normalizedScore = clampScore(romanceIndex);
  return normalizedScore >= 80
    ? ROMANCE_DESTINY_OUTCOME_CONFIG.unlocked
    : ROMANCE_DESTINY_OUTCOME_CONFIG.locked;
}

/**
 * 浪漫指数本地分析。
 * 复杂度评估：
 * 1. 维度累计：O(Q * D)
 * 2. 宿命判定：O(G * O)，G 默认为 13，O 为单题选项数
 * 3. 维度排序：O(D log D)
 * 总体复杂度：O(Q * D + G * O + D log D)，各变量均小且受控。
 * @param {object} params 参数对象。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @param {number} [params.gateQuestionNumber=13] 守门员题号（从 1 开始）。
 * @param {number} [params.gateThresholdPercent=80] 宿命阈值百分比。
 * @returns {{ romanceIndex: number, tierConfig: object, topDimensions: Array<object>, weakestDimensions: Array<object>, topThree: Array<object>, dimensionScores: Array<object>, scoreMap: object, answerSummary: Array<object>, summaryLines: Array<string>, tagChips: Array<string>, growthActions: Array<string>, localNarrative: string, destinyGate: object, destinyOutcome: object, answeredCount: number, posterModel: object }} 本地分析结果。
 */
export function analyzeRomanceLocally({
  questions,
  answerIds,
  gateQuestionNumber = ROMANCE_DESTINY_GATE_DEFAULTS.gateQuestionNumber,
  gateThresholdPercent = ROMANCE_DESTINY_GATE_DEFAULTS.thresholdPercent,
}) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const answeredCount = resolveAnsweredCount(answerIds);

  const weightedScoreResult = buildDimensionWeightedScore(questions, answerIds);
  const { scoreMap, dimensionList } = buildNormalizedDimensionScore(weightedScoreResult);
  const destinyGate = evaluateRomanceDestinyGate({
    questions,
    answerIds,
    gateQuestionNumber,
    thresholdPercent: gateThresholdPercent,
  });
  const destinyOutcome = resolveDestinyOutcomeConfig(destinyGate, answeredCount);

  const romanceIndex = calculateRomanceIndex(scoreMap, destinyGate, answeredCount);
  const topDimensions = dimensionList.slice(0, 2);
  const weakestDimensions = [...dimensionList].slice(-2).reverse();
  const growthActions = buildGrowthActions(weakestDimensions, destinyOutcome);

  return {
    romanceIndex,
    tierConfig: {
      key: destinyOutcome.key,
      title: destinyOutcome.title,
      posterQuote: destinyOutcome.posterQuote,
      insight: destinyOutcome.insight,
      avoidSignals: destinyOutcome.avoidSignals,
      highlightTitle: destinyOutcome.highlightTitle,
      highlightContent: destinyOutcome.highlightContent,
    },
    topDimensions,
    weakestDimensions,
    topThree: dimensionList.slice(0, 3).map((dimensionItem) => ({
      name: dimensionItem.label,
      score: dimensionItem.score,
    })),
    dimensionScores: dimensionList,
    scoreMap,
    answerSummary,
    summaryLines,
    tagChips: buildTagChips(dimensionList, destinyOutcome, destinyGate),
    growthActions,
    localNarrative: buildLocalNarrative(destinyOutcome, topDimensions, destinyGate),
    destinyGate,
    destinyOutcome,
    answeredCount,
    posterModel: {
      visualKey: resolvePosterVisualKey(destinyOutcome, dimensionList),
      quote: destinyOutcome.posterQuote,
      dimensionScores: dimensionList,
      destinyScore: destinyGate.scorePercent,
      destinyOutcomeKey: destinyOutcome.key,
    },
  };
}
