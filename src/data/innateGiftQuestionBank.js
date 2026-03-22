/**
 * 天生自带什么天赋题库（12 题）：
 * 1. 每题固定 4 个选项，分值规则为 A=1、B=2、C=3、D=4。
 * 2. tier 用于结果页统计作答倾向与天赋反应图谱。
 * 3. 题目顺序按需求原稿保留，避免结果解释与用户感知错位。
 */

/**
 * 固定选项类型元数据：
 * 关键逻辑：所有题目共用同一套分值与反应类型定义，只替换题目选项文案。
 */
const INNATE_GIFT_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    archetypeKey: "insight",
    archetypeName: "洞察反应",
  },
  B: {
    tier: "B",
    score: 2,
    archetypeKey: "empathy",
    archetypeName: "共情反应",
  },
  C: {
    tier: "C",
    score: 3,
    archetypeKey: "creative",
    archetypeName: "灵感反应",
  },
  D: {
    tier: "D",
    score: 4,
    archetypeKey: "logic",
    archetypeName: "逻辑反应",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, archetypeKey: string, archetypeName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(INNATE_GIFT_OPTION_META).map(([tier, optionMeta]) => ({
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
    description: "每题选一个最符合你本能反应的答案。",
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 你天生自带什么天赋完整题库。
 */
export const INNATE_GIFT_QUESTION_BANK = [
  buildQuestion({
    id: "innate-gift-q01",
    title: "面对陌生人，你通常？",
    optionLabelMap: {
      A: "很快看出对方性格大概",
      B: "很容易和对方拉近距离",
      C: "轻松活跃气氛不尴尬",
      D: "沉稳礼貌，让人信任",
    },
  }),
  buildQuestion({
    id: "innate-gift-q02",
    title: "学习新东西时，你？",
    optionLabelMap: {
      A: "悟性高，一点就通",
      B: "耐心强，慢慢吃透",
      C: "兴趣驱动，学得快",
      D: "逻辑清晰，有条有理",
    },
  }),
  buildQuestion({
    id: "innate-gift-q03",
    title: "朋友难过时，你会？",
    optionLabelMap: {
      A: "一眼看穿他真正的痛处",
      B: "温柔陪伴，耐心安慰",
      C: "逗他开心，转移情绪",
      D: "帮他分析，给出办法",
    },
  }),
  buildQuestion({
    id: "innate-gift-q04",
    title: "遇到突发状况，你？",
    optionLabelMap: {
      A: "冷静直觉，快速判断",
      B: "安抚他人，稳定情绪",
      C: "灵活应变，不慌不乱",
      D: "有条理地解决问题",
    },
  }),
  buildQuestion({
    id: "innate-gift-q05",
    title: "你对哪方面更敏感？",
    optionLabelMap: {
      A: "人心、氛围、潜台词",
      B: "情绪、细节、温度",
      C: "色彩、审美、有趣度",
      D: "规则、逻辑、对错",
    },
  }),
  buildQuestion({
    id: "innate-gift-q06",
    title: "做决定时你更擅长？",
    optionLabelMap: {
      A: "凭直觉精准判断",
      B: "兼顾所有人感受",
      C: "大胆尝试新鲜选择",
      D: "理性分析利弊",
    },
  }),
  buildQuestion({
    id: "innate-gift-q07",
    title: "你在团队里更像？",
    optionLabelMap: {
      A: "洞察者，看透局势",
      B: "调和者，照顾大家",
      C: "活跃者，带动气氛",
      D: "组织者，安排妥当",
    },
  }),
  buildQuestion({
    id: "innate-gift-q08",
    title: "你更容易注意到？",
    optionLabelMap: {
      A: "别人没说出口的想法",
      B: "别人细微的情绪变化",
      C: "好看、有趣、新鲜事物",
      D: "条理、秩序、对错",
    },
  }),
  buildQuestion({
    id: "innate-gift-q09",
    title: "压力大时你会？",
    optionLabelMap: {
      A: "靠直觉找到出口",
      B: "自我消化温柔自愈",
      C: "用快乐冲淡负面",
      D: "理性规划走出困境",
    },
  }),
  buildQuestion({
    id: "innate-gift-q10",
    title: "你更擅长？",
    optionLabelMap: {
      A: "看透本质，一针见血",
      B: "共情理解，温暖他人",
      C: "创造快乐，活跃氛围",
      D: "规划执行，落地成事",
    },
  }),
  buildQuestion({
    id: "innate-gift-q11",
    title: "别人对你的评价更接近？",
    optionLabelMap: {
      A: "很通透、看得很准",
      B: "很温柔、很会照顾人",
      C: "很有趣、性格很好",
      D: "很靠谱、让人放心",
    },
  }),
  buildQuestion({
    id: "innate-gift-q12",
    title: "你处理问题更偏向？",
    optionLabelMap: {
      A: "凭直觉与洞察力",
      B: "用心感受与共情",
      C: "灵活创意化解",
      D: "理性逻辑解决",
    },
  }),
];
