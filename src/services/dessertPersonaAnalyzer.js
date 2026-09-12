/**
 * 甜品系人格选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const DESSERT_PERSONA_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "清爽轻甜向",
    fullLabel: "A 清爽轻甜向",
    score: 1,
    color: "#f7a7bf",
  },
  B: {
    tier: "B",
    label: "绵软治愈向",
    fullLabel: "B 绵软治愈向",
    score: 2,
    color: "#f7c4d8",
  },
  C: {
    tier: "C",
    label: "醇厚踏实向",
    fullLabel: "C 醇厚踏实向",
    score: 3,
    color: "#f2d58a",
  },
  D: {
    tier: "D",
    label: "微苦清醒向",
    fullLabel: "D 微苦清醒向",
    score: 4,
    color: "#8a5b4c",
  },
});

/**
 * 甜品系人格结果区间规则：
 * 关键逻辑：主结果始终按 12 题总分判定，确保 6 种甜品人格与需求文案完全对齐。
 */
const DESSERT_PERSONA_RESULT_RULES = Object.freeze([
  {
    key: "macaron",
    min: 12,
    max: 18,
    levelName: "马卡龙人格",
    statusLabel: "精致氛围感很强",
    coreTag: "精致氛围感，偏爱被认真对待",
    summary:
      "精致氛围感强，审美在线，社交轻松自如，但真正走心的人其实不多。",
    personaLabels: ["精致氛围感", "颜控本控", "社交天花板", "有点小傲娇"],
    coreTemperament:
      "生活要有仪式感，做人要有美感，平庸和敷衍会让你当场逃走。",
    deepTraits: [
      "审美在线，对自己和环境都有要求。",
      "社交轻松自如，会说话、会来事、人缘超好。",
      "有点小骄傲，不喜欢太接地气、太粗糙的关系。",
      "看似热闹，其实只对极少数人真正走心。",
    ],
    relationshipTraits: [
      "浪漫制造机，喜欢惊喜、偏爱、仪式感。",
      "你要的不是爱，是“被认真对待”。",
    ],
    contrastTraits: [
      "外表华丽精致，内心敏感又缺安全感。",
      "越装作无所谓，越怕被冷落。",
    ],
    bestMatchNames: ["草莓蛋糕", "芝士蛋糕"],
    avoidMatchNotes: ["焦糖布丁：觉得对方太佛系、太闷、太不讲究。"],
    signatureLine:
      "愿你永远精致自由，被偏爱，被重视，被好好收藏。",
    themeVariantClass: "theme-dessert-persona-soft",
    targetAverageScore: 1.25,
  },
  {
    key: "strawberry-cake",
    min: 19,
    max: 24,
    levelName: "草莓蛋糕人格",
    statusLabel: "温柔亲近感在线",
    coreTag: "人间小甜饼，软而有骨",
    summary:
      "第一眼就好亲近，温柔会照顾人，但真正的边界其实一直都在心里。",
    personaLabels: [
      "人间小甜饼",
      "心软第一名",
      "情绪稳定器",
      "社交软萌担当",
    ],
    coreTemperament:
      "第一眼就好亲近，自带柔光滤镜，跟你待在一起心情会自动变好。",
    deepTraits: [
      "天生擅长照顾别人情绪，不爱吵架，能忍则忍。",
      "对谁都温和，但心里分得清谁真谁假。",
      "看似没脾气，其实底线很清晰，只是不爱撕破脸。",
      "容易被细节打动，一点温柔就能记很久。",
    ],
    relationshipTraits: [
      "付出型人格，会主动分享、主动关心、主动低头。",
      "不是没脾气，是舍不得对在乎的人凶。",
    ],
    contrastTraits: [
      "外表甜妹，内心清醒。",
      "看似好拿捏，其实谁也别想随便欺负你。",
    ],
    bestMatchNames: ["焦糖布丁", "香草冰淇淋"],
    avoidMatchNotes: ["黑巧克力：觉得你太黏、情绪太丰富。"],
    signatureLine:
      "愿你甜而不腻，软而有骨，永远有人把你捧在手心里。",
    themeVariantClass: "theme-dessert-persona-soft",
    targetAverageScore: 1.8,
  },
  {
    key: "pudding",
    min: 25,
    max: 30,
    levelName: "焦糖布丁人格",
    statusLabel: "佛系稳定感突出",
    coreTag: "慢热长情，安静又靠谱",
    summary:
      "不争不抢、不急不躁，表面佛系温吞，内心其实一直都很清醒。",
    personaLabels: ["温柔佛系派", "内心通透怪", "慢热专一型", "peacemaker"],
    coreTemperament:
      "不争不抢，不急不躁，自带一种“岁月静好”的稳定感。",
    deepTraits: [
      "不爱卷入是非，讨厌 drama，能躲就躲。",
      "表面软乎乎，其实心里门儿清，只是懒得说。",
      "习惯包容，不喜欢给别人压力。",
      "喜欢简单、安稳、不用猜来猜去的关系。",
    ],
    relationshipTraits: [
      "慢热但长情，一旦认定就很忠诚。",
      "话不多，但永远靠谱、永远在。",
    ],
    contrastTraits: [
      "佛系只是保护色。",
      "你不是没脾气，是懒得对不重要的人浪费情绪。",
    ],
    bestMatchNames: ["草莓蛋糕", "黑巧克力"],
    avoidMatchNotes: ["马卡龙：觉得对方太花哨、太折腾、太累。"],
    signatureLine: "愿你安稳自在，简单快乐，所有温柔都有回响。",
    themeVariantClass: "theme-dessert-persona-creamy",
    targetAverageScore: 2.3,
  },
  {
    key: "cheesecake",
    min: 31,
    max: 36,
    levelName: "芝士蛋糕人格",
    statusLabel: "靠谱安全感很足",
    coreTag: "外冷内热，越品越香",
    summary:
      "不张扬、不吵闹，但总能让人觉得“有你在就放心”。",
    personaLabels: ["外冷内热型", "靠谱扛事怪", "低调实力派", "越品越香"],
    coreTemperament:
      "不张扬、不吵闹，但一出现就让人觉得“有你在就放心”。",
    deepTraits: [
      "话少行动多，遇事冷静不慌。",
      "外表冷淡疏离，内心温柔且重感情。",
      "有原则有主见，不随大流，不讨好谁。",
      "对陌生人克制，对自己人极度双标温柔。",
    ],
    relationshipTraits: [
      "不会说甜言蜜语，但会默默解决所有问题。",
      "安全感不是说出来的，是你做出来的。",
    ],
    contrastTraits: [
      "高冷只是面具。",
      "熟人面前黏人、撒娇、占有欲一点不少。",
    ],
    bestMatchNames: ["马卡龙", "黑巧克力"],
    avoidMatchNotes: ["香草冰淇淋：觉得太善变、太不稳定、太情绪化。"],
    signatureLine:
      "愿你坚守本心，被懂你的人深爱，不必再假装坚强。",
    themeVariantClass: "theme-dessert-persona-creamy",
    targetAverageScore: 2.8,
  },
  {
    key: "dark-chocolate",
    min: 37,
    max: 42,
    levelName: "黑巧克力人格",
    statusLabel: "高级疏离感明显",
    coreTag: "理智克制，自带生人勿近气场",
    summary:
      "不迎合、不将就、不恋爱脑，自带一种生人勿近的高级感。",
    personaLabels: ["清醒独立体", "理智克制派", "高级疏离感", "人间清醒本醒"],
    coreTemperament:
      "不迎合、不将就、不恋爱脑，自带一种“生人勿近”的高级感。",
    deepTraits: [
      "极度理智，情绪稳定，很少被感情牵着走。",
      "讨厌虚伪客套，只喜欢真实直接的关系。",
      "享受独处，不爱无效社交，不怕孤单。",
      "看人很准，一旦失望就会默默退场。",
    ],
    relationshipTraits: [
      "慢热、挑剔、难动心。",
      "动心就是深情且专一，不爱就绝不拖泥带水。",
    ],
    contrastTraits: [
      "外表冷漠疏离，内心深情又柔软。",
      "只是你只把温柔，留给极少数值得的人。",
    ],
    bestMatchNames: ["芝士蛋糕", "焦糖布丁"],
    avoidMatchNotes: ["草莓蛋糕、马卡龙：觉得太甜、太吵、太表面。"],
    signatureLine:
      "愿你保持清醒，自由独立，所爱之人皆真心待你。",
    themeVariantClass: "theme-dessert-persona-cocoa",
    targetAverageScore: 3.3,
  },
  {
    key: "ice-cream",
    min: 43,
    max: 48,
    levelName: "香草冰淇淋人格",
    statusLabel: "自由鲜活感拉满",
    coreTag: "轻松自在，快乐永动",
    summary:
      "像夏天的风一样轻松自在，没包袱、没拘束，和你在一起很难无聊。",
    personaLabels: ["自由随性派", "鲜活小机灵", "情绪直白怪", "快乐永动机"],
    coreTemperament:
      "像夏天的风，轻松、自在、没包袱，跟你在一起永远不无聊。",
    deepTraits: [
      "讨厌束缚，热爱自由，想到什么就去做。",
      "情绪写在脸上，开心就笑，不爽就摆脸。",
      "好奇心重，喜欢新鲜，永远对世界有热情。",
      "看似没心没肺，其实很在意别人的态度。",
    ],
    relationshipTraits: [
      "热烈直接，敢爱敢恨，不藏着掖着。",
      "在一起永远有话题、有惊喜、有新鲜感。",
    ],
    contrastTraits: [
      "外表快乐洒脱，内心怕被忽略、怕被丢下。",
      "越热闹，越容易在深夜突然安静。",
    ],
    bestMatchNames: ["草莓蛋糕", "焦糖布丁"],
    avoidMatchNotes: ["黑巧克力：觉得太闷、太严肃、太不懂浪漫。"],
    signatureLine:
      "愿你永远自由热烈，活得尽兴，甜满四季，永不融化。",
    themeVariantClass: "theme-dessert-persona-cool",
    targetAverageScore: 3.8,
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做作答偏好侧写，不覆盖总分主结果。
 */
const DESSERT_PERSONA_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "清爽轻甜向",
    description: "你更习惯把开心和轻盈感放在前面，表达直接，气氛感很足。",
  },
  B: {
    tier: "B",
    name: "绵软治愈向",
    description: "你更偏向柔和、体贴和治愈感，习惯用温柔去靠近别人。",
  },
  C: {
    tier: "C",
    name: "醇厚踏实向",
    description: "你更容易给人稳定、贴心和靠谱感，慢热但很有安全感。",
  },
  D: {
    tier: "D",
    name: "微苦清醒向",
    description: "你更习惯克制表达、保留分寸，也更重视边界和内在秩序。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const DESSERT_PERSONA_DIMENSION_META = Object.freeze({
  "emotional-comfort": {
    key: "emotional-comfort",
    label: "情绪治愈力",
    color: "#f291b2",
  },
  "social-sweetness": {
    key: "social-sweetness",
    label: "人际甜感度",
    color: "#f5a0c0",
  },
  "lifestyle-flavor": {
    key: "lifestyle-flavor",
    label: "生活风味值",
    color: "#f1c96e",
  },
  "inner-aftertaste": {
    key: "inner-aftertaste",
    label: "内在回甘感",
    color: "#8a5b4c",
  },
});

/**
 * 安全数字转换。
 * @param {unknown} value 待转换值。
 * @param {number} fallback 兜底值。
 * @returns {number} 数值结果。
 */
function toSafeNumber(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

/**
 * 夹取百分比。
 * @param {number} value 原始数值。
 * @returns {number} 0~100 的整数。
 */
function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(toSafeNumber(value, 0))));
}

