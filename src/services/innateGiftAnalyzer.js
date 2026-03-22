/**
 * 天赋主题选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const INNATE_GIFT_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "洞察向",
    fullLabel: "A 洞察向",
    score: 1,
    color: "#5a8ff6",
  },
  B: {
    tier: "B",
    label: "共情向",
    fullLabel: "B 共情向",
    score: 2,
    color: "#6fb1ff",
  },
  C: {
    tier: "C",
    label: "灵感向",
    fullLabel: "C 灵感向",
    score: 3,
    color: "#82c8ff",
  },
  D: {
    tier: "D",
    label: "逻辑向",
    fullLabel: "D 逻辑向",
    score: 4,
    color: "#3d74db",
  },
});

/**
 * 天赋结果区间规则：
 * 关键逻辑：主结果始终按总分区间判定，严格对齐需求提供的 6 段区间。
 */
const INNATE_GIFT_RESULT_RULES = Object.freeze([
  {
    key: "insight-gift",
    min: 12,
    max: 18,
    levelName: "洞察天赋",
    coreTag: "天生自带读心 buff",
    giftLabel: "看透本质",
    summary:
      "你天生直觉超强，能一眼看透人心与局势，清醒通透，自带“读心”buff。",
    tagChips: ["直觉强", "看得准", "洞察快"],
    talentLine:
      "你很擅长从复杂信息里抓核心，很多人还在表面打转时，你已经摸到关键脉络。",
    carePoints: [
      "你对氛围、潜台词和人心变化特别敏锐，常常先一步感知局势。",
      "你的强项不是信息量，而是能把零散线索迅速收束成判断。",
    ],
  },
  {
    key: "empathy-gift",
    min: 19,
    max: 24,
    levelName: "共情天赋",
    coreTag: "自带治愈力场",
    giftLabel: "共情疗愈",
    summary:
      "你细腻柔软、共情力拉满，总能治愈身边人，是行走的小太阳。",
    tagChips: ["情绪敏感", "会安抚人", "温柔治愈"],
    talentLine:
      "你天然懂得先接住别人，再慢慢把情绪理顺，这种柔软本身就是稀缺能力。",
    carePoints: [
      "你能快速感知情绪温度，知道别人什么时候需要陪伴、什么时候需要安静。",
      "你的天赋不是说服，而是让人愿意在你面前卸下防备。",
    ],
  },
  {
    key: "aesthetic-gift",
    min: 25,
    max: 30,
    levelName: "审美天赋",
    coreTag: "自带高级感雷达",
    giftLabel: "审美感知",
    summary:
      "你审美在线、品味独特，对美与氛围格外敏感，自带高级感与艺术感。",
    tagChips: ["审美在线", "氛围敏锐", "品味稳定"],
    talentLine:
      "你对色彩、质感、氛围和节奏的感知很强，往往能凭感觉选到最对的表达方式。",
    carePoints: [
      "你能察觉别人忽略的细节差异，并快速判断什么更协调、什么更高级。",
      "这种能力不只体现在好看上，也体现在你对场域气质的整体把握上。",
    ],
  },
  {
    key: "creative-gift",
    min: 31,
    max: 36,
    levelName: "创意天赋",
    coreTag: "脑洞和点子都很多",
    giftLabel: "创意表达",
    summary:
      "你脑洞大、想法多，擅长制造快乐与惊喜，走到哪都能活跃气氛。",
    tagChips: ["脑洞大", "点子快", "气氛发动机"],
    talentLine:
      "你不是按常规路径做事的人，越开放的场景越能激发你的灵感和创造力。",
    carePoints: [
      "你擅长把普通场景变得有趣，让关系和团队都更轻盈有活力。",
      "很多人只会解决问题，而你还能顺手制造记忆点和惊喜感。",
    ],
  },
  {
    key: "execution-gift",
    min: 37,
    max: 42,
    levelName: "执行天赋",
    coreTag: "稳、准、能落地",
    giftLabel: "执行落地",
    summary:
      "你稳重靠谱、执行力超强，遇事不慌，凡事都能落地解决，让人超安心。",
    tagChips: ["执行稳定", "不慌不乱", "落地很强"],
    talentLine:
      "你擅长把抽象目标拆成清晰步骤，别人觉得麻烦的事，到你手里会变得可推进、可完成。",
    carePoints: [
      "你处理问题时很少空转，更关注怎么把事情推进到结果。",
      "你的价值感往往来自可交付和可信任，这种稳定性很难替代。",
    ],
  },
  {
    key: "leader-gift",
    min: 43,
    max: 48,
    levelName: "领袖天赋",
    coreTag: "自带大局观和责任感",
    giftLabel: "统筹带队",
    summary:
      "你逻辑清晰、有大局观，擅长统筹规划，自带气场与责任感，天生带队者。",
    tagChips: ["大局观强", "会带队", "责任感高"],
    talentLine:
      "你不仅会解决眼前问题，还会本能地考虑节奏、资源和整体方向，这就是带队型思维。",
    carePoints: [
      "你对秩序、规划和目标推进有天然敏感度，适合承担关键决策与统筹职责。",
      "很多人能把自己的事做好，而你更容易看到整盘局怎么赢。",
    ],
  },
]);

