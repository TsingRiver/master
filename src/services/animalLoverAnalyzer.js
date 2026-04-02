/**
 * 动物系恋人选项元信息：
 * 1. tier 与题库 option.tier 对齐。
 * 2. color 用于结果页分布图和雷达图保持统一视觉语义。
 */
const ANIMAL_LOVER_OPTION_META = Object.freeze({
  A: {
    tier: "A",
    label: "稳定陪伴向",
    fullLabel: "A 稳定陪伴向",
    score: 1,
    color: "#DFA8B6",
  },
  B: {
    tier: "B",
    label: "温柔共鸣向",
    fullLabel: "B 温柔共鸣向",
    score: 2,
    color: "#F0BE80",
  },
  C: {
    tier: "C",
    label: "自由清醒向",
    fullLabel: "C 自由清醒向",
    score: 3,
    color: "#92AED7",
  },
  D: {
    tier: "D",
    label: "热烈主导向",
    fullLabel: "D 热烈主导向",
    score: 4,
    color: "#E07B63",
  },
});

/**
 * 动物系恋人结果区间规则：
 * 关键逻辑：
 * 1. 主结果始终以 20 题总分区间为准，保证 8 种动物结果与需求稿严格一致。
 * 2. themeVariantClass 同时挂载“风格类 + 动物类”，便于结果页按动物切换背景图。
 */
