/**
 * 温柔 / 野性底色选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const GENTLE_WILD_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "柔软收敛向",
    fullLabel: "A 柔软收敛向",
    score: 1,
    color: "#b5d9c0",
  },
  B: {
    tier: "B",
    label: "温柔抚慰向",
    fullLabel: "B 温柔抚慰向",
    score: 2,
    color: "#8ec5a3",
  },
  C: {
    tier: "C",
    label: "清醒锋感向",
    fullLabel: "C 清醒锋感向",
    score: 3,
    color: "#5e9f7b",
  },
  D: {
    tier: "D",
    label: "野性掌场向",
    fullLabel: "D 野性掌场向",
    score: 4,
    color: "#2f6d4d",
  },
});

/**
 * 温柔 / 野性底色结果区间规则：
 * 关键逻辑：主结果始终以 20 题总分区间为准，确保 8 种结果与需求文案完全对齐。
 */
const GENTLE_WILD_RESULT_RULES = Object.freeze([
  {
    key: "pure-soft-jade",
    min: 20,
    max: 27,
    levelName: "纯柔・软玉型",
    statusLabel: "温柔底色拉满",
    coreTag: "极致柔软，纯净得像未经雕琢的玉",
    summary:
      "内心极致柔软，善良无攻击性，像未经雕琢的玉，纯粹干净，需要被好好呵护。",
    tagChips: ["极致柔软", "纯净无刺", "需要被珍惜"],
    actionTips: [
      "温柔是你的天赋，但边界感也需要被认真练习，别把退让当成善良的唯一方式。",
      "在关系里先确认自己的感受，再回应别人，会让你的柔软更有力量。",
      "学会说出“不舒服”和“不想要”，能帮你保护这份珍贵的纯净感。",
    ],
    easterEggText: "你不是脆弱，只是柔软得很真。",
    polarity: "gentle",
    themeVariantClass: "theme-gentle-wild-soft",
  },
  {
    key: "gentle-warm-sun",
    min: 28,
    max: 35,
    levelName: "温柔・暖阳型",
    statusLabel: "治愈感很强",
    coreTag: "自带暖意，是会照亮别人的小太阳",
    summary:
      "温柔治愈、共情力强，自带暖意，能照亮身边人，是让人安心的小太阳。",
    tagChips: ["温暖治愈", "共情很强", "稳定陪伴"],
    actionTips: [
      "你的温柔很有感染力，但也要给自己留恢复空间，不必总做情绪接球手。",
      "当你先照顾好自己时，这份暖意反而会更稳定、更持久。",
      "继续保留体贴，但别让自己在重要关系里长期单向输出。",
    ],
    easterEggText: "你身上的暖意，本身就是很多人的安全感来源。",
    polarity: "gentle",
    themeVariantClass: "theme-gentle-wild-soft",
  },
  {
    key: "resilient-bamboo",
    min: 36,
    max: 43,
    levelName: "韧柔・青竹型",
    statusLabel: "温柔里有筋骨",
    coreTag: "外柔内刚，温和但不失风骨",
    summary:
      "外柔内刚，温柔有底线，看似温和实则坚韧，不卑不亢，有自己的风骨。",
    tagChips: ["温和坚定", "柔中带刚", "边界清晰"],
    actionTips: [
      "你已经具备“温柔但不失原则”的底色，关键是继续把底线说清楚。",
      "别因为看起来好说话，就默认自己必须承担额外的情绪和责任。",
      "你的优势不在强硬，而在稳稳站住自己的位置，这点要继续保留。",
    ],
    easterEggText: "你像青竹，风吹得动，却折不断。",
    polarity: "gentle",
    themeVariantClass: "theme-gentle-wild-soft",
  },
  {
    key: "jasmine-mix",
    min: 44,
    max: 51,
    levelName: "柔野・茉莉型",
    statusLabel: "柔与野正在平衡",
    coreTag: "温柔中带着灵动和一点倔强",
    summary:
      "一半温柔一半灵动，温柔中带点小倔强，清新脱俗，可盐可甜。",
    tagChips: ["柔野平衡", "灵动清醒", "可盐可甜"],
    actionTips: [
      "你最迷人的地方在于不单一，保持这份轻盈反差比刻意选边站更重要。",
      "当你需要温柔时就温柔，需要明确时就明确，不必把自己固定成某一种样子。",
      "继续信任自己的切换能力，这会让你在人际和关系里更从容。",
    ],
    easterEggText: "你不是矛盾体，你只是层次很多。",
    polarity: "balanced",
    themeVariantClass: "theme-gentle-wild-balanced",
  },
  {
    key: "rose-mix",
    min: 52,
    max: 59,
    levelName: "野柔・蔷薇型",
    statusLabel: "野感开始外露",
    coreTag: "带刺却芬芳，锋芒和温柔都很鲜明",
    summary:
      "野性中藏着温柔，带刺却芬芳，有个性有魅力，不讨好不依附。",
    tagChips: ["有刺有香", "独立有感", "不讨好关系"],
    actionTips: [
      "你身上的锋芒很有辨识度，关键是把它留给真正值得回应的场景。",
      "温柔不是退让，强势也不是攻击，继续练习精准表达会更有魅力。",
      "当你不再急着被理解时，反而更容易稳定地做自己。",
    ],
    easterEggText: "你像蔷薇，靠近会闻到香，也会看见刺。",
    polarity: "balanced",
    themeVariantClass: "theme-gentle-wild-balanced",
  },
  {
    key: "flame-wild",
    min: 60,
    max: 67,
    levelName: "烈野・烈焰型",
    statusLabel: "热烈野性感很明显",
    coreTag: "敢爱敢恨，活得肆意又张扬",
    summary:
      "热烈张扬、敢爱敢恨，活得肆意洒脱，气场全开，自带强大吸引力。",
    tagChips: ["热烈直接", "气场强", "爱憎分明"],
    actionTips: [
      "你的行动力和存在感都很强，越是在关键场景里越要学会把锋芒用得更精准。",
      "保持热烈没有问题，但别让高情绪替你做所有决定。",
      "当你给自己多留一点观察窗口，你的魅力会比冲动更稳定。",
    ],
    easterEggText: "你不是难接近，只是能量感太强，容易先一步照亮全场。",
    polarity: "wild",
    themeVariantClass: "theme-gentle-wild-wild",
  },
  {
    key: "wild-lone-wolf",
    min: 68,
    max: 75,
    levelName: "狂野・孤狼型",
    statusLabel: "强野性主导气场",
    coreTag: "独立不羁，有自己的原则和世界",
    summary:
      "独立不羁、不受束缚，有自己的原则和世界，清醒又强大，不被定义。",
    tagChips: ["清醒独立", "不受束缚", "自我定义"],
    actionTips: [
      "你的独立和野感很强，适合保留自主空间，但也别拒绝所有柔软靠近。",
      "原则感是你的盔甲，适时表达真实情绪，会让你更完整而不是更弱。",
      "继续坚持自己的节奏，但别把“我可以”误用成“我不需要任何人”。",
    ],
    easterEggText: "你像孤狼，安静时也自带警觉和力量。",
    polarity: "wild",
    themeVariantClass: "theme-gentle-wild-wild",
  },
  {
    key: "king-wild",
    min: 76,
    max: 80,
    levelName: "极野・王者型",
    statusLabel: "王者气场全开",
    coreTag: "掌控全场，是自带光芒的绝对主角",
    summary:
      "掌控全场、气场碾压，爱憎分明、杀伐果断，是自带光芒的绝对主角。",
    tagChips: ["掌场王者", "果断强势", "锋芒极盛"],
    actionTips: [
      "你的判断和行动都很强，但越强的人越需要区分“有效推进”和“过度压制”。",
      "保留果断没问题，给重要关系多一点缓冲和倾听，会让你的强大更高级。",
      "你本来就有主场气场，不需要靠过度发力来证明自己。",
    ],
    easterEggText: "你走到哪里，气场就铺到哪里。",
    polarity: "wild",
    themeVariantClass: "theme-gentle-wild-wild",
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做“反应倾向侧写”，不覆盖总分主结果。
 */
const GENTLE_WILD_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "柔软收敛向",
    description: "你更习惯先收住情绪、安静感受，再慢慢回应外界。",
  },
  B: {
    tier: "B",
    name: "温柔抚慰向",
    description: "你更习惯用温和、照顾感和共情力去处理关系和情绪。",
  },
  C: {
    tier: "C",
    name: "清醒锋感向",
    description: "你更习惯在温柔之外保留判断、边界和清醒感。",
  },
  D: {
    tier: "D",
    name: "野性掌场向",
    description: "你更习惯直接表达、迅速行动，并自然占据主场节奏。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const GENTLE_WILD_DIMENSION_META = Object.freeze({
  "emotional-release": {
    key: "emotional-release",
    label: "情绪外放",
    color: "#8fc89f",
  },
  "boundary-edge": {
    key: "boundary-edge",
    label: "边界锋度",
    color: "#67aa81",
  },
  "freedom-urge": {
    key: "freedom-urge",
    label: "自由野感",
    color: "#4e916b",
  },
  "presence-control": {
    key: "presence-control",
    label: "主场气场",
    color: "#2e6b4a",
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
function resolveGentleWildResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 20));
  const matchedRule = GENTLE_WILD_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? GENTLE_WILD_RESULT_RULES[GENTLE_WILD_RESULT_RULES.length - 1];
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
      responseName:
        String(selectedOption?.responseName ?? "").trim() || "稳定观察中",
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

  return Object.values(GENTLE_WILD_OPTION_META).map((optionMeta) => {
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
    const leftScore = Number(GENTLE_WILD_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(GENTLE_WILD_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时，优先取更高分选项，避免对野性感的低估。
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
    GENTLE_WILD_MAJORITY_RULES[resolvedTier] ??
    GENTLE_WILD_MAJORITY_RULES.A;
  const optionMeta =
    GENTLE_WILD_OPTION_META[resolvedTier] ?? GENTLE_WILD_OPTION_META.A;

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
    if (!dimensionKey || !GENTLE_WILD_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(GENTLE_WILD_DIMENSION_META).map((dimensionMeta) => {
    const answeredCount = dimensionAnsweredCountMap[dimensionMeta.key] ?? 0;
    const totalDimensionScore = dimensionScoreMap[dimensionMeta.key] ?? 0;
    const minScore = answeredCount;
    const dynamicRange = answeredCount * 3;
    const wildRatio =
      answeredCount > 0 && dynamicRange > 0
        ? ((totalDimensionScore - minScore) / dynamicRange) * 100
        : 0;

    return {
      key: dimensionMeta.key,
      name: dimensionMeta.label,
      label: dimensionMeta.label,
      score: clampPercent(wildRatio),
      color: dimensionMeta.color,
    };
  });
}

/**
 * 计算单题与当前主调性的贴合度。
 * @param {number} rawScore 原始分值。
 * @param {"gentle"|"balanced"|"wild"} polarity 当前结果极性。
 * @returns {{ metric: number, traitLabel: string }} 贴合度与标签。
 */
function resolveScenarioMetric(rawScore, polarity) {
  if (polarity === "gentle") {
    return {
      metric: ((4 - rawScore) / 3) * 100,
      traitLabel: "温柔信号",
    };
  }

  if (polarity === "wild") {
    return {
      metric: ((rawScore - 1) / 3) * 100,
      traitLabel: "野性信号",
    };
  }

  return {
    // 关键逻辑：平衡型优先突出中段选择，体现“柔与野并存”的过渡状态。
    metric: (1 - Math.abs(rawScore - 2.5) / 1.5) * 100,
    traitLabel: rawScore <= 2 ? "柔感线索" : "野感线索",
  };
}

/**
 * 构建最能体现当前底色的场景列表。
 * 复杂度评估：O(Q log Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {"gentle"|"balanced"|"wild"} polarity 当前结果极性。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string, dimensionLabel: string, traitLabel: string }>} Top 列表。
 */
function buildTopCoreScenarios(answerSummary, polarity, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => {
      const rawScore = toSafeNumber(summaryItem.score, 0);
      const resolvedMetric = resolveScenarioMetric(rawScore, polarity);

      return {
        name: summaryItem.questionTitle,
        score: clampPercent(resolvedMetric.metric),
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

      if (polarity === "gentle") {
        const rawScoreDiff = leftItem.rawScore - rightItem.rawScore;
        if (rawScoreDiff !== 0) {
          return rawScoreDiff;
        }
      }

      if (polarity === "wild") {
        const rawScoreDiff = rightItem.rawScore - leftItem.rawScore;
        if (rawScoreDiff !== 0) {
          return rawScoreDiff;
        }
      }

      return String(leftItem.name).localeCompare(String(rightItem.name), "zh-Hans-CN");
    })
    .slice(0, safeTopN)
    .map(({ rawScore, ...restItem }) => restItem);
}

/**
 * 构建场景叙事短句。
 * @param {object | undefined} scenarioItem 场景对象。
 * @param {"gentle"|"balanced"|"wild"} polarity 当前结果极性。
 * @returns {string} 场景叙事。
 */
function buildScenarioNarrativeText(scenarioItem, polarity) {
  const scenarioName = String(scenarioItem?.name ?? "").trim();
  if (!scenarioName) {
    return "当前样本量不足，建议完整作答后再次观察你的柔野底色。";
  }

  if (polarity === "gentle") {
    return `最能体现你温柔底色的场景是「${scenarioName}」。`;
  }

  if (polarity === "wild") {
    return `最能体现你野性气场的场景是「${scenarioName}」。`;
  }

  return `最能体现你柔野反差感的场景是「${scenarioName}」。`;
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.majorityProfile 多数选项画像。
 * @param {Array<object>} params.topCoreScenarios 底色场景列表。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
  topCoreScenarios,
}) {
  const polarity = String(resultRule?.polarity ?? "balanced").trim();
  const topScenarioText = buildScenarioNarrativeText(
    topCoreScenarios[0],
    polarity === "gentle" || polarity === "wild" ? polarity : "balanced",
  );

  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 80))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 柔软收敛向"}，说明你的本能反应已经形成稳定倾向。`,
    topScenarioText,
  ].join(" ");
}

/**
 * 计算温柔 / 野性底色本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 底色场景排序为 O(Q log Q)。
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
export function analyzeGentleWildLocally({ questions, answerIds }) {
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
  const resultRule = resolveGentleWildResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildDimensionRadarItems(answerSummary);
  const topCoreScenarios = buildTopCoreScenarios(
    answerSummary,
    String(resultRule?.polarity ?? "balanced"),
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
