import { QUESTION_BANK } from "../data/questionBank";
import { CITY_PROFILES } from "../data/cityProfiles";
import { FORTUNE_2026_QUESTION_BANK } from "../data/fortune2026QuestionBank";
import { ANCIENT_IDENTITY_QUESTION_BANK } from "../data/ancientIdentityQuestionBank";
import { HIDDEN_TALENT_QUESTION_BANK } from "../data/hiddenTalentQuestionBank";
import { BENEFACTOR_2026_QUESTION_BANK } from "../data/benefactor2026QuestionBank";
import { COLOR_2026_QUESTION_BANK } from "../data/color2026QuestionBank";
import { LOVE_ATTACHMENT_QUESTION_BANK } from "../data/loveAttachmentQuestionBank";
import { analyzeCitiesLocally } from "../services/localAnalyzer";
import { analyzeCityWithAI } from "../services/aiAnalyzer";
import { analyzeFortune2026Locally } from "../services/fortune2026Analyzer";
import { analyzeFortune2026WithAI } from "../services/fortune2026AiAnalyzer";
import { analyzeAncientIdentityLocally } from "../services/ancientIdentityAnalyzer";
import { analyzeAncientIdentityWithDeepInsight } from "../services/ancientIdentityAiAnalyzer";
import { analyzeHiddenTalentLocally } from "../services/hiddenTalentAnalyzer";
import { analyzeHiddenTalentWithDeepInsight } from "../services/hiddenTalentAiAnalyzer";
import { analyzeBenefactor2026Locally } from "../services/benefactor2026Analyzer";
import { analyzeBenefactor2026WithAI } from "../services/benefactor2026AiAnalyzer";
import { analyzeColor2026Locally } from "../services/color2026Analyzer";
import { analyzeColor2026WithAI } from "../services/color2026AiAnalyzer";
import {
  analyzeLoveAttachmentLocally,
  deriveAttachmentSubtypeProfile,
} from "../services/loveAttachmentAnalyzer";
import { analyzeLoveAttachmentWithAI } from "../services/loveAttachmentAiAnalyzer";

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
  tagChips: [],
  distributionChart: { title: "", items: [] },
  typeCard: { title: "", items: [] },
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
 * @param {{ title: string, items: Array<{ label: string, value: string }> }} [payload.typeCard] 类型学卡片。
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
 * 贵人星座主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, preferenceVector: object, signCandidates: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildBenefactorDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    signCandidates: localResult.scoredSigns.map((item) => ({
      sign: item.sign,
      code: item.code,
      supportStyle: item.supportStyle,
      profile: item.profile,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      sign: item.sign,
      score: item.score,
      supportStyle: item.supportStyle,
    })),
  };
}

/**
 * 贵人星座主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildBenefactorDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你在 2026 的贵人星座",
    scoreLabel: "星座契合度",
    main: deepResult.mainSign,
    highlightCard: {
      title: "贵人信号",
      content: deepResult.guardianSignal,
    },
    insight: deepResult.insight,
    topThreeTitle: "贵人星座 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "机会动作", items: deepResult.keyOpportunities },
      { title: "避坑提醒", items: deepResult.avoidSignals },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 贵人星座主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildBenefactorLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "你在 2026 的贵人星座",
    scoreLabel: "星座契合度",
    main: {
      name: localResult.topSign.sign,
      score: localResult.topSign.score,
    },
    highlightCard: {
      title: "贵人信号",
      content: localResult.topSign.supportStyle,
    },
    insight: localResult.localNarrative,
    topThreeTitle: "贵人星座 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.sign,
      score: item.score,
    })),
    detailSections: [
      {
        title: "机会动作",
        items: [
          "把你当前最重要的一件事公开表达，主动释放协作信号。",
          "优先维护 2-3 位能互补你短板的关键联系人。",
          "遇到卡点时，不只问“怎么做”，也问“和谁一起做”。",
        ],
      },
      {
        title: "避坑提醒",
        items: ["闭门单打独斗太久", "情绪上头后切断沟通链路"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 2026 主题色运行时调色板：
 * 关键逻辑：全部为“降饱和适配值”，避免黑/红等高冲击颜色直接铺满页面造成可读性问题。
 */
