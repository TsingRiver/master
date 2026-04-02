/**
 * 内在小孩测试题库（20 题）：
 * 1. 每题固定 4 个选项，分值规则为 A=1、B=2、C=3、D=4。
 * 2. dimension / dimensionLabel 用于结果页构建“内在小孩图谱”。
 * 3. 题目顺序严格保留需求原稿，避免总分区间解释与用户体感漂移。
 */

/**
 * 固定选项元数据：
 * 关键逻辑：所有题目共用统一分值与反应画像，避免后续维护时计分口径不一致。
 */
const INNER_CHILD_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
    responseKey: "soothing-love",
    responseName: "被爱安抚向",
  },
  B: {
    tier: "B",
    score: 2,
    responseKey: "joyful-play",
    responseName: "快乐互动向",
  },
  C: {
    tier: "C",
    score: 3,
    responseKey: "quiet-growth",
    responseName: "安静成长向",
  },
  D: {
    tier: "D",
    score: 4,
    responseKey: "free-adventure",
    responseName: "自由冒险向",
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number, responseKey: string, responseName: string }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(INNER_CHILD_OPTION_META).map(([tier, optionMeta]) => ({
    id: `${questionId}-option-${tier.toLowerCase()}`,
    tier,
    // 关键逻辑：答题页只展示文案，不额外暴露 A/B/C/D 字母，统一由内部 tier 负责计分。
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
    description: "每题选一个最符合你童年本能反应的答案。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 你的「内在小孩」是什么类型完整题库。
 */
export const INNER_CHILD_QUESTION_BANK = [
  buildQuestion({
    id: "inner-child-q01",
    title: "你小时候最喜欢的玩具？",
    dimension: "playful-curiosity",
    dimensionLabel: "玩心好奇度",
    optionLabelMap: {
      A: "毛绒玩偶",
      B: "积木 / 拼图",
      C: "玩具车 / 娃娃",
      D: "冒险类玩具",
    },
  }),
  buildQuestion({
    id: "inner-child-q02",
    title: "遇到委屈你会？",
    dimension: "expression-directness",
    dimensionLabel: "表达直接度",
    optionLabelMap: {
      A: "默默流泪",
      B: "找大人倾诉",
      C: "自己消化",
      D: "直接反抗",
    },
  }),
  buildQuestion({
    id: "inner-child-q03",
    title: "你喜欢的童年零食？",
    dimension: "playful-curiosity",
    dimensionLabel: "玩心好奇度",
    optionLabelMap: {
      A: "软糖 / 奶糖",
      B: "饼干 / 蛋糕",
      C: "薯片 / 辣条",
      D: "冰棒 / 冷饮",
    },
  }),
  buildQuestion({
    id: "inner-child-q04",
    title: "小时候你更像？",
    dimension: "social-brightness",
    dimensionLabel: "互动活力值",
    optionLabelMap: {
      A: "乖巧听话",
      B: "活泼开朗",
      C: "安静内向",
      D: "调皮捣蛋",
    },
  }),
  buildQuestion({
    id: "inner-child-q05",
    title: "你理想的童年周末？",
    dimension: "playful-curiosity",
    dimensionLabel: "玩心好奇度",
    optionLabelMap: {
      A: "在家看动画",
      B: "和朋友玩耍",
      C: "看书 / 画画",
      D: "户外探险",
    },
  }),
  buildQuestion({
    id: "inner-child-q06",
    title: "被表扬时你会？",
    dimension: "expression-directness",
    dimensionLabel: "表达直接度",
    optionLabelMap: {
      A: "害羞开心",
      B: "大方接受",
      C: "低调谦虚",
      D: "骄傲自豪",
    },
  }),
  buildQuestion({
    id: "inner-child-q07",
    title: "小时候害怕的东西？",
    dimension: "self-direction",
    dimensionLabel: "自主成长力",
    optionLabelMap: {
      A: "黑暗 / 孤独",
      B: "陌生人 / 陌生环境",
      C: "失败 / 批评",
      D: "束缚 / 限制",
    },
  }),
  buildQuestion({
    id: "inner-child-q08",
    title: "你喜欢的童年游戏？",
    dimension: "social-brightness",
    dimensionLabel: "互动活力值",
    optionLabelMap: {
      A: "过家家 / 玩偶游戏",
      B: "跳绳 / 踢毽子",
      C: "下棋 / 猜谜",
      D: "捉迷藏 / 冒险",
    },
  }),
  buildQuestion({
    id: "inner-child-q09",
    title: "小时候的梦想？",
    dimension: "self-direction",
    dimensionLabel: "自主成长力",
    optionLabelMap: {
      A: "被所有人喜欢",
      B: "快乐自由",
      C: "成为厉害的人",
      D: "探索世界",
    },
  }),
  buildQuestion({
    id: "inner-child-q10",
    title: "你对童年的印象？",
    dimension: "social-brightness",
    dimensionLabel: "互动活力值",
    optionLabelMap: {
      A: "温暖治愈",
      B: "快乐无忧",
      C: "安静平淡",
      D: "自由洒脱",
    },
  }),
  buildQuestion({
    id: "inner-child-q11",
    title: "遇到喜欢的东西？",
    dimension: "expression-directness",
    dimensionLabel: "表达直接度",
    optionLabelMap: {
      A: "小心翼翼珍惜",
      B: "开心分享",
      C: "默默喜欢",
      D: "大胆争取",
    },
  }),
  buildQuestion({
    id: "inner-child-q12",
    title: "小时候的性格？",
    dimension: "self-direction",
    dimensionLabel: "自主成长力",
    optionLabelMap: {
      A: "敏感脆弱",
      B: "乐观开朗",
      C: "沉稳懂事",
      D: "叛逆大胆",
    },
  }),
  buildQuestion({
    id: "inner-child-q13",
    title: "你喜欢的童年动画？",
    dimension: "playful-curiosity",
    dimensionLabel: "玩心好奇度",
    optionLabelMap: {
      A: "治愈温情类",
      B: "搞笑欢乐类",
      C: "益智科普类",
      D: "冒险热血类",
    },
  }),
  buildQuestion({
    id: "inner-child-q14",
    title: "被忽视时你会？",
    dimension: "expression-directness",
    dimensionLabel: "表达直接度",
    optionLabelMap: {
      A: "难过失落",
      B: "主动吸引注意",
      C: "默默接受",
      D: "不在意",
    },
  }),
  buildQuestion({
    id: "inner-child-q15",
    title: "小时候的心愿？",
    dimension: "self-direction",
    dimensionLabel: "自主成长力",
    optionLabelMap: {
      A: "永远被宠爱",
      B: "有很多朋友",
      C: "变得更优秀",
      D: "无拘无束",
    },
  }),
  buildQuestion({
    id: "inner-child-q16",
    title: "你喜欢的童年颜色？",
    dimension: "playful-curiosity",
    dimensionLabel: "玩心好奇度",
    optionLabelMap: {
      A: "粉色 / 浅紫",
      B: "黄色 / 橙色",
      C: "蓝色 / 绿色",
      D: "黑色 / 红色",
    },
  }),
  buildQuestion({
    id: "inner-child-q17",
    title: "遇到困难时？",
    dimension: "expression-directness",
    dimensionLabel: "表达直接度",
    optionLabelMap: {
      A: "寻求帮助",
      B: "乐观面对",
      C: "独立解决",
      D: "迎难而上",
    },
  }),
  buildQuestion({
    id: "inner-child-q18",
    title: "小时候的习惯？",
    dimension: "social-brightness",
    dimensionLabel: "互动活力值",
    optionLabelMap: {
      A: "抱玩偶睡觉",
      B: "吃零食追剧",
      C: "安静看书",
      D: "到处乱跑",
    },
  }),
  buildQuestion({
    id: "inner-child-q19",
    title: "你对 “家” 的感觉？",
    dimension: "self-direction",
    dimensionLabel: "自主成长力",
    optionLabelMap: {
      A: "温暖港湾",
      B: "快乐乐园",
      C: "安心之地",
      D: "自由空间",
    },
  }),
  buildQuestion({
    id: "inner-child-q20",
    title: "长大后最怀念童年的？",
    dimension: "social-brightness",
    dimensionLabel: "互动活力值",
    optionLabelMap: {
      A: "纯粹的爱",
      B: "无忧无虑",
      C: "简单美好",
      D: "勇敢无畏",
    },
  }),
];
