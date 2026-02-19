/**
 * 灵魂年龄分析维度元数据。
 * 1. label 用于雷达图维度名展示。
 * 2. shortInsight 用于 hover 时的短解读。
 */
export const SOUL_AGE_DIMENSION_META = {
  rationality: {
    key: "rationality",
    label: "理性度",
    shortInsight: "遇事先看事实，擅长稳定决策节奏。",
  },
  emotionality: {
    key: "emotionality",
    label: "感性度",
    shortInsight: "感知细腻，能快速捕捉自己和他人的情绪。",
  },
  inclusiveness: {
    key: "inclusiveness",
    label: "包容度",
    shortInsight: "更愿意理解差异，关系中不轻易贴标签。",
  },
  exploration: {
    key: "exploration",
    label: "探索欲",
    shortInsight: "愿意尝试新路径，对未知保持开放。",
  },
  security: {
    key: "security",
    label: "安全感",
    shortInsight: "内在秩序稳定，外部变化时也不容易失衡。",
  },
  healing: {
    key: "healing",
    label: "自愈力",
    shortInsight: "情绪有出口，能把低谷转化为恢复力。",
  },
};

/**
 * 维度 key 列表。
 */
const SOUL_AGE_DIMENSION_KEYS = Object.keys(SOUL_AGE_DIMENSION_META);

/**
 * 灵魂年龄分层规则：
 * 关键逻辑：把分值区间映射为更有温度的标签，便于结果页快速理解。
 */
const SOUL_AGE_ARCHETYPE_RULES = [
  {
    min: 18,
    max: 23,
    title: "灵动感知的少年心",
    oneLine: "你的灵魂热烈、直觉快，对世界保持高敏感。",
  },
  {
    min: 24,
    max: 28,
    title: "温柔成长中的青年心",
    oneLine: "你在热情和秩序之间，开始形成自己的生活方法。",
  },
  {
    min: 29,
    max: 33,
    title: "成熟通透的温柔大人",
    oneLine: "你兼顾理性和温度，关系边界清晰且不失柔软。",
  },
  {
    min: 34,
    max: 39,
    title: "稳定自持的治愈引路人",
    oneLine: "你不急不躁，擅长在复杂局面里稳住自己和他人。",
  },
  {
    min: 40,
    max: 55,
    title: "内核笃定的通透长者",
    oneLine: "你经历感更强，懂取舍，能把情绪转化为洞察。",
  },
];

/**
 * 关键词标签映射：
 * 1. 每个维度对应一个核心关键词。
 * 2. 用于结果页「灵魂成长关键词」模块。
 */
const DIMENSION_KEYWORD_MAP = {
  rationality: {
    keyword: "清醒",
    desc: "做决定时优先抓住本质，不盲目跟风。",
  },
  emotionality: {
    keyword: "柔软",
    desc: "能共情，也知道如何在表达里保留温度。",
  },
  inclusiveness: {
    keyword: "通透",
    desc: "看透不戳破，愿意理解复杂人性。",
  },
  exploration: {
    keyword: "好奇",
    desc: "对新体验保持热情，愿意持续更新自己。",
  },
  security: {
    keyword: "定力",
    desc: "面对变化更稳，能建立长期的生活秩序。",
  },
  healing: {
    keyword: "自愈",
    desc: "允许低落，也能把自己慢慢带回轨道。",
  },
};

/**
 * 饼图颜色配置。
 */
const PIE_SEGMENT_META = {
  childlike: { key: "childlike", label: "童真保留", color: "#B8D4E3" },
  mature: { key: "mature", label: "成熟特质", color: "#E8D5C4" },
  insightful: { key: "insightful", label: "通透感悟", color: "#D4B996" },
};

/**
 * 安全数字转换。
 * @param {unknown} value 待转换值。
 * @param {number} fallback 转换失败时的兜底值。
 * @returns {number} 数值结果。
 */
