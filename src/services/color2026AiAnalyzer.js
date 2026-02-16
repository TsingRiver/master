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
    "你是一位中文生活风格策划师，擅长把问卷结果写成‘年度主题色报告’。",
    "请根据用户答卷，输出《2026 主题色报告》。",
    "只允许输出 JSON，不要输出任何额外说明或 Markdown。",
    "字段规范：",
    JSON.stringify(
      {
        mainColor: { key: "颜色key", name: "主题色名称", score: "0-100 整数" },
        topThree: [
          { key: "颜色key", name: "颜色名称", score: 0 },
          { key: "颜色key", name: "颜色名称", score: 0 },
          { key: "颜色key", name: "颜色名称", score: 0 },
        ],
        dailyMood: "40字以内，描述该主题色在日常中的状态关键词",
        insight: "120字以内，解释为何匹配",
        keyActions: ["建议1", "建议2", "建议3"],
        avoidSignals: ["提醒1", "提醒2"],
      },
      null,
      2,
    ),
    "候选主题色（必须从中选择）：",
    JSON.stringify(payload.colorCandidates, null, 2),
    "答卷摘要：",
    payload.summaryLines.join("\n"),
    "本地模型 Top3（仅供参考）：",
    JSON.stringify(payload.localTopThree, null, 2),
  ].join("\n\n");
}

/**
 * 标准化 AI 返回结果，确保页面稳定渲染。
 * @param {object|null} aiData AI 输出 JSON。
 * @param {Array<object>} colorCandidates 颜色候选列表。
 * @param {Array<object>} localTopThree 本地模型 Top3。
 * @returns {{ mainColor: object, topThree: Array<object>, dailyMood: string, insight: string, keyActions: Array<string>, avoidSignals: Array<string> }} 标准化结果。
 */
function normalizeColorResult(aiData, colorCandidates, localTopThree) {
  const candidateMap = new Map(
    colorCandidates.map((item) => [item.key, item]),
  );
  const nameToKeyMap = new Map(
    colorCandidates.map((item) => [item.name, item.key]),
  );

  /**
   * 解析合法颜色键：
   * 1. 优先使用 key。
   * 2. 回退通过 name 反查 key。
   * 3. 都失败则回退本地第一名。
   * @param {object} item 候选对象。
   * @returns {string} 合法颜色键。
   */
  const resolveLegalKey = (item) => {
    const rawKey = String(item?.key ?? "").trim();
    if (candidateMap.has(rawKey)) {
      return rawKey;
    }

    const rawName = String(item?.name ?? "").trim();
    if (nameToKeyMap.has(rawName)) {
      return nameToKeyMap.get(rawName);
    }

    return localTopThree[0]?.key ?? colorCandidates[0]?.key ?? "blue";
  };

  /**
   * 根据颜色键构建标准输出项。
   * @param {string} colorKey 颜色键。
   * @param {number} score 分值。
   * @returns {{ key: string, name: string, score: number }} 标准项。
   */
  const createColorItem = (colorKey, score) => {
    const matchedCandidate = candidateMap.get(colorKey);
    return {
      key: colorKey,
      name: matchedCandidate?.name ?? "深海蓝",
      score: clampScore(score),
    };
  };

  const fallbackTopThree = localTopThree.slice(0, 3).map((item) =>
    createColorItem(item.key, item.score),
  );

  const fallbackResult = {
    mainColor: fallbackTopThree[0] ?? createColorItem("blue", 0),
    topThree: fallbackTopThree,
    dailyMood: "先把生活节奏调顺，再把关键目标稳步推进。",
    insight:
      "你的答题偏好体现了较稳定的风格倾向，主题色可以作为你 2026 年的状态锚点。",
    keyActions: [
      "把主题色应用到手机壁纸或待办封面，强化日常提醒。",
      "每周围绕一个核心目标行动，减少分散投入。",
      "在关键协作中主动表达需求，提升连接效率。",
    ],
    avoidSignals: ["频繁切换目标导致节奏失控", "高压时完全放弃休息恢复"],
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const normalizedTopThree = [];
  const usedKeySet = new Set();
  const aiTopThree = Array.isArray(aiData.topThree) ? aiData.topThree : [];

  aiTopThree.forEach((item) => {
    const resolvedKey = resolveLegalKey(item);
    if (usedKeySet.has(resolvedKey)) {
      return;
    }

    usedKeySet.add(resolvedKey);
    normalizedTopThree.push(createColorItem(resolvedKey, item?.score));
  });

  // 关键逻辑：Top3 保证补齐，避免结果区域数据缺失。
  fallbackTopThree.forEach((item) => {
    if (normalizedTopThree.length >= 3) {
      return;
    }

    if (!usedKeySet.has(item.key)) {
      normalizedTopThree.push(item);
      usedKeySet.add(item.key);
    }
  });

  const resolvedMainKey = resolveLegalKey(aiData.mainColor);
  const resolvedMainColor = createColorItem(
    resolvedMainKey,
    aiData?.mainColor?.score,
  );

  const keyActionList = Array.isArray(aiData.keyActions)
    ? aiData.keyActions.filter((item) => typeof item === "string")
    : [];
  const avoidSignalList = Array.isArray(aiData.avoidSignals)
    ? aiData.avoidSignals.filter((item) => typeof item === "string")
    : [];

  return {
    mainColor: resolvedMainColor,
    topThree: normalizedTopThree.slice(0, 3),
    dailyMood:
      typeof aiData.dailyMood === "string" && aiData.dailyMood.trim()
        ? aiData.dailyMood.trim()
        : fallbackResult.dailyMood,
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    keyActions:
      keyActionList.length > 0
        ? keyActionList.slice(0, 3)
        : fallbackResult.keyActions,
    avoidSignals:
      avoidSignalList.length > 0
        ? avoidSignalList.slice(0, 2)
        : fallbackResult.avoidSignals,
  };
}

/**
 * 调用 AI 生成 2026 主题色分析。
 * @param {object} payload 请求负载。
 * @param {Array<string>} payload.summaryLines 答卷摘要文本。
 * @param {Array<object>} payload.colorCandidates 颜色候选列表。
 * @param {Array<object>} payload.localTopThree 本地模型 Top3。
 * @param {object} [options] 调用选项。
 * @param {number} [options.timeoutMs=18000] 超时时间（毫秒）。
 * @returns {Promise<{ mainColor: object, topThree: Array<object>, dailyMood: string, insight: string, keyActions: Array<string>, avoidSignals: Array<string> }>} 标准化 AI 结果。
 */
export async function analyzeColor2026WithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是中文风格分析师。必须只输出 JSON，不允许附加说明。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 18000,
    temperature: 0.42,
  });

  return normalizeColorResult(
    aiData,
    payload.colorCandidates ?? [],
    payload.localTopThree ?? [],
  );
}
