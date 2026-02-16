/**
 * 贵人星座维度中文标签：
 * 用于输出本地叙事、维度摘要与结果解释。
 */
const BENEFACTOR_DIMENSION_LABELS = {
  action: "行动节奏",
  social: "社交协同",
  empathy: "共情承接",
  reason: "理性判断",
  stability: "稳定执行",
  exploration: "探索意愿",
  expression: "表达张力",
  support: "支持力度",
};

/**
 * 维度字段数组。
 */
const BENEFACTOR_DIMENSION_KEYS = Object.keys(BENEFACTOR_DIMENSION_LABELS);

/**
 * 星座分布图配色映射：
 * 用于结果页进度条颜色区分，提升可读性。
 */
const BENEFACTOR_SIGN_COLOR_MAP = {
  白羊座: "#FF6B6B",
  金牛座: "#C29B5A",
  双子座: "#56C2C9",
  巨蟹座: "#6F9BFF",
  狮子座: "#FF9F43",
  处女座: "#7FC08D",
  天秤座: "#C084FC",
  天蝎座: "#9B5DE5",
  射手座: "#F97316",
  摩羯座: "#6B7280",
  水瓶座: "#38BDF8",
  双鱼座: "#A78BFA",
};

/**
 * 贵人星座画像库：
 * profile 与题库选项向量处于同一维度空间，便于统一匹配评分。
 */
const BENEFACTOR_SIGN_PROFILES = [
  {
    sign: "白羊座",
    code: "ARIES",
    profile: {
      action: 10,
      social: 7,
      empathy: 5,
      reason: 5,
      stability: 4,
      exploration: 9,
      expression: 8,
      support: 5,
    },
    supportStyle: "关键时刻敢推你一把，帮助你把想法快速落地。",
  },
  {
    sign: "金牛座",
    code: "TAURUS",
    profile: {
      action: 5,
      social: 5,
      empathy: 6,
      reason: 8,
      stability: 10,
      exploration: 3,
      expression: 4,
      support: 8,
    },
    supportStyle: "擅长提供稳定资源和长期支持，让你少走弯路。",
  },
  {
    sign: "双子座",
    code: "GEMINI",
    profile: {
      action: 7,
      social: 10,
      empathy: 6,
      reason: 7,
      stability: 4,
      exploration: 8,
      expression: 10,
      support: 5,
    },
    supportStyle: "信息面广、反应快，常能给你带来关键机会线索。",
  },
  {
    sign: "巨蟹座",
    code: "CANCER",
    profile: {
      action: 4,
      social: 6,
      empathy: 10,
      reason: 5,
      stability: 7,
      exploration: 4,
      expression: 7,
      support: 10,
    },
    supportStyle: "在你压力高时很会托住情绪和节奏，提供安全感。",
  },
  {
    sign: "狮子座",
    code: "LEO",
    profile: {
      action: 9,
      social: 9,
      empathy: 6,
      reason: 6,
      stability: 5,
      exploration: 7,
      expression: 9,
      support: 6,
    },
    supportStyle: "会在公开场合为你站台，帮你放大影响力。",
  },
  {
    sign: "处女座",
    code: "VIRGO",
    profile: {
      action: 6,
      social: 5,
      empathy: 6,
      reason: 10,
      stability: 9,
      exploration: 4,
      expression: 5,
      support: 7,
    },
    supportStyle: "擅长补细节与查漏补缺，帮你把结果做扎实。",
  },
  {
    sign: "天秤座",
    code: "LIBRA",
    profile: {
      action: 6,
      social: 9,
      empathy: 8,
      reason: 7,
      stability: 6,
      exploration: 6,
      expression: 8,
      support: 8,
    },
    supportStyle: "擅长协调关系和资源，能帮你减少人际摩擦成本。",
  },
  {
    sign: "天蝎座",
    code: "SCORPIO",
    profile: {
      action: 7,
      social: 5,
      empathy: 9,
      reason: 8,
      stability: 6,
      exploration: 6,
      expression: 7,
      support: 6,
    },
    supportStyle: "洞察深、判断准，常在关键节点给你定向建议。",
  },
  {
    sign: "射手座",
    code: "SAGITTARIUS",
    profile: {
      action: 8,
      social: 8,
      empathy: 5,
      reason: 6,
      stability: 3,
      exploration: 10,
      expression: 8,
      support: 4,
    },
    supportStyle: "会为你打开视野和新路径，带来外部增量机会。",
  },
  {
    sign: "摩羯座",
    code: "CAPRICORN",
    profile: {
      action: 7,
      social: 4,
      empathy: 5,
      reason: 9,
      stability: 10,
      exploration: 3,
      expression: 4,
      support: 7,
    },
    supportStyle: "擅长目标拆解与长期推进，帮你稳住主线节奏。",
  },
  {
    sign: "水瓶座",
    code: "AQUARIUS",
    profile: {
      action: 7,
      social: 7,
      empathy: 5,
      reason: 8,
      stability: 5,
      exploration: 8,
      expression: 9,
      support: 5,
    },
    supportStyle: "创意与策略兼具，常帮你找到非标准解法。",
  },
  {
    sign: "双鱼座",
    code: "PISCES",
    profile: {
      action: 4,
      social: 7,
      empathy: 10,
      reason: 4,
      stability: 4,
      exploration: 7,
      expression: 8,
      support: 9,
    },
    supportStyle: "共情与灵感很强，能在你低谷期给到温柔支持。",
  },
];

