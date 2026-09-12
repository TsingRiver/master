/**
 * 甜品系人格题库（12 题）：
 * 1. 每题固定 4 个选项，分值规则为 A=1、B=2、C=3、D=4。
 * 2. dimension / dimensionLabel 用于结果页构建“甜品人格图谱”。
 * 3. 题目顺序严格保持需求原稿顺序，避免分档结果与作答体验漂移。
 */

/**
 * 固定选项元数据：
 * 关键逻辑：所有题目共用同一套分值与甜感标签，避免后续维护时出现计分口径不一致。
 */
const DESSERT_PERSONA_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    dessertTraitKey: "fresh-sweet",
    dessertTraitName: "清爽轻甜向",
  },
  B: {
    tier: "B",
    score: 2,
    dessertTraitKey: "soft-healing",
    dessertTraitName: "绵软治愈向",
  },
  C: {
    tier: "C",
    score: 3,
    dessertTraitKey: "creamy-steady",
    dessertTraitName: "醇厚踏实向",
  },
  D: {
    tier: "D",
    score: 4,
    dessertTraitKey: "bitter-calm",
    dessertTraitName: "微苦清醒向",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, dessertTraitKey: string, dessertTraitName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(DESSERT_PERSONA_OPTION_META).map(
    ([tier, optionMeta]) => ({
      id: `${questionId}-option-${tier.toLowerCase()}`,
      tier,
      // 关键逻辑：题目页只展示答案文本，A/B/C/D 仅保留在内部计分结构中。
      label: String(optionLabelMap[tier] ?? "").trim(),
      score: optionMeta.score,
      dessertTraitKey: optionMeta.dessertTraitKey,
      dessertTraitName: optionMeta.dessertTraitName,
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
    description: "每题选最符合你的答案，最后按总分看结果。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 测一测｜你是哪种甜品系人格完整题库。
 */
export const DESSERT_PERSONA_QUESTION_BANK = [
  buildQuestion({
    id: "dessert-persona-q01",
    title: "心情差时你更想吃？",
    dimension: "emotional-comfort",
    dimensionLabel: "情绪治愈力",
    optionLabelMap: {
      A: "清爽甜口，立刻开心",
      B: "绵密软糯，治愈情绪",
      C: "奶香浓郁，温暖踏实",
      D: "微苦回甘，冷静放松",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q02",
    title: "你更喜欢的口感？",
    dimension: "lifestyle-flavor",
    dimensionLabel: "生活风味值",
    optionLabelMap: {
      A: "清爽不腻，清甜可口",
      B: "绵软细腻，入口即化",
      C: "醇厚香浓，幸福感强",
      D: "层次丰富，低调有料",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q03",
    title: "对待人际关系你像？",
    dimension: "social-sweetness",
    dimensionLabel: "人际甜感度",
    optionLabelMap: {
      A: "活泼讨喜，人人喜欢",
      B: "温柔舒服，让人亲近",
      C: "细腻贴心，很会照顾人",
      D: "低调内敛，懂的才懂",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q04",
    title: "你给人的第一印象？",
    dimension: "social-sweetness",
    dimensionLabel: "人际甜感度",
    optionLabelMap: {
      A: "阳光甜美，很好接近",
      B: "温柔软糯，气质舒服",
      C: "沉稳贴心，让人安心",
      D: "神秘低调，有点距离",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q05",
    title: "你表达好感的方式？",
    dimension: "social-sweetness",
    dimensionLabel: "人际甜感度",
    optionLabelMap: {
      A: "直白热烈，主动示好",
      B: "温柔体贴，细节照顾",
      C: "默默付出，不善言辞",
      D: "冷静克制，暗中在意",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q06",
    title: "你更喜欢的氛围？",
    dimension: "lifestyle-flavor",
    dimensionLabel: "生活风味值",
    optionLabelMap: {
      A: "明亮热闹，轻松愉快",
      B: "温馨柔和，慵懒惬意",
      C: "安静治愈，温暖踏实",
      D: "简约高级，安静独处",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q07",
    title: "生气时你会？",
    dimension: "emotional-comfort",
    dimensionLabel: "情绪治愈力",
    optionLabelMap: {
      A: "很快消气，不记仇",
      B: "温柔沟通，好好说开",
      C: "委屈沉默，需要哄",
      D: "冷静冷淡，自己消化",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q08",
    title: "你对生活的态度？",
    dimension: "lifestyle-flavor",
    dimensionLabel: "生活风味值",
    optionLabelMap: {
      A: "及时行乐，开心最重要",
      B: "温柔度日，小确幸就好",
      C: "安稳踏实，细水长流",
      D: "低调精致，不慌不忙",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q09",
    title: "你更擅长？",
    dimension: "inner-aftertaste",
    dimensionLabel: "内在回甘感",
    optionLabelMap: {
      A: "活跃气氛，搞笑担当",
      B: "温柔安慰，治愈他人",
      C: "细心照顾，体贴入微",
      D: "默默守护，低调靠谱",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q10",
    title: "你内心的底色？",
    dimension: "inner-aftertaste",
    dimensionLabel: "内在回甘感",
    optionLabelMap: {
      A: "明亮甜妹，元气满满",
      B: "温柔软妹，细腻治愈",
      C: "沉稳内敛，安全感强",
      D: "清醒独立，低调有品",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q11",
    title: "你对“甜”的接受度？",
    dimension: "inner-aftertaste",
    dimensionLabel: "内在回甘感",
    optionLabelMap: {
      A: "超爱甜，越甜越开心",
      B: "喜欢微甜，温柔刚好",
      C: "适中就好，不腻为主",
      D: "不太爱甜，偏爱清淡",
    },
  }),
  buildQuestion({
    id: "dessert-persona-q12",
    title: "你理想的幸福状态？",
    dimension: "emotional-comfort",
    dimensionLabel: "情绪治愈力",
    optionLabelMap: {
      A: "自由快乐，每天有惊喜",
      B: "温柔陪伴，被人偏爱",
      C: "安稳踏实，事事顺心",
      D: "安静自在，不被打扰",
    },
  }),
];
