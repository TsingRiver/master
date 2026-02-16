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
 * 归一化字符串列表。
 * @param {unknown} value 输入值。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 条目上限。
 * @returns {Array<string>} 规范化后的字符串列表。
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
 * 构建发送给百炼的提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位中文星座内容策划师，擅长输出‘贵人星座’类测评报告。",
    "请根据用户答卷，输出《2026 贵人星座报告》。",
    "必须只输出 JSON，不要输出任何额外文字。",
    "写作要求：优先从生活、人际交往、情绪支持、社交场景解读；避免过多职场管理术语。",
    "字段规范：",
    JSON.stringify(
      {
        mainSign: { name: "星座名", score: "0-100 整数" },
        topThree: [
          { name: "星座名", score: 0 },
          { name: "星座名", score: 0 },
          { name: "星座名", score: 0 },
        ],
        guardianSignal: "60字以内，说明该贵人星座会在哪类场景出现",
        insight: "220字以内，解释为何匹配",
        tags: ["标签1", "标签2", "标签3", "标签4"],
        encounterScenes: ["出现地图1", "出现地图2", "出现地图3", "出现地图4"],
        collaborationStyles: ["协作模式1", "协作模式2", "协作模式3"],
        communicationTips: ["沟通钥匙1", "沟通钥匙2", "沟通钥匙3"],
        resourceChannels: ["资源通道1", "资源通道2", "资源通道3"],
        monthlyRhythm: ["年度节奏1", "年度节奏2", "年度节奏3"],
        resonanceHints: ["同频维度解读1", "同频维度解读2", "同频维度解读3"],
        supplementHints: ["补位维度解读1", "补位维度解读2", "补位维度解读3"],
        cautionHints: ["风险维度提示1", "风险维度提示2"],
        keyOpportunities: ["机会动作1", "机会动作2", "机会动作3", "机会动作4", "机会动作5"],
        avoidSignals: ["提醒信号1", "提醒信号2", "提醒信号3", "提醒信号4"],
      },
      null,
      2,
    ),
    "候选星座（必须从中选择）：",
    JSON.stringify(payload.signCandidates, null, 2),
    "答卷摘要：",
    payload.summaryLines.join("\n"),
    "用户向量（0-10）：",
    JSON.stringify(payload.preferenceVector, null, 2),
    "本地模型 Top3（仅供参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
    "本地多维洞察（仅供参考）：",
    JSON.stringify(payload.localFallback, null, 2),
  ].join("\n\n");
}

/**
 * 标准化 AI 返回结果，确保页面稳定渲染。
 * @param {object|null} aiData AI 输出 JSON。
 * @param {Array<object>} signCandidates 候选星座。
 * @param {Array<object>} localTopThree 本地模型 Top3。
 * @param {object} localFallback 本地兜底模块。
 * @returns {{ mainSign: object, topThree: Array<object>, guardianSignal: string, insight: string, tags: Array<string>, encounterScenes: Array<string>, collaborationStyles: Array<string>, communicationTips: Array<string>, resourceChannels: Array<string>, monthlyRhythm: Array<string>, resonanceHints: Array<string>, supplementHints: Array<string>, cautionHints: Array<string>, keyOpportunities: Array<string>, avoidSignals: Array<string> }} 标准化结果。
 */