const COLOR_2026_RUNTIME_PALETTE = {
  black: {
    key: "black",
    name: "曜石黑",
    accent: "#454B58",
    accentSoft: "#8B94A6",
    bgStart: "#F2F4F8",
    bgMid: "#EAEFF5",
    bgEnd: "#F8F9FC",
    textMain: "#2A2F3A",
    textMuted: "#646D7C",
    surface: "#FFFFFF",
    surfaceBorder: "#D7DEE9",
    optionBorder: "#D0D8E4",
    optionSelectedBorder: "#8E99AB",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#EEF2F7",
    highlightBorder: "#D5DCE7",
    highlightBgStart: "#F7F9FC",
    highlightBgEnd: "#EEF2F8",
    auraLeft: "#A7B1C0",
    auraRight: "#CDD4DF",
  },
  blue: {
    key: "blue",
    name: "深海蓝",
    accent: "#4B6DD9",
    accentSoft: "#8CA4F2",
    bgStart: "#EFF3FF",
    bgMid: "#E8F0FF",
    bgEnd: "#F5F8FF",
    textMain: "#27335C",
    textMuted: "#5E6C97",
    surface: "#FFFFFF",
    surfaceBorder: "#D7E0FF",
    optionBorder: "#D3DCFA",
    optionSelectedBorder: "#8EA4EC",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#EEF3FF",
    highlightBorder: "#D6E0FF",
    highlightBgStart: "#F5F8FF",
    highlightBgEnd: "#EDF2FF",
    auraLeft: "#A9BEFF",
    auraRight: "#C7D4FF",
  },
  red: {
    key: "red",
    name: "赤焰红",
    accent: "#D26072",
    accentSoft: "#E8A0AB",
    bgStart: "#FFF1F4",
    bgMid: "#FFE9EE",
    bgEnd: "#FFF6F8",
    textMain: "#4E2A35",
    textMuted: "#855E69",
    surface: "#FFFFFF",
    surfaceBorder: "#F6D7DF",
    optionBorder: "#F2D1DA",
    optionSelectedBorder: "#E099A7",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#FFF0F3",
    highlightBorder: "#F1CED8",
    highlightBgStart: "#FFF7F9",
    highlightBgEnd: "#FFEFF3",
    auraLeft: "#F0B3BF",
    auraRight: "#FFD1D8",
  },
  green: {
    key: "green",
    name: "松柏绿",
    accent: "#4D9A78",
    accentSoft: "#8ECBAF",
    bgStart: "#EEF9F3",
    bgMid: "#E7F5EE",
    bgEnd: "#F6FCF9",
    textMain: "#274537",
    textMuted: "#5D7F71",
    surface: "#FFFFFF",
    surfaceBorder: "#D3EDDF",
    optionBorder: "#CEE7DA",
    optionSelectedBorder: "#8FC5AD",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#ECF8F2",
    highlightBorder: "#CEE8DA",
    highlightBgStart: "#F5FCF8",
    highlightBgEnd: "#ECF7F1",
    auraLeft: "#A8DCC4",
    auraRight: "#CBECDD",
  },
  yellow: {
    key: "yellow",
    name: "日光黄",
    accent: "#C79A38",
    accentSoft: "#E0C17E",
    bgStart: "#FFF8EB",
    bgMid: "#FFF3DF",
    bgEnd: "#FFFBEF",
    textMain: "#4E3D1E",
    textMuted: "#7C6841",
    surface: "#FFFFFF",
    surfaceBorder: "#F0E1BC",
    optionBorder: "#EEDDB2",
    optionSelectedBorder: "#DBBE79",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#FFF6E5",
    highlightBorder: "#EDDDAF",
    highlightBgStart: "#FFFCEE",
    highlightBgEnd: "#FFF4DF",
    auraLeft: "#F1DAA0",
    auraRight: "#FFE9B8",
  },
  purple: {
    key: "purple",
    name: "雾霭紫",
    accent: "#7A65BE",
    accentSoft: "#AA98DE",
    bgStart: "#F4F0FF",
    bgMid: "#EEE8FF",
    bgEnd: "#F9F6FF",
    textMain: "#3B2F62",
    textMuted: "#6C6090",
    surface: "#FFFFFF",
    surfaceBorder: "#E1D9F8",
    optionBorder: "#DCD2F4",
    optionSelectedBorder: "#A999D8",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#F1ECFF",
    highlightBorder: "#DDD2F5",
    highlightBgStart: "#F8F4FF",
    highlightBgEnd: "#F0E9FF",
    auraLeft: "#C8BAEC",
    auraRight: "#E1D7FA",
  },
  orange: {
    key: "orange",
    name: "珊瑚橙",
    accent: "#D07A4C",
    accentSoft: "#E5A782",
    bgStart: "#FFF4EC",
    bgMid: "#FFEDE1",
    bgEnd: "#FFF8F1",
    textMain: "#543425",
    textMuted: "#886350",
    surface: "#FFFFFF",
    surfaceBorder: "#F4DDCE",
    optionBorder: "#F0D7C7",
    optionSelectedBorder: "#E3AF8F",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#FFF2E8",
    highlightBorder: "#EFD7C6",
    highlightBgStart: "#FFF9F3",
    highlightBgEnd: "#FFEFE3",
    auraLeft: "#F0BF9F",
    auraRight: "#FFD9C1",
  },
  white: {
    key: "white",
    name: "云朵白",
    accent: "#8A94A8",
    accentSoft: "#B8C0D1",
    bgStart: "#FAFBFD",
    bgMid: "#F4F6FA",
    bgEnd: "#FFFFFF",
    textMain: "#2D3442",
    textMuted: "#697285",
    surface: "#FFFFFF",
    surfaceBorder: "#E0E5EF",
    optionBorder: "#DAE0EA",
    optionSelectedBorder: "#AAB3C5",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#F4F7FC",
    highlightBorder: "#DDE3EE",
    highlightBgStart: "#FBFCFF",
    highlightBgEnd: "#F4F7FC",
    auraLeft: "#D6DDE8",
    auraRight: "#EAEFF7",
  },
};

