import { resolveSoulCatArtworkByKey } from "../constants/soulCatArtwork.js";

/**
 * 猫猫人格选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图保持统一视觉语义。
 */
const CAT_PERSONALITY_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "1分回应",
    fullLabel: "A 1分",
    score: 1,
    color: "#F2A65A",
  },
  B: {
    tier: "B",
    label: "2分回应",
    fullLabel: "B 2分",
    score: 2,
    color: "#F3C46B",
  },
  C: {
    tier: "C",
    label: "3分回应",
    fullLabel: "C 3分",
    score: 3,
    color: "#E7A8BE",
  },
  D: {
    tier: "D",
    label: "4分回应",
    fullLabel: "D 4分",
    score: 4,
    color: "#6E768F",
  },
});

/**
 * 猫猫人格总分区间规则：
 * 关键逻辑：主结果严格按总分区间判定，和需求文案保持一一对应，避免解释漂移。
 */
const CAT_PERSONALITY_RESULT_RULES = Object.freeze([
  {
    key: "orange-cat",
    min: 12,
    max: 18,
    levelName: "橘猫人格",
    coreTag: "快乐优先的热乎派",
    atmosphereLabel: "热闹外放",
    artworkKey: "orange-cat",
    summary: "贪吃乐观、大大咧咧，情绪稳定又好哄，快乐第一名。",
    tagChips: ["乐观直球", "热乎好哄", "元气外放"],
    companionTips: [
      "你适合有回应感的关系，冷处理会快速消耗你的热情。",
      "保留你的快乐感染力，同时也要给自己留一点情绪缓冲空间。",
      "真正适合你的人，既接得住你的热情，也不会把你的真诚当理所当然。",
    ],
    easterEggText: "你不是吵，你只是很会把生命力开到最大声。",
  },
  {
    key: "ragdoll",
    min: 19,
    max: 24,
    levelName: "布偶猫人格",
    coreTag: "温柔包容的治愈派",
    atmosphereLabel: "奶呼呼陪伴",
    artworkKey: "ragdoll",
    summary: "温柔高颜值、脾气超好，对喜欢的人无限包容。",
    tagChips: ["温柔耐心", "陪伴感强", "治愈系人格"],
    companionTips: [
      "你很会照顾关系氛围，但也别总把自己的委屈藏起来。",
      "当你开始过度迁就时，说明你需要的不是更懂事，而是更被珍惜。",
      "你适合稳定、细腻、能读懂情绪的人际环境。",
    ],
    easterEggText: "你的温柔不是没脾气，而是把锋芒换成了体贴。",
  },
  {
    key: "british-shorthair",
    min: 25,
    max: 30,
    levelName: "英短人格",
    coreTag: "松弛稳定的佛系派",
    atmosphereLabel: "慢热松弛",
    artworkKey: "british-shorthair",
    summary: "慵懒佛系、不爱计较，怎么 rua 都不生气，超好相处。",
    tagChips: ["情绪稳定", "不爱计较", "松弛感强"],
    companionTips: [
      "你自带让人放松的气场，但重要的需求还是要明确说出来。",
      "你的松弛是优势，别让别人把它误读成“怎样都行”。",
      "适合你的节奏不是轰轰烈烈，而是舒服、稳定、能长期共处。",
    ],
    easterEggText: "你不是没态度，你只是懒得把情绪浪费在不重要的人身上。",
  },
  {
    key: "american-shorthair",
    min: 31,
    max: 36,
    levelName: "美短人格",
    coreTag: "机灵好动的冒险派",
    atmosphereLabel: "鲜活有趣",
    artworkKey: "american-shorthair",
    summary: "活泼机灵、好奇心强，又皮又可爱，精力旺盛。",
    tagChips: ["好奇心强", "行动力高", "有趣带感"],
    companionTips: [
      "你需要新鲜感和互动感，太闷的环境会很快让你失去耐心。",
      "冲劲是你的优势，关键时刻多给自己一点停顿，会让判断更稳。",
      "适合你的人，会陪你探索世界，而不是总想把你按回原地。",
    ],
    easterEggText: "你的可爱不在乖，而在永远有股想冲出去看看世界的劲。",
  },
  {
    key: "siamese",
    min: 37,
    max: 42,
    levelName: "暹罗猫人格",
    coreTag: "傲娇敏感的热烈派",
    atmosphereLabel: "偏爱锁定",
    artworkKey: "siamese",
    summary: "傲娇黏人、占有欲强，爱得热烈又敏感，非常专一。",
    tagChips: ["傲娇黏人", "敏感专一", "偏爱导向"],
    companionTips: [
      "你表面可能嘴硬，但真正想要的是明确、稳定且偏爱的回应。",
      "把“在意”说出来，会比反复试探更能保护关系。",
      "你适合愿意给确定感、也能接住你敏感波动的人。",
    ],
    easterEggText: "你不是难哄，你只是需要被坚定地放在心上。",
  },
  {
    key: "black-cat",
    min: 43,
    max: 48,
    levelName: "黑猫人格",
    coreTag: "高冷清醒的独立派",
    atmosphereLabel: "独处掌控",
    artworkKey: "black-cat",
    summary: "高冷神秘、独立清醒，不爱社交，内心强大又低调。",
    tagChips: ["高冷神秘", "独立清醒", "低调强大"],
    companionTips: [
      "你天然重视边界和秩序，和人相处时最怕无意义的消耗与打扰。",
      "真正适合你的关系，不是强行拉近，而是彼此尊重空间。",
      "偶尔表达真实感受，不会削弱你的强大，反而能减少被误解。",
    ],
    easterEggText: "你不是冷，只是把热度留给了真正值得的人和事。",
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做“行为偏好侧写”，不覆盖总分主结果。
 */
const CAT_PERSONALITY_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "直球热闹派",
    description: "你更常直接靠近、直接表达、直接反应，属于外放型猫感。",
  },
  B: {
    tier: "B",
    name: "松弛观察派",
    description: "你讲究舒服和分寸，愿意靠近，但会先确认氛围是否安全。",
  },
  C: {
    tier: "C",
    name: "柔软依赖派",
    description: "你对关系有较高感受力，越在意越容易希望被接住、被偏爱。",
  },
  D: {
    tier: "D",
    name: "高冷独处派",
    description: "你更习惯把节奏握在自己手里，独立感强，也更珍惜个人空间。",
  },
});