/**
 * 命中总分区间规则。
 * @param {number} totalScore 总分。
 * @returns {object} 结果规则。
 */
function resolveDessertPersonaResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 12));
  const matchedRule = DESSERT_PERSONA_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return (
    matchedRule ??
    DESSERT_PERSONA_RESULT_RULES[DESSERT_PERSONA_RESULT_RULES.length - 1]
  );
}

/**
 * 构建结构化答卷摘要。
 * 复杂度评估：O(Q * O)
 * Q 为题量，O 为单题选项数（本题库固定为 4）。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 已选答案 ID 列表。
 * @returns {Array<object>} 结构化摘要。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((questionItem, questionIndex) => {
    const selectedOption = Array.isArray(questionItem?.options)
      ? questionItem.options.find(
          (optionItem) => optionItem.id === answerIds[questionIndex],
        )
      : null;

    return {
      questionId: String(questionItem?.id ?? "").trim(),
      questionTitle: String(questionItem?.title ?? "").trim(),
      dimension: String(questionItem?.dimension ?? "").trim(),
      dimensionLabel:
        String(questionItem?.dimensionLabel ?? "").trim() || "甜感观察中",
      optionId: selectedOption?.id ?? null,
      optionLabel: String(selectedOption?.label ?? "未作答").trim() || "未作答",
      tier: String(selectedOption?.tier ?? "").trim().toUpperCase(),
      dessertTraitName:
        String(selectedOption?.dessertTraitName ?? "").trim() || "甜感观察中",
      score: toSafeNumber(selectedOption?.score, 0),
    };
  });
}

/**
 * 构建答卷摘要文本。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<string>} 展示文本。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 统计各选项出现次数。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {{ A: number, B: number, C: number, D: number }} 次数映射。
 */
