import { requestBailianJson } from "./bailianClient";
import { sanitizeAiCopyText } from "./aiCopySanitizer.js";

/**
 * 规范化非空字符串。
 * @param {unknown} value 任意输入值。
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
 * 构建多维人格画像 System Prompt。
 * 关键逻辑：保留“稀有/独特/有张力”的叙事方向，同时强制模型返回 JSON 结构，保证前端稳定渲染。
 * @returns {string} System Prompt。
 */
function buildTypeologyProfileSystemPrompt() {
  return [
    "【Role】",
    "你是一位精通荣格分析心理学、大五人格理论，且深谙人性洞察的资深心理侧写师。你的语言风格深邃、精准、带有恰到好处的文学色彩与神秘感。",
    "【Task】",
    "根据用户提供的多维心理测试结果，为其生成一段 300 字左右的专属人格侧写。",
    "【Rules - 极其重要】",
    "1. 仔细审视用户的数据，如果存在明显的属性冲突，绝对不能说这是测试误差。",
    "2. 将这些冲突解读为用户“极度稀有”“独特”“充满内在张力”的证明。",
    "3. 若输入中存在 matchedTags 或 systemInsightTexts，请优先围绕这些标签解释用户的特殊性。",
    "4. 在开头或结尾明确点出：这种组合在我们的样本中并不常见，让用户感受到被深刻理解。",
    "5. 文中允许提及一两个学术词汇，例如 Fi 内倾情感、认知资源分配、防御机制，但不要写成教科书。",
    "6. 如果输入中没有明显冲突，请把重点放在“多维一致性”与“稳定核心优势”上，不要强行制造矛盾。",
    "【Output Requirement】",
    "必须严格输出 JSON，不要输出任何额外说明。JSON 结构如下：",
    JSON.stringify(
      {
        title: "稀有张力型",
        corePortrait: "你的人格底盘有清晰主线，同时保留少见的复合信号。",
        tensionAnalysis: "这些看似相反的特质并不是误差，而是你在不同场景调度心理资源的证据。",
        growthAdvice: "真正的成长不是抹平张力，而是学会识别何时放大优势、何时收束能量。",
      },
      null,
      2,
    ),
  ].join("\n\n");
}

/**
 * 构建多维人格画像 User Prompt。
 * @param {object} finalProfile 聚合后的最终画像对象。
 * @returns {string} User Prompt。
 */
function buildTypeologyProfileUserPrompt(finalProfile) {
  const otherResults = Array.isArray(finalProfile?.otherResults)
    ? finalProfile.otherResults.map((resultItem) => ({
        testKey: resultItem.testKey,
        testName: resultItem.testName,
        resultKey: resultItem.resultKey,
        resultLabel: resultItem.resultLabel,
        displayValue: resultItem.displayValue,
      }))
    : [];

  return [
    "请基于以下结构化输入生成多维人格侧写。",
    "【Input Data】",
    JSON.stringify(
      {
        user: {
          mbti: finalProfile?.baseMbti || "未完成",
          otherResults,
          matchedTags: Array.isArray(finalProfile?.specialTags) ? finalProfile.specialTags : [],
          systemInsightTexts: Array.isArray(finalProfile?.systemInsightTexts)
            ? finalProfile.systemInsightTexts
            : [],
        },
      },
      null,
      2,
    ),
  ].join("\n\n");
}

/**
 * 构建 AI 失败时的本地兜底多维人格侧写。
 * @param {object} finalProfile 聚合后的最终画像对象。
 * @returns {{ title: string, corePortrait: string, tensionAnalysis: string, growthAdvice: string, generatedAt: number }} 兜底结果。
 */
