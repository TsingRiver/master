import { requestBailianJson } from "./bailianClient";

/**
 * 限制分值到 [0, 100]。
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
 * 归一化文本。
 * @param {unknown} value 输入值。
 * @param {string} fallbackText 兜底文本。
 * @param {number} maxLength 最大长度。
 * @returns {string} 归一化结果。
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
 * @param {unknown} value 输入值。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 列表上限。
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
 * 归一化标签列表。
 * @param {unknown} value 输入值。
 * @param {Array<string>} fallbackTags 兜底标签。
 * @returns {Array<string>} 标签列表。
 */
function normalizeTagChips(value, fallbackTags) {
  if (!Array.isArray(value)) {
    return fallbackTags.slice(0, 8);
  }

  const normalizedTags = value
    .map((item) => String(item ?? "").replace(/^#/, "").trim())
    .filter(Boolean)
    .slice(0, 8);

  return normalizedTags.length > 0
    ? [...new Set(normalizedTags)]
    : fallbackTags.slice(0, 8);
}

/**
 * 归一化深度详情模块。
 * 复杂度评估：O(S * I)
 * S 为模块数量，I 为每个模块条目数；当前配置上限均为常量级。
 * @param {unknown} value 输入值。
 * @param {Array<{ title: string, items: Array<string> }>} fallbackSections 兜底模块。
 * @returns {Array<{ title: string, items: Array<string> }>} 归一化模块。
 */
function normalizeDetailSections(value, fallbackSections) {
  if (!Array.isArray(value)) {
    return fallbackSections;
  }

  const normalizedSections = value
    .map((sectionItem) => {
      const titleText = String(sectionItem?.title ?? "").trim();
      const items = normalizeStringList(sectionItem?.items, [], 6);
      if (!titleText || items.length === 0) {
        return null;
      }

      return {
        title: titleText.slice(0, 16),
        items,
      };
    })
    .filter(Boolean)
    .slice(0, 4);

  return normalizedSections.length > 0 ? normalizedSections : fallbackSections;
}

/**
 * 归一化 Top 风险场景。
 * 复杂度评估：O(N)
 * N 为候选场景数量；当前固定取 Top3，属于常量级。
 * @param {unknown} value 输入值。
 * @param {Array<{ name: string, score: number, optionLabel: string }>} fallbackTopRiskScenarios 兜底场景。
 * @returns {Array<{ name: string, score: number, optionLabel: string }>} 归一化场景。
 */
function normalizeTopRiskScenarios(value, fallbackTopRiskScenarios) {
  const safeFallbackList = Array.isArray(fallbackTopRiskScenarios)
    ? fallbackTopRiskScenarios
    : [];

  const fallbackScenarioMap = new Map(
    safeFallbackList.map((item) => [String(item?.name ?? ""), item]),
  );
  const allowedNameSet = new Set(fallbackScenarioMap.keys());
  const normalizedList = [];

  if (Array.isArray(value)) {
    value.forEach((scenarioItem) => {
      if (normalizedList.length >= 3) {
        return;
      }

      const scenarioName = String(scenarioItem?.name ?? "").trim();
      if (!scenarioName || !allowedNameSet.has(scenarioName)) {
        return;
      }

      if (normalizedList.some((item) => item.name === scenarioName)) {
        return;
      }

      const fallbackScenario = fallbackScenarioMap.get(scenarioName);
      normalizedList.push({
        name: scenarioName,
        score: clampScore(Number(scenarioItem?.score ?? fallbackScenario?.score ?? 0)),
        optionLabel:
          String(scenarioItem?.optionLabel ?? "").trim() ||
          String(fallbackScenario?.optionLabel ?? "").trim() ||
          "该场景存在明显情绪波动风险",
      });
    });
  }

  safeFallbackList.forEach((scenarioItem) => {
    if (normalizedList.length >= 3) {
      return;
    }

    const scenarioName = String(scenarioItem?.name ?? "").trim();
    if (!scenarioName || normalizedList.some((item) => item.name === scenarioName)) {
      return;
    }

    normalizedList.push({
      name: scenarioName,
      score: clampScore(Number(scenarioItem?.score ?? 0)),
      optionLabel:
        String(scenarioItem?.optionLabel ?? "").trim() ||
        "该场景存在明显情绪波动风险",
    });
  });

  return normalizedList.slice(0, 3);
}

/**
 * 构建阶段分布摘要文本。
 * @param {Array<{ name: string, score: number }>} stageDistribution 阶段分布。
 * @returns {string} 文本结果。
 */
function buildStageDistributionSnapshot(stageDistribution) {
  const safeStageDistribution = Array.isArray(stageDistribution)
    ? stageDistribution
    : [];

  const normalizedList = safeStageDistribution
    .map((item) => ({
      name: String(item?.name ?? "").trim(),
      score: clampScore(Number(item?.score ?? 0)),
    }))
    .filter((item) => item.name);

  if (normalizedList.length === 0) {
    return "阶段分布信号不足";
  }

  return normalizedList
    .map((item) => `${item.name} ${item.score}%`)
    .join(" / ");
}

/**
 * 构建兜底回放文案（避免逐题罗列）。
 * @param {object} payload 深度分析负载。
 * @returns {Array<string>} 回放文案。
 */
function buildFallbackReplayLines(payload) {
  const topRiskScenarios = Array.isArray(payload.topRiskScenarios)
    ? payload.topRiskScenarios
    : [];
  const topRiskNames = topRiskScenarios.map((item) => item.name).filter(Boolean);
  const firstActionTip = String(payload.actionTips?.[0] ?? "").trim();

  return [
    `高风险场景集中在：${topRiskNames.slice(0, 3).join("、") || "边界失衡与过度投入"}`,
    `关系触发信号：${buildStageDistributionSnapshot(payload.stageDistribution)}`,
    firstActionTip || "先把节奏拉回自己，再决定这段关系的投入比例。",
  ];
}

/**
 * 构建 AI 失败时的兜底深度结果。
 * @param {object} payload 深度分析负载。
 * @returns {object} 兜底结果。
 */
function buildFallbackDeepResult(payload) {
  const fallbackTagChips = [
    payload.levelRule?.title,
    payload.levelRule?.coreTag,
  ].filter(Boolean);

  const fallbackActionTips = normalizeStringList(
    payload.actionTips,
    [
      "先拉开情绪反应和行动之间的间隔，再做关系决定。",
      "把“我感觉”翻译成“我需要”，减少无效拉扯。",
      "把精力分回工作与生活，恢复关系外部支点。",
    ],
    5,
  );

  const fallbackDetailSections = [
    {
      title: "情绪触发链路",
      items: [
        `你的关系状态分布：${buildStageDistributionSnapshot(payload.stageDistribution)}。`,
        `当前最容易波动的情境：${(payload.topRiskScenarios ?? [])
          .slice(0, 2)
          .map((item) => item.name)
          .join("、") || "等待回应与关系确认"}。`,
        "一旦进入高压场景，你更容易用“过度解释/过度投入”换取确定感。",
      ],
    },
    {
      title: "关系盲区提醒",
      items: [
        payload.levelRule?.piercingLine ?? "当前关系盲区信号不足，建议继续观察互动事实。",
        "把偶发甜头当作长期承诺，通常会抬高失望成本。",
        "当你开始自我归因过度时，说明边界感正在下滑。",
      ],
    },
    {
      title: "冷静行动清单",
      items: fallbackActionTips,
    },
  ];

  const fallbackReplayLines = buildFallbackReplayLines(payload);
  const fallbackInsight = [
    payload.localNarrative,
    "这份结果说明：你并不是“不懂爱”，而是更容易在不确定里提前透支情绪。",
    "先把关系判断建立在事实反馈上，再决定下一步投入，结果会更稳。",
  ]
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join(" ");

  return {
    score: Number(payload.score ?? 0),
    answeredCount: Number(payload.answeredCount ?? 0),
    levelRule: payload.levelRule ?? {},
    stageDistribution: payload.stageDistribution ?? [],
    topRiskScenarios: normalizeTopRiskScenarios(
      payload.topRiskScenarios,
      payload.topRiskScenarios ?? [],
    ),
    localNarrative: fallbackInsight,
    highlightCard: {
      title: "AI深度速写",
      content:
        "你在关系中的高强度投入来自“想确认被爱”的驱动，真正有效的是先稳住边界，再谈亲密。",
    },
    tagChips: fallbackTagChips,
    detailSections: fallbackDetailSections,
    actionTips: fallbackActionTips,
    summaryLines: fallbackReplayLines,
    posterModel: {
      ...(payload.posterModel ?? {}),
      narrative: fallbackInsight,
    },
  };
}

/**
 * 构建发送给 AI 的提示词。
 * @param {object} payload 深度分析负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  const answerDetailLines = (Array.isArray(payload.answerSummary)
    ? payload.answerSummary
    : []
  )
    .slice(0, 16)
    .map(
      (item, index) =>
        `${index + 1}. ${item.questionTitle}｜选择：${item.optionLabel}｜阶段：${item.stage}｜分值：${item.score}`,
    );

  return [
    "你是一位中文亲密关系与情绪模式分析师，擅长做‘恋爱脑指数’深度解读。",
    "请根据输入数据生成一份更有洞察的结果。",
    "严格要求：",
    "1. 只输出 JSON，不要输出 Markdown 或任何解释文字。",
    "2. 不要逐题复述答题内容；summaryLines 必须是“模式回放”，不是题目列表。",
    "3. detailSections 必须包含可执行建议，避免空泛鸡汤。",
    "4. topRiskScenarios.name 必须从提供的风险场景候选里选择。",
    "5. insight 建议 220~320 字，至少包含“当前状态 + 风险提醒 + 下一步动作”。",
    "JSON 字段模板：",
    JSON.stringify(
      {
        highlightCard: {
          title: "高亮标题",
          content: "140字以内高亮总结",
        },
        insight: "220~320字综合解读",
        tagChips: ["标签1", "标签2", "标签3", "标签4"],
        topRiskScenarios: [
          { name: "风险场景名", score: 0, optionLabel: "该场景典型反应" },
          { name: "风险场景名", score: 0, optionLabel: "该场景典型反应" },
          { name: "风险场景名", score: 0, optionLabel: "该场景典型反应" },
        ],
        detailSections: [
          { title: "情绪触发链路", items: ["要点1", "要点2", "要点3"] },
          { title: "关系盲区提醒", items: ["要点1", "要点2", "要点3"] },
          { title: "冷静行动清单", items: ["要点1", "要点2", "要点3"] },
        ],
        actionTips: ["建议1", "建议2", "建议3", "建议4"],
        summaryLines: ["回放1", "回放2", "回放3"],
        posterNarrative: "长图叙述文案（120字以内）",
      },
      null,
      2,
    ),
    "指数与等级：",
    JSON.stringify(
      {
        score: Number(payload.score ?? 0),
        fullScore: 140,
        levelName: payload.levelRule?.levelName ?? "",
        levelTitle: payload.levelRule?.title ?? "",
        coreTag: payload.levelRule?.coreTag ?? "",
      },
      null,
      2,
    ),
    "阶段分布：",
    JSON.stringify(payload.stageDistribution ?? [], null, 2),
    "风险场景候选（topRiskScenarios.name 只能从这里选）：",
    JSON.stringify(payload.topRiskScenarios ?? [], null, 2),
    "本地建议参考：",
    JSON.stringify(payload.actionTips ?? [], null, 2),
    "答题明细（节选）：",
    answerDetailLines.join("\n"),
  ].join("\n\n");
}

/**
 * 标准化 AI 深度结果，保证页面可稳定渲染。
 * @param {object|null} aiData AI 输出 JSON。
 * @param {object} payload 深度分析负载。
 * @returns {object} 标准化深度结果。
 */
function normalizeLoveBrainAiResult(aiData, payload) {
  const fallbackResult = buildFallbackDeepResult(payload);
  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedActionTips = normalizeStringList(
    aiData.actionTips,
    fallbackResult.actionTips,
    5,
  );

  const normalizedTopRiskScenarios = normalizeTopRiskScenarios(
    aiData.topRiskScenarios,
    fallbackResult.topRiskScenarios,
  );

  const normalizedDetailSections = normalizeDetailSections(
    aiData.detailSections,
    fallbackResult.detailSections,
  );

  const normalizedSummaryLines = normalizeStringList(
    aiData.summaryLines,
    fallbackResult.summaryLines,
    5,
  );

  const normalizedInsight = normalizeText(
    aiData.insight,
    fallbackResult.localNarrative,
    420,
  );

  return {
    ...fallbackResult,
    localNarrative: normalizedInsight,
    highlightCard: {
      title: normalizeText(
        aiData.highlightCard?.title,
        fallbackResult.highlightCard.title,
        18,
      ),
      content: normalizeText(
        aiData.highlightCard?.content,
        fallbackResult.highlightCard.content,
        260,
      ),
    },
    tagChips: normalizeTagChips(aiData.tagChips, fallbackResult.tagChips),
    topRiskScenarios: normalizedTopRiskScenarios,
    detailSections: normalizedDetailSections,
    actionTips: normalizedActionTips,
    summaryLines: normalizedSummaryLines,
    posterModel: {
      ...fallbackResult.posterModel,
      narrative: normalizeText(
        aiData.posterNarrative,
        fallbackResult.posterModel?.narrative ?? normalizedInsight,
        220,
      ),
    },
  };
}

/**
 * 调用 AI 生成恋爱脑深度结果。
 * 复杂度评估：
 * 1. 本地提示词拼装与归一化为 O(Q + R)，Q 为题量，R 为风险场景数。
 * 2. 总耗时主要由外部 AI 网络调用决定。
 * @param {object} payload 深度分析负载。
 * @param {number} payload.score 指数得分（0~140）。
 * @param {number} payload.answeredCount 作答题量。
 * @param {object} payload.levelRule 指数等级规则。
 * @param {Array<object>} payload.stageDistribution 阶段分布。
 * @param {Array<object>} payload.topRiskScenarios 风险场景列表。
 * @param {Array<object>} payload.answerSummary 结构化答题摘要。
 * @param {Array<string>} payload.summaryLines 本地回放摘要。
 * @param {string} payload.localNarrative 本地解读文案。
 * @param {Array<string>} payload.actionTips 本地建议列表。
 * @param {object} payload.posterModel 长图模型。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=28000] 超时时间（毫秒）。
 * @param {number} [options.temperature=0.35] 采样温度。
 * @returns {Promise<object>} 标准化深度结果。
 */
export async function analyzeLoveBrainWithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt:
      "你是中文恋爱关系深度分析顾问。必须只输出 JSON，不允许输出任何额外说明。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 28000,
    temperature: options.temperature ?? 0.35,
  });

  return normalizeLoveBrainAiResult(aiData, payload);
}
