/**
 * 恋爱脑阶段标签定义：
 * 1. key 与题库 option.stage 对齐。
 * 2. color 用于结果页分布图与海报渲染。
 */
const LOVE_BRAIN_STAGE_META = {
  clear: {
    key: "clear",
    name: "清醒",
    color: "#2EAA8D",
  },
  heady: {
    key: "heady",
    name: "上头",
    color: "#F59D3E",
  },
  late: {
    key: "late",
    name: "晚期",
    color: "#F06A82",
  },
};

/**
 * 恋爱脑指数统一满分。
 */
const LOVE_BRAIN_FULL_SCORE = 140;

/**
 * 分段规则：
 * 1. 区间按需求文档固定，不做动态推导。
 * 2. 每段提供名称、核心标签与扎心文案，供页面和长图复用。
 */
const LOVE_BRAIN_LEVEL_RULES = [
  {
    key: "iron-heart",
    min: 0,
    max: 30,
    levelName: "铁石心肠高端玩家",
    title: "封心锁爱",
    coreTag: "高端玩家",
    piercingLine:
      "你不是在谈恋爱，你是在选妃。男人/女人只会影响你赚钱。",
    actionTips: [
      "保持边界感是优势，但也别把所有情绪都压成“无所谓”。",
      "遇到真诚关系时，尝试给对方一次稳定沟通窗口。",
      "每周记录一次“我真实在意什么”，避免长期情感钝化。",
    ],
  },
  {
    key: "clear-observer",
    min: 31,
    max: 70,
    levelName: "人间清醒观察者",
    title: "智商在线",
    coreTag: "拿得起放得下",
    piercingLine:
      "拿得起放得下，懂浪漫但也懂及时止损。你是恋爱中的成年人。",
    actionTips: [
      "继续保留理性判断，同时给关系留出温度表达。",
      "把“我没事”替换成具体需求，减少无效猜测。",
      "当关系卡住时，先谈事实，再谈感受与期待。",
    ],
  },
  {
    key: "pure-love",
    min: 71,
    max: 100,
    levelName: "纯爱战士",
    title: "王宝钏分钏野菜预备役",
    coreTag: "爱很厚重",
    piercingLine:
      "你的爱很厚重，但往往感动的只有你自己。小心最后只剩野菜。",
    actionTips: [
      "投入前先确认对方是否给出同等反馈与行动。",
      "减少“自我脑补”，增加“事实核对 + 明确提问”。",
      "把时间分配回收给自己，避免关系占满全部生活。",
    ],
  },
  {
    key: "max-brain",
    min: 101,
    max: 140,
    levelName: "顶级大冤种",
    title: "恋爱脑天花板",
    coreTag: "脑里全是水",
    piercingLine:
      "建议直接去长白山种野菜，或者把脑子捐给有需要的人。",
    actionTips: [
      "先暂停高风险投入，给自己至少 72 小时冷静窗口。",
      "出现贬低/操控/反复拉扯时，优先撤离再复盘。",
      "建立“朋友监督机制”，重大决定先过第三方现实检查。",
    ],
  },
];

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
 * 限制分值在指定范围。
 * @param {number} score 原始分值。
 * @param {number} min 最小值。
 * @param {number} max 最大值。
 * @returns {number} 限制后的分值。
 */
function clampScore(score, min, max) {
  return Math.max(min, Math.min(max, Math.round(toSafeNumber(score, min))));
}

/**
 * 将任意题量结果标准化到 140 满分。
 * 关键逻辑：支持 13/14 题随机场景，保持等级区间稳定可比。
 * @param {number} rawScore 原始得分。
 * @param {number} maxRawScore 原始满分。
 * @returns {number} 标准化后的 0~140 分。
 */
function normalizeScoreToFull(rawScore, maxRawScore) {
  const safeRawScore = Math.max(0, toSafeNumber(rawScore, 0));
  const safeMaxRawScore = Math.max(1, toSafeNumber(maxRawScore, 1));
  return clampScore((safeRawScore / safeMaxRawScore) * LOVE_BRAIN_FULL_SCORE, 0, LOVE_BRAIN_FULL_SCORE);
}

/**
 * 根据指数命中等级规则。
 * @param {number} normalizedScore 标准化指数。
 * @returns {object} 等级配置。
 */
function resolveLevelRule(normalizedScore) {
  const safeScore = clampScore(normalizedScore, 0, LOVE_BRAIN_FULL_SCORE);

  const matchedRule = LOVE_BRAIN_LEVEL_RULES.find(
    (ruleItem) => safeScore >= ruleItem.min && safeScore <= ruleItem.max,
  );

  return matchedRule ?? LOVE_BRAIN_LEVEL_RULES[LOVE_BRAIN_LEVEL_RULES.length - 1];
}

/**
 * 构建结构化答卷摘要。
 * 复杂度评估：O(Q * O)
 * Q 为题量，O 为单题选项数（本题库固定为 3）。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 答案列表。
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
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      tier: selectedOption?.tier ?? "-",
      stage: selectedOption?.stage ?? "clear",
      score: toSafeNumber(selectedOption?.score, 0),
    };
  });
}

/**
 * 构建答卷摘要文本。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<string>} 摘要文本。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 统计作答阶段分布。
 * 复杂度评估：O(Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<{ key: string, name: string, score: number, color: string }>} 阶段分布。
 */
