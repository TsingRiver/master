/**
 * 灵魂年龄分析维度元数据。
 * 1. label 用于雷达图维度名展示。
 * 2. shortInsight 用于结果页 hover / 点击后的短解读。
 */
export const SOUL_AGE_DIMENSION_META = Object.freeze({
  curiosity: {
    key: "curiosity",
    label: "好奇心",
    shortInsight: "你对新鲜体验、未来可能性和学习探索的打开程度，会影响灵魂的鲜活感。",
  },
  "emotion-stability": {
    key: "emotion-stability",
    label: "情绪稳定",
    shortInsight: "你在批评、遗憾和波动面前，能否慢慢回到平衡，决定了内心底盘。",
  },
  "social-ease": {
    key: "social-ease",
    label: "社交从容",
    shortInsight: "你在关系里是否自然、松弛而有分寸，会直接影响相处时的舒适度。",
  },
  responsibility: {
    key: "responsibility",
    label: "责任担当",
    shortInsight: "你面对目标、责任与现实问题时的回应方式，反映了成熟与可靠程度。",
  },
  resilience: {
    key: "resilience",
    label: "抗逆力",
    shortInsight: "遇到变化、疲惫和压力时，你把自己带回稳定状态的能力，就是你的韧性。",
  },
  "life-enthusiasm": {
    key: "life-enthusiasm",
    label: "生活热情",
    shortInsight: "你对生活节奏、兴趣体验和日常投入感的选择，会决定灵魂的明亮度。",
  },
  inclusiveness: {
    key: "inclusiveness",
    label: "包容度",
    shortInsight: "你是否愿意理解别人、接纳差异和留出空间，会影响关系里的温度。",
  },
  "self-acceptance": {
    key: "self-acceptance",
    label: "自我接纳",
    shortInsight: "你如何看待自己的状态、缺点和人生阶段，是内在稳定感的重要来源。",
  },
});

/**
 * 维度 key 列表。
 */
const SOUL_AGE_DIMENSION_KEYS = Object.keys(SOUL_AGE_DIMENSION_META);

/**
 * 八维雷达图题目映射：
 * 1. 固定 20 题不足以让 8 个维度都拥有完全独立的题组，因此允许同一题贡献给多个结果维度。
 * 2. 映射顺序与雷达图维度顺序保持一致，避免展示和计算脱节。
 */
const RADAR_DIMENSION_QUESTION_MAP = Object.freeze({
  curiosity: ["soul-age-q04", "soul-age-q09", "soul-age-q15"],
  "emotion-stability": ["soul-age-q03", "soul-age-q10", "soul-age-q14"],
  "social-ease": ["soul-age-q05", "soul-age-q11", "soul-age-q19"],
  responsibility: ["soul-age-q04", "soul-age-q12", "soul-age-q18"],
  resilience: ["soul-age-q01", "soul-age-q07", "soul-age-q16"],
  "life-enthusiasm": ["soul-age-q02", "soul-age-q06", "soul-age-q17"],
  inclusiveness: ["soul-age-q05", "soul-age-q19", "soul-age-q20"],
  "self-acceptance": [
    "soul-age-q03",
    "soul-age-q08",
    "soul-age-q13",
    "soul-age-q20",
  ],
});

/**
 * 灵魂年龄结果区间：
 * 关键逻辑：严格按 20 题总分区间映射到 8 个具体年龄，不再做连续年龄估算。
 */