/**
 * 黑猫人格插画兜底资源。
 * 关键逻辑：仓库原有猫咪图库不含黑猫时，使用新增 SVG，避免结果页破图。
 */
const BLACK_CAT_ARTWORK = Object.freeze({
  url: "/cats/black-cat.svg",
  alt: "黑猫人格插画",
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
 * @returns {object} 结果区间规则。
 */
function resolveCatPersonalityResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 12));
  const matchedRule = CAT_PERSONALITY_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? CAT_PERSONALITY_RESULT_RULES[CAT_PERSONALITY_RESULT_RULES.length - 1];
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
    (sumValue, currentCount) => sumValue + currentCount,
    0,
  );

  return Object.values(CAT_PERSONALITY_OPTION_META).map((optionMeta) => {
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
    const leftScore = Number(CAT_PERSONALITY_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(CAT_PERSONALITY_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时优先取更高分档，减少多数画像与总分区间的违和感。
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
    CAT_PERSONALITY_MAJORITY_RULES[resolvedTier] ??
    CAT_PERSONALITY_MAJORITY_RULES.A;
  const optionMeta =
    CAT_PERSONALITY_OPTION_META[resolvedTier] ?? CAT_PERSONALITY_OPTION_META.A;

  return {
    tier: resolvedTier,
    name: matchedProfile.name,
    description: matchedProfile.description,
    label: optionMeta.fullLabel,
    count: countMap[resolvedTier] ?? 0,
  };
}

/**
 * 解析结果页主插画。
 * @param {object} resultRule 结果区间规则。
 * @returns {{ url: string, alt: string, caption: string }} 主插画对象。
 */
function resolveHeroArtwork(resultRule) {
  const artworkKey = String(resultRule?.artworkKey ?? "").trim();
  const fallbackCaption = String(resultRule?.coreTag ?? "").trim();

  if (artworkKey === "black-cat") {
    return {
      ...BLACK_CAT_ARTWORK,
      caption: fallbackCaption,
    };
  }

  const artworkAsset = resolveSoulCatArtworkByKey(artworkKey);
  return {
    url: artworkAsset.url,
    alt: artworkAsset.alt || `${resultRule?.levelName ?? "猫猫人格"}插画`,
    caption: fallbackCaption,
  };
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.majorityProfile 多数选项画像。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
}) {
  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 48))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    String(resultRule.summary ?? "").trim() || "你的猫猫人格正在整理中。",
    `多数作答更接近 ${majorityProfile.label ?? "A 1分"}，说明你平时的反应模式偏向「${majorityProfile.name ?? "稳定观察"}」。`,
  ].join(" ");
}

/**
 * 计算猫猫人格本地结果。
 * 复杂度评估：O(Q * O)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 多数选项与分布统计为 O(Q)。
 * 综合复杂度仍为 O(Q * O)，当前 Q=12、O=4，属于稳定常量级开销。
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
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string,
 *  heroArtwork: { url: string, alt: string, caption: string },
 *  actionTips: Array<string>
 * }} 本地结果。
 */
export function analyzeCatPersonalityLocally({ questions, answerIds }) {
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
    (sumValue, summaryItem) => sumValue + toSafeNumber(summaryItem.score, 0),
    0,
  );
  const maxScore = normalizedQuestions.length * 4;
  const resultRule = resolveCatPersonalityResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const summaryLines = buildSummaryLines(answerSummary);
  const localNarrative = buildLocalNarrative({
    totalScore,
    maxScore,
    resultRule,
    majorityProfile,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    majorityProfile,
    optionDistribution,
    summaryLines,
    answerSummary,
    localNarrative,
    heroArtwork: resolveHeroArtwork(resultRule),
    actionTips: Array.isArray(resultRule.companionTips)
      ? resultRule.companionTips
      : [],
  };
}
