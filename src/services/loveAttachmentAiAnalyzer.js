import { requestBailianJson } from "./bailianClient";

/**
 * 依恋类型名称映射。
 */
const TYPE_NAME_MAP = {
  secure: "安全依恋型",
  anxious: "焦虑依恋型",
  avoidant: "回避依恋型",
  fearful: "焦虑-回避矛盾型",
};

/**
 * 依恋类型颜色映射（用于分布条展示）。
 */
const TYPE_COLOR_MAP = {
  secure: "#45A67E",
  anxious: "#F3A45A",
  avoidant: "#5F88DF",
  fearful: "#A973DA",
};

/**
 * 依恋类型键列表。
 */
const TYPE_KEYS = Object.keys(TYPE_NAME_MAP);

/**
 * 限制分值到 [0, 100]。
 * @param {number} score 原始分值。
 * @returns {number} 合法分值。
 */
function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Number(score.toFixed(1))));
}

/**
 * 归一化标签数组。
 * @param {unknown} tags 标签输入。
 * @param {Array<string>} fallbackTags 兜底标签。
 * @returns {Array<string>} 标签数组（最多 6 条，不带 # 前缀）。
 */
function normalizeTags(tags, fallbackTags) {
  if (!Array.isArray(tags)) {
    return fallbackTags
      .map((tagItem) => String(tagItem ?? "").replace(/^#/, "").trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  const normalizedTags = tags
    .map((tagItem) => String(tagItem ?? "").trim())
    .filter(Boolean)
    // 关键逻辑：恋爱主题标签按“卡片化文字”展示，不保留 # 前缀。
    .map((tagItem) => tagItem.replace(/^#/, "").trim())
    .slice(0, 6);

  return normalizedTags.length > 0
    ? normalizedTags
    : fallbackTags
        .map((tagItem) => String(tagItem ?? "").replace(/^#/, "").trim())
        .filter(Boolean)
        .slice(0, 6);
}

/**
 * 归一化字符串列表。
 * @param {unknown} value 输入值。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 条目上限。
 * @returns {Array<string>} 归一化后的列表。
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
 * 将长文本拆分为要点列表。
 * @param {unknown} text 文本输入。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 输出上限。
 * @returns {Array<string>} 要点列表。
 */
function splitTextToPoints(text, fallbackList, limit) {
  const normalizedText = String(text ?? "").trim();
  if (!normalizedText) {
    return fallbackList.slice(0, limit);
  }

  const splitList = normalizedText
    .split(/[。！？；\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);

  return splitList.length > 0 ? splitList : fallbackList.slice(0, limit);
}

/**
 * 判断文本是否包含“家庭成员/照料关系”线索。
 * 关键逻辑：用于校验原生家庭画像语义，避免输出仅对个人感受做抽象描述。
 * @param {unknown} value 文本值。
 * @returns {boolean} 是否包含家庭线索。
 */
function hasFamilyContext(value) {
  const normalizedText = String(value ?? "").trim();
  if (!normalizedText) {
    return false;
  }

  const familyKeywordPattern =
    /(家里|家庭|父母|爸爸|妈妈|照料者|养育者|监护人|长辈|家人|原生家庭)/;
  return familyKeywordPattern.test(normalizedText);
}

/**
 * 归一化“原生家庭画像”长文。
 * 关键逻辑：若 AI 输出缺少家庭视角，则回退到可靠兜底文案。
 * @param {unknown} value AI 输出。
 * @param {string} fallbackText 兜底文本。
 * @returns {string} 规范化后的画像文本。
 */
function normalizeFamilyPortraitText(value, fallbackText) {
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) {
    return fallbackText;
  }

  return hasFamilyContext(normalizedValue) ? normalizedValue : fallbackText;
}

/**
 * 归一化“原生家庭画像”要点列表。
 * 关键逻辑：若要点缺少家庭角色线索，则回退到预置家庭画像要点，保证语义稳定。
 * @param {unknown} value AI 输出列表。
 * @param {Array<string>} fallbackList 兜底列表。
 * @param {number} limit 上限。
 * @returns {Array<string>} 规范化要点列表。
 */
function normalizeFamilyPortraitPoints(value, fallbackList, limit) {
  const normalizedList = normalizeStringList(value, fallbackList, limit);
  const joinedText = normalizedList.join("。");

  return hasFamilyContext(joinedText)
    ? normalizedList
    : fallbackList.slice(0, limit);
}

/**
 * 构建发送给 AI 的提示词。
 * @param {object} payload 请求负载。
 * @returns {string} 用户提示词。
 */
function buildUserPrompt(payload) {
  return [
    "你是一位中文亲密关系测评分析师。",
    "请基于答卷输出恋爱依恋结果报告。",
    "必须只输出 JSON，不要输出任何额外说明。",
    "写作约束：",
    "1. loveBaseColor 必须是 2 句话，讲清这个人是什么类型的恋人，要生动有画面感。",
    "2. bestMatch 和 avoidType 各 1 句，点到为止不用展开。",
    "3. loveAdvice 只 1 句，要戳心但不长。",
    "4. radarScores 每项 0-10 分整数，允许出现 0-2 的低分；若不确定可不填。",
    "字段规范：",
    JSON.stringify(
      {
        mainType: { key: "secure|anxious|avoidant|fearful", name: "类型名", score: 0 },
        oneLineSummary: "一句话概述，50字以内",
        tags: ["标签1", "标签2", "标签3", "标签4"],
        distribution: [
          { key: "secure", score: 0 },
          { key: "anxious", score: 0 },
          { key: "avoidant", score: 0 },
          { key: "fearful", score: 0 },
        ],
        insight: "综合说明，100字以内",
        loveBaseColor: "你的恋爱底色，2句话，60字以内",
        bestMatch: "最适合你的恋人类型，1句话，30字以内",
        avoidType: "千万别碰的类型，1句话，30字以内",
        loveAdvice: "一句恋爱忠告，20字以内",
        radarScores: {
          initiative: "恋爱主动度0-10",
          charm: "主动魅力0-10",
          attachment: "依恋指数0-10",
          emotionTension: "情绪张力0-10",
          exclusivePreference: "专属偏爱0-10",
        },
      },
      null,
      2,
    ),
    "候选类型（必须从中选择）：",
    JSON.stringify(payload.typeCandidates, null, 2),
    "本地分布参考：",
    JSON.stringify(payload.localDistribution, null, 2),
    "本地主类型参考：",
    JSON.stringify(payload.localMainType, null, 2),
    "答卷摘要（节选）：",
    payload.summaryLines.slice(0, 25).join("\n"),
  ].join("\n\n");
}

/**
 * 解析合法类型键。
 * @param {unknown} rawKey 原始类型键。
 * @param {unknown} rawName 原始类型名称。
 * @returns {string} 合法类型键。
 */
function resolveTypeKey(rawKey, rawName) {
  const normalizedKey = String(rawKey ?? "").trim();
  if (TYPE_KEYS.includes(normalizedKey)) {
    return normalizedKey;
  }

  const normalizedName = String(rawName ?? "").trim();
  const matchedEntry = Object.entries(TYPE_NAME_MAP).find(([, typeName]) => typeName === normalizedName);
  return matchedEntry?.[0] ?? "secure";
}

/**
 * 将任意分值数组标准化为百分比占比。
 * @param {Array<{ key: string, score: number }>} distributionList 分布列表。
 * @returns {Array<{ key: string, score: number }>} 标准化分布列表（总和约 100）。
 */
function normalizeDistributionPercent(distributionList) {
  const safeList = TYPE_KEYS.map((typeKey) => {
    const matchedItem = distributionList.find((item) => item.key === typeKey);
    return {
      key: typeKey,
      score: Math.max(0, Number(matchedItem?.score ?? 0)),
    };
  });

  const totalScore = safeList.reduce((sum, item) => sum + item.score, 0);
  if (totalScore <= 0) {
    return TYPE_KEYS.map((typeKey) => ({ key: typeKey, score: 25 }));
  }

  const normalizedList = safeList.map((item) => ({
    key: item.key,
    score: clampScore((item.score / totalScore) * 100),
  }));

  return normalizedList;
}

/**
 * 限制雷达分值到 [0, 10]。
 * @param {unknown} val 原始值。
 * @returns {number} 合法分值。
 */
function clampRadarScore(val) {
  const num = Math.round(Number(val) || 0);
  return Math.max(0, Math.min(10, num));
}

/**
 * 归一化雷达分值对象。
 * 关键逻辑：不做人为“高光保底”，保留低分区间用于真实反差表达。
 * @param {unknown} raw AI 输出的 radarScores。
 * @param {object} fallbackScores 兜底分值。
 * @returns {{ initiative: number, charm: number, attachment: number, emotionTension: number, exclusivePreference: number }} 归一化分值。
 */
function normalizeRadarScores(raw, fallbackScores) {
  const keys = ["initiative", "charm", "attachment", "emotionTension", "exclusivePreference"];
  const source = raw && typeof raw === "object" ? raw : {};
  const result = {};

  keys.forEach((key) => {
    const aiVal = Number(source[key]);
    result[key] = Number.isFinite(aiVal) && aiVal >= 0 && aiVal <= 10
      ? clampRadarScore(aiVal)
      : (fallbackScores[key] ?? 5);
  });

  return result;
}

/**
 * 标准化 AI 返回结果。
 * @param {object|null} aiData AI 输出。
 * @param {object} payload 请求负载。
 * @returns {object} 标准化结果。
 */
function normalizeAiResult(aiData, payload) {
  const localDistribution = Array.isArray(payload.localDistribution)
    ? payload.localDistribution
    : [];

  const fallbackMainTypeKey = payload.localMainType?.key ?? localDistribution[0]?.key ?? "secure";
  const fallbackMainTypeName = TYPE_NAME_MAP[fallbackMainTypeKey] ?? TYPE_NAME_MAP.secure;

  const fallbackTypeEntry = payload.typeCandidates.find(
    (item) => item.key === fallbackMainTypeKey,
  );

  const fallbackResult = {
    mainType: {
      key: fallbackMainTypeKey,
      name: fallbackMainTypeName,
      score: clampScore(payload.localMainType?.score ?? localDistribution[0]?.score ?? 0),
    },
    oneLineSummary: fallbackTypeEntry?.summary ?? "你的依恋模式具有可调整空间，关系质量可以通过练习持续优化。",
    tags: fallbackTypeEntry?.tags ?? ["关系修复", "情绪觉察", "边界沟通"],
    distribution: localDistribution,
    insight: "结果不是给你贴标签，而是帮助你理解自己的触发点与修复路径，让关系更稳定。",
    loveBaseColor: payload.localLoveBaseColor ?? "你是一个有独特恋爱节奏的人。你值得被用对的方式爱着。",
    bestMatch: payload.localBestMatch ?? "能理解你节奏、不强迫改变的「同频共振型」。",
    avoidType: payload.localAvoidType ?? "完全忽视你情绪、只关注自己节奏的「情感盲区型」。",
    loveAdvice: payload.localLoveAdvice ?? "先爱好自己，才能好好爱人。",
    radarScores: payload.localRadarScores ?? {
      initiative: 5,
      charm: 5,
      attachment: 5,
      emotionTension: 5,
      exclusivePreference: 5,
    },
  };

  if (!aiData || typeof aiData !== "object") {
    return fallbackResult;
  }

  const resolvedMainTypeKey = resolveTypeKey(aiData?.mainType?.key, aiData?.mainType?.name);
  const resolvedMainTypeName = TYPE_NAME_MAP[resolvedMainTypeKey];

  const aiDistributionList = Array.isArray(aiData.distribution)
    ? aiData.distribution.map((item) => ({
        key: resolveTypeKey(item?.key, item?.name),
        score: Number(item?.score ?? 0),
      }))
    : localDistribution.map((item) => ({ key: item.key, score: item.score }));

  const normalizedDistribution = normalizeDistributionPercent(aiDistributionList)
    .map((item) => ({
      key: item.key,
      name: TYPE_NAME_MAP[item.key],
      color: TYPE_COLOR_MAP[item.key],
      score: item.score,
    }))
    .sort((leftItem, rightItem) => rightItem.score - leftItem.score);

  const mainFromDistribution = normalizedDistribution.find(
    (item) => item.key === resolvedMainTypeKey,
  );

  const fallbackTypeInfo = payload.typeCandidates.find(
    (item) => item.key === resolvedMainTypeKey,
  );

  return {
    mainType: {
      key: resolvedMainTypeKey,
      name: resolvedMainTypeName,
      score: clampScore(aiData?.mainType?.score ?? mainFromDistribution?.score ?? 0),
    },
    oneLineSummary:
      typeof aiData.oneLineSummary === "string" && aiData.oneLineSummary.trim()
        ? aiData.oneLineSummary.trim()
        : fallbackTypeInfo?.summary ?? fallbackResult.oneLineSummary,
    tags: normalizeTags(aiData.tags, fallbackTypeInfo?.tags ?? fallbackResult.tags),
    distribution: normalizedDistribution,
    insight:
      typeof aiData.insight === "string" && aiData.insight.trim()
        ? aiData.insight.trim()
        : fallbackResult.insight,
    loveBaseColor:
      typeof aiData.loveBaseColor === "string" && aiData.loveBaseColor.trim()
        ? aiData.loveBaseColor.trim()
        : fallbackResult.loveBaseColor,
    bestMatch:
      typeof aiData.bestMatch === "string" && aiData.bestMatch.trim()
        ? aiData.bestMatch.trim()
        : fallbackResult.bestMatch,
    avoidType:
      typeof aiData.avoidType === "string" && aiData.avoidType.trim()
        ? aiData.avoidType.trim()
        : fallbackResult.avoidType,
    loveAdvice:
      typeof aiData.loveAdvice === "string" && aiData.loveAdvice.trim()
        ? aiData.loveAdvice.trim()
        : fallbackResult.loveAdvice,
    radarScores: normalizeRadarScores(
      aiData.radarScores,
      fallbackResult.radarScores,
    ),
  };
}

/**
 * 调用 AI 生成恋爱心理结果。
 * @param {object} payload 请求负载。
 * @param {Array<object>} payload.typeCandidates 类型候选。
 * @param {Array<object>} payload.localDistribution 本地分布。
 * @param {object} payload.localMainType 本地主类型。
 * @param {Array<string>} payload.summaryLines 答卷摘要。
 * @param {object} [options] 运行配置。
 * @param {number} [options.timeoutMs=20000] 超时时间（毫秒）。
 * @returns {Promise<object>} 标准化 AI 结果。
 */
export async function analyzeLoveAttachmentWithAI(payload, options = {}) {
  const aiData = await requestBailianJson({
    systemPrompt: "你是中文亲密关系分析师。严格输出 JSON，不得附加任何解释。",
    userPrompt: buildUserPrompt(payload),
    timeoutMs: options.timeoutMs ?? 20000,
    temperature: 0.4,
  });

  return normalizeAiResult(aiData, payload);
}
