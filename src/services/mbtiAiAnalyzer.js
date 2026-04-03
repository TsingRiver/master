import { requestBailianJson } from "./bailianClient";
import {
  buildMbtiFallbackAiStrengths,
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
 * MBTI 深度分析提示词中答卷摘要节选条数上限。
 * 关键逻辑：保留足够作答证据，同时控制 prompt 体积，避免 72 题模式下提示词过长。
 */
const MBTI_PROMPT_SUMMARY_LINE_LIMIT = 12;

/**
 * 规范化提示词中的答卷摘要节选。
 * 复杂度评估：O(N)，N 为摘要条数；当前题量上限有限，实际开销可忽略。
 * @param {unknown} summaryLines 原始答卷摘要数组。
 * @returns {Array<string>} 可用于提示词的摘要节选。
 */
function buildPromptSummaryLineExcerpt(summaryLines) {
  if (!Array.isArray(summaryLines)) {
    return [];
  }

  return summaryLines
    .map((lineItem) => String(lineItem ?? "").trim())
    .filter(Boolean)
    .slice(0, MBTI_PROMPT_SUMMARY_LINE_LIMIT);
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
  const promptSummaryLineList = buildPromptSummaryLineExcerpt(payload?.summaryLines);
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
    `3. 在解释进阶分析（insight）时允许提及本地模型 Top3 中的其他类型，但必须明确最终结论仍以 ${lockedMainTypeCode} 为主导，且 profileTitle 中不得出现其他类型码。`,
    "4. 你的职责是解释结果，不是改判结果。",
    "5. shortSummary 必须是一段 80~120 字的人格描述，只描述当前测试下的你，不写建议或 Top3 比较。",
    "6. strengths 必须写成 3 条“优势信号”，解释维度如何转化为行为优势；不得直接照抄 axisSummaryLines，不得出现百分比、匹配度或 Top3 排名复述。",
    "7. 必须填写真实内容，不得照抄字段说明、示例文案、空字符串或占位数组。",
    "字段规范：",
    JSON.stringify(
      {
        mainType: { name: lockedMainTypeCode, score: lockedMainTypeScore },
        topThree: [{ name: "", score: 0 }, { name: "", score: 0 }, { name: "", score: 0 }],
        shortSummary: "",
        profileTitle: "",
        insight: "",
        strengths: ["", "", ""],
        growthActions: ["", "", ""],
        blindSpots: ["", ""],
      },
      null,
      2,
    ),
    "本地模型 Top3（优先参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
    "维度倾向：",
    JSON.stringify(payload.axisScores, null, 2),
    ...(promptSummaryLineList.length > 0
      ? [
          "答卷摘要（节选，优先参考）：",
          promptSummaryLineList.join("\n"),
        ]
      : []),
  ].join("\n\n");
}

/**
 * 标准化深度结果，保证页面稳定渲染。
 * @param {object|null} aiData 深度模型返回。
 * @param {object} localResult 本地结果。
 * @returns {{ mainType: object, topThree: Array<object>, shortSummary: string, profileTitle: string, insight: string, strengths: Array<string>, growthActions: Array<string>, blindSpots: Array<string>, typeCard: object }} 标准化结果。
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
  const fallbackStrengths = buildMbtiFallbackAiStrengths({
    mainResult: {
      key: localResult?.topType?.type,
      label: `${String(localResult?.topType?.type ?? "").trim()} · ${String(localResult?.topType?.title ?? "").trim()}`,
    },
    topThree: localResult?.topThree?.map((item) => ({
      key: item.type,
      label: `${item.type} · ${item.title}`,
      score: item.score,
    })),
    mbtiLocalResult: localResult,
  });

  const fallbackResult = {
    mainType: lockedMainType,
    topThree: lockedTopThree,
    shortSummary: fallbackShortSummary,
    profileTitle: fallbackProfileTitle,
    insight: buildMbtiFallbackInsight(localResult),
    strengths: fallbackStrengths,
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
      allowedTypeCodes: lockedTopThree.map((item) => item.name),
      fallbackText: fallbackResult.insight,
    }),
    strengths: sanitizeMbtiCopyList({
      textList: aiData?.strengths,
      lockedTypeCode: lockedMainType.name,
      allowedTypeCodes: lockedTopThree.map((item) => item.name),
      fallbackList: fallbackStrengths,
      limit: 3,
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
 * @param {Array<object>} payload.localTopThree 本地 Top3。
 * @param {object} payload.localResult 本地完整结果。
 * @param {object} [options] 调用配置。
 * @param {number} [options.timeoutMs=18000] 超时时间。
 * @param {(fullText: string, deltaText: string) => void} [options.onStreamText] 流式文本回调。
 * @param {AbortSignal} [options.abortSignal] 外部取消信号。
 * @returns {Promise<{ mainType: object, topThree: Array<object>, shortSummary: string, profileTitle: string, insight: string, strengths: Array<string>, growthActions: Array<string>, blindSpots: Array<string>, typeCard: object }>} 标准化结果。
 */
export async function analyzeMbtiWithDeepInsight(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: "请严格根据要求输出 JSON，不要包含任何多余文字或 Markdown 代码块标记（如 ```json）。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.35,
    onTextUpdate: options.onStreamText,
    signal: options.abortSignal,
  });

  return normalizeMbtiDeepResult(aiData, payload.localResult);
}