function toSafeNumber(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

/**
 * 数值钳制。
 * @param {number} value 原值。
 * @param {number} min 最小值。
 * @param {number} max 最大值。
 * @returns {number} 限制后的值。
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * 创建零向量。
 * @returns {{ [dimension: string]: number }} 零向量对象。
 */
function createZeroDimensionVector() {
  return SOUL_AGE_DIMENSION_KEYS.reduce((accumulator, key) => {
    accumulator[key] = 0;
    return accumulator;
  }, {});
}

/**
 * 构建结构化答卷摘要。
 * 复杂度评估：O(Q * O)
 * Q 为题量，O 为单题选项数（当前固定 4）。
 * @param {Array<object>} questions 题目列表。
 * @param {Array<string | null>} answerIds 用户答案 ID 列表。
 * @returns {Array<object>} 摘要数组。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    return {
      questionId: questionItem.id,
      questionTitle: questionItem.title,
      weight: toSafeNumber(questionItem.weight, 1),
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      ageScore: toSafeNumber(selectedOption?.ageScore, 28),
      vector: selectedOption?.vector ?? {},
      distribution: selectedOption?.distribution ?? {},
    };
  });
}

/**
 * 聚合维度分值。
 * 复杂度评估：O(Q * D)
 * Q 为题量，D 为维度数（固定 6，常数级）。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {{ [dimension: string]: number }} 维度分值（0~100）。
 */
function buildDimensionScoreMap(answerSummary) {
  const weightedSum = createZeroDimensionVector();
  const weightSum = createZeroDimensionVector();

  answerSummary.forEach((summaryItem) => {
    if (!summaryItem.optionId) {
      return;
    }

    SOUL_AGE_DIMENSION_KEYS.forEach((dimensionKey) => {
      const optionScore = toSafeNumber(summaryItem.vector[dimensionKey], 50);
      // 关键逻辑：按题目权重累计，保证重点题影响力更高。
      weightedSum[dimensionKey] += optionScore * summaryItem.weight;
      weightSum[dimensionKey] += summaryItem.weight;
    });
  });

  return SOUL_AGE_DIMENSION_KEYS.reduce((accumulator, dimensionKey) => {
    const currentWeightSum = weightSum[dimensionKey];
    const averageScore =
      currentWeightSum > 0 ? weightedSum[dimensionKey] / currentWeightSum : 50;
    accumulator[dimensionKey] = Math.round(clamp(averageScore, 0, 100));
    return accumulator;
  }, {});
}

/**
 * 估算灵魂年龄。
 * 复杂度评估：O(Q + D)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {{ [dimension: string]: number }} dimensionScoreMap 维度分值。
 * @returns {number} 灵魂年龄（18~55）。
 */
function estimateSoulAge(answerSummary, dimensionScoreMap) {
  let weightedAgeSum = 0;
  let weightTotal = 0;

  answerSummary.forEach((summaryItem) => {
    if (!summaryItem.optionId) {
      return;
    }

    weightedAgeSum += summaryItem.ageScore * summaryItem.weight;
    weightTotal += summaryItem.weight;
  });

  const baseAge = weightTotal > 0 ? weightedAgeSum / weightTotal : 28;
  const rationality = toSafeNumber(dimensionScoreMap.rationality, 60);
  const emotionality = toSafeNumber(dimensionScoreMap.emotionality, 60);
  const exploration = toSafeNumber(dimensionScoreMap.exploration, 60);
  const security = toSafeNumber(dimensionScoreMap.security, 60);
  const healing = toSafeNumber(dimensionScoreMap.healing, 60);
  const inclusiveness = toSafeNumber(dimensionScoreMap.inclusiveness, 60);

  // 关键逻辑：通过维度组合做小幅校正，避免仅按题目均值导致结果太“平”。
  const adjustment =
    (rationality - 60) * 0.06 +
    (security - 60) * 0.05 +
    (healing - 60) * 0.04 +
    (inclusiveness - 60) * 0.03 -
    Math.max(0, exploration - 78) * 0.03 -
    Math.max(0, emotionality - 84) * 0.02;

  const estimatedAge = Math.round(baseAge + adjustment);
  return clamp(estimatedAge, 18, 55);
}

/**
 * 命中灵魂年龄标签规则。
 * @param {number} soulAge 灵魂年龄。
 * @returns {{ title: string, oneLine: string }} 标签结果。
 */
function resolveSoulAgeArchetype(soulAge) {
  const matchedRule = SOUL_AGE_ARCHETYPE_RULES.find(
    (ruleItem) => soulAge >= ruleItem.min && soulAge <= ruleItem.max,
  );

  return (
    matchedRule ??
    SOUL_AGE_ARCHETYPE_RULES[SOUL_AGE_ARCHETYPE_RULES.length - 1]
  );
}

/**
 * 生成雷达图展示数组。
 * @param {{ [dimension: string]: number }} dimensionScoreMap 维度分值。
 * @returns {Array<{ key: string, label: string, score: number, insight: string }>} 雷达数据。
 */
function buildRadarItems(dimensionScoreMap) {
  return SOUL_AGE_DIMENSION_KEYS.map((dimensionKey) => {
    const metaItem = SOUL_AGE_DIMENSION_META[dimensionKey];
    return {
      key: dimensionKey,
      label: metaItem.label,
      score: toSafeNumber(dimensionScoreMap[dimensionKey], 50),
      insight: metaItem.shortInsight,
    };
  });
}

/**
 * 规范化饼图占比，确保总和为 100。
 * @param {Array<{ key: string, raw: number }>} rawItems 原始值数组。
 * @returns {Array<{ key: string, percent: number }>} 百分比数组。
 */
function normalizeToPercent100(rawItems) {
  const safeItems = rawItems.map((item) => ({
    key: item.key,
    raw: Math.max(0, toSafeNumber(item.raw, 0)),
  }));
  const totalRaw = safeItems.reduce((sum, item) => sum + item.raw, 0);

  if (totalRaw <= 0) {
    return safeItems.map((item, index) => ({
      key: item.key,
      percent: index === 0 ? 100 : 0,
    }));
  }

  const withFloor = safeItems.map((item) => {
    const exactPercent = (item.raw / totalRaw) * 100;
    const floorPercent = Math.floor(exactPercent);
    return {
      key: item.key,
      exactPercent,
      floorPercent,
      fraction: exactPercent - floorPercent,
    };
  });

  const floorSum = withFloor.reduce((sum, item) => sum + item.floorPercent, 0);
  let remainder = 100 - floorSum;

  const sortedByFraction = [...withFloor].sort(
    (leftItem, rightItem) => rightItem.fraction - leftItem.fraction,
  );

  while (remainder > 0 && sortedByFraction.length > 0) {
    sortedByFraction[0].floorPercent += 1;
    sortedByFraction.push(sortedByFraction.shift());
    remainder -= 1;
  }

  return withFloor.map((item) => ({
    key: item.key,
    percent: item.floorPercent,
  }));
}

/**
 * 构建饼图分布数据。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<{ key: string, label: string, color: string, percent: number }>} 饼图数据。
 */
function buildPieDistribution(answerSummary) {
  const distributionSum = {
    childlike: 0,
    mature: 0,
    insightful: 0,
  };

  answerSummary.forEach((summaryItem) => {
    if (!summaryItem.optionId) {
      return;
    }

    distributionSum.childlike += toSafeNumber(summaryItem.distribution.childlike, 0);
    distributionSum.mature += toSafeNumber(summaryItem.distribution.mature, 0);
    distributionSum.insightful += toSafeNumber(summaryItem.distribution.insightful, 0);
  });

  const normalizedItems = normalizeToPercent100([
    { key: "childlike", raw: distributionSum.childlike },
    { key: "mature", raw: distributionSum.mature },
    { key: "insightful", raw: distributionSum.insightful },
  ]);

  return normalizedItems.map((item) => ({
    key: item.key,
    label: PIE_SEGMENT_META[item.key].label,
    color: PIE_SEGMENT_META[item.key].color,
    percent: item.percent,
  }));
}

/**
 * 生成关键词标签模块。
 * 复杂度评估：O(D log D)
 * D 为维度数（固定 6，常数级）。
 * @param {{ [dimension: string]: number }} dimensionScoreMap 维度分值。
 * @returns {Array<{ shape: string, keyword: string, description: string }>} 关键词标签。
 */
function buildKeywordCards(dimensionScoreMap) {
  const shapeByIndex = ["cloud", "leaf", "drop"];

  return SOUL_AGE_DIMENSION_KEYS.map((dimensionKey) => ({
    dimensionKey,
    score: toSafeNumber(dimensionScoreMap[dimensionKey], 50),
  }))
    .sort((leftItem, rightItem) => rightItem.score - leftItem.score)
    .slice(0, 3)
    .map((item, index) => {
      const keywordMeta = DIMENSION_KEYWORD_MAP[item.dimensionKey];
      return {
        shape: shapeByIndex[index] ?? "cloud",
        keyword: keywordMeta.keyword,
        description: keywordMeta.desc,
      };
    });
}

/**
 * 构建实际年龄契合度数据。
 * @param {number} soulAge 灵魂年龄。
 * @param {number | null} actualAge 实际年龄（可为空）。
 * @returns {{ actualAge: number, isUserProvided: boolean, diff: number, fitPercent: number, line: string }} 契合度模型。
 */
function buildCompatibilityModel(soulAge, actualAge) {
  const safeActualAge = clamp(Math.round(toSafeNumber(actualAge, 25)), 18, 60);
  const isUserProvided = Number.isFinite(Number(actualAge));
  const diff = soulAge - safeActualAge;
  const fitPercent = Math.round(clamp(100 - Math.abs(diff) * 6, 52, 98));

  if (diff >= 6) {
    return {
      actualAge: safeActualAge,
      isUserProvided,
      diff,
      fitPercent,
      line: `你的灵魂比实际年龄大 ${diff} 岁，常常比同龄人更早学会克制与担当，偶尔也要允许自己“幼稚”一下。`,
    };
  }

  if (diff <= -6) {
    return {
      actualAge: safeActualAge,
      isUserProvided,
      diff,
      fitPercent,
      line: `你的灵魂比实际年龄小 ${Math.abs(diff)} 岁，保有珍贵的好奇和活力，记得给长期计划多一点稳定结构。`,
    };
  }

  return {
    actualAge: safeActualAge,
    isUserProvided,
    diff,
    fitPercent,
    line: "你的灵魂年龄与实际年龄高度贴合，既能感受生活，也能稳住自己的节奏。",
  };
}

/**
 * 构建结果页 3 句核心描述。
 * @param {{ [dimension: string]: number }} dimensionScoreMap 维度分值。
 * @returns {Array<string>} 核心描述文案。
 */
function buildCoreDescriptionLines(dimensionScoreMap) {
  const rationality = toSafeNumber(dimensionScoreMap.rationality, 60);
  const emotionality = toSafeNumber(dimensionScoreMap.emotionality, 60);
  const exploration = toSafeNumber(dimensionScoreMap.exploration, 60);
  const security = toSafeNumber(dimensionScoreMap.security, 60);
  const healing = toSafeNumber(dimensionScoreMap.healing, 60);

  const lineOne =
    rationality >= emotionality
      ? "你习惯先厘清事实再表达情绪，处理问题更稳。"
      : "你先感受再判断，情绪感知力是你的核心优势。";
  const lineTwo =
    exploration >= security
      ? "你对新机会保持开放，愿意在变化里寻找新路径。"
      : "你更重视稳定与可持续，擅长在秩序里积累长期复利。";
  const lineThree =
    healing >= 75
      ? "你具备不错的自我修复能力，低谷后恢复速度较快。"
      : "你正在学习更温柔地照顾自己，给情绪留出口会更轻松。";

  return [lineOne, lineTwo, lineThree];
}

/**
 * 构建建议卡片。
 * @param {{ [dimension: string]: number }} dimensionScoreMap 维度分值。
 * @param {{ diff: number }} compatibilityModel 契合度模型。
 * @returns {Array<{ icon: string, text: string }>} 建议列表（2~3 条）。
 */
function buildAdviceCards(dimensionScoreMap, compatibilityModel) {
  const adviceCards = [];
  const security = toSafeNumber(dimensionScoreMap.security, 60);
  const exploration = toSafeNumber(dimensionScoreMap.exploration, 60);
  const healing = toSafeNumber(dimensionScoreMap.healing, 60);
  const rationality = toSafeNumber(dimensionScoreMap.rationality, 60);
  const emotionality = toSafeNumber(dimensionScoreMap.emotionality, 60);

  if (security < 62) {
    adviceCards.push({
      icon: "❤",
      text: "不用总逼自己“马上想通”，先建立睡眠与日程边界，你的安全感会更稳。",
    });
  }

  if (healing < 68) {
    adviceCards.push({
      icon: "☁",
      text: "把“情绪恢复”当成正式任务，每周预留固定留白时间，减少慢性内耗。",
    });
  }

  if (exploration < 58) {
    adviceCards.push({
      icon: "✦",
      text: "每两周尝试一次新体验，给生活注入微小新鲜感，能显著提升状态弹性。",
    });
  }

  if (rationality > 86 && emotionality < 60) {
    adviceCards.push({
      icon: "❀",
      text: "你已经足够清醒，下一步是练习更柔软地表达需求，让关系更有温度。",
    });
  }

  if (compatibilityModel.diff >= 6) {
    adviceCards.push({
      icon: "☘",
      text: "你习惯早熟扛事，建议偶尔向信任的人示弱，压力会更快释放。",
    });
  }

  if (compatibilityModel.diff <= -6) {
    adviceCards.push({
      icon: "☼",
      text: "你有珍贵活力，给自己增加一个长期目标锚点，会更容易把热情变成果。",
    });
  }

  // 关键逻辑：保证至少 2 条建议，避免结果页信息过少。
  if (adviceCards.length < 2) {
    adviceCards.push({
      icon: "❤",
      text: "保持你现在的节奏已经很好，继续把注意力放在真正重要的人和事上。",
    });
  }

  return adviceCards.slice(0, 3);
}

/**
 * 生成“灵魂同频的人”文案。
 * @param {number} soulAge 灵魂年龄。
 * @returns {string} 同频描述。
 */
function buildResonanceLine(soulAge) {
  if (soulAge <= 24) {
    return "你和灵魂年龄 20-24 岁的热烈行动派、30+ 的稳定引路人最同频。";
  }

  if (soulAge <= 30) {
    return "你和灵魂年龄 25-30 岁的清醒成长派、35+ 的温和长者最同频。";
  }

  if (soulAge <= 36) {
    return "你和灵魂年龄 28-35 岁的成熟实干派、40+ 的通透型伙伴最同频。";
  }

  return "你和灵魂年龄 30+ 的稳定同行者、40+ 的通透长者最同频。";
}

/**
 * 本地分析灵魂年龄结果。
 * @param {object} payload 输入参数。
 * @param {Array<object>} payload.questions 本轮题目列表。
 * @param {Array<string | null>} payload.answerIds 用户答案 ID 列表。
 * @param {number | null} [payload.actualAge=null] 用户输入实际年龄（可选）。
 * @returns {{
 *   soulAge: number,
 *   ageTitle: string,
 *   ageOneLine: string,
 *   ageTagText: string,
 *   summaryLine: string,
 *   radarItems: Array<object>,
 *   coreDescriptionLines: Array<string>,
 *   keywordCards: Array<object>,
 *   pieDistribution: Array<object>,
 *   compatibility: object,
 *   adviceCards: Array<object>,
 *   resonanceLine: string,
 *   answerSummary: Array<object>,
 *   summaryLines: Array<string>
 * }} 分析结果。
 */
export function analyzeSoulAgeLocally(payload) {
  const questions = Array.isArray(payload?.questions) ? payload.questions : [];
  const answerIds = Array.isArray(payload?.answerIds) ? payload.answerIds : [];
  const actualAge = payload?.actualAge ?? null;

  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );

  const dimensionScoreMap = buildDimensionScoreMap(answerSummary);
  const soulAge = estimateSoulAge(answerSummary, dimensionScoreMap);
  const ageArchetype = resolveSoulAgeArchetype(soulAge);
  const radarItems = buildRadarItems(dimensionScoreMap);
  const pieDistribution = buildPieDistribution(answerSummary);
  const keywordCards = buildKeywordCards(dimensionScoreMap);
  const compatibility = buildCompatibilityModel(soulAge, actualAge);
  const coreDescriptionLines = buildCoreDescriptionLines(dimensionScoreMap);
  const adviceCards = buildAdviceCards(dimensionScoreMap, compatibility);
  const resonanceLine = buildResonanceLine(soulAge);

  const summaryLine =
    soulAge >= 34
      ? "你的灵魂既有成年人的理性，也保留了稳定而温柔的底色。"
      : "你的灵魂在成长与热情之间保持平衡，既鲜活也逐渐通透。";

  return {
    soulAge,
    ageTitle: ageArchetype.title,
    ageOneLine: ageArchetype.oneLine,
    ageTagText: `灵魂年龄 ${soulAge} 岁 -> ${ageArchetype.title}`,
    summaryLine,
    radarItems,
    coreDescriptionLines,
    keywordCards,
    pieDistribution,
    compatibility,
    adviceCards,
    resonanceLine,
    answerSummary,
    summaryLines,
  };
}
