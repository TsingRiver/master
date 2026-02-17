import { requestBailianJson } from "./bailianClient";

/**
 * 限制数组字符串条目。
 * @param {unknown} rawList 原始列表。
 * @param {number} maxItems 最大条数。
 * @returns {Array<string>} 清洗后的字符串数组。
 */
function normalizeStringList(rawList, maxItems) {
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * 构建古代身份深度分析提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位擅长古风叙事的心理画像分析师。",
    "主身份已由规则模型锁定，你只能做深度解读，不得改动身份名称。",
    "禁止输出或提及 A/B/C/D 类别、选项计数、分值统计过程。",
    "请直接从用户性格、人际风格、处事倾向展开分析。",
    "输出必须是 JSON，不要附加任何解释文字。",
    "字段要求：",
    JSON.stringify(
      {
        identitySeal: "一句古风判词，18-32字，节奏感强",
        insight: "100-160字，说明此身份是如何被触发",
        growthActions: ["建议1", "建议2", "建议3"],
        avoidSignals: ["风险信号1", "风险信号2"],
        narrativeTags: ["标签1", "标签2", "标签3"],
      },
      null,
      2,
    ),
    "主身份（固定不可改）：",
    JSON.stringify(payload.mainIdentity, null, 2),
    "候选 Top3（仅作语义参考）：",
    JSON.stringify(payload.topThree, null, 2),
    "类别统计：",
    JSON.stringify(payload.categoryCounts, null, 2),
    "线别统计：",
    JSON.stringify(payload.lineCounts, null, 2),
    "答卷摘要：",
    payload.summaryLines.join("\n"),
  ].join("\n\n");
}

/**
 * 规范化 AI 结果：
 * 关键逻辑：主身份完全继承本地判定，只增强叙事文案，保证业务规则稳定。
 * @param {object|null} aiData AI 输出。
 * @param {object} payload 本地负载。
 * @returns {{ mainIdentity: object, topThree: Array<object>, identitySeal: string, insight: string, growthActions: Array<string>, avoidSignals: Array<string>, narrativeTags: Array<string> }} 规范化结果。
 */
function normalizeAncientAiResult(aiData, payload) {
  const fallbackIdentitySeal =
    payload.mainIdentity?.slogan ?? "命格已定，风骨自成，一身去处皆江湖。";
  const fallbackInsight =
    payload.mainIdentity?.summary ??
    "你的答卷呈现出明确的决策风格与稳定偏好，因此身份判定具有高一致性。";

  const fallbackGrowthActions = normalizeStringList(payload.growthActions, 3);
  const fallbackAvoidSignals = normalizeStringList(payload.avoidSignals, 2);
  const fallbackTags = [
    payload.mainIdentity?.coreTag,
    payload.dominantCategoryLabel,
    payload.dominantLineLabel,
  ]
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!aiData || typeof aiData !== "object") {
    return {
      mainIdentity: payload.mainIdentity,
      topThree: payload.topThree,
      identitySeal: fallbackIdentitySeal,
      insight: fallbackInsight,
      growthActions: fallbackGrowthActions,
      avoidSignals: fallbackAvoidSignals,
      narrativeTags: fallbackTags,
    };
  }

  const identitySeal = String(aiData.identitySeal ?? "").trim() || fallbackIdentitySeal;
  const insight = String(aiData.insight ?? "").trim() || fallbackInsight;
  const growthActions = normalizeStringList(aiData.growthActions, 3);
  const avoidSignals = normalizeStringList(aiData.avoidSignals, 2);
  const narrativeTags = normalizeStringList(aiData.narrativeTags, 3);

  return {
    mainIdentity: payload.mainIdentity,
    topThree: payload.topThree,
    identitySeal,
    insight,
    growthActions: growthActions.length > 0 ? growthActions : fallbackGrowthActions,
    avoidSignals: avoidSignals.length > 0 ? avoidSignals : fallbackAvoidSignals,
    narrativeTags: narrativeTags.length > 0 ? narrativeTags : fallbackTags,
  };
}

/**
 * 执行古代身份深度解析。
 * @param {object} payload 请求负载。
 * @param {object} payload.mainIdentity 主身份（本地锁定）。
 * @param {Array<object>} payload.topThree 候选 Top3。
 * @param {object} payload.categoryCounts 分类统计。
 * @param {object} payload.lineCounts 线别统计。
 * @param {Array<string>} payload.summaryLines 答卷摘要。
 * @param {Array<string>} payload.growthActions 本地成长建议。
 * @param {Array<string>} payload.avoidSignals 本地风险提示。
 * @param {string} payload.dominantCategoryLabel 主导类别说明。
 * @param {string} payload.dominantLineLabel 主导线别说明。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=22000] 超时时间。
 * @returns {Promise<{ mainIdentity: object, topThree: Array<object>, identitySeal: string, insight: string, growthActions: Array<string>, avoidSignals: Array<string>, narrativeTags: Array<string> }>} 深度结果。
 */
export async function analyzeAncientIdentityWithDeepInsight(
  payload,
  options = {},
) {
  const aiData = await requestBailianJson({
    systemPrompt:
      "你是古风人格分析师。必须严格返回 JSON，不得输出 Markdown 或额外解释。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 22000,
    temperature: 0.58,
  });

  return normalizeAncientAiResult(aiData, payload);
}
