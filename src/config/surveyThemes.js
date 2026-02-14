import { QUESTION_BANK } from "../data/questionBank";
import { CITY_PROFILES } from "../data/cityProfiles";
import { FORTUNE_2026_QUESTION_BANK } from "../data/fortune2026QuestionBank";
import { ANCIENT_IDENTITY_QUESTION_BANK } from "../data/ancientIdentityQuestionBank";
import { HIDDEN_TALENT_QUESTION_BANK } from "../data/hiddenTalentQuestionBank";
import { analyzeCitiesLocally } from "../services/localAnalyzer";
import { analyzeCityWithAI } from "../services/aiAnalyzer";
import { analyzeFortune2026Locally } from "../services/fortune2026Analyzer";
import { analyzeFortune2026WithAI } from "../services/fortune2026AiAnalyzer";
import { analyzeAncientIdentityLocally } from "../services/ancientIdentityAnalyzer";
import { analyzeAncientIdentityWithDeepInsight } from "../services/ancientIdentityAiAnalyzer";
import { analyzeHiddenTalentLocally } from "../services/hiddenTalentAnalyzer";
import { analyzeHiddenTalentWithDeepInsight } from "../services/hiddenTalentAiAnalyzer";

/**
 * 统一结果结构说明：
 * 1. 所有主题最终都映射到该结构，页面组件只做通用渲染。
 * 2. 这样新增主题只需新增配置，不需要复制页面代码。
 */
export const UNIFIED_RESULT_TEMPLATE = {
  source: "deep",
  prefixLabel: "",
  scoreLabel: "",
  main: { name: "", score: 0 },
  highlightCard: { title: "", content: "" },
  insight: "",
  topThreeTitle: "",
  topThree: [],
  detailSections: [],
  summaryTitle: "",
  summaryLines: [],
  restartButtonText: "重新测试",
};

/**
 * 创建标准化结果对象。
 * @param {object} payload 渲染数据。
 * @param {"deep"|"local"} payload.source 结果来源。
 * @param {string} payload.prefixLabel 主结果前缀文案。
 * @param {string} payload.scoreLabel 分值文案。
 * @param {{ name: string, score: number }} payload.main 主结果对象。
 * @param {{ title: string, content: string }} payload.highlightCard 高亮卡片。
 * @param {string} payload.insight 解释文案。
 * @param {string} payload.topThreeTitle Top3 标题。
 * @param {Array<{ name: string, score: number }>} payload.topThree Top3 列表。
 * @param {Array<{ title: string, items: Array<string> }>} payload.detailSections 详情分组。
 * @param {string} payload.summaryTitle 摘要标题。
 * @param {Array<string>} payload.summaryLines 摘要内容。
 * @param {string} payload.restartButtonText 重测按钮文案。
 * @returns {object} 统一结果对象。
 */
function createUnifiedResult(payload) {
  return {
    ...UNIFIED_RESULT_TEMPLATE,
    ...payload,
  };
}

