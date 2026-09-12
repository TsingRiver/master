/**
 * 季节系人格选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const SEASON_PERSONALITY_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "暖阳外放向",
    fullLabel: "A 暖阳外放向",
    score: 1,
    color: "#f2a94c",
  },
  B: {
    tier: "B",
    label: "平和舒适向",
    fullLabel: "B 平和舒适向",
    score: 2,
    color: "#86b6a5",
  },
  C: {
    tier: "C",
    label: "氛围细腻向",
    fullLabel: "C 氛围细腻向",
    score: 3,
    color: "#d79c84",
  },
  D: {
    tier: "D",
    label: "清冷独处向",
    fullLabel: "D 清冷独处向",
    score: 4,
    color: "#7b8fb4",
  },
});

/**
 * 季节系人格结果区间规则：
 * 关键逻辑：主结果始终按 12 题总分判定，确保 6 种结果与需求口径完全一致。
 */
const SEASON_PERSONALITY_RESULT_RULES = Object.freeze([
  {
    key: "midsummer-persona",
    min: 12,
    max: 18,
    levelName: "盛夏人格",
    statusLabel: "热烈外放感最强",
    coreTag: "热烈明亮、元气外放",
    summary:
      "你像盛夏一样热烈明亮，情绪来得直接，快乐也来得很快，身上有种天然的小太阳能量。",
    tagChips: ["热烈明亮", "元气外放", "直球可爱"],
    actionTips: [
      "你的感染力很强，重要场合里适当放慢一点节奏，会让你的热情更容易被准确接住。",
      "当情绪来得快时，先给自己 10 秒缓冲，再表达需求，能减少误伤和误解。",
      "保持你的光感和生命力，同时也别忘了给自己留出稳定休息区。",
    ],
    easterEggText: "你像盛夏正午的阳光，出现时自带把场子点亮的能力。",
    themeVariantClass: "theme-season-personality-bright",
    targetAverageScore: 1.3,
  },
  {
    key: "warm-spring-persona",
    min: 19,
    max: 24,
    levelName: "暖春人格",
    statusLabel: "温柔治愈感在线",
    coreTag: "温柔治愈、和善舒服",
    summary:
      "你像暖春一样柔和稳定，待人真诚细腻，靠近你的人常常会先感受到安心和被照顾。",
    tagChips: ["温柔治愈", "和善舒服", "让人安心"],
    actionTips: [
      "你的温和是优势，但不需要为了维持和气而一直压住自己的真实感受。",
      "面对关系中的模糊边界，尽量把需求说短一点、说明确一点，会更省力。",
      "继续保留你的舒服感，同时别把“我来照顾大家”默认成唯一角色。",
    ],
    easterEggText: "你像春天里第一阵暖风，不张扬，却很容易让人放下防备。",
    themeVariantClass: "theme-season-personality-bright",
    targetAverageScore: 1.9,
  },
  {
    key: "early-autumn-persona",
    min: 25,
    max: 30,
    levelName: "初秋人格",
    statusLabel: "文艺氛围感升高",
    coreTag: "文艺慵懒、氛围感拉满",
    summary:
      "你像初秋傍晚一样柔软有故事，内心世界很丰富，既敏感又细腻，很容易让人感受到氛围感。",
    tagChips: ["文艺慵懒", "氛围感强", "内心丰富"],
    actionTips: [
      "你的感受力很细，重要关系里要学会把“我感觉到了”继续推进到“我说出来了”。",
      "当你开始反复消化同一件事时，试着把情绪落到具体事件上，能减少内耗。",
      "保留你的故事感，同时别让想象过度放大现实里的不确定。",
    ],
    easterEggText: "你像初秋落日前的一束暖光，温柔、松弛，还带一点故事感。",
    themeVariantClass: "theme-season-personality-mellow",
    targetAverageScore: 2.4,
  },
  {
    key: "cool-autumn-persona",
    min: 31,
    max: 36,
    levelName: "凉秋人格",
    statusLabel: "冷静通透感明显",
    coreTag: "成熟通透、冷静理性",
    summary:
      "你像凉秋一样成熟克制，做事更讲秩序和分寸，遇到事情通常能保持清醒，不会轻易失控。",
    tagChips: ["成熟通透", "冷静理性", "从容稳定"],
    actionTips: [
      "你的稳定感很强，但在重要关系里也要记得表达情绪，而不只是输出结论。",
      "当你已经看清局势时，适当补一句安抚，会让你的理性更容易被理解。",
      "继续保持通透和分寸感，同时别让“我能处理”变成什么都自己扛。",
    ],
    easterEggText: "你像凉秋的空气，清透、克制，也让人觉得可靠。",
    themeVariantClass: "theme-season-personality-mellow",
    targetAverageScore: 3,
  },
  {
    key: "deep-winter-persona",
    min: 37,
    max: 42,
    levelName: "深冬人格",
    statusLabel: "清冷独立感很稳",
    coreTag: "清冷独立、内心强大",
    summary:
      "你像深冬夜色一样清冷独立，更习惯独处和自我处理，不爱社交，但做事通常很稳、很靠谱。",
    tagChips: ["清冷独立", "内心强大", "不爱社交但靠谱"],
    actionTips: [
      "你很擅长独自扛事，但长期高强度自我消化也会累，适度求助不是失控。",
      "当你不想解释太多时，至少给重要的人一个最小反馈，能减少关系误判。",
      "保留你的边界和独立，同时别把所有靠近都自动判定成打扰。",
    ],
    easterEggText: "你像深冬夜里的灯，外表清冷，但真正需要时会一直亮着。",
    themeVariantClass: "theme-season-personality-cool",
    targetAverageScore: 3.5,
  },
  {
    key: "snow-winter-persona",
    min: 43,
    max: 48,
    levelName: "雪冬人格",
    statusLabel: "高敏冬感最浓",
    coreTag: "安静内敛、极度敏感",
    summary:
      "你像落雪时的冬夜，外表安静冷淡，内里却很柔软也很敏感，安全感对你来说尤其重要。",
    tagChips: ["安静内敛", "高敏感受", "柔软缺安全感"],
    actionTips: [
      "你对环境和关系都很敏感，先区分“我是真的不舒服”还是“我在提前防御”，会更有掌控感。",
      "当你想躲起来时，至少给自己留一个可连接的出口，不要让沉默变成长期封闭。",
      "你的柔软不是弱点，但需要被放进更安全、更稳定的关系里，别随意消耗自己。",
    ],
    easterEggText: "你像一场静静落下来的雪，不喧哗，却藏着很深的情绪密度。",
    themeVariantClass: "theme-season-personality-cool",
    targetAverageScore: 3.9,
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做偏好侧写，不覆盖总分主结果。
 */
const SEASON_PERSONALITY_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "暖阳外放向",
    description: "你更容易先把热情和生命力放在前面，喜欢直接、鲜活、带即时反馈的状态。",
  },
  B: {
    tier: "B",
    name: "平和舒适向",
    description: "你偏好稳定、舒服、可长期相处的节奏，不喜欢关系和环境过度失衡。",
  },
  C: {
    tier: "C",
    name: "氛围细腻向",
    description: "你对情绪、细节和氛围更敏感，容易在柔软、浪漫和故事感里获得共鸣。",
  },
  D: {
    tier: "D",
    name: "清冷独处向",
    description: "你更习惯把情绪和压力留给自己处理，独立、克制，也比较需要边界感。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const SEASON_PERSONALITY_DIMENSION_META = Object.freeze({
  "seasonal-energy": {
    key: "seasonal-energy",
    label: "季节能量",
    color: "#f2ae5f",
  },
  "social-distance": {
    key: "social-distance",
    label: "社交距离",
    color: "#7b93b6",
  },
  "atmosphere-aesthetic": {
    key: "atmosphere-aesthetic",
    label: "氛围审美",
    color: "#d79881",
  },
  "inner-climate": {
    key: "inner-climate",
    label: "内心底色",
    color: "#a68ac0",
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
function resolveSeasonPersonalityResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 12));
  const matchedRule = SEASON_PERSONALITY_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ??
    SEASON_PERSONALITY_RESULT_RULES[
      SEASON_PERSONALITY_RESULT_RULES.length - 1
    ];
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

  return Object.values(SEASON_PERSONALITY_OPTION_META).map((optionMeta) => {
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
    const leftScore = Number(
      SEASON_PERSONALITY_OPTION_META[leftTier]?.score ?? 0,
    );
    const rightScore = Number(
      SEASON_PERSONALITY_OPTION_META[rightTier]?.score ?? 0,
    );
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离相同时优先较低分位，避免把中间态误读成更极端的冬感倾向。
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
    SEASON_PERSONALITY_MAJORITY_RULES[resolvedTier] ??
    SEASON_PERSONALITY_MAJORITY_RULES.A;
  const optionMeta =
    SEASON_PERSONALITY_OPTION_META[resolvedTier] ??
    SEASON_PERSONALITY_OPTION_META.A;

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
    if (!dimensionKey || !SEASON_PERSONALITY_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(SEASON_PERSONALITY_DIMENSION_META).map(
    (dimensionMeta) => {
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
    },
  );
}

/**
 * 计算单题与当前主类型的贴合度。
 * @param {number} rawScore 原始分值。
 * @param {number} targetAverageScore 当前结果对应的目标均值。
 * @returns {{ metric: number, traitLabel: string }} 贴合度与标签。
 */
function resolveSignalMetric(rawScore, targetAverageScore) {
  const safeScore = toSafeNumber(rawScore, 1);
  const safeTargetAverage = toSafeNumber(targetAverageScore, 2.5);
  const distance = Math.abs(safeScore - safeTargetAverage);
  const traitLabel =
    safeScore <= 1.5
      ? "暖阳线索"
      : safeScore <= 2.5
        ? "舒适线索"
        : safeScore <= 3.5
          ? "氛围线索"
          : "冬感线索";

  return {
    // 关键逻辑：按“与当前结果均值的距离”打分，越接近当前主类型，越适合进入核心线索列表。
    metric: clampPercent((1 - distance / 3) * 100),
    traitLabel,
  };
}

/**
 * 构建最能体现当前季节系人格的场景列表。
 * 复杂度评估：O(Q log Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} targetAverageScore 当前结果对应的目标均值。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string, dimensionLabel: string, traitLabel: string, responseName: string }>} Top 列表。
 */
function buildTopSeasonSignals(answerSummary, targetAverageScore, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => {
      const rawScore = toSafeNumber(summaryItem.score, 0);
      const resolvedMetric = resolveSignalMetric(rawScore, targetAverageScore);

      return {
        name: summaryItem.questionTitle,
        score: resolvedMetric.metric,
        optionLabel: summaryItem.optionLabel,
        dimensionLabel: summaryItem.dimensionLabel,
        traitLabel: resolvedMetric.traitLabel,
        responseName: summaryItem.responseName,
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
 * @param {object | undefined} signalItem 场景对象。
 * @returns {string} 场景叙事。
 */
function buildSignalNarrativeText(signalItem) {
  const signalName = String(signalItem?.name ?? "").trim();
  if (!signalName) {
    return "当前样本量不足，建议完整作答后再看最能代表你的季节线索。";
  }

  return `最能体现你当前季节系人格的场景是「${signalName}」。`;
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.majorityProfile 多数选项画像。
 * @param {Array<object>} params.topSeasonSignals 核心线索列表。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
  topSeasonSignals,
}) {
  const topSignalText = buildSignalNarrativeText(topSeasonSignals[0]);

  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 48))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 暖阳外放向"}，说明你的季节感偏好已经形成稳定倾向。`,
    topSignalText,
  ].join(" ");
}

/**
 * 计算季节系人格本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 核心线索排序为 O(Q log Q)。
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
 *  topSeasonSignals: Array<object>,
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string,
 *  actionTips: Array<string>
 * }} 本地结果。
 */
export function analyzeSeasonPersonalityLocally({ questions, answerIds }) {
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
  const resultRule = resolveSeasonPersonalityResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildDimensionRadarItems(answerSummary);
  const topSeasonSignals = buildTopSeasonSignals(
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
    topSeasonSignals,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    majorityProfile,
    optionDistribution,
    radarItems,
    topSeasonSignals,
    summaryLines,
    answerSummary,
    localNarrative,
    actionTips: Array.isArray(resultRule.actionTips) ? resultRule.actionTips : [],
  };
}
