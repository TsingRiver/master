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
    "你是一位中文星座内容策划师，擅长输出‘贵人星座’类测评报告。",
    "请根据用户答卷，输出《2026 贵人星座报告》。",
    "必须只输出 JSON，不要输出任何额外文字。",
    "字段规范：",
    JSON.stringify(
      {
        mainSign: { name: "星座名", score: "0-100 整数" },
        topThree: [
          { name: "星座名", score: 0 },
          { name: "星座名", score: 0 },
          { name: "星座名", score: 0 },
        ],
        guardianSignal: "40字以内，说明该贵人星座会在哪类场景出现",
        insight: "120字以内，解释为何匹配",
        keyOpportunities: ["机会动作1", "机会动作2", "机会动作3"],
        avoidSignals: ["提醒信号1", "提醒信号2"],
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
  ].join("\n\n");
}

/**
 * 标准化 AI 返回结果，确保页面稳定渲染。
 * @param {object|null} aiData AI 输出 JSON。
 * @param {Array<object>} signCandidates 候选星座。
 * @param {Array<object>} localTopThree 本地模型 Top3。
 * @returns {{ mainSign: object, topThree: Array<object>, guardianSignal: string, insight: string, keyOpportunities: Array<string>, avoidSignals: Array<string> }} 标准化结果。
 */
function normalizeBenefactorResult(aiData, signCandidates, localTopThree) {
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
    keyOpportunities: [
      "把关键目标说清楚，主动向外释放协作信号。",
      "在重要项目里提前锁定一位可长期互补的搭档。",
      "每周复盘一次“谁在关键时刻帮助过你”，持续加深连接。",
    ],
    avoidSignals: ["只埋头单打独斗", "情绪上头时临时断联关键伙伴"],
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
    keyOpportunities:
      opportunities.length > 0
        ? opportunities.slice(0, 3)
        : fallbackResult.keyOpportunities,
    avoidSignals:
      avoidSignals.length > 0
        ? avoidSignals.slice(0, 2)
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
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=18000] 超时时间（毫秒）。
 * @returns {Promise<{ mainSign: object, topThree: Array<object>, guardianSignal: string, insight: string, keyOpportunities: Array<string>, avoidSignals: Array<string> }>} 标准化 AI 结果。
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
  );
}
