import { analyzeMbtiLocally } from "./mbtiAnalyzer";
import { getTypeologyQuestionPool } from "../data/typeologyCatalog";
import { selectRandomQuestionsWithoutRepeat } from "../utils/randomQuestionSelector";

/**
 * 限制百分比分值到 [0, 100]。
 * @param {number} rawScore 原始分值。
 * @returns {number} 合法百分比分值。
 */
function clampPercentage(rawScore) {
  if (!Number.isFinite(rawScore)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * 解析测试模式：
 * 关键逻辑：若 modeKey 非法则回退到第一个模式，保证流程稳定可执行。
 * @param {object} testConfig 测试配置对象。
 * @param {string} modeKey 模式键。
 * @returns {{ key: string, label: string, baseCount: number }} 模式对象。
 */
export function resolveModeConfig(testConfig, modeKey) {
  const modeList = Array.isArray(testConfig?.modes) ? testConfig.modes : [];
  const matchedMode = modeList.find((modeItem) => modeItem.key === modeKey);
  return matchedMode ?? modeList[0];
}

/**
 * 计算固定题量区间。
 * 复杂度评估：O(1)。
 * @param {number} baseCount 模式基础题量。
 * @param {number} poolSize 题库总量。
 * @returns {{ minCount: number, maxCount: number }} 固定题量区间（min=max）。
 */
export function resolveFixedQuestionRange(baseCount, poolSize) {
  const safePoolSize = Math.max(0, Math.floor(poolSize));
  const safeBaseCount = Math.max(1, Math.floor(baseCount));

  if (safePoolSize === 0) {
    return { minCount: 0, maxCount: 0 };
  }

  const fixedCount = Math.min(safeBaseCount, safePoolSize);
  return {
    minCount: fixedCount,
    maxCount: fixedCount,
  };
}

/**
 * 构建单次测试会话题集。
 * 复杂度评估：
 * 1. 题库读取：缓存命中 O(1)，首次生成见 catalog 中定义。
 * 2. 抽题：O(N)，N 为题库数量（去重 + 洗牌）。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {string} params.modeKey 模式键。
 * @returns {{ modeConfig: object, questionRange: { minCount: number, maxCount: number }, questions: Array<object> }} 会话题集。
 */
export function buildTypeologyTestSession({ testConfig, modeKey }) {
  const modeConfig = resolveModeConfig(testConfig, modeKey);
  const questionPool = getTypeologyQuestionPool(testConfig?.key);
  const questionRange = resolveFixedQuestionRange(
    modeConfig?.baseCount ?? 0,
    questionPool.length,
  );

  const selectedQuestions = selectRandomQuestionsWithoutRepeat({
    questions: questionPool,
    minCount: questionRange.minCount,
    maxCount: questionRange.maxCount,
  });

  return {
    modeConfig,
    questionRange,
    questions: selectedQuestions,
  };
}

/**
 * 构建答卷摘要对象。
 * @param {Array<object>} selectedQuestions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {Array<object>} 摘要对象列表。
 */
function buildAnswerSummary(selectedQuestions, answerIds) {
  return selectedQuestions.map((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    return {
      questionId: questionItem.id,
      questionTitle: questionItem.title,
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      vector: selectedOption?.vector ?? {},
      weight: Number(questionItem.weight ?? 1),
    };
  });
}

/**
 * 将摘要对象转换为页面展示文本。
 * @param {Array<object>} answerSummary 摘要对象列表。
 * @returns {Array<string>} 文本行数组。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 九型三中心分组定义。
 * 关键逻辑：tritype 由三个中心（本能/情感/思维）各取一个高分类型组成。
 */
const ENNEAGRAM_TRIAD_MAP = {
  gut: ["e8", "e9", "e1"],
  heart: ["e2", "e3", "e4"],
  head: ["e5", "e6", "e7"],
};

/**
 * 九型本能维度列表。
 */
const ENNEAGRAM_INSTINCT_KEYS = ["sx", "so", "sp"];

/**
 * 九型主型默认本能优先序（用于同分兜底）。
 */
const ENNEAGRAM_CORE_INSTINCT_FALLBACK = {
  e1: ["sp", "so", "sx"],
  e2: ["so", "sx", "sp"],
  e3: ["so", "sp", "sx"],
  e4: ["sx", "so", "sp"],
  e5: ["sp", "sx", "so"],
  e6: ["sp", "so", "sx"],
  e7: ["sx", "sp", "so"],
  e8: ["sx", "so", "sp"],
  e9: ["sp", "so", "sx"],
};

/**
 * 九型到本能权重映射。
 * 关键逻辑：每次选择某个九型倾向时，同时给其典型本能维度增加小权重。
 */
const ENNEAGRAM_TYPE_INSTINCT_WEIGHT = {
  e1: { sp: 1, so: 0.7, sx: 0.3 },
  e2: { so: 1, sx: 0.8, sp: 0.3 },
  e3: { so: 1, sp: 0.7, sx: 0.5 },
  e4: { sx: 1, so: 0.7, sp: 0.4 },
  e5: { sp: 1, sx: 0.7, so: 0.4 },
  e6: { sp: 1, so: 0.8, sx: 0.5 },
  e7: { sx: 1, sp: 0.8, so: 0.5 },
  e8: { sx: 1, so: 0.8, sp: 0.5 },
  e9: { sp: 1, so: 0.8, sx: 0.4 },
};

/**
 * 本能关键词映射。
 * 复杂度评估：O(Q * K)，Q 为题量，K 为关键词数量。
 */
const ENNEAGRAM_INSTINCT_KEYWORD_MAP = {
  sx: [
    "亲密",
    "强烈",
    "深聊",
    "一对一",
    "吸引",
    "激情",
    "边界",
    "冲突",
    "表达",
    "突破",
  ],
  so: [
    "团队",
    "群体",
    "社交",
    "关系",
    "协作",
    "公开",
    "规则",
    "网络",
    "带队",
    "说服",
  ],
  sp: [
    "安全",
    "风险",
    "资源",
    "稳定",
    "计划",
    "独处",
    "琐事",
    "节奏",
    "备用",
    "长期",
  ],
};

/**
 * 解析九型 key 对应数字。
 * @param {string} typeKey 九型 key（如 e7）。
 * @returns {number} 九型数字。
 */
function resolveEnneagramNumber(typeKey) {
  const matched = String(typeKey ?? "").match(/\d+/);
  return matched ? Number(matched[0]) : 0;
}

/**
 * 比较九型分值项优先级。
 * @param {object|null|undefined} leftItem 左项。
 * @param {object|null|undefined} rightItem 右项。
 * @returns {number} 比较结果。
 */
function compareEnneagramScoreItem(leftItem, rightItem) {
  const leftRawScore = Number(leftItem?.rawScore ?? 0);
  const rightRawScore = Number(rightItem?.rawScore ?? 0);
  if (rightRawScore !== leftRawScore) {
    return rightRawScore - leftRawScore;
  }

  const leftScore = Number(leftItem?.score ?? 0);
  const rightScore = Number(rightItem?.score ?? 0);
  if (rightScore !== leftScore) {
    return rightScore - leftScore;
  }

  const leftNumber = resolveEnneagramNumber(leftItem?.key);
  const rightNumber = resolveEnneagramNumber(rightItem?.key);
  return leftNumber - rightNumber;
}

/**
 * 从九型分值榜中选择指定 key 列表的最优项。
 * @param {Map<string, object>} scoreItemMap 分值映射表。
 * @param {Array<string>} keyList 候选 key 列表。
 * @returns {object|null} 最优项。
 */
function pickBestEnneagramItem(scoreItemMap, keyList) {
  const candidateItems = keyList
    .map((typeKey) => scoreItemMap.get(typeKey))
    .filter(Boolean);

  if (candidateItems.length === 0) {
    return null;
  }

  return candidateItems.sort(compareEnneagramScoreItem)[0];
}

/**
 * 计算九型侧翼（wing）。
 * @param {Map<string, object>} scoreItemMap 分值映射表。
 * @param {string} coreKey 主型 key。
 * @returns {string} 侧翼 key。
 */
function resolveEnneagramWingKey(scoreItemMap, coreKey) {
  const coreNumber = resolveEnneagramNumber(coreKey);
  if (!coreNumber) {
    return "e0";
  }

  const leftWingNumber = coreNumber === 1 ? 9 : coreNumber - 1;
  const rightWingNumber = coreNumber === 9 ? 1 : coreNumber + 1;
  const leftWingItem = scoreItemMap.get(`e${leftWingNumber}`);
  const rightWingItem = scoreItemMap.get(`e${rightWingNumber}`);

  if (!leftWingItem && !rightWingItem) {
    return `e${rightWingNumber}`;
  }

  if (!leftWingItem) {
    return `e${rightWingNumber}`;
  }

  if (!rightWingItem) {
    return `e${leftWingNumber}`;
  }

  const comparedResult = compareEnneagramScoreItem(leftWingItem, rightWingItem);
  // 关键逻辑：同分时优先右侧翼，输出更稳定（如 7w8）。
  return comparedResult <= 0 ? `e${rightWingNumber}` : `e${leftWingNumber}`;
}

/**
 * 计算九型 tritype（三型组合）。
 * @param {Map<string, object>} scoreItemMap 分值映射表。
 * @param {string} coreKey 主型 key。
 * @returns {string} 三型组合（如 783）。
 */
function resolveEnneagramTritype(scoreItemMap, coreKey) {
  const coreNumber = resolveEnneagramNumber(coreKey);
  if (!coreNumber) {
    return "000";
  }

  const triadEntries = Object.entries(ENNEAGRAM_TRIAD_MAP);
  const coreTriadEntry = triadEntries.find(([, keyList]) => keyList.includes(coreKey));
  const coreTriadName = coreTriadEntry?.[0] ?? "";

  const pickedItems = [scoreItemMap.get(coreKey)].filter(Boolean);
  triadEntries.forEach(([triadName, keyList]) => {
    if (triadName === coreTriadName) {
      return;
    }

    const bestItem = pickBestEnneagramItem(scoreItemMap, keyList);
    if (bestItem) {
      pickedItems.push(bestItem);
    }
  });

  const uniqueItems = [];
  const usedKeySet = new Set();
  pickedItems.forEach((item) => {
    if (!item?.key || usedKeySet.has(item.key)) {
      return;
    }
    usedKeySet.add(item.key);
    uniqueItems.push(item);
  });

  const coreItem = uniqueItems.find((item) => item.key === coreKey);
  const otherItems = uniqueItems
    .filter((item) => item.key !== coreKey)
    .sort(compareEnneagramScoreItem);

  const orderedItems = [coreItem, ...otherItems].filter(Boolean);
  return orderedItems
    .map((item) => resolveEnneagramNumber(item.key))
    .join("")
    .slice(0, 3);
}

/**
 * 从单题摘要中提取被选中的九型 key。
 * @param {object} summaryItem 单题摘要。
 * @returns {string|null} 九型 key。
 */
function resolveSelectedEnneagramKey(summaryItem) {
  const vectorEntries = Object.entries(summaryItem?.vector ?? {}).filter(([vectorKey]) =>
    /^e[1-9]$/.test(vectorKey),
  );
  if (vectorEntries.length === 0) {
    return null;
  }

  const sortedEntries = vectorEntries.sort(
    (leftEntry, rightEntry) => Number(rightEntry[1] ?? 0) - Number(leftEntry[1] ?? 0),
  );
  return sortedEntries[0][0] ?? null;
}

/**
 * 计算九型本能分值。
 * 复杂度评估：O(Q * K)，Q 为作答题量，K 为关键词规模。
 * @param {Array<object>} answerSummary 答卷摘要。
 * @param {string} coreKey 主型 key。
 * @returns {{ scores: Record<string, number>, fallbackOrder: Array<string> }} 本能分值与兜底序列。
 */
function buildEnneagramInstinctScore(answerSummary, coreKey) {
  const instinctScoreMap = {
    sx: 0,
    so: 0,
    sp: 0,
  };

  answerSummary.forEach((summaryItem) => {
    const selectedTypeKey = resolveSelectedEnneagramKey(summaryItem);
    if (selectedTypeKey && ENNEAGRAM_TYPE_INSTINCT_WEIGHT[selectedTypeKey]) {
      const typeWeight = ENNEAGRAM_TYPE_INSTINCT_WEIGHT[selectedTypeKey];
      ENNEAGRAM_INSTINCT_KEYS.forEach((instinctKey) => {
        instinctScoreMap[instinctKey] += Number(typeWeight[instinctKey] ?? 0);
      });
    }

    const searchableText = `${summaryItem.questionTitle} ${summaryItem.optionLabel}`.toLowerCase();
    ENNEAGRAM_INSTINCT_KEYS.forEach((instinctKey) => {
      ENNEAGRAM_INSTINCT_KEYWORD_MAP[instinctKey].forEach((keyword) => {
        if (searchableText.includes(keyword.toLowerCase())) {
          instinctScoreMap[instinctKey] += 1;
        }
      });
    });
  });

  const fallbackOrder = ENNEAGRAM_CORE_INSTINCT_FALLBACK[coreKey] ?? ["sp", "so", "sx"];
  fallbackOrder.forEach((instinctKey, orderIndex) => {
    instinctScoreMap[instinctKey] += (fallbackOrder.length - orderIndex) * 0.18;
  });

  return {
    scores: instinctScoreMap,
    fallbackOrder,
  };
}

/**
 * 解析九型本能堆叠（如 SX/SO）。
 * @param {Array<object>} answerSummary 答卷摘要。
 * @param {string} coreKey 主型 key。
 * @returns {string} 本能堆叠文本。
 */
function resolveEnneagramInstinctStack(answerSummary, coreKey) {
  const { scores, fallbackOrder } = buildEnneagramInstinctScore(answerSummary, coreKey);

  const rankedInstincts = [...ENNEAGRAM_INSTINCT_KEYS].sort((leftKey, rightKey) => {
    const scoreDiff = Number(scores[rightKey] ?? 0) - Number(scores[leftKey] ?? 0);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return fallbackOrder.indexOf(leftKey) - fallbackOrder.indexOf(rightKey);
  });

  return `${rankedInstincts[0].toUpperCase()}/${rankedInstincts[1].toUpperCase()}`;
}

/**
 * 执行九型人格专用分析。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {object} params.modeConfig 模式配置。
 * @param {Array<object>} params.selectedQuestions 本轮题目。
 * @param {Array<object>} params.answerSummary 答卷摘要对象。
 * @param {Array<string>} params.summaryLines 答卷摘要文本行。
 * @param {Array<object>} params.scoreBoard 分值榜。
 * @returns {object} 九型专用结果。
 */
function analyzeEnneagramTypeology({
  testConfig,
  modeConfig,
  selectedQuestions,
  answerSummary,
  summaryLines,
  scoreBoard,
}) {
  const scoreItemMap = new Map(scoreBoard.map((item) => [item.key, item]));
  const mainRank = scoreBoard[0];
  const topThree = scoreBoard.slice(0, 3);

  const coreKey = mainRank?.key ?? "e0";
  const coreNumber = resolveEnneagramNumber(coreKey);
  const wingKey = resolveEnneagramWingKey(scoreItemMap, coreKey);
  const wingNumber = resolveEnneagramNumber(wingKey);
  const tritypeCode = resolveEnneagramTritype(scoreItemMap, coreKey);
  const instinctStack = resolveEnneagramInstinctStack(answerSummary, coreKey);
  const resultCode = `${coreNumber}w${wingNumber} ${tritypeCode} ${instinctStack}`;

  const mainResult = {
    key: coreKey,
    label: resultCode,
    score: mainRank?.score ?? 0,
    summary: `主型为 ${mainRank?.label ?? `${coreNumber}号`}，侧翼为 ${coreNumber}w${wingNumber}，三型组合为 ${tritypeCode}，本能堆叠为 ${instinctStack}。`,
    tags: [
      `主型：${mainRank?.label ?? `${coreNumber}号`}`,
      `侧翼：${coreNumber}w${wingNumber}`,
      `三型：${tritypeCode}`,
      `本能：${instinctStack}`,
    ],
    actions: [
      "把压力场景和松弛场景分别记录，观察主型波动。",
      "针对侧翼特征做一周微调实验，验证行为变化。",
      "在关键关系和关键任务中分别复盘本能堆叠带来的影响。",
    ],
  };

  return {
    testKey: testConfig.key,
    testName: testConfig.name,
    modeKey: modeConfig.key,
    modeLabel: modeConfig.label,
    questionCount: selectedQuestions.length,
    completedAt: Date.now(),
    source: "local",
    displayValue: `${coreNumber}w${wingNumber}`,
    mainResult,
    topThree: topThree.map((item) => ({
      key: item.key,
      label: item.label,
      score: item.score,
    })),
    scoreBoard,
    summaryLines,
    insight: `你的九型结果为 ${resultCode}。核心动机更接近「${mainRank?.label ?? "未知类型"}」，建议结合近期真实场景持续观察，不把一次结果视为固定结论。`,
    detailTags: mainResult.tags,
    detailActions: mainResult.actions,
    enneagramProfile: {
      code: resultCode,
      coreKey,
      coreNumber,
      wingKey,
      wingNumber,
      tritype: tritypeCode,
      instinctStack,
    },
  };
}

/**
 * 生成卡片展示值。
 * @param {string} label 主结果标签。
 * @param {string} key 主结果键。
 * @returns {string} 卡片展示值。
 */
function resolveDisplayValue(label, key) {
  const normalizedLabel = String(label ?? "").trim();
  const normalizedKey = String(key ?? "").trim().toUpperCase();

  if (normalizedLabel.includes("·")) {
    return normalizedLabel.split("·")[0].trim().slice(0, 8);
  }

  if (normalizedKey.length >= 2 && normalizedKey.length <= 8) {
    return normalizedKey;
  }

  return normalizedLabel.slice(0, 8) || "未完成";
}

/**
 * 构建通用测试本地叙事文案。
 * @param {object} params 参数对象。
 * @param {string} params.testName 测试名称。
 * @param {object} params.mainResult 主结果。
 * @param {Array<object>} params.topThree Top3。
 * @returns {string} 本地叙事文案。
 */
function buildGenericNarrative({ testName, mainResult, topThree }) {
  const secondResult = topThree[1]?.label ?? "无";
  const thirdResult = topThree[2]?.label ?? "无";

  return [
    `在「${testName}」中，你当前最匹配的是「${mainResult.label}」。`,
    `次高匹配分别是「${secondResult}」「${thirdResult}」。`,
    "结果更适合用于认识自己的稳定偏好，不建议作为能力上限判断。",
  ].join("");
}

/**
 * 计算通用测试分值榜。
 * 复杂度评估：
 * 1. 累加答案向量：O(Q * K)，Q 为题量，K 为每题向量键数量（通常很小）。
 * 2. 排序：O(R log R)，R 为结果类型数量。
 * @param {Array<object>} selectedQuestions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案。
 * @param {Array<object>} outcomes 结果候选列表。
 * @returns {Array<object>} 排序后的分值榜。
 */
function buildGenericScoreBoard(selectedQuestions, answerIds, outcomes) {
  const rawScoreMap = outcomes.reduce((accumulator, outcomeItem) => {
    accumulator[outcomeItem.key] = 0;
    return accumulator;
  }, {});

  selectedQuestions.forEach((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );
    const questionWeight = Number(questionItem.weight ?? 1);
    const optionVector = selectedOption?.vector ?? {};

    // 关键逻辑：每个选项允许贡献到多个结果维度，支持后续复杂题型扩展。
    Object.keys(optionVector).forEach((vectorKey) => {
      const vectorValue = Number(optionVector[vectorKey] ?? 0);
      if (!Number.isFinite(vectorValue)) {
        return;
      }

      if (typeof rawScoreMap[vectorKey] !== "number") {
        rawScoreMap[vectorKey] = 0;
      }

      rawScoreMap[vectorKey] += vectorValue * questionWeight;
    });
  });

  const topRawScore = Math.max(
    1,
    ...Object.values(rawScoreMap).map((scoreItem) => Number(scoreItem) || 0),
  );

  return outcomes
    .map((outcomeItem) => {
      const rawScore = Number(rawScoreMap[outcomeItem.key] ?? 0);
      return {
        key: outcomeItem.key,
        label: outcomeItem.label,
        rawScore,
        score: clampPercentage((rawScore / topRawScore) * 100),
        summary: outcomeItem.summary,
        tags: outcomeItem.tags ?? [],
        actions: outcomeItem.actions ?? [],
      };
    })
    .sort((leftItem, rightItem) => {
      const scoreDiff = rightItem.score - leftItem.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const rawScoreDiff = rightItem.rawScore - leftItem.rawScore;
      if (rawScoreDiff !== 0) {
        return rawScoreDiff;
      }

      return String(leftItem.key).localeCompare(String(rightItem.key), "zh-Hans-CN");
    });
}

/**
 * 执行 MBTI 本地分析并转换为统一结构。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {Array<object>} params.selectedQuestions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @param {object} params.modeConfig 模式配置。
 * @returns {object} 统一本地结果。
 */
function analyzeMbtiAsTypeology({
  testConfig,
  selectedQuestions,
  answerIds,
  modeConfig,
}) {
  const mbtiLocalResult = analyzeMbtiLocally({
    questions: selectedQuestions,
    answerIds,
  });

  const scoreBoard = mbtiLocalResult.scoredTypes.map((typeItem) => ({
    key: typeItem.type,
    label: `${typeItem.type} · ${typeItem.title}`,
    rawScore: typeItem.score,
    score: typeItem.score,
    summary: `${typeItem.type} 在当前作答中匹配度为 ${typeItem.score}%。`,
    tags: [],
    actions: [],
  }));

  const mainResult = {
    key: mbtiLocalResult.topType.type,
    label: `${mbtiLocalResult.topType.type} · ${mbtiLocalResult.topType.title}`,
    score: mbtiLocalResult.topType.score,
    summary: mbtiLocalResult.localNarrative,
    tags: mbtiLocalResult.axisSummaryLines.slice(0, 3),
    actions: [
      "将你的高匹配优势放到核心任务中持续复用。",
      "每周做一次反向维度练习，避免类型固化。",
      "把协作偏好写成沟通约定，降低误解成本。",
    ],
  };

  return {
    testKey: testConfig.key,
    testName: testConfig.name,
    modeKey: modeConfig.key,
    modeLabel: modeConfig.label,
    questionCount: selectedQuestions.length,
    completedAt: Date.now(),
    source: "local",
    displayValue: mbtiLocalResult.topType.type,
    mainResult,
    topThree: mbtiLocalResult.topThree.map((typeItem) => ({
      key: typeItem.type,
      label: `${typeItem.type} · ${typeItem.title}`,
      score: typeItem.score,
    })),
    scoreBoard,
    summaryLines: mbtiLocalResult.summaryLines,
    insight: mbtiLocalResult.localNarrative,
    detailTags: mbtiLocalResult.axisSummaryLines,
    detailActions: [
      "使用优势维度处理关键决策，提升稳定表现。",
      "在低分维度做刻意练习，增强适应弹性。",
      "结合实际场景复盘，避免把类型当成固定标签。",
    ],
    mbtiLocalResult,
  };
}

/**
 * 执行通用测试本地分析。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {Array<object>} params.selectedQuestions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @param {object} params.modeConfig 模式配置。
 * @returns {object} 统一本地结果。
 */
function analyzeGenericTypeology({
  testConfig,
  selectedQuestions,
  answerIds,
  modeConfig,
}) {
  const scoreBoard = buildGenericScoreBoard(
    selectedQuestions,
    answerIds,
    testConfig.outcomes ?? [],
  );

  const mainRank = scoreBoard[0];
  const topThree = scoreBoard.slice(0, 3);
  const answerSummary = buildAnswerSummary(selectedQuestions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);

  if (testConfig?.key === "enneagram") {
    return analyzeEnneagramTypeology({
      testConfig,
      modeConfig,
      selectedQuestions,
      answerSummary,
      summaryLines,
      scoreBoard,
    });
  }

  const mainResult = {
    key: mainRank?.key ?? "unknown",
    label: mainRank?.label ?? "未匹配",
    score: mainRank?.score ?? 0,
    summary: mainRank?.summary ?? "当前作答暂未形成有效匹配。",
    tags: mainRank?.tags ?? [],
    actions: mainRank?.actions ?? [],
  };

  return {
    testKey: testConfig.key,
    testName: testConfig.name,
    modeKey: modeConfig.key,
    modeLabel: modeConfig.label,
    questionCount: selectedQuestions.length,
    completedAt: Date.now(),
    source: "local",
    displayValue: resolveDisplayValue(mainResult.label, mainResult.key),
    mainResult,
    topThree: topThree.map((item) => ({
      key: item.key,
      label: item.label,
      score: item.score,
    })),
    scoreBoard,
    summaryLines,
    insight: buildGenericNarrative({
      testName: testConfig.name,
      mainResult,
      topThree,
    }),
    detailTags: mainResult.tags,
    detailActions: mainResult.actions,
  };
}

/**
 * 统一测试本地分析入口。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {Array<object>} params.selectedQuestions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @param {object} params.modeConfig 模式配置。
 * @returns {object} 统一本地结果。
 */
export function analyzeTypeologyLocally({
  testConfig,
  selectedQuestions,
  answerIds,
  modeConfig,
}) {
  if (testConfig?.key === "mbti") {
    return analyzeMbtiAsTypeology({
      testConfig,
      selectedQuestions,
      answerIds,
      modeConfig,
    });
  }

  return analyzeGenericTypeology({
    testConfig,
    selectedQuestions,
    answerIds,
    modeConfig,
  });
}