/**
 * 主导选项画像规则：
 * 关键逻辑：主导选项只做反应倾向侧写，不覆盖总分主结果。
 */
const INNATE_GIFT_DOMINANT_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "洞察反应型",
    description: "你习惯先感知本质和局势，再做出判断。",
  },
  B: {
    tier: "B",
    name: "共情反应型",
    description: "你习惯先感受情绪和关系温度，再决定怎么回应。",
  },
  C: {
    tier: "C",
    name: "灵感反应型",
    description: "你习惯用创意、轻盈和新鲜感去化解问题。",
  },
  D: {
    tier: "D",
    name: "逻辑反应型",
    description: "你习惯用结构、规则和行动方案来推动事情落地。",
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
function resolveInnateGiftResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 12));
  const matchedRule = INNATE_GIFT_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? INNATE_GIFT_RESULT_RULES[INNATE_GIFT_RESULT_RULES.length - 1];
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
 * 构建作答倾向分布图数据。
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

  return Object.values(INNATE_GIFT_OPTION_META).map((optionMeta) => {
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
 * 在主导选项打平时解析更贴近整体分数的反应类型。
 * 复杂度评估：O(1)
 * 打平候选固定不超过 4 个，属于常量级计算。
 * @param {Array<string>} tiedTiers 打平的选项层级。
 * @param {number} averageScore 平均分（1~4）。
 * @returns {string} 解析后的选项层级。
 */
function resolveTiedDominantTier(tiedTiers, averageScore) {
  return [...tiedTiers].sort((leftTier, rightTier) => {
    const leftScore = Number(INNATE_GIFT_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(INNATE_GIFT_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时优先取更高分类型，减少结果与总分区间的割裂感。
    return rightScore - leftScore;
  })[0] ?? "A";
}

/**
 * 解析主导反应画像。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} totalScore 总分。
 * @returns {{ tier: string, name: string, description: string, label: string, count: number }} 主导画像。
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
    INNATE_GIFT_DOMINANT_RULES[resolvedTier] ??
    INNATE_GIFT_DOMINANT_RULES.A;
  const optionMeta =
    INNATE_GIFT_OPTION_META[resolvedTier] ?? INNATE_GIFT_OPTION_META.A;

  return {
    tier: resolvedTier,
    name: matchedProfile.name,
    description: matchedProfile.description,
    label: optionMeta.fullLabel,
    count: countMap[resolvedTier] ?? 0,
  };
}

/**
 * 构建天赋反应图谱数据。
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

  return Object.values(INNATE_GIFT_OPTION_META).map((optionMeta) => ({
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
 * @param {object} params.dominantProfile 主导反应画像。
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
    `高频作答更偏向 ${dominantProfile.label ?? "A 洞察向"}，说明你的本能反应路径已经相对稳定。`,
    String(resultRule.talentLine ?? "").trim() || "你的天赋线索正在汇总中。",
  ].join(" ");
}

/**
 * 计算天生自带什么天赋的本地结果。
 * 复杂度评估：O(Q * O)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 选项分布、主导画像与雷达图统计均为 O(Q)。
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
export function analyzeInnateGiftLocally({ questions, answerIds }) {
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
  const resultRule = resolveInnateGiftResultRule(totalScore);
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
