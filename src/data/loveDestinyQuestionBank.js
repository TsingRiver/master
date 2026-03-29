/**
 * 桃花体质测试题库（12 题）：
 * 1. 每题固定 3 个选项，分值规则为 A=1、B=2、C=3。
 * 2. dimension / dimensionLabel 用于结果页构建“桃花风险图谱”。
 * 3. 题目顺序按需求原稿保留，确保分数区间解释与阅读顺序一致。
 */

/**
 * 固定选项类型元数据：
 * 关键逻辑：所有题目共用同一套分值与反应类型定义，避免后续维护时计分口径漂移。
 */
const LOVE_DESTINY_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    profileKey: "clear-boundary",
    profileName: "清醒边界反应",
  },
  B: {
    tier: "B",
    score: 2,
    profileKey: "soft-observer",
    profileName: "心软观察反应",
  },
  C: {
    tier: "C",
    score: 3,
    profileKey: "fast-invested",
    profileName: "上头妥协反应",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, profileKey: string, profileName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(LOVE_DESTINY_OPTION_META).map(([tier, optionMeta]) => ({
    id: `${questionId}-option-${tier.toLowerCase()}`,
    tier,
    // 关键逻辑：题目页选项文案不展示 A/B/C，仅保留内部 tier 供计分与统计使用。
    label: String(optionLabelMap[tier] ?? "").trim(),
    score: optionMeta.score,
    profileKey: optionMeta.profileKey,
    profileName: optionMeta.profileName,
  }));
}

/**
 * 组装标准题目对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {string} params.dimension 维度键。
 * @param {string} params.dimensionLabel 维度名称。
 * @param {{ A: string, B: string, C: string }} params.optionLabelMap 选项文案映射。
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
 * 你容易吸引正缘还是烂桃花完整题库。
 */
export const LOVE_DESTINY_QUESTION_BANK = [
  buildQuestion({
    id: "love-destiny-q01",
    title: "刚认识的人对你过分热情，你会？",
    dimension: "discernment",
    dimensionLabel: "风险识别",
    optionLabelMap: {
      A: "保持警惕，慢慢观察",
      B: "有点开心，但不会完全相信",
      C: "很快投入，觉得遇到对的人",
    },
  }),
  buildQuestion({
    id: "love-destiny-q02",
    title: "对方总说甜言蜜语，却很少实际行动，你会？",
    dimension: "discernment",
    dimensionLabel: "风险识别",
    optionLabelMap: {
      A: "立刻疏远，不浪费时间",
      B: "再观察一段时间看看",
      C: "自我安慰，他只是比较忙",
    },
  }),
  buildQuestion({
    id: "love-destiny-q03",
    title: "刚认识就对你讲暧昧话、有越界举动，你觉得？",
    dimension: "boundary",
    dimensionLabel: "边界守护",
    optionLabelMap: {
      A: "很反感，明显不尊重人",
      B: "有点不舒服，但不会直说",
      C: "觉得是浪漫，是喜欢的表现",
    },
  }),
  buildQuestion({
    id: "love-destiny-q04",
    title: "对方对你忽冷忽热，你通常会？",
    dimension: "emotional-dependence",
    dimensionLabel: "情绪依赖",
    optionLabelMap: {
      A: "无所谓，我也有自己的生活",
      B: "会在意，但不会主动追问",
      C: "忍不住胡思乱想，内耗自己",
    },
  }),
  buildQuestion({
    id: "love-destiny-q05",
    title: "吵架后对方冷暴力不理你，你会？",
    dimension: "self-worth",
    dimensionLabel: "自我优先",
    optionLabelMap: {
      A: "冷静沟通，不行就及时止损",
      B: "等他冷静，再慢慢聊",
      C: "主动低头，害怕失去对方",
    },
  }),
  buildQuestion({
    id: "love-destiny-q06",
    title: "对方身边异性很多，还不避嫌，你会？",
    dimension: "boundary",
    dimensionLabel: "边界守护",
    optionLabelMap: {
      A: "明确表达不满，不改就离开",
      B: "心里介意，但不敢多说",
      C: "假装不在意，怕被嫌烦",
    },
  }),
  buildQuestion({
    id: "love-destiny-q07",
    title: "刚认识不久就跟你借钱或提物质要求，你会？",
    dimension: "discernment",
    dimensionLabel: "风险识别",
    optionLabelMap: {
      A: "直接拒绝，果断远离",
      B: "犹豫推脱，不太想答应",
      C: "不好意思拒绝，还是会帮",
    },
  }),
  buildQuestion({
    id: "love-destiny-q08",
    title: "你在感情里最看重的是？",
    dimension: "emotional-dependence",
    dimensionLabel: "情绪依赖",
    optionLabelMap: {
      A: "尊重、踏实、互相包容",
      B: "陪伴和稳定的情绪",
      C: "甜言蜜语和浪漫仪式感",
    },
  }),
  buildQuestion({
    id: "love-destiny-q09",
    title: "对方对你很好，但你没那么喜欢，你会？",
    dimension: "self-worth",
    dimensionLabel: "自我优先",
    optionLabelMap: {
      A: "明确拒绝，不耽误彼此",
      B: "慢慢接触，看看能不能培养感情",
      C: "先在一起，享受被爱",
    },
  }),
  buildQuestion({
    id: "love-destiny-q10",
    title: "发现对方撒谎、隐瞒事情，你会？",
    dimension: "emotional-dependence",
    dimensionLabel: "情绪依赖",
    optionLabelMap: {
      A: "直接摊牌，绝不轻易原谅",
      B: "听他解释，看情况原谅",
      C: "只要他哄一哄，就会原谅",
    },
  }),
  buildQuestion({
    id: "love-destiny-q11",
    title: "刚在一起，对方就想控制你的社交、穿搭，你会？",
    dimension: "boundary",
    dimensionLabel: "边界守护",
    optionLabelMap: {
      A: "拒绝，这是边界问题",
      B: "有点不舒服，但会迁就一点",
      C: "觉得是在乎，愿意为他改变",
    },
  }),
  buildQuestion({
    id: "love-destiny-q12",
    title: "一段感情让你经常难过、内耗，你会？",
    dimension: "self-worth",
    dimensionLabel: "自我优先",
    optionLabelMap: {
      A: "果断离开，及时止损",
      B: "舍不得，再坚持看看",
      C: "不断自我反省，觉得是自己不够好",
    },
  }),
];