function buildOptionCountMap(answerSummary) {
  return answerSummary.reduce(
    (countMap, summaryItem) => {
      const optionTier = String(summaryItem?.tier ?? "").trim().toUpperCase();
      if (typeof countMap[optionTier] !== "number") {
        return countMap;
      }

      countMap[optionTier] += 1;
      return countMap;
    },
    {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    },
  );
}

/**
 * 构建作答分布图数据。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<{ key: string, name: string, score: number, color: string, count: number }>} 分布图数据。
 */
function buildOptionDistribution(answerSummary) {
  const countMap = buildOptionCountMap(answerSummary);
  const answeredCount = Object.values(countMap).reduce(
    (sum, currentValue) => sum + currentValue,
    0,
  );

  return Object.values(DESSERT_PERSONA_OPTION_META).map((optionMeta) => {
    const optionCount = countMap[optionMeta.tier] ?? 0;
    const ratio = answeredCount > 0 ? (optionCount / answeredCount) * 100 : 0;

    return {
      key: optionMeta.tier,
      name: optionMeta.fullLabel,
      score: clampPercent(ratio),
      color: optionMeta.color,
      count: optionCount,
    };
  });
}

/**
 * 在多数选项打平时解析更贴近整体分数的画像。
 * 复杂度评估：O(1)
 * 打平候选固定不超过 4 个，属于常量级计算。
 * @param {Array<string>} tiedTiers 打平的选项层级。
 * @param {number} averageScore 平均分（1~4）。
 * @returns {string} 解析后的选项层级。
 */
