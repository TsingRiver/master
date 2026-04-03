import { requestBailianJson } from "./bailianClient";
import { analyzeMbtiWithDeepInsight } from "./mbtiAiAnalyzer";
import { sanitizeAiCopyList, sanitizeAiCopyText } from "./aiCopySanitizer.js";
import {
  buildMbtiFallbackAiStrengths,
  shouldUpgradeMbtiAiStrengthList,
} from "./mbtiResultIntegrity";
import {
  buildMbtiPersonalitySummary,
  buildTypeologyPersonalitySummary,
  buildTypeologyOutcomeMetaMap,
  formatTypeologyOutcomeLabel,
  normalizeTypeologyTextList,
  normalizeTypeologyShortSummary,
  resolveTypeologyOutcomeContext,
  stripTrailingPunctuation,
} from "./typeologyCopyUtils";

/**
 * 将任意输入转为非空且非模板占位字符串。
 * @param {unknown} value 任意值。
 * @param {string} fallbackText 兜底文本。
 * @returns {string} 非空字符串。
 */
function toSafeString(value, fallbackText) {
  return sanitizeAiCopyText({
    text: value,
    fallbackText,
  });
}

/**
 * 归一化字符串数组。
 * @param {unknown} value 任意值。
 * @param {Array<string>} fallbackArray 兜底数组。
 * @param {number} limit 输出长度限制。
 * @returns {Array<string>} 归一化数组。
 */
function toSafeStringArray(value, fallbackArray, limit) {
  return sanitizeAiCopyList({
    textList: value,
    fallbackList: fallbackArray,
    limit,
  });
}

/**
 * 归一化 AI 短摘要：
 * 关键逻辑：主卡摘要中 AI `shortSummary` 具有最高优先级；只有字段缺失或为空时才回退本地摘要。
 * @param {unknown} value 任意值。
 * @param {string} fallbackText 本地兜底摘要。
 * @param {string} [_narrativeText=""] 保留参数位，兼容现有调用签名。
 * @returns {string} 可用于主卡展示的短摘要。
 */
function resolveAiShortSummary(value, fallbackText, _narrativeText = "") {
  const normalizedShortSummary = normalizeTypeologyShortSummary(value);
  if (normalizedShortSummary) {
    return normalizedShortSummary;
  }

  return String(fallbackText ?? "").trim();
}

/**
 * 构建通用测试的本地进阶标题兜底。
 * @param {object} testConfig 测试配置。
 * @param {object} localResult 本地结果。
 * @returns {string} 进阶标题。
 */
function buildGenericFallbackTitle(testConfig, localResult) {
  const dualHighProfile =
    localResult?.dualHighProfile && typeof localResult.dualHighProfile === "object"
      ? localResult.dualHighProfile
      : null;
  if (dualHighProfile?.isDualHigh) {
    return `${String(testConfig?.name ?? "当前结果").trim()} · 双高观察`;
  }

  const outcomeMetaMap = buildTypeologyOutcomeMetaMap(
    localResult?.scoreBoard,
    [localResult?.mainResult],
  );
  const mainOutcomeContext = resolveTypeologyOutcomeContext({
    outcome: localResult?.mainResult,
    outcomeMetaMap,
    fallbackText: String(testConfig?.name ?? "当前结果").trim(),
  });
  return `${mainOutcomeContext.displayLabel} · 深入观察`;
}

/**
 * 构建通用测试的本地进阶叙事兜底。
 * 关键逻辑：进阶解读要解释“为什么会这样”，而不是重复摘要卡里的结论。
 * @param {object} testConfig 测试配置。
 * @param {object} localResult 本地结果。
 * @returns {string} 进阶叙事文案。
 */