const ANIMAL_LOVER_RESULT_RULES = Object.freeze([
  {
    key: "kitten-lover",
    min: 20,
    max: 27,
    levelName: "奶猫系恋人",
    statusLabel: "稳定陪伴感最强",
    coreTag: "爱意藏在细节里，最需要安稳陪伴",
    summary:
      "你是一只软乎乎的奶猫恋人，擅长用温柔融化坚冰，偏爱在亲密关系里撒娇和依赖，自带治愈一切的温柔气场。",
    tagChips: ["细节表达", "稳定陪伴", "软萌治愈"],
    actionTips: [
      "默默付出是你的优势，但也要把真实需求说出来，别总等别人自己发现。",
      "安全感不一定只靠高频陪伴，也可以靠明确约定和稳定回应建立。",
      "当你感到不安时，先表达感受再表达期待，会比闷着委屈更有效。",
    ],
    easterEggText: "你的爱像小毯子，不吵闹，却很暖。",
    styleMode: "soft",
    themeVariantClass: "theme-animal-lover-soft animal-lover-result-kitten",
  },
  {
    key: "deer-lover",
    min: 28,
    max: 35,
    levelName: "小鹿系恋人",
    statusLabel: "细腻敏感感更明显",
    coreTag: "慢热心动，需要被温柔接住",
    summary:
      "你是小鹿恋人，带着林间清风般的纯粹和懵懂，对待爱意真诚又热烈，一点点暧昧就会让你羞红了脸。",
    tagChips: ["慢热害羞", "纯粹心动", "需要安全感"],
    actionTips: [
      "别把所有波动都当成关系风险，先看事实，再决定要不要慌张。",
      "你可以慢热，但不要长期只靠试探表达喜欢，适度直说会更轻松。",
      "当你被触发时，先让对方知道你在意什么，比自己反复内耗更有用。",
    ],
    easterEggText: "你不是难靠近，只是认真对待每一次心动。",
    styleMode: "soft",
    themeVariantClass: "theme-animal-lover-soft animal-lover-result-deer",
  },
  {
    key: "swan-lover",
    min: 36,
    max: 43,
    levelName: "天鹅系恋人",
    statusLabel: "灵魂共鸣感突出",
    coreTag: "共情和原则并存，温柔但不失分寸",
    summary:
      "你是骄傲又优雅的天鹅恋人，在爱里保持着从容体面，认定一人就会双向奔赴，爱意如同湖面倒影一般澄澈坚定。",
    tagChips: ["共情在线", "灵魂共鸣", "温柔有原则"],
    actionTips: [
      "你的共情力很强，但别让理解别人变成持续忽略自己。",
      "保持高质量沟通的同时，也要把底线说清楚，别总靠别人领会。",
      "你适合慢慢建立深度连接，不需要为了证明真心而过度承担。",
    ],
    easterEggText: "你会让人觉得，被你好好理解是一件很难得的事。",
    styleMode: "warm",
    themeVariantClass: "theme-animal-lover-warm animal-lover-result-swan",
  },
  {
    key: "dolphin-lover",
    min: 44,
    max: 51,
    levelName: "海豚系恋人",
    statusLabel: "情绪治愈力很强",
    coreTag: "轻松温暖，自带稳定快乐感",
    summary:
      "你是灵动跳脱的海豚恋人，永远带着满格的热情和活力，是亲密关系里的气氛担当，爱意如同海浪一般澎湃又持久。",
    tagChips: ["治愈轻盈", "善解人意", "情绪稳定"],
    actionTips: [
      "你的轻松感很加分，但遇到真正不舒服的点也要及时说清楚。",
      "别总想着把气氛照顾好，重要问题还是需要正面沟通。",
      "当你把快乐和边界一起保留下来，关系会更稳也更长久。",
    ],
    easterEggText: "你一出现，关系里的空气都会变轻一点。",
    styleMode: "warm",
    themeVariantClass: "theme-animal-lover-warm animal-lover-result-dolphin",
  },
  {
    key: "fox-lover",
    min: 52,
    max: 59,
    levelName: "狐狸系恋人",
    statusLabel: "魅力与新鲜感在线",
    coreTag: "轻盈洒脱，自带一点捉摸不透的吸引力",
    summary:
      "你是狡黠又魅惑的狐狸恋人，擅长用浪漫编织爱意陷阱，在爱里带着一点点若即若离的神秘感，让人忍不住沉溺。",
    tagChips: ["灵动有趣", "新鲜感强", "神秘魅力"],
    actionTips: [
      "你的松弛和趣味感很有吸引力，但稳定回应也一样重要。",
      "别用忽远忽近替代边界表达，直接说明节奏会更省心。",
      "继续保留惊喜感，同时给对方必要的确定性，关系会更舒服。",
    ],
    easterEggText: "你最迷人的地方，是永远不只一种样子。",
    styleMode: "free",
    themeVariantClass: "theme-animal-lover-free animal-lover-result-fox",
  },
  {
    key: "panda-lover",
    min: 60,
    max: 67,
    levelName: "熊猫系恋人",
    statusLabel: "松弛稳定感很强",
    coreTag: "不争不抢，却很让人安心",
    summary:
      "你是慵懒又软萌的熊猫恋人，在爱里自带松弛感，偏爱平淡日常里的陪伴，把爱意揉进每一个温暖的瞬间里。",
    tagChips: ["松弛温柔", "不争不抢", "稳定安心"],
    actionTips: [
      "你的治愈感很珍贵，但重要问题不要总想着顺其自然。",
      "稳定之外也要主动表达喜欢和不满，别让对方全靠猜。",
      "松弛不等于回避，关键节点把态度说清楚会更有安全感。",
    ],
    easterEggText: "你不需要太用力，很多人本来就会想靠近你。",
    styleMode: "free",
    themeVariantClass: "theme-animal-lover-free animal-lover-result-panda",
  },
  {
    key: "wolf-lover",
    min: 68,
    max: 75,
    levelName: "狼系恋人",
    statusLabel: "忠诚与占有感突出",
    coreTag: "认定了就会很护短，也很难轻易放手",
    summary:
      "你是深情又专注的狼系恋人，认定一人就会拼尽全力守护，占有欲和安全感拉满，把爱人规划进所有的未来里。",
    tagChips: ["忠诚专一", "护短深情", "外冷内热"],
    actionTips: [
      "你的深情很有分量，但占有欲最好通过边界协商表达，而不是控制。",
      "把“我很在意”说出口，比让对方自己体会更不容易误伤关系。",
      "当你愿意在强硬之外多一点倾听，关系会更稳也更舒服。",
    ],
    easterEggText: "你不轻易承诺，但一旦认定就很有重量。",
    styleMode: "intense",
    themeVariantClass: "theme-animal-lover-intense animal-lover-result-wolf",
  },
  {
    key: "cheetah-lover",
    min: 76,
    max: 80,
    levelName: "猎豹系恋人",
    statusLabel: "热烈表达力拉满",
    coreTag: "敢爱敢恨，爱就会直接冲上去",
    summary:
      "你是热烈又直接的猎豹恋人，在爱里带着势在必得的气场，爱意直白又滚烫，会把所有偏爱都明目张胆给一人。",
    tagChips: ["热烈直接", "自由激情", "强大气场"],
    actionTips: [
      "你的表达力和行动力都很强，但也要给对方一点跟上节奏的空间。",
      "热烈不是问题，关键是别让高情绪替你完成全部判断。",
      "保持直接的同时多一点倾听，会让你的魅力更稳定、更高级。",
    ],
    easterEggText: "你一心动，别人通常很难感受不到。",
    styleMode: "intense",
    themeVariantClass: "theme-animal-lover-intense animal-lover-result-cheetah",
  },
]);