/**
 * 城市主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ answerSummary: Array<object>, summaryLines: Array<string>, preferenceVector: object, candidateCities: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildCityDeepPayload(localResult) {
  return {
    answerSummary: localResult.answerSummary,
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    // 关键逻辑：仅传必要字段，降低请求体体积和接口延迟。
    candidateCities: CITY_PROFILES.map((item) => ({
      name: item.name,
      profile: item.profile,
      traits: item.traits,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
      traits: item.traits,
    })),
  };
}

/**
 * 城市主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildCityDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "最终推荐城市",
    scoreLabel: "综合匹配度",
    main: deepResult.topCity,
    highlightCard: {
      title: "城市生活建议",
      content: deepResult.cityLifeAdvice,
    },
    insight: deepResult.insight,
    topThreeTitle: "Top 3 匹配城市",
    topThree: deepResult.topThree,
    detailSections: [
      {
        title: "匹配标签",
        items: ["生活习惯映射", "结构化偏好拟合", "语义化结论生成"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测评",
  });
}

/**
 * 城市主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildCityLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "最终推荐城市",
    scoreLabel: "综合匹配度",
    main: { name: localResult.topCity.name, score: localResult.topCity.score },
    highlightCard: {
      title: "城市生活建议",
      content: "建议先在通勤半径内试住 1-3 个月，再决定长期定居。",
    },
    insight: localResult.localInsight,
    topThreeTitle: "Top 3 匹配城市",
    topThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
    })),
    detailSections: [
      {
        title: "匹配标签",
        items: ["生活习惯映射", "结构化偏好拟合", "规则模型兜底"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测评",
  });
}

/**
 * 转运关键词主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, preferenceVector: object, keywordCandidates: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildFortuneDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    keywordCandidates: localResult.scoredKeywords.map((item) => ({
      keyword: item.keyword,
      meaning: item.meaning,
      profile: item.profile,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      keyword: item.keyword,
      score: item.score,
      meaning: item.meaning,
    })),
  };
}

/**
 * 转运关键词主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildFortuneDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的 2026 主关键词",
    scoreLabel: "关键词匹配度",
    main: deepResult.mainKeyword,
    highlightCard: {
      title: "年度主题",
      content: deepResult.annualTheme,
    },
    insight: deepResult.insight,
    topThreeTitle: "关键词 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "机会动作", items: deepResult.opportunityActions },
      { title: "避坑信号", items: deepResult.avoidSignals },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 转运关键词主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildFortuneLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的 2026 主关键词",
    scoreLabel: "关键词匹配度",
    main: {
      name: localResult.topKeyword.keyword,
      score: localResult.topKeyword.score,
    },
    highlightCard: {
      title: "年度主题",
      content: "先稳住节奏，再把优势动作做成连续复利。",
    },
    insight: localResult.localNarrative,
    topThreeTitle: "关键词 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.keyword,
      score: item.score,
    })),
    detailSections: [
      {
        title: "机会动作",
        items: [
          "把本周最关键事项压缩为 3 件，并设完成标准。",
          "把一次尝试动作提前到今天执行，避免长期准备不落地。",
          "每周固定一次复盘，记录有效策略并持续迭代。",
        ],
      },
      {
        title: "避坑信号",
        items: ["目标频繁切换", "连续两周没有明确推进结果"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 古代身份主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, preferenceVector: object, identityCandidates: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildAncientDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    identityCandidates: localResult.scoredIdentities.map((item) => ({
      identity: item.identity,
      archetype: item.archetype,
      profile: item.profile,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      identity: item.identity,
      score: item.score,
      archetype: item.archetype,
    })),
  };
}

/**
 * 古代身份主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildAncientDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的古代身份",
    scoreLabel: "身份匹配度",
    main: deepResult.mainIdentity,
    highlightCard: {
      title: "身份判词",
      content: deepResult.identitySeal,
    },
    insight: deepResult.insight,
    topThreeTitle: "身份 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "成长建议", items: deepResult.growthActions },
      { title: "避坑信号", items: deepResult.avoidSignals },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 古代身份主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildAncientLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的古代身份",
    scoreLabel: "身份匹配度",
    main: {
      name: localResult.topIdentity.identity,
      score: localResult.topIdentity.score,
    },
    highlightCard: {
      title: "身份判词",
      content: "心有定盘星，行事自成章。",
    },
    insight: localResult.localNarrative,
    topThreeTitle: "身份 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.identity,
      score: item.score,
    })),
    detailSections: [
      {
        title: "成长建议",
        items: [
          "先稳定核心节奏，再扩展战线。",
          "每周复盘一次关键决策，减少重复失误。",
          "把一项优势能力打磨到可复制。",
        ],
      },
      {
        title: "避坑信号",
        items: ["临场决策反复", "关键任务推进中断"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 隐藏天赋主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, preferenceVector: object, talentCandidates: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildTalentDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    talentCandidates: localResult.scoredTalents.map((item) => ({
      talent: item.talent,
      trait: item.trait,
      profile: item.profile,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      talent: item.talent,
      score: item.score,
      trait: item.trait,
    })),
  };
}

/**
 * 隐藏天赋主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildTalentDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的隐藏天赋",
    scoreLabel: "天赋匹配度",
    main: deepResult.mainTalent,
    highlightCard: {
      title: "天赋定义",
      content: deepResult.talentDefinition,
    },
    insight: deepResult.insight,
    topThreeTitle: "天赋 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "解锁动作", items: deepResult.unlockActions },
      { title: "盲点提醒", items: deepResult.blindSpots },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 隐藏天赋主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildTalentLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的隐藏天赋",
    scoreLabel: "天赋匹配度",
    main: {
      name: localResult.topTalent.talent,
      score: localResult.topTalent.score,
    },
    highlightCard: {
      title: "天赋定义",
      content: "你更擅长把直觉、结构和行动连接成完整的解题路径。",
    },
    insight: localResult.localNarrative,
    topThreeTitle: "天赋 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.talent,
      score: item.score,
    })),
    detailSections: [
      {
        title: "解锁动作",
        items: [
          "把一个直觉判断写成可执行小实验，并在当天启动。",
          "每周复盘一次“最有效动作”，持续强化天赋通路。",
          "把你的判断过程讲给他人，提升天赋可见度。",
        ],
      },
      {
        title: "盲点提醒",
        items: ["灵感多但收口不足", "执行节奏被外部噪声打断"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 统一主题配置列表。
 * 新增测试时只需：
 * 1. 加题库和分析器
 * 2. 新增一个配置对象
 * 不再需要复制页面组件与入口文件。
 * survey 字段约定：
 * 1. questions：完整题库。
 * 2. questionSelection：抽题数量区间（每轮随机抽题）。
 * 3. runLocalAnalysis(selectedQuestions, answerIds)：本地分析方法。
 */