function buildGenericFallbackNarrative(testConfig, localResult) {
  const dualHighProfile =
    localResult?.dualHighProfile && typeof localResult.dualHighProfile === "object"
      ? localResult.dualHighProfile
      : null;
  const outcomeMetaMap = buildTypeologyOutcomeMetaMap(
    localResult?.scoreBoard,
    [localResult?.mainResult],
    localResult?.topThree,
  );
  const mainOutcomeContext = resolveTypeologyOutcomeContext({
    outcome: localResult?.mainResult,
    outcomeMetaMap,
    fallbackText: String(testConfig?.name ?? "当前结果").trim(),
  });
  const mainSummary = mainOutcomeContext.summary;
  const tagList =
    mainOutcomeContext.tags.length > 0
      ? mainOutcomeContext.tags.slice(0, 3)
      : normalizeTypeologyTextList(localResult?.detailTags, 3);
  const secondLabel = formatTypeologyOutcomeLabel({
    outcome: localResult?.topThree?.[1],
    outcomeMetaMap,
    fallbackText: "无",
  });
  const thirdLabel = formatTypeologyOutcomeLabel({
    outcome: localResult?.topThree?.[2],
    outcomeMetaMap,
    fallbackText: "无",
  });
  const topScore = Number(localResult?.topThree?.[0]?.score ?? 0) || 0;
  const secondScore = Number(localResult?.topThree?.[1]?.score ?? 0) || 0;
  const scoreGap = Math.max(0, Math.round((topScore - secondScore) * 10) / 10);

  if (dualHighProfile?.isDualHigh) {
    return [
      `你的结果呈现「${stripTrailingPunctuation(dualHighProfile.title)}」结构，说明偏好不是单一路径，而是两组高匹配特征并行出现。`,
      "真正需要观察的不是“到底只属于哪一种”，而是你在不同任务密度、关系压力和表达要求下，会更稳定地调动哪一组优势。",
      "只要把这两条路径放回真实场景复盘，就能更快看清自己的长期主线和临场切换规律。",
    ].join("");
  }

  return [
    `「${mainOutcomeContext.displayLabel}」排在首位，不只是表层偏好明显，更说明你在长期行为里更稳定地呈现「${mainSummary || "当前这组特征"}」这条主线。`,
    tagList.length > 0
      ? `从关键词看，你最容易持续放大的特征集中在 ${tagList.join("、")} 这些方向。`
      : "",
    secondLabel || thirdLabel
      ? `与次高匹配「${secondLabel || "无"}」「${thirdLabel || "无"}」相比，你并非没有其他倾向，而是在关键场景里更常走这一路径；当前第一与第二的差距约为 ${scoreGap}%，说明你的风格${scoreGap <= 5 ? "仍保留一定切换弹性" : "已经形成相对清晰的稳定重心"}。`
      : "",
  ]
    .filter(Boolean)
    .join("");
}

/**
 * 构建通用测试的本地优势信号兜底。
 * @param {object} localResult 本地结果。
 * @returns {Array<string>} 优势信号列表。
 */
function buildGenericFallbackStrengths(localResult) {
  const outcomeMetaMap = buildTypeologyOutcomeMetaMap(
    localResult?.scoreBoard,
    [localResult?.mainResult],
    localResult?.topThree,
  );
  const mainOutcomeContext = resolveTypeologyOutcomeContext({
    outcome: localResult?.mainResult,
    outcomeMetaMap,
  });
  const tagList =
    mainOutcomeContext.tags.length > 0
      ? mainOutcomeContext.tags
      : normalizeTypeologyTextList(localResult?.detailTags, 3);
  const secondLabel = formatTypeologyOutcomeLabel({
    outcome: localResult?.topThree?.[1],
    outcomeMetaMap,
    fallbackText: "无",
  });
  const thirdLabel = formatTypeologyOutcomeLabel({
    outcome: localResult?.topThree?.[2],
    outcomeMetaMap,
    fallbackText: "无",
  });

  return [
    tagList.length > 0
      ? `主结果持续指向 ${tagList.slice(0, 3).join("、")} 这组特征，说明你的风格已经有清晰重心。`
      : "当前主结果能稳定落在第一位，说明你的行为偏好已有可识别的主线。",
    secondLabel || thirdLabel
      ? `次高匹配仍保留在「${secondLabel || "无"}」「${thirdLabel || "无"}」，说明你不是单点僵化，而是有一定场景弹性。`
      : "除了主结果之外，你仍保留一定的次级风格弹性，适合在不同场景切换策略。",
    `结果不只是在描述“像谁”，也在提示你「${mainOutcomeContext.displayLabel}」这条路径最容易在哪些场景被持续放大。`,
  ];
}

/**
 * 构建通用测试的本地提醒信号兜底。
 * @param {object} localResult 本地结果。
 * @returns {Array<string>} 提醒信号列表。
 */
