import { requestBailianJson } from "./bailianClient";
import {
  sanitizeMbtiCopyList,
  sanitizeMbtiCopyText,
} from "./mbtiResultIntegrity";

/**
 * 限制百分比分值。
 * @param {number} score 原始分值。
 * @returns {number} 合法百分比。
 */
function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 构建深度生成提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  const lockedMainType = payload?.localResult?.topType;
  const lockedMainTypeCode = String(lockedMainType?.type ?? "INTJ").trim();
  const lockedMainTypeScore = clampScore(lockedMainType?.score);
  const lockedTopThree = Array.isArray(payload?.localTopThree)
    ? payload.localTopThree.slice(0, 3).map((item) => ({
        name: String(item?.name ?? "").trim(),
        score: clampScore(item?.score),
      }))
    : [];

  return [
    "你是一位中文人格测评内容策划师，擅长把 MBTI 结果写成移动端可读的简洁报告。",
    "请基于用户答卷与本地模型结果，输出 JSON（不得输出额外文字）。",
    "强约束：",
    `1. mainType.name 必须等于 ${lockedMainTypeCode}，不得改成其他 MBTI 类型。`,
    "2. topThree 必须与“本地模型 Top3（优先参考）”保持相同类型与顺序，不得改写排名。",
    `3. profileTitle、insight、growthActions、blindSpots 中不得出现 ${lockedMainTypeCode} 之外的其他 MBTI 类型码。`,
    "4. 你的职责是解释结果，不是改判结果。",
    "字段规范：",
    JSON.stringify(
      {
        mainType: { name: lockedMainTypeCode, score: lockedMainTypeScore },
        topThree: lockedTopThree,
        profileTitle: `${lockedMainTypeCode} · 12字以内的小标题`,
        insight: `必须围绕 ${lockedMainTypeCode} 解释，不得写成其他类型`,
        growthActions: ["建议1", "建议2", "建议3"],
        blindSpots: ["提醒1", "提醒2"],
      },
      null,
      2,
    ),
    "可选 MBTI 类型（必须从中选择）：",
    JSON.stringify(payload.typeCandidates, null, 2),
    "本地模型 Top3（优先参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
    "维度倾向：",
    JSON.stringify(payload.axisScores, null, 2),
    "答卷摘要：",
    payload.summaryLines.join("\n"),
  ].join("\n\n");
}

/**
 * 标准化深度结果，保证页面稳定渲染。
 * @param {object|null} aiData 深度模型返回。
 * @param {object} localResult 本地结果。
 * @returns {{ mainType: object, topThree: Array<object>, profileTitle: string, insight: string, growthActions: Array<string>, blindSpots: Array<string>, typeCard: object }} 标准化结果。
 */
function normalizeMbtiDeepResult(aiData, localResult) {
  const lockedMainType = {
    name: localResult.topType.type,
    score: clampScore(localResult.topType.score),
  };
  const lockedTopThree = localResult.topThree.map((item) => ({
    name: item.type,
    score: clampScore(item.score),
  }));
  const fallbackProfileTitle = `${localResult.topType.type} · ${localResult.topType.title}`;
  const fallbackGrowthActions = [
    "把你的核心优势场景固定下来，每周至少重复一次。",
    "把关键决策过程写成模板，减少情绪波动带来的偏差。",
    "每月挑一个短板维度做一次刻意练习，保持类型弹性。",
  ];
  const fallbackBlindSpots = [
    "在高压环境下容易固化到单一决策路径",
    "表达风格与他人节奏不一致时会被误解",
  ];

  const fallbackResult = {
    mainType: lockedMainType,
    topThree: lockedTopThree,
    profileTitle: fallbackProfileTitle,
    insight: localResult.localNarrative,
    growthActions: fallbackGrowthActions,
    blindSpots: fallbackBlindSpots,
    typeCard: localResult.typeCard,
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  return {
    // 关键逻辑：MBTI 主类型与 Top3 永远锁定本地算法结果，AI 仅负责解释，不允许改判。
    mainType: lockedMainType,
    topThree: lockedTopThree,
    profileTitle: sanitizeMbtiCopyText({
      text: aiData?.profileTitle,
      lockedTypeCode: lockedMainType.name,
      fallbackText: fallbackProfileTitle,
    }),
    insight: sanitizeMbtiCopyText({
      text: aiData?.insight,
      lockedTypeCode: lockedMainType.name,
      fallbackText: fallbackResult.insight,
    }),
    growthActions: sanitizeMbtiCopyList({
      textList: aiData?.growthActions,
      lockedTypeCode: lockedMainType.name,
      fallbackList: fallbackGrowthActions,
      limit: 3,
    }),
    blindSpots: sanitizeMbtiCopyList({
      textList: aiData?.blindSpots,
      lockedTypeCode: lockedMainType.name,
      fallbackList: fallbackBlindSpots,
      limit: 2,
    }),
    // 关键逻辑：类型学卡片以本地规则计算为准，确保字段与格式稳定。
    typeCard: localResult.typeCard,
  };
}

/**
 * 执行 MBTI 深度分析。
 * @param {object} payload 请求负载。
 * @param {Array<string>} payload.summaryLines 答卷摘要。
 * @param {object} payload.axisScores 维度分值。
 * @param {Array<object>} payload.typeCandidates 候选类型。
 * @param {Array<object>} payload.localTopThree 本地 Top3。
 * @param {object} payload.localResult 本地完整结果。
 * @param {object} [options] 调用配置。
 * @param {number} [options.timeoutMs=18000] 超时时间。
 * @param {(fullText: string, deltaText: string) => void} [options.onStreamText] 流式文本回调。
 * @param {AbortSignal} [options.abortSignal] 外部取消信号。
 * @returns {Promise<{ mainType: object, topThree: Array<object>, profileTitle: string, insight: string, growthActions: Array<string>, blindSpots: Array<string>, typeCard: object }>} 标准化结果。
 */
export async function analyzeMbtiWithDeepInsight(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是中文人格分析师。必须严格输出 JSON。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.35,
    onTextUpdate: options.onStreamText,
    signal: options.abortSignal,
  });

  return normalizeMbtiDeepResult(aiData, payload.localResult);
}
