/**
 * 内在小孩测试选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const INNER_CHILD_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "被爱安抚向",
    fullLabel: "A 被爱安抚向",
    score: 1,
    color: "#f5c7d6",
  },
  B: {
    tier: "B",
    label: "快乐互动向",
    fullLabel: "B 快乐互动向",
    score: 2,
    color: "#f5cb72",
  },
  C: {
    tier: "C",
    label: "安静成长向",
    fullLabel: "C 安静成长向",
    score: 3,
    color: "#9fbbe7",
  },
  D: {
    tier: "D",
    label: "自由冒险向",
    fullLabel: "D 自由冒险向",
    score: 4,
    color: "#f19a70",
  },
});

/**
 * 内在小孩结果区间规则：
 * 关键逻辑：主结果始终以 20 题总分区间为准，确保 8 种结果和需求口径一致。
 */
const INNER_CHILD_RESULT_RULES = Object.freeze([
  {
    key: "soft-baby",
    min: 20,
    max: 27,
    levelName: "软萌宝贝型",
    statusLabel: "安全感需求很高",
    coreTag: "内心柔软，最需要稳定拥抱感",
    summary:
      "你的内在小孩像一个软萌宝贝，敏感、纯粹，很在意稳定陪伴和被温柔接住的感觉。",
    tagChips: ["柔软纯粹", "渴望被爱", "安全感优先"],
    actionTips: [
      "当你感到不安时，先确认自己需要的是陪伴、回应还是明确承诺，需求说清楚会更容易被看见。",
      "不要把“需要被爱”误解成脆弱，能诚实表达依赖，本身就是很成熟的能力。",
      "给自己建立稳定的安抚动作，比如固定休息、固定独处角落，能帮你更快回到安全区。",
    ],
    easterEggText: "你不是太黏人，你只是很认真地渴望被珍惜。",
    themeVariantClass: "theme-inner-child-soft",
    targetAverageScore: 1.2,
  },
  {
    key: "happy-elf",
    min: 28,
    max: 35,
    levelName: "快乐精灵型",
    statusLabel: "快乐能量很足",
    coreTag: "童心明亮，容易把轻松感带给别人",
    summary:
      "你的内在小孩偏快乐精灵型，乐观、元气、反应轻盈，很擅长用热情和笑意修复自己。",
    tagChips: ["小太阳", "轻盈治愈", "童真在线"],
    actionTips: [
      "快乐是你的优势，但别总把情绪处理成“没事”，真正难过时也值得被认真安慰。",
      "当你习惯照亮别人时，记得给自己留一点安静恢复的时间，别让活力被长期透支。",
      "保留分享欲和感染力，同时也练习在重要关系里说出你的真实委屈。",
    ],
    easterEggText: "你身上的轻快感，常常就是别人重新开心起来的起点。",
    themeVariantClass: "theme-inner-child-soft",
    targetAverageScore: 1.6,
  },
  {
    key: "gentle-good-kid",
    min: 36,
    max: 43,
    levelName: "温柔乖乖型",
    statusLabel: "懂事感比较明显",
    coreTag: "温柔体贴，也很容易先照顾别人",
    summary:
      "你的内在小孩偏温柔乖乖型，懂事、细腻、会照顾人，习惯先让关系平稳，再处理自己的感受。",
    tagChips: ["乖巧懂事", "体贴细腻", "渴望被理解"],
    actionTips: [
      "你很会顾全大局，但不要默认自己必须永远懂事，偶尔先顾自己并不自私。",
      "当你已经察觉到不舒服时，尽量在情绪变重前表达出来，不必一直等别人发现。",
      "被偏爱并不需要靠表现得“足够乖”，你本来就值得被好好对待。",
    ],
    easterEggText: "你不是没有脾气，只是总先把温柔留在前面。",
    themeVariantClass: "theme-inner-child-soft",
    targetAverageScore: 2,
  },
  {
    key: "quiet-scholar",
    min: 44,
    max: 51,
    levelName: "安静学者型",
    statusLabel: "内在世界浓度很高",
    coreTag: "喜欢思考，也习惯把情绪留在心里慢慢整理",
    summary:
      "你的内在小孩偏安静学者型，内敛、稳重、喜欢独处和思考，心里有一个丰富而安静的小世界。",
    tagChips: ["安静独处", "内心丰富", "思考型童心"],
    actionTips: [
      "独处是你的充电方式，但别把所有感受都锁起来，合适的人也值得你慢慢打开。",
      "当你已经想清楚很多事时，下一步更重要的是把想法说出来，而不是继续一个人消化。",
      "保留你的观察力和分寸感，同时别忽视身体和情绪已经发出的疲惫信号。",
    ],
    easterEggText: "你的童心不是吵闹型，而是藏在安静里慢慢发光。",
    themeVariantClass: "theme-inner-child-balanced",
    targetAverageScore: 2.4,
  },
  {
    key: "lively-curious",
    min: 52,
    max: 59,
    levelName: "灵动好奇型",
    statusLabel: "好奇心正在上升",
    coreTag: "灵动活泼，对世界一直有探索欲",
    summary:
      "你的内在小孩偏灵动好奇型，活泼、轻快、对新鲜事物保持兴趣，眼里始终还有一点闪闪发亮的探索感。",
    tagChips: ["好奇心强", "活力在线", "灵动可爱"],
    actionTips: [
      "你的优势在于灵动和尝试，但也要给自己留出收尾和沉淀的时间，别让兴趣只停留在开始。",
      "当你对新事物很快上头时，先确认边界和节奏，会让你的热情更可持续。",
      "继续保留你对世界的好奇，这种生命力本身就很稀缺。",
    ],
    easterEggText: "你像会发亮的小探照灯，走到哪儿都想多看一眼世界。",
    themeVariantClass: "theme-inner-child-balanced",
    targetAverageScore: 2.8,
  },
  {
    key: "independent-grownup",
    min: 60,
    max: 67,
    levelName: "独立小大人型",
    statusLabel: "自主扛事感很强",
    coreTag: "早熟懂事，习惯自己处理问题",
    summary:
      "你的内在小孩偏独立小大人型，早熟、坚强、行动感强，很多事第一反应是自己先扛下来。",
    tagChips: ["早熟独立", "习惯硬扛", "想被当孩子宠"],
    actionTips: [
      "你很能扛，但不是所有事都必须一个人完成，主动求助不会削弱你的能力感。",
      "当你已经很会解决问题时，更要留意自己是不是也需要被安慰，而不只是被夸能干。",
      "把“我可以”与“我必须”分开，你会轻松很多。",
    ],
    easterEggText: "你的小孩感没有消失，只是很早就学会了自己站稳。",
    themeVariantClass: "theme-inner-child-bold",
    targetAverageScore: 3.2,
  },
  {
    key: "rebel-warrior",
    min: 68,
    max: 75,
    levelName: "叛逆勇者型",
    statusLabel: "边界反击感很强",
    coreTag: "不喜欢被束缚，遇事有自己的态度",
    summary:
      "你的内在小孩偏叛逆勇者型，敢反抗、敢表达、不喜欢被限制，心里一直保留着强烈的自我立场。",
    tagChips: ["敢闯敢拼", "边界很强", "有态度"],
    actionTips: [
      "你的锋芒很珍贵，但越是有力量，越要区分“表达立场”和“过度防御”。",
      "当你觉得被限制时，先说需求再说情绪，会比直接顶回去更容易保住关系和边界。",
      "继续保留勇气，但也别让任何人只看见你的刺，而忽略你真正想守护的东西。",
    ],
    easterEggText: "你不是故意难搞，只是不愿再把自己缩小。",
    themeVariantClass: "theme-inner-child-bold",
    targetAverageScore: 3.6,
  },
  {
    key: "free-adventurer",
    min: 76,
    max: 80,
    levelName: "自由冒险家型",
    statusLabel: "远方感已经拉满",
    coreTag: "向往未知，天生带一点不服输的自由感",
    summary:
      "你的内在小孩偏自由冒险家型，勇敢、洒脱、向往远方，不喜欢被定义，永远想自己去看看更大的世界。",
    tagChips: ["热爱自由", "勇气很足", "探索未知"],
    actionTips: [
      "你对自由的需求很强，做决定前多补一步现实校准，能让你的冒险更稳、更长久。",
      "不是所有关系都会束缚你，找到既给空间又能同行的人，会让你走得更远。",
      "继续保留对未知的冲劲，但也别忘了给自己留一个能随时回来的安全基地。",
    ],
    easterEggText: "你天生就带一点风感，适合往更大的世界里走。",
    themeVariantClass: "theme-inner-child-bold",
    targetAverageScore: 3.9,
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做“本能反应侧写”，不覆盖总分主结果。
 */
const INNER_CHILD_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "被爱安抚向",
    description: "你更在意陪伴、照顾和安全感，心里很需要稳定的情绪支撑。",
  },
  B: {
    tier: "B",
    name: "快乐互动向",
    description: "你更喜欢分享、玩耍和热闹氛围，能量常常在互动中被点亮。",
  },
  C: {
    tier: "C",
    name: "安静成长向",
    description: "你更习惯把情绪留给自己处理，在安静和思考里慢慢长大。",
  },
  D: {
    tier: "D",
    name: "自由冒险向",
    description: "你更相信主动争取和亲自探索，对未知保留明显冲劲。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const INNER_CHILD_DIMENSION_META = Object.freeze({
  "playful-curiosity": {
    key: "playful-curiosity",
    label: "玩心好奇度",
    color: "#f2ba68",
  },
  "expression-directness": {
    key: "expression-directness",
    label: "表达直接度",
    color: "#f08f7e",
  },
  "social-brightness": {
    key: "social-brightness",
    label: "互动活力值",
    color: "#85c4a9",
  },
  "self-direction": {
    key: "self-direction",
    label: "自主成长力",
    color: "#88a5e7",
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
function resolveInnerChildResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 20));
  const matchedRule = INNER_CHILD_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? INNER_CHILD_RESULT_RULES[INNER_CHILD_RESULT_RULES.length - 1];
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

  return Object.values(INNER_CHILD_OPTION_META).map((optionMeta) => {
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
    const leftScore = Number(INNER_CHILD_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(INNER_CHILD_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离完全相同则优先保守解释，避免在侧写里过度放大冒险/反叛色彩。
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
    INNER_CHILD_MAJORITY_RULES[resolvedTier] ?? INNER_CHILD_MAJORITY_RULES.A;
  const optionMeta =
    INNER_CHILD_OPTION_META[resolvedTier] ?? INNER_CHILD_OPTION_META.A;

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
    if (!dimensionKey || !INNER_CHILD_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(INNER_CHILD_DIMENSION_META).map((dimensionMeta) => {
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
      ? "被爱线索"
      : safeScore <= 2.5
        ? "玩心线索"
        : safeScore <= 3.5
          ? "成长线索"
          : "冒险线索";

  return {
    // 关键逻辑：按“与当前结果均值的距离”打分，越接近当前主类型，越适合进入核心场景列表。
    metric: clampPercent((1 - distance / 3) * 100),
    traitLabel,
  };
}

/**
 * 构建最能体现当前内在小孩类型的场景列表。
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
    return "当前样本量不足，建议完整作答后再看你的核心童心线索。";
  }

  return `最能体现你当前内在小孩反应的场景是「${scenarioName}」。`;
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
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 80))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 被爱安抚向"}，说明你的童年本能反应已经形成稳定倾向。`,
    topScenarioText,
  ].join(" ");
}

/**
 * 计算内在小孩测试本地结果。
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
export function analyzeInnerChildLocally({ questions, answerIds }) {
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
  const resultRule = resolveInnerChildResultRule(totalScore);
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