/**
 * 主题色主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, colorCandidates: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildColorThemeDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    colorCandidates: localResult.scoredColors.map((item) => ({
      key: item.key,
      name: item.name,
      hex: item.hex,
      vibe: item.vibe,
      lifeHint: item.lifeHint,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      key: item.key,
      name: item.name,
      score: item.score,
      hex: item.hex,
    })),
  };
}

/**
 * 主题色主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildColorThemeDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的 2026 主题色",
    scoreLabel: "主题色匹配度",
    main: deepResult.mainColor,
    highlightCard: {
      title: "颜色气质",
      content: deepResult.dailyMood,
    },
    insight: deepResult.insight,
    typeCard: {
      title: "我的主题色卡",
      items: deepResult.topThree.map((item, index) => ({
        label: index === 0 ? "主色" : index === 1 ? "辅助色" : "点缀色",
        value: item.name,
      })),
    },
    topThreeTitle: "主题色 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "日常建议", items: deepResult.keyActions },
      { title: "避坑提醒", items: deepResult.avoidSignals },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
    runtimeColorKey: deepResult.mainColor?.key ?? localResult.topColor.key,
  });
}

/**
 * 主题色主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildColorThemeLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的 2026 主题色",
    scoreLabel: "主题色匹配度",
    main: {
      name: localResult.topColor.name,
      score: localResult.topColor.score,
    },
    highlightCard: {
      title: "颜色气质",
      content: `${localResult.topColor.vibe}。${localResult.topColor.lifeHint}`,
    },
    insight: localResult.localNarrative,
    typeCard: {
      title: "我的主题色卡",
      items: localResult.topThree.map((item, index) => ({
        label: index === 0 ? "主色" : index === 1 ? "辅助色" : "点缀色",
        value: item.name,
      })),
    },
    topThreeTitle: "主题色 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
    })),
    detailSections: [
      {
        title: "日常建议",
        items: [
          "把主色用于壁纸、待办封面或常用物品，强化目标感。",
          "每周围绕一个核心任务推进，减少频繁切换。",
          "用你最舒服的节奏安排生活，让状态长期在线。",
        ],
      },
      {
        title: "避坑提醒",
        items: ["短期冲动后连续摆烂", "目标过多导致执行分散"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
    runtimeColorKey: localResult.topColor.key,
  });
}

/**
 * 恋爱主题：清洗标签展示文本。
 * @param {unknown} tag 标签输入。
 * @returns {string} 去除 # 后的标签文本。
 */