function resolveTiedMajorityTier(tiedTiers, averageScore) {
  return [...tiedTiers].sort((leftTier, rightTier) => {
    const leftScore = Number(DESSERT_PERSONA_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(DESSERT_PERSONA_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时优先取高分，避免低估“回甘系”特征。
    return rightScore - leftScore;
  })[0] ?? "A";
}

/**
 * 解析多数选项画像。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} totalScore 总分。
 * @returns {{ tier: string, name: string, description: string, label: string, count: number }} 多数画像。
 */
function resolveMajorityProfile(answerSummary, totalScore) {
  const countMap = buildOptionCountMap(answerSummary);
  const maxCount = Math.max(...Object.values(countMap));
  const tiedTiers = Object.entries(countMap)
    .filter(([, countValue]) => countValue === maxCount)
    .map(([tier]) => tier);
  const answeredCount = Math.max(
    1,
    answerSummary.filter((summaryItem) => Boolean(summaryItem.optionId)).length,
  );
  const averageScore = toSafeNumber(totalScore, 0) / answeredCount;
  const resolvedTier =
    tiedTiers.length > 1
      ? resolveTiedMajorityTier(tiedTiers, averageScore)
      : tiedTiers[0] ?? "A";
  const matchedProfile =
    DESSERT_PERSONA_MAJORITY_RULES[resolvedTier] ??
    DESSERT_PERSONA_MAJORITY_RULES.A;
  const optionMeta =
    DESSERT_PERSONA_OPTION_META[resolvedTier] ?? DESSERT_PERSONA_OPTION_META.A;

  return {
    tier: resolvedTier,
    name: matchedProfile.name,
    description: matchedProfile.description,
    label: optionMeta.fullLabel,
    count: countMap[resolvedTier] ?? 0,
  };
}

/**
 * 构建雷达图维度数据。
 * 复杂度评估：O(Q + D)
 * Q 为题量，D 为维度数量（当前固定为 4）。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<{ key: string, name: string, label: string, score: number, color: string }>} 雷达图数据。
 */
function buildDimensionRadarItems(answerSummary) {
  const dimensionScoreMap = {};
  const dimensionAnsweredCountMap = {};

  answerSummary.forEach((summaryItem) => {
    if (!summaryItem.optionId) {
      return;
    }

    const dimensionKey = String(summaryItem.dimension ?? "").trim();
    if (!dimensionKey || !DESSERT_PERSONA_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(DESSERT_PERSONA_DIMENSION_META).map((dimensionMeta) => {
    const answeredCount = dimensionAnsweredCountMap[dimensionMeta.key] ?? 0;
    const totalDimensionScore = dimensionScoreMap[dimensionMeta.key] ?? 0;
    const minScore = answeredCount;
    const dynamicRange = answeredCount * 3;
    const dimensionRatio =
      answeredCount > 0 && dynamicRange > 0
        ? ((totalDimensionScore - minScore) / dynamicRange) * 100
        : 0;

    return {
      key: dimensionMeta.key,
      name: dimensionMeta.label,
      label: dimensionMeta.label,
      score: clampPercent(dimensionRatio),
      color: dimensionMeta.color,
    };
  });
}

/**
 * 计算单题与当前主类型的贴合度。
 * @param {number} rawScore 原始分值。
 * @param {number} targetAverageScore 当前结果对应的目标均值。
 * @returns {{ metric: number, traitLabel: string }} 贴合度与标签。
 */
function resolveScenarioMetric(rawScore, targetAverageScore) {
  const safeScore = toSafeNumber(rawScore, 1);
  const safeTargetAverage = toSafeNumber(targetAverageScore, 2.5);
  const distance = Math.abs(safeScore - safeTargetAverage);
  const traitLabel =
    safeScore <= 1.5
      ? "轻甜线索"
      : safeScore <= 2.5
        ? "治愈线索"
        : safeScore <= 3.5
          ? "醇厚线索"
          : "回甘线索";

  return {
    // 关键逻辑：按“与当前甜品人格均值的距离”打分，越接近主类型，越能代表当前人格气质。
    metric: clampPercent((1 - distance / 3) * 100),
    traitLabel,
  };
}

/**
 * 构建最能体现当前甜品人格的场景列表。
 * 复杂度评估：O(Q log Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} targetAverageScore 当前结果对应的目标均值。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string, dimensionLabel: string, traitLabel: string }>} Top 列表。
 */
function buildTopCoreScenarios(answerSummary, targetAverageScore, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => {
      const rawScore = toSafeNumber(summaryItem.score, 0);
      const resolvedMetric = resolveScenarioMetric(rawScore, targetAverageScore);

      return {
        name: summaryItem.questionTitle,
        score: resolvedMetric.metric,
        optionLabel: summaryItem.optionLabel,
        dimensionLabel: summaryItem.dimensionLabel,
        traitLabel: resolvedMetric.traitLabel,
        rawScore,
      };
    })
    .sort((leftItem, rightItem) => {
      const scoreDiff = rightItem.score - leftItem.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const distanceDiff =
        Math.abs(leftItem.rawScore - targetAverageScore) -
        Math.abs(rightItem.rawScore - targetAverageScore);
      if (distanceDiff !== 0) {
        return distanceDiff;
      }

      return String(leftItem.name).localeCompare(
        String(rightItem.name),
        "zh-Hans-CN",
      );
    })
    .slice(0, safeTopN)
    .map(({ rawScore, ...restItem }) => restItem);
}

/**
 * 构建场景叙事短句。
 * @param {object | undefined} scenarioItem 场景对象。
 * @returns {string} 场景叙事。
 */
function buildScenarioNarrativeText(scenarioItem) {
  const scenarioName = String(scenarioItem?.name ?? "").trim();
  if (!scenarioName) {
    return "当前样本量不足，建议完整作答后再看你的甜品人格线索。";
  }

  return `最能体现你当前甜品人格反应的场景是「${scenarioName}」。`;
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.majorityProfile 多数选项画像。
 * @param {Array<object>} params.topCoreScenarios 核心场景列表。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
  topCoreScenarios,
}) {
  const topScenarioText = buildScenarioNarrativeText(topCoreScenarios[0]);

  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 48))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 清爽轻甜向"}，说明你的日常反应已经形成稳定甜感偏好。`,
    topScenarioText,
  ].join(" ");
}