/**
 * 多数选项画像规则：
 * 关键逻辑：多数选项只做作答倾向补充，不覆盖总分主结果。
 */
const ANIMAL_LOVER_MAJORITY_RULES = Object.freeze({
  A: {
    tier: "A",
    name: "稳定陪伴向",
    description: "你更习惯把爱放在陪伴、忠诚和长期稳定回应里。",
  },
  B: {
    tier: "B",
    name: "温柔共鸣向",
    description: "你更习惯用体贴、倾听和情绪承接来经营关系。",
  },
  C: {
    tier: "C",
    name: "自由清醒向",
    description: "你更习惯在亲密里保留空间感、趣味感和自己的节奏。",
  },
  D: {
    tier: "D",
    name: "热烈主导向",
    description: "你更习惯主动表达、推动关系节奏，并强化存在感。",
  },
});

/**
 * 结果页雷达图维度元信息。
 */
const ANIMAL_LOVER_DIMENSION_META = Object.freeze({
  "connection-priority": {
    key: "connection-priority",
    label: "关系取向",
    color: "#D88F9F",
  },
  "repair-response": {
    key: "repair-response",
    label: "冲突反应",
    color: "#E0A96D",
  },
  "expression-style": {
    key: "expression-style",
    label: "表达方式",
    color: "#8EABD3",
  },
  "pace-and-role": {
    key: "pace-and-role",
    label: "节奏角色",
    color: "#D67B62",
  },
});

/**
 * 风格中心分值映射：
 * 关键逻辑：不同动物区间对应不同“作答中心点”，用于挑出最像当前恋爱气质的场景。
 */
