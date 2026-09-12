/**
 * 猫猫人格题库（12 题）：
 * 1. 每题固定 4 个选项，对应 A/B/C/D。
 * 2. 评分规则固定为 A=1、B=2、C=3、D=4。
 * 3. 题目顺序严格按照需求原稿保留，避免分数区间与结果说明失配。
 */

/**
 * 选项分值元数据：
 * 关键逻辑：题库与分析器共用同一套 tier / score 口径，避免后续维护时出现计分漂移。
 */
const CAT_PERSONALITY_OPTION_SCORES = Object.freeze([
  { tier: "A", score: 1 },
  { tier: "B", score: 2 },
  { tier: "C", score: 3 },
  { tier: "D", score: 4 },
]);

/**
 * 组装单题选项列表。
 * @param {object} params 构建参数。
 * @param {string} params.questionId 题目 ID。
 * @param {Array<string>} params.optionLabels 原始选项文案。
 * @returns {Array<{ id: string, tier: string, label: string, score: number }>} 标准化选项列表。
 */
function buildQuestionOptions({ questionId, optionLabels }) {
  return CAT_PERSONALITY_OPTION_SCORES.map((optionMeta, optionIndex) => ({
    id: `${questionId}-option-${optionMeta.tier.toLowerCase()}`,
    tier: optionMeta.tier,
    label: String(optionLabels[optionIndex] ?? "").trim(),
    score: optionMeta.score,
  }));
}

/**
 * 组装标准题目对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {Array<string>} params.options 题目选项。
 * @returns {{
 *  id: string,
 *  title: string,
 *  description: string,
 *  options: Array<{ id: string, tier: string, label: string, score: number }>
 * }} 标准题目对象。
 */
function buildQuestion({ id, title, options }) {
  return {
    id,
    title,
    description: "每题选一个最符合你平时状态的答案。",
    options: buildQuestionOptions({
      questionId: id,
      optionLabels: options,
    }),
  };
}

/**
 * 猫猫人格完整题库。
 */
export const CAT_PERSONALITY_QUESTION_BANK = [
  buildQuestion({
    id: "cat-personality-q01",
    title: "陌生人靠近你，你会？",
    options: [
      "A 好奇凑上去，不怕生",
      "B 淡定看着，保持距离",
      "C 有点害羞，悄悄躲开",
      "D 直接冷漠，无视走开",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q02",
    title: "周末最想做的事？",
    options: [
      "A 到处乱跑，精力旺盛",
      "B 悠闲躺平，随意发呆",
      "C 黏着喜欢的人撒娇",
      "D 独自待着，谁也别烦",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q03",
    title: "你对待喜欢的人？",
    options: [
      "A 主动黏人，热情贴贴",
      "B 忽冷忽热，傲娇得很",
      "C 温柔依赖，超级听话",
      "D 默默陪伴，不怎么表达",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q04",
    title: "你平时的作息？",
    options: [
      "A 昼伏夜出，晚上更精神",
      "B 规律作息，早睡早起",
      "C 慵懒赖床，怎么睡都不够",
      "D 随缘作息，困了就睡",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q05",
    title: "被人打扰时你会？",
    options: [
      "A 直接闹脾气，当场发作",
      "B 假装不在意，内心不爽",
      "C 委屈巴巴，默默忍受",
      "D 冷漠无视，直接走开",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q06",
    title: "你更喜欢的环境？",
    options: [
      "A 宽敞热闹，可以撒欢",
      "B 温馨舒适，有家的感觉",
      "C 柔软温馨，适合贴贴",
      "D 安静私密，不被打扰",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q07",
    title: "你对零食的态度？",
    options: [
      "A 看到就疯抢，超级贪吃",
      "B 挑三拣四，只爱爱吃的",
      "C 慢慢品尝，温柔细腻",
      "D 随缘吃，不太在意",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q08",
    title: "你处理矛盾的方式？",
    options: [
      "A 直接炸毛，当场解决",
      "B 冷静观察，懒得计较",
      "C 委屈示弱，求安慰",
      "D 直接冷战，绝不低头",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q09",
    title: "你更像哪种状态？",
    options: [
      "A 活泼好动，永远闲不住",
      "B 慵懒佛系，怎么都好",
      "C 温柔黏人，缺乏安全感",
      "D 高冷独立，谁也不理",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q10",
    title: "你对“自由”的看法？",
    options: [
      "A 自由最重要，不想被管",
      "B 自由和陪伴都想要",
      "C 宁愿被偏爱，放弃自由",
      "D 只想独处，绝对自由",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q11",
    title: "你表达好感的方式？",
    options: [
      "A 主动贴贴，大胆示好",
      "B 口是心非，默默照顾",
      "C 温柔顺从，事事配合",
      "D 安静守护，不打扰",
    ],
  }),
  buildQuestion({
    id: "cat-personality-q12",
    title: "你内心最真实的样子？",
    options: [
      "A 天真好动，没什么心眼",
      "B 傲娇腹黑，心里门儿清",
      "C 柔软缺爱，很需要陪伴",
      "D 独立清醒，不爱依赖人",
    ],
  }),
];