/**
 * 计算甜品系人格本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 核心场景排序为 O(Q log Q)。
 * @param {object} params 分析参数。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 已选答案。
 * @returns {{
 *  score: number,
 *  maxScore: number,
 *  answeredCount: number,
 *  resultRule: object,
 *  majorityProfile: object,
 *  optionDistribution: Array<object>,
 *  radarItems: Array<object>,
 *  topCoreScenarios: Array<object>,
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string,
 *  actionTips: Array<string>
 * }} 本地结果。
 */
export function analyzeDessertPersonaLocally({ questions, answerIds }) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const normalizedAnswerIds = Array.isArray(answerIds) ? answerIds : [];
  const answerSummary = buildAnswerSummary(
    normalizedQuestions,
    normalizedAnswerIds,
  );
  const answeredCount = answerSummary.filter(
    (summaryItem) => Boolean(summaryItem.optionId),
  ).length;
  const totalScore = answerSummary.reduce(
    (sum, summaryItem) => sum + toSafeNumber(summaryItem.score, 0),
    0,
  );
  const maxScore = normalizedQuestions.length * 4;
  const resultRule = resolveDessertPersonaResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildDimensionRadarItems(answerSummary);
  const topCoreScenarios = buildTopCoreScenarios(
    answerSummary,
    Number(resultRule?.targetAverageScore ?? 2.5),
    3,
  );
  const summaryLines = buildSummaryLines(answerSummary);
  const localNarrative = buildLocalNarrative({
    totalScore,
    maxScore,
    resultRule,
    majorityProfile,
    topCoreScenarios,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    majorityProfile,
    optionDistribution,
    radarItems,
    topCoreScenarios,
    summaryLines,
    answerSummary,
    localNarrative,
    actionTips: Array.isArray(resultRule.actionTips) ? resultRule.actionTips : [],
  };
}
