/**
 * 心动吸引类型选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const ATTRACTION_TYPE_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "清冷稳定型",
    fullLabel: "A 清冷稳定型",
    score: 1,
    color: "#d86f97",
  },
  B: {
    tier: "B",
    label: "温柔治愈型",
    fullLabel: "B 温柔治愈型",
    score: 2,
    color: "#e897b4",
  },
  C: {
    tier: "C",
    label: "阳光快乐型",
    fullLabel: "C 阳光快乐型",
    score: 3,
    color: "#f2a0b8",
  },
  D: {
    tier: "D",
    label: "成熟靠山型",
    fullLabel: "D 成熟靠山型",
    score: 4,
    color: "#c75f86",
  },
});

/**
 * 心动吸引类型结果区间规则：
 * 关键逻辑：主结果始终按总分区间判定，保证与需求文案完全一致。
 */
const ATTRACTION_TYPE_RESULT_RULES = Object.freeze([
  {
    key: "cool-stable",
    min: 12,
    max: 18,
    levelName: "清冷稳定型",
    coreTag: "安静靠谱最让你心动",
    needLabel: "长久安心感",
    summary:
      "情绪稳定、内敛克制、话少靠谱，给你长久安心感。",
    tagChips: ["清醒克制", "忠诚安心", "低调靠谱"],
    desireLine:
      "你更容易被稳定感和确定性打动，关系里最看重的是可持续的安全感。",
    carePoints: [
      "你偏爱不用过度消耗情绪的关系节奏，安静陪伴本身就很有吸引力。",
      "比起热烈追求，你更相信长期一致的选择和稳定回应。",
    ],
  },
  {
    key: "gentle-healing",
    min: 19,
    max: 30,
    levelName: "温柔治愈型",
    coreTag: "细腻偏爱很戳你",
    needLabel: "被理解与被照顾",
    summary:
      "细腻柔软、共情力强，满眼都是你，懂你所有小情绪。",
    tagChips: ["偏爱细节", "被懂得", "温柔依赖"],
    desireLine:
      "你最容易被情绪价值和细节照顾打动，希望对方能读懂你的敏感和小心思。",
    carePoints: [
      "你会注意关系里的温度感，偏爱会照顾情绪、愿意耐心回应的人。",
      "比起强势推进，你更在意对方是否真正把你放在心上。",
    ],
  },
  {
    key: "sunny-happy",
    min: 31,
    max: 42,
    levelName: "阳光快乐型",
    coreTag: "有趣和活力最上头",
    needLabel: "快乐与新鲜感",
    summary:
      "开朗元气、幽默有趣，自带能量，和他在一起永远不无聊。",
    tagChips: ["开心优先", "有趣灵魂", "轻盈热烈"],
    desireLine:
      "你会被有能量的人迅速点燃，关系里越轻松、越有趣、越容易让你持续心动。",
    carePoints: [
      "你需要的是能一起制造快乐的人，而不是把关系过成流程表。",
      "对你来说，情绪感染力和相处趣味感往往比标准答案更重要。",
    ],
  },
  {
    key: "mature-anchor",
    min: 43,
    max: 48,
    levelName: "成熟靠山型",
    coreTag: "担当与能力最致命",
    needLabel: "被坚定守护",
    summary:
      "成熟稳重、有担当、能扛事，是你人生里的底气与依靠。",
    tagChips: ["强大可靠", "未来感", "责任担当"],
    desireLine:
      "你会被能扛事、能规划、能稳定推进关系的人吸引，因为这会让你觉得被认真接住。",
    carePoints: [
      "你很看重对方处理现实问题的能力，成熟度和担当感会直接影响心动值。",
      "相比一时热情，你更偏爱能够给出方向感和依靠感的人。",
    ],
  },
]);

/**
 * 主导选项画像规则：
 * 关键逻辑：主导选项只做偏好侧写，不覆盖总分主结果。
 */