function normalizeBenefactorResult(
  aiData,
  signCandidates,
  localTopThree,
  localFallback,
) {
  const candidateSet = new Set(signCandidates.map((item) => item.sign));

  /**
   * 选择合法星座名：
   * 当 AI 返回值不在候选集合时，回退到本地第一名。
   * @param {string} sign 星座名。
   * @returns {string} 合法星座名。
   */
  const pickLegalSign = (sign) => {
    if (candidateSet.has(sign)) {
      return sign;
    }

    return localTopThree[0]?.sign ?? signCandidates[0]?.sign ?? "天秤座";
  };

  const fallbackTopThree = localTopThree.slice(0, 3).map((item) => ({
    name: pickLegalSign(item.sign),
    score: clampScore(item.score),
  }));

  const fallbackResult = {
    mainSign: fallbackTopThree[0] ?? { name: "天秤座", score: 0 },
    topThree: fallbackTopThree,
    guardianSignal: "你的贵人通常出现在需要沟通协调和资源联动的场景。",
    insight:
      "你在行动节奏与协同表达上具有明显特征，因此更容易吸引能补位你短板、放大你优势的星座伙伴。",
    tags: normalizeStringList(localFallback?.tagChips, ["贵人协作", "同频连接"], 6),
    encounterScenes: normalizeStringList(
      localFallback?.encounterScenes,
      [
        "高概率出现在朋友局、兴趣社群、同城活动与日常聊天圈。",
        "情绪波动或生活卡点时，更容易触发贵人主动靠近。",
        "来自朋友引荐与长期互动沉淀的关系通常更稳更真诚。",
      ],
      4,
    ),
    collaborationStyles: normalizeStringList(
      localFallback?.collaborationStyles,
      [
        "关系升温常来自多次稳定互动，而不是一次高强度表达。",
        "你更适合在边界清晰的状态下与贵人形成互相支持。",
        "自然、真诚、低压力的来往更容易长久。",
      ],
      3,
    ),
    communicationTips: normalizeStringList(
      localFallback?.communicationTips,
      [
        "先说感受，再说需要对方怎么做，沟通会更顺。",
        "出现误会时先确认事实，不要急着下结论。",
        "把“我希望你怎么支持我”讲清楚，会更容易被接住。",
      ],
      3,
    ),
    resourceChannels: normalizeStringList(
      localFallback?.resourceChannels,
      [
        "真正的支持多来自长期稳定联系，而非短期热络。",
        "每周保持与 1-2 位关键关系的轻连接，关系温度会更稳。",
        "把“感谢与回应”变成习惯，关系更容易持续升温。",
      ],
      3,
    ),
    monthlyRhythm: normalizeStringList(
      localFallback?.monthlyRhythm,
      [
        "Q1 先修复旧关系、筛选高质量社交。",
        "Q2 扩展生活圈，增加同频关系触点。",
        "下半年以“少而精”经营长期互助关系。",
      ],
      3,
    ),
    resonanceHints: normalizeStringList(
      localFallback?.resonanceHints,
      ["你与贵人在关键维度上具备天然同频。"],
      3,
    ),
    supplementHints: normalizeStringList(
      localFallback?.supplementHints,
      ["贵人能在你相对薄弱维度形成补位支持。"],
      3,
    ),
    cautionHints: normalizeStringList(
      localFallback?.cautionHints,
      ["当情绪或节奏波动时，容易错过关键协作窗口。"],
      2,
    ),
    keyOpportunities: normalizeStringList(
      localFallback?.keyOpportunities,
      [
        "主动分享真实近况与边界，贵人更容易理解你并靠近你。",
        "在生活卡点出现前先求助，关系会比“硬扛后爆发”更稳。",
        "每周复盘一次“谁真正接住过你”，持续深耕高质量关系。",
      ],
      5,
    ),
    avoidSignals: normalizeStringList(
      localFallback?.avoidSignals,
      ["把沉默当自保会让支持变少", "情绪上头后断联容易造成关系误伤"],
      4,
    ),
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedTopThree = [];
  const usedSignSet = new Set();
  const aiTopThree = Array.isArray(aiData.topThree) ? aiData.topThree : [];

  aiTopThree.forEach((item) => {
    const resolvedSign = pickLegalSign(item?.name);
    if (usedSignSet.has(resolvedSign)) {
      return;
    }

    usedSignSet.add(resolvedSign);
    normalizedTopThree.push({
      name: resolvedSign,
      score: clampScore(item?.score),
    });
  });

  // 关键逻辑：Top3 必须补齐，避免结果区域出现空位。
  fallbackTopThree.forEach((item) => {
    if (normalizedTopThree.length >= 3) {
      return;
    }

    if (!usedSignSet.has(item.name)) {
      normalizedTopThree.push(item);
      usedSignSet.add(item.name);
    }
  });

  const opportunities = Array.isArray(aiData.keyOpportunities)
    ? aiData.keyOpportunities.filter((item) => typeof item === "string")
    : [];
  const avoidSignals = Array.isArray(aiData.avoidSignals)
    ? aiData.avoidSignals.filter((item) => typeof item === "string")
    : [];

  const resolvedMainSign = pickLegalSign(aiData?.mainSign?.name);
  const resolvedMainScore = clampScore(aiData?.mainSign?.score);

  return {
    mainSign: {
      name: resolvedMainSign,
      score: resolvedMainScore || normalizedTopThree[0]?.score || 0,
    },
    topThree: normalizedTopThree.slice(0, 3),
    guardianSignal:
      typeof aiData.guardianSignal === "string" && aiData.guardianSignal.trim()
        ? aiData.guardianSignal.trim()
        : fallbackResult.guardianSignal,
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    tags: normalizeStringList(aiData.tags, fallbackResult.tags, 6),
    encounterScenes: normalizeStringList(
      aiData.encounterScenes,
      fallbackResult.encounterScenes,
      4,
    ),
    collaborationStyles: normalizeStringList(
      aiData.collaborationStyles,
      fallbackResult.collaborationStyles,
      3,
    ),
    communicationTips: normalizeStringList(
      aiData.communicationTips,
      fallbackResult.communicationTips,
      3,
    ),
    resourceChannels: normalizeStringList(
      aiData.resourceChannels,
      fallbackResult.resourceChannels,
      3,
    ),
    monthlyRhythm: normalizeStringList(
      aiData.monthlyRhythm,
      fallbackResult.monthlyRhythm,
      3,
    ),
    resonanceHints: normalizeStringList(
      aiData.resonanceHints,
      fallbackResult.resonanceHints,
      3,
    ),
    supplementHints: normalizeStringList(
      aiData.supplementHints,
      fallbackResult.supplementHints,
      3,
    ),
    cautionHints: normalizeStringList(
      aiData.cautionHints,
      fallbackResult.cautionHints,
      2,
    ),
    keyOpportunities:
      opportunities.length > 0
        ? opportunities.slice(0, 5)
        : fallbackResult.keyOpportunities,
    avoidSignals:
      avoidSignals.length > 0
        ? avoidSignals.slice(0, 4)
        : fallbackResult.avoidSignals,
  };
}

/**
 * 调用 AI 生成 2026 贵人星座分析。
 * @param {object} payload 请求负载。
 * @param {Array<string>} payload.summaryLines 答卷摘要文本。
 * @param {object} payload.preferenceVector 用户向量。
 * @param {Array<object>} payload.signCandidates 星座候选列表。
 * @param {Array<object>} payload.localTopThree 本地模型 Top3。
 * @param {object} payload.localFallback 本地多维兜底模块。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=18000] 超时时间（毫秒）。
 * @returns {Promise<{ mainSign: object, topThree: Array<object>, guardianSignal: string, insight: string, tags: Array<string>, encounterScenes: Array<string>, collaborationStyles: Array<string>, communicationTips: Array<string>, resourceChannels: Array<string>, monthlyRhythm: Array<string>, resonanceHints: Array<string>, supplementHints: Array<string>, cautionHints: Array<string>, keyOpportunities: Array<string>, avoidSignals: Array<string> }>} 标准化 AI 结果。
 */
export async function analyzeBenefactor2026WithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是中文星座解读师。必须严格输出 JSON，不允许附加说明和 Markdown。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.42,
  });

  return normalizeBenefactorResult(
    aiData,
    payload.signCandidates ?? [],
    payload.localTopThree ?? [],
    payload.localFallback ?? {},
  );
}
