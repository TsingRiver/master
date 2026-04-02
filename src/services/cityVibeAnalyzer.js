/**
 * 城市气质选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图与雷达图保持统一视觉语义。
 */
const CITY_VIBE_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "安静治愈向",
    fullLabel: "A 安静治愈向",
    score: 1,
    color: "#c8a98c",
  },
  B: {
    tier: "B",
    label: "文艺浪漫向",
    fullLabel: "B 文艺浪漫向",
    score: 2,
    color: "#9db8d9",
  },
  C: {
    tier: "C",
    label: "热闹多元向",
    fullLabel: "C 热闹多元向",
    score: 3,
    color: "#ef8e5a",
  },
  D: {
    tier: "D",
    label: "繁华前卫向",
    fullLabel: "D 繁华前卫向",
    score: 4,
    color: "#73839b",
  },
});

/**
 * 城市气质结果区间规则：
 * 关键逻辑：主结果始终以 20 题总分区间为准，确保 8 种城市气质与需求文案完全对齐。
 */
const CITY_VIBE_RESULT_RULES = Object.freeze([
  {
    key: "suzhou-vibe",
    min: 20,
    max: 27,
    levelName: "苏州气质",
    statusLabel: "江南治愈感很强",
    coreTag: "温婉软糯、烟火气浓",
    summary:
      "温婉软糯、烟火气浓，慢节奏治愈，藏着江南的温柔与诗意。",
    tagChips: ["江南温柔", "慢节奏治愈", "烟火气浓"],
    actionTips: [
      "你更适合能慢慢走、慢慢看、慢慢生活的城市空间，社区烟火感会比地标密度更重要。",
      "如果在选旅行地或定居地，优先看街区尺度、生活便利度和日常松弛感，而不是单纯追求繁华。",
      "当环境长期过于高压和嘈杂时，你的恢复速度会变慢，记得给自己留出安静角落。",
    ],
    easterEggText: "你像一条有风的小巷，安静却很有故事。",
    themeVariantClass: "theme-city-vibe-soft",
  },
  {
    key: "xiamen-vibe",
    min: 28,
    max: 35,
    levelName: "厦门气质",
    statusLabel: "清新松弛感在线",
    coreTag: "清新文艺、海风温柔",
    summary:
      "清新文艺、海风温柔，小资又松弛，是浪漫又治愈的海滨小城。",
    tagChips: ["清新文艺", "海风松弛", "浪漫治愈"],
    actionTips: [
      "你对城市的要求不是一味安静，而是要有风、有光、有一点轻盈的浪漫感。",
      "适合你的环境通常要兼顾日常便利与审美氛围，太粗粝或太高压都会削弱你的幸福感。",
      "当生活节奏被压得太满时，适时去靠海、去散步、去看展，会让你很快回电。",
    ],
    easterEggText: "你身上有种像海风一样不着急的浪漫。",
    themeVariantClass: "theme-city-vibe-soft",
  },
  {
    key: "chengdu-vibe",
    min: 36,
    max: 43,
    levelName: "成都气质",
    statusLabel: "松弛快乐感明显",
    coreTag: "悠闲自在、巴适得很",
    summary:
      "悠闲自在、巴适得很，美食遍地，松弛感拉满，快乐又安逸。",
    tagChips: ["巴适松弛", "快乐安逸", "美食浓度高"],
    actionTips: [
      "你很适合有烟火、有美食、有人情味的城市，不需要每一分钟都追求效率最大化。",
      "比起标准化秩序，你更需要真实生活感和可停留的日常空间，这会直接影响你的状态稳定度。",
      "当工作强度上来时，别忘了给自己安排有食物、有朋友、有散步的恢复方式。",
    ],
    easterEggText: "你像热气腾腾的一顿晚饭，松弛又有满足感。",
    themeVariantClass: "theme-city-vibe-balanced",
  },
  {
    key: "hangzhou-vibe",
    min: 44,
    max: 51,
    levelName: "杭州气质",
    statusLabel: "雅致灵动感很足",
    coreTag: "雅致灵动、山水相依",
    summary:
      "雅致灵动、山水相依，既有江南韵味，又有现代小资情调。",
    tagChips: ["雅致灵动", "山水都市", "现代小资"],
    actionTips: [
      "你要的不是极端安静或极端喧闹，而是审美、效率与生活感之间的平衡。",
      "适合你的城市通常既要有自然缓冲，也要有现代便利，这种双重满足会让你更稳定。",
      "当选择居住或工作环境时，先看通勤和周边质感，再看是否足够有“可逛、可停、可呼吸”的空间。",
    ],
    easterEggText: "你像一座有雾气的桥，轻盈、克制，也很灵动。",
    themeVariantClass: "theme-city-vibe-balanced",
  },
  {
    key: "shanghai-vibe",
    min: 52,
    max: 59,
    levelName: "上海气质",
    statusLabel: "摩登精致感突出",
    coreTag: "精致摩登、多元包容",
    summary:
      "精致摩登、多元包容，时尚又前卫，是繁华又有格调的魔都。",
    tagChips: ["精致摩登", "多元包容", "时髦有格调"],
    actionTips: [
      "你会被高密度信息、丰富选择和高级审美吸引，但同时也需要保留一点自己的节奏。",
      "适合你的环境通常要有鲜明都市感，同时不能太粗糙，否则会让你快速失去耐心。",
      "如果长期处在选择太少的地方，你会明显觉得无聊；适度的新鲜感对你很重要。",
    ],
    easterEggText: "你像一条会发光的街，讲究、热闹，也有自己的分寸。",
    themeVariantClass: "theme-city-vibe-modern",
  },
  {
    key: "shenzhen-vibe",
    min: 60,
    max: 67,
    levelName: "深圳气质",
    statusLabel: "年轻效率感拉满",
    coreTag: "年轻活力、创新高效",
    summary:
      "年轻活力、创新高效，节奏快、机会多，是敢闯敢拼的梦想之城。",
    tagChips: ["年轻活力", "创新高效", "机会密度高"],
    actionTips: [
      "你适合变化快、反馈快、机会也够多的环境，太慢的节奏容易让你失去兴奋感。",
      "在城市选择上，你会更在意增长空间和行动效率，而不是单一的安逸感。",
      "高强度环境会给你动力，但也别忽略恢复机制，持续输出需要稳定的生活底盘。",
    ],
    easterEggText: "你像一条正在加速的跑道，带着明确的方向感。",
    themeVariantClass: "theme-city-vibe-modern",
  },
  {
    key: "chongqing-vibe",
    min: 68,
    max: 75,
    levelName: "重庆气质",
    statusLabel: "热烈能量感爆棚",
    coreTag: "热烈奔放、江湖气足",
    summary:
      "热烈奔放、江湖气足，麻辣鲜活，个性鲜明，充满烟火与激情。",
    tagChips: ["热烈奔放", "烟火激情", "个性鲜明"],
    actionTips: [
      "你适合有强存在感、有鲜明个性、情绪浓度也够高的城市，不喜欢被无聊和寡淡包围。",
      "对你来说，城市不只是住的地方，也要能提供情绪张力和持续的新鲜刺激。",
      "高能量是你的优势，但长期满格输出也会累，记得给自己保留能退回去休息的据点。",
    ],
    easterEggText: "你像一座立体夜城，热烈、直接，还特别有记忆点。",
    themeVariantClass: "theme-city-vibe-bold",
  },
  {
    key: "beijing-vibe",
    min: 76,
    max: 80,
    levelName: "北京气质",
    statusLabel: "大气场全开",
    coreTag: "大气磅礴、底蕴深厚",
    summary:
      "大气磅礴、底蕴深厚，既有历史厚重感，又有国际范，气场全开。",
    tagChips: ["大气磅礴", "厚重底蕴", "国际气场"],
    actionTips: [
      "你偏好的是能承载野心、视野和身份感的城市，普通的舒适并不足以满足你。",
      "适合你的环境通常既要有历史纵深，也要有资源密度和更大的发展天花板。",
      "强气场会推动你向前，但也要留意别让“必须更强”变成长期紧绷的压力来源。",
    ],
    easterEggText: "你身上有种一出场就很难被忽略的城市气场。",
    themeVariantClass: "theme-city-vibe-bold",
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做偏好侧写，不覆盖总分主结果。
 */
const CITY_VIBE_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "治愈栖居向",
    description: "你更自然地偏向安稳、治愈、有烟火气且适合慢慢生活的城市状态。",
  },
  B: {
    tier: "B",
    name: "文艺漫游向",
    description: "你更容易被清新、松弛、有审美感与浪漫气息的城市氛围吸引。",
  },
  C: {
    tier: "C",
    name: "热闹体验向",
    description: "你偏好多元、热闹、选择丰富且有持续新鲜感的城市体验。",
  },
  D: {
    tier: "D",
    name: "摩登先锋向",
    description: "你更在意效率、前沿感、资源密度与更强的都市存在感。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const CITY_VIBE_DIMENSION_META = Object.freeze({
  "living-rhythm": {
    key: "living-rhythm",
    label: "生活节奏",
    color: "#73839b",
  },
  "spatial-aesthetic": {
    key: "spatial-aesthetic",
    label: "空间审美",
    color: "#c28c73",
  },
  "consumption-lifestyle": {
    key: "consumption-lifestyle",
    label: "生活方式",
    color: "#af7b91",
  },
  "social-energy": {
    key: "social-energy",
    label: "社交能量",
    color: "#e1835b",
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
function resolveCityVibeResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 20));
  const matchedRule = CITY_VIBE_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? CITY_VIBE_RESULT_RULES[CITY_VIBE_RESULT_RULES.length - 1];
}

/**
 * 构建结构化答卷摘要。
 * 复杂度评估：O(Q * O)
 * Q 为题量，O 为单题选项数（当前固定为 4）。
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
        String(questionItem?.dimensionLabel ?? "").trim() || "稳定观察",
      optionId: selectedOption?.id ?? null,
      optionLabel: String(selectedOption?.label ?? "未作答").trim() || "未作答",
      tier: String(selectedOption?.tier ?? "").trim().toUpperCase(),
      responseName:
        String(selectedOption?.responseName ?? "").trim() || "稳定观察中",
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

  return Object.values(CITY_VIBE_OPTION_META).map((optionMeta) => {
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
    const leftScore = Number(CITY_VIBE_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(CITY_VIBE_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时优先取更高分选项，减少“整体更都市却被判成低能量画像”的违和感。
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
    CITY_VIBE_MAJORITY_RULES[resolvedTier] ?? CITY_VIBE_MAJORITY_RULES.A;
  const optionMeta = CITY_VIBE_OPTION_META[resolvedTier] ?? CITY_VIBE_OPTION_META.A;

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
    if (!dimensionKey || !CITY_VIBE_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(CITY_VIBE_DIMENSION_META).map((dimensionMeta) => {
    const answeredCount = dimensionAnsweredCountMap[dimensionMeta.key] ?? 0;
    const totalDimensionScore = dimensionScoreMap[dimensionMeta.key] ?? 0;
    const minScore = answeredCount;
    const dynamicRange = answeredCount * 3;
    const urbanRatio =
      answeredCount > 0 && dynamicRange > 0
        ? ((totalDimensionScore - minScore) / dynamicRange) * 100
        : 0;

    return {
      key: dimensionMeta.key,
      name: dimensionMeta.label,
      label: dimensionMeta.label,
      score: clampPercent(urbanRatio),
      color: dimensionMeta.color,
    };
  });
}

/**
 * 计算单题与当前结果区间的贴合度。
 * @param {number} rawScore 原始分值。
 * @param {number} targetAverageScore 当前结果区间对应的目标平均分。
 * @returns {number} 0~100 的贴合度分值。
 */
function resolveScenarioAlignmentScore(rawScore, targetAverageScore) {
  const safeRawScore = toSafeNumber(rawScore, 0);
  const safeTargetAverageScore = toSafeNumber(targetAverageScore, 2.5);
  const scoreGap = Math.abs(safeRawScore - safeTargetAverageScore);
  return clampPercent((1 - Math.min(1, scoreGap / 3)) * 100);
}

/**
 * 构建最能体现当前城市气质的偏好线索。
 * 复杂度评估：O(Q log Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {object} resultRule 当前结果规则。
 * @param {number} questionCount 题量。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string, dimensionLabel: string, responseName: string }>} Top 列表。
 */
function buildTopCitySignals(answerSummary, resultRule, questionCount, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));
  const safeQuestionCount = Math.max(1, Math.floor(toSafeNumber(questionCount, 20)));
  const rangeMidpoint =
    (toSafeNumber(resultRule?.min, 20) + toSafeNumber(resultRule?.max, 80)) / 2;
  const targetAverageScore = rangeMidpoint / safeQuestionCount;

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => {
      const rawScore = toSafeNumber(summaryItem.score, 0);
      return {
        name: summaryItem.questionTitle,
        score: resolveScenarioAlignmentScore(rawScore, targetAverageScore),
        optionLabel: summaryItem.optionLabel,
        dimensionLabel: summaryItem.dimensionLabel,
        responseName: summaryItem.responseName,
        rawScore,
        signalStrength: Math.abs(rawScore - 2.5),
      };
    })
    .sort((leftItem, rightItem) => {
      const scoreDiff = rightItem.score - leftItem.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      // 关键逻辑：贴合度打平时，优先保留更有鲜明偏向的题目，减少结果说明过于“中性”。
      const signalStrengthDiff = rightItem.signalStrength - leftItem.signalStrength;
      if (signalStrengthDiff !== 0) {
        return signalStrengthDiff;
      }

      return String(leftItem.name).localeCompare(String(rightItem.name), "zh-Hans-CN");
    })
    .slice(0, safeTopN)
    .map(({ rawScore, signalStrength, ...restItem }) => restItem);
}

