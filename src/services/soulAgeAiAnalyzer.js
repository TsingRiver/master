import { requestBailianJson } from "./bailianClient";

/**
 * 归一化文本。
 * @param {unknown} value 输入值。
 * @param {string} fallbackText 兜底文本。
 * @param {number} maxLength 最大长度。
 * @returns {string} 归一化文本。
 */
function normalizeText(value, fallbackText, maxLength) {
  const normalizedText = String(value ?? "").trim();
  if (!normalizedText) {
    return fallbackText;
  }

  return normalizedText.slice(0, maxLength);
}

/**
 * 归一化字符串数组。
 * @param {unknown} value 输入值。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 返回上限。
 * @returns {Array<string>} 归一化列表。
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
 * 构建 AI 提示词。
 * @param {object} payload 深度分析请求负载。
 * @param {number} payload.soulAge 灵魂年龄。
 * @param {string} payload.ageTitle 年龄标签标题。
 * @param {string} payload.summaryLine 一句话总结。
 * @param {Array<object>} payload.radarItems 雷达维度数组。
 * @param {Array<object>} payload.keywordCards 关键词卡片数组。
 * @param {Array<object>} payload.adviceCards 本地建议卡片数组。
 * @param {Array<string>} payload.summaryLines 答卷摘要数组。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  const radarSnapshot = (payload.radarItems ?? []).map((item) => ({
    name: item.label,
    score: Number(item.score ?? 0),
    insight: item.insight,
  }));

  const localAdviceList = (payload.adviceCards ?? []).map((item) => item.text);
  const keywordList = (payload.keywordCards ?? []).map((item) => item.keyword);

  return [
    "你是一位中文心理内容编辑与情绪成长教练。",
    "请基于用户灵魂年龄测试结果，输出可直接展示的深度解读。",
    "只允许输出 JSON，不要输出任何额外说明。",
    "语气要求：温柔、真实、有行动性，不要鸡汤和空话。",
    "字段规范：",
    JSON.stringify(
      {
        deepInsight: "220~360字，需包含：现状解读 + 风险提醒 + 下一步建议",
        growthActions: ["行动建议1", "行动建议2", "行动建议3"],
        avoidSignals: ["风险信号1", "风险信号2"],
        resonanceLine: "一句同频人群描述，40字以内",
      },
      null,
      2,
    ),
    "用户画像输入：",
    JSON.stringify(
      {
        soulAge: Number(payload.soulAge ?? 0),
        ageTitle: payload.ageTitle,
        summaryLine: payload.summaryLine,
        radar: radarSnapshot,
        keywords: keywordList,
        localAdvice: localAdviceList,
      },
      null,
      2,
    ),
    "答卷摘要（前 12 条）：",
    (payload.summaryLines ?? []).slice(0, 12).join("\n"),
  ].join("\n\n");
}

/**
 * 构建兜底 AI 结果。
 * @param {object} payload 深度分析请求负载。
 * @returns {{ deepInsight: string, growthActions: Array<string>, avoidSignals: Array<string>, resonanceLine: string }} 兜底结果。
 */
function buildFallbackAiResult(payload) {
  const localAdviceList = (payload.adviceCards ?? [])
    .map((item) => String(item?.text ?? "").trim())
    .filter(Boolean);

  const growthActions =
    localAdviceList.length > 0
      ? localAdviceList.slice(0, 3)
      : [
          "每周给自己预留一段固定的恢复时间，让情绪有稳定出口。",
          "遇到重要关系议题时，先表达真实感受，再讨论方案。",
          "把一个长期目标拆成小步行动，降低焦虑与拖延。",
        ];

  return {
    deepInsight:
      "你正在理性与感性之间寻找更舒服的平衡。你已经具备一定的自我觉察能力，但在压力阶段仍可能出现“过度内耗或过度克制”的波动。下一步最关键的，不是追求完美状态，而是建立可持续的节奏：先稳住日常作息和边界，再把真正重要的关系与目标放在前面。只要持续做小而稳定的行动，你的安全感与行动力会同步提升。",
    growthActions,
    avoidSignals: [
      "长期压抑情绪、对外只说“我没事”",
      "被短期情绪牵引，打乱长期计划节奏",
    ],
    resonanceLine:
      String(payload.resonanceLine ?? "").trim() ||
      "你和稳定成长型、情绪成熟型的人更容易长期同频。",
  };
}

/**
 * 标准化 AI 输出。
 * @param {object|null} aiData AI 输出对象。
 * @param {object} payload 深度分析请求负载。
 * @returns {{ deepInsight: string, growthActions: Array<string>, avoidSignals: Array<string>, resonanceLine: string }} 标准化结果。
 */
function normalizeSoulAgeAiResult(aiData, payload) {
  const fallbackResult = buildFallbackAiResult(payload);
  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  return {
    deepInsight: normalizeText(
      aiData.deepInsight,
      fallbackResult.deepInsight,
      420,
    ),
    growthActions: normalizeStringList(
      aiData.growthActions,
      fallbackResult.growthActions,
      3,
    ),
    avoidSignals: normalizeStringList(
      aiData.avoidSignals,
      fallbackResult.avoidSignals,
      2,
    ),
    resonanceLine: normalizeText(
      aiData.resonanceLine,
      fallbackResult.resonanceLine,
      64,
    ),
  };
}

/**
 * 调用 AI 生成灵魂年龄深度解读。
 * @param {object} payload 深度分析请求负载。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=22000] 请求超时毫秒数。
 * @returns {Promise<{ deepInsight: string, growthActions: Array<string>, avoidSignals: Array<string>, resonanceLine: string }>} AI 结果。
 */
export async function analyzeSoulAgeWithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt:
      "你是中文心理测评解读师。严格输出 JSON，不得包含 Markdown 和额外解释。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 22000,
    temperature: 0.45,
  });

  return normalizeSoulAgeAiResult(aiData, payload);
}
