import { requestBailianJson } from "./bailianClient";

/**
 * 归一化文本值。
 * @param {unknown} value 原始值。
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
 * 归一化字符串列表。
 * @param {unknown} value 原始值。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 列表长度上限。
 * @returns {Array<string>} 归一化后的字符串列表。
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
 * 构建发送给 AI 的提示词。
 * @param {object} payload 深度分析负载。
 * @param {Array<string>} payload.summaryLines 答卷摘要文本。
 * @param {object} payload.coreProfile 核心五行信息。
 * @param {object} payload.elementPercentages 五行占比。
 * @param {Array<object>} payload.candidateCities 城市候选（TopK）。
 * @param {Array<object>} payload.localTopThree 本地 Top3。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  const localTopThree = Array.isArray(payload?.localTopThree)
    ? payload.localTopThree
    : [];
  const compactSummaryLines = Array.isArray(payload?.summaryLines)
    ? payload.summaryLines.slice(0, 12)
    : [];
  const compactCandidateCities = Array.isArray(payload?.candidateCities)
    ? payload.candidateCities.slice(0, 10).map((cityItem) => ({
      name: cityItem?.name,
      score: cityItem?.score,
      coreElementLabels: cityItem?.coreElementLabels,
      tags: cityItem?.tags,
    }))
    : [];

  return [
    "你是一位中文生活方式顾问与心理测试文案专家。",
    "请基于用户五行能量结果，生成更有温度、可读性强的城市匹配解读。",
    "硬性要求：",
    "1. 只输出 JSON，不要输出任何额外文字或 Markdown。",
    "2. 禁止使用术语化表达（例如：语义化结论生成、结构化偏好拟合、生活习惯映射）。",
    "3. 文案要像给用户解释，不要像给产品经理写方案。",
    "4. 城市相关字段只能从候选城市中选择。",
    "JSON 模板：",
    JSON.stringify(
      {
        insight: "180字以内，解释用户当前能量状态与城市匹配方向",
        highlightCard: {
          title: "高亮标题（16字以内）",
          content: "80字以内，给出可执行建议",
        },
        cityReasonLines: [
          "城市匹配原因1（35字以内）",
          "城市匹配原因2（35字以内）",
          "城市匹配原因3（35字以内）",
        ],
        energyInterpretationLines: [
          "金·鎏序：...",
          "木·森屿：...",
          "水·沧澜：...",
          "火·曜阳：...",
          "土·坤域：...",
        ],
        topThreeHighlights: [
          {
            name: "城市名（必须在候选中）",
            highlight: "该城市亮点（36字以内）",
          },
          {
            name: "城市名（必须在候选中）",
            highlight: "该城市亮点（36字以内）",
          },
          {
            name: "城市名（必须在候选中）",
            highlight: "该城市亮点（36字以内）",
          },
        ],
        typeCardItems: [
          { label: "建议重心", value: "一句话" },
          { label: "生活节奏", value: "一句话" },
          { label: "城市选择", value: "一句话" },
        ],
      },
      null,
      2,
    ),
    "用户答题回放：",
    compactSummaryLines.join("\n"),
    "用户核心五行信息：",
    JSON.stringify(payload?.coreProfile ?? {}, null, 2),
    "用户五行占比（%）：",
    JSON.stringify(payload?.elementPercentages ?? {}, null, 2),
    "候选城市（仅可从这里选 city name）：",
    JSON.stringify(compactCandidateCities, null, 2),
    "本地模型Top3（优先参考）：",
    JSON.stringify(localTopThree, null, 2),
  ].join("\n\n");
}

/**
 * 归一化 Top3 亮点列表。
 * @param {unknown} value AI 原始亮点数据。
 * @param {Array<object>} localTopThree 本地 Top3。
 * @returns {Map<string, string>} 城市名到亮点文案的映射。
 */