export const SURVEY_THEME_CONFIGS = [
  {
    key: "city",
    routePaths: ["/", "/index.html", "/city", "/city.html"],
    pageMeta: {
      title: "城市匹配问卷",
      description: "通过生活习惯答卷，匹配最适合长期居住的城市。",
    },
    theme: {
      className: "theme-city",
      badge: "CITY MATCH",
      title: "通过生活习惯，推断最适合你的居住城市",
      description:
        "回答日常问题，先做结构化匹配，再生成更完整的城市建议。",
      progressColor: "linear-gradient(90deg, #0f8a63, #43b78b)",
      progressTrackColor: "rgba(40, 95, 75, 0.13)",
      checkedColor: "#0f8a63",
      sourceTag: {
        deep: {
          label: "深度匹配结果",
          color: "#e8f7f0",
          textColor: "#1b6a50",
        },
        local: {
          label: "本地规则兜底结果",
          color: "#fff3e3",
          textColor: "#9c5d00",
        },
      },
      loadingMessages: [
        "正在汇总你的生活偏好...",
        "正在比对候选城市画像...",
        "正在生成你的居住建议...",
      ],
      submitButtonText: "汇总并开始匹配",
      nextButtonText: "下一步",
    },
    survey: {
      questions: QUESTION_BANK,
      questionSelection: { minCount: 8, maxCount: 15 },
      runLocalAnalysis: (selectedQuestions, answerIds) =>
        analyzeCitiesLocally({
          questions: selectedQuestions,
          answerIds,
          cities: CITY_PROFILES,
        }),
      buildDeepPayload: buildCityDeepPayload,
      runDeepAnalysis: (payload) =>
        analyzeCityWithAI(payload, { timeoutMs: 18000 }),
      buildDeepUnifiedResult: buildCityDeepUnifiedResult,
      buildLocalUnifiedResult: buildCityLocalUnifiedResult,
      deepFailToast: "深度匹配暂不可用，已切换本地规则结果",
    },
  },
  {
    key: "fortune",
    routePaths: ["/fortune", "/fortune.html", "/fortune-2026", "/fortune-2026.html"],
    pageMeta: {
      title: "测你 2026 年的转运关键词",
      description: "通过日常生活场景答卷，生成你的 2026 关键词提示。",
    },
    theme: {
      className: "theme-fortune",
      badge: "FORTUNE · 2026",
      title: "测你 2026 年的转运关键词",
      description: "通过日常选择识别年度势能结构，生成关键词与行动建议。",
      progressColor: "linear-gradient(90deg, #ff7a3d, #f7b955)",
      progressTrackColor: "rgba(163, 88, 43, 0.15)",
      checkedColor: "#ff7a3d",
      sourceTag: {
        deep: {
          label: "深度解读结果",
          color: "#fff1e7",
          textColor: "#a14f1f",
        },
        local: {
          label: "基础解析结果",
          color: "#fff5de",
          textColor: "#9c6500",
        },
      },
      loadingMessages: [
        "正在测试你的年度势能...",
        "正在校准你的关键词轨迹...",
        "正在匹配你的转运主轴...",
        "正在生成你的 2026 提示...",
      ],
      submitButtonText: "开始 2026 关键词解析",
      nextButtonText: "下一题",
    },
    survey: {
      questions: FORTUNE_2026_QUESTION_BANK,
      questionSelection: { minCount: 8, maxCount: 15 },
      runLocalAnalysis: (selectedQuestions, answerIds) =>
        analyzeFortune2026Locally({
          questions: selectedQuestions,
          answerIds,
        }),
      buildDeepPayload: buildFortuneDeepPayload,
      runDeepAnalysis: (payload) =>
        analyzeFortune2026WithAI(payload, { timeoutMs: 18000 }),
      buildDeepUnifiedResult: buildFortuneDeepUnifiedResult,
      buildLocalUnifiedResult: buildFortuneLocalUnifiedResult,
      deepFailToast: "深度解读暂不可用，已切换基础解析",
    },
  },
  {
    key: "ancient",
    routePaths: ["/ancient", "/ancient-identity", "/ancient-identity.html"],
    pageMeta: {
      title: "测测你在古代会是什么身份",
      description: "通过处事习惯与决策偏好，匹配你的古代身份原型。",
    },
    theme: {
      className: "theme-ancient",
      badge: "ANCIENT IDENTITY",
      title: "测测你在古代会是什么身份",
      description: "通过处事方式与决策习惯，匹配你的古代身份原型并生成判词。",
      progressColor: "linear-gradient(90deg, #8f6138, #c8a071)",
      progressTrackColor: "rgba(92, 66, 42, 0.16)",
      checkedColor: "#8f6138",
      sourceTag: {
        deep: {
          label: "深度判定结果",
          color: "#f4e8d8",
          textColor: "#6d482a",
        },
        local: {
          label: "基础判定结果",
          color: "#f7efdf",
          textColor: "#7e5a3b",
        },
      },
      loadingMessages: [
        "正在翻阅命格卷轴...",
        "正在推演你的朝代轨迹...",
        "正在匹配你的仕途坐标...",
        "正在落笔身份判词...",
      ],
      submitButtonText: "开始身份判定",
      nextButtonText: "下一题",
    },
    survey: {
      questions: ANCIENT_IDENTITY_QUESTION_BANK,
      questionSelection: { minCount: 8, maxCount: 15 },
      runLocalAnalysis: (selectedQuestions, answerIds) =>
        analyzeAncientIdentityLocally({
          questions: selectedQuestions,
          answerIds,
        }),
      buildDeepPayload: buildAncientDeepPayload,
      runDeepAnalysis: (payload) =>
        analyzeAncientIdentityWithDeepInsight(payload, { timeoutMs: 18000 }),
      buildDeepUnifiedResult: buildAncientDeepUnifiedResult,
      buildLocalUnifiedResult: buildAncientLocalUnifiedResult,
      deepFailToast: "深度判定暂不可用，已切换基础判定",
    },
  },
  {
    key: "talent",
    routePaths: ["/talent", "/hidden-talent", "/hidden-talent.html"],
    pageMeta: {
      title: "凭直觉选看你隐藏的天赋是什么",
      description: "通过直觉式选择，生成你的隐藏天赋原型和行动建议。",
    },
    theme: {
      className: "theme-talent",
      badge: "INTUITION TALENT",
      title: "凭直觉选看你隐藏的天赋是什么",
      description: "通过日常反应与选择偏好，生成你的核心天赋原型与盲点提醒。",
      progressColor: "linear-gradient(90deg, #0c9894, #f4a43d)",
      progressTrackColor: "rgba(24, 103, 110, 0.14)",
      checkedColor: "#0c9894",
      sourceTag: {
        deep: {
          label: "深度生成结果",
          color: "#eafcfb",
          textColor: "#166867",
        },
        local: {
          label: "基础生成结果",
          color: "#fff7e8",
          textColor: "#9f6b16",
        },
      },
      loadingMessages: [
        "正在捕捉你的直觉信号...",
        "正在拼接你的天赋轨迹...",
        "正在匹配你的隐藏能力图谱...",
        "正在生成你的天赋关键词...",
      ],
      submitButtonText: "开始天赋生成",
      nextButtonText: "下一题",
    },
    survey: {
      questions: HIDDEN_TALENT_QUESTION_BANK,
      questionSelection: { minCount: 8, maxCount: 15 },
      runLocalAnalysis: (selectedQuestions, answerIds) =>
        analyzeHiddenTalentLocally({
          questions: selectedQuestions,
          answerIds,
        }),
      buildDeepPayload: buildTalentDeepPayload,
      runDeepAnalysis: (payload) =>
        analyzeHiddenTalentWithDeepInsight(payload, { timeoutMs: 18000 }),
      buildDeepUnifiedResult: buildTalentDeepUnifiedResult,
      buildLocalUnifiedResult: buildTalentLocalUnifiedResult,
      deepFailToast: "深度生成暂不可用，已切换基础生成",
    },
  },
];

