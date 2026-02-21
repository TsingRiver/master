import {
  FIVE_ELEMENT_GENERATE_MAP,
  FIVE_ELEMENT_KEYS,
  getFiveElementLabel,
} from "../constants/fiveElements";

/**
 * 生成五行选项分值：
 * 关键逻辑：每个选项遵循“主属性 3 分、相生属性 2 分、其余 1 分”的统一口径，
 * 确保题库整体可解释且分值范围稳定。
 * @param {"metal"|"wood"|"water"|"fire"|"earth"} primaryElementKey 选项主五行。
 * @returns {{ metal: number, wood: number, water: number, fire: number, earth: number }} 五行分值向量。
 */
function createElementScoreVector(primaryElementKey) {
  const scoreVector = {
    metal: 1,
    wood: 1,
    water: 1,
    fire: 1,
    earth: 1,
  };

  scoreVector[primaryElementKey] = 3;
  const generatedElementKey = FIVE_ELEMENT_GENERATE_MAP[primaryElementKey];
  if (generatedElementKey) {
    scoreVector[generatedElementKey] = 2;
  }

  return scoreVector;
}

/**
 * 创建单个五行选项。
 * @param {string} questionId 题目 ID。
 * @param {"metal"|"wood"|"water"|"fire"|"earth"} elementKey 五行键名。
 * @param {string} label 选项文案。
 * @returns {{ id: string, label: string, elementKey: string, elementLabel: string, elementScores: object }} 选项对象。
 */
function createElementOption(questionId, elementKey, label) {
  return {
    id: `${questionId}-${elementKey}`,
    label,
    elementKey,
    elementLabel: getFiveElementLabel(elementKey),
    elementScores: createElementScoreVector(elementKey),
  };
}

/**
 * 创建题目对象。
 * @param {{ id: string, title: string, description: string, weight: number, labels: Record<string, string> }} seed 题目种子。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<object> }} 标准题目对象。
 */
function createQuestion(seed) {
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    weight: seed.weight,
    options: FIVE_ELEMENT_KEYS.map((elementKey) =>
      createElementOption(seed.id, elementKey, seed.labels[elementKey]),
    ),
  };
}

/**
 * 五行+城市主题题库（20 题）：
 * 1. 每题覆盖 5 个五行意象选项，减少单一维度偏差。
 * 2. 文案采用轻阅读、生活化场景，适配移动端快速作答。
 */