function buildGenericFallbackRisks(localResult) {
  const topScore = Number(localResult?.topThree?.[0]?.score ?? 0) || 0;
  const secondScore = Number(localResult?.topThree?.[1]?.score ?? 0) || 0;
  const scoreGap = Math.max(0, Math.round((topScore - secondScore) * 10) / 10);

  return [
    scoreGap <= 5
      ? "第一和第二匹配差距较小，说明你的风格边界并不僵硬，压力场景下可能短暂切换。"
      : "即使主结果相对清晰，也不代表你在所有场景都会稳定保持同一种表现。 ",
    "如果只记住类型标签，而不看真实行为证据，容易把一次测评结果误当成长期定论。",
    "当外部要求与你的主结果相反时，最容易出现节奏失衡、表达失真或短期用力过猛。",
  ].map((item) => item.trim());
}

/**
 * 构建通用测试的本地行动建议兜底。
 * @param {object} localResult 本地结果。
 * @returns {Array<string>} 行动建议列表。
 */
function buildGenericFallbackSuggestions(localResult) {
  const localActionList = Array.isArray(localResult?.detailActions)
    ? localResult.detailActions
        .map((item) => stripTrailingPunctuation(item))
        .filter(Boolean)
        .slice(0, 3)
    : [];

  if (localActionList.length >= 3) {
    return [
      `${localActionList[0]}，先放进最近最真实的工作或关系场景里验证。`,
      `${localActionList[1]}，观察 2 到 4 周后再判断它是不是你的稳定策略。`,
      `${localActionList[2]}，把测评结论转成可执行动作，比记住标签本身更有价值。`,
    ];
  }

  return [
    "先用一个最熟悉的真实场景验证主结果，看它是否能稳定解释你的行为选择。",
    "把次高匹配也当成备用策略，而不是把自己锁死在唯一标签里。",
    "每隔一段时间复盘一次行为证据，确认当前结果到底是长期主线还是短期状态。",
  ];
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
  const dualHighProfile =
    localResult?.dualHighProfile && typeof localResult.dualHighProfile === "object"
      ? localResult.dualHighProfile
      : null;
  const dualHighGuidanceLines =
    dualHighProfile?.isDualHigh
      ? [
          "判定补充：当前结果存在并列第一的双高倾向，请不要写成唯一主导类型。",
          `双高组合：${String(dualHighProfile.title ?? "").trim()}`,
          `双高说明：${String(dualHighProfile.note ?? "").trim()}`,
        ]
      : [];

  return [
    "你是一位中文人格测评内容编辑，请根据测试结果输出结构化解读。",
    "只输出 JSON，不要输出任何额外说明或 Markdown 代码块标记（如 ```json）。",
    `【重要规则】：你的所有解读（包括总结、优点、风险等）必须、且只能绝对围绕“本地主结果”中的类型（${localResult.mainResult.label}）展开。严禁出现或解读成任何其他的类型！`,
    "shortSummary 必须是一段 80~120 字的人格描述，只描述当前测试下的你，不写建议、不写 Top3 比较。",
    "所有字段都必须填写真实内容，不得照抄字段说明、示例文案、空字符串或占位数组。",
    "JSON 字段格式：",
    JSON.stringify(
      {
        shortSummary: "",
        title: "",
        narrative: "",
        strengths: ["", "", ""],
        risks: ["", "", ""],
        suggestions: ["", "", ""],
      },
      null,
      2,
    ),
    `测试类型：${testConfig.name}`,
    `测试说明：${testConfig.moduleDescription}`,
    `历史背景：${testConfig.history}`,
    ...dualHighGuidanceLines,
    "本地主结果：",
    JSON.stringify(localResult.mainResult, null, 2),
    "本地 Top3：",
    JSON.stringify(localResult.topThree, null, 2),
  ].join("\n\n");
}

/**
 * 归一化通用 AI 解读结果。
 * @param {object|null} aiData 模型返回。
 * @param {object} testConfig 测试配置。
 * @param {object} localResult 本地结果。
 * @returns {{ shortSummary: string, title: string, narrative: string, strengths: Array<string>, risks: Array<string>, suggestions: Array<string>, generatedAt: number }} 归一化结果。
 */
