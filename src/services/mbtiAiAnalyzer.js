import { requestBailianJson } from "./bailianClient";

/**
 * 限制百分比分值。
 * @param {number} score 原始分值。
 * @returns {number} 合法百分比。
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
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位中文人格测评内容策划师，擅长把 MBTI 结果写成移动端可读的简洁报告。",
    "请基于用户答卷与本地模型结果，输出 JSON（不得输出额外文字）。",
    "字段规范：",
    JSON.stringify(
      {
        mainType: { name: "ENTP", score: 0 },
        topThree: [
          { name: "ENTP", score: 0 },
          { name: "INTP", score: 0 },
          { name: "ENTJ", score: 0 },
        ],
        profileTitle: "12字以内的小标题",
        insight: "120字以内，解释为何匹配",
        growthActions: ["建议1", "建议2", "建议3"],
        blindSpots: ["提醒1", "提醒2"],
      },
      null,
      2,
    ),
    "可选 MBTI 类型（必须从中选择）：",
    JSON.stringify(payload.typeCandidates, null, 2),
    "本地模型 Top3（优先参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
    "维度倾向：",
    JSON.stringify(payload.axisScores, null, 2),
    "答卷摘要：",
    payload.summaryLines.join("\n"),
  ].join("\n\n");
}

/**
 * 标准化深度结果，保证页面稳定渲染。
 * @param {object|null} aiData 深度模型返回。
 * @param {object} localResult 本地结果。
 * @returns {{ mainType: object, topThree: Array<object>, profileTitle: string, insight: string, growthActions: Array<string>, blindSpots: Array<string>, typeCard: object }} 标准化结果。
 */
function normalizeMbtiDeepResult(aiData, localResult) {
  const legalTypeSet = new Set(localResult.scoredTypes.map((item) => item.type));

  /**
   * 解析合法类型。
   * @param {string} inputType 输入类型码。
   * @returns {string} 合法类型码。
   */
  const resolveLegalType = (inputType) => {
    if (legalTypeSet.has(inputType)) {
      return inputType;
    }

    return localResult.topType.type;
  };

  const fallbackTopThree = localResult.topThree.map((item) => ({
    name: item.type,
    score: clampScore(item.score),
  }));

  const fallbackResult = {
    mainType: {
      name: localResult.topType.type,
      score: clampScore(localResult.topType.score),
    },
    topThree: fallbackTopThree,
    profileTitle: `${localResult.topType.type} · ${localResult.topType.title}`,
    insight: localResult.localNarrative,
    growthActions: [
      "把你的核心优势场景固定下来，每周至少重复一次。",
      "把关键决策过程写成模板，减少情绪波动带来的偏差。",
      "每月挑一个短板维度做一次刻意练习，保持类型弹性。",
    ],
    blindSpots: ["在高压环境下容易固化到单一决策路径", "表达风格与他人节奏不一致时会被误解"],
    typeCard: localResult.typeCard,
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const topThree = [];
  const usedTypeSet = new Set();

  (Array.isArray(aiData.topThree) ? aiData.topThree : []).forEach((item) => {
    const resolvedType = resolveLegalType(item?.name);

    if (usedTypeSet.has(resolvedType)) {
      return;
    }

    usedTypeSet.add(resolvedType);
    topThree.push({
      name: resolvedType,
      score: clampScore(item?.score),
    });
  });

  fallbackTopThree.forEach((item) => {
    if (topThree.length >= 3) {
      return;
    }

    if (!usedTypeSet.has(item.name)) {
      topThree.push(item);
      usedTypeSet.add(item.name);
    }
  });

  const resolvedMainTypeName = resolveLegalType(aiData?.mainType?.name);
  const resolvedMainTypeScore =
    clampScore(aiData?.mainType?.score) || topThree[0]?.score || fallbackResult.mainType.score;

  const growthActions = Array.isArray(aiData.growthActions)
    ? aiData.growthActions.filter((item) => typeof item === "string" && item.trim())
    : [];
  const blindSpots = Array.isArray(aiData.blindSpots)
    ? aiData.blindSpots.filter((item) => typeof item === "string" && item.trim())
    : [];

  return {
    mainType: {
      name: resolvedMainTypeName,
      score: resolvedMainTypeScore,
    },
    topThree: topThree.slice(0, 3),
    profileTitle:
      typeof aiData.profileTitle === "string" && aiData.profileTitle.trim()
        ? aiData.profileTitle.trim()
        : fallbackResult.profileTitle,
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    growthActions:
      growthActions.length > 0 ? growthActions.slice(0, 3) : fallbackResult.growthActions,
    blindSpots:
      blindSpots.length > 0 ? blindSpots.slice(0, 2) : fallbackResult.blindSpots,
    // 关键逻辑：类型学卡片以本地规则计算为准，确保字段与格式稳定。
    typeCard: localResult.typeCard,
  };
}

/**
 * 执行 MBTI 深度分析。
 * @param {object} payload 请求负载。
 * @param {Array<string>} payload.summaryLines 答卷摘要。
 * @param {object} payload.axisScores 维度分值。
 * @param {Array<object>} payload.typeCandidates 候选类型。
 * @param {Array<object>} payload.localTopThree 本地 Top3。
 * @param {object} payload.localResult 本地完整结果。
 * @param {object} [options] 调用配置。
 * @param {number} [options.timeoutMs=18000] 超时时间。
 * @returns {Promise<{ mainType: object, topThree: Array<object>, profileTitle: string, insight: string, growthActions: Array<string>, blindSpots: Array<string>, typeCard: object }>} 标准化结果。
 */
export async function analyzeMbtiWithDeepInsight(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是中文人格分析师。必须严格输出 JSON。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.35,
  });

  return normalizeMbtiDeepResult(aiData, payload.localResult);
}