/**
 * 创建零向量。
 * @returns {{ [key: string]: number }} 零向量对象。
 */
function createZeroVector() {
  return BENEFACTOR_DIMENSION_KEYS.reduce((accumulator, dimensionKey) => {
    accumulator[dimensionKey] = 0;
    return accumulator;
  }, {});
}

/**
 * 构建结构化答卷摘要。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案 ID 列表。
 * @returns {Array<object>} 答卷摘要对象数组。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    return {
      questionId: questionItem.id,
      questionTitle: questionItem.title,
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      weight: Number(questionItem.weight ?? 1),
      vector: selectedOption?.vector ?? {},
    };
  });
}

/**
 * 生成可读摘要文本。
 * @param {Array<object>} answerSummary 答卷摘要对象数组。
 * @returns {Array<string>} 摘要文本。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 由答卷构建用户偏好向量。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案列表。
 * @returns {{ preferenceVector: object, dimensionWeights: object }} 偏好向量与维度权重。
 */
function buildPreferenceVector(questions, answerIds) {
  const weightedSum = createZeroVector();
  const dimensionWeights = createZeroVector();

  questions.forEach((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    if (!selectedOption) {
      return;
    }

    Object.entries(selectedOption.vector).forEach(([dimensionKey, dimensionValue]) => {
      const value = Number(dimensionValue ?? 0);
      if (!Number.isFinite(value)) {
        return;
      }

      const questionWeight = Number(questionItem.weight ?? 1);

      // 关键逻辑：向量值叠加题目权重，确保关键题影响力更高。
      weightedSum[dimensionKey] += value * questionWeight;
      dimensionWeights[dimensionKey] += questionWeight;
    });
  });

  const preferenceVector = createZeroVector();
  BENEFACTOR_DIMENSION_KEYS.forEach((dimensionKey) => {
    const currentWeight = dimensionWeights[dimensionKey];
    preferenceVector[dimensionKey] =
      currentWeight > 0 ? weightedSum[dimensionKey] / currentWeight : 5;
  });

  return { preferenceVector, dimensionWeights };
}

/**
 * 计算单星座匹配分值。
 * @param {object} signProfile 星座画像向量。
 * @param {object} preferenceVector 用户偏好向量。
 * @param {object} dimensionWeights 维度权重。
 * @returns {number} 匹配分值（0~100）。
 */
