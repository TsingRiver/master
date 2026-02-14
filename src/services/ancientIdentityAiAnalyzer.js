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
 * 构建深度解析提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位擅长古风叙事的身份原型分析师。",
    "请根据用户答卷，判断其在古代最可能的身份原型。",
    "请仅输出 JSON，不要输出额外文字。",
    "字段要求：",
    JSON.stringify(
      {
        mainIdentity: { name: "身份名", score: "0-100 整数" },
        topThree: [
          { name: "身份名", score: 0 },
          { name: "身份名", score: 0 },
          { name: "身份名", score: 0 },
        ],
        identitySeal: "一句古风身份判词，30字以内",
        insight: "120字以内，解释身份依据",
        growthActions: ["建议1", "建议2", "建议3"],
        avoidSignals: ["需要避免的信号1", "需要避免的信号2"],
      },
      null,
      2,
    ),
    "候选身份（必须从中选择）：",
    JSON.stringify(payload.identityCandidates, null, 2),
    "答卷摘要：",
    payload.summaryLines.join("\n"),
    "用户向量（0-10）：",
    JSON.stringify(payload.preferenceVector, null, 2),
    "本地模型Top3（仅供参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
  ].join("\n\n");
}

/**
 * 标准化深度解析结果。
 * @param {object|null} aiData 深度解析输出。
 * @param {Array<object>} identityCandidates 候选身份列表。
 * @param {Array<object>} localTopThree 本地模型 Top3。
 * @returns {{ mainIdentity: object, topThree: Array<object>, identitySeal: string, insight: string, growthActions: Array<string>, avoidSignals: Array<string> }} 标准化结果。
 */
function normalizeAncientResult(aiData, identityCandidates, localTopThree) {
  const candidateSet = new Set(identityCandidates.map((item) => item.identity));

  /**
   * 获取合法身份：
   * 若返回结果不在候选集中，回落到本地第一名。
   * @param {string} identity 身份名。
   * @returns {string} 合法身份名。
   */
  const pickLegalIdentity = (identity) => {
    if (candidateSet.has(identity)) {
      return identity;
    }

    return localTopThree[0]?.identity ?? identityCandidates[0]?.identity ?? "中枢谋士";
  };

  const fallbackTopThree = localTopThree.slice(0, 3).map((item) => ({
    name: pickLegalIdentity(item.identity),
    score: clampScore(item.score),
  }));

  const fallbackResult = {
    mainIdentity: fallbackTopThree[0] ?? { name: "中枢谋士", score: 0 },
    topThree: fallbackTopThree,
    identitySeal: "心有山河局，笔下定乾坤。",
    insight: "你在判断、统筹与执行秩序上更稳，适合承担定策与控盘角色。",
    growthActions: [
      "先看全局再落子，避免被局部噪声牵引。",
      "把关键任务拆成三段节奏，按日推进。",
      "在协作中优先稳定规则与边界。",
    ],
    avoidSignals: ["临场决策过度摇摆", "同时分散推进过多战线"],
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedTopThree = [];
  const usedSet = new Set();
  const aiTopThree = Array.isArray(aiData.topThree) ? aiData.topThree : [];

  aiTopThree.forEach((item) => {
    const resolvedIdentity = pickLegalIdentity(item?.name);
    if (usedSet.has(resolvedIdentity)) {
      return;
    }

    usedSet.add(resolvedIdentity);
    normalizedTopThree.push({
      name: resolvedIdentity,
      score: clampScore(item?.score),
    });
  });

  // 关键逻辑：补齐 Top3，保证结果区展示稳定。
  fallbackTopThree.forEach((item) => {
    if (normalizedTopThree.length >= 3) {
      return;
    }

    if (!usedSet.has(item.name)) {
      normalizedTopThree.push(item);
      usedSet.add(item.name);
    }
  });

  const actionList = Array.isArray(aiData.growthActions)
    ? aiData.growthActions.filter((item) => typeof item === "string")
    : [];
  const avoidList = Array.isArray(aiData.avoidSignals)
    ? aiData.avoidSignals.filter((item) => typeof item === "string")
    : [];

  const resolvedMainIdentity = pickLegalIdentity(aiData?.mainIdentity?.name);
  const resolvedMainScore = clampScore(aiData?.mainIdentity?.score);

  return {
    mainIdentity: {
      name: resolvedMainIdentity,
      score: resolvedMainScore || normalizedTopThree[0]?.score || 0,
    },
    topThree: normalizedTopThree.slice(0, 3),
    identitySeal:
      typeof aiData.identitySeal === "string" && aiData.identitySeal.trim()
        ? aiData.identitySeal.trim()
        : fallbackResult.identitySeal,
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    growthActions:
      actionList.length > 0 ? actionList.slice(0, 3) : fallbackResult.growthActions,
    avoidSignals: avoidList.length > 0 ? avoidList.slice(0, 2) : fallbackResult.avoidSignals,
  };
}

/**
 * 执行古代身份深度解析。
 * @param {object} payload 请求负载。
 * @param {Array<string>} payload.summaryLines 答卷摘要文本。
 * @param {object} payload.preferenceVector 用户向量。
 * @param {Array<object>} payload.identityCandidates 候选身份列表。
 * @param {Array<object>} payload.localTopThree 本地模型 Top3。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=18000] 超时时间（毫秒）。
 * @returns {Promise<{ mainIdentity: object, topThree: Array<object>, identitySeal: string, insight: string, growthActions: Array<string>, avoidSignals: Array<string> }>} 标准化结果。
 */
export async function analyzeAncientIdentityWithDeepInsight(
  payload,
  options = {},
) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是古风叙事分析师。必须只输出 JSON，不得附加说明。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.45,
  });

  return normalizeAncientResult(
    aiData,
    payload.identityCandidates ?? [],
    payload.localTopThree ?? [],
  );
}
