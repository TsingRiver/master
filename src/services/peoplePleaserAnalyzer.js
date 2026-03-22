/**
 * 讨好型选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const PEOPLE_PLEASER_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "从不",
    fullLabel: "A 从不",
    score: 1,
    color: "#E8B84E",
  },
  B: {
    tier: "B",
    label: "偶尔",
    fullLabel: "B 偶尔",
    score: 2,
    color: "#F1A864",
  },
  C: {
    tier: "C",
    label: "经常",
    fullLabel: "C 经常",
    score: 3,
    color: "#EE8E62",
  },
  D: {
    tier: "D",
    label: "总是",
    fullLabel: "D 总是",
    score: 4,
    color: "#E06C57",
  },
});

/**
 * 结果区间规则：
 * 关键逻辑：主结果始终以总分区间为准，保证 12 题整体判断稳定一致。
 */
const PEOPLE_PLEASER_RESULT_RULES = Object.freeze([
  {
    key: "lucid-self",
    min: 12,
    max: 20,
    levelName: "清醒自我型",
    boundaryLabel: "边界感很稳",
    coreTag: "不讨好，也不内耗",
    summary:
      "你更习惯先确认自己的意愿，再决定要不要回应别人，关系里有温度也有边界。",
    tagChips: ["边界清晰", "情绪不背锅", "先顾自己"],
    actionTips: [
      "继续保留清晰边界，同时给重要关系留出温和表达空间。",
      "当你说“不”时，不必急着补上过度解释，简洁本身就是边界。",
      "把这份稳定感延续到高压场景里，别因为短期情绪打乱长期原则。",
    ],
  },
  {
    key: "gentle-accommodating",
    min: 21,
    max: 29,
    levelName: "温和迁就型",
    boundaryLabel: "边界基本在线",
    coreTag: "心软但有底线",
    summary:
      "你很会照顾别人感受，也愿意配合关系节奏，但大多数时候还知道自己不能一退再退。",
    tagChips: ["温柔体贴", "偶尔迁就", "仍有底线"],
    actionTips: [
      "在答应别人之前，先给自己 10 秒确认“我是否真的愿意”。",
      "当你开始犹豫时，用“我需要想一下”替代立刻答应。",
      "练习把“照顾别人”与“委屈自己”区分开，别默认二者必须绑定。",
    ],
  },
  {
    key: "hidden-pleaser",
    min: 30,
    max: 38,
    levelName: "隐性讨好型",
    boundaryLabel: "边界感在流失",
    coreTag: "表面懂事，内心疲惫",
    summary:
      "你看起来很会配合、很会体谅，但很多情绪都被你悄悄吞下，久了容易陷入隐形消耗。",
    tagChips: ["隐性压抑", "怕被讨厌", "容易委屈"],
    actionTips: [
      "从最小场景开始练习拒绝，比如先拒绝一件你本来就不想做的小事。",
      "别急着先道歉，先判断责任边界，再决定是否需要修复关系。",
      "把真实需求说短一点、说具体一点，降低表达门槛比一次性说很多更有效。",
    ],
  },
  {
    key: "heavy-pleaser",
    min: 39,
    max: 48,
    levelName: "重度讨好型",
    boundaryLabel: "边界急需回收",
    coreTag: "总把别人放在前面",
    summary:
      "你非常容易把别人的需求、情绪和评价放在自己前面，关系里常常先自责、先妥协、先消耗自己。",
    tagChips: ["过度迁就", "高自责", "先委屈自己"],
    actionTips: [
      "建立“延迟答应”机制，任何额外请求先给自己一个缓冲时间。",
      "把“别人不开心”与“我做错了”拆开看，先核对事实再接情绪。",
      "如果长期处在高压关系里，优先寻找可信任的人做外部校准，不要一个人硬扛。",
    ],
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做“行为倾向侧写”，不覆盖总分主结果。
 */
const PEOPLE_PLEASER_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "清醒自我型",
    description: "边界感很强，不讨好、不内耗，活得很通透。",
  },
  B: {
    tier: "B",
    name: "温和迁就型",
    description: "心软善良，但有底线，不会一味委屈自己。",
  },
  C: {
    tier: "C",
    name: "隐性讨好型",
    description: "表面懂事，内心很累，常常默默压抑情绪。",
  },
  D: {
    tier: "D",
    name: "重度讨好型",
    description: "习惯把所有人放前面，非常需要多爱自己一点。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const PEOPLE_PLEASER_DIMENSION_META = Object.freeze({
  boundary: {
    key: "boundary",
    label: "边界退让",
    color: "#F0A24C",
  },
  guilt: {
    key: "guilt",
    label: "自责敏感",
    color: "#EE8761",
  },
  conflict: {
    key: "conflict",
    label: "冲突回避",
    color: "#E77767",
  },
  "self-suppression": {
    key: "self-suppression",
    label: "自我压抑",
    color: "#D96C4F",
  },
});

/**
 * 安全数字转换。
 * @param {unknown} value 待转换值。
 * @param {number} fallback 兜底值。
 * @returns {number} 数值结果。
 */
function toSafeNumber(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

/**
 * 夹取百分比。
 * @param {number} value 原始数值。
 * @returns {number} 0~100 的整数。
 */
function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(toSafeNumber(value, 0))));
}

