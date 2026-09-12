/**
 * 季节系人格题库（12 题）：
 * 1. 每题固定 4 个选项，分值规则严格对齐需求稿：A=1、B=2、C=3、D=4。
 * 2. dimension / dimensionLabel 用于结果页构建“季节人格图谱”。
 * 3. 题目顺序严格保持原始需求顺序，避免总分区间解释与题目体验漂移。
 */

/**
 * 固定选项元信息：
 * 关键逻辑：所有题目共用统一的分值与反应标签，避免后续维护时出现计分口径漂移。
 */
const SEASON_PERSONALITY_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    responseKey: "sunny-extraversion",
    responseName: "暖阳外放向",
  },
  B: {
    tier: "B",
    score: 2,
    responseKey: "steady-comfort",
    responseName: "平和舒适向",
  },
  C: {
    tier: "C",
    score: 3,
    responseKey: "atmospheric-sensitivity",
    responseName: "氛围细腻向",
  },
  D: {
    tier: "D",
    score: 4,
    responseKey: "cool-solitude",
    responseName: "清冷独处向",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, responseKey: string, responseName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(SEASON_PERSONALITY_OPTION_META).map(
    ([tier, optionMeta]) => ({
      id: `${questionId}-option-${tier.toLowerCase()}`,
      tier,
      // 关键逻辑：页面仅展示真实选项文案，A/B/C/D 字母只保留给统计和计分使用。
      label: String(optionLabelMap[tier] ?? "").trim(),
      score: optionMeta.score,
      responseKey: optionMeta.responseKey,
      responseName: optionMeta.responseName,
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
    description: "每题选一个最符合你当下直觉的答案。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 测一测｜你是哪种季节系人格完整题库。
 */
export const SEASON_PERSONALITY_QUESTION_BANK = [
  buildQuestion({
    id: "season-personality-q01",
    title: "更喜欢的天气是？",
    dimension: "seasonal-energy",
    dimensionLabel: "季节能量",
    optionLabelMap: {
      A: "阳光灿烂，暖洋洋",
      B: "凉爽舒适，不冷不热",
      C: "温柔细雨，氛围感",
      D: "安静飘雪，冷冷清清",
    },
  }),
  buildQuestion({
    id: "season-personality-q02",
    title: "心情低落时你更想？",
    dimension: "inner-climate",
    dimensionLabel: "内心底色",
    optionLabelMap: {
      A: "出门晒太阳，立刻开心",
      B: "吹风散步，慢慢冷静",
      C: "窝在屋里听歌发呆",
      D: "裹紧被子，谁也不理",
    },
  }),
  buildQuestion({
    id: "season-personality-q03",
    title: "穿衣风格更偏向？",
    dimension: "atmosphere-aesthetic",
    dimensionLabel: "氛围审美",
    optionLabelMap: {
      A: "清爽明亮，色彩鲜艳",
      B: "简约百搭，舒适为主",
      C: "温柔氛围感，软糯风",
      D: "深色低调，禁欲系",
    },
  }),
  buildQuestion({
    id: "season-personality-q04",
    title: "对待人际关系你像？",
    dimension: "social-distance",
    dimensionLabel: "社交距离",
    optionLabelMap: {
      A: "热情主动，自来熟",
      B: "温和得体，很舒服",
      C: "细腻敏感，慢热型",
      D: "独立冷淡，有距离",
    },
  }),
  buildQuestion({
    id: "season-personality-q05",
    title: "你更向往的生活节奏？",
    dimension: "seasonal-energy",
    dimensionLabel: "季节能量",
    optionLabelMap: {
      A: "热闹鲜活，每天有惊喜",
      B: "平稳规律，轻松自在",
      C: "慵懒惬意，小资浪漫",
      D: "安静独处，简单清净",
    },
  }),
  buildQuestion({
    id: "season-personality-q06",
    title: "生气时你的表现？",
    dimension: "social-distance",
    dimensionLabel: "社交距离",
    optionLabelMap: {
      A: "来得快也去得快",
      B: "冷静讲道理，不情绪化",
      C: "委屈沉默，偷偷难过",
      D: "冷淡疏离，直接冷处理",
    },
  }),
  buildQuestion({
    id: "season-personality-q07",
    title: "你更喜欢的食物口感？",
    dimension: "atmosphere-aesthetic",
    dimensionLabel: "氛围审美",
    optionLabelMap: {
      A: "清爽酸甜，开胃快乐",
      B: "温润鲜香，舒服暖胃",
      C: "软糯香甜，治愈满足",
      D: "醇厚浓郁，温暖扎实",
    },
  }),
  buildQuestion({
    id: "season-personality-q08",
    title: "朋友眼里你的气质？",
    dimension: "inner-climate",
    dimensionLabel: "内心底色",
    optionLabelMap: {
      A: "元气阳光，活力满满",
      B: "温柔舒服，让人安心",
      C: "文艺细腻，氛围感强",
      D: "清冷独立，神秘低调",
    },
  }),
  buildQuestion({
    id: "season-personality-q09",
    title: "遇到压力你会？",
    dimension: "social-distance",
    dimensionLabel: "社交距离",
    optionLabelMap: {
      A: "找点乐子，立刻放空",
      B: "按部就班，慢慢解决",
      C: "沉浸情绪，自我消化",
      D: "与世隔绝，独自扛着",
    },
  }),
  buildQuestion({
    id: "season-personality-q10",
    title: "你更喜欢的环境光线？",
    dimension: "atmosphere-aesthetic",
    dimensionLabel: "氛围审美",
    optionLabelMap: {
      A: "明亮刺眼的大太阳",
      B: "柔和均匀的自然光",
      C: "黄昏落日的暖黄光",
      D: "夜晚安静的弱灯光",
    },
  }),
  buildQuestion({
    id: "season-personality-q11",
    title: "你对“变化”的态度？",
    dimension: "seasonal-energy",
    dimensionLabel: "季节能量",
    optionLabelMap: {
      A: "喜欢新鲜，拥抱改变",
      B: "接受变化，从容适应",
      C: "有点害怕，容易不安",
      D: "抗拒变动，偏爱稳定",
    },
  }),
  buildQuestion({
    id: "season-personality-q12",
    title: "你理想的幸福是？",
    dimension: "inner-climate",
    dimensionLabel: "内心底色",
    optionLabelMap: {
      A: "自由热烈，永远快乐",
      B: "平和安稳，事事顺心",
      C: "温柔浪漫，被人珍视",
      D: "宁静独处，不被打扰",
    },
  }),
];
