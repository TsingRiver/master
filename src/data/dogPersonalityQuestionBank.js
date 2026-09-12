/**
 * 狗狗系人格测试题库（12 题）：
 * 1. 每题固定 4 个选项，分值规则为 A=1、B=2、C=3、D=4。
 * 2. dimension / dimensionLabel 用于结果页构建“狗狗人格图谱”。
 * 3. 题目顺序严格沿用需求原稿，避免总分区间解释与用户体感漂移。
 */

/**
 * 固定选项元数据：
 * 关键逻辑：所有题目复用统一分值与反应画像，保证跨题计分口径始终一致。
 */
const DOG_PERSONALITY_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    profileKey: "warm-outgoing",
    profileName: "热情外放向",
  },
  B: {
    tier: "B",
    score: 2,
    profileKey: "steady-companion",
    profileName: "稳妥陪伴向",
  },
  C: {
    tier: "C",
    score: 3,
    profileKey: "sensitive-slowburn",
    profileName: "细腻慢热向",
  },
  D: {
    tier: "D",
    score: 4,
    profileKey: "independent-boundary",
    profileName: "自主边界向",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, profileKey: string, profileName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(DOG_PERSONALITY_OPTION_META).map(
    ([tier, optionMeta]) => ({
      id: `${questionId}-option-${tier.toLowerCase()}`,
      tier,
      // 关键逻辑：题目页只展示选项文案，不暴露 A/B/C/D 字母，避免用户被字母顺序干扰。
      label: String(optionLabelMap[tier] ?? "").trim(),
      score: optionMeta.score,
      profileKey: optionMeta.profileKey,
      profileName: optionMeta.profileName,
    }),
  );
}

/**
 * 组装标准题目对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {string} params.dimension 维度键。
 * @param {string} params.dimensionLabel 维度名称。
 * @param {{ A: string, B: string, C: string, D: string }} params.optionLabelMap 选项文案映射。
 * @returns {{
 *  id: string,
 *  title: string,
 *  description: string,
 *  dimension: string,
 *  dimensionLabel: string,
 *  options: Array<object>
 * }} 标准题目对象。
 */
function buildQuestion({ id, title, dimension, dimensionLabel, optionLabelMap }) {
  return {
    id,
    title,
    description: "每题选一个最符合你第一反应的答案。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 测一测｜你是哪种狗狗系人格？完整题库。
 */
export const DOG_PERSONALITY_QUESTION_BANK = [
  buildQuestion({
    id: "dog-personality-q01",
    title: "陌生人对你热情，你会？",
    dimension: "social-temperature",
    dimensionLabel: "社交温度",
    optionLabelMap: {
      A: "立刻回应，超级自来熟",
      B: "礼貌友好，保持分寸",
      C: "有点害羞，慢慢熟悉",
      D: "保持距离，不太主动",
    },
  }),
  buildQuestion({
    id: "dog-personality-q02",
    title: "朋友难过时你更会？",
    dimension: "support-expression",
    dimensionLabel: "陪伴表达",
    optionLabelMap: {
      A: "逗他开心，转移注意力",
      B: "认真倾听，陪在身边",
      C: "温柔安慰，轻声鼓励",
      D: "默默陪伴，不打扰他",
    },
  }),
  buildQuestion({
    id: "dog-personality-q03",
    title: "你更喜欢的相处模式？",
    dimension: "boundary-security",
    dimensionLabel: "边界安全感",
    optionLabelMap: {
      A: "热闹黏人，时刻在一起",
      B: "轻松自在，互相陪伴",
      C: "温柔依赖，彼此信任",
      D: "独立舒服，互不束缚",
    },
  }),
  buildQuestion({
    id: "dog-personality-q04",
    title: "被人误会时你会？",
    dimension: "boundary-security",
    dimensionLabel: "边界安全感",
    optionLabelMap: {
      A: "当场解释，不想委屈",
      B: "冷静说明，讲清事实",
      C: "默默难过，不太辩解",
      D: "懒得解释，懂的自然懂",
    },
  }),
  buildQuestion({
    id: "dog-personality-q05",
    title: "你对待喜欢的人？",
    dimension: "support-expression",
    dimensionLabel: "陪伴表达",
    optionLabelMap: {
      A: "主动黏人，热烈直白",
      B: "细心照顾，温柔踏实",
      C: "害羞依赖，默默在意",
      D: "高冷克制，暗中关注",
    },
  }),
  buildQuestion({
    id: "dog-personality-q06",
    title: "周末你更想？",
    dimension: "social-temperature",
    dimensionLabel: "社交温度",
    optionLabelMap: {
      A: "出门玩耍，到处逛逛",
      B: "约友小聚，轻松聊天",
      C: "宅家贴贴，安静放松",
      D: "独自独处，享受自由",
    },
  }),
  buildQuestion({
    id: "dog-personality-q07",
    title: "你做事风格更像？",
    dimension: "inner-rhythm",
    dimensionLabel: "内核节奏",
    optionLabelMap: {
      A: "冲动热情，说做就做",
      B: "稳重靠谱，有条有理",
      C: "温柔细心，慢慢完成",
      D: "佛系随性，顺其自然",
    },
  }),
  buildQuestion({
    id: "dog-personality-q08",
    title: "你对“安全感”的需求？",
    dimension: "boundary-security",
    dimensionLabel: "边界安全感",
    optionLabelMap: {
      A: "很高，需要时刻被偏爱",
      B: "适中，稳定就很安心",
      C: "较强，害怕被忽略",
      D: "较低，自己给自己就够",
    },
  }),
  buildQuestion({
    id: "dog-personality-q09",
    title: "生气时你的表现？",
    dimension: "inner-rhythm",
    dimensionLabel: "内核节奏",
    optionLabelMap: {
      A: "直接表达，来得快去得快",
      B: "冷静沟通，不情绪化",
      C: "委屈沉默，偷偷难过",
      D: "冷淡疏离，不想说话",
    },
  }),
  buildQuestion({
    id: "dog-personality-q10",
    title: "你更像哪种性格？",
    dimension: "social-temperature",
    dimensionLabel: "社交温度",
    optionLabelMap: {
      A: "元气活泼，永远开心",
      B: "温柔忠诚，让人安心",
      C: "软萌细腻，很会共情",
      D: "独立清醒，不爱麻烦",
    },
  }),
  buildQuestion({
    id: "dog-personality-q11",
    title: "别人求助你时？",
    dimension: "support-expression",
    dimensionLabel: "陪伴表达",
    optionLabelMap: {
      A: "立刻答应，热心帮忙",
      B: "尽力而为，说到做到",
      C: "不好意思拒绝，心软",
      D: "看情况，不想勉强自己",
    },
  }),
  buildQuestion({
    id: "dog-personality-q12",
    title: "你内心最真实的样子？",
    dimension: "inner-rhythm",
    dimensionLabel: "内核节奏",
    optionLabelMap: {
      A: "天真热烈，没什么心眼",
      B: "温柔踏实，重情重义",
      C: "敏感缺爱，很需要陪伴",
      D: "成熟独立，习惯靠自己",
    },
  }),
];
