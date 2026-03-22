/**
 * 讨好型指数题库（12 题）：
 * 1. 每题固定 4 个选项，分值规则为 A=1、B=2、C=3、D=4。
 * 2. dimension / dimensionLabel 用于结果页构建“讨好触发图谱”雷达图。
 * 3. 题目顺序按需求原稿保留，确保结果解释与用户阅读路径一致。
 */

/**
 * 固定选项元数据：
 * 关键逻辑：所有题目复用同一套选项文案与分值，避免不同题之间出现计分漂移。
 */
const PEOPLE_PLEASER_OPTION_PRESETS = Object.freeze([
  { tier: "A", label: "A 从不", score: 1 },
  { tier: "B", label: "B 偶尔", score: 2 },
  { tier: "C", label: "C 经常", score: 3 },
  { tier: "D", label: "D 总是", score: 4 },
]);

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @returns {Array<{ id: string, tier: string, label: string, score: number }>} 选项列表。
 */
function buildQuestionOptions(questionId) {
  return PEOPLE_PLEASER_OPTION_PRESETS.map((optionItem) => ({
    id: `${questionId}-option-${optionItem.tier.toLowerCase()}`,
    tier: optionItem.tier,
    label: optionItem.label,
    score: optionItem.score,
  }));
}

/**
 * 组装标准题目对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {string} params.dimension 维度键。
 * @param {string} params.dimensionLabel 维度名称。
 * @returns {{
 *  id: string,
 *  title: string,
 *  description: string,
 *  dimension: string,
 *  dimensionLabel: string,
 *  options: Array<object>
 * }} 标准题目对象。
 */
function buildQuestion({ id, title, dimension, dimensionLabel }) {
  return {
    id,
    title,
    description: "每题选一个最符合你日常反应的答案。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id),
  };
}

/**
 * 讨好型指数完整题库。
 */
export const PEOPLE_PLEASER_QUESTION_BANK = [
  buildQuestion({
    id: "people-pleaser-q01",
    title: "别人找你帮忙，就算你不想也会答应。",
    dimension: "boundary",
    dimensionLabel: "边界退让",
  }),
  buildQuestion({
    id: "people-pleaser-q02",
    title: "明明不是你的错，你也会先道歉。",
    dimension: "guilt",
    dimensionLabel: "自责敏感",
  }),
  buildQuestion({
    id: "people-pleaser-q03",
    title: "你习惯优先满足别人，再考虑自己。",
    dimension: "self-suppression",
    dimensionLabel: "自我压抑",
  }),
  buildQuestion({
    id: "people-pleaser-q04",
    title: "拒绝别人之后，你会心里不安很久。",
    dimension: "boundary",
    dimensionLabel: "边界退让",
  }),
  buildQuestion({
    id: "people-pleaser-q05",
    title: "你很在意别人是不是对你不满意。",
    dimension: "guilt",
    dimensionLabel: "自责敏感",
  }),
  buildQuestion({
    id: "people-pleaser-q06",
    title: "吵架冷战时，你通常忍不住先低头。",
    dimension: "conflict",
    dimensionLabel: "冲突回避",
  }),
  buildQuestion({
    id: "people-pleaser-q07",
    title: "你很少直接表达自己的真实想法。",
    dimension: "conflict",
    dimensionLabel: "冲突回避",
  }),
  buildQuestion({
    id: "people-pleaser-q08",
    title: "别人情绪不好，你会觉得是自己的问题。",
    dimension: "guilt",
    dimensionLabel: "自责敏感",
  }),
  buildQuestion({
    id: "people-pleaser-q09",
    title: "你常常为了照顾别人而委屈自己。",
    dimension: "self-suppression",
    dimensionLabel: "自我压抑",
  }),
  buildQuestion({
    id: "people-pleaser-q10",
    title: "你不敢提要求，怕给别人添麻烦。",
    dimension: "conflict",
    dimensionLabel: "冲突回避",
  }),
  buildQuestion({
    id: "people-pleaser-q11",
    title: "你习惯顺着别人的意思做决定。",
    dimension: "boundary",
    dimensionLabel: "边界退让",
  }),
  buildQuestion({
    id: "people-pleaser-q12",
    title: "你总是把自己的情绪放在最后。",
    dimension: "self-suppression",
    dimensionLabel: "自我压抑",
  }),
];
