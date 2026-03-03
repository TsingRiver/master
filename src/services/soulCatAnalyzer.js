import { resolveSoulCatArtworkByKey } from "../constants/soulCatArtwork.js";

/**
 * 灵魂猫咪评分区间配置：
 * 关键逻辑：
 * 1. 保持“总分越高，类型序号越靠后”的单调映射，结果仍由用户作答决定；
 * 2. 区间使用随机基线分位校准，降低中位区间过度拥挤导致的类型极端偏斜。
 */
export const SOUL_CAT_PROFILE_RULES = [
  {
    key: "ragdoll",
    minScore: 16,
    maxScore: 34,
    name: "布偶猫・温柔天使",
    tagLine: "被爱包围的小温柔",
    personalityBase:
      "你天生柔软敏感，习惯照顾别人情绪，总把懂事留给世界。",
    nextLifeScript:
      "会是一只被捧在手心的小天使，不用坚强，不用逞强，只管安心被爱。",
    bestLife:
      "安稳、温柔、有人偏爱，不用勉强自己去迎合任何人。",
    healingMessage: "愿你这一生，也能像下辈子一样，被温柔好好接住。",
  },
  {
    key: "british-shorthair",
    minScore: 35,
    maxScore: 36,
    name: "英短猫・安稳佛系",
    tagLine: "淡定通透的小福气",
    personalityBase:
      "情绪稳定，不爱计较，懂得自愈，是身边人最安心的存在。",
    nextLifeScript:
      "会是一只佛系又治愈的小猫，有吃有喝，有暖窝，一生无风无浪。",
    bestLife:
      "简单、松弛、慢节奏，平安喜乐就是最大的幸运。",
    healingMessage: "慢慢来，一切都会是你喜欢的样子。",
  },
  {
    key: "american-shorthair",
    minScore: 37,
    maxScore: 38,
    name: "美短猫・元气机灵",
    tagLine: "永远好奇的小太阳",
    personalityBase:
      "活泼开朗，对世界永远充满热情，心里住着长不大的小孩。",
    nextLifeScript:
      "会是一只精力满满的快乐小猫，每天都有新冒险，活得热烈又自由。",
    bestLife:
      "有趣、新鲜、不被定义，永远保持热爱与期待。",
    healingMessage: "保持可爱，永远热烈，永远做自己的小太阳。",
  },
  {
    key: "siamese",
    minScore: 39,
    maxScore: 39,
    name: "暹罗猫・粘人忠诚",
    tagLine: "认定了就不放手",
    personalityBase:
      "重情专一，爱得直白，一旦信任，就会毫无保留。",
    nextLifeScript:
      "会是一只眼里只有一人的小猫，忠诚、粘人、偏爱到底。",
    bestLife:
      "有坚定的陪伴，有明确的偏爱，不被敷衍，不被冷落。",
    healingMessage: "你值得被坚定选择，被长久偏爱。",
  },
  {
    key: "persian",
    minScore: 40,
    maxScore: 40,
    name: "波斯猫・优雅贵气",
    tagLine: "自带气质的小贵族",
    personalityBase:
      "精致慢热，有品位有风骨，不爱争抢，自带疏离感。",
    nextLifeScript:
      "会是一只优雅从容的小猫，生活精致，被人珍视，从容过一生。",
    bestLife:
      "安静、高级、有质感，不慌不忙，优雅自在。",
    healingMessage: "不必迎合众生，你自会发光。",
  },
  {
    key: "maine-coon",
    minScore: 41,
    maxScore: 41,
    name: "缅因猫・温柔巨人",
    tagLine: "外冷内热的守护者",
    personalityBase:
      "外表强大独立，内心却柔软善良，习惯默默保护身边人。",
    nextLifeScript:
      "会是一只温柔的大猫，有足够安全感，既能护己，也能爱人。",
    bestLife:
      "强大且温柔，独立又被爱，有底气，也有依靠。",
    healingMessage: "愿你被世界温柔守护，不必独自坚强。",
  },
  {
    key: "devon-rex",
    minScore: 42,
    maxScore: 43,
    name: "德文卷毛猫・精灵古怪",
    tagLine: "古灵精怪的小调皮",
    personalityBase:
      "脑洞超大，有趣不呆板，是人群里最特别的开心果。",
    nextLifeScript:
      "会是一只精灵般的小猫，可盐可甜，永远不被生活磨平棱角。",
    bestLife:
      "自由、有趣、不被规矩束缚，做最真实的自己。",
    healingMessage: "保持古怪，保持可爱，永远做独一无二的你。",
  },
  {
    key: "orange-cat",
    minScore: 44,
    maxScore: 45,
    name: "橘猫・治愈吃货",
    tagLine: "没心没肺小幸福",
    personalityBase:
      "心大乐观，容易满足，烦恼很少，快乐很简单。",
    nextLifeScript:
      "会是一只无忧无虑的干饭猫，吃饱就睡，醒来就玩，被温柔投喂。",
    bestLife:
      "三餐温暖，岁月安稳，简单快乐，无忧无虑。",
    healingMessage: "吃饱睡好，烦恼全跑，平安就是最大的福报。",
  },
  {
    key: "native-cat",
    minScore: 46,
    maxScore: 64,
    name: "狸花猫・自由灵魂",
    tagLine: "不讨好、不依附，只忠于自己",
    personalityBase:
      "热爱自由，有原则有骄傲，不喜欢被束缚，也不爱勉强。",
    nextLifeScript:
      "会是一只潇洒自在的小猫，有野性也有温柔，活得坦荡又漂亮。",
    bestLife:
      "随心而行，无拘无束，忠于内心，不问东西。",
    healingMessage: "愿你一生自由坦荡，不必迎合，永远闪亮。",
  },
];

