import { requestBailianJson } from "./bailianClient";

/**
 * 依恋类型名称映射。
 */
const TYPE_NAME_MAP = {
  secure: "安全依恋型",
  anxious: "焦虑依恋型",
  avoidant: "回避依恋型",
  fearful: "焦虑-回避矛盾型",
};

/**
 * 依恋类型颜色映射（用于分布条展示）。
 */
const TYPE_COLOR_MAP = {
  secure: "#45A67E",
  anxious: "#F3A45A",
  avoidant: "#5F88DF",
  fearful: "#A973DA",
};

/**
 * 依恋类型键列表。
 */
const TYPE_KEYS = Object.keys(TYPE_NAME_MAP);

/**
 * 限制分值到 [0, 100]。
 * @param {number} score 原始分值。
 * @returns {number} 合法分值。
 */
function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Number(score.toFixed(1))));
}

/**
 * 归一化标签数组。
 * @param {unknown} tags 标签输入。
 * @param {Array<string>} fallbackTags 兜底标签。
 * @returns {Array<string>} 标签数组（最多 6 条）。
 */
function normalizeTags(tags, fallbackTags) {
  if (!Array.isArray(tags)) {
    return fallbackTags.slice(0, 6);
  }

  const normalizedTags = tags
    .map((tagItem) => String(tagItem ?? "").trim())
    .filter(Boolean)
    .map((tagItem) => (tagItem.startsWith("#") ? tagItem : `#${tagItem}`))
    .slice(0, 6);

  return normalizedTags.length > 0 ? normalizedTags : fallbackTags.slice(0, 6);
}

/**
 * 归一化字符串列表。
 * @param {unknown} value 输入值。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 条目上限。
 * @returns {Array<string>} 归一化后的列表。
 */
function normalizeStringList(value, fallbackList, limit) {
  if (!Array.isArray(value)) {
    return fallbackList.slice(0, limit);
  }

  const normalizedList = value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, limit);

  return normalizedList.length > 0 ? normalizedList : fallbackList.slice(0, limit);
}

/**
 * 将长文本拆分为要点列表。
 * @param {unknown} text 文本输入。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 输出上限。
 * @returns {Array<string>} 要点列表。
 */