const ANIMAL_LOVER_STYLE_TARGET_SCORE = Object.freeze({
  soft: 1.4,
  warm: 2.1,
  free: 2.9,
  intense: 3.7,
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
function resolveAnimalLoverResultRule(totalScore) {
  const safeScore = Math.round(toSafeNumber(totalScore, 20));
  const matchedRule = ANIMAL_LOVER_RESULT_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? ANIMAL_LOVER_RESULT_RULES[ANIMAL_LOVER_RESULT_RULES.length - 1];
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
        String(questionItem?.dimensionLabel ?? "").trim() || "稳定观察",
      optionId: selectedOption?.id ?? null,
      optionLabel: String(selectedOption?.label ?? "未作答").trim() || "未作答",
      tier: String(selectedOption?.tier ?? "").trim().toUpperCase(),
      profileName:
        String(selectedOption?.profileName ?? "").trim() || "稳定观察中",
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

  return Object.values(ANIMAL_LOVER_OPTION_META).map((optionMeta) => {
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
    const leftScore = Number(ANIMAL_LOVER_OPTION_META[leftTier]?.score ?? 0);
    const rightScore = Number(ANIMAL_LOVER_OPTION_META[rightTier]?.score ?? 0);
    const leftDistance = Math.abs(leftScore - averageScore);
    const rightDistance = Math.abs(rightScore - averageScore);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    // 关键逻辑：距离仍相同时优先取更高分档，保证“偏热烈”的作答不被低估。
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
    ANIMAL_LOVER_MAJORITY_RULES[resolvedTier] ??
    ANIMAL_LOVER_MAJORITY_RULES.A;
  const optionMeta =
    ANIMAL_LOVER_OPTION_META[resolvedTier] ?? ANIMAL_LOVER_OPTION_META.A;

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
    if (!dimensionKey || !ANIMAL_LOVER_DIMENSION_META[dimensionKey]) {
      return;
    }

    if (typeof dimensionScoreMap[dimensionKey] !== "number") {
      dimensionScoreMap[dimensionKey] = 0;
      dimensionAnsweredCountMap[dimensionKey] = 0;
    }

    dimensionScoreMap[dimensionKey] += toSafeNumber(summaryItem.score, 0);
    dimensionAnsweredCountMap[dimensionKey] += 1;
  });

  return Object.values(ANIMAL_LOVER_DIMENSION_META).map((dimensionMeta) => {
    const answeredCount = dimensionAnsweredCountMap[dimensionMeta.key] ?? 0;
    const totalDimensionScore = dimensionScoreMap[dimensionMeta.key] ?? 0;
    const minScore = answeredCount;
    const dynamicRange = answeredCount * 3;
    const ratio =
      answeredCount > 0 && dynamicRange > 0
        ? ((totalDimensionScore - minScore) / dynamicRange) * 100
        : 0;

    return {
      key: dimensionMeta.key,
      name: dimensionMeta.label,
      label: dimensionMeta.label,
      score: clampPercent(ratio),
      color: dimensionMeta.color,
    };
  });
}

/**
 * 获取当前恋爱风格对应的中心分值。
 * @param {"soft"|"warm"|"free"|"intense"} styleMode 风格分组。
 * @returns {number} 中心分值。
 */
function resolveStyleTargetScore(styleMode) {
  return ANIMAL_LOVER_STYLE_TARGET_SCORE[styleMode] ?? ANIMAL_LOVER_STYLE_TARGET_SCORE.warm;
}

/**
 * 计算单题与当前恋爱风格的贴合度。
 * @param {number} rawScore 原始分值。
 * @param {"soft"|"warm"|"free"|"intense"} styleMode 当前结果风格。
 * @returns {{ metric: number, traitLabel: string, targetScore: number }} 贴合度、标签与目标分值。
 */
function resolveScenarioMetric(rawScore, styleMode) {
  const targetScore = resolveStyleTargetScore(styleMode);
  const normalizedDistance = Math.abs(rawScore - targetScore) / 3;
  const metric = (1 - normalizedDistance) * 100;
  const traitLabelMap = {
    soft: "软萌陪伴感",
    warm: "温柔共鸣感",
    free: "轻盈魅力感",
    intense: "热烈主场感",
  };

  return {
    metric: clampPercent(metric),
    traitLabel: traitLabelMap[styleMode] ?? traitLabelMap.warm,
    targetScore,
  };
}

/**
 * 构建最能体现当前恋爱气质的场景列表。
 * 复杂度评估：O(Q log Q)
 * 关键排序成本来自场景贴合度排序，Q 为题量（当前固定为 20）。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {"soft"|"warm"|"free"|"intense"} styleMode 当前结果风格。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string, dimensionLabel: string, traitLabel: string }>} Top 列表。
 */
function buildTopRomanceScenarios(answerSummary, styleMode, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => {
      const rawScore = toSafeNumber(summaryItem.score, 0);
      const resolvedMetric = resolveScenarioMetric(rawScore, styleMode);

      return {
        name: summaryItem.questionTitle,
        score: resolvedMetric.metric,
        optionLabel: summaryItem.optionLabel,
        dimensionLabel: summaryItem.dimensionLabel,
        traitLabel: resolvedMetric.traitLabel,
        rawScore,
        targetScore: resolvedMetric.targetScore,
      };
    })
    .sort((leftItem, rightItem) => {
      const scoreDiff = rightItem.score - leftItem.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const leftDistance = Math.abs(leftItem.rawScore - leftItem.targetScore);
      const rightDistance = Math.abs(rightItem.rawScore - rightItem.targetScore);
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }

      return String(leftItem.name).localeCompare(String(rightItem.name), "zh-Hans-CN");
    })
    .slice(0, safeTopN)
    .map(({ rawScore, targetScore, ...restItem }) => restItem);
}

