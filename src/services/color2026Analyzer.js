/**
 * 2026 主题色维度中文标签：
 * 用于结果说明与摘要展示。
 */
const COLOR_DIMENSION_LABELS = {
  black: "沉稳冷静",
  blue: "清晰理性",
  red: "行动爆发",
  green: "舒缓治愈",
  yellow: "明亮乐观",
  purple: "灵感感知",
  orange: "温暖社交",
  white: "干净松弛",
};

/**
 * 颜色维度键数组。
 */
const COLOR_DIMENSION_KEYS = Object.keys(COLOR_DIMENSION_LABELS);

/**
 * 主题色候选画像：
 * 关键逻辑：每个主题色具备视觉值 + 生活气质说明，供本地和 AI 双端复用。
 */
const COLOR_THEME_PROFILES = [
  {
    key: "black",
    name: "曜石黑",
    hex: "#3E4350",
    vibe: "低噪、克制、有边界感",
    lifeHint: "适合把生活做减法，先稳节奏再提效率。",
  },
  {
    key: "blue",
    name: "深海蓝",
    hex: "#3F6ED8",
    vibe: "清醒、理性、有秩序感",
    lifeHint: "适合专注主线任务，用结构化方法持续推进。",
  },
  {
    key: "red",
    name: "赤焰红",
    hex: "#D94B5F",
    vibe: "主动、直接、行动力强",
    lifeHint: "适合先行动后优化，用执行力打开局面。",
  },
  {
    key: "green",
    name: "松柏绿",
    hex: "#41A577",
    vibe: "平和、恢复、长期主义",
    lifeHint: "适合重建稳定作息，让状态回暖后稳步发力。",
  },
  {
    key: "yellow",
    name: "日光黄",
    hex: "#D7A42F",
    vibe: "乐观、明亮、轻快外放",
    lifeHint: "适合主动创造正反馈，让好状态持续滚动。",
  },
  {
    key: "purple",
    name: "雾霭紫",
    hex: "#7D63C8",
    vibe: "感性、想象、灵感导向",
    lifeHint: "适合把灵感落成小作品，再逐步放大影响力。",
  },
  {
    key: "orange",
    name: "珊瑚橙",
    hex: "#DF7E45",
    vibe: "温度、烟火、连接感强",
    lifeHint: "适合通过社交协作获得机会，先连接再突破。",
  },
  {
    key: "white",
    name: "云朵白",
    hex: "#EAECEF",
    vibe: "轻盈、留白、松弛感高",
    lifeHint: "适合减压清理，把注意力留给真正重要的事。",
  },
];

/**
 * 创建零向量。
 * @returns {{ [key: string]: number }} 零向量对象。
 */
function createZeroVector() {
  return COLOR_DIMENSION_KEYS.reduce((accumulator, dimensionKey) => {
    accumulator[dimensionKey] = 0;
    return accumulator;
  }, {});
}

/**
 * 构建答卷摘要。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案 ID。
 * @returns {Array<object>} 结构化答卷摘要。
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
 * 将答卷摘要转为可读文本。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<string>} 摘要文本列表。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 计算颜色原始分值。
 * 复杂度评估：O(Q * D)
 * Q 为题量，D 为颜色维度数（固定 8）。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {{ [key: string]: number }} 颜色原始分值映射。
 */
function buildColorScoreMap(questions, answerIds) {
  const rawScoreMap = createZeroVector();

  questions.forEach((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    if (!selectedOption) {
      return;
    }

    const questionWeight = Number(questionItem.weight ?? 1);

    Object.entries(selectedOption.vector ?? {}).forEach(([colorKey, rawValue]) => {
      if (typeof rawScoreMap[colorKey] !== "number") {
        return;
      }

      const safeValue = Number(rawValue ?? 0);
      if (!Number.isFinite(safeValue)) {
        return;
      }

      // 关键逻辑：选项向量 * 题目权重，保证关键题影响力更高。
      rawScoreMap[colorKey] += safeValue * questionWeight;
    });
  });

  return rawScoreMap;
}

/**
 * 限制分值到 [0, 100]。
 * @param {number} score 原始分值。
 * @returns {number} 合法分值。
 */
function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 从颜色分值映射构建排序榜单。
 * 复杂度评估：O(C log C)
 * C 为候选颜色数量（固定 8）。
 * @param {{ [key: string]: number }} colorScoreMap 颜色原始分值映射。
 * @returns {Array<object>} 排序后的颜色榜单。
 */
function buildScoredColors(colorScoreMap) {
  const topRawScore = Math.max(
    1,
    ...Object.values(colorScoreMap).map((rawScore) => Number(rawScore) || 0),
  );

  return COLOR_THEME_PROFILES.map((colorItem) => {
    const rawScore = Number(colorScoreMap[colorItem.key] ?? 0);
    return {
      ...colorItem,
      rawScore,
      score: clampScore((rawScore / topRawScore) * 100),
    };
  }).sort((leftItem, rightItem) => {
    const scoreDiff = rightItem.score - leftItem.score;
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return rightItem.rawScore - leftItem.rawScore;
  });
}

/**
 * 提取 Top3 颜色描述。
 * @param {Array<object>} scoredColors 颜色榜单。
 * @returns {Array<string>} Top3 颜色中文标签。
 */
function resolveTopDimensionLabels(scoredColors) {
  return scoredColors
    .slice(0, 3)
    .map((colorItem) => COLOR_DIMENSION_LABELS[colorItem.key] ?? colorItem.name);
}

/**
 * 构建本地叙事。
 * @param {object} topColor 主主题色。
 * @param {Array<object>} scoredColors 颜色榜单。
 * @returns {string} 本地叙事文本。
 */
function buildLocalNarrative(topColor, scoredColors) {
  const topDimensionLabels = resolveTopDimensionLabels(scoredColors);
  return `你在 2026 的主题色更接近「${topColor.name}」。你当前更偏向${topDimensionLabels.join("、")}这组状态。${topColor.lifeHint}`;
}

/**
 * 2026 主题色本地分析。
 * 复杂度评估：
 * 1. 原始分值计算：O(Q * D)
 * 2. 颜色排序：O(C log C)
 * 总体复杂度：O(Q * D + C log C)
 * 其中：Q 为题量（单轮 10~15），D=8，C=8。
 * @param {object} params 参数对象。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @returns {{ topColor: object, topThree: Array<object>, scoredColors: Array<object>, colorScoreMap: object, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string }} 本地分析结果。
 */
export function analyzeColor2026Locally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const colorScoreMap = buildColorScoreMap(questions, answerIds);
  const scoredColors = buildScoredColors(colorScoreMap);

  const topColor = scoredColors[0];
  const topThree = scoredColors.slice(0, 3);

  return {
    topColor,
    topThree,
    scoredColors,
    colorScoreMap,
    answerSummary,
    summaryLines,
    localNarrative: buildLocalNarrative(topColor, scoredColors),
  };
}
