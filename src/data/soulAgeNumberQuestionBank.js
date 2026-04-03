/**
 * 灵魂年龄测试维度字段：
 * 1. 所有题目都归档到固定 8 个展示维度，便于结果页稳定输出八维雷达图。
 * 2. 字段顺序固定，避免后续维护时展示顺序漂移。
 */
export const SOUL_AGE_DIMENSION_KEYS = [
  "curiosity",
  "emotion-stability",
  "social-ease",
  "responsibility",
  "resilience",
  "life-enthusiasm",
  "inclusiveness",
  "self-acceptance",
];

/**
 * 固定选项元数据：
 * 关键逻辑：所有题目统一使用 A=1、B=2、C=3、D=4，保证总分区间与需求文案严格一致。
 */
const SOUL_AGE_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    score: 1,
  },
  B: {
    tier: "B",
    score: 2,
  },
  C: {
    tier: "C",
    score: 3,
  },
  D: {
    tier: "D",
    score: 4,
  },
});

/**
 * 组装单题固定选项列表。
 * @param {string} questionId 题目 ID。
 * @param {{ A: string, B: string, C: string, D: string }} optionLabelMap 选项文案映射。
 * @returns {Array<{ id: string, tier: string, label: string, score: number }>} 标准化选项列表。
 */
