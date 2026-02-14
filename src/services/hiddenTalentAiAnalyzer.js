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
 * 构建深度生成提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词文本。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位中文心理风格内容策划师，擅长把问卷结果写成“隐藏天赋”解读。",
    "请基于用户答卷，输出《隐藏天赋报告》。",
    "请仅输出 JSON，不要输出任何额外文字。",
    "字段规范：",
    JSON.stringify(
      {
        mainTalent: { name: "天赋名", score: "0-100 整数" },
        topThree: [
          { name: "天赋名", score: 0 },
          { name: "天赋名", score: 0 },
          { name: "天赋名", score: 0 },
        ],
        talentDefinition: "40字以内，定义这个天赋的核心价值",
        insight: "120字以内，解释为什么匹配",
        unlockActions: ["解锁动作1", "解锁动作2", "解锁动作3"],
        blindSpots: ["盲点提示1", "盲点提示2"],
      },
      null,
      2,
    ),
    "候选天赋（必须从中选择）：",
    JSON.stringify(payload.talentCandidates, null, 2),
    "答卷摘要：",
    payload.summaryLines.join("\n"),
    "用户向量（0-10）：",
    JSON.stringify(payload.preferenceVector, null, 2),
    "本地模型Top3（仅供参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
  ].join("\n\n");
}

/**
 * 标准化深度生成结果，确保页面稳定渲染。
 * @param {object|null} aiData 深度生成输出。
 * @param {Array<object>} talentCandidates 候选天赋列表。
 * @param {Array<object>} localTopThree 本地模型 Top3。
 * @returns {{ mainTalent: object, topThree: Array<object>, talentDefinition: string, insight: string, unlockActions: Array<string>, blindSpots: Array<string> }} 标准化结果。
 */
function normalizeHiddenTalentResult(aiData, talentCandidates, localTopThree) {
  const candidateSet = new Set(talentCandidates.map((item) => item.talent));

  /**
   * 获取合法天赋名：
   * 当返回值不在候选集中时，回落到本地第一名。
   * @param {string} talent 天赋名。
   * @returns {string} 合法天赋名。
   */
  const pickLegalTalent = (talent) => {
    if (candidateSet.has(talent)) {
      return talent;
    }

    return localTopThree[0]?.talent ?? talentCandidates[0]?.talent ?? "趋势洞察者";
  };

  const fallbackTopThree = localTopThree.slice(0, 3).map((item) => ({
    name: pickLegalTalent(item.talent),
    score: clampScore(item.score),
  }));

  const fallbackResult = {
    mainTalent: fallbackTopThree[0] ?? { name: "趋势洞察者", score: 0 },
    topThree: fallbackTopThree,
    talentDefinition: "你擅长在复杂线索中提炼有效判断，并提前看到关键趋势。",
    insight:
      "你在洞察、结构和表达上更容易形成联动，所以能更快找到“高价值动作”。",
    unlockActions: [
      "每周记录 3 个你直觉命中的判断，并复盘原因。",
      "把一个灵感在 24 小时内落成最小可执行版本。",
      "固定输出一次观点笔记，强化天赋可见度。",
    ],
    blindSpots: ["信息过载导致判断摇摆", "灵感很多但执行收口不足"],
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedTopThree = [];
  const usedTalentSet = new Set();
  const aiTopThree = Array.isArray(aiData.topThree) ? aiData.topThree : [];

  aiTopThree.forEach((item) => {
    const resolvedTalent = pickLegalTalent(item?.name);
    if (usedTalentSet.has(resolvedTalent)) {
      return;
    }

    usedTalentSet.add(resolvedTalent);
    normalizedTopThree.push({
      name: resolvedTalent,
      score: clampScore(item?.score),
    });
  });

  // 关键逻辑：补齐 Top3，避免结果区域缺项。
  fallbackTopThree.forEach((item) => {
    if (normalizedTopThree.length >= 3) {
      return;
    }

    if (!usedTalentSet.has(item.name)) {
      normalizedTopThree.push(item);
      usedTalentSet.add(item.name);
    }
  });

  const actionList = Array.isArray(aiData.unlockActions)
    ? aiData.unlockActions.filter((item) => typeof item === "string")
    : [];
  const blindSpotList = Array.isArray(aiData.blindSpots)
    ? aiData.blindSpots.filter((item) => typeof item === "string")
    : [];

  const resolvedMainTalent = pickLegalTalent(aiData?.mainTalent?.name);
  const resolvedMainScore = clampScore(aiData?.mainTalent?.score);

  return {
    mainTalent: {
      name: resolvedMainTalent,
      score: resolvedMainScore || normalizedTopThree[0]?.score || 0,
    },
    topThree: normalizedTopThree.slice(0, 3),
    talentDefinition:
      typeof aiData.talentDefinition === "string" &&
      aiData.talentDefinition.trim()
        ? aiData.talentDefinition.trim()
        : fallbackResult.talentDefinition,
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    unlockActions:
      actionList.length > 0 ? actionList.slice(0, 3) : fallbackResult.unlockActions,
    blindSpots:
      blindSpotList.length > 0
        ? blindSpotList.slice(0, 2)
        : fallbackResult.blindSpots,
  };
}

/**
 * 执行隐藏天赋深度生成。
 * @param {object} payload 请求负载。
 * @param {Array<string>} payload.summaryLines 答卷摘要文本。
 * @param {object} payload.preferenceVector 用户向量。
 * @param {Array<object>} payload.talentCandidates 候选天赋列表。
 * @param {Array<object>} payload.localTopThree 本地模型 Top3。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=18000] 超时时间（毫秒）。
 * @returns {Promise<{ mainTalent: object, topThree: Array<object>, talentDefinition: string, insight: string, unlockActions: Array<string>, blindSpots: Array<string> }>} 标准化结果。
 */
export async function analyzeHiddenTalentWithDeepInsight(
  payload,
  options = {},
) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是中文风格化分析师。必须只输出 JSON，不允许附加说明。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.45,
  });

  return normalizeHiddenTalentResult(
    aiData,
    payload.talentCandidates ?? [],
    payload.localTopThree ?? [],
  );
}