function normalizeTopThreeHighlightMap(value, localTopThree) {
  const fallbackMap = new Map(
    (Array.isArray(localTopThree) ? localTopThree : []).map((cityItem) => {
      const fallbackHighlight = Array.isArray(cityItem?.highlights)
        ? cityItem.highlights[0]
        : "";
      return [String(cityItem?.name ?? "").trim(), String(fallbackHighlight ?? "").trim()];
    }),
  );

  if (!Array.isArray(value)) {
    return fallbackMap;
  }

  const normalizedMap = new Map();
  const localNameSet = new Set(
    (Array.isArray(localTopThree) ? localTopThree : [])
      .map((cityItem) => String(cityItem?.name ?? "").trim())
      .filter(Boolean),
  );

  value.forEach((item) => {
    const cityName = String(item?.name ?? "").trim();
    if (!cityName || !localNameSet.has(cityName) || normalizedMap.has(cityName)) {
      return;
    }

    const highlightText = normalizeText(
      item?.highlight,
      fallbackMap.get(cityName) || "这座城市的生活气韵与你的节奏更同频。",
      36,
    );

    normalizedMap.set(cityName, highlightText);
  });

  // 关键逻辑：若 AI 未覆盖全部城市，自动补齐本地兜底文案，避免 UI 出现空行。
  localNameSet.forEach((cityName) => {
    if (normalizedMap.has(cityName)) {
      return;
    }

    normalizedMap.set(
      cityName,
      fallbackMap.get(cityName) || "这座城市的生活气韵与你的节奏更同频。",
    );
  });

  return normalizedMap;
}

/**
 * 标准化 AI 输出，保证结构稳定。
 * @param {object|null} aiData AI 输出 JSON。
 * @param {object} payload 深度分析负载。
 * @returns {{
 *  insight: string,
 *  highlightCard: { title: string, content: string },
 *  cityReasonLines: Array<string>,
 *  energyInterpretationLines: Array<string>,
 *  topThreeHighlightMap: Map<string, string>,
 *  typeCardItems: Array<{ label: string, value: string }>
 * }} 标准化结果。
 */
function normalizeAiResult(aiData, payload) {
  const localResult = payload?.localResult ?? {};
  const fallbackInsight = normalizeText(
    localResult?.insight,
    "你的能量结构已经比较清晰，建议优先围绕通勤、消费和社交场景做试居验证。",
    200,
  );
  const fallbackTopCityName = String(localResult?.topCity?.name ?? "待匹配城市").trim();
  const fallbackTopCityScore = Number(localResult?.topCity?.score ?? 0);
  const fallbackReason = normalizeText(
    localResult?.topCity?.reasonText,
    "这座城市的气质与你的能量节奏更容易长期同频。",
    52,
  );
  const fallbackHighlightCard = {
    title: `最终推荐城市：${fallbackTopCityName}`,
    content: `${fallbackTopCityName} 匹配度 ${fallbackTopCityScore}% · ${fallbackReason}`,
  };

  const fallbackCityReasonLines = normalizeStringList(
    localResult?.cityReasonLines,
    [fallbackReason, "建议优先试住通勤半径内的生活圈。", "先验证日常幸福感，再决定长期定居。"],
    3,
  );

  const fallbackEnergyLines = normalizeStringList(
    localResult?.energyInterpretationLines,
    [
      "金·鎏序：你重视秩序与边界，做事偏向清晰可控。",
      "木·森屿：你有生长与共情能力，适合有温度的城市氛围。",
      "水·沧澜：你具备弹性与洞察，适合包容度高的生活环境。",
      "火·曜阳：你行动力强，适合反馈快、机会密集的节奏。",
      "土·坤域：你偏向长期稳态，适合可沉淀可扎根的生活结构。",
    ],
    5,
  );

  const fallbackTypeCardItems = Array.isArray(localResult?.typeCardItems)
    ? localResult.typeCardItems.slice(0, 4)
    : [];

  if (!aiData || typeof aiData !== "object") {
    return {
      insight: fallbackInsight,
      highlightCard: fallbackHighlightCard,
      cityReasonLines: fallbackCityReasonLines,
      energyInterpretationLines: fallbackEnergyLines,
      topThreeHighlightMap: normalizeTopThreeHighlightMap(
        localResult?.topThree,
        localResult?.topThree,
      ),
      typeCardItems: fallbackTypeCardItems,
    };
  }

  const normalizedTypeCardItems = Array.isArray(aiData?.typeCardItems)
    ? aiData.typeCardItems
        .map((item) => ({
          label: normalizeText(item?.label, "建议重心", 8),
          value: normalizeText(item?.value, "先以日常可持续为优先。", 24),
        }))
        .filter((item) => item.label && item.value)
        .slice(0, 4)
    : [];

  return {
    insight: normalizeText(aiData?.insight, fallbackInsight, 220),
    highlightCard: {
      title: normalizeText(aiData?.highlightCard?.title, fallbackHighlightCard.title, 16),
      content: normalizeText(
        aiData?.highlightCard?.content,
        fallbackHighlightCard.content,
        120,
      ),
    },
    cityReasonLines: normalizeStringList(
      aiData?.cityReasonLines,
      fallbackCityReasonLines,
      3,
    ),
    energyInterpretationLines: normalizeStringList(
      aiData?.energyInterpretationLines,
      fallbackEnergyLines,
      5,
    ),
    topThreeHighlightMap: normalizeTopThreeHighlightMap(
      aiData?.topThreeHighlights,
      localResult?.topThree,
    ),
    typeCardItems:
      normalizedTypeCardItems.length > 0
        ? normalizedTypeCardItems
        : fallbackTypeCardItems,
  };
}