function buildQuestionOptions(questionId, optionLabelMap) {
  return Object.entries(SOUL_AGE_OPTION_META).map(([tier, optionMeta]) => ({
    id: `${questionId}-option-${tier.toLowerCase()}`,
    tier,
    // 关键逻辑：界面只展示用户原始文案，A/B/C/D 仅保留为内部计分字段。
    label: String(optionLabelMap[tier] ?? "").trim(),
    score: optionMeta.score,
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
 *   id: string,
 *   title: string,
 *   description: string,
 *   dimension: string,
 *   dimensionLabel: string,
 *   options: Array<object>
 * }} 标准题目对象。
 */
function buildQuestion({
  id,
  title,
  dimension,
  dimensionLabel,
  optionLabelMap,
}) {
  return {
    id,
    title,
    description: "每题选一个最符合你日常状态的答案。",
    dimension,
    dimensionLabel,
    options: buildQuestionOptions(id, optionLabelMap),
  };
}

/**
 * 灵魂年龄完整题库（固定 20 题）：
 * 1. 题目顺序严格保持需求原稿顺序，确保总分区间体验稳定。
 * 2. 不再做随机抽题，避免 20 题总分制被破坏。
 */
export const SOUL_AGE_QUESTION_BANK = [
  buildQuestion({
    id: "soul-age-q01",
    title: "遇到突发状况，你的第一反应是？",
    dimension: "resilience",
    dimensionLabel: "抗逆力",
    optionLabelMap: {
      A: "有点慌，需要别人拿主意",
      B: "冷静分析，快速想解决办法",
      C: "先稳住情绪，再慢慢处理",
      D: "无所谓，顺其自然就好",
    },
  }),
  buildQuestion({
    id: "soul-age-q02",
    title: "你更喜欢哪种生活节奏？",
    dimension: "life-enthusiasm",
    dimensionLabel: "生活热情",
    optionLabelMap: {
      A: "热闹新鲜，每天都有新变化",
      B: "有计划有目标，稳步向前",
      C: "松弛自在，不被时间追赶",
      D: "安静简单，享受独处时光",
    },
  }),
  buildQuestion({
    id: "soul-age-q03",
    title: "面对别人的批评，你会？",
    dimension: "self-acceptance",
    dimensionLabel: "自我接纳",
    optionLabelMap: {
      A: "难过委屈，容易自我怀疑",
      B: "理性看待，有则改之无则加勉",
      C: "表面不在意，心里默默消化",
      D: "完全不往心里去，做自己就好",
    },
  }),
  buildQuestion({
    id: "soul-age-q04",
    title: "你对“未来”的态度是？",
    dimension: "curiosity",
    dimensionLabel: "好奇心",
    optionLabelMap: {
      A: "充满期待，喜欢畅想各种可能",
      B: "认真规划，一步步落实目标",
      C: "偶尔思考，更在意当下感受",
      D: "不太想，过好每一天就行",
    },
  }),
  buildQuestion({
    id: "soul-age-q05",
    title: "朋友遇到困难，你会？",
    dimension: "inclusiveness",
    dimensionLabel: "包容度",
    optionLabelMap: {
      A: "感同身受，陪着一起难过",
      B: "理性分析，帮 TA 找解决方案",
      C: "温柔安慰，给 TA 情绪支撑",
      D: "轻松开导，让 TA 别太焦虑",
    },
  }),
  buildQuestion({
    id: "soul-age-q06",
    title: "你更偏爱哪种娱乐方式？",
    dimension: "life-enthusiasm",
    dimensionLabel: "生活热情",
    optionLabelMap: {
      A: "刺激新鲜的（密室、过山车、演唱会）",
      B: "有意义的（看展、看书、学习新技能）",
      C: "治愈放松的（散步、听歌、宅家）",
      D: "佛系随意的（发呆、晒太阳、躺平）",
    },
  }),
  buildQuestion({
    id: "soul-age-q07",
    title: "当你感到疲惫时，会选择？",
    dimension: "resilience",
    dimensionLabel: "抗逆力",
    optionLabelMap: {
      A: "找朋友倾诉，释放情绪",
      B: "独自扛着，快速调整状态",
      C: "放慢脚步，给自己放空时间",
      D: "彻底摆烂，什么都不想做",
    },
  }),
  buildQuestion({
    id: "soul-age-q08",
    title: "你觉得自己最像哪个阶段？",
    dimension: "self-acceptance",
    dimensionLabel: "自我接纳",
    optionLabelMap: {
      A: "无忧无虑的孩童",
      B: "努力拼搏的青年",
      C: "通透从容的中年",
      D: "看淡一切的老年",
    },
  }),
  buildQuestion({
    id: "soul-age-q09",
    title: "你对“新鲜感”的需求？",
    dimension: "curiosity",
    dimensionLabel: "好奇心",
    optionLabelMap: {
      A: "非常需要，没新鲜感会无聊",
      B: "偶尔需要，调剂生活",
      C: "不太需要，安稳就好",
      D: "完全不需要，喜欢一成不变",
    },
  }),
  buildQuestion({
    id: "soul-age-q10",
    title: "你处理情绪的方式？",
    dimension: "emotion-stability",
    dimensionLabel: "情绪稳定",
    optionLabelMap: {
      A: "直接表达，喜怒哀乐写在脸上",
      B: "理性克制，不轻易表露",
      C: "慢慢消化，自我调节",
      D: "佛系看淡，不被情绪左右",
    },
  }),
  buildQuestion({
    id: "soul-age-q11",
    title: "你喜欢的社交方式？",
    dimension: "social-ease",
    dimensionLabel: "社交从容",
    optionLabelMap: {
      A: "热闹聚会，认识新朋友",
      B: "小范围深交，知己两三",
      C: "偶尔社交，多数独处",
      D: "几乎不社交，享受孤独",
    },
  }),
  buildQuestion({
    id: "soul-age-q12",
    title: "你对“责任”的看法？",
    dimension: "responsibility",
    dimensionLabel: "责任担当",
    optionLabelMap: {
      A: "害怕承担，想逃避",
      B: "主动承担，有担当",
      C: "量力而行，不勉强",
      D: "无所谓，随性而为",
    },
  }),
  buildQuestion({
    id: "soul-age-q13",
    title: "你更看重？",
    dimension: "self-acceptance",
    dimensionLabel: "自我接纳",
    optionLabelMap: {
      A: "当下的快乐",
      B: "未来的成就",
      C: "内心的平静",
      D: "自由的生活",
    },
  }),
  buildQuestion({
    id: "soul-age-q14",
    title: "你对“遗憾”的态度？",
    dimension: "emotion-stability",
    dimensionLabel: "情绪稳定",
    optionLabelMap: {
      A: "耿耿于怀，难以释怀",
      B: "总结经验，向前看",
      C: "慢慢放下，坦然接受",
      D: "从不纠结，过眼云烟",
    },
  }),
  buildQuestion({
    id: "soul-age-q15",
    title: "你喜欢的学习方式？",
    dimension: "curiosity",
    dimensionLabel: "好奇心",
    optionLabelMap: {
      A: "兴趣驱动，想学就学",
      B: "目标明确，系统学习",
      C: "随性而为，碎片化吸收",
      D: "不爱学习，享受当下",
    },
  }),
  buildQuestion({
    id: "soul-age-q16",
    title: "你对“改变”的态度？",
    dimension: "resilience",
    dimensionLabel: "抗逆力",
    optionLabelMap: {
      A: "期待改变，喜欢挑战",
      B: "接受改变，适应调整",
      C: "害怕改变，喜欢稳定",
      D: "抗拒改变，安于现状",
    },
  }),
  buildQuestion({
    id: "soul-age-q17",
    title: "你理想的晚年生活？",
    dimension: "life-enthusiasm",
    dimensionLabel: "生活热情",
    optionLabelMap: {
      A: "热闹充实，环游世界",
      B: "安稳富足，家庭美满",
      C: "平静惬意，养花种草",
      D: "佛系躺平，无欲无求",
    },
  }),
  buildQuestion({
    id: "soul-age-q18",
    title: "你对“金钱”的看法？",
    dimension: "responsibility",
    dimensionLabel: "责任担当",
    optionLabelMap: {
      A: "越多越好，追求财富",
      B: "够用就好，理性消费",
      C: "不太在意，够花就行",
      D: "随缘就好，不刻意追求",
    },
  }),
  buildQuestion({
    id: "soul-age-q19",
    title: "你对“人际关系”的态度？",
    dimension: "social-ease",
    dimensionLabel: "社交从容",
    optionLabelMap: {
      A: "积极经营，渴望被认可",
      B: "真诚相待，宁缺毋滥",
      C: "随缘相处，不勉强",
      D: "独来独往，不在乎",
    },
  }),
  buildQuestion({
    id: "soul-age-q20",
    title: "你觉得人生最重要的是？",
    dimension: "self-acceptance",
    dimensionLabel: "自我接纳",
    optionLabelMap: {
      A: "快乐自由",
      B: "成功成就",
      C: "平安健康",
      D: "内心通透",
    },
  }),
];
