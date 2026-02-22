import { resolveSoulCatArtworkByKey } from "../constants/soulCatArtwork";

/**
 * 灵魂猫咪评分区间配置：
 * 关键逻辑：严格按产品规则映射总分区间，避免类型漂移。
 */
const SOUL_CAT_PROFILE_RULES = [
  {
    key: "ragdoll",
    minScore: 16,
    maxScore: 23,
    name: "布偶猫・温柔天使型",
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
    minScore: 24,
    maxScore: 31,
    name: "英短猫・安稳佛系型",
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
    minScore: 32,
    maxScore: 39,
    name: "美短猫・元气机灵型",
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
    minScore: 40,
    maxScore: 45,
    name: "暹罗猫・粘人忠诚型",
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
    minScore: 46,
    maxScore: 50,
    name: "波斯猫・优雅贵气型",
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
    minScore: 51,
    maxScore: 55,
    name: "缅因猫・温柔巨人型",
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
    minScore: 56,
    maxScore: 59,
    name: "德文卷毛猫・精灵古怪型",
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
    minScore: 60,
    maxScore: 62,
    name: "橘猫・治愈吃货型",
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
    minScore: 63,
    maxScore: 64,
    name: "狸花猫・自由灵魂型",
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
 * 计算总分。
 * 复杂度评估：O(Q)
 * Q 为题目数量（固定 16），仅做单次线性扫描。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案列表。
 * @returns {number} 总分值（16~64）。
 */
function calculateTotalScore(questions, answerIds) {
  const rawTotal = questions.reduce((sumValue, questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );
    const optionScore = toSafeNumber(selectedOption?.score);
    return sumValue + optionScore;
  }, 0);

  const clampedScore = Math.max(SCORE_RANGE.min, Math.min(SCORE_RANGE.max, rawTotal));
  return Math.round(clampedScore);
}

/**
 * 根据总分映射主类型。
 * @param {number} totalScore 总分值。
 * @returns {object} 匹配的类型规则。
 */
function resolvePrimaryProfile(totalScore) {
  return (
    SOUL_CAT_PROFILE_RULES.find(
      (profileItem) =>
        totalScore >= profileItem.minScore && totalScore <= profileItem.maxScore,
    ) ?? SOUL_CAT_PROFILE_RULES[0]
  );
}

/**
 * 计算类型匹配度。
 * @param {number} totalScore 总分值。
 * @param {object} profileItem 类型规则。
 * @returns {number} 匹配度百分比（0~100）。
 */
function calculateProfileMatchScore(totalScore, profileItem) {
  const isInRange =
    totalScore >= profileItem.minScore && totalScore <= profileItem.maxScore;
  if (isInRange) {
    return 100;
  }

  const distanceToRange =
    totalScore < profileItem.minScore
      ? profileItem.minScore - totalScore
      : totalScore - profileItem.maxScore;

  // 关键逻辑：每偏离 1 分衰减 12%，用于突出区间匹配的明显差异。
  return Math.max(0, Math.min(100, 100 - distanceToRange * 12));
}

/**
 * 生成 Top 3 候选类型。
 * 复杂度评估：O(P log P)
 * P 为类型数量（固定 9），排序开销为常量级。
 * @param {number} totalScore 总分值。
 * @returns {Array<{ key: string, name: string, score: number, tagLine: string }>} Top3 候选。
 */
function buildTopThreeProfiles(totalScore) {
  return SOUL_CAT_PROFILE_RULES.map((profileItem) => ({
    key: profileItem.key,
    name: profileItem.name,
    score: calculateProfileMatchScore(totalScore, profileItem),
    tagLine: profileItem.tagLine,
  }))
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

  const totalScore = calculateTotalScore(safeQuestions, safeAnswerIds);
  const matchedProfile = resolvePrimaryProfile(totalScore);
  const topThreeProfiles = buildTopThreeProfiles(totalScore);
  const answerSummary = buildAnswerSummary(safeQuestions, safeAnswerIds);
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
