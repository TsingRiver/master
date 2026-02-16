import { requestBailianJson } from "./bailianClient";

/**
 * 海报视觉标签映射。
 */
const POSTER_VISUAL_LABEL_MAP = {
  starlight: "星空夜色",
  candlelight: "烛光晚餐",
  "sunset-park": "公园长椅",
  "warm-home": "暖光居家",
  "city-night": "城市夜景",
};

/**
 * 将分值约束到 [0, 100]。
 * @param {number} score 原始分值。
 * @returns {number} 合法分值。
 */
function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 合并多条文本为段落。
 * @param {Array<string>} lines 文本列表。
 * @returns {string} 合并后的段落。
 */
function joinAsParagraph(lines) {
  const normalizedLines = (Array.isArray(lines) ? lines : [])
    .map((lineItem) => String(lineItem ?? "").trim())
    .filter(Boolean);
  if (normalizedLines.length === 0) {
    return "";
  }

  return `${normalizedLines.join("。 ")}。`;
}

/**
 * 归一化文本值。
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
 * 归一化标签列表。
 * @param {unknown} value 标签输入。
 * @param {Array<string>} fallbackTags 兜底标签。
 * @returns {Array<string>} 标签列表。
 */
function normalizeTagChips(value, fallbackTags) {
  if (!Array.isArray(value)) {
    return fallbackTags.slice(0, 8);
  }

  const normalizedList = value
    .map((item) => String(item ?? "").replace(/^#/, "").trim())
    .filter(Boolean)
    .slice(0, 8);

  return normalizedList.length > 0
    ? [...new Set(normalizedList)]
    : fallbackTags.slice(0, 8);
}

/**
 * 归一化字符串列表。
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
 * 构建 AI 调用提示词。
 * @param {object} payload 深度分析负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  const destinyGate = payload.destinyGate ?? {};
  const destinyOutcome = payload.destinyOutcome ?? {};
  const dimensionCandidates = (payload.dimensionScores ?? []).map((item) => ({
    key: item.key,
    name: item.label,
    score: Number(item.score ?? 0),
  }));

  return [
    "你是中文恋爱关系与情感心理解读师。",
    "请基于用户的浪漫测评数据，输出一份可直接给用户展示的深度报告。",
    "严格要求：",
    "1. 只输出 JSON，不要输出 Markdown 或任何额外说明。",
    "2. 所有语气要温暖但不过度鸡汤，避免空话。",
    "3. growthActions 和 avoidSignals 必须是可执行动作，不要抽象口号。",
    "4. topThree 的 name 只能从“维度候选名称”里选择。",
    "5. insight 必须写得更完整：建议 220~320 字，至少包含“当前状态、风险提醒、下一步行动”三部分。",
    "JSON 字段模板：",
    JSON.stringify(
      {
        mainProfile: { name: "主称号", score: 0 },
        highlightCard: {
          title: "高亮标题",
          content: "180字以内高亮解读",
        },
        insight: "220~320字综合解读",
        tagChips: ["标签1", "标签2", "标签3", "标签4"],
        topThree: [
          { name: "维度候选名称", score: 0 },
          { name: "维度候选名称", score: 0 },
          { name: "维度候选名称", score: 0 },
        ],
        growthActions: ["行动1", "行动2", "行动3", "行动4"],
        avoidSignals: ["避坑1", "避坑2", "避坑3"],
        summaryParagraph: "答卷摘要重写（120~220字）",
        posterQuote: "海报金句（36字以内）",
      },
      null,
      2,
    ),
    "宿命判定信息：",
    JSON.stringify(
      {
        scorePercent: Number(destinyGate.scorePercent ?? 0),
        thresholdPercent: Number(destinyGate.thresholdPercent ?? 80),
        outcome: destinyOutcome.key ?? "locked",
        outcomeTitle: payload.tierConfig?.title ?? "",
      },
      null,
      2,
    ),
    "维度候选名称（topThree 必须从中选择）：",
    JSON.stringify(dimensionCandidates, null, 2),
    "本地标签参考：",
    JSON.stringify(payload.tagChips ?? [], null, 2),
    "本地成长建议参考：",
    JSON.stringify(payload.growthActions ?? [], null, 2),
    "本地避坑参考：",
    JSON.stringify(payload.tierConfig?.avoidSignals ?? [], null, 2),
    "答卷摘要：",
    (payload.summaryLines ?? []).slice(0, 20).join("\n"),
  ].join("\n\n");
}

/**
 * 构建规则兜底结果。
 * 复杂度评估：O(D)
 * D 为维度数量（当前固定 4），属于常数级开销。
 * @param {object} payload 深度分析负载。
 * @returns {object} 兜底结果。
 */
function buildFallbackDeepResult(payload) {
  const topDimensions = Array.isArray(payload.topDimensions)
    ? payload.topDimensions
    : [];
  const weakestDimensions = Array.isArray(payload.weakestDimensions)
    ? payload.weakestDimensions
    : [];

  const topDimensionText = topDimensions.map((item) => item.label).join("、");
  const weakestDimensionText = weakestDimensions.map((item) => item.label).join("、");
  const destinyGate = payload.destinyGate ?? {};
  const destinyOutcome = payload.destinyOutcome ?? {};
  const isUnlocked = destinyOutcome.key === "unlocked";

  const deepInsight = [
    isUnlocked
      ? `你的宿命信念值达到 ${Number(destinyGate.scorePercent ?? 0)}%，成功突破第 13 章阈值。`
      : `你的宿命信念值为 ${Number(destinyGate.scorePercent ?? 0)}%，停在了第 13 章的理性防线。`,
    `你的浪漫表达主轴落在「${topDimensionText || "共情与行动"}」，当前最值得升级的是「${weakestDimensionText || "细节表达"}」。`,
    destinyOutcome.insight ?? payload.tierConfig?.insight ?? "",
  ]
    .map((lineItem) => String(lineItem ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const visualKey = payload.posterModel?.visualKey ?? "warm-home";
  const visualLabel = POSTER_VISUAL_LABEL_MAP[visualKey] ?? "暖光场景";
  const highlightTitle =
    destinyOutcome.highlightTitle ??
    (isUnlocked ? "圆满突破结局" : "遗憾美结局");
  const highlightContent =
    destinyOutcome.highlightContent ??
    `你的结果场景更接近「${visualLabel}」，说明你在关系中偏好可感知、可回忆的爱意表达。`;
  const outcomeAction = isUnlocked
    ? "把“第 14 次机会”写进现实承诺，让浪漫长期可兑现。"
    : "下一次在关键时刻，先表达“我在乎你”，再讨论得失。";
  const avoidSignals =
    destinyOutcome.avoidSignals ?? payload.tierConfig?.avoidSignals ?? [];
  const firstAvoidSignal = avoidSignals[0]
    ? `同时要警惕：${avoidSignals[0]}`
    : "";

  return {
    mainProfile: {
      name: payload.tierConfig?.title ?? "浪漫潜力型",
      score: Number(payload.romanceIndex ?? 0),
    },
    highlightCard: {
      title: highlightTitle,
      content: `${highlightContent}（主视觉：${visualLabel}）`,
    },
    insight: [deepInsight, `接下来最关键的动作是：${outcomeAction}`, firstAvoidSignal]
      .map((lineItem) => String(lineItem ?? "").trim())
      .filter(Boolean)
      .join(" "),
    tagChips: payload.tagChips ?? [],
    topThree: (payload.dimensionScores ?? []).slice(0, 3).map((item) => ({
      name: item.label,
      score: clampScore(item.score),
    })),
    radarItems: payload.dimensionScores ?? [],
    growthActions: [...(payload.growthActions ?? []), outcomeAction],
    avoidSignals,
    summaryParagraph: joinAsParagraph(payload.summaryLines?.slice(0, 6) ?? []),
    posterModel: payload.posterModel ?? {},
    tierConfig: payload.tierConfig,
    destinyGate,
    destinyOutcome,
  };
}

/**
 * 标准化 Top3 维度输出。
 * @param {unknown} topThreeInput AI 输出 Top3。
 * @param {Array<object>} fallbackTopThree 兜底 Top3。
 * @param {Array<object>} dimensionScores 维度得分列表。
 * @returns {Array<object>} 标准化 Top3。
 */
function normalizeTopThree(topThreeInput, fallbackTopThree, dimensionScores) {
  const allowedDimensionNameSet = new Set(
    (dimensionScores ?? []).map((item) => String(item.label ?? "")),
  );

  const normalizedTopThree = [];
  if (Array.isArray(topThreeInput)) {
    topThreeInput.forEach((item) => {
      if (normalizedTopThree.length >= 3) {
        return;
      }

      const normalizedName = String(item?.name ?? "").trim();
      if (!allowedDimensionNameSet.has(normalizedName)) {
        return;
      }

      const hasDuplicate = normalizedTopThree.some(
        (topItem) => topItem.name === normalizedName,
      );
      if (hasDuplicate) {
        return;
      }

      normalizedTopThree.push({
        name: normalizedName,
        score: clampScore(item?.score),
      });
    });
  }

  fallbackTopThree.forEach((item) => {
    if (normalizedTopThree.length >= 3) {
      return;
    }

    if (!normalizedTopThree.some((topItem) => topItem.name === item.name)) {
      normalizedTopThree.push({
        name: String(item.name ?? ""),
        score: clampScore(item.score),
      });
    }
  });

  return normalizedTopThree.slice(0, 3);
}

/**
 * 标准化 AI 返回结果。
 * @param {object|null} aiData AI 输出。
 * @param {object} payload 请求负载。
 * @returns {object} 标准化后结果。
 */
function normalizeRomanceAiResult(aiData, payload) {
  const fallbackResult = buildFallbackDeepResult(payload);
  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedMainProfile = {
    name: normalizeText(
      aiData.mainProfile?.name,
      fallbackResult.mainProfile.name,
      32,
    ),
    score: clampScore(
      Number(aiData.mainProfile?.score ?? fallbackResult.mainProfile.score),
    ),
  };

  const normalizedHighlightCard = {
    title: normalizeText(
      aiData.highlightCard?.title,
      fallbackResult.highlightCard.title,
      24,
    ),
    content: normalizeText(
      aiData.highlightCard?.content,
      fallbackResult.highlightCard.content,
      260,
    ),
  };

  const normalizedTagChips = normalizeTagChips(
    aiData.tagChips,
    fallbackResult.tagChips,
  );

  const normalizedTopThree = normalizeTopThree(
    aiData.topThree,
    fallbackResult.topThree,
    payload.dimensionScores ?? [],
  );

  const normalizedGrowthActions = normalizeStringList(
    aiData.growthActions,
    fallbackResult.growthActions,
    5,
  );

  const normalizedAvoidSignals = normalizeStringList(
    aiData.avoidSignals,
    fallbackResult.avoidSignals,
    4,
  );

  const normalizedSummaryParagraph = normalizeText(
    aiData.summaryParagraph,
    fallbackResult.summaryParagraph,
    260,
  );

  const normalizedPosterQuote = normalizeText(
    aiData.posterQuote,
    fallbackResult.posterModel?.quote ?? payload.tierConfig?.posterQuote ?? "",
    42,
  );

  return {
    ...fallbackResult,
    mainProfile: normalizedMainProfile,
    highlightCard: normalizedHighlightCard,
    insight: normalizeText(aiData.insight, fallbackResult.insight, 360),
    tagChips: normalizedTagChips,
    topThree: normalizedTopThree,
    growthActions: normalizedGrowthActions,
    avoidSignals: normalizedAvoidSignals,
    summaryParagraph: normalizedSummaryParagraph,
    posterModel: {
      ...fallbackResult.posterModel,
      quote: normalizedPosterQuote,
    },
  };
}

/**
 * 调用 AI 生成浪漫深度结果。
 * 复杂度评估：
 * 1. 提示词拼装与结果标准化为 O(D + S)，D 为维度数量，S 为摘要行数。
 * 2. 总耗时主要由外部 AI 网络调用决定。
 * @param {object} payload 深度分析负载。
 * @param {number} payload.romanceIndex 浪漫指数。
 * @param {object} payload.tierConfig 分段配置。
 * @param {object} payload.destinyGate 守门员判定结果。
 * @param {object} payload.destinyOutcome 宿命结局配置。
 * @param {Array<object>} payload.dimensionScores 维度分值列表。
 * @param {Array<object>} payload.topDimensions 高分维度。
 * @param {Array<object>} payload.weakestDimensions 低分维度。
 * @param {Array<string>} payload.tagChips 标签列表。
 * @param {Array<string>} payload.summaryLines 答卷摘要。
 * @param {Array<string>} payload.growthActions 成长动作。
 * @param {object} payload.posterModel 海报模型。
 * @param {object} [options] 可选参数。
 * @param {number} [options.timeoutMs=26000] 请求超时（毫秒）。
 * @param {number} [options.temperature=0.35] 采样温度。
 * @returns {Promise<object>} 标准化深度结果。
 */
export async function analyzeRomanceWithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt:
      "你是中文恋爱关系深度解读顾问。必须只输出 JSON，不允许输出任何额外文字。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 26000,
    temperature: options.temperature ?? 0.35,
  });

  return normalizeRomanceAiResult(aiData, payload);
}

/**
 * 兼容旧调用名称：
 * 关键逻辑：保持老接口不报错，同时底层改为 AI 生成。
 * @param {object} payload 深度分析负载。
 * @param {object} [options] 可选参数。
 * @returns {Promise<object>} AI 深度结果。
 */
export async function analyzeRomanceWithRuleEngine(payload, options = {}) {
  return analyzeRomanceWithAI(payload, options);
}
