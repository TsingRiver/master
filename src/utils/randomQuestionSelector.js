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
 * 无重复随机抽题。
 * 复杂度评估：
 * 1. 去重：O(N)
 * 2. Fisher-Yates 洗牌：O(N)
 * 3. 切片取前 K：O(K)
 * 总体复杂度：O(N)
 * @param {object} params 抽题参数。
 * @param {Array<object>} params.questions 完整题库。
 * @param {number} [params.minCount=8] 最小抽题数。
 * @param {number} [params.maxCount=15] 最大抽题数。
 * @returns {Array<object>} 本次测试题目列表（无重复）。
 */
export function selectRandomQuestionsWithoutRepeat({
  questions,
  minCount = 8,
  maxCount = 15,
}) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const dedupedQuestions = dedupeQuestionsById(normalizedQuestions);
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

  const shuffledQuestions = [...dedupedQuestions];

  // 关键逻辑：Fisher-Yates 无偏洗牌，确保抽题分布均匀且无重复。
  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = randomIntInclusive(0, index);
    const temp = shuffledQuestions[index];
    shuffledQuestions[index] = shuffledQuestions[randomIndex];
    shuffledQuestions[randomIndex] = temp;
  }

  return shuffledQuestions.slice(0, pickedCount);
}