/**
 * 命中总分区间规则。
 * @param {number} totalScore 总分。
 * @returns {object} 结果规则。
 */
function resolvePeoplePleaserResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 12));
  const matchedRule = PEOPLE_PLEASER_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? PEOPLE_PLEASER_RESULT_RULES[PEOPLE_PLEASER_RESULT_RULES.length - 1];
}

/**
 * 构建结构化答卷摘要。
 * 复杂度评估：O(Q * O)
 * Q 为题量，O 为单题选项数（本题库固定为 4）。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 已选答案 ID 列表。
 * @returns {Array<object>} 结构化摘要。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((questionItem, questionIndex) => {
    const selectedOption = Array.isArray(questionItem?.options)
      ? questionItem.options.find(
          (optionItem) => optionItem.id === answerIds[questionIndex],
        )
      : null;

    return {
      questionId: String(questionItem?.id ?? "").trim(),
      questionTitle: String(questionItem?.title ?? "").trim(),
      dimension: String(questionItem?.dimension ?? "").trim(),
      dimensionLabel:
        String(questionItem?.dimensionLabel ?? "").trim() || "稳定观察",
      optionId: selectedOption?.id ?? null,
      optionLabel: String(selectedOption?.label ?? "未作答").trim() || "未作答",
      tier: String(selectedOption?.tier ?? "").trim() || "",
      score: toSafeNumber(selectedOption?.score, 0),
    };
  });
}

/**
 * 构建答卷摘要文本。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<string>} 展示文本。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 统计各选项出现次数。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {{ A: number, B: number, C: number, D: number }} 次数映射。
 */
function buildOptionCountMap(answerSummary) {
  return answerSummary.reduce(
    (countMap, summaryItem) => {
      const optionTier = String(summaryItem?.tier ?? "").trim().toUpperCase();
      if (typeof countMap[optionTier] !== "number") {
        return countMap;
      }

      countMap[optionTier] += 1;
      return countMap;
    },
    {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    },
  );
}

/**
 * 构建分布图数据。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<{ key: string, name: string, score: number, color: string, count: number }>} 分布图数据。
 */
function buildOptionDistribution(answerSummary) {
  const countMap = buildOptionCountMap(answerSummary);
  const answeredCount = Object.values(countMap).reduce(
    (sum, currentValue) => sum + currentValue,
    0,
  );

  return Object.values(PEOPLE_PLEASER_OPTION_META).map((optionMeta) => {
    const optionCount = countMap[optionMeta.tier] ?? 0;
    const ratio = answeredCount > 0 ? (optionCount / answeredCount) * 100 : 0;

    return {
      key: optionMeta.tier,
      name: optionMeta.fullLabel,
      score: clampPercent(ratio),
      color: optionMeta.color,
      count: optionCount,
    };
  });
}

/**
 * 在多数选项打平时解析更贴近整体分数的画像。
 * 复杂度评估：O(1)
 * 打平候选固定不超过 4 个，属于常量级计算。
 * @param {Array<string>} tiedTiers 打平的选项层级。
 * @param {number} averageScore 平均分（1~4）。
 * @returns {string} 解析后的选项层级。
 */
