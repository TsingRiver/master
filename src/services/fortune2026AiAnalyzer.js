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
 * 构建发送给百炼的提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位中文命题风格内容策划师与趋势解读师。",
    "请根据用户答卷，生成《2026 转运关键词》分析。",
    "只允许输出 JSON，不要输出任何额外文字。",
    "字段规范：",
    JSON.stringify(
      {
        mainKeyword: { name: "关键词", score: "0-100 整数" },
        topThree: [
          { name: "关键词", score: 0 },
          { name: "关键词", score: 0 },
          { name: "关键词", score: 0 },
        ],
        annualTheme: "40字以内年度主轴",
        insight: "120字以内，解释为什么是这个关键词",
        opportunityActions: ["行动建议1", "行动建议2", "行动建议3"],
        avoidSignals: ["需要避免的信号1", "需要避免的信号2"],
      },
      null,
      2,
    ),
    "候选关键词（必须从中选择）：",
    JSON.stringify(payload.keywordCandidates, null, 2),
    "用户答卷摘要：",
    payload.summaryLines.join("\n"),
    "用户偏好向量（0-10）：",
    JSON.stringify(payload.preferenceVector, null, 2),
    "本地模型Top3（仅供参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
  ].join("\n\n");
}

/**
 * 标准化 AI 返回结果，确保页面可稳定渲染。
 * @param {object|null} aiData AI 输出 JSON。
 * @param {Array<object>} keywordCandidates 候选关键词。
 * @param {Array<object>} localTopThree 本地模型 Top3。
 * @returns {{ mainKeyword: object, topThree: Array<object>, annualTheme: string, insight: string, opportunityActions: Array<string>, avoidSignals: Array<string> }} 标准化结果。
 */
function normalizeFortuneResult(aiData, keywordCandidates, localTopThree) {
  const candidateSet = new Set(keywordCandidates.map((item) => item.keyword));

  /**
   * 选择合法关键词：
   * 当 AI 返回关键词不在候选集中时，回落到本地第一名。
   * @param {string} keyword 关键词。
   * @returns {string} 合法关键词。
   */
  const pickLegalKeyword = (keyword) => {
    if (candidateSet.has(keyword)) {
      return keyword;
    }

    return localTopThree[0]?.keyword ?? keywordCandidates[0]?.keyword ?? "专注主线";
  };

  const fallbackTopThree = localTopThree.slice(0, 3).map((item) => ({
    name: pickLegalKeyword(item.keyword),
    score: clampScore(item.score),
  }));

  const fallbackResult = {
    mainKeyword: fallbackTopThree[0] ?? { name: "专注主线", score: 0 },
    topThree: fallbackTopThree,
    annualTheme: "先把最重要的一件事做稳，再逐步放大结果。",
    insight:
      "你在执行和稳定维度上更有优势，2026 更适合少分心、稳推进。",
    opportunityActions: [
      "每周固定一次复盘，把目标压缩到三个关键动作。",
      "优先推进最接近结果的任务，减少低价值忙碌。",
      "建立一个可量化里程碑，按月追踪变化。",
    ],
    avoidSignals: ["连续两周没有可量化推进", "被临时事务持续打断主线"],
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedTopThree = [];
  const usedKeywordSet = new Set();
  const aiTopThree = Array.isArray(aiData.topThree) ? aiData.topThree : [];

  aiTopThree.forEach((item) => {
    const resolvedKeyword = pickLegalKeyword(item?.name);
    if (usedKeywordSet.has(resolvedKeyword)) {
      return;
    }

    usedKeywordSet.add(resolvedKeyword);
    normalizedTopThree.push({
      name: resolvedKeyword,
      score: clampScore(item?.score),
    });
  });

  // 关键逻辑：保证 Top3 始终完整，避免页面局部空数据。
  fallbackTopThree.forEach((item) => {
    if (normalizedTopThree.length >= 3) {
      return;
    }

    if (!usedKeywordSet.has(item.name)) {
      normalizedTopThree.push(item);
      usedKeywordSet.add(item.name);
    }
  });

  const actionList = Array.isArray(aiData.opportunityActions)
    ? aiData.opportunityActions.filter((item) => typeof item === "string")
    : [];
  const avoidList = Array.isArray(aiData.avoidSignals)
    ? aiData.avoidSignals.filter((item) => typeof item === "string")
    : [];

  const resolvedMainKeyword = pickLegalKeyword(aiData?.mainKeyword?.name);
  const resolvedMainScore = clampScore(aiData?.mainKeyword?.score);

  return {
    mainKeyword: {
      name: resolvedMainKeyword,
      score: resolvedMainScore || normalizedTopThree[0]?.score || 0,
    },
    topThree: normalizedTopThree.slice(0, 3),
    annualTheme:
      typeof aiData.annualTheme === "string" && aiData.annualTheme.trim()
        ? aiData.annualTheme.trim()
        : fallbackResult.annualTheme,
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    opportunityActions:
      actionList.length > 0 ? actionList.slice(0, 3) : fallbackResult.opportunityActions,
    avoidSignals: avoidList.length > 0 ? avoidList.slice(0, 2) : fallbackResult.avoidSignals,
  };
}

/**
 * 调用 AI 生成 2026 转运关键词分析。
 * @param {object} payload 请求负载。
 * @param {Array<string>} payload.summaryLines 答卷摘要文本。
 * @param {object} payload.preferenceVector 用户偏好向量。
 * @param {Array<object>} payload.keywordCandidates 关键词候选列表。
 * @param {Array<object>} payload.localTopThree 本地模型 Top3。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=18000] 超时时间（毫秒）。
 * @returns {Promise<{ mainKeyword: object, topThree: Array<object>, annualTheme: string, insight: string, opportunityActions: Array<string>, avoidSignals: Array<string> }>} 标准化 AI 结果。
 */
export async function analyzeFortune2026WithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt:
      "你是中文内容策划专家。请严格输出 JSON，不得附加任何解释和 Markdown。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.4,
  });

  return normalizeFortuneResult(
    aiData,
    payload.keywordCandidates ?? [],
    payload.localTopThree ?? [],
  );
}
