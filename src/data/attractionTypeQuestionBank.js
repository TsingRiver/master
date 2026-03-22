/**
 * 心动吸引类型题库（12 题）：
 * 1. 每题固定 4 个选项，分值规则为 A=1、B=2、C=3、D=4。
 * 2. tier 与最终四类吸引画像一一对应，便于结果页统计偏好分布。
 * 3. 题目顺序按需求原稿保留，避免题目语义与结果解释漂移。
 */

/**
 * 固定选项类型元数据：
 * 关键逻辑：所有题目共用同一套类型定义，只替换每题的展示文案，避免计分口径不一致。
 */
const ATTRACTION_TYPE_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    archetypeKey: "cool-stable",
    archetypeName: "清冷稳定型",
  },
  B: {
    tier: "B",
    score: 2,
    archetypeKey: "gentle-healing",
    archetypeName: "温柔治愈型",
  },
  C: {
    tier: "C",
    score: 3,
    archetypeKey: "sunny-happy",
    archetypeName: "阳光快乐型",
  },
  D: {
    tier: "D",
    score: 4,
    archetypeKey: "mature-anchor",
    archetypeName: "成熟靠山型",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, archetypeKey: string, archetypeName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(ATTRACTION_TYPE_OPTION_META).map(([tier, optionMeta]) => ({
    id: `${questionId}-option-${tier.toLowerCase()}`,
    tier,
    label: `${tier} ${String(optionLabelMap[tier] ?? "").trim()}`,
    score: optionMeta.score,
    archetypeKey: optionMeta.archetypeKey,
    archetypeName: optionMeta.archetypeName,
  }));
}

/**
 * 组装标准题目对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {{ A: string, B: string, C: string, D: string }} params.optionLabelMap 选项文案映射。
 * @returns {{
 *  id: string,
 *  title: string,
 *  description: string,
 *  options: Array<object>
 * }} 标准题目对象。
 */
function buildQuestion({ id, title, optionLabelMap }) {
  return {
    id,
    title,
    description: "每题选一个最能让你心动的答案。",
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 你会被哪类人吸引完整题库。
 */
export const ATTRACTION_TYPE_QUESTION_BANK = [
  buildQuestion({
    id: "attraction-type-q01",
    title: "你更喜欢的相处氛围是？",
    optionLabelMap: {
      A: "安静舒服，不用刻意找话题",
      B: "温柔贴心，处处被照顾",
      C: "轻松搞笑，每天都很开心",
      D: "成熟稳重，凡事有安排",
    },
  }),
  buildQuestion({
    id: "attraction-type-q02",
    title: "对方哪一点最让你心动？",
    optionLabelMap: {
      A: "情绪稳定，从不乱发脾气",
      B: "细腻敏感，很懂你的小心思",
      C: "阳光开朗，自带感染力",
      D: "有担当，能为你扛事",
    },
  }),
  buildQuestion({
    id: "attraction-type-q03",
    title: "约会你更倾向？",
    optionLabelMap: {
      A: "散步、看海、安静待着",
      B: "探店、下午茶、温馨小馆",
      C: "游乐园、逛街、热闹活动",
      D: "正式晚餐、规划好的行程",
    },
  }),
  buildQuestion({
    id: "attraction-type-q04",
    title: "你在感情里最需要？",
    optionLabelMap: {
      A: "安全感和忠诚",
      B: "偏爱和细节",
      C: "快乐和新鲜感",
      D: "尊重和依靠",
    },
  }),
  buildQuestion({
    id: "attraction-type-q05",
    title: "你第一眼会被哪种气质吸引？",
    optionLabelMap: {
      A: "清冷干净、低调内敛",
      B: "温柔治愈、眼神柔软",
      C: "元气阳光、笑容灿烂",
      D: "成熟大气、沉稳可靠",
    },
  }),
  buildQuestion({
    id: "attraction-type-q06",
    title: "吵架时你希望对方？",
    optionLabelMap: {
      A: "冷静沟通，不冷暴力",
      B: "先哄你，再讲道理",
      C: "幽默化解，不较真",
      D: "直接解决问题，不情绪化",
    },
  }),
  buildQuestion({
    id: "attraction-type-q07",
    title: "你无法抗拒对方的？",
    optionLabelMap: {
      A: "坚定的选择",
      B: "无微不至的温柔",
      C: "有趣的灵魂",
      D: "强大的能力",
    },
  }),
  buildQuestion({
    id: "attraction-type-q08",
    title: "你容易对哪种人产生好感？",
    optionLabelMap: {
      A: "话少但靠谱",
      B: "温柔又体贴",
      C: "幽默又外向",
      D: "成熟又稳重",
    },
  }),
  buildQuestion({
    id: "attraction-type-q09",
    title: "你更看重对方的？",
    optionLabelMap: {
      A: "人品与专一",
      B: "情绪价值",
      C: "相处舒适度",
      D: "责任感与能力",
    },
  }),
  buildQuestion({
    id: "attraction-type-q10",
    title: "你理想的另一半是？",
    optionLabelMap: {
      A: "灵魂知己",
      B: "温柔恋人",
      C: "快乐搭档",
      D: "人生靠山",
    },
  }),
  buildQuestion({
    id: "attraction-type-q11",
    title: "你吃哪一套追求方式？",
    optionLabelMap: {
      A: "细水长流、默默陪伴",
      B: "浪漫细节、事事上心",
      C: "主动热情、大胆直接",
      D: "成熟稳重、规划未来",
    },
  }),
  buildQuestion({
    id: "attraction-type-q12",
    title: "你内心最缺的是？",
    optionLabelMap: {
      A: "稳定安全感",
      B: "被完全理解",
      C: "轻松与快乐",
      D: "被坚定守护",
    },
  }),
];