/**
 * 安全分值区间。
 */
const SCORE_RANGE = {
  min: 16,
  max: 64,
};

/**
 * 猫语片段中间标点池。
 * 关键逻辑：优先使用中文标点，贴合结果页中文语境。
 */
const CAT_LANGUAGE_MID_PUNCTUATIONS = Object.freeze(["，", "、", "～", "…"]);

/**
 * 猫语片段收尾标点池。
 */
const CAT_LANGUAGE_END_PUNCTUATIONS = Object.freeze(["！", "。", "～", "…"]);

/**
 * 规范化数值。
 * @param {unknown} value 待转换值。
 * @returns {number} 安全数字。
 */
function toSafeNumber(value) {
  const parsedValue = Number(value ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

/**
 * 评分选项池（用于构建随机基线分布）。
 */
const SOUL_CAT_OPTION_SCORE_VALUES = Object.freeze([1, 2, 3, 4]);

/**
 * 分值分布缓存：
 * key 为题量，value 为分值概率与累计概率映射。
 */
const SOUL_CAT_SCORE_DISTRIBUTION_CACHE = new Map();

/**
 * 基于题量构建总分概率分布（随机基线）。
 * 关键逻辑：使用动态规划精确计算“各总分出现概率”，避免模拟误差。
 * 复杂度评估：O(Q * S * O)。
 * Q 为题量，S 为可达总分状态数，O 为选项分值数量（固定 4）。
 * @param {number} questionCount 题目数量。
 * @returns {{ probabilityByScoreMap: Map<number, number>, cdfBeforeByScoreMap: Map<number, number> }} 概率映射。
 */
function buildSoulCatScoreDistribution(questionCount) {
  const safeQuestionCount = Math.max(1, Math.floor(questionCount || 0));
  let sumCountMap = new Map([[0, 1]]);

  for (let questionIndex = 0; questionIndex < safeQuestionCount; questionIndex += 1) {
    const nextSumCountMap = new Map();
    sumCountMap.forEach((countValue, scoreSum) => {
      SOUL_CAT_OPTION_SCORE_VALUES.forEach((optionScore) => {
        const nextScoreSum = scoreSum + optionScore;
        const previousCount = nextSumCountMap.get(nextScoreSum) ?? 0;
        nextSumCountMap.set(nextScoreSum, previousCount + countValue);
      });
    });
    sumCountMap = nextSumCountMap;
  }

  const totalCombinationCount = Math.pow(
    SOUL_CAT_OPTION_SCORE_VALUES.length,
    safeQuestionCount,
  );
  const sortedScoreList = Array.from(sumCountMap.keys()).sort((leftScore, rightScore) =>
    leftScore - rightScore,
  );
  const probabilityByScoreMap = new Map();
  const cdfBeforeByScoreMap = new Map();
  let cumulativeProbability = 0;

  sortedScoreList.forEach((scoreValue) => {
    const probability = (sumCountMap.get(scoreValue) ?? 0) / totalCombinationCount;
    cdfBeforeByScoreMap.set(scoreValue, cumulativeProbability);
    probabilityByScoreMap.set(scoreValue, probability);
    cumulativeProbability += probability;
  });

  return {
    probabilityByScoreMap,
    cdfBeforeByScoreMap,
  };
}

/**
 * 获取题量对应的随机基线分布（带缓存）。
 * 复杂度评估：缓存命中 O(1)，首次构建见 `buildSoulCatScoreDistribution`。
 * @param {number} questionCount 题目数量。
 * @returns {{ probabilityByScoreMap: Map<number, number>, cdfBeforeByScoreMap: Map<number, number> }} 分布映射。
 */
function getSoulCatScoreDistribution(questionCount) {
  const safeQuestionCount = Math.max(1, Math.floor(questionCount || 0));
  if (!SOUL_CAT_SCORE_DISTRIBUTION_CACHE.has(safeQuestionCount)) {
    SOUL_CAT_SCORE_DISTRIBUTION_CACHE.set(
      safeQuestionCount,
      buildSoulCatScoreDistribution(safeQuestionCount),
    );
  }
  return SOUL_CAT_SCORE_DISTRIBUTION_CACHE.get(safeQuestionCount);
}

/**
 * 基于答卷内容计算稳定选择器（0~1）。
 * 关键逻辑：同一份答卷始终得到同一选择器，保证结果可复现且不依赖运行时随机数。
 * 复杂度评估：O(Q * L)，Q 为题量，L 为平均 optionId 长度。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {number} 稳定选择器。
 */
function resolveStableSelector(answerSummary) {
  let hashValue = 2166136261;

  answerSummary.forEach((summaryItem, index) => {
    const tokenText = `${index}:${summaryItem.optionId ?? "none"}:${summaryItem.score}`;
    for (let charIndex = 0; charIndex < tokenText.length; charIndex += 1) {
      hashValue ^= tokenText.charCodeAt(charIndex);
      hashValue = Math.imul(hashValue, 16777619);
    }
  });

  return (hashValue >>> 0) / 4294967296;
}

/**
 * 计算总分。
 * 复杂度评估：O(Q)，Q 为题量（当前固定 16）。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {number} 总分值（16~64）。
 */
function calculateTotalScore(answerSummary) {
  const rawTotalScore = answerSummary.reduce(
    (sumValue, summaryItem) => sumValue + toSafeNumber(summaryItem?.score),
    0,
  );
  const clampedScore = Math.max(SCORE_RANGE.min, Math.min(SCORE_RANGE.max, rawTotalScore));
  return Math.round(clampedScore);
}

/**
 * 根据总分 + 答卷细节映射主类型。
 * 关键逻辑：
 * 1. 总分先确定概率质量位置；
 * 2. 同分人群再用“稳定选择器”做细粒度分流，缓解中心分值拥挤。
 * @param {object} params 参数对象。
 * @param {number} params.totalScore 总分值。
 * @param {Array<object>} params.answerSummary 结构化答卷摘要。
 * @returns {{ matchedProfile: object, profileIndex: number, quantile: number }} 主类型映射结果。
 */
function resolvePrimaryProfile({ totalScore, answerSummary }) {
  const profileCount = SOUL_CAT_PROFILE_RULES.length;
  const distribution = getSoulCatScoreDistribution(answerSummary.length);
  const probability = distribution.probabilityByScoreMap.get(totalScore) ?? 0;
  const cdfBefore = distribution.cdfBeforeByScoreMap.get(totalScore) ?? 0;
  const stableSelector = resolveStableSelector(answerSummary);
  const rawQuantile = cdfBefore + stableSelector * probability;
  const normalizedQuantile = Math.max(0, Math.min(0.999999999, rawQuantile));
  const profileIndex = Math.min(
    profileCount - 1,
    Math.floor(normalizedQuantile * profileCount),
  );

  return {
    matchedProfile: SOUL_CAT_PROFILE_RULES[profileIndex],
    profileIndex,
    quantile: normalizedQuantile,
  };
}

/**
 * 计算类型匹配度。
 * @param {number} quantile 当前答卷分位值（0~1）。
 * @param {number} profileIndex 类型索引。
 * @returns {number} 匹配度百分比（0~100）。
 */
function calculateProfileMatchScore(quantile, profileIndex) {
  const profileCount = SOUL_CAT_PROFILE_RULES.length;
  const profileCenter = (profileIndex + 0.5) / profileCount;
  const normalizedDistance = Math.abs(quantile - profileCenter) * profileCount;
  return Math.max(0, Math.min(100, Math.round((1 - normalizedDistance) * 100)));
}

/**
 * 生成 Top 3 候选类型。
 * 复杂度评估：O(P log P)，P 为类型数量（固定 9）。
 * @param {object} params 参数对象。
 * @param {number} params.quantile 当前答卷分位值。
 * @param {string} params.matchedProfileKey 主类型 key。
 * @returns {Array<{ key: string, name: string, score: number, tagLine: string }>} Top3 候选。
 */
function buildTopThreeProfiles({ quantile, matchedProfileKey }) {
  return SOUL_CAT_PROFILE_RULES.map((profileItem, profileIndex) => {
    const scoreValue =
      profileItem.key === matchedProfileKey
        ? 100
        : calculateProfileMatchScore(quantile, profileIndex);
    return {
      key: profileItem.key,
      name: profileItem.name,
      score: scoreValue,
      tagLine: profileItem.tagLine,
    };
  })
    .sort((leftItem, rightItem) => rightItem.score - leftItem.score)
    .slice(0, 3);
}

/**
 * 构建结构化答卷摘要。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案列表。
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
      score: toSafeNumber(selectedOption?.score),
    };
  });
}

/**
 * 构建摘要文本列表。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<string>} 可读摘要行。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 生成指定区间内随机整数。
 * 复杂度评估：O(1)
 * @param {number} minValue 最小值（包含）。
 * @param {number} maxValue 最大值（包含）。
 * @returns {number} 随机整数。
 */
function pickRandomInteger(minValue, maxValue) {
  const safeMinValue = Math.ceil(Math.min(minValue, maxValue));
  const safeMaxValue = Math.floor(Math.max(minValue, maxValue));
  const randomValue = Math.random();
  return Math.floor(randomValue * (safeMaxValue - safeMinValue + 1)) + safeMinValue;
}

/**
 * 从候选列表中随机取值。
 * 复杂度评估：O(1)
 * @param {Array<string>} candidateList 候选列表。
 * @param {string} fallbackValue 兜底值。
 * @returns {string} 随机结果。
 */
function pickRandomFromList(candidateList, fallbackValue) {
  if (!Array.isArray(candidateList) || candidateList.length === 0) {
    return fallbackValue;
  }

  const randomIndex = pickRandomInteger(0, candidateList.length - 1);
  return candidateList[randomIndex] ?? fallbackValue;
}

/**
 * 生成“猫语寄托”文案。
 * 复杂度评估：O(S)
 * S 为猫语片段数量（2~4），实际为常量级开销。
 * @returns {string} 猫语寄托文案。
 */
function buildRandomCatLanguageWish() {
  const segmentCount = pickRandomInteger(2, 4);
  const catLanguageSegments = Array.from({ length: segmentCount }, (_, segmentIndex) => {
    const meowCount = pickRandomInteger(2, 8);
    const meowText = "喵".repeat(meowCount);
    const punctuation = segmentIndex === segmentCount - 1
      ? pickRandomFromList(CAT_LANGUAGE_END_PUNCTUATIONS, "！")
      : pickRandomFromList(CAT_LANGUAGE_MID_PUNCTUATIONS, "，");

    // 关键逻辑：每段都补标点，保证输出形态类似“喵喵喵，喵喵喵喵！”。
    return `${meowText}${punctuation}`;
  });

  return catLanguageSegments.join("");
}

/**
 * 灵魂猫咪本地分析。
 * 复杂度评估：
 * 1. 总分计算 O(Q)
 * 2. 摘要构建 O(Q)
 * 3. Top3 排序 O(P log P)
 * 总体复杂度 O(Q + P log P)，其中 Q=16、P=9，实际为常量级开销。
 * @param {object} params 入参对象。
 * @param {Array<object>} params.questions 本轮题目列表。
 * @param {Array<string|null>} params.answerIds 用户答案 ID 列表。
 * @returns {{ totalScore: number, matchedProfile: object, topThreeProfiles: Array<object>, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string, heroArtwork: { url: string, alt: string, caption: string }, catLanguageWish: string }} 本地分析结果。
 */
export function analyzeSoulCatLocally({ questions, answerIds }) {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeAnswerIds = Array.isArray(answerIds) ? answerIds : [];

  const answerSummary = buildAnswerSummary(safeQuestions, safeAnswerIds);
  const totalScore = calculateTotalScore(answerSummary);
  const primaryProfileResult = resolvePrimaryProfile({
    totalScore,
    answerSummary,
  });
  const matchedProfile = primaryProfileResult.matchedProfile;
  const topThreeProfiles = buildTopThreeProfiles({
    quantile: primaryProfileResult.quantile,
    matchedProfileKey: matchedProfile.key,
  });
  const summaryLines = buildSummaryLines(answerSummary);

  const artworkAsset = resolveSoulCatArtworkByKey(matchedProfile.key);
  const heroArtwork = {
    // 关键逻辑：结果页主图固定按“类型 key -> 文件名”映射，素材替换无需改代码。
    url: artworkAsset.url,
    alt: artworkAsset.alt || `${matchedProfile.name}插画`,
    caption: matchedProfile.tagLine,
  };

  return {
    totalScore,
    matchedProfile,
    topThreeProfiles,
    answerSummary,
    summaryLines,
    localNarrative: `${matchedProfile.personalityBase} ${matchedProfile.nextLifeScript}`,
    heroArtwork,
    // 关键逻辑：猫语寄托完全本地生成，不依赖 AI 返回。
    catLanguageWish: buildRandomCatLanguageWish(),
  };
}