function buildStageDistribution(answerSummary) {
  const stageCountMap = {
    clear: 0,
    heady: 0,
    late: 0,
  };

  answerSummary.forEach((summaryItem) => {
    if (!summaryItem.optionId) {
      return;
    }

    if (typeof stageCountMap[summaryItem.stage] !== "number") {
      return;
    }

    stageCountMap[summaryItem.stage] += 1;
  });

  const answeredCount = Object.values(stageCountMap).reduce(
    (sum, currentValue) => sum + currentValue,
    0,
  );

  return Object.values(LOVE_BRAIN_STAGE_META).map((stageMeta) => {
    const stageCount = stageCountMap[stageMeta.key] ?? 0;
    const stagePercent = answeredCount > 0 ? (stageCount / answeredCount) * 100 : 0;

    return {
      key: stageMeta.key,
      name: stageMeta.name,
      color: stageMeta.color,
      score: clampScore(stagePercent, 0, 100),
      count: stageCount,
    };
  });
}

/**
 * 选出最高风险场景 TopN。
 * 复杂度评估：O(Q log Q)
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @param {number} [topN=3] 返回数量。
 * @returns {Array<{ name: string, score: number, optionLabel: string }>} Top 列表。
 */
function buildTopRiskScenarios(answerSummary, topN = 3) {
  const safeTopN = Math.max(1, Math.floor(toSafeNumber(topN, 3)));

  return answerSummary
    .filter((summaryItem) => Boolean(summaryItem.optionId))
    .map((summaryItem) => ({
      name: summaryItem.questionTitle,
      score: clampScore(summaryItem.score * 10, 0, 100),
      optionLabel: summaryItem.optionLabel,
      rawScore: summaryItem.score,
    }))
    .sort((leftItem, rightItem) => {
      const scoreDiff = rightItem.rawScore - leftItem.rawScore;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return String(leftItem.name).localeCompare(String(rightItem.name), "zh-Hans-CN");
    })
    .slice(0, safeTopN)
    .map(({ rawScore, ...restItem }) => restItem);
}

/**
 * 构建本地解读文案。
 * @param {object} params 入参。
 * @param {number} params.normalizedScore 标准化指数。
 * @param {object} params.levelRule 命中的等级规则。
 * @returns {string} 解读文案。
 */
function buildLocalNarrative({ normalizedScore, levelRule }) {
  return [
    `标准化恋爱脑指数为 ${normalizedScore}/${LOVE_BRAIN_FULL_SCORE}。`,
    `判定等级：${levelRule.levelName}（${levelRule.title}）。`,
    levelRule.piercingLine,
  ].join(" ");
}

/**
 * 计算恋爱脑指数本地结果。
 * 复杂度评估：O(Q * O + Q log Q)
 * 1. 选项查找与分值汇总 O(Q * O)。
 * 2. Top 风险场景排序 O(Q log Q)。
 * @param {object} params 分析参数。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 对应答案。
 * @returns {{ score: number, rawScore: number, maxRawScore: number, answeredCount: number, levelRule: object, stageDistribution: Array<object>, topRiskScenarios: Array<object>, summaryLines: Array<string>, answerSummary: Array<object>, localNarrative: string, actionTips: Array<string>, posterModel: object }} 本地分析结果。
 */
export function analyzeLoveBrainLocally({ questions, answerIds }) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const normalizedAnswerIds = Array.isArray(answerIds) ? answerIds : [];

  const answerSummary = buildAnswerSummary(normalizedQuestions, normalizedAnswerIds);
  const summaryLines = buildSummaryLines(answerSummary);

  const rawScore = answerSummary.reduce(
    (sum, summaryItem) => sum + toSafeNumber(summaryItem.score, 0),
    0,
  );

  // 关键逻辑：每题满分固定为 10，13/14 题都统一映射到 140 满分区间。
  const maxRawScore = normalizedQuestions.length * 10;
  const normalizedScore = normalizeScoreToFull(rawScore, maxRawScore);
  const answeredCount = answerSummary.filter((summaryItem) => Boolean(summaryItem.optionId)).length;

  const levelRule = resolveLevelRule(normalizedScore);
  const stageDistribution = buildStageDistribution(answerSummary);
  const topRiskScenarios = buildTopRiskScenarios(answerSummary, 3);
  const localNarrative = buildLocalNarrative({
    normalizedScore,
    levelRule,
  });

  return {
    score: normalizedScore,
    rawScore,
    maxRawScore,
    answeredCount,
    levelRule,
    stageDistribution,
    topRiskScenarios,
    summaryLines,
    answerSummary,
    localNarrative,
    actionTips: levelRule.actionTips,
    posterModel: {
      // 关键逻辑：显式标记为 HTML-to-Image 渲染模式，交给通用引擎分流处理。
      renderMode: "html-love-brain",
      downloadFilePrefix: "love-brain-index",
      headline: "恋爱脑指数长图",
      indexScore: normalizedScore,
      levelName: levelRule.levelName,
      levelTitle: levelRule.title,
      coreTag: levelRule.coreTag,
      piercingLine: levelRule.piercingLine,
      narrative: localNarrative,
      stageDistribution,
      topRiskScenarios,
    },
  };
}
