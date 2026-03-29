import { requestBailianJson } from "./bailianClient";
import {
  sanitizeMbtiCopyList,
  sanitizeMbtiCopyText,
} from "./mbtiResultIntegrity";
import {
  buildMbtiPersonalitySummary,
  normalizeTypeologyShortSummary,
} from "./typeologyCopyUtils";

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
 * 去除句尾标点，便于拼接更自然的兜底文案。
 * @param {unknown} value 任意值。
 * @returns {string} 清洗后的文本。
 */
function stripTrailingPunctuation(value) {
  return String(value ?? "")
    .trim()
    .replace(/[。！？!?；;，,]+$/g, "");
}

/**
 * 构建 MBTI 本地进阶标题兜底。
 * @param {object} localResult 本地结果。
 * @returns {string} 进阶标题。
 */
function buildMbtiFallbackProfileTitle(localResult) {
  return `${String(localResult?.topType?.type ?? "MBTI").trim()} · 维度深看`;
}

/**
 * 构建 MBTI 本地短摘要兜底。
 * 关键逻辑：主结果卡需要一句短解读；AI 未返回有效短摘要时回退到该字段。
 * @param {object} localResult 本地结果。
 * @returns {string} 短摘要。
 */
function buildMbtiFallbackShortSummary(localResult) {
  return buildMbtiPersonalitySummary({
    typeCode: localResult?.topType?.type,
    typeTitle: localResult?.topType?.title,
  });
}

/**
 * 归一化 MBTI AI 短摘要。
 * @param {unknown} value 任意值。
 * @param {string} fallbackText 本地兜底摘要。
 * @param {string} [_insightText=""] 保留参数位，兼容现有调用签名。
 * @returns {string} 可用于主结果卡的短摘要。
 */
function resolveMbtiAiShortSummary(value, fallbackText, _insightText = "") {
  const normalizedShortSummary = normalizeTypeologyShortSummary(value);
  if (normalizedShortSummary) {
    return normalizedShortSummary;
  }

  return String(fallbackText ?? "").trim();
}

/**
 * 构建 MBTI 本地进阶叙事兜底。
 * 关键逻辑：进阶解读聚焦“为什么是这个类型”和“边界在哪”，避免重复摘要卡。
 * @param {object} localResult 本地结果。
 * @returns {string} 进阶叙事文案。
 */
function buildMbtiFallbackInsight(localResult) {
  const topTypeCode = String(localResult?.topType?.type ?? "").trim();
  const primaryAxisLine = stripTrailingPunctuation(localResult?.axisSummaryLines?.[0]);
  const secondaryAxisLine = stripTrailingPunctuation(localResult?.axisSummaryLines?.[1]);
  const tertiaryAxisLine = stripTrailingPunctuation(localResult?.axisSummaryLines?.[2]);
  const secondTypeCode = String(localResult?.topThree?.[1]?.type ?? "").trim();
  const thirdTypeCode = String(localResult?.topThree?.[2]?.type ?? "").trim();

  return [
    `比起“你像哪一型”，更值得关注的是「为什么 ${topTypeCode} 会排在第一位」。`,
    primaryAxisLine ? `从维度看，${primaryAxisLine}。` : "",
    secondaryAxisLine ? `${secondaryAxisLine}。` : "",
    tertiaryAxisLine ? `${tertiaryAxisLine}。` : "",
    secondTypeCode || thirdTypeCode
      ? `你与 ${secondTypeCode || "次高类型"}、${thirdTypeCode || "第三类型"} 仍保持接近，说明某些边界场景下会出现可切换的次级风格，但长期主线依然更接近 ${topTypeCode}。`
      : "",
  ]
    .filter(Boolean)
    .join("");
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
        shortSummary: `${lockedMainTypeCode} 的80~120字单句人格描述，只描述当前测试下的你，不写建议或Top3比较`,
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
 * @returns {{ mainType: object, topThree: Array<object>, shortSummary: string, profileTitle: string, insight: string, growthActions: Array<string>, blindSpots: Array<string>, typeCard: object }} 标准化结果。
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
  const fallbackProfileTitle = buildMbtiFallbackProfileTitle(localResult);
  const fallbackGrowthActions = [
    "把你的核心优势场景固定下来，每周至少重复一次。",
    "把关键决策过程写成模板，减少情绪波动带来的偏差。",
    "每月挑一个短板维度做一次刻意练习，保持类型弹性。",
  ];
  const fallbackBlindSpots = [
    "在高压环境下容易固化到单一决策路径",
    "表达风格与他人节奏不一致时会被误解",
  ];
  const fallbackShortSummary = buildMbtiFallbackShortSummary(localResult);

  const fallbackResult = {
    mainType: lockedMainType,
    topThree: lockedTopThree,
    shortSummary: fallbackShortSummary,
    profileTitle: fallbackProfileTitle,
    insight: buildMbtiFallbackInsight(localResult),
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
    shortSummary: resolveMbtiAiShortSummary(
      aiData?.shortSummary,
      fallbackShortSummary,
      aiData?.insight,
    ),
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
 * @returns {Promise<{ mainType: object, topThree: Array<object>, shortSummary: string, profileTitle: string, insight: string, growthActions: Array<string>, blindSpots: Array<string>, typeCard: object }>} 标准化结果。
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