/**
 * 规范化路径：
 * 1. 统一小写。
 * 2. 去除尾部斜杠（根路径除外）。
 * @param {string} path 浏览器路径。
 * @returns {string} 规范化结果。
 */
function normalizePath(path) {
  if (!path || path === "/") {
    return "/";
  }

  const lowerCasePath = String(path).toLowerCase();
  return lowerCasePath.endsWith("/")
    ? lowerCasePath.slice(0, -1) || "/"
    : lowerCasePath;
}

/**
 * 路径到主题配置映射：
 * 复杂度评估：
 * 1. 初始化映射：O(T * P)，T 为主题数量，P 为每个主题的路径别名数量。
 * 2. 运行时查找：O(1)。
 */
const PATH_THEME_MAP = SURVEY_THEME_CONFIGS.reduce((accumulator, config) => {
  config.routePaths.forEach((pathItem) => {
    accumulator.set(normalizePath(pathItem), config);
  });
  return accumulator;
}, new Map());

/**
 * 默认主题配置（城市测试）。
 */
export const DEFAULT_SURVEY_THEME =
  SURVEY_THEME_CONFIGS.find((item) => item.key === "city") ??
  SURVEY_THEME_CONFIGS[0];

/**
 * 根据路径解析主题配置。
 * @param {string} path 浏览器路径。
 * @returns {object} 主题配置对象。
 */
export function resolveSurveyThemeByPath(path) {
  const normalizedPath = normalizePath(path);
  return PATH_THEME_MAP.get(normalizedPath) ?? DEFAULT_SURVEY_THEME;
}