export function buildFallbackTypeologyProfileAiInsight(finalProfile) {
  const completedTraits = Array.isArray(finalProfile?.completedTraits)
    ? finalProfile.completedTraits
    : [];
  const otherResults = Array.isArray(finalProfile?.otherResults)
    ? finalProfile.otherResults
    : [];
  const primaryTraitText = otherResults
    .slice(0, 3)
    .map((resultItem) => `${resultItem.testName}${resultItem.resultLabel ? `：${resultItem.resultLabel}` : ""}`)
    .join("、");
  const rareTagText = Array.isArray(finalProfile?.specialTags) ? finalProfile.specialTags : [];
  const rareInsightText = Array.isArray(finalProfile?.systemInsightTexts)
    ? finalProfile.systemInsightTexts
    : [];

  const foundationText = finalProfile?.baseMbti
    ? `你的基石类型更接近 ${finalProfile.baseMbti}，说明人格底盘有一条相对稳定的认知主线。`
    : "你当前的多维结果已经能看出一条相对稳定的人格主线，但若补完 MBTI，画像会更完整。";

  const corePortrait = [
    foundationText,
    primaryTraitText
      ? `目前已完成的维度里，${primaryTraitText} 共同勾勒出你“内核明确、表达按场景切换”的画像。`
      : `当前已完成 ${completedTraits.length} 个维度，整体画像更偏向稳定、自洽、可持续输出。`,
  ].join("");

  const tensionAnalysis = rareTagText.length > 0
    ? `系统识别到 ${rareTagText.join("、")}。${rareInsightText[0] ?? "这意味着你并不是单一路径人格，而是会依据场景主动调度不同心理资源。"}`
    : "当前多维结果没有出现明显冲突，更像是一组相互印证的稳定特质。这说明你的认知资源分配相对集中，做决定时不容易被短期噪音拉偏。";

  const growthAdvice = finalProfile?.baseMbti
    ? "建议把 MBTI 主线当作长期优势锚点，把其他维度当作场景开关：顺风时放大优势，压力时观察自己是否过度固化到单一模式。真正的成长，不是变成另一种人，而是学会更自由地切换。"
    : "建议先补完 MBTI，再观察其他维度与它的关系。真正有效的成长，不是急着给自己贴更多标签，而是先看清哪条主线最稳定，再决定哪些能力需要被扩展。";

  return {
    title: finalProfile?.baseMbti
      ? `${finalProfile.baseMbti} · 多维侧写`
      : "多维人格侧写",
    corePortrait,
    tensionAnalysis,
    growthAdvice,
    generatedAt: Date.now(),
  };
}

/**
 * 标准化 AI 返回结构。
 * @param {object|null} aiData AI 输出对象。
 * @param {object} finalProfile 聚合后的最终画像对象。
 * @returns {{ title: string, corePortrait: string, tensionAnalysis: string, growthAdvice: string, generatedAt: number }} 标准化结果。
 */
function normalizeTypeologyProfileAiInsight(aiData, finalProfile) {
  const fallbackInsight = buildFallbackTypeologyProfileAiInsight(finalProfile);

  return {
    title: toSafeString(aiData?.title, fallbackInsight.title),
    corePortrait: toSafeString(aiData?.corePortrait, fallbackInsight.corePortrait),
    tensionAnalysis: toSafeString(
      aiData?.tensionAnalysis,
      fallbackInsight.tensionAnalysis,
    ),
    growthAdvice: toSafeString(aiData?.growthAdvice, fallbackInsight.growthAdvice),
    generatedAt: Date.now(),
  };
}

/**
 * 调用 AI 生成多维人格侧写。
 * 复杂度评估：
 * 1. 本地拼接 Prompt 为 O(T)，T 为已完成维度数量。
 * 2. 总耗时主要由外部 AI 网络调用决定。
 * @param {object} finalProfile 聚合后的最终画像对象。
 * @param {object} [options] 调用配置。
 * @param {number} [options.timeoutMs=22000] 超时时间。
 * @param {AbortSignal} [options.abortSignal] 取消信号。
 * @returns {Promise<{ title: string, corePortrait: string, tensionAnalysis: string, growthAdvice: string, generatedAt: number }>} 标准化结果。
 */
export async function analyzeTypeologyProfileWithAi(finalProfile, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: buildTypeologyProfileSystemPrompt(),
    userPrompt: buildTypeologyProfileUserPrompt(finalProfile),
    timeoutMs: options.timeoutMs ?? 22000,
    temperature: 0.55,
    maxTokens: 900,
    stream: false,
    signal: options.abortSignal,
  });

  return normalizeTypeologyProfileAiInsight(aiData, finalProfile);
}
