/**
 * 温柔 / 野性底色题库（20 题）：
 * 1. 每题固定 4 个选项，分值规则为 A=1、B=2、C=3、D=4。
 * 2. dimension / dimensionLabel 用于结果页构建“柔野张力图谱”。
 * 3. 题目顺序严格保持需求原稿顺序，避免分数区间解释与题目体验漂移。
 */

/**
 * 固定选项元数据：
 * 关键逻辑：所有题目共用统一的分值与反应标签，避免后续维护时计分口径不一致。
 */
const GENTLE_WILD_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    responseKey: "soft-contained",
    responseName: "柔软收敛向",
  },
  B: {
    tier: "B",
    score: 2,
    responseKey: "gentle-warm",
    responseName: "温柔抚慰向",
  },
  C: {
    tier: "C",
    score: 3,
    responseKey: "lucid-fierce",
    responseName: "清醒锋感向",
  },
  D: {
    tier: "D",
    score: 4,
    responseKey: "wild-dominant",
    responseName: "野性掌场向",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, responseKey: string, responseName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(GENTLE_WILD_OPTION_META).map(
    ([tier, optionMeta]) => ({
      id: `${questionId}-option-${tier.toLowerCase()}`,
      tier,
      // 关键逻辑：题目页不额外展示 A/B/C/D 字母，只保留内部 tier 供计分与统计使用。
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
    description: "每题选一个最符合你本能反应的答案。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 测测你骨子里是「温柔」还是「野性」完整题库。
 */
export const GENTLE_WILD_QUESTION_BANK = [
  buildQuestion({
    id: "gentle-wild-q01",
    title: "朋友难过，你第一反应是？",
    dimension: "emotional-release",
    dimensionLabel: "情绪外放",
    optionLabelMap: {
      A: "安静陪着，不说话",
      B: "温柔安慰，慢慢开导",
      C: "理性分析，给建议",
      D: "直接拉 TA 出去疯玩",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q02",
    title: "遇到不公平，你会？",
    dimension: "boundary-edge",
    dimensionLabel: "边界锋度",
    optionLabelMap: {
      A: "默默忍下",
      B: "小声表达不满",
      C: "冷静讲道理",
      D: "当场反击",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q03",
    title: "你更喜欢？",
    dimension: "freedom-urge",
    dimensionLabel: "自由野感",
    optionLabelMap: {
      A: "安静宅家",
      B: "小聚聊天",
      C: "有计划出门",
      D: "冒险刺激",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q04",
    title: "吵架后你会？",
    dimension: "boundary-edge",
    dimensionLabel: "边界锋度",
    optionLabelMap: {
      A: "主动求和",
      B: "等对方找你",
      C: "冷静后沟通",
      D: "绝不低头",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q05",
    title: "你表达爱的方式是？",
    dimension: "emotional-release",
    dimensionLabel: "情绪外放",
    optionLabelMap: {
      A: "默默付出",
      B: "温柔体贴",
      C: "理性关心",
      D: "热烈直接",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q06",
    title: "压力大时你会？",
    dimension: "emotional-release",
    dimensionLabel: "情绪外放",
    optionLabelMap: {
      A: "躲起来自愈",
      B: "找人倾诉",
      C: "强迫自己冷静",
      D: "彻底释放",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q07",
    title: "你对规则的态度？",
    dimension: "boundary-edge",
    dimensionLabel: "边界锋度",
    optionLabelMap: {
      A: "严格遵守",
      B: "基本遵守",
      C: "灵活变通",
      D: "打破规则",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q08",
    title: "你更像？",
    dimension: "presence-control",
    dimensionLabel: "主场气场",
    optionLabelMap: {
      A: "软萌可爱",
      B: "温柔体贴",
      C: "独立清醒",
      D: "狂野不羁",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q09",
    title: "你喜欢的穿搭风格？",
    dimension: "presence-control",
    dimensionLabel: "主场气场",
    optionLabelMap: {
      A: "甜美可爱",
      B: "温柔简约",
      C: "干练利落",
      D: "个性张扬",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q10",
    title: "面对新环境，你会？",
    dimension: "presence-control",
    dimensionLabel: "主场气场",
    optionLabelMap: {
      A: "紧张害怕",
      B: "慢慢适应",
      C: "主动融入",
      D: "轻松掌控",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q11",
    title: "你更看重？",
    dimension: "freedom-urge",
    dimensionLabel: "自由野感",
    optionLabelMap: {
      A: "安全感",
      B: "陪伴感",
      C: "自由感",
      D: "刺激感",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q12",
    title: "你处理问题的方式？",
    dimension: "boundary-edge",
    dimensionLabel: "边界锋度",
    optionLabelMap: {
      A: "逃避拖延",
      B: "温和解决",
      C: "理性分析",
      D: "果断行动",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q13",
    title: "你喜欢的音乐风格？",
    dimension: "emotional-release",
    dimensionLabel: "情绪外放",
    optionLabelMap: {
      A: "抒情温柔",
      B: "流行舒缓",
      C: "独立摇滚",
      D: "电音嗨歌",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q14",
    title: "你对未来的态度？",
    dimension: "freedom-urge",
    dimensionLabel: "自由野感",
    optionLabelMap: {
      A: "迷茫害怕",
      B: "期待美好",
      C: "规划清晰",
      D: "无畏挑战",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q15",
    title: "你更适合的角色？",
    dimension: "presence-control",
    dimensionLabel: "主场气场",
    optionLabelMap: {
      A: "被保护者",
      B: "治愈者",
      C: "领导者",
      D: "开拓者",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q16",
    title: "你喜欢的颜色？",
    dimension: "presence-control",
    dimensionLabel: "主场气场",
    optionLabelMap: {
      A: "粉色 / 白色",
      B: "蓝色 / 绿色",
      C: "黑色 / 灰色",
      D: "红色 / 黄色",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q17",
    title: "你对爱情的态度？",
    dimension: "emotional-release",
    dimensionLabel: "情绪外放",
    optionLabelMap: {
      A: "被动等待",
      B: "温柔付出",
      C: "理性选择",
      D: "热烈追求",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q18",
    title: "你更像哪种动物？",
    dimension: "boundary-edge",
    dimensionLabel: "边界锋度",
    optionLabelMap: {
      A: "兔子",
      B: "猫咪",
      C: "狼",
      D: "狮子",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q19",
    title: "你喜欢的电影类型？",
    dimension: "freedom-urge",
    dimensionLabel: "自由野感",
    optionLabelMap: {
      A: "爱情文艺",
      B: "温情治愈",
      C: "悬疑推理",
      D: "动作冒险",
    },
  }),
  buildQuestion({
    id: "gentle-wild-q20",
    title: "你理想的生活？",
    dimension: "freedom-urge",
    dimensionLabel: "自由野感",
    optionLabelMap: {
      A: "安稳平淡",
      B: "温馨幸福",
      C: "自由独立",
      D: "精彩刺激",
    },
  }),
];