/**
 * 构建场景叙事短句。
 * @param {object | undefined} scenarioItem 场景对象。
 * @param {"soft"|"warm"|"free"|"intense"} styleMode 当前结果风格。
 * @returns {string} 场景叙事。
 */
function buildScenarioNarrativeText(scenarioItem, styleMode) {
  const scenarioName = String(scenarioItem?.name ?? "").trim();
  if (!scenarioName) {
    return "当前样本量不足，建议完整作答后再次观察你的动物系恋人画像。";
  }

  if (styleMode === "soft") {
    return `最能代表你当前心动方式的场景是「${scenarioName}」，你会更优先确认安全感和稳定感。`;
  }

  if (styleMode === "free") {
    return `最能代表你当前心动方式的场景是「${scenarioName}」，你会更在意轻盈感、趣味感和自己的节奏。`;
  }

  if (styleMode === "intense") {
    return `最能代表你当前心动方式的场景是「${scenarioName}」，你会更直接地表达情绪和存在感。`;
  }

  return `最能代表你当前心动方式的场景是「${scenarioName}」，你会更在意情绪互动和被理解感。`;
}

/**
 * 构建本地解释文案。
 * @param {object} params 解释参数。
 * @param {number} params.totalScore 总分。
 * @param {number} params.maxScore 满分。
 * @param {object} params.resultRule 结果区间规则。
 * @param {object} params.majorityProfile 多数选项画像。
 * @param {Array<object>} params.topRomanceScenarios 恋爱气质场景列表。
 * @returns {string} 展示文案。
 */
function buildLocalNarrative({
  totalScore,
  maxScore,
  resultRule,
  majorityProfile,
  topRomanceScenarios,
}) {
  const styleMode = String(resultRule?.styleMode ?? "warm").trim();
  const topScenarioText = buildScenarioNarrativeText(
    topRomanceScenarios[0],
    styleMode === "soft" ||
      styleMode === "warm" ||
      styleMode === "free" ||
      styleMode === "intense"
      ? styleMode
      : "warm",
  );

  return [
    `你的总分为 ${Math.round(toSafeNumber(totalScore, 0))}/${Math.round(toSafeNumber(maxScore, 80))}，结果落在「${resultRule.levelName ?? "待判定"}」。`,
    `多数作答更接近 ${majorityProfile.label ?? "A 稳定陪伴向"}，说明你在亲密关系里的本能反应已经形成稳定倾向。`,
    topScenarioText,
  ].join(" ");
}

/**
 * 计算动物系恋人本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 结构化答卷与总分汇总为 O(Q * O)。
 * 2. 恋爱气质场景排序为 O(Q log Q)。
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
 *  topRomanceScenarios: Array<object>,
 *  summaryLines: Array<string>,
 *  answerSummary: Array<object>,
 *  localNarrative: string,
 *  actionTips: Array<string>
 * }} 本地结果。
 */
export function analyzeAnimalLoverLocally({ questions, answerIds }) {
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
  const resultRule = resolveAnimalLoverResultRule(totalScore);
  const majorityProfile = resolveMajorityProfile(answerSummary, totalScore);
  const optionDistribution = buildOptionDistribution(answerSummary);
  const radarItems = buildDimensionRadarItems(answerSummary);
  const topRomanceScenarios = buildTopRomanceScenarios(
    answerSummary,
    String(resultRule?.styleMode ?? "warm"),
    3,
  );
  const summaryLines = buildSummaryLines(answerSummary);
  const localNarrative = buildLocalNarrative({
    totalScore,
    maxScore,
    resultRule,
    majorityProfile,
    topRomanceScenarios,
  });

  return {
    score: totalScore,
    maxScore,
    answeredCount,
    resultRule,
    majorityProfile,
    optionDistribution,
    radarItems,
    topRomanceScenarios,
    summaryLines,
    answerSummary,
    localNarrative,
    actionTips: Array.isArray(resultRule.actionTips) ? resultRule.actionTips : [],
  };
}