function calculateSignScore(signProfile, preferenceVector, dimensionWeights) {
  let weightedDistanceSquare = 0;
  let weightedMaxDistanceSquare = 0;

  BENEFACTOR_DIMENSION_KEYS.forEach((dimensionKey) => {
    // 关键逻辑：设置最小权重，避免弱覆盖维度被完全忽略。
    const weight = Math.max(Number(dimensionWeights[dimensionKey] ?? 0), 0.6);
    const gap = Number(signProfile[dimensionKey] ?? 0) - Number(preferenceVector[dimensionKey] ?? 0);
    weightedDistanceSquare += weight * gap * gap;
    weightedMaxDistanceSquare += weight * 100;
  });

  const normalizedDistance =
    Math.sqrt(weightedDistanceSquare) / Math.sqrt(weightedMaxDistanceSquare);
  const score = Math.round((1 - normalizedDistance) * 100);
  return Math.max(0, Math.min(100, score));
}

/**
 * 构建维度对照明细。
 * 复杂度评估：O(D)
 * D 为维度数量（固定 8）。
 * @param {object} preferenceVector 用户偏好向量。
 * @param {object} signProfile 主星座画像向量。
 * @returns {Array<{ key: string, label: string, userValue: number, signValue: number, gapValue: number, absGapValue: number }>} 维度明细数组。
 */
function buildDimensionRows(preferenceVector, signProfile) {
  return BENEFACTOR_DIMENSION_KEYS.map((dimensionKey) => {
    const userValue = Number(preferenceVector[dimensionKey] ?? 0);
    const signValue = Number(signProfile[dimensionKey] ?? 0);
    const gapValue = Number((signValue - userValue).toFixed(2));

    return {
      key: dimensionKey,
      label: BENEFACTOR_DIMENSION_LABELS[dimensionKey],
      userValue: Number(userValue.toFixed(2)),
      signValue: Number(signValue.toFixed(2)),
      gapValue,
      absGapValue: Number(Math.abs(gapValue).toFixed(2)),
    };
  });
}

/**
 * 提取维度洞察信息。
 * 复杂度评估：O(D log D)
 * D 为维度数量（固定 8）。
 * @param {object} preferenceVector 用户偏好向量。
 * @param {object} topSign 主匹配星座对象。
 * @returns {{ rows: Array<object>, selfStrength: Array<object>, resonance: Array<object>, supportBoost: Array<object>, caution: Array<object> }} 维度洞察对象。
 */
function buildDimensionInsights(preferenceVector, topSign) {
  const rows = buildDimensionRows(preferenceVector, topSign.profile ?? {});

  const selfStrength = [...rows]
    .sort((leftItem, rightItem) => rightItem.userValue - leftItem.userValue)
    .slice(0, 3);

  const resonance = [...rows]
    .sort((leftItem, rightItem) => leftItem.absGapValue - rightItem.absGapValue)
    .slice(0, 3);

  const supportBoost = [...rows]
    .filter((item) => item.gapValue > 0)
    .sort((leftItem, rightItem) => rightItem.gapValue - leftItem.gapValue)
    .slice(0, 3);

  const caution = [...rows]
    .sort((leftItem, rightItem) => leftItem.userValue - rightItem.userValue)
    .slice(0, 2);

  return { rows, selfStrength, resonance, supportBoost, caution };
}

/**
 * 构建贵人主题标签。
 * @param {object} topSign 主匹配星座对象。
 * @param {object} dimensionInsights 维度洞察。
 * @returns {Array<string>} 标签列表。
 */
function buildBenefactorTagChips(topSign, dimensionInsights) {
  const resonanceTag = dimensionInsights.resonance[0]?.label ?? "协作同频";
  const boostTag = dimensionInsights.supportBoost[0]?.label ?? "短板补位";
  const strengthTag = dimensionInsights.selfStrength[0]?.label ?? "优势放大";

  return [
    `${topSign.sign}贵人`,
    `${resonanceTag}同频`,
    `${boostTag}补位`,
    `${strengthTag}放大`,
    "关键节点助推",
    "关系协作增益",
  ];
}

/**
 * 构建本地“贵人出现地图”。
 * @param {object} topSign 主匹配星座对象。
 * @param {object} dimensionInsights 维度洞察。
 * @returns {Array<string>} 场景列表。
 */