const SOUL_AGE_RESULT_RULES = Object.freeze([
  {
    key: "soul-age-12",
    min: 20,
    max: 27,
    soulAge: 12,
    title: "纯粹天真型",
    oneLine:
      "纯粹天真、好奇心爆棚，像孩子一样热爱世界，无忧无虑，永远保持少年感。",
    summary:
      "你的灵魂很轻盈，天真、鲜活、感受力强，很多时候会先凭本能和好奇心拥抱世界。",
  },
  {
    key: "soul-age-16",
    min: 28,
    max: 35,
    soulAge: 16,
    title: "青春热烈型",
    oneLine:
      "青春热烈、敢爱敢恨，有懵懂的美好，也有少年的倔强，鲜活又明亮。",
    summary:
      "你的灵魂保留了少年人的热烈和冲劲，情绪来得快、感受也真，身上有很强的鲜活感。",
  },
  {
    key: "soul-age-18",
    min: 36,
    max: 43,
    soulAge: 18,
    title: "青涩成熟型",
    oneLine:
      "青涩成熟、满怀憧憬，既有对未来的期待，也有独立的意识，勇敢又美好。",
    summary:
      "你的灵魂正在热情和独立之间长出轮廓，既愿意期待未来，也开始学着自己拿主意。",
  },
  {
    key: "soul-age-25",
    min: 44,
    max: 51,
    soulAge: 25,
    title: "清醒独立型",
    oneLine:
      "清醒独立、努力拼搏，有目标有冲劲，敢闯敢试，是热血又踏实的青年。",
    summary:
      "你的灵魂已经有了明确方向感，能为自己负责，也愿意为想要的生活主动投入行动。",
  },
  {
    key: "soul-age-30",
    min: 52,
    max: 59,
    soulAge: 30,
    title: "成熟稳重型",
    oneLine:
      "成熟稳重、有担当，懂得权衡利弊，既保留初心，又能从容面对生活。",
    summary:
      "你的灵魂开始进入稳与准并存的阶段，既看重现实秩序，也没有丢掉最初的热爱。",
  },
  {
    key: "soul-age-35",
    min: 60,
    max: 67,
    soulAge: 35,
    title: "通透从容型",
    oneLine:
      "通透从容、情绪稳定，看透却不世故，懂得自愈也懂得珍惜，活得松弛又清醒。",
    summary:
      "你的灵魂更重视情绪稳定和生活质量，很多事已经能看开，也更懂得怎么照顾自己。",
  },
  {
    key: "soul-age-42",
    min: 68,
    max: 75,
    soulAge: 42,
    title: "淡然平和型",
    oneLine:
      "淡然平和、阅历丰富，看淡得失，懂得取舍，内心强大，从容不迫。",
    summary:
      "你的灵魂已经具备很强的内在秩序，做事不急不躁，很多关系和得失都能拿得起放得下。",
  },
  {
    key: "soul-age-50",
    min: 76,
    max: 80,
    soulAge: 50,
    title: "佛系通透型",
    oneLine:
      "佛系通透、与世无争，早已放下执念，活得自在洒脱，是内心丰盈的智者。",
    summary:
      "你的灵魂很松弛，很多外界评价和波动已经很难真正打乱你，更在意内在自由与通透。",
  },
]);

/**
 * 关键词标签映射。
 */
const DIMENSION_KEYWORD_MAP = Object.freeze({
  curiosity: {
    keyword: "探索",
    desc: "你对新鲜感、学习欲和未来可能性的打开程度，会影响灵魂的鲜活感。",
  },
  "emotion-stability": {
    keyword: "稳感",
    desc: "你在情绪起伏里回到平衡的能力，决定了内心底盘是否扎实。",
  },
  "social-ease": {
    keyword: "从容",
    desc: "你在社交里是否自然、不用过度证明自己，会影响关系的舒适度。",
  },
  responsibility: {
    keyword: "担当",
    desc: "你对责任、目标和现实问题的回应方式，代表了成熟度与可靠感。",
  },
  resilience: {
    keyword: "韧性",
    desc: "遇到变化、疲惫和压力时，你恢复节奏的能力就是你的抗逆力。",
  },
  "life-enthusiasm": {
    keyword: "热度",
    desc: "你对生活本身的兴趣和投入感，会决定灵魂呈现出来的明亮程度。",
  },
  inclusiveness: {
    keyword: "包容",
    desc: "你能否理解别人、接纳差异和留出空间，会影响关系里的温度。",
  },
  "self-acceptance": {
    keyword: "自洽",
    desc: "你是否愿意接住自己、允许不完美，是内在稳定感的重要来源。",
  },
});

/**
 * 选项元信息：
 * 关键逻辑：总分统一以题库 score 为准，这里只保留饼图三段占比所需的倾向权重。
 */
const SOUL_AGE_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    distribution: {
      childlike: 12,
      mature: 1,
      insightful: 0,
    },
  },
  B: {
    tier: "B",
    distribution: {
      childlike: 5,
      mature: 7,
      insightful: 1,
    },
  },
  C: {
    tier: "C",
    distribution: {
      childlike: 1,
      mature: 8,
      insightful: 4,
    },
  },
  D: {
    tier: "D",
    distribution: {
      childlike: 0,
      mature: 3,
      insightful: 10,
    },
  },
});

/**
 * 饼图颜色配置。
 */
const PIE_SEGMENT_META = Object.freeze({
  childlike: { key: "childlike", label: "童真保留", color: "#B8D4E3" },
  mature: { key: "mature", label: "成熟特质", color: "#E8D5C4" },
  insightful: { key: "insightful", label: "通透感悟", color: "#D4B996" },
});