function normalizeGenericAiInsight(aiData, testConfig, localResult) {
  const fallbackSummaryText =
    String(localResult?.summaryText ?? "").trim() ||
    buildTypeologyPersonalitySummary({
      mainResult: localResult?.mainResult,
      dualHighProfile: localResult?.dualHighProfile ?? null,
    });
  const fallbackTitle = buildGenericFallbackTitle(testConfig, localResult);
  const fallbackNarrative = buildGenericFallbackNarrative(testConfig, localResult);
  const fallbackStrengths = buildGenericFallbackStrengths(localResult);
  const fallbackRisks = buildGenericFallbackRisks(localResult);
  const fallbackSuggestions = buildGenericFallbackSuggestions(localResult);
  const resolvedNarrative = toSafeString(aiData?.narrative, fallbackNarrative);

  return {
    shortSummary: resolveAiShortSummary(
      aiData?.shortSummary,
      fallbackSummaryText,
      resolvedNarrative,
    ),
    title: toSafeString(aiData?.title, fallbackTitle),
    narrative: resolvedNarrative,
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
 * @returns {{ shortSummary: string, title: string, narrative: string, strengths: Array<string>, risks: Array<string>, suggestions: Array<string>, deepMainType: object, deepTopThree: Array<object>, generatedAt: number }} 归一化结果。
 */
function normalizeMbtiAiInsight(deepResult, localResult) {
  const fallbackStrengths = buildMbtiFallbackAiStrengths(localResult);
  const fallbackSummaryText =
    String(localResult?.summaryText ?? "").trim() ||
    buildMbtiPersonalitySummary({
      typeCode: localResult?.mainResult?.key,
      typeTitle: String(localResult?.mainResult?.label ?? "").split("·")[1]?.trim() || "",
    });
  const resolvedNarrative = toSafeString(deepResult?.insight, localResult.insight);

  return {
    shortSummary: resolveAiShortSummary(
      deepResult?.shortSummary,
      fallbackSummaryText,
      resolvedNarrative,
    ),
    title: toSafeString(deepResult?.profileTitle, `${localResult.mainResult.label} · 进阶解读`),
    narrative: resolvedNarrative,
    strengths: toSafeStringArray(
      shouldUpgradeMbtiAiStrengthList(deepResult?.strengths, localResult?.detailTags)
        ? []
        : deepResult?.strengths,
      fallbackStrengths.length > 0
        ? fallbackStrengths
        : ["维度偏好稳定", "类型识别清晰", "具备可迁移的行为优势"],
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
 * 构建类型学进阶解读的稳定兜底结果。
 * 关键逻辑：
 * 1. 当 AI 接口超时、断网或返回异常时，统一回退到同结构的 `aiInsight` 对象；
 * 2. 页面层无需区分“AI 结果”与“本地兜底”，只消费同一份结果结构；
 * 3. 兜底仅在请求失败时触发，不会覆盖已成功返回的 AI 内容。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {object} params.localResult 本地结果。
 * @returns {object} 可直接写入结果缓存的进阶解读对象。
 */
function buildTypeologyAiFallbackInsight({
  testConfig,
  localResult,
}) {
  if (testConfig?.key === "mbti" && localResult?.mbtiLocalResult) {
    return normalizeMbtiAiInsight(null, localResult);
  }

  return normalizeGenericAiInsight(null, testConfig, localResult);
}

/**
 * 执行类型学进阶解读。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {object} params.localResult 本地结果。
 * @param {number} [params.timeoutMs=18000] 超时时间。
 * @param {(fullText: string, deltaText: string) => void} [params.onStreamText] 流式文本回调。
 * @param {AbortSignal} [params.abortSignal] 外部取消信号。
 * @returns {Promise<object>} 归一化后的进阶解读结果。
 */
export async function analyzeTypeologyWithAi({
  testConfig,
  localResult,
  timeoutMs = 18000,
  onStreamText,
  abortSignal,
}) {
  try {
    if (testConfig?.key === "mbti" && localResult?.mbtiLocalResult) {
      const deepResult = await analyzeMbtiWithDeepInsight(
        buildMbtiDeepPayload(localResult),
        {
          timeoutMs,
          onStreamText,
          abortSignal,
        },
      );

      return normalizeMbtiAiInsight(deepResult, localResult);
    }

    const aiData = await requestBailianJson({
      systemPrompt: "请严格根据要求输出 JSON，不要包含任何多余文字或 Markdown 代码块标记（如 ```json）。",
      userPrompt: buildGenericUserPrompt(testConfig, localResult),
      timeoutMs,
      temperature: 0.35,
      onTextUpdate: onStreamText,
      signal: abortSignal,
    });

    return normalizeGenericAiInsight(aiData, testConfig, localResult);
  } catch (error) {
    const normalizedErrorMessage = String(error?.message ?? "").trim();
    if (abortSignal?.aborted || normalizedErrorMessage.includes("请求已取消")) {
      throw error;
    }

    // 关键逻辑：接口失败时仍返回同结构解读对象，避免结果页出现空白“进阶解读”模块。
    return buildTypeologyAiFallbackInsight({
      testConfig,
      localResult,
    });
  }
}
