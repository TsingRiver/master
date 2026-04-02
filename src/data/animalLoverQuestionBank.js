/**
 * 动物系恋人题库（20 题）：
 * 1. 每题固定 4 个选项，统一分值规则为 A=1、B=2、C=3、D=4。
 * 2. dimension / dimensionLabel 用于结果页构建“恋爱气质图谱”。
 * 3. 题目顺序严格沿用需求原稿，避免总分区间与题感发生漂移。
 */

/**
 * 固定选项类型元数据：
 * 关键逻辑：所有题目共用同一套选项档位，确保全主题计分口径一致。
 */
const ANIMAL_LOVER_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    profileKey: "stable-companion",
    profileName: "稳定陪伴向",
  },
  B: {
    tier: "B",
    score: 2,
    profileKey: "gentle-resonance",
    profileName: "温柔共鸣向",
  },
  C: {
    tier: "C",
    score: 3,
    profileKey: "free-lucid",
    profileName: "自由清醒向",
  },
  D: {
    tier: "D",
    score: 4,
    profileKey: "intense-leading",
    profileName: "热烈主导向",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, profileKey: string, profileName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(ANIMAL_LOVER_OPTION_META).map(([tier, optionMeta]) => ({
    id: `${questionId}-option-${tier.toLowerCase()}`,
    tier,
    // 关键逻辑：题目页不额外展示 A/B/C/D，仅保留内部档位用于计分与分布统计。
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
    description: "每题选一个最符合你恋爱直觉的答案。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 你的性格最像哪种「动物系恋人」完整题库。
 */
export const ANIMAL_LOVER_QUESTION_BANK = [
  buildQuestion({
    id: "animal-lover-q01",
    title: "恋爱中你更看重？",
    dimension: "connection-priority",
    dimensionLabel: "关系取向",
    optionLabelMap: {
      A: "稳定陪伴",
      B: "情绪共鸣",
      C: "自由空间",
      D: "激情浪漫",
    },
  }),
  buildQuestion({
    id: "animal-lover-q02",
    title: "吵架后你会？",
    dimension: "repair-response",
    dimensionLabel: "冲突反应",
    optionLabelMap: {
      A: "主动低头",
      B: "温柔哄人",
      C: "冷静沟通",
      D: "绝不妥协",
    },
  }),
  buildQuestion({
    id: "animal-lover-q03",
    title: "你表达爱的方式？",
    dimension: "expression-style",
    dimensionLabel: "表达方式",
    optionLabelMap: {
      A: "默默付出",
      B: "细腻体贴",
      C: "理性关心",
      D: "大胆直白",
    },
  }),
  buildQuestion({
    id: "animal-lover-q04",
    title: "面对喜欢的人？",
    dimension: "expression-style",
    dimensionLabel: "表达方式",
    optionLabelMap: {
      A: "小心翼翼",
      B: "温柔吸引",
      C: "观察试探",
      D: "主动出击",
    },
  }),
  buildQuestion({
    id: "animal-lover-q05",
    title: "理想约会场景？",
    dimension: "pace-and-role",
    dimensionLabel: "节奏角色",
    optionLabelMap: {
      A: "温馨居家",
      B: "文艺小资",
      C: "户外冒险",
      D: "热闹有趣",
    },
  }),
  buildQuestion({
    id: "animal-lover-q06",
    title: "最不能接受？",
    dimension: "connection-priority",
    dimensionLabel: "关系取向",
    optionLabelMap: {
      A: "冷暴力",
      B: "敷衍不走心",
      C: "控制欲强",
      D: "平淡乏味",
    },
  }),
  buildQuestion({
    id: "animal-lover-q07",
    title: "对方难过时你会？",
    dimension: "repair-response",
    dimensionLabel: "冲突反应",
    optionLabelMap: {
      A: "紧紧拥抱",
      B: "耐心倾听",
      C: "理性分析",
      D: "逗 TA 开心",
    },
  }),
  buildQuestion({
    id: "animal-lover-q08",
    title: "你对恋爱的态度？",
    dimension: "pace-and-role",
    dimensionLabel: "节奏角色",
    optionLabelMap: {
      A: "认真专一",
      B: "双向奔赴",
      C: "享受当下",
      D: "轻松自在",
    },
  }),
  buildQuestion({
    id: "animal-lover-q09",
    title: "你更像哪种动物？",
    dimension: "pace-and-role",
    dimensionLabel: "节奏角色",
    optionLabelMap: {
      A: "奶猫",
      B: "小鹿",
      C: "天鹅",
      D: "海豚",
    },
  }),
  buildQuestion({
    id: "animal-lover-q10",
    title: "你喜欢的恋爱节奏？",
    dimension: "pace-and-role",
    dimensionLabel: "节奏角色",
    optionLabelMap: {
      A: "慢热稳定",
      B: "细腻浪漫",
      C: "忽近忽远",
      D: "快速热烈",
    },
  }),
  buildQuestion({
    id: "animal-lover-q11",
    title: "你在恋爱中是？",
    dimension: "pace-and-role",
    dimensionLabel: "节奏角色",
    optionLabelMap: {
      A: "粘人依赖",
      B: "温柔体贴",
      C: "独立清醒",
      D: "主导掌控",
    },
  }),
  buildQuestion({
    id: "animal-lover-q12",
    title: "你更看重对方？",
    dimension: "connection-priority",
    dimensionLabel: "关系取向",
    optionLabelMap: {
      A: "忠诚可靠",
      B: "共情理解",
      C: "有趣灵魂",
      D: "魅力气场",
    },
  }),
  buildQuestion({
    id: "animal-lover-q13",
    title: "你表达不满的方式？",
    dimension: "repair-response",
    dimensionLabel: "冲突反应",
    optionLabelMap: {
      A: "默默委屈",
      B: "温柔提醒",
      C: "理性沟通",
      D: "直接爆发",
    },
  }),
  buildQuestion({
    id: "animal-lover-q14",
    title: "你喜欢的礼物类型？",
    dimension: "expression-style",
    dimensionLabel: "表达方式",
    optionLabelMap: {
      A: "实用暖心",
      B: "精致浪漫",
      C: "小众特别",
      D: "高调惊喜",
    },
  }),
  buildQuestion({
    id: "animal-lover-q15",
    title: "恋爱中你最擅长？",
    dimension: "expression-style",
    dimensionLabel: "表达方式",
    optionLabelMap: {
      A: "照顾陪伴",
      B: "情绪安抚",
      C: "制造新鲜感",
      D: "主导关系",
    },
  }),
  buildQuestion({
    id: "animal-lover-q16",
    title: "你对异地恋的态度？",
    dimension: "repair-response",
    dimensionLabel: "冲突反应",
    optionLabelMap: {
      A: "很难接受",
      B: "可以接受但需用心",
      C: "无所谓，信任就好",
      D: "不喜欢，更喜欢见面",
    },
  }),
  buildQuestion({
    id: "animal-lover-q17",
    title: "你理想的伴侣性格？",
    dimension: "expression-style",
    dimensionLabel: "表达方式",
    optionLabelMap: {
      A: "温柔包容",
      B: "成熟稳重",
      C: "有趣自由",
      D: "强势有担当",
    },
  }),
  buildQuestion({
    id: "animal-lover-q18",
    title: "你在恋爱中容易？",
    dimension: "repair-response",
    dimensionLabel: "冲突反应",
    optionLabelMap: {
      A: "患得患失",
      B: "付出型人格",
      C: "保持自我",
      D: "掌控欲强",
    },
  }),
  buildQuestion({
    id: "animal-lover-q19",
    title: "你喜欢的恋爱氛围？",
    dimension: "connection-priority",
    dimensionLabel: "关系取向",
    optionLabelMap: {
      A: "安稳温馨",
      B: "浪漫治愈",
      C: "轻松有趣",
      D: "热烈激情",
    },
  }),
  buildQuestion({
    id: "animal-lover-q20",
    title: "恋爱中你最不能忍？",
    dimension: "connection-priority",
    dimensionLabel: "关系取向",
    optionLabelMap: {
      A: "欺骗背叛",
      B: "不被重视",
      C: "失去自由",
      D: "没有激情",
    },
  }),
];