/**
 * 未填写实际年龄时的契合度默认估算年龄。
 * 关键逻辑：封面文案、结果说明和分析模型必须共用同一个默认值，避免出现展示与计算不一致。
 */
const DEFAULT_COMPATIBILITY_AGE = 25;

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
 * 创建零值维度映射。
 * @returns {{ [dimension: string]: number }} 零值映射。
 */
function createZeroDimensionMap() {
  return SOUL_AGE_DIMENSION_KEYS.reduce((accumulator, dimensionKey) => {
    accumulator[dimensionKey] = 0;
    return accumulator;
  }, {});
}

/**
 * 命中总分区间规则。
 * @param {number} totalScore 总分。
 * @returns {{
 *   key: string,
 *   min: number,
 *   max: number,
 *   soulAge: number,
 *   title: string,
 *   oneLine: string,
 *   summary: string
 * }} 匹配结果。
 */
function resolveSoulAgeRule(totalScore) {
  const minScore = SOUL_AGE_RESULT_RULES[0].min;
  const maxScore = SOUL_AGE_RESULT_RULES[SOUL_AGE_RESULT_RULES.length - 1].max;
  const safeScore = clamp(Math.round(toSafeNumber(totalScore, minScore)), minScore, maxScore);
  const matchedRule = SOUL_AGE_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? SOUL_AGE_RESULT_RULES[0];
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
 * 统计总分。
 * 复杂度评估：O(Q)
 * Q 为题量（当前固定 20）。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {number} 总分。
 */
function buildTotalScore(answerSummary) {
  return answerSummary.reduce(
    (scoreSum, summaryItem) => scoreSum + toSafeNumber(summaryItem.score, 0),
    0,
  );
}

/**
 * 聚合维度分值。
 * 复杂度评估：O(Q + D * R)
 * Q 为题量，D 为维度数，R 为单维度挂载题目数；当前 D=8、R<=4，整体仍为常数级。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {{ [dimension: string]: number }} 维度分值（0~100）。
 */
function buildDimensionScoreMap(answerSummary) {
  const questionScoreMap = answerSummary.reduce((accumulator, summaryItem) => {
    if (!summaryItem.optionId) {
      return accumulator;
    }

    accumulator[String(summaryItem.questionId ?? "").trim()] = toSafeNumber(
      summaryItem.score,
      0,
    );
    return accumulator;
  }, {});

  return SOUL_AGE_DIMENSION_KEYS.reduce((accumulator, dimensionKey) => {
    const mappedQuestionIds = RADAR_DIMENSION_QUESTION_MAP[dimensionKey] ?? [];
    const dimensionScores = mappedQuestionIds
      .map((questionId) => questionScoreMap[questionId])
      .filter((scoreItem) => Number.isFinite(scoreItem));
    const questionCount = dimensionScores.length;
    const averageScore =
      questionCount > 0
        ? dimensionScores.reduce(
            (scoreSum, scoreItem) => scoreSum + toSafeNumber(scoreItem, 0),
            0,
          ) / questionCount
        : 2.5;
    // 关键逻辑：总分按 1~4 计，但雷达图统一换算到 25~100，便于视觉差异更清晰。
    const normalizedScore = ((averageScore - 1) / 3) * 75 + 25;
    accumulator[dimensionKey] = Math.round(clamp(normalizedScore, 0, 100));
    return accumulator;
  }, {});
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
 * Q 为题量（当前固定 20）。
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
    const optionMeta = SOUL_AGE_OPTION_META[summaryItem?.tier];
    if (!summaryItem.optionId || !optionMeta) {
      return;
    }

    distributionSum.childlike += toSafeNumber(
      optionMeta.distribution.childlike,
      0,
    );
    distributionSum.mature += toSafeNumber(
      optionMeta.distribution.mature,
      0,
    );
    distributionSum.insightful += toSafeNumber(
      optionMeta.distribution.insightful,
      0,
    );
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
 * D 为维度数（当前固定 8，常数级）。
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
  const normalizedActualAgeInput =
    actualAge === null || actualAge === undefined
      ? ""
      : String(actualAge).trim();
  // 关键逻辑：空值必须视为“未填写”，避免 Number(null) 被当成 0 导致默认年龄错误落到下限。
  const parsedActualAge =
    normalizedActualAgeInput === "" ? Number.NaN : Number(normalizedActualAgeInput);
  const isUserProvided = Number.isFinite(parsedActualAge);
  const safeActualAge = isUserProvided
    ? clamp(Math.round(parsedActualAge), 12, 80)
    : DEFAULT_COMPATIBILITY_AGE;
  const diff = soulAge - safeActualAge;
  const fitPercent = Math.round(clamp(100 - Math.abs(diff) * 3, 42, 98));
  const linePrefix = isUserProvided
    ? ""
    : `默认按 ${DEFAULT_COMPATIBILITY_AGE} 岁估算，`;

  if (diff >= 10) {
    return {
      actualAge: safeActualAge,
      isUserProvided,
      diff,
      fitPercent,
      line: `${linePrefix}你的灵魂比实际年龄更成熟 ${diff} 岁，很多时候会比同龄人更早看明白人和事。`,
    };
  }

  if (diff >= 4) {
    return {
      actualAge: safeActualAge,
      isUserProvided,
      diff,
      fitPercent,
      line: `${linePrefix}你的灵魂略显成熟，做决定时通常比外表看起来更稳、更有分寸。`,
    };
  }

  if (diff <= -10) {
    return {
      actualAge: safeActualAge,
      isUserProvided,
      diff,
      fitPercent,
      line: `${linePrefix}你的灵魂明显更年轻，身上保留着很珍贵的好奇、热烈和少年气。`,
    };
  }

  if (diff <= -4) {
    return {
      actualAge: safeActualAge,
      isUserProvided,
      diff,
      fitPercent,
      line: `${linePrefix}你的灵魂会比实际年龄更轻盈一些，这份鲜活感会让你一直保有热度。`,
    };
  }

  return {
    actualAge: safeActualAge,
    isUserProvided,
    diff,
    fitPercent,
    line: `${linePrefix}你的灵魂年龄与实际年龄比较贴合，既能感受生活，也能稳住自己的节奏。`,
  };
}

/**
 * 构建结果页 3 句核心描述。
 * @param {{ [dimension: string]: number }} dimensionScoreMap 维度分值。
 * @returns {Array<string>} 核心描述文案。
 */
function buildCoreDescriptionLines(dimensionScoreMap) {
  const curiosity = toSafeNumber(dimensionScoreMap.curiosity, 50);
  const emotionStability = toSafeNumber(
    dimensionScoreMap["emotion-stability"],
    50,
  );
  const socialEase = toSafeNumber(dimensionScoreMap["social-ease"], 50);
  const responsibility = toSafeNumber(dimensionScoreMap.responsibility, 50);
  const resilience = toSafeNumber(dimensionScoreMap.resilience, 50);
  const lifeEnthusiasm = toSafeNumber(
    dimensionScoreMap["life-enthusiasm"],
    50,
  );
  const inclusiveness = toSafeNumber(dimensionScoreMap.inclusiveness, 50);
  const selfAcceptance = toSafeNumber(
    dimensionScoreMap["self-acceptance"],
    50,
  );

  const lineOne =
    resilience >= emotionStability
      ? "遇到变化和压力时，你更像是先把局面稳住，再慢慢处理自己的感受。"
      : "遇到变化和压力时，你会先照顾情绪，再一点点把自己带回稳定状态。";
  const lineTwo =
    curiosity + lifeEnthusiasm >= responsibility + socialEase
      ? "你对世界仍保留着明显的探索欲和生活热度，很多动力来自新鲜感、体验感和鲜活感。"
      : "你更重视秩序感与现实回应，愿意把精力放在长期稳定、责任和关系质量上。";
  const lineThree =
    selfAcceptance + inclusiveness >= responsibility + socialEase
      ? "你正在形成更强的自我接纳和理解他人的能力，关系里也更愿意留出空间与余地。"
      : "你更在意把自己站稳、把事情做好，在人与事面前都会表现出更成熟的分寸感。";

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
  const dimensionAdviceRules = [
    {
      key: "resilience",
      threshold: 58,
      icon: "✦",
      text: "遇到突发状况时，先把问题拆成“现在能做”和“暂时做不了”两部分，会更容易稳住自己。",
    },
    {
      key: "emotion-stability",
      threshold: 58,
      icon: "☁",
      text: "别急着要求自己马上想通，给情绪留一点出口，恢复速度反而会更快。",
    },
    {
      key: "social-ease",
      threshold: 58,
      icon: "❀",
      text: "社交里不用急着表现得很会说，先让自己松弛下来，关系通常会更自然。",
    },
    {
      key: "responsibility",
      threshold: 58,
      icon: "☘",
      text: "把一个长期目标拆成一周内能完成的小动作，你会更容易把热情变成稳定结果。",
    },
    {
      key: "life-enthusiasm",
      threshold: 58,
      icon: "☼",
      text: "给自己保留一点真正让你期待的活动，不必一直靠忙碌来证明生活充实。",
    },
    {
      key: "inclusiveness",
      threshold: 58,
      icon: "♢",
      text: "先区分“我是否理解对方”和“我是否认同对方”，会更容易建立稳定边界和包容感。",
    },
    {
      key: "self-acceptance",
      threshold: 58,
      icon: "❤",
      text: "当你又开始苛责自己时，先把标准放低一点，允许自己在不完美里慢慢变好。",
    },
    {
      key: "curiosity",
      threshold: 58,
      icon: "❋",
      text: "给最近的生活加一点新体验或新知识输入，灵魂的轻盈感通常会明显回来。",
    },
  ];

  const lowDimensionAdviceCards = dimensionAdviceRules
    .map((ruleItem) => ({
      ...ruleItem,
      score: toSafeNumber(dimensionScoreMap[ruleItem.key], 50),
    }))
    .filter((ruleItem) => ruleItem.score < ruleItem.threshold)
    .sort((leftItem, rightItem) => leftItem.score - rightItem.score)
    .slice(0, 3)
    .map(({ icon, text }) => ({ icon, text }));

  adviceCards.push(...lowDimensionAdviceCards);

  if (compatibilityModel.diff >= 10) {
    adviceCards.push({
      icon: "✧",
      text: "你很容易习惯提前成熟，偶尔允许自己轻松一点、幼稚一点，反而更有弹性。",
    });
  }

  if (compatibilityModel.diff <= -10) {
    adviceCards.push({
      icon: "✧",
      text: "你身上的少年感很珍贵，同时也建议给自己加一个长期锚点，让热情更能落地。",
    });
  }

  // 关键逻辑：保证至少 2 条建议，避免结果页信息过少。
  if (adviceCards.length < 2) {
    adviceCards.push({
      icon: "❤",
      text: "保持现在的节奏已经很好，继续把时间和注意力放在真正重要的人和事上。",
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
  if (soulAge <= 16) {
    return "你和热烈直接、愿意带你体验世界的人最容易玩到一起。";
  }

  if (soulAge <= 25) {
    return "你和清醒上进、又保留一点少年感的人更容易互相吸引。";
  }

  if (soulAge <= 35) {
    return "你和成熟稳重、能把生活过踏实的人更容易长期同频。";
  }

  if (soulAge <= 42) {
    return "你和情绪稳定、边界清晰、说话有分寸的人最能彼此理解。";
  }

  return "你和内核安定、看淡得失、尊重独处空间的人更容易长久同频。";
}

/**
 * 本地分析灵魂年龄结果。
 * @param {object} payload 输入参数。
 * @param {Array<object>} payload.questions 本轮题目列表。
 * @param {Array<string | null>} payload.answerIds 用户答案 ID 列表。
 * @param {number | null} [payload.actualAge=null] 用户输入实际年龄（可选）。
 * @returns {{
 *   totalScore: number,
 *   resultRangeText: string,
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
  const summaryLines = buildSummaryLines(answerSummary);
  const totalScore = buildTotalScore(answerSummary);
  const soulAgeRule = resolveSoulAgeRule(totalScore);
  const dimensionScoreMap = buildDimensionScoreMap(answerSummary);
  const radarItems = buildRadarItems(dimensionScoreMap);
  const pieDistribution = buildPieDistribution(answerSummary);
  const keywordCards = buildKeywordCards(dimensionScoreMap);
  const compatibility = buildCompatibilityModel(soulAgeRule.soulAge, actualAge);
  const coreDescriptionLines = buildCoreDescriptionLines(dimensionScoreMap);
  const adviceCards = buildAdviceCards(dimensionScoreMap, compatibility);
  const resonanceLine = buildResonanceLine(soulAgeRule.soulAge);

  return {
    totalScore,
    resultRangeText: `${soulAgeRule.min}-${soulAgeRule.max} 分`,
    soulAge: soulAgeRule.soulAge,
    ageTitle: soulAgeRule.title,
    ageOneLine: soulAgeRule.oneLine,
    ageTagText: `灵魂年龄 ${soulAgeRule.soulAge} 岁 · ${soulAgeRule.title}`,
    summaryLine: soulAgeRule.summary,
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