/**
 * 合并 AI 解读到本地结果对象。
 * @param {object} localResult 本地分析结果。
 * @param {{
 *  insight: string,
 *  highlightCard: { title: string, content: string },
 *  cityReasonLines: Array<string>,
 *  energyInterpretationLines: Array<string>,
 *  topThreeHighlightMap: Map<string, string>,
 *  typeCardItems: Array<{ label: string, value: string }>
 * }} aiNormalizedResult 标准化 AI 结果。
 * @returns {object} 合并后的深度结果。
 */
function mergeAiNarrativeToLocalResult(localResult, aiNormalizedResult) {
  const localTopThree = Array.isArray(localResult?.topThree) ? localResult.topThree : [];
  const mergedTopThree = localTopThree.map((cityItem) => {
    const cityName = String(cityItem?.name ?? "").trim();
    const aiHighlightText = aiNormalizedResult.topThreeHighlightMap.get(cityName);

    if (!aiHighlightText) {
      return cityItem;
    }

    const baseHighlights = Array.isArray(cityItem?.highlights)
      ? cityItem.highlights.map((item) => String(item ?? "").trim()).filter(Boolean)
      : [];

    return {
      ...cityItem,
      highlights: [aiHighlightText, ...baseHighlights.filter((item) => item !== aiHighlightText)].slice(
        0,
        3,
      ),
    };
  });

  const mergedTopCity = {
    ...(localResult?.topCity ?? {}),
    reasonText:
      aiNormalizedResult.cityReasonLines[0] ||
      String(localResult?.topCity?.reasonText ?? "").trim() ||
      "这座城市的生活气韵与你更同频。",
  };

  return {
    ...localResult,
    insight: aiNormalizedResult.insight,
    highlightCard: aiNormalizedResult.highlightCard,
    cityReasonLines: aiNormalizedResult.cityReasonLines,
    energyInterpretationLines: aiNormalizedResult.energyInterpretationLines,
    typeCardItems: aiNormalizedResult.typeCardItems,
    topCity: mergedTopCity,
    topThree: mergedTopThree,
  };
}

/**
 * 执行五行城市 AI 深度解读。
 * @param {object} payload 深度分析负载。
 * @param {object} payload.localResult 本地分析结果。
 * @param {Array<string>} payload.summaryLines 答卷摘要。
 * @param {object} payload.coreProfile 核心五行信息。
 * @param {object} payload.elementPercentages 五行占比。
 * @param {Array<object>} payload.candidateCities 候选城市列表。
 * @param {Array<object>} payload.localTopThree 本地 Top3。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=22000] 超时时间（毫秒）。
 * @returns {Promise<object>} 可直接用于页面渲染的深度结果对象。
 */
export async function analyzeFiveElementsCityWithAI(payload, options = {}) {
  const safeTimeoutMs = Math.max(
    8000,
    Math.min(Number(options.timeoutMs ?? 22000), 15000),
  );
  const aiData = await requestBailianJson({
    systemPrompt:
      "你是中文心理测试结果文案专家。必须只输出 JSON，不允许输出额外解释。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: safeTimeoutMs,
    temperature: 0.45,
    // 关键逻辑：大模型慢响应场景下禁用同模型重试，并允许超时后自动切换后备模型。
    retryCount: 0,
    switchModelOnTimeout: true,
    // 关键逻辑：限制输出长度可减少生成时延并降低解析失败风险。
    maxTokens: 900,
  });

  const aiNormalizedResult = normalizeAiResult(aiData, payload);
  return mergeAiNarrativeToLocalResult(payload?.localResult ?? {}, aiNormalizedResult);
}