function buildEncounterScenes(topSign, dimensionInsights) {
  const topResonance = dimensionInsights.resonance[0]?.label ?? "互动节奏";
  const topBoost = dimensionInsights.supportBoost[0]?.label ?? "关系支持";

  return [
    `高概率场景：涉及${topResonance}的朋友聚会、兴趣社群、同城活动与日常聊天圈。`,
    `关键触发点：当你在${topBoost}上有明显需求时，${topSign.sign}类型的人更容易主动靠近并给你实质帮助。`,
    "出现方式更多是“朋友的朋友、共同爱好、长期互动中的自然靠近”，而不是一次性陌生社交。",
    "你越是自然分享近况和真实情绪，越容易被真正愿意支持你的人识别到。",
  ];
}

/**
 * 构建本地“人际互动画像”。
 * @param {object} topSign 主匹配星座对象。
 * @returns {Array<string>} 互动画像列表。
 */
function buildCollaborationStyles(topSign) {
  return [
    `你和${topSign.sign}类型的人更容易形成“你先表达、对方接住并补位”的互动节奏。`,
    "关系升温通常不是靠一次深聊，而是靠多次稳定、真诚、不过度用力的往来。",
    "当你愿意把边界说清楚、把情绪说具体，对方会更愿意长期站在你这边。",
  ];
}

/**
 * 构建本地“沟通钥匙”。
 * @param {object} dimensionInsights 维度洞察。
 * @returns {Array<string>} 沟通建议列表。
 */
function buildCommunicationTips(dimensionInsights) {
  const cautionLabel = dimensionInsights.caution[0]?.label ?? "情绪管理";

  return [
    "沟通时先说感受，再说你希望对方怎么做，关系会更顺畅。",
    "出现误会时先确认对方真实意思，不要用猜测替代对话。",
    `当你在${cautionLabel}维度波动时，先慢下来整理情绪，再决定要不要继续聊。`,
  ];
}

/**
 * 构建本地“情绪支持方式”。
 * @param {object} topSign 主匹配星座对象。
 * @returns {Array<string>} 情绪支持列表。
 */
function buildResourceChannels(topSign) {
  return [
    `${topSign.sign}类型的贵人更常见的支持方式是：先稳定你的情绪，再帮你理清下一步。`,
    "你最容易感受到支持的渠道是“日常持续联系的人”，而不是临时出现的强关系。",
    "建议把“谁会安慰你、谁会给建议、谁会陪你行动”区分开来，支持会更精准。",
  ];
}

/**
 * 构建本地“年度人际节奏提示”。
 * @returns {Array<string>} 年度节奏列表。
 */
function buildMonthlyRhythm() {
  return [
    "Q1（1-3月）：适合修复旧关系、清理低消耗社交，保留真正同频的人。",
    "Q2（4-6月）：人际扩张期，容易在兴趣圈和朋友局遇到愿意拉你一把的人。",
    "Q3-Q4（7-12月）：关系沉淀期，重点经营高质量长期连接，减少无效来往。",
  ];
}

/**
 * 构建本地“关系升温动作”。
 * @param {object} dimensionInsights 维度洞察。
 * @returns {Array<string>} 机会动作列表。
 */
function buildKeyOpportunities(dimensionInsights) {
  const topStrength = dimensionInsights.selfStrength[0]?.label ?? "表达能力";
  const topBoost = dimensionInsights.supportBoost[0]?.label ?? "情绪承接";

  return [
    `先把你的${topStrength}优势用日常方式展示出来，让别人知道你真实的闪光点。`,
    `在你容易卡住的${topBoost}场景，主动找值得信任的人聊，不要一个人硬扛。`,
    "每周主动联系 1 位你认可的人，保持低压力但稳定的关系温度。",
    "在关系里先给出具体善意（倾听、回应、兑现），贵人更愿意长期回馈你。",
    "把“感谢”说出口，把“需要”说具体，你会更容易得到真实支持。",
  ];
}

/**
 * 构建本地“社交避坑提醒”。
 * @param {object} dimensionInsights 维度洞察。
 * @returns {Array<string>} 避坑列表。
 */
