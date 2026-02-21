/**
 * 生成闭区间随机整数。
 * @param {number} min 最小值（包含）。
 * @param {number} max 最大值（包含）。
 * @returns {number} 随机整数。
 */
function randomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 规范化抽题数量区间。
 * @param {number} poolSize 题库数量。
 * @param {number} minCount 最小抽题数。
 * @param {number} maxCount 最大抽题数。
 * @returns {{ resolvedMin: number, resolvedMax: number }} 合法区间。
 */
function normalizeCountRange(poolSize, minCount, maxCount) {
  const safePoolSize = Math.max(0, Math.floor(poolSize));
  const normalizedMin = Math.max(1, Math.floor(minCount));
  const normalizedMax = Math.max(normalizedMin, Math.floor(maxCount));

  if (safePoolSize === 0) {
    return { resolvedMin: 0, resolvedMax: 0 };
  }

  return {
    resolvedMin: Math.min(normalizedMin, safePoolSize),
    resolvedMax: Math.min(normalizedMax, safePoolSize),
  };
}

/**
 * 对题库按 id 去重：
 * 关键逻辑：若后续题库接入出现重复 id，优先保留首次出现项，避免抽题重复。
 * @param {Array<object>} questions 原始题库。
 * @returns {Array<object>} 去重后题库。
 */
function dedupeQuestionsById(questions) {
  const seenIdSet = new Set();
  const dedupedQuestions = [];

  questions.forEach((questionItem) => {
    const questionId = String(questionItem?.id ?? "");
    if (!questionId || seenIdSet.has(questionId)) {
      return;
    }

    seenIdSet.add(questionId);
    dedupedQuestions.push(questionItem);
  });

  return dedupedQuestions;
}

/**
 * 归一化题干文本：
 * 关键逻辑：仅做轻量 trim，避免误伤真实不同语义题目。
 * @param {string} rawTitle 原始题干。
 * @returns {string} 归一化题干。
 */
function normalizeQuestionTitle(rawTitle) {
  return String(rawTitle ?? "").trim();
}

/**
 * 对题库按题干去重：
 * 关键逻辑：同一轮测试不允许出现“完全相同题干”，优先保留首次出现项。
 * @param {Array<object>} questions 原始题库。
 * @returns {Array<object>} 题干去重后的题库。
 */
function dedupeQuestionsByTitle(questions) {
  const seenTitleSet = new Set();
  const dedupedQuestions = [];

  questions.forEach((questionItem) => {
    const normalizedTitle = normalizeQuestionTitle(questionItem?.title);
    if (!normalizedTitle || seenTitleSet.has(normalizedTitle)) {
      return;
    }

    seenTitleSet.add(normalizedTitle);
    dedupedQuestions.push(questionItem);
  });

  return dedupedQuestions;
}

/**
 * 原地洗牌（Fisher-Yates）。
 * @param {Array<object>} sourceArray 输入数组。
 * @returns {Array<object>} 洗牌后的新数组。
 */
function shuffleQuestions(sourceArray) {
  const shuffledQuestions = [...sourceArray];

  // 关键逻辑：Fisher-Yates 无偏洗牌，确保抽题分布均匀且无重复。
  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = randomIntInclusive(0, index);
    const temp = shuffledQuestions[index];
    shuffledQuestions[index] = shuffledQuestions[randomIndex];
    shuffledQuestions[randomIndex] = temp;
  }

  return shuffledQuestions;
}

/**
 * 无重复随机抽题。
 * 复杂度评估：
 * 1. 去重：O(N)
 * 2. Fisher-Yates 洗牌：O(N)
 * 3. 切片取前 K：O(K)
 * 总体复杂度：O(N)
 * @param {object} params 抽题参数。
 * @param {Array<object>} params.questions 完整题库。
 * @param {number} [params.minCount=10] 最小抽题数。
 * @param {number} [params.maxCount=15] 最大抽题数。
 * @returns {Array<object>} 本次测试题目列表（无重复）。
 */
