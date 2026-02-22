import { requestBailianJson } from "./bailianClient";

/**
 * 归一化文本值。
 * @param {unknown} value 文本输入。
 * @param {string} fallbackText 兜底文案。
 * @returns {string} 可用文本。
 */
function normalizeText(value, fallbackText) {
  const normalizedText = String(value ?? "").trim();
  return normalizedText || fallbackText;
}

/**
 * 归一化标签列表。
 * @param {unknown} value 标签输入。
 * @param {Array<string>} fallbackTags 兜底标签。
 * @returns {Array<string>} 标签数组。
 */
function normalizeTagChips(value, fallbackTags) {
  if (!Array.isArray(value)) {
    return fallbackTags.slice(0, 4);
  }

  const normalizedTags = value
    .map((tagItem) => String(tagItem ?? "").trim())
    .filter(Boolean)
    .slice(0, 4);

  return normalizedTags.length > 0 ? normalizedTags : fallbackTags.slice(0, 4);
}

/**
 * 构建发送给 AI 的提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位中文情绪疗愈文案作者，风格温柔、具体、易读。",
    "请基于给定测试结果，输出“灵魂猫咪”结果页解读文案。",
    "注意：不要改动猫咪类型，不要输出恐吓、宿命化表达。",
    "只允许输出 JSON，不要输出任何额外文字。",
    "字段规范：",
    JSON.stringify(
      {
        highlightCard: {
          title: "猫咪标签",
          content: "18字以内，突出该类型一句话标签",
        },
        insight: "70-120字，整体解读",
        personalityBase: "40-80字，性格底色",
        nextLifeScript: "40-80字，下辈子剧本",
        bestLife: "30-60字，最适合你的生活",
        healingMessage: "20-50字，专属治愈寄语",
        tagChips: ["标签1", "标签2", "标签3"],
      },
      null,
      2,
    ),
    "猫咪类型（固定，不可改名）：",
    JSON.stringify(payload.mainProfile, null, 2),
    "本地候选 Top3（参考，不强制复述）：",
    JSON.stringify(payload.localTopThree, null, 2),
    "本轮答题摘要（节选）：",
    Array.isArray(payload.summaryLines) ? payload.summaryLines.slice(0, 12).join("\n") : "",
    "本地叙事参考：",
    String(payload.localNarrative ?? ""),
  ].join("\n\n");
}

/**
 * 归一化 AI 返回结果。
 * @param {object|null} aiData AI 输出 JSON。
 * @param {object} payload 请求负载。
 * @returns {{ highlightCard: { title: string, content: string }, insight: string, personalityBase: string, nextLifeScript: string, bestLife: string, healingMessage: string, tagChips: Array<string> }} 标准化结果。
 */
function normalizeSoulCatAiResult(aiData, payload) {
  const mainProfile = payload?.mainProfile ?? {};
  const fallbackHighlightContent = normalizeText(
    mainProfile.tagLine,
    "你的灵魂有独特而温柔的光",
  );
  const fallbackInsight = normalizeText(
    payload?.localNarrative,
    "你的选择呈现出稳定而清晰的情绪风格，说明你知道自己需要什么样的关系与生活节奏。",
  );

  const fallbackResult = {
    highlightCard: {
      title: "猫咪标签",
      content: fallbackHighlightContent,
    },
    insight: fallbackInsight,
    personalityBase: normalizeText(
      mainProfile.personalityBase,
      "你内在有稳定而柔软的能量，面对关系与生活时更重视真实和安全感。",
    ),
    nextLifeScript: normalizeText(
      mainProfile.nextLifeScript,
      "你会在更轻松的关系里被理解与接纳，不必总是逞强。",
    ),
    bestLife: normalizeText(
      mainProfile.bestLife,
      "慢节奏、有人陪伴、可持续的生活状态会让你长期舒服。",
    ),
    healingMessage: normalizeText(
      mainProfile.healingMessage,
      "愿你始终被温柔接住，也学会温柔对待自己。",
    ),
    tagChips: [fallbackHighlightContent],
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedHighlightCard =
    aiData.highlightCard && typeof aiData.highlightCard === "object"
      ? {
          title: normalizeText(aiData.highlightCard.title, "猫咪标签"),
          content: normalizeText(
            aiData.highlightCard.content,
            fallbackResult.highlightCard.content,
          ),
        }
      : fallbackResult.highlightCard;

  return {
    highlightCard: normalizedHighlightCard,
    insight: normalizeText(aiData.insight, fallbackResult.insight),
    personalityBase: normalizeText(
      aiData.personalityBase,
      fallbackResult.personalityBase,
    ),
    nextLifeScript: normalizeText(
      aiData.nextLifeScript,
      fallbackResult.nextLifeScript,
    ),
    bestLife: normalizeText(aiData.bestLife, fallbackResult.bestLife),
    healingMessage: normalizeText(
      aiData.healingMessage,
      fallbackResult.healingMessage,
    ),
    tagChips: normalizeTagChips(aiData.tagChips, fallbackResult.tagChips),
  };
}

/**
 * 生成灵魂猫咪 AI 解读。
 * 复杂度评估：
 * 1. 本地归一化处理：O(S)，S 为摘要行数量（当前最多 16，常量级）。
 * 2. 网络请求主耗时由模型推理决定，CPU 侧开销可忽略。
 * @param {object} payload 请求负载。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=18000] 超时时间（毫秒）。
 * @returns {Promise<{ highlightCard: { title: string, content: string }, insight: string, personalityBase: string, nextLifeScript: string, bestLife: string, healingMessage: string, tagChips: Array<string> }>} 标准化 AI 结果。
 */
export async function analyzeSoulCatWithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt:
      "你是中文疗愈风格文案专家。请严格输出 JSON，不要输出 Markdown 和额外解释。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.55,
    switchModelOnTimeout: true,
  });

  return normalizeSoulCatAiResult(aiData, payload);
}
