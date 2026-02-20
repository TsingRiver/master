import { requestBailianJson } from "./bailianClient";

/**
 * 将输入分值约束到 [0, 100]。
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
 * 构建发给百炼的用户提示词。
 * @param {object} payload 请求体数据。
 * @param {Array<object>} payload.answerSummary 结构化答卷摘要。
 * @param {Array<string>} payload.summaryLines 可读答卷摘要。
 * @param {object} payload.preferenceVector 偏好向量。
 * @param {Array<object>} payload.candidateCities 候选城市列表。
 * @param {Array<object>} payload.localTopThree 本地模型 Top3。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是城市居住匹配分析专家，请根据用户日常生活答卷，推断最适合长期居住的城市。",
    "请严格遵守：只能从候选城市列表里选择。",
    "请只输出 JSON，不要输出其他说明。",
    "JSON 模板：",
    JSON.stringify(
      {
        topCity: { name: "候选城市名", score: "0-100 整数" },
        topThree: [
          { name: "候选城市名", score: 0 },
          { name: "候选城市名", score: 0 },
          { name: "候选城市名", score: 0 },
        ],
        insight: "150 字以内，解释推荐原因。",
        cityLifeAdvice:
          "80 字以内，给出落地建议（居住片区、通勤、生活方式）。",
      },
      null,
      2,
    ),
    "用户答卷结构化数据：",
    JSON.stringify(payload.answerSummary, null, 2),
    "用户答卷摘要文本：",
    payload.summaryLines.join("\n"),
    "用户偏好向量（0-10）：",
    JSON.stringify(payload.preferenceVector, null, 2),
    "候选城市列表：",
    JSON.stringify(payload.candidateCities, null, 2),
    "本地模型候选 Top3（可参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
  ].join("\n\n");
}

/**
 * 标准化 AI 输出，确保前端渲染稳定。
 * @param {object|null} aiData 模型返回 JSON。
 * @param {Array<object>} candidateCities 候选城市列表。
 * @param {Array<object>} localTopThree 本地模型 Top3。
 * @returns {{ topCity: object, topThree: Array<object>, insight: string, cityLifeAdvice: string }} 标准化后的结果。
 */
function normalizeAiResult(aiData, candidateCities, localTopThree) {
  const candidateSet = new Set(candidateCities.map((item) => item.name));

  /**
   * 选择合法城市：
   * 若 AI 返回候选集外城市，回落到本地模型第一名。
   * @param {string} cityName 城市名。
   * @returns {string} 合法城市名。
   */
  const pickLegalCityName = (cityName) => {
    if (candidateSet.has(cityName)) {
      return cityName;
    }

    // 关键逻辑：优先回退到当前候选池首位，避免国际版场景回退到固定国内城市名。
    return localTopThree[0]?.name ?? candidateCities[0]?.name ?? "城市待定";
  };

  const fallbackTopThree = localTopThree.slice(0, 3).map((item) => ({
    name: pickLegalCityName(item.name),
    score: clampScore(item.score),
  }));

  const fallbackResult = {
    topCity: fallbackTopThree[0] ?? { name: "城市待定", score: 0 },
    topThree: fallbackTopThree,
    insight: "基于当前答卷，你更适合在效率与生活质量之间平衡更好的城市。",
    cityLifeAdvice: "建议先在通勤半径内试住 1-3 个月，再决定长期定居。",
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedTopThree = [];
  const usedNames = new Set();
  const aiTopThree = Array.isArray(aiData.topThree) ? aiData.topThree : [];

  aiTopThree.forEach((item) => {
    const cityName = pickLegalCityName(item?.name);

    if (usedNames.has(cityName)) {
      return;
    }

    usedNames.add(cityName);
    normalizedTopThree.push({
      name: cityName,
      score: clampScore(item?.score),
    });
  });

  // 关键逻辑：补齐 Top3，确保页面组件不会出现空洞。
  fallbackTopThree.forEach((item) => {
    if (normalizedTopThree.length >= 3) {
      return;
    }

    if (!usedNames.has(item.name)) {
      normalizedTopThree.push(item);
      usedNames.add(item.name);
    }
  });

  const resolvedTopCityName = pickLegalCityName(aiData?.topCity?.name);
  const resolvedTopCityScore = clampScore(aiData?.topCity?.score);

  return {
    topCity: {
      name: resolvedTopCityName,
      score: resolvedTopCityScore || normalizedTopThree[0]?.score || 0,
    },
    topThree: normalizedTopThree.slice(0, 3),
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    cityLifeAdvice:
      typeof aiData.cityLifeAdvice === "string" && aiData.cityLifeAdvice.trim()
        ? aiData.cityLifeAdvice.trim()
        : fallbackResult.cityLifeAdvice,
  };
}

/**
 * 调用百炼 API 执行城市分析。
 * @param {object} payload 请求体数据。
 * @param {Array<object>} payload.answerSummary 结构化答卷摘要。
 * @param {Array<string>} payload.summaryLines 可读答卷摘要。
 * @param {object} payload.preferenceVector 偏好向量。
 * @param {Array<object>} payload.candidateCities 候选城市列表。
 * @param {Array<object>} payload.localTopThree 本地模型 Top3。
 * @param {object} [options] 请求配置。
 * @param {number} [options.timeoutMs=18000] 超时时间（毫秒）。
 * @returns {Promise<{ topCity: object, topThree: Array<object>, insight: string, cityLifeAdvice: string }>} 标准化分析结果。
 */
export async function analyzeCityWithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是资深城市生活顾问。必须只输出 JSON，不要输出额外文本。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.2,
  });

  return normalizeAiResult(
    aiData,
    payload.candidateCities ?? [],
    payload.localTopThree ?? [],
  );
}