export function selectRandomQuestionsWithoutRepeat({
  questions,
  minCount = 10,
  maxCount = 15,
}) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const dedupedQuestionsById = dedupeQuestionsById(normalizedQuestions);
  const dedupedQuestions = dedupeQuestionsByTitle(dedupedQuestionsById);
  const { resolvedMin, resolvedMax } = normalizeCountRange(
    dedupedQuestions.length,
    minCount,
    maxCount,
  );

  if (resolvedMax === 0) {
    return [];
  }

  const pickedCount =
    resolvedMin === resolvedMax
      ? resolvedMin
      : randomIntInclusive(resolvedMin, resolvedMax);

  const shuffledQuestions = shuffleQuestions(dedupedQuestions);

  return shuffledQuestions.slice(0, pickedCount);
}

/**
 * 按维度覆盖的无重复抽题：
 * 适用于 MBTI 等“多维度题库”，确保本轮题目至少覆盖每个维度一次。
 * 复杂度评估：
 * 1. 去重与分组：O(N)
 * 2. 组内洗牌 + 余量洗牌：O(N)
 * 3. 结果组装：O(K)
 * 总体复杂度：O(N)
 * @param {object} params 抽题参数。
 * @param {Array<object>} params.questions 完整题库。
 * @param {number} [params.minCount=10] 最小抽题数。
 * @param {number} [params.maxCount=15] 最大抽题数。
 * @param {string} params.dimensionKey 题目维度字段名（例如 dimensionTag）。
 * @returns {Array<object>} 覆盖维度后的随机题目列表（无重复）。
 */
export function selectRandomQuestionsWithDimensionCoverage({
  questions,
  minCount = 10,
  maxCount = 15,
  dimensionKey,
}) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const dedupedQuestionsById = dedupeQuestionsById(normalizedQuestions);
  const dedupedQuestions = dedupeQuestionsByTitle(dedupedQuestionsById);
  const { resolvedMin, resolvedMax } = normalizeCountRange(
    dedupedQuestions.length,
    minCount,
    maxCount,
  );

  if (!dimensionKey || resolvedMax === 0) {
    return selectRandomQuestionsWithoutRepeat({
      questions: dedupedQuestions,
      minCount: resolvedMin,
      maxCount: resolvedMax,
    });
  }

  const pickedCount =
    resolvedMin === resolvedMax
      ? resolvedMin
      : randomIntInclusive(resolvedMin, resolvedMax);

  const dimensionMap = dedupedQuestions.reduce((accumulator, questionItem) => {
    const dimensionValue = String(questionItem?.[dimensionKey] ?? "");
    if (!dimensionValue) {
      return accumulator;
    }

    if (!accumulator.has(dimensionValue)) {
      accumulator.set(dimensionValue, []);
    }

    accumulator.get(dimensionValue).push(questionItem);
    return accumulator;
  }, new Map());

  const dimensionGroups = Array.from(dimensionMap.values()).map((group) =>
    shuffleQuestions(group),
  );

  if (dimensionGroups.length === 0) {
    return selectRandomQuestionsWithoutRepeat({
      questions: dedupedQuestions,
      minCount: resolvedMin,
      maxCount: resolvedMax,
    });
  }

  const pickedQuestions = [];
  const pickedIdSet = new Set();

  // 第一轮：每个维度先取 1 题，确保覆盖。
  dimensionGroups.forEach((group) => {
    if (pickedQuestions.length >= pickedCount || group.length === 0) {
      return;
    }

    const firstQuestion = group.shift();
    pickedQuestions.push(firstQuestion);
    pickedIdSet.add(firstQuestion.id);
  });

  // 第二轮：把剩余题混合后继续随机补齐。
  const remainingQuestions = shuffleQuestions(dimensionGroups.flat()).filter(
    (questionItem) => !pickedIdSet.has(questionItem.id),
  );

  for (let index = 0; index < remainingQuestions.length; index += 1) {
    if (pickedQuestions.length >= pickedCount) {
      break;
    }

    pickedQuestions.push(remainingQuestions[index]);
  }

  return pickedQuestions;
}