function sanitizeLoveTagLabel(tag) {
  return String(tag ?? "")
    .replace(/^#/, "")
    .trim();
}

/**
 * 恋爱主题：合并并去重标签（不保留 #）。
 * @param {Array<unknown>} tags 标签列表。
 * @returns {Array<string>} 清洗后的标签列表。
 */
function normalizeLoveTagChips(tags) {
  const normalizedList = tags
    .map(sanitizeLoveTagLabel)
    .filter(Boolean);

  return [...new Set(normalizedList)].slice(0, 8);
}

/**
 * 恋爱心理主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ typeCandidates: Array<object>, localDistribution: Array<object>, localMainType: object, localSubtypeProfile: object, summaryLines: Array<string> }} 深度分析负载。
 */
function buildLoveAttachmentDeepPayload(localResult) {
  const profileMap = localResult.profileMap ?? {};
  const typeCandidates = Object.values(profileMap).map((profileItem) => ({
    key: profileItem.key,
    name: profileItem.name,
    summary: profileItem.summary,
    tags: profileItem.tags,
    familyPortrait: profileItem.familyPortrait,
    whyPattern: profileItem.whyPattern,
    familyPortraitPoints: profileItem.familyPortraitPoints,
    whyPatternPoints: profileItem.whyPatternPoints,
    strengths: profileItem.strengths,
    risks: profileItem.risks,
    actions: profileItem.actions,
  }));

  return {
    typeCandidates,
    localDistribution: localResult.distribution,
    localMainType: localResult.topType,
    localSubtypeProfile: localResult.subtypeProfile,
    summaryLines: localResult.summaryLines,
  };
}

/**
 * 恋爱心理主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildLoveAttachmentDeepUnifiedResult(deepResult, localResult) {
  const sortedDistribution = [...(deepResult.distribution ?? [])].sort(
    (leftItem, rightItem) => rightItem.score - leftItem.score,
  );

  const fallbackMainType = sortedDistribution[0] ?? localResult.topType;
  const mainType = deepResult.mainType ?? fallbackMainType;
  const subtypeProfile = deriveAttachmentSubtypeProfile(
    sortedDistribution.length > 0 ? sortedDistribution : localResult.distribution,
  );

  // 关键逻辑：优先使用 AI 返回的结构化要点，缺失时再回退到单段文本，保证展示密度与兼容性。
  const familyPortraitItems =
    Array.isArray(deepResult.familyPortraitPoints) &&
    deepResult.familyPortraitPoints.length > 0
      ? deepResult.familyPortraitPoints
      : deepResult.familyPortrait
        ? [deepResult.familyPortrait]
        : ["暂无"];

  // 关键逻辑：保持“机制解释”模块与“画像模块”同样的多条目策略，避免结果过于简短。
  const whyPatternItems =
    Array.isArray(deepResult.whyPatternPoints) && deepResult.whyPatternPoints.length > 0
      ? deepResult.whyPatternPoints
      : deepResult.whyPattern
        ? [deepResult.whyPattern]
        : ["暂无"];

  // 关键逻辑：把细分亚型标签并入标签区，增强可读性和结果辨识度。
  const mergedTagChips = normalizeLoveTagChips([
    subtypeProfile.subtypeTag,
    ...(deepResult.tags ?? []),
  ]);

  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的恋爱心理画像",
    scoreLabel: "主类型匹配度",
    main: {
      name: subtypeProfile.signature,
      score: mainType.score,
    },
    highlightCard: {
      title: "一句话概述",
      content: deepResult.oneLineSummary,
    },
    insight: `${subtypeProfile.subtypeBrief} ${deepResult.insight}`.trim(),
    tagChips: mergedTagChips,
    distributionChart: {
      title: "类型分布",
      items: sortedDistribution.map((item) => ({
        key: item.key,
        name: item.name,
        score: item.score,
        color: item.color,
      })),
    },
    typeCard: {
      title: "恋爱心理卡片",
      items: [
        { label: "核心类型", value: subtypeProfile.coreTypeName },
        { label: "细分亚型", value: subtypeProfile.subtypeName },
        { label: "次类型", value: subtypeProfile.secondaryTypeName },
        {
          label: "倾向强度",
          value: `${subtypeProfile.intensityLabel}（主次差值 ${subtypeProfile.tendencyGap}%）`,
        },
      ],
    },
    topThreeTitle: "Top 3 类型倾向",
    topThree: sortedDistribution.slice(0, 3).map((item) => ({
      name: item.name,
      score: item.score,
    })),
    detailSections: [
      {
        title: "细分亚型说明",
        items: [
          `${subtypeProfile.subtypeName}：${subtypeProfile.subtypeBrief}`,
          `你的次类型为${subtypeProfile.secondaryTypeName}，说明在部分关系场景会出现复合倾向。`,
        ],
      },
      { title: "原生家庭画像", items: familyPortraitItems },
      { title: "为什么会这样", items: whyPatternItems },
      { title: "你的关系优势", items: deepResult.strengths },
      { title: "高风险触发点", items: deepResult.risks },
      { title: "关系升级建议", items: deepResult.actions },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 恋爱心理主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildLoveAttachmentLocalUnifiedResult(localResult) {
  const topType = localResult.topType;
  const topTypeProfile = localResult.profileMap[topType.key] ?? {};
  const secondaryType = localResult.distribution[1] ?? null;
  const subtypeProfile =
    localResult.subtypeProfile ??
    deriveAttachmentSubtypeProfile(localResult.distribution);

  // 关键逻辑：本地兜底也保持多条目展示，避免在 AI 不可用时信息密度明显下降。
  const familyPortraitItems =
    Array.isArray(topTypeProfile.familyPortraitPoints) &&
    topTypeProfile.familyPortraitPoints.length > 0
      ? topTypeProfile.familyPortraitPoints
      : topTypeProfile.familyPortrait
        ? [topTypeProfile.familyPortrait]
        : ["暂无"];

  // 关键逻辑：机制说明模块使用与画像模块一致的兜底策略，保证展示结构稳定。
  const whyPatternItems =
    Array.isArray(topTypeProfile.whyPatternPoints) &&
    topTypeProfile.whyPatternPoints.length > 0
      ? topTypeProfile.whyPatternPoints
      : topTypeProfile.whyPattern
        ? [topTypeProfile.whyPattern]
        : ["暂无"];

  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的恋爱心理画像",
    scoreLabel: "主类型匹配度",
    main: {
      name: subtypeProfile.signature,
      score: topType.score,
    },
    highlightCard: {
      title: "一句话概述",
      content: topTypeProfile.summary ?? localResult.localNarrative,
    },
    insight: `${subtypeProfile.subtypeBrief} ${localResult.localNarrative}`.trim(),
    tagChips: normalizeLoveTagChips([
      subtypeProfile.subtypeTag,
      ...(topTypeProfile.tags ?? []),
    ]),
    distributionChart: {
      title: "类型分布",
      items: localResult.distribution.map((item) => ({
        key: item.key,
        name: item.name,
        score: item.score,
        color: item.color,
      })),
    },
    typeCard: {
      title: "恋爱心理卡片",
      items: [
        { label: "核心类型", value: subtypeProfile.coreTypeName },
        { label: "细分亚型", value: subtypeProfile.subtypeName },
        { label: "次类型", value: secondaryType?.name ?? subtypeProfile.secondaryTypeName ?? "暂无" },
        {
          label: "倾向强度",
          value: `${subtypeProfile.intensityLabel}（主次差值 ${subtypeProfile.tendencyGap}%）`,
        },
      ],
    },
    topThreeTitle: "Top 3 类型倾向",
    topThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
    })),
    detailSections: [
      {
        title: "细分亚型说明",
        items: [
          `${subtypeProfile.subtypeName}：${subtypeProfile.subtypeBrief}`,
          `你的次类型为${subtypeProfile.secondaryTypeName}，在高压场景可能会放大该倾向。`,
        ],
      },
      { title: "原生家庭画像", items: familyPortraitItems },
      { title: "为什么会这样", items: whyPatternItems },
      { title: "你的关系优势", items: topTypeProfile.strengths ?? [] },
      { title: "高风险触发点", items: topTypeProfile.risks ?? [] },
      { title: "关系升级建议", items: topTypeProfile.actions ?? [] },
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
 *    可选字段：ensureDimensionCoverage + dimensionKey，用于按维度覆盖抽题。
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
      questionSelection: { minCount: 10, maxCount: 15 },
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
      questionSelection: { minCount: 10, maxCount: 15 },
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
      questionSelection: { minCount: 10, maxCount: 15 },
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
      questionSelection: { minCount: 10, maxCount: 15 },
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
  {
    key: "benefactor",
    routePaths: [
      "/benefactor",
      "/benefactor.html",
      "/helper-star",
      "/helper",
    ],
    pageMeta: {
      title: "测试2026你的贵人星座",
      description: "通过日常选择匹配你在 2026 年最容易遇到的贵人星座类型。",
    },
    theme: {
      className: "theme-benefactor",
      badge: "BENEFACTOR STAR",
      title: "测试2026你的贵人星座",
      description: "从日常反应里匹配最契合你的贵人星座，并给出可执行的协作提示。",
      progressColor: "linear-gradient(90deg, #5a6bff, #ff8aa0)",
      progressTrackColor: "rgba(75, 87, 149, 0.2)",
      checkedColor: "#5a6bff",
      sourceTag: {
        deep: {
          label: "深度匹配结果",
          color: "#edf0ff",
          textColor: "#3f4ca8",
        },
        local: {
          label: "基础匹配结果",
          color: "#fff0f4",
          textColor: "#a44b66",
        },
      },
      loadingMessages: [
        "正在捕捉你的贵人频率...",
        "正在比对 12 星座支持画像...",
        "正在匹配你的贵人协作轨迹...",
        "正在生成你的 2026 贵人提示...",
      ],
      submitButtonText: "开始贵人星座匹配",
      nextButtonText: "下一题",
    },
    survey: {
      questions: BENEFACTOR_2026_QUESTION_BANK,
      questionSelection: { minCount: 10, maxCount: 15 },
      runLocalAnalysis: (selectedQuestions, answerIds) =>
        analyzeBenefactor2026Locally({
          questions: selectedQuestions,
          answerIds,
        }),
      buildDeepPayload: buildBenefactorDeepPayload,
      runDeepAnalysis: (payload) =>
        analyzeBenefactor2026WithAI(payload, { timeoutMs: 18000 }),
      buildDeepUnifiedResult: buildBenefactorDeepUnifiedResult,
      buildLocalUnifiedResult: buildBenefactorLocalUnifiedResult,
      deepFailToast: "深度匹配暂不可用，已切换基础匹配",
    },
  },
  {
    key: "color-2026",
    routePaths: ["/color", "/color2026", "/color-2026", "/theme-color"],
    pageMeta: {
      title: "测试2026年你的主题色",
      description: "通过日常偏好匹配你的 2026 主题色，并给出生活化建议。",
    },
    theme: {
      className: "theme-color-2026",
      badge: "COLOR MOOD · 2026",
      title: "测试2026年你的主题色",
      description:
        "从日常选择中识别你的年度主色调，作答中页面会逐步靠近你的主题色。",
      progressColor: "linear-gradient(90deg, #6a78df, #f090a5)",
      progressTrackColor: "rgba(105, 114, 164, 0.2)",
      checkedColor: "#6a78df",
      sourceTag: {
        deep: {
          label: "深度配色结果",
          color: "#edf1ff",
          textColor: "#3f50aa",
        },
        local: {
          label: "基础配色结果",
          color: "#fff0f5",
          textColor: "#9f4f69",
        },
      },
      loadingMessages: [
        "正在提取你的配色偏好...",
        "正在比对 2026 主题色画像...",
        "正在生成你的年度色卡...",
        "正在整理你的日常色彩建议...",
      ],
      submitButtonText: "生成我的2026主题色",
      nextButtonText: "下一题",
      runtimeDefaultKey: "blue",
      runtimePalette: COLOR_2026_RUNTIME_PALETTE,
    },
    survey: {
      questions: COLOR_2026_QUESTION_BANK,
      questionSelection: { minCount: 10, maxCount: 15 },
      runLocalAnalysis: (selectedQuestions, answerIds) =>
        analyzeColor2026Locally({
          questions: selectedQuestions,
          answerIds,
        }),
      buildDeepPayload: buildColorThemeDeepPayload,
      runDeepAnalysis: (payload) =>
        analyzeColor2026WithAI(payload, { timeoutMs: 18000 }),
      buildDeepUnifiedResult: buildColorThemeDeepUnifiedResult,
      buildLocalUnifiedResult: buildColorThemeLocalUnifiedResult,
      deepFailToast: "深度配色暂不可用，已切换基础配色结果",
    },
  },
  {
    key: "love-attachment",
    routePaths: ["/love", "/love-attachment", "/love-psych", "/love-test"],
    pageMeta: {
      title: "恋爱心理测试",
      description:
        "通过日常关系场景识别你的依恋模式，输出类型分布、家庭画像与关系建议。",
    },
    theme: {
      className: "theme-love-attachment",
      badge: "LOVE PSYCHOLOGY",
      title: "恋爱心理测试",
      description:
        "50题题库中每轮随机抽取15题，识别你的依恋类型并生成深度关系画像。",
      progressColor: "linear-gradient(90deg, #f08ca8, #7ea0f4)",
      progressTrackColor: "rgba(142, 111, 157, 0.2)",
      checkedColor: "#f08ca8",
      sourceTag: {
        deep: {
          label: "AI深度分析结果",
          color: "#fff0f6",
          textColor: "#9a3c67",
        },
        local: {
          label: "本地基础结果",
          color: "#eef3ff",
          textColor: "#4458a5",
        },
      },
      loadingMessages: [
        "正在整理你的亲密互动信号...",
        "正在拟合依恋模式分布...",
        "正在生成你的关系心理画像...",
        "正在输出个性化关系建议...",
      ],
      submitButtonText: "生成我的恋爱心理报告",
      nextButtonText: "下一题",
    },
    survey: {
      questions: LOVE_ATTACHMENT_QUESTION_BANK,
      questionSelection: { minCount: 15, maxCount: 15 },
      runLocalAnalysis: (selectedQuestions, answerIds) =>
        analyzeLoveAttachmentLocally({
          questions: selectedQuestions,
          answerIds,
        }),
      buildDeepPayload: buildLoveAttachmentDeepPayload,
      runDeepAnalysis: (payload) =>
        analyzeLoveAttachmentWithAI(payload, { timeoutMs: 22000 }),
      buildDeepUnifiedResult: buildLoveAttachmentDeepUnifiedResult,
      buildLocalUnifiedResult: buildLoveAttachmentLocalUnifiedResult,
      deepFailToast: "AI结果暂不可用，已切换本地基础结果",
    },
  },
  {
    key: "mbti",
    routePaths: ["/mbti", "/mbti16", "/mbti.html"],
    pageMeta: {
      title: "类型学卡片中心",
      description:
        "12 类类型学测试中心：支持独立测试、结果卡片、本地缓存与进阶解读。",
    },
    theme: {
      className: "theme-mbti",
      badge: "TYPEOLOGY LAB",
      title: "类型学卡片中心",
      description:
        "统一管理 MBTI、九型人格、DISC 等 12 类测试，形成你的完整类型学卡片。",
      progressColor: "linear-gradient(90deg, #ef5a78, #8f8df5)",
      progressTrackColor: "rgba(76, 78, 122, 0.2)",
      checkedColor: "#ef5a78",
      sourceTag: {
        deep: {
          label: "深度解析结果",
          color: "#ffeaf0",
          textColor: "#9d2242",
        },
        local: {
          label: "基础解析结果",
          color: "#eef0ff",
          textColor: "#3d3f7b",
        },
      },
      loadingMessages: [
        "正在校准你的四维度偏好...",
        "正在比对 16 型人格画像...",
        "正在生成你的类型学卡片...",
        "正在整理你的人格建议...",
      ],
      submitButtonText: "生成类型学卡片",
      nextButtonText: "下一题",
    },
    /**
     * 关键逻辑：
     * `mbti` 主题由独立组件 `TypeologyLab.vue` 渲染，
     * 不走通用 SurveyEngine 的 survey 配置流程。
     */
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
