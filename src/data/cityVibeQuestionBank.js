/**
 * 城市气质题库（20 题）：
 * 1. 每题固定 4 个选项，分值规则严格对齐需求稿：A=1、B=2、C=3、D=4。
 * 2. dimension / dimensionLabel 用于结果页构建“城市偏好图谱”。
 * 3. 题目顺序严格保持原始需求顺序，避免总分区间解释与题目体验漂移。
 */

/**
 * 固定选项元信息：
 * 关键逻辑：所有题目共用统一的分值与倾向标签，避免维护期出现计分口径不一致。
 */
const CITY_VIBE_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    responseKey: "healing",
    responseName: "安静治愈向",
  },
  B: {
    tier: "B",
    score: 2,
    responseKey: "artsy",
    responseName: "文艺浪漫向",
  },
  C: {
    tier: "C",
    score: 3,
    responseKey: "vibrant",
    responseName: "热闹多元向",
  },
  D: {
    tier: "D",
    score: 4,
    responseKey: "avant",
    responseName: "繁华前卫向",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, responseKey: string, responseName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(CITY_VIBE_OPTION_META).map(([tier, optionMeta]) => ({
    id: `${questionId}-option-${tier.toLowerCase()}`,
    tier,
    // 关键逻辑：页面仅展示真实选项文案，A/B/C/D 字母只保留给统计和计分使用。
    label: String(optionLabelMap[tier] ?? "").trim(),
    score: optionMeta.score,
    responseKey: optionMeta.responseKey,
    responseName: optionMeta.responseName,
  }));
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
    description: "每题选一个最符合你理想城市状态的答案。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 测测你是「哪种城市气质」完整题库。
 */
export const CITY_VIBE_QUESTION_BANK = [
  buildQuestion({
    id: "city-vibe-q01",
    title: "你更喜欢的城市氛围？",
    dimension: "spatial-aesthetic",
    dimensionLabel: "空间审美",
    optionLabelMap: {
      A: "安静治愈",
      B: "文艺浪漫",
      C: "热闹多元",
      D: "繁华前卫",
    },
  }),
  buildQuestion({
    id: "city-vibe-q02",
    title: "你喜欢的城市节奏？",
    dimension: "living-rhythm",
    dimensionLabel: "生活节奏",
    optionLabelMap: {
      A: "缓慢悠闲",
      B: "舒适有序",
      C: "活力紧凑",
      D: "快节奏高效",
    },
  }),
  buildQuestion({
    id: "city-vibe-q03",
    title: "你偏爱哪种建筑风格？",
    dimension: "spatial-aesthetic",
    dimensionLabel: "空间审美",
    optionLabelMap: {
      A: "复古怀旧",
      B: "清新简约",
      C: "现代时尚",
      D: "未来科技",
    },
  }),
  buildQuestion({
    id: "city-vibe-q04",
    title: "你喜欢的城市色彩？",
    dimension: "spatial-aesthetic",
    dimensionLabel: "空间审美",
    optionLabelMap: {
      A: "暖黄 / 米白",
      B: "浅蓝 / 淡粉",
      C: "多彩撞色",
      D: "冷灰 / 金属",
    },
  }),
  buildQuestion({
    id: "city-vibe-q05",
    title: "你更爱哪种城市美食？",
    dimension: "consumption-lifestyle",
    dimensionLabel: "生活方式",
    optionLabelMap: {
      A: "家常小吃",
      B: "精致甜品",
      C: "特色料理",
      D: "高端西餐",
    },
  }),
  buildQuestion({
    id: "city-vibe-q06",
    title: "你喜欢的城市街道？",
    dimension: "spatial-aesthetic",
    dimensionLabel: "空间审美",
    optionLabelMap: {
      A: "老巷弄堂",
      B: "林荫小道",
      C: "繁华商圈",
      D: "科技园区",
    },
  }),
  buildQuestion({
    id: "city-vibe-q07",
    title: "你理想的城市生活？",
    dimension: "social-energy",
    dimensionLabel: "社交能量",
    optionLabelMap: {
      A: "慢生活、烟火气",
      B: "小资情调、文艺范",
      C: "多元体验、新鲜感",
      D: "高效便捷、国际化",
    },
  }),
  buildQuestion({
    id: "city-vibe-q08",
    title: "你喜欢的城市季节？",
    dimension: "living-rhythm",
    dimensionLabel: "生活节奏",
    optionLabelMap: {
      A: "温暖如春",
      B: "清爽秋日",
      C: "热烈盛夏",
      D: "凛冽寒冬",
    },
  }),
  buildQuestion({
    id: "city-vibe-q09",
    title: "你更爱哪种城市夜景？",
    dimension: "spatial-aesthetic",
    dimensionLabel: "空间审美",
    optionLabelMap: {
      A: "万家灯火",
      B: "星光点点",
      C: "霓虹闪烁",
      D: "科技光影",
    },
  }),
  buildQuestion({
    id: "city-vibe-q10",
    title: "你喜欢的城市交通？",
    dimension: "living-rhythm",
    dimensionLabel: "生活节奏",
    optionLabelMap: {
      A: "步行 / 自行车",
      B: "公交 / 地铁",
      C: "网约车 / 自驾",
      D: "高铁 / 飞机",
    },
  }),
  buildQuestion({
    id: "city-vibe-q11",
    title: "你偏爱哪种城市休闲？",
    dimension: "consumption-lifestyle",
    dimensionLabel: "生活方式",
    optionLabelMap: {
      A: "公园散步",
      B: "书店 / 咖啡馆",
      C: "商场 / 影院",
      D: "酒吧 / livehouse",
    },
  }),
  buildQuestion({
    id: "city-vibe-q12",
    title: "你喜欢的城市人文？",
    dimension: "social-energy",
    dimensionLabel: "社交能量",
    optionLabelMap: {
      A: "历史底蕴",
      B: "文艺气息",
      C: "潮流文化",
      D: "创新氛围",
    },
  }),
  buildQuestion({
    id: "city-vibe-q13",
    title: "你理想的城市居所？",
    dimension: "consumption-lifestyle",
    dimensionLabel: "生活方式",
    optionLabelMap: {
      A: "老小区、烟火气",
      B: "小高层、小资范",
      C: "高层公寓、现代感",
      D: "江景房、奢华感",
    },
  }),
  buildQuestion({
    id: "city-vibe-q14",
    title: "你喜欢的城市天气？",
    dimension: "living-rhythm",
    dimensionLabel: "生活节奏",
    optionLabelMap: {
      A: "多云温和",
      B: "晴朗干爽",
      C: "多变有趣",
      D: "极端个性",
    },
  }),
  buildQuestion({
    id: "city-vibe-q15",
    title: "你更爱哪种城市声音？",
    dimension: "social-energy",
    dimensionLabel: "社交能量",
    optionLabelMap: {
      A: "鸟鸣 / 风声",
      B: "音乐 / 交谈",
      C: "车流 / 喧闹",
      D: "科技 / 电子",
    },
  }),
  buildQuestion({
    id: "city-vibe-q16",
    title: "你喜欢的城市节日？",
    dimension: "social-energy",
    dimensionLabel: "社交能量",
    optionLabelMap: {
      A: "传统民俗",
      B: "文艺庆典",
      C: "潮流派对",
      D: "国际盛会",
    },
  }),
  buildQuestion({
    id: "city-vibe-q17",
    title: "你偏爱哪种城市绿植？",
    dimension: "consumption-lifestyle",
    dimensionLabel: "生活方式",
    optionLabelMap: {
      A: "老树 / 花草",
      B: "草坪 / 灌木",
      C: "景观树 / 盆栽",
      D: "无绿植 / 极简",
    },
  }),
  buildQuestion({
    id: "city-vibe-q18",
    title: "你喜欢的城市购物？",
    dimension: "consumption-lifestyle",
    dimensionLabel: "生活方式",
    optionLabelMap: {
      A: "菜市场 / 小店",
      B: "文创店 / 精品店",
      C: "综合体 / 潮牌店",
      D: "奢侈品 / 高端店",
    },
  }),
  buildQuestion({
    id: "city-vibe-q19",
    title: "你理想的城市社交？",
    dimension: "social-energy",
    dimensionLabel: "社交能量",
    optionLabelMap: {
      A: "邻里家常",
      B: "朋友小聚",
      C: "多元交友",
      D: "高端圈层",
    },
  }),
  buildQuestion({
    id: "city-vibe-q20",
    title: "你对城市的期待？",
    dimension: "living-rhythm",
    dimensionLabel: "生活节奏",
    optionLabelMap: {
      A: "安稳舒适",
      B: "浪漫美好",
      C: "新鲜有趣",
      D: "成功高效",
    },
  }),
];
