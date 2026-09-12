/**
 * 狗狗系人格测试选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const DOG_PERSONALITY_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "热情外放向",
    fullLabel: "A 热情外放向",
    score: 1,
    color: "#f2a85f",
  },
  B: {
    tier: "B",
    label: "稳妥陪伴向",
    fullLabel: "B 稳妥陪伴向",
    score: 2,
    color: "#f0c979",
  },
  C: {
    tier: "C",
    label: "细腻慢热向",
    fullLabel: "C 细腻慢热向",
    score: 3,
    color: "#8fc3b4",
  },
  D: {
    tier: "D",
    label: "自主边界向",
    fullLabel: "D 自主边界向",
    score: 4,
    color: "#7fa7d8",
  },
});

/**
 * 狗狗系人格结果区间规则：
 * 关键逻辑：主结果始终以 12 题总分区间为准，确保 6 种狗狗人格与需求文案完全一致。
 */
const DOG_PERSONALITY_RESULT_RULES = Object.freeze([
  {
    key: "golden-dog",
    min: 12,
    max: 18,
    levelName: "金毛人格",
    statusLabel: "热情治愈感最强",
    coreTag: "温暖开朗，自带让人放松的陪伴感",
    summary:
      "你是典型的金毛人格，热情温暖、忠诚开朗，对人真诚也很会给情绪价值，身上总有一种稳定又明亮的治愈气场。",
    tagChips: ["小太阳", "忠诚温暖", "治愈陪伴"],
    actionTips: [
      "你的热情很有感染力，但也别把照顾所有人当成默认责任，先照顾好自己的能量值。",
      "当你已经主动很多时，也要给关系留一点双向回应空间，不必总由你先冲在前面。",
      "继续保留你的真诚和暖意，同时练习更清楚地说出边界，关系会更稳更轻松。",
    ],
    easterEggText: "你出现的时候，很多人的坏心情都会自动松一点。",
    themeVariantClass: "theme-dog-personality-golden",
    targetAverageScore: 1.3,
  },
  {
    key: "samoyed-dog",
    min: 19,
    max: 24,
    levelName: "萨摩耶人格",
    statusLabel: "软萌亲和感拉满",
    coreTag: "元气黏人，很会把快乐气氛带给别人",
    summary:
      "你是萨摩耶人格，软萌可爱、元气满满，爱笑也爱贴贴，情绪反应直给但不拧巴，走到哪都很容易让人想靠近。",
    tagChips: ["元气满满", "爱笑黏人", "亲和力强"],
    actionTips: [
      "你很会让气氛变轻松，但真正不舒服的时候也要认真表达，别总先把场子圆过去。",
      "高亲和力是优势，不过别因为怕冷场就过度迁就，适度保留自己的节奏会更舒服。",
      "你适合被稳定回应和明确偏爱，发现自己开始患得患失时，可以先把需求说清楚。",
    ],
    easterEggText: "你的快乐感像一团会发光的软绒云，很容易把人情绪带亮。",
    themeVariantClass: "theme-dog-personality-samoyed",
    targetAverageScore: 1.8,
  },
  {
    key: "corgi-dog",
    min: 25,
    max: 30,
    levelName: "柯基人格",
    statusLabel: "贴心专一感明显",
    coreTag: "表面活泼，内里其实很细腻也很认真",
    summary:
      "你是柯基人格，乖巧贴心、有一点小傲娇，看起来好相处又有活力，其实内心很细腻，对喜欢的人会拿出很高的忠诚度。",
    tagChips: ["贴心专一", "细腻可爱", "轻微傲娇"],
    actionTips: [
      "你有时会用可爱和轻松感掩住真实在意，但关系里真正有效的还是把需求讲清楚。",
      "你很会照顾别人，也很值得被照顾，不必总等对方先发现你的委屈和不安。",
      "继续保留你的分寸感和专一感，同时别把“我没事”说得太顺口。",
    ],
    easterEggText: "你的小傲娇不是距离感，而是想被认真偏爱的暗号。",
    themeVariantClass: "theme-dog-personality-corgi",
    targetAverageScore: 2.4,
  },
  {
    key: "shiba-dog",
    min: 31,
    max: 36,
    levelName: "柴犬人格",
    statusLabel: "松弛边界感在线",
    coreTag: "不争不抢，外表淡定但内心其实很通透",
    summary:
      "你是柴犬人格，佛系慵懒、不爱计较，表面看起来有点呆萌和随性，实际上很清楚自己舒服的节奏，也懂得怎么让生活保持轻盈。",
    tagChips: ["松弛感强", "边界清楚", "通透自在"],
    actionTips: [
      "你的松弛感很难得，但重要关系里别总用“算了”替代真实态度，该表达时还是要表达。",
      "你已经很会和自己相处了，下一步更重要的是让在意的人也有机会靠近你的真实想法。",
      "保持你的通透和自在，同时别让过度退让变成情绪积压。",
    ],
    easterEggText: "你不是冷，只是很少把不重要的人和事放进心里。",
    themeVariantClass: "theme-dog-personality-shiba",
    targetAverageScore: 2.9,
  },
  {
    key: "border-collie-dog",
    min: 37,
    max: 42,
    levelName: "边牧人格",
    statusLabel: "清醒可靠感突出",
    coreTag: "聪明独立，关键时刻总能稳住局面",
    summary:
      "你是边牧人格，聪明清醒、独立有主见，遇事通常先判断、再行动，不需要太多情绪铺垫，但一到关键时刻就会显得特别可靠。",
    tagChips: ["清醒有主见", "稳定靠谱", "关键时刻能扛事"],
    actionTips: [
      "你习惯先分析再表达，但在亲密关系里，适度暴露感受会比只给结论更容易被理解。",
      "独立和可靠是你的优势，不过别把“我能处理”变成所有事都只靠自己。",
      "当你愿意在理性之外多给一点情绪回应，你的可靠会更有温度。",
    ],
    easterEggText: "你不一定最热闹，但大家通常会在关键时刻先想到你。",
    themeVariantClass: "theme-dog-personality-border",
    targetAverageScore: 3.4,
  },
  {
    key: "husky-dog",
    min: 43,
    max: 48,
    levelName: "哈士奇人格",
    statusLabel: "自由直率感满格",
    coreTag: "自由随性，情绪直白，不喜欢内耗自己",
    summary:
      "你是哈士奇人格，自由随性、爱闹爱玩，情绪反应比较直，也不太愿意把自己困在拧巴关系里，看起来大大咧咧，其实内里很纯粹。",
    tagChips: ["自由随性", "直白纯粹", "不爱内耗"],
    actionTips: [
      "你的直接和松弛会让人觉得相处轻松，但在重要关系里也要补足一点稳定回应和确认感。",
      "自由不是问题，问题通常出在节奏不对齐，提前说清楚边界和期待能省掉很多误解。",
      "继续保留你的真性情，同时记得在想抽离之前先把原因说清楚。",
    ],
    easterEggText: "你最有魅力的地方，是不太会把自己活成拧巴的人。",
    themeVariantClass: "theme-dog-personality-husky",
    targetAverageScore: 3.9,
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做“作答本能侧写”，不覆盖总分主结果。
 */
const DOG_PERSONALITY_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "热情外放向",
    description: "你更容易用直接反应、活力和即时回应去连接他人，情绪表达偏外放。",
  },
  B: {
    tier: "B",
    name: "稳妥陪伴向",
    description: "你更习惯以稳定、温柔和靠谱的方式进入关系，重视陪伴质量和长期感。",
  },
  C: {
    tier: "C",
    name: "细腻慢热向",
    description: "你更偏敏感和慢热，表达前会先观察环境与关系温度，情感浓度通常更细致。",
  },
  D: {
    tier: "D",
    name: "自主边界向",
    description: "你更强调独立空间和边界感，不会轻易把自己完全交给环境或关系推动。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const DOG_PERSONALITY_DIMENSION_META = Object.freeze({
  "social-temperature": {
    key: "social-temperature",
    label: "社交温度",
    color: "#f2a85f",
  },
  "support-expression": {
    key: "support-expression",
    label: "陪伴表达",
    color: "#f0c979",
  },
  "boundary-security": {
    key: "boundary-security",
    label: "边界安全感",
    color: "#84c0b0",
  },
  "inner-rhythm": {
    key: "inner-rhythm",
    label: "内核节奏",
    color: "#7fa7d8",
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
function resolveDogPersonalityResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 12));
  const matchedRule = DOG_PERSONALITY_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return (
    matchedRule ??
    DOG_PERSONALITY_RESULT_RULES[DOG_PERSONALITY_RESULT_RULES.length - 1]
  );
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
 * 构建作答分布图数据。
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

  return Object.values(DOG_PERSONALITY_OPTION_META).map((optionMeta) => {
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
    const leftScore = Number(DOG_PERSONALITY_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(
      DOG_PERSONALITY_OPTION_META[rightTier]?.score ?? 0,
    );
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离相同时优先保守解释，避免把边界感过度放大成主侧写。
    return leftScore - rightScore;
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
    DOG_PERSONALITY_MAJORITY_RULES[resolvedTier] ??
    DOG_PERSONALITY_MAJORITY_RULES.A;
  const optionMeta =
    DOG_PERSONALITY_OPTION_META[resolvedTier] ?? DOG_PERSONALITY_OPTION_META.A;

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
    if (!dimensionKey || !DOG_PERSONALITY_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(DOG_PERSONALITY_DIMENSION_META).map((dimensionMeta) => {
    const answeredCount = dimensionAnsweredCountMap[dimensionMeta.key] ?? 0;
    const totalDimensionScore = dimensionScoreMap[dimensionMeta.key] ?? 0;
    const minScore = answeredCount;
    const dynamicRange = answeredCount * 3;
    const dimensionRatio =
      answeredCount > 0 && dynamicRange > 0
        ? ((totalDimensionScore - minScore) / dynamicRange) * 100
        : 0;

    return {
      key: dimensionMeta.key,
      name: dimensionMeta.label,
      label: dimensionMeta.label,
      score: clampPercent(dimensionRatio),
      color: dimensionMeta.color,
    };
  });
}

/**
 * 计算单题与当前主类型的贴合度。
 * @param {number} rawScore 原始分值。
 * @param {number} targetAverageScore 当前结果对应的目标均值。
 * @returns {{ metric: number, traitLabel: string }} 贴合度与标签。
 */
function resolveScenarioMetric(rawScore, targetAverageScore) {
  const safeScore = toSafeNumber(rawScore, 1);
  const safeTargetAverage = toSafeNumber(targetAverageScore, 2.5);
  const distance = Math.abs(safeScore - safeTargetAverage);
  const traitLabel =
    safeScore <= 1.5
      ? "热情摇尾感"
      : safeScore <= 2.5
        ? "温柔陪伴感"
        : safeScore <= 3.5
          ? "细腻观察感"
          : "自由边界感";

  return {
    // 关键逻辑：按“与当前结果均值的距离”打分，越接近主类型，越适合进入核心场景列表。
    metric: clampPercent((1 - distance / 3) * 100),
    traitLabel,
  };
}

/**
 * 构建最能体现当前狗狗系人格的场景列表。
 * 复杂度评估：O(Q log Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} targetAverageScore 当前结果对应的目标均值。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string, dimensionLabel: string, traitLabel: string }>} Top 列表。
 */
function buildTopCoreScenarios(answerSummary, targetAverageScore, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => {
      const rawScore = toSafeNumber(summaryItem.score, 0);
      const resolvedMetric = resolveScenarioMetric(rawScore, targetAverageScore);

      return {
        name: summaryItem.questionTitle,
        score: resolvedMetric.metric,
        optionLabel: summaryItem.optionLabel,
        dimensionLabel: summaryItem.dimensionLabel,
        traitLabel: resolvedMetric.traitLabel,
        rawScore,
      };
    })
    .sort((leftItem, rightItem) => {
      const scoreDiff = rightItem.score - leftItem.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const distanceDiff =
        Math.abs(leftItem.rawScore - targetAverageScore) -
        Math.abs(rightItem.rawScore - targetAverageScore);
      if (distanceDiff !== 0) {
        return distanceDiff;
      }

      return String(leftItem.name).localeCompare(
        String(rightItem.name),
        "zh-Hans-CN",
      );
    })
    .slice(0, safeTopN)
    .map(({ rawScore, ...restItem }) => restItem);
}

/**
 * 构建场景叙事短句。
 * @param {object | undefined} scenarioItem 场景对象。
 * @returns {string} 场景叙事。
 */
function buildScenarioNarrativeText(scenarioItem) {
  const scenarioName = String(scenarioItem?.name ?? "").trim();
  if (!scenarioName) {
    return "当前样本量不足，建议完整作答后再看你的核心狗狗人格线索。";
  }

  return `最能体现你当前狗狗系人格反应的场景是「${scenarioName}」。`;
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.majorityProfile 多数选项画像。
 * @param {Array<object>} params.topCoreScenarios 核心场景列表。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
  topCoreScenarios,
}) {
  const topScenarioText = buildScenarioNarrativeText(topCoreScenarios[0]);

  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 48))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 热情外放向"}，说明你的第一反应已经形成了相对稳定的人格表达倾向。`,
    topScenarioText,
  ].join(" ");
}

/**
 * 计算狗狗系人格测试本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 核心场景排序为 O(Q log Q)。
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
 *  topCoreScenarios: Array<object>,
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string,
 *  actionTips: Array<string>
 * }} 本地结果。
 */
export function analyzeDogPersonalityLocally({ questions, answerIds }) {
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
  const resultRule = resolveDogPersonalityResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildDimensionRadarItems(answerSummary);
  const topCoreScenarios = buildTopCoreScenarios(
    answerSummary,
    Number(resultRule?.targetAverageScore ?? 2.5),
    3,
  );
  const summaryLines = buildSummaryLines(answerSummary);
  const localNarrative = buildLocalNarrative({
    totalScore,
    maxScore,
    resultRule,
    majorityProfile,
    topCoreScenarios,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    majorityProfile,
    optionDistribution,
    radarItems,
    topCoreScenarios,
    summaryLines,
    answerSummary,
    localNarrative,
    actionTips: Array.isArray(resultRule.actionTips) ? resultRule.actionTips : [],
  };
}