function resolveTiedMajorityTier(tiedTiers, averageScore) {
  return [...tiedTiers].sort((leftTier, rightTier) => {
    const leftScore = Number(PEOPLE_PLEASER_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(PEOPLE_PLEASER_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时，优先取更高分选项，避免对讨好风险的低估。
    return rightScore - leftScore;
  })[0] ?? "A";
}

/**
 * 解析多数选项画像。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} totalScore 总分。
 * @returns {{ tier: string, name: string, description: string, label: string, count: number }} 多数画像。
 */
function resolveMajorityProfile(answerSummary, totalScore) {
  const countMap = buildOptionCountMap(answerSummary);
  const maxCount = Math.max(...Object.values(countMap));
  const tiedTiers = Object.entries(countMap)
    .filter(([, countValue]) => countValue === maxCount)
    .map(([tier]) => tier);
  const answeredCount = Math.max(
    1,
    answerSummary.filter((summaryItem) => Boolean(summaryItem.optionId)).length,
  );
  const averageScore = toSafeNumber(totalScore, 0) / answeredCount;
  const resolvedTier =
    tiedTiers.length > 1
      ? resolveTiedMajorityTier(tiedTiers, averageScore)
      : tiedTiers[0] ?? "A";
  const matchedProfile =
    PEOPLE_PLEASER_MAJORITY_RULES[resolvedTier] ??
    PEOPLE_PLEASER_MAJORITY_RULES.A;
  const optionMeta =
    PEOPLE_PLEASER_OPTION_META[resolvedTier] ?? PEOPLE_PLEASER_OPTION_META.A;

  return {
    tier: resolvedTier,
    name: matchedProfile.name,
    description: matchedProfile.description,
    label: optionMeta.fullLabel,
    count: countMap[resolvedTier] ?? 0,
  };
}

/**
 * 构建雷达图维度数据。
 * 复杂度评估：O(Q + D)
 * Q 为题量，D 为维度数量（当前固定为 4）。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<{ key: string, name: string, label: string, score: number, color: string }>} 雷达图数据。
 */
function buildDimensionRadarItems(answerSummary) {
  const dimensionScoreMap = {};
  const dimensionAnsweredCountMap = {};

  answerSummary.forEach((summaryItem) => {
    if (!summaryItem.optionId) {
      return;
    }

    const dimensionKey = String(summaryItem.dimension ?? "").trim();
    if (!dimensionKey || !PEOPLE_PLEASER_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(PEOPLE_PLEASER_DIMENSION_META).map((dimensionMeta) => {
    const answeredCount = dimensionAnsweredCountMap[dimensionMeta.key] ?? 0;
    const totalDimensionScore = dimensionScoreMap[dimensionMeta.key] ?? 0;
    const minScore = answeredCount;
    const dynamicRange = answeredCount * 3;
    const severityRatio =
      answeredCount > 0 && dynamicRange > 0
        ? ((totalDimensionScore - minScore) / dynamicRange) * 100
        : 0;

    return {
      key: dimensionMeta.key,
      name: dimensionMeta.label,
      label: dimensionMeta.label,
      score: clampPercent(severityRatio),
      color: dimensionMeta.color,
    };
  });
}

/**
 * 构建最容易委屈自己的场景列表。
 * 复杂度评估：O(Q log Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string, dimensionLabel: string }>} Top 列表。
 */
function buildTopPressureScenarios(answerSummary, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => ({
      name: summaryItem.questionTitle,
      score: clampPercent(((toSafeNumber(summaryItem.score, 1) - 1) / 3) * 100),
      optionLabel: summaryItem.optionLabel,
      dimensionLabel: summaryItem.dimensionLabel,
      rawScore: toSafeNumber(summaryItem.score, 0),
    }))
    .sort((leftItem, rightItem) => {
      const scoreDiff = rightItem.rawScore - leftItem.rawScore;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return String(leftItem.name).localeCompare(String(rightItem.name), "zh-Hans-CN");
    })
    .slice(0, safeTopN)
    .map(({ rawScore, ...restItem }) => restItem);
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.majorityProfile 多数选项画像。
 * @param {Array<object>} params.topPressureScenarios 高压场景列表。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
  topPressureScenarios,
}) {
  const topScenario = topPressureScenarios[0];
  const topScenarioText = topScenario?.name
    ? `当前最容易让你先让步的场景是「${topScenario.name}」。`
    : "当前样本量不足，建议完整作答后再次观察。";

  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 48))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 从不"}，说明你在关系里常见的自我保护/让步模式已经比较固定。`,
    topScenarioText,
  ].join(" ");
}

/**
 * 计算讨好型指数本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 风险场景排序为 O(Q log Q)。
 * @param {object} params 分析参数。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 已选答案。
 * @returns {{
 *  score: number,
 *  maxScore: number,
 *  answeredCount: number,
 *  resultRule: object,
 *  majorityProfile: object,
 *  optionDistribution: Array<object>,
 *  radarItems: Array<object>,
 *  topPressureScenarios: Array<object>,
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string,
 *  actionTips: Array<string>
 * }} 本地结果。
 */
export function analyzePeoplePleaserLocally({ questions, answerIds }) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const normalizedAnswerIds = Array.isArray(answerIds) ? answerIds : [];
  const answerSummary = buildAnswerSummary(
    normalizedQuestions,
    normalizedAnswerIds,
  );
  const answeredCount = answerSummary.filter(
    (summaryItem) => Boolean(summaryItem.optionId),
  ).length;
  const totalScore = answerSummary.reduce(
    (sum, summaryItem) => sum + toSafeNumber(summaryItem.score, 0),
    0,
  );
  const maxScore = normalizedQuestions.length * 4;
  const resultRule = resolvePeoplePleaserResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildDimensionRadarItems(answerSummary);
  const topPressureScenarios = buildTopPressureScenarios(answerSummary, 3);
  const summaryLines = buildSummaryLines(answerSummary);
  const localNarrative = buildLocalNarrative({
    totalScore,
    maxScore,
    resultRule,
    majorityProfile,
    topPressureScenarios,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    majorityProfile,
    optionDistribution,
    radarItems,
    topPressureScenarios,
    summaryLines,
    answerSummary,
    localNarrative,
    actionTips: Array.isArray(resultRule.actionTips) ? resultRule.actionTips : [],
  };
}