/**
 * 构建偏好线索叙事短句。
 * @param {object | undefined} signalItem 线索对象。
 * @returns {string} 线索叙事。
 */
function buildSignalNarrativeText(signalItem) {
  const signalName = String(signalItem?.name ?? "").trim();
  const optionLabel = String(signalItem?.optionLabel ?? "").trim();
  if (!signalName) {
    return "当前样本量不足，建议完整作答后再次观察你的城市气质。";
  }

  return `最能体现你城市偏好的题目是「${signalName}」，你会自然选向“${optionLabel || "稳定观察中"}”。`;
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.majorityProfile 多数选项画像。
 * @param {Array<object>} params.topCitySignals 城市线索列表。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
  topCitySignals,
}) {
  const signalNarrativeText = buildSignalNarrativeText(topCitySignals[0]);

  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 80))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 安静治愈向"}，说明你对城市氛围的偏好已经比较稳定。`,
    signalNarrativeText,
  ].join(" ");
}

/**
 * 计算城市气质本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 偏好线索排序为 O(Q log Q)。
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
 *  topCitySignals: Array<object>,
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string,
 *  actionTips: Array<string>
 * }} 本地结果。
 */
export function analyzeCityVibeLocally({ questions, answerIds }) {
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
  const resultRule = resolveCityVibeResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildDimensionRadarItems(answerSummary);
  const topCitySignals = buildTopCitySignals(
    answerSummary,
    resultRule,
    normalizedQuestions.length,
    3,
  );
  const summaryLines = buildSummaryLines(answerSummary);
  const localNarrative = buildLocalNarrative({
    totalScore,
    maxScore,
    resultRule,
    majorityProfile,
    topCitySignals,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    majorityProfile,
    optionDistribution,
    radarItems,
    topCitySignals,
    summaryLines,
    answerSummary,
    localNarrative,
    actionTips: Array.isArray(resultRule.actionTips) ? resultRule.actionTips : [],
  };
}
