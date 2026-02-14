import { requestBailianJson } from "./bailianClient";
import { analyzeMbtiWithDeepInsight } from "./mbtiAiAnalyzer";

/**
 * 将任意输入转为非空字符串。
 * @param {unknown} value 任意值。
 * @param {string} fallbackText 兜底文本。
 * @returns {string} 非空字符串。
 */
function toSafeString(value, fallbackText) {
  return typeof value === "string" && value.trim() ? value.trim() : fallbackText;
}

/**
 * 归一化字符串数组。
 * @param {unknown} value 任意值。
 * @param {Array<string>} fallbackArray 兜底数组。
 * @param {number} limit 输出长度限制。
 * @returns {Array<string>} 归一化数组。
 */
function toSafeStringArray(value, fallbackArray, limit) {
  if (!Array.isArray(value)) {
    return fallbackArray.slice(0, limit);
  }

  const normalizedArray = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, limit);

  return normalizedArray.length > 0 ? normalizedArray : fallbackArray.slice(0, limit);
}

/**
 * 构建 MBTI 深度分析负载。
 * @param {object} localResult 统一本地结果。
 * @returns {object} MBTI 深度分析负载。
 */
function buildMbtiDeepPayload(localResult) {
  const mbtiLocalResult = localResult.mbtiLocalResult;

  return {
    summaryLines: mbtiLocalResult.summaryLines,
    axisScores: mbtiLocalResult.axisScores,
    typeCandidates: mbtiLocalResult.scoredTypes.map((item) => ({
      type: item.type,
      title: item.title,
      score: item.score,
    })),
    localTopThree: mbtiLocalResult.topThree.map((item) => ({
      name: item.type,
      score: item.score,
      title: item.title,
    })),
    localResult: mbtiLocalResult,
  };
}

/**
 * 构建通用测试的 AI 提示词。
 * @param {object} testConfig 测试配置。
 * @param {object} localResult 本地结果。
 * @returns {string} 用户提示词。
 */
function buildGenericUserPrompt(testConfig, localResult) {
  return [
    "你是一位中文人格测评内容编辑，请根据测试结果输出结构化解读。",
    "只输出 JSON，不要输出任何额外说明。",
    "JSON 字段格式：",
    JSON.stringify(
      {
        title: "16字以内标题",
        narrative: "150字以内总结",
        strengths: ["优势1", "优势2", "优势3"],
        risks: ["提醒1", "提醒2", "提醒3"],
        suggestions: ["建议1", "建议2", "建议3"],
      },
      null,
      2,
    ),
    `测试类型：${testConfig.name}`,
    `测试说明：${testConfig.moduleDescription}`,
    `历史背景：${testConfig.history}`,
    "本地主结果：",
    JSON.stringify(localResult.mainResult, null, 2),
    "本地 Top3：",
    JSON.stringify(localResult.topThree, null, 2),
    "答卷摘要（节选）：",
    localResult.summaryLines.slice(0, 20).join("\n"),
  ].join("\n\n");
}

/**
 * 归一化通用 AI 解读结果。
 * @param {object|null} aiData 模型返回。
 * @param {object} localResult 本地结果。
 * @returns {{ title: string, narrative: string, strengths: Array<string>, risks: Array<string>, suggestions: Array<string>, generatedAt: number }} 归一化结果。
 */
function normalizeGenericAiInsight(aiData, localResult) {
  const fallbackTitle = `${localResult.mainResult.label} · 进阶解读`;
  const fallbackNarrative = localResult.insight;
  const fallbackStrengths =
    localResult.detailTags.length > 0
      ? localResult.detailTags
      : ["当前结果偏好稳定", "在熟悉场景表现更好", "具备持续优化空间"];
  const fallbackRisks = ["请避免把类型标签作为固定结论", "高压场景下要关注行为失真"];
  const fallbackSuggestions =
    localResult.detailActions.length > 0
      ? localResult.detailActions
      : ["将结果用于改善协作方式", "每月复盘一次行为变化", "结合真实场景持续验证"];

  return {
    title: toSafeString(aiData?.title, fallbackTitle),
    narrative: toSafeString(aiData?.narrative, fallbackNarrative),
    strengths: toSafeStringArray(aiData?.strengths, fallbackStrengths, 3),
    risks: toSafeStringArray(aiData?.risks, fallbackRisks, 3),
    suggestions: toSafeStringArray(aiData?.suggestions, fallbackSuggestions, 3),
    generatedAt: Date.now(),
  };
}

/**
 * 归一化 MBTI 深度解读结果。
 * @param {object} deepResult MBTI 深度结果。
 * @param {object} localResult 本地结果。
 * @returns {{ title: string, narrative: string, strengths: Array<string>, risks: Array<string>, suggestions: Array<string>, deepMainType: object, deepTopThree: Array<object>, generatedAt: number }} 归一化结果。
 */
function normalizeMbtiAiInsight(deepResult, localResult) {
  const defaultStrengths =
    Array.isArray(deepResult?.topThree) && deepResult.topThree.length > 0
      ? deepResult.topThree.map((item) => `${item.name} 匹配度 ${item.score}%`)
      : localResult.topThree.map((item) => `${item.label}（${item.score}%）`);

  return {
    title: toSafeString(deepResult?.profileTitle, `${localResult.mainResult.label} · 进阶解读`),
    narrative: toSafeString(deepResult?.insight, localResult.insight),
    strengths: toSafeStringArray(
      defaultStrengths,
      ["维度偏好稳定", "类型识别清晰", "具备可迁移的行为优势"],
      3,
    ),
    risks: toSafeStringArray(
      deepResult?.blindSpots,
      ["高压下可能回到单一路径", "沟通节奏差异会放大误解"],
      3,
    ),
    suggestions: toSafeStringArray(
      deepResult?.growthActions,
      ["保持优势场景的持续复用", "增加反向维度训练", "定期复盘关键决策过程"],
      3,
    ),
    deepMainType: deepResult?.mainType ?? null,
    deepTopThree: Array.isArray(deepResult?.topThree) ? deepResult.topThree : [],
    generatedAt: Date.now(),
  };
}

/**
 * 执行类型学进阶解读。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {object} params.localResult 本地结果。
 * @param {number} [params.timeoutMs=18000] 超时时间。
 * @returns {Promise<object>} 归一化后的进阶解读结果。
 */
export async function analyzeTypeologyWithAi({
  testConfig,
  localResult,
  timeoutMs = 18000,
}) {
  if (testConfig?.key === "mbti" && localResult?.mbtiLocalResult) {
    const deepResult = await analyzeMbtiWithDeepInsight(
      buildMbtiDeepPayload(localResult),
      { timeoutMs },
    );

    return normalizeMbtiAiInsight(deepResult, localResult);
  }

  const aiData = await requestBailianJson({
    systemPrompt: "你是中文人格测评分析师。请严格输出 JSON。",
    userPrompt: buildGenericUserPrompt(testConfig, localResult),
    timeoutMs,
    temperature: 0.35,
  });

  return normalizeGenericAiInsight(aiData, localResult);
}