function buildAvoidSignals(dimensionInsights) {
  const cautionLabel = dimensionInsights.caution[0]?.label ?? "稳定表达";
  const secondCautionLabel = dimensionInsights.caution[1]?.label ?? "情绪承接";

  return [
    `在${cautionLabel}不稳定时，容易把“别人的节奏问题”误读成“别人不在乎你”。`,
    `若${secondCautionLabel}起伏较大，关系里会出现“想靠近又想后退”的反复拉扯。`,
    "只倾诉但不说清楚自己真正需要什么，会让支持你的人无从下手。",
    "把所有人都当成潜在贵人会消耗你自己，先经营少量高质量关系更有效。",
  ];
}

/**
 * 构建本地叙事文本。
 * @param {object} topSign 主匹配星座对象。
 * @param {object} dimensionInsights 维度洞察对象。
 * @returns {string} 本地结论文本。
 */
function buildLocalNarrative(topSign, dimensionInsights) {
  const topDimensions = dimensionInsights.selfStrength
    .slice(0, 3)
    .map((item) => item.label);

  return `2026 年与你最容易形成“贵人同频”的星座是「${topSign.sign}」。你在${topDimensions.join("、")}上与该星座更容易形成协作共振。${topSign.supportStyle}`;
}

/**
 * 2026 贵人星座本地分析。
 * 复杂度评估：
 * 1. 用户向量构建：O(Q * D)
 * 2. 星座评分：O(S * D)
 * 3. 排序：O(S log S)
 * 总体复杂度：O(Q * D + S * D + S log S)
 * 其中：
 * Q 为题量（本项目单轮 10~15 题），D 为维度数量（8），S 为星座数量（12）。
 * @param {object} params 参数对象。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案列表。
 * @returns {{ topSign: object, topThree: Array<object>, scoredSigns: Array<object>, preferenceVector: object, dimensionWeights: object, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string, tagChips: Array<string>, dimensionInsights: object, encounterScenes: Array<string>, collaborationStyles: Array<string>, communicationTips: Array<string>, resourceChannels: Array<string>, monthlyRhythm: Array<string>, keyOpportunities: Array<string>, avoidSignals: Array<string> }} 本地分析结果。
 */
export function analyzeBenefactor2026Locally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const { preferenceVector, dimensionWeights } = buildPreferenceVector(
    questions,
    answerIds,
  );

  const scoredSigns = BENEFACTOR_SIGN_PROFILES.map((signItem) => ({
    ...signItem,
    // 关键逻辑：把颜色映射挂在评分对象上，供结果分布模块直接使用。
    color: BENEFACTOR_SIGN_COLOR_MAP[signItem.sign] ?? "#7A8CB8",
    score: calculateSignScore(signItem.profile, preferenceVector, dimensionWeights),
  })).sort((leftItem, rightItem) => rightItem.score - leftItem.score);

  const topSign = scoredSigns[0];
  const topThree = scoredSigns.slice(0, 3);
  const dimensionInsights = buildDimensionInsights(preferenceVector, topSign);
  const tagChips = buildBenefactorTagChips(topSign, dimensionInsights);
  const encounterScenes = buildEncounterScenes(topSign, dimensionInsights);
  const collaborationStyles = buildCollaborationStyles(topSign);
  const communicationTips = buildCommunicationTips(dimensionInsights);
  const resourceChannels = buildResourceChannels(topSign);
  const monthlyRhythm = buildMonthlyRhythm();
  const keyOpportunities = buildKeyOpportunities(dimensionInsights);
  const avoidSignals = buildAvoidSignals(dimensionInsights);

  return {
    topSign,
    topThree,
    scoredSigns,
    preferenceVector,
    dimensionWeights,
    answerSummary,
    summaryLines,
    localNarrative: buildLocalNarrative(topSign, dimensionInsights),
    tagChips,
    dimensionInsights,
    encounterScenes,
    collaborationStyles,
    communicationTips,
    resourceChannels,
    monthlyRhythm,
    keyOpportunities,
    avoidSignals,
  };
}