const ATTRACTION_TYPE_DOMINANT_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "清冷稳定型",
    description: "你会被安静、克制、稳定输出安全感的人持续吸引。",
  },
  B: {
    tier: "B",
    name: "温柔治愈型",
    description: "你会被细腻、会照顾情绪、愿意偏爱你的人打动。",
  },
  C: {
    tier: "C",
    name: "阳光快乐型",
    description: "你会被有趣、开朗、能让相处一直有新鲜感的人吸引。",
  },
  D: {
    tier: "D",
    name: "成熟靠山型",
    description: "你会被成熟、有能力、给人强烈可靠感的人吸引。",
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
function resolveAttractionTypeResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 12));
  const matchedRule = ATTRACTION_TYPE_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? ATTRACTION_TYPE_RESULT_RULES[ATTRACTION_TYPE_RESULT_RULES.length - 1];
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
      optionId: selectedOption?.id ?? null,
      optionLabel: String(selectedOption?.label ?? "未作答").trim() || "未作答",
      tier: String(selectedOption?.tier ?? "").trim().toUpperCase(),
      archetypeName:
        String(selectedOption?.archetypeName ?? "").trim() || "稳定观察中",
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
  return answerSummary.map((summaryItem, index) => {
    const optionText = String(summaryItem.optionLabel ?? "").replace(/^[A-D]\s+/, "");
    return `${index + 1}. ${summaryItem.questionTitle} -> ${optionText}`;
  });
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

  return Object.values(ATTRACTION_TYPE_OPTION_META).map((optionMeta) => {
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
 * 在主导选项打平时解析更贴近整体分数的偏好类型。
 * 复杂度评估：O(1)
 * 打平候选固定不超过 4 个，属于常量级计算。
 * @param {Array<string>} tiedTiers 打平的选项层级。
 * @param {number} averageScore 平均分（1~4）。
 * @returns {string} 解析后的选项层级。
 */
function resolveTiedDominantTier(tiedTiers, averageScore) {
  return [...tiedTiers].sort((leftTier, rightTier) => {
    const leftScore = Number(ATTRACTION_TYPE_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(ATTRACTION_TYPE_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时优先取更高分类型，减少结果与总分区间的违和感。
    return rightScore - leftScore;
  })[0] ?? "A";
}

/**
 * 解析主导吸引偏好。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} totalScore 总分。
 * @returns {{ tier: string, name: string, description: string, label: string, count: number }} 主导偏好画像。
 */
function resolveDominantProfile(answerSummary, totalScore) {
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
      ? resolveTiedDominantTier(tiedTiers, averageScore)
      : tiedTiers[0] ?? "A";
  const matchedProfile =
    ATTRACTION_TYPE_DOMINANT_RULES[resolvedTier] ??
    ATTRACTION_TYPE_DOMINANT_RULES.A;
  const optionMeta =
    ATTRACTION_TYPE_OPTION_META[resolvedTier] ?? ATTRACTION_TYPE_OPTION_META.A;

  return {
    tier: resolvedTier,
    name: matchedProfile.name,
    description: matchedProfile.description,
    label: optionMeta.fullLabel,
    count: countMap[resolvedTier] ?? 0,
  };
}

/**
 * 构建心动偏好雷达图数据。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<{ key: string, name: string, label: string, score: number, color: string }>} 雷达图数据。
 */
function buildRadarItems(answerSummary) {
  const countMap = buildOptionCountMap(answerSummary);
  const answeredCount = Math.max(
    1,
    answerSummary.filter((summaryItem) => Boolean(summaryItem.optionId)).length,
  );

  return Object.values(ATTRACTION_TYPE_OPTION_META).map((optionMeta) => ({
    key: optionMeta.tier,
    name: optionMeta.label,
    label: optionMeta.label,
    score: clampPercent(((countMap[optionMeta.tier] ?? 0) / answeredCount) * 100),
    color: optionMeta.color,
  }));
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.dominantProfile 主导偏好画像。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  dominantProfile,
}) {
  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 48))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `高频选择更偏向 ${dominantProfile.label ?? "A 清冷稳定型"}，说明你在心动判断里已经形成了相对稳定的偏好路径。`,
    String(resultRule.desireLine ?? "").trim() || "你正在识别自己真正会被什么样的人吸引。",
  ].join(" ");
}

/**
 * 计算你会被哪类人吸引的本地结果。
 * 复杂度评估：O(Q * O)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 选项分布、主导偏好与雷达图统计均为 O(Q)。
 * @param {object} params 分析参数。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 已选答案。
 * @returns {{
 *  score: number,
 *  maxScore: number,
 *  answeredCount: number,
 *  resultRule: object,
 *  dominantProfile: object,
 *  optionDistribution: Array<object>,
 *  radarItems: Array<object>,
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string
 * }} 本地结果。
 */
export function analyzeAttractionTypeLocally({ questions, answerIds }) {
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
  const resultRule = resolveAttractionTypeResultRule(totalScore);
  const dominantProfile = resolveDominantProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildRadarItems(answerSummary);
  const summaryLines = buildSummaryLines(answerSummary);
  const localNarrative = buildLocalNarrative({
    totalScore,
    maxScore,
    resultRule,
    dominantProfile,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    dominantProfile,
    optionDistribution,
    radarItems,
    summaryLines,
    answerSummary,
    localNarrative,
  };
}