const QUESTION_SEEDS = [
  {
    id: "wuxing-rhythm",
    title: "终于有完整的一天空闲，你更想？",
    description: "你的休息方式，会暴露长期生活偏好。",
    weight: 1.1,
    labels: {
      metal: "先把计划列好，按节奏完成清单",
      wood: "去有树有风的地方走走，慢慢充电",
      water: "不预设行程，跟着心情自由流动",
      fire: "马上约人出门，把气氛拉满",
      earth: "在家整理、做饭，过稳稳的一天",
    },
  },
  {
    id: "wuxing-pressure",
    title: "当压力突然变大，你第一反应是？",
    description: "面对压力时的行为，是稳定人格线索。",
    weight: 1.25,
    labels: {
      metal: "拆解问题，先处理最关键的一步",
      wood: "先找人聊聊，再逐步理顺情绪",
      water: "先停下来观察局势，找更灵活的解法",
      fire: "直接开干，用行动把焦虑压下去",
      earth: "稳住作息和生活节奏，慢慢扛过去",
    },
  },
  {
    id: "wuxing-social",
    title: "理想社交状态更像？",
    description: "社交密度决定你对城市氛围的需求。",
    weight: 1.0,
    labels: {
      metal: "圈子不大但高效，彼此边界清晰",
      wood: "温暖友好，能互相滋养的关系",
      water: "可近可远，留有呼吸感最舒服",
      fire: "热闹有火花，常有新鲜局",
      earth: "熟人稳定相处，长期可靠最重要",
    },
  },
  {
    id: "wuxing-home-style",
    title: "你偏爱的居住空间是？",
    description: "理想居住环境会直接映射城市选择。",
    weight: 1.05,
    labels: {
      metal: "线条干净、收纳明确的极简空间",
      wood: "有植物和自然材质的温润小屋",
      water: "光影流动、留白感强的安静空间",
      fire: "色彩鲜明、氛围热烈的活力空间",
      earth: "厚实耐住、功能齐全的安心空间",
    },
  },
  {
    id: "wuxing-work-mode",
    title: "面对新任务，你更常用哪种模式？",
    description: "做事节奏会影响你与城市节拍的匹配。",
    weight: 1.2,
    labels: {
      metal: "先定标准，再执行，追求可复用",
      wood: "边做边优化，关注长期成长",
      water: "先摸清脉络，再迭代调整路径",
      fire: "快速推进，先拿结果再补细节",
      earth: "稳扎稳打，确保每一步都可靠",
    },
  },
  {
    id: "wuxing-travel",
    title: "一场短途旅行，你会优先选？",
    description: "旅行偏好是生活方式的缩影。",
    weight: 1.0,
    labels: {
      metal: "城市建筑与展馆，信息密度高",
      wood: "山林徒步与草木景观，身心放松",
      water: "江海湖泊与古巷，流动感强",
      fire: "夜市乐园与演出活动，热闹尽兴",
      earth: "古城慢游与本地生活体验，沉浸稳定",
    },
  },
  {
    id: "wuxing-money",
    title: "关于金钱，你更接近哪种状态？",
    description: "消费和储蓄风格决定城市成本承受区间。",
    weight: 1.1,
    labels: {
      metal: "预算清晰，先算再花",
      wood: "愿意为学习和成长投入",
      water: "保留弹性，按阶段动态调整",
      fire: "喜欢即时体验，花钱买当下快乐",
      earth: "重视储备和安全垫，稳字优先",
    },
  },
  {
    id: "wuxing-conflict",
    title: "出现分歧时，你通常会？",
    description: "冲突处理方式会影响城市社交舒适度。",
    weight: 1.05,
    labels: {
      metal: "就事论事，用规则和事实沟通",
      wood: "先共情对方，再找双方都能接受的点",
      water: "暂缓正面冲突，找更柔和的表达",
      fire: "当场说开，不想把情绪压着",
      earth: "先稳住局面，慢慢把关系修回来",
    },
  },
  {
    id: "wuxing-morning",
    title: "理想早晨的打开方式是？",
    description: "晨间习惯反映你的城市节奏耐受度。",
    weight: 0.95,
    labels: {
      metal: "清单+咖啡，效率起步",
      wood: "拉伸+阳光，身体慢慢苏醒",
      water: "留点空白，听歌发呆后再出发",
      fire: "马上进入状态，安排满满行程",
      earth: "按固定流程来，稳定最安心",
    },
  },
  {
    id: "wuxing-change",
    title: "面对环境变化，你更像？",
    description: "适应变化能力影响跨城迁移体验。",
    weight: 1.2,
    labels: {
      metal: "先建立新秩序，尽快恢复可控感",
      wood: "把变化当成新成长机会",
      water: "顺势而为，边走边看最自然",
      fire: "主动拥抱变化，越新越兴奋",
      earth: "先守住日常稳定，再逐步调整",
    },
  },
  {
    id: "wuxing-food",
    title: "你最在意的饮食体验是？",
    description: "饮食习惯会显著影响城市幸福感。",
    weight: 0.95,
    labels: {
      metal: "品质稳定、干净利落",
      wood: "新鲜清爽、轻负担",
      water: "口味层次丰富、变化多",
      fire: "重口热烈、烟火感强",
      earth: "家常踏实、长期耐吃",
    },
  },
  {
    id: "wuxing-learning",
    title: "学习新技能时，你会怎么做？",
    description: "学习路径会映射工作与城市机会偏好。",
    weight: 1.1,
    labels: {
      metal: "先找框架，再系统推进",
      wood: "持续打卡，让成长可见",
      water: "多看案例，先理解底层逻辑",
      fire: "先上手实践，边做边学",
      earth: "从基础开始，稳稳建立能力",
    },
  },
  {
    id: "wuxing-energy-source",
    title: "你主要通过什么方式回血？",
    description: "恢复方式决定城市环境匹配方向。",
    weight: 1.05,
    labels: {
      metal: "整理空间和任务，重建秩序感",
      wood: "接触自然与人情温度",
      water: "独处沉淀，让情绪慢慢流过",
      fire: "运动、聚会或现场活动",
      earth: "规律作息+熟悉生活节律",
    },
  },
  {
    id: "wuxing-career-stage",
    title: "你当前最看重的职业状态是？",
    description: "职业阶段会改变你对城市的核心诉求。",
    weight: 1.25,
    labels: {
      metal: "平台规范、上升路径清晰",
      wood: "有空间学习进化、不断升级",
      water: "可切换、可探索、保有弹性",
      fire: "机会密度高，节奏快也能冲",
      earth: "长期稳定、抗风险能力强",
    },
  },
  {
    id: "wuxing-night",
    title: "你更喜欢的夜晚状态是？",
    description: "夜间偏好可反映城市活跃度需求。",
    weight: 0.9,
    labels: {
      metal: "读书复盘，给明天做准备",
      wood: "散步或轻社交，慢慢收尾",
      water: "听歌看夜景，留给自己安静时间",
      fire: "夜生活和现场活动，越晚越有劲",
      earth: "早点休息，第二天更稳",
    },
  },
  {
    id: "wuxing-family",
    title: "如果考虑长期安居，你最在意？",
    description: "长期安居偏好是城市匹配的重要权重。",
    weight: 1.2,
    labels: {
      metal: "教育医疗与公共秩序",
      wood: "社区绿化与人情温度",
      water: "气候舒适与环境包容",
      fire: "机会和活力持续在线",
      earth: "居住成本可控且生活稳定",
    },
  },
  {
    id: "wuxing-communication",
    title: "朋友更常怎么评价你？",
    description: "他人视角可帮助反推你的能量主轴。",
    weight: 1.0,
    labels: {
      metal: "清醒靠谱，做事有章法",
      wood: "温暖有耐心，懂得照顾人",
      water: "细腻通透，能看见复杂面",
      fire: "有感染力，带动气氛和行动",
      earth: "稳重踏实，让人有安全感",
    },
  },
  {
    id: "wuxing-home-city",
    title: "你理想中的城市第一感受是？",
    description: "直觉选择往往最接近真实偏好。",
    weight: 1.25,
    labels: {
      metal: "秩序清晰、效率很高",
      wood: "有生命力、能慢慢生长",
      water: "包容灵动、流动感强",
      fire: "热烈鲜活、机会很多",
      earth: "厚实安稳、可长期停靠",
    },
  },
  {
    id: "wuxing-week-plan",
    title: "你对一周安排的理想状态是？",
    description: "时间管理方式可反映节奏适配需求。",
    weight: 1.0,
    labels: {
      metal: "目标明确，日程结构清楚",
      wood: "有主线，也保留成长探索",
      water: "预留弹性，允许临时变化",
      fire: "安排紧凑，持续推进",
      earth: "固定节律，稳步执行",
    },
  },
  {
    id: "wuxing-life-priority",
    title: "现阶段你最想守住的生活关键词是？",
    description: "核心价值观是城市选择的最终锚点。",
    weight: 1.3,
    labels: {
      metal: "清晰边界",
      wood: "持续生长",
      water: "自由流动",
      fire: "热烈表达",
      earth: "安稳扎根",
    },
  },
];

/**
 * 五行+城市匹配题库导出。
 */
export const FIVE_ELEMENTS_CITY_QUESTION_BANK = QUESTION_SEEDS.map(createQuestion);
