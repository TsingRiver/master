import {
  PRESSURE_RELIEF_PREFERENCES,
  PRESSURE_RELIEF_QUESTIONS,
  PRESSURE_RELIEF_RESULTS,
  PRESSURE_RELIEF_VERSION,
} from "./pressureRelief.config.js";

const VALID_OPTION_IDS = new Set(["A", "B", "C"]);

/**
 * 计算固定题库的状态分与小动作偏好。
 * @param {Record<string, string>} answers 题目 ID 到选项 ID 的完整答案映射。
 * @returns {{ version: string, rawScore: number, pressureValue: number, resultId: string, preferenceId: string, showHandCareNote: boolean }} 稳定的结果基础数据。
 */
export function calculatePressureRelief(answers) {
  const normalizedAnswers = answers ?? {};
  const missingQuestion = PRESSURE_RELIEF_QUESTIONS.find(
    (question) => !VALID_OPTION_IDS.has(normalizedAnswers[question.id]),
  );

  if (missingQuestion) {
    throw new Error("请先完成全部题目");
  }

  let rawScore = 0;
  const preferenceScores = { tactile: 0, hand: 0 };

  PRESSURE_RELIEF_QUESTIONS.forEach((question) => {
    const selectedOption = question.options.find(
      (option) => option.id === normalizedAnswers[question.id],
    );

    // 关键逻辑：后六题的状态分与前六题偏好分分别累计，避免小动作被错误解释为压力高低。
    if (typeof selectedOption?.stateScore === "number") {
      rawScore += selectedOption.stateScore;
    }

    if (question.preferenceKey && typeof selectedOption?.preferenceScore === "number") {
      preferenceScores[question.preferenceKey] += selectedOption.preferenceScore;
    }
  });

  const resultId = rawScore <= 2
    ? "cloud"
    : rawScore <= 5
      ? "bubble"
      : rawScore <= 9
        ? "balloon"
        : "steam";
  const preferenceId = preferenceScores.tactile >= 1.5 && preferenceScores.hand >= 1.5
    ? "mixed"
    : preferenceScores.tactile >= 1.5
      ? "tactile"
      : preferenceScores.hand >= 1.5
        ? "hand"
        : "plain";

  return {
    version: PRESSURE_RELIEF_VERSION,
    rawScore,
    pressureValue: Math.round((rawScore / 12) * 100),
    resultId,
    preferenceId,
    showHandCareNote: normalizedAnswers.q2 !== "C",
  };
}

/**
 * 用 Fisher-Yates 洗牌从文案池中无放回抽取两条。
 * @template T
 * @param {readonly T[]} pool 供抽取的完整文案池。
 * @param {() => number} [random=Math.random] 随机数函数，便于验证边界。
 * @returns {T[]} 两条不重复文案。
 */
export function pickTwo(pool, random = Math.random) {
  if (!Array.isArray(pool) || pool.length < 2) {
    throw new Error("文案池至少需要两条内容");
  }

  const copy = [...pool];
  for (let currentIndex = copy.length - 1; currentIndex > 0; currentIndex -= 1) {
    const targetIndex = Math.floor(random() * (currentIndex + 1));
    [copy[currentIndex], copy[targetIndex]] = [copy[targetIndex], copy[currentIndex]];
  }

  return copy.slice(0, 2);
}

/**
 * 在完整提交时创建一次结果快照。
 * @param {Record<string, string>} answers 本次完整答案。
 * @param {() => number} [random=Math.random] 随机数函数。
 * @returns {object} 可持久化、可复用的结果快照。
 */
export function buildPressureReliefSnapshot(answers, random = Math.random) {
  const calculatedResult = calculatePressureRelief(answers);
  const resultConfig = PRESSURE_RELIEF_RESULTS[calculatedResult.resultId];

  return {
    ...calculatedResult,
    interpretations: pickTwo(resultConfig.interpretations, random),
    tips: pickTwo(resultConfig.tips, random),
    createdAt: Date.now(),
  };
}

/**
 * 校验缓存的结果快照是否仍对应当前版本、答案和文案池。
 * @param {unknown} snapshot 待恢复的缓存快照。
 * @param {Record<string, string>} answers 待恢复的答案。
 * @returns {boolean} 是否可以直接安全复用。
 */
export function isPressureReliefSnapshotValid(snapshot, answers) {
  if (!snapshot || typeof snapshot !== "object") {
    return false;
  }

  let recalculatedResult;
  try {
    recalculatedResult = calculatePressureRelief(answers);
  } catch {
    return false;
  }

  if (
    snapshot.version !== PRESSURE_RELIEF_VERSION
    || snapshot.rawScore !== recalculatedResult.rawScore
    || snapshot.pressureValue !== recalculatedResult.pressureValue
    || snapshot.resultId !== recalculatedResult.resultId
    || snapshot.preferenceId !== recalculatedResult.preferenceId
  ) {
    return false;
  }

  const resultConfig = PRESSURE_RELIEF_RESULTS[snapshot.resultId];
  const isValidPoolSelection = (items, pool) => {
    if (!Array.isArray(items) || items.length !== 2) {
      return false;
    }

    const allowedIds = new Set(pool.map((item) => item.id));
    const selectedIds = items.map((item) => item?.id);
    return selectedIds.every((itemId) => allowedIds.has(itemId))
      && new Set(selectedIds).size === selectedIds.length;
  };

  return isValidPoolSelection(snapshot.interpretations, resultConfig.interpretations)
    && isValidPoolSelection(snapshot.tips, resultConfig.tips)
    && Boolean(PRESSURE_RELIEF_PREFERENCES[snapshot.preferenceId]);
}
