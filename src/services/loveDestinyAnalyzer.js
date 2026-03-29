/**
 * 桃花体质选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const LOVE_DESTINY_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "清醒边界型",
    fullLabel: "A 清醒边界型",
    score: 1,
    color: "#9B7AC7",
  },
  B: {
    tier: "B",
    label: "心软观察型",
    fullLabel: "B 心软观察型",
    score: 2,
    color: "#BEA0E0",
  },
  C: {
    tier: "C",
    label: "上头妥协型",
    fullLabel: "C 上头妥协型",
    score: 3,
    color: "#D7C2EE",
  },
});

/**
 * 桃花体质结果区间规则：
 * 关键逻辑：主结果始终按 12 题总分判定，确保结果文案与需求稿完全一致。
 */
const LOVE_DESTINY_RESULT_RULES = Object.freeze([
  {
    key: "positive-destiny",
    min: 12,
    max: 18,
    levelName: "正缘吸铁石",
    statusLabel: "正缘过滤力很强",
    coreTag: "边界清醒，好缘分更容易靠近",
    summary:
      "你清醒独立，边界感强，不会被表面热情迷惑，自带过滤烂桃花的体质。懂得先爱自己，很容易吸引到专一、成熟、真心待你的正缘，感情路安稳又顺遂。",
    tagChips: ["边界清晰", "清醒独立", "过滤烂桃花"],
    actionTips: [
      "继续保持“先观察、后投入”的节奏，不被短期热度打乱判断。",
      "遇到让你不舒服的越界信号时，直接表达边界比默默消化更有效。",
      "你的稳定感本身就在筛选关系，别为了配合别人而降低底线。",
    ],
    easterEggText: "你不是难追，只是不再把真心交给不稳定的人。",
    themeVariantClass: "theme-love-destiny-positive",
  },
  {
    key: "mixed-destiny",
    min: 19,
    max: 26,
    levelName: "正缘与烂桃花各半",
    statusLabel: "观察期决定结果",
    coreTag: "心软重情，理智再多一点会更稳",
    summary:
      "你心软重情，容易被细节打动，偶尔会看不清对方的真实意图。只要多给自己一点观察时间，遇事多保持理智，就能轻松避开烂桃花，抓住属于你的好缘分。",
    tagChips: ["容易心软", "需要观察期", "理智加分"],
    actionTips: [
      "把“有感觉”与“适合长期相处”分开判断，至少给自己一个观察窗口。",
      "当你开始替对方找理由时，先回看事实：他到底做了什么，而不是说了什么。",
      "不舒服的地方尽量及时说出口，别等到情绪积压后再补救。",
    ],
    easterEggText: "慢一点不是错，给自己留判断空间，才更容易留下正缘。",
    themeVariantClass: "theme-love-destiny-balanced",
  },
  {
    key: "bad-luck-risk",
    min: 27,
    max: 36,
    levelName: "易招烂桃花体质",
    statusLabel: "底线容易被消耗",
    coreTag: "先把偏爱给自己，烂桃花才会退场",
    summary:
      "你太渴望被爱，容易心软妥协、不断降低底线，常常被甜言蜜语迷惑。不是你不够好，而是太轻易付出真心，才会吸引到只想消耗你的人。多偏爱自己一点，对的人才会靠近。",
    tagChips: ["容易妥协", "甜言易上头", "边界待回收"],
    actionTips: [
      "把“不好意思拒绝”改成“我需要想一下”，先为自己争取缓冲时间。",
      "一旦关系让你长期难过、内耗，就不要只反省自己，要先检查对方有没有在持续消耗你。",
      "先建立底线，再谈投入；先看行动，再谈真心。",
    ],
    easterEggText: "多偏爱自己一点，烂桃花就很难再找到你的软肋。",
    themeVariantClass: "theme-love-destiny-risk",
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项用于展示行为倾向，不覆盖总分主结果。
 */
const LOVE_DESTINY_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "清醒边界型",
    description: "你会先看清边界和尊重感，再决定要不要继续投入。",
  },
  B: {
    tier: "B",
    name: "心软观察型",
    description: "你不是没判断力，只是容易先被细节打动，再慢慢回头确认风险。",
  },
  C: {
    tier: "C",
    name: "上头妥协型",
    description: "你很容易先投入情绪和真心，风险出现后也倾向替关系找理由。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const LOVE_DESTINY_DIMENSION_META = Object.freeze({
  boundary: {
    key: "boundary",
    label: "边界守护",
    color: "#B4756C",
  },
  discernment: {
    key: "discernment",
    label: "风险识别",
    color: "#D09B90",
  },
  "emotional-dependence": {
    key: "emotional-dependence",
    label: "情绪依赖",
    color: "#94A3B8",
  },
  "self-worth": {
    key: "self-worth",
    label: "自我优先",
    color: "#C9A792",
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
function resolveLoveDestinyResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 12));
  const matchedRule = LOVE_DESTINY_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? LOVE_DESTINY_RESULT_RULES[LOVE_DESTINY_RESULT_RULES.length - 1];
}

/**
 * 构建结构化答卷摘要。
 * 复杂度评估：O(Q * O)
 * Q 为题量，O 为单题选项数（本题库固定为 3）。
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
      tier: String(selectedOption?.tier ?? "").trim().toUpperCase(),
      profileName:
        String(selectedOption?.profileName ?? "").trim() || "稳定观察中",
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
 * @returns {{ A: number, B: number, C: number }} 次数映射。
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
    },
  );
}

/**
 * 构建选择分布图数据。
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

  return Object.values(LOVE_DESTINY_OPTION_META).map((optionMeta) => {
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
 * 打平候选固定不超过 3 个，属于常量级计算。
 * @param {Array<string>} tiedTiers 打平的选项层级。
 * @param {number} averageScore 平均分（1~3）。
 * @returns {string} 解析后的选项层级。
 */
function resolveTiedMajorityTier(tiedTiers, averageScore) {
  return [...tiedTiers].sort((leftTier, rightTier) => {
    const leftScore = Number(LOVE_DESTINY_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(LOVE_DESTINY_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时，优先取更高分选项，避免对桃花风险的低估。
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
    LOVE_DESTINY_MAJORITY_RULES[resolvedTier] ??
    LOVE_DESTINY_MAJORITY_RULES.A;
  const optionMeta =
    LOVE_DESTINY_OPTION_META[resolvedTier] ?? LOVE_DESTINY_OPTION_META.A;

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
    if (!dimensionKey || !LOVE_DESTINY_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(LOVE_DESTINY_DIMENSION_META).map((dimensionMeta) => {
    const answeredCount = dimensionAnsweredCountMap[dimensionMeta.key] ?? 0;
    const totalDimensionScore = dimensionScoreMap[dimensionMeta.key] ?? 0;
    const minScore = answeredCount;
    const dynamicRange = answeredCount * 2;
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
 * 构建最容易吸引烂桃花的高风险场景列表。
 * 复杂度评估：O(Q log Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string, dimensionLabel: string }>} Top 列表。
 */
function buildTopRiskScenarios(answerSummary, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => ({
      name: summaryItem.questionTitle,
      score: clampPercent(((toSafeNumber(summaryItem.score, 1) - 1) / 2) * 100),
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
 * @param {Array<object>} params.topRiskScenarios 高风险场景列表。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
  topRiskScenarios,
}) {
  const topScenario = topRiskScenarios[0];
  const topScenarioText = topScenario?.name
    ? `当前最容易让你降低底线的场景是「${topScenario.name}」。`
    : "当前样本量不足，建议完整作答后再次观察。";

  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 36))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 清醒边界型"}，说明你在感情里的风险判断方式已经比较固定。`,
    topScenarioText,
  ].join(" ");
}

/**
 * 计算桃花体质本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 高风险场景排序为 O(Q log Q)。
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
 *  topRiskScenarios: Array<object>,
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string,
 *  actionTips: Array<string>
 * }} 本地结果。
 */
export function analyzeLoveDestinyLocally({ questions, answerIds }) {
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
  const maxScore = normalizedQuestions.length * 3;
  const resultRule = resolveLoveDestinyResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildDimensionRadarItems(answerSummary);
  const topRiskScenarios = buildTopRiskScenarios(answerSummary, 3);
  const summaryLines = buildSummaryLines(answerSummary);
  const localNarrative = buildLocalNarrative({
    totalScore,
    maxScore,
    resultRule,
    majorityProfile,
    topRiskScenarios,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    majorityProfile,
    optionDistribution,
    radarItems,
    topRiskScenarios,
    summaryLines,
    answerSummary,
    localNarrative,
    actionTips: Array.isArray(resultRule.actionTips) ? resultRule.actionTips : [],
  };
}