function splitTextToPoints(text, fallbackList, limit) {
  const normalizedText = String(text ?? "").trim();
  if (!normalizedText) {
    return fallbackList.slice(0, limit);
  }

  const splitList = normalizedText
    .split(/[。！？；\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);

  return splitList.length > 0 ? splitList : fallbackList.slice(0, limit);
}

/**
 * 构建发送给 AI 的提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位中文亲密关系测评分析师。",
    "请基于答卷输出恋爱依恋结果报告。",
    "必须只输出 JSON，不要输出任何额外说明。",
    "字段规范：",
    JSON.stringify(
      {
        mainType: { key: "secure|anxious|avoidant|fearful", name: "类型名", score: 0 },
        oneLineSummary: "一句话概述，50字以内",
        tags: ["#标签1", "#标签2", "#标签3", "#标签4"],
        distribution: [
          { key: "secure", score: 0 },
          { key: "anxious", score: 0 },
          { key: "avoidant", score: 0 },
          { key: "fearful", score: 0 },
        ],
        familyPortraitPoints: ["画像点1", "画像点2", "画像点3", "画像点4"],
        whyPatternPoints: ["机制点1", "机制点2", "机制点3", "机制点4"],
        familyPortrait: "可选补充长文，120字以内",
        whyPattern: "可选补充长文，120字以内",
        insight: "综合说明，180字以内",
        strengths: ["优势1", "优势2", "优势3", "优势4", "优势5"],
        risks: ["风险1", "风险2", "风险3", "风险4", "风险5"],
        actions: ["建议1", "建议2", "建议3", "建议4", "建议5"],
      },
      null,
      2,
    ),
    "候选类型（必须从中选择）：",
    JSON.stringify(payload.typeCandidates, null, 2),
    "本地分布参考：",
    JSON.stringify(payload.localDistribution, null, 2),
    "本地主类型参考：",
    JSON.stringify(payload.localMainType, null, 2),
    "答卷摘要（节选）：",
    payload.summaryLines.slice(0, 25).join("\n"),
  ].join("\n\n");
}

/**
 * 解析合法类型键。
 * @param {unknown} rawKey 原始类型键。
 * @param {unknown} rawName 原始类型名称。
 * @returns {string} 合法类型键。
 */
function resolveTypeKey(rawKey, rawName) {
  const normalizedKey = String(rawKey ?? "").trim();
  if (TYPE_KEYS.includes(normalizedKey)) {
    return normalizedKey;
  }

  const normalizedName = String(rawName ?? "").trim();
  const matchedEntry = Object.entries(TYPE_NAME_MAP).find(([, typeName]) => typeName === normalizedName);
  return matchedEntry?.[0] ?? "secure";
}

/**
 * 将任意分值数组标准化为百分比占比。
 * @param {Array<{ key: string, score: number }>} distributionList 分布列表。
 * @returns {Array<{ key: string, score: number }>} 标准化分布列表（总和约 100）。
 */
function normalizeDistributionPercent(distributionList) {
  const safeList = TYPE_KEYS.map((typeKey) => {
    const matchedItem = distributionList.find((item) => item.key === typeKey);
    return {
      key: typeKey,
      score: Math.max(0, Number(matchedItem?.score ?? 0)),
    };
  });

  const totalScore = safeList.reduce((sum, item) => sum + item.score, 0);
  if (totalScore <= 0) {
    return TYPE_KEYS.map((typeKey) => ({ key: typeKey, score: 25 }));
  }

  const normalizedList = safeList.map((item) => ({
    key: item.key,
    score: clampScore((item.score / totalScore) * 100),
  }));

  return normalizedList;
}

/**
 * 标准化 AI 返回结果。
 * @param {object|null} aiData AI 输出。
 * @param {object} payload 请求负载。
 * @returns {{ mainType: object, oneLineSummary: string, tags: Array<string>, distribution: Array<object>, familyPortrait: string, whyPattern: string, familyPortraitPoints: Array<string>, whyPatternPoints: Array<string>, insight: string, strengths: Array<string>, risks: Array<string>, actions: Array<string> }} 标准化结果。
 */
function normalizeAiResult(aiData, payload) {
  const localDistribution = Array.isArray(payload.localDistribution)
    ? payload.localDistribution
    : [];

  const fallbackMainTypeKey = payload.localMainType?.key ?? localDistribution[0]?.key ?? "secure";
  const fallbackMainTypeName = TYPE_NAME_MAP[fallbackMainTypeKey] ?? TYPE_NAME_MAP.secure;

  const fallbackTypeEntry = payload.typeCandidates.find(
    (item) => item.key === fallbackMainTypeKey,
  );

  const fallbackResult = {
    mainType: {
      key: fallbackMainTypeKey,
      name: fallbackMainTypeName,
      score: clampScore(payload.localMainType?.score ?? localDistribution[0]?.score ?? 0),
    },
    oneLineSummary: fallbackTypeEntry?.summary ?? "你的依恋模式具有可调整空间，关系质量可以通过练习持续优化。",
    tags: fallbackTypeEntry?.tags ?? ["#关系修复", "#情绪觉察", "#边界沟通"],
    distribution: localDistribution,
    familyPortrait:
      fallbackTypeEntry?.familyPortrait ??
      "你在亲密关系中的反应模式，通常与早期“被回应方式”有关。看见它，并不等于被它限制。",
    whyPattern:
      fallbackTypeEntry?.whyPattern ??
      "当关系触发不确定感时，你会使用熟悉的保护策略。这些策略曾经帮助过你，但在当前关系中可能需要升级。",
    familyPortraitPoints:
      fallbackTypeEntry?.familyPortraitPoints ??
      splitTextToPoints(
        fallbackTypeEntry?.familyPortrait,
        [
          "你对关系安全感的形成，和早期回应体验高度相关。",
          "你在亲密中的默认反应并非“性格缺陷”，而是历史策略。",
          "看见自己的模式，是开始调整关系质量的第一步。",
          "稳定、可预测的连接，会逐步改写旧有关系脚本。",
        ],
        5,
      ),
    whyPatternPoints:
      fallbackTypeEntry?.whyPatternPoints ??
      splitTextToPoints(
        fallbackTypeEntry?.whyPattern,
        [
          "关系触发点会激活你最熟悉的保护机制。",
          "你的情绪反应速度往往快于理性判断速度。",
          "当焦虑上升时，旧模式会被自动调用。",
          "通过新沟通动作重复练习，模式可以被更新。",
        ],
        5,
      ),
    insight:
      "结果不是给你贴标签，而是帮助你理解自己的触发点与修复路径，让关系更稳定。",
    strengths:
      fallbackTypeEntry?.strengths ?? [
        "有关系投入意愿",
        "对关系变化有感知",
        "具备调整可能性",
        "对亲密议题有自我反思能力",
        "愿意为关系质量投入行动",
      ],
    risks:
      fallbackTypeEntry?.risks ?? [
        "高压时容易回到旧模式",
        "未表达需求会累积误解",
        "关系触发点管理不足",
        "在情绪高峰做终局判断",
        "修复动作频率不足",
      ],
    actions:
      fallbackTypeEntry?.actions ?? [
        "先表达事实再表达情绪",
        "把需求说具体",
        "建立固定修复节奏",
        "给冲突设置回聊时间点",
        "每周做一次关系复盘",
      ],
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const resolvedMainTypeKey = resolveTypeKey(aiData?.mainType?.key, aiData?.mainType?.name);
  const resolvedMainTypeName = TYPE_NAME_MAP[resolvedMainTypeKey];

  const aiDistributionList = Array.isArray(aiData.distribution)
    ? aiData.distribution.map((item) => ({
        key: resolveTypeKey(item?.key, item?.name),
        score: Number(item?.score ?? 0),
      }))
    : localDistribution.map((item) => ({ key: item.key, score: item.score }));

  const normalizedDistribution = normalizeDistributionPercent(aiDistributionList)
    .map((item) => ({
      key: item.key,
      name: TYPE_NAME_MAP[item.key],
      color: TYPE_COLOR_MAP[item.key],
      score: item.score,
    }))
    .sort((leftItem, rightItem) => rightItem.score - leftItem.score);

  const mainFromDistribution = normalizedDistribution.find(
    (item) => item.key === resolvedMainTypeKey,
  );

  const fallbackTypeInfo = payload.typeCandidates.find(
    (item) => item.key === resolvedMainTypeKey,
  );

  return {
    mainType: {
      key: resolvedMainTypeKey,
      name: resolvedMainTypeName,
      score: clampScore(aiData?.mainType?.score ?? mainFromDistribution?.score ?? 0),
    },
    oneLineSummary:
      typeof aiData.oneLineSummary === "string" && aiData.oneLineSummary.trim()
        ? aiData.oneLineSummary.trim()
        : fallbackTypeInfo?.summary ?? fallbackResult.oneLineSummary,
    tags: normalizeTags(aiData.tags, fallbackTypeInfo?.tags ?? fallbackResult.tags),
    distribution: normalizedDistribution,
    familyPortrait:
      typeof aiData.familyPortrait === "string" && aiData.familyPortrait.trim()
        ? aiData.familyPortrait.trim()
        : fallbackTypeInfo?.familyPortrait ?? fallbackResult.familyPortrait,
    whyPattern:
      typeof aiData.whyPattern === "string" && aiData.whyPattern.trim()
        ? aiData.whyPattern.trim()
        : fallbackTypeInfo?.whyPattern ?? fallbackResult.whyPattern,
    familyPortraitPoints: normalizeStringList(
      aiData.familyPortraitPoints,
      fallbackTypeInfo?.familyPortraitPoints ??
        splitTextToPoints(
          aiData.familyPortrait,
          fallbackResult.familyPortraitPoints,
          5,
        ),
      5,
    ),
    whyPatternPoints: normalizeStringList(
      aiData.whyPatternPoints,
      fallbackTypeInfo?.whyPatternPoints ??
        splitTextToPoints(
          aiData.whyPattern,
          fallbackResult.whyPatternPoints,
          5,
        ),
      5,
    ),
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    strengths: normalizeStringList(
      aiData.strengths,
      fallbackTypeInfo?.strengths ?? fallbackResult.strengths,
      5,
    ),
    risks: normalizeStringList(
      aiData.risks,
      fallbackTypeInfo?.risks ?? fallbackResult.risks,
      5,
    ),
    actions: normalizeStringList(
      aiData.actions,
      fallbackTypeInfo?.actions ?? fallbackResult.actions,
      5,
    ),
  };
}

/**
 * 调用 AI 生成恋爱心理结果。
 * @param {object} payload 请求负载。
 * @param {Array<object>} payload.typeCandidates 类型候选。
 * @param {Array<object>} payload.localDistribution 本地分布。
 * @param {object} payload.localMainType 本地主类型。
 * @param {Array<string>} payload.summaryLines 答卷摘要。
 * @param {object} [options] 运行配置。
 * @param {number} [options.timeoutMs=20000] 超时时间（毫秒）。
 * @returns {Promise<object>} 标准化 AI 结果。
 */
export async function analyzeLoveAttachmentWithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是中文亲密关系分析师。严格输出 JSON，不得附加任何解释。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 20000,
    temperature: 0.4,
  });

  return normalizeAiResult(aiData, payload);
}
