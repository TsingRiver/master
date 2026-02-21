import {
  MBTI_PRO_120_QUESTION_BANK,
  MBTI_QUICK_32_QUESTION_BANK,
} from "./mbtiQuestionBank";
import {
  ENNEAGRAM_PRO_120_QUESTION_BANK,
  ENNEAGRAM_QUICK_36_QUESTION_BANK,
} from "./enneagramQuestionBank";
import { IDEAL_MATCH_CORE_64_QUESTION_BANK } from "./idealMatchQuestionBank";
import { JUNG_CLASSIC_QUESTION_BANK } from "./jungClassicQuestionBank";
import { TEMPERAMENT_CORE_60_QUESTION_BANK } from "./temperamentQuestionBank";
import { DND_ALIGNMENT_CORE_60_QUESTION_BANK } from "./dndAlignmentQuestionBank";
import { ATTACHMENT_CORE_64_QUESTION_BANK } from "./attachmentTypeQuestionBank";
import { HOLLAND_CORE_60_QUESTION_BANK } from "./hollandQuestionBank";
import { BIG_FIVE_CORE_60_QUESTION_BANK } from "./bigFiveQuestionBank";

/**
 * 类型学统一测试目录：
 * 1. 管理每个测试的题量模式、说明文案、结果标签与页面主题。
 * 2. 非 MBTI 测试题由模板生成，避免维护超大静态题库文件。
 */

/**
 * 卡片展示顺序。
 */
export const TYPEOLOGY_TEST_ORDER = [
  "mbti",
  "enneagram",
  "social-persona",
  "ideal-match",
  "jung-classic",
  "disc",
  "attitude-psy",
  "temperament",
  "big-five",
  "dnd-alignment",
  "attachment",
  "holland",
];

/**
 * 题干场景词库：
 * 关键逻辑：通过“场景 + 提示模板”组合，构建足量且不重复度较高的问题。
 */
const SCENE_LIBRARY = [
  "在新项目启动时",
  "面对紧急截止日时",
  "团队意见分歧时",
  "关系进入磨合期时",
  "朋友向你求助时",
  "独处的周末晚上",
  "需要做关键决策时",
  "计划被临时打乱时",
  "遇到陌生社交局时",
  "收到负面反馈时",
  "看到新机会出现时",
  "连续高压工作后",
  "和熟人深聊时",
  "和陌生人合作时",
  "安排长期目标时",
  "处理日常琐事时",
  "面对公开表达机会时",
  "被要求快速响应时",
  "和亲密关系争执时",
  "复盘失败经历时",
  "被质疑能力时",
  "需要说服他人时",
  "有多个任务并行时",
  "面对模糊信息时",
  "有人触碰你边界时",
  "感到焦虑时",
  "看到规则不合理时",
  "身处复杂人际网络时",
  "需要长期坚持时",
  "准备一次重要见面时",
  "资源有限但目标很高时",
  "被误解时",
  "需要带队时",
  "出现意外变化时",
  "学习新知识时",
  "整理生活节奏时",
  "消费和投资时",
  "规划关系未来时",
  "讨论价值观时",
  "面对未知风险时",
];

/**
 * 构建测试模式对象。
 * @param {string} key 模式键。
 * @param {string} label 模式标题。
 * @param {number} baseCount 基础题量。
 * @returns {{ key: string, label: string, baseCount: number }} 模式对象。
 */
function createMode(key, label, baseCount) {
  return {
    key,
    label,
    baseCount,
  };
}

/**
 * 构建测试定义对象。
 * @param {object} definition 测试定义。
 * @returns {object} 标准测试定义。
 */
function createTestDefinition(definition) {
  return {
    ...definition,
    modes: definition.modes,
    outcomeMap: new Map((definition.outcomes ?? []).map((item) => [item.key, item])),
  };
}

/**
 * 测试题目场景标签映射：
 * 关键逻辑：固定前缀不再拼进题干，改为独立标签展示，降低题干阅读长度。
 */
const TEST_QUESTION_CONTEXT_LABEL_MAP = {
  enneagram: "",
  "social-persona": "团队协作场景",
  "ideal-match": "亲密关系场景",
  "jung-classic": "问题分析场景",
  disc: "协作推进场景",
  "attitude-psy": "决策场景",
  temperament: "日常状态场景",
  "big-five": "长期行为场景",
  "dnd-alignment": "原则选择场景",
  attachment: "亲密关系场景",
  holland: "工作学习场景",
};

/**
 * 获取题目场景标签。
 * 复杂度评估：O(1)。
 * @param {string} testKey 测试键。
 * @returns {string} 场景标签。
 */
function resolveQuestionContextLabel(testKey) {
  return TEST_QUESTION_CONTEXT_LABEL_MAP[testKey] ?? "";
}

/**
 * 为当前题选择对应结果类型。
 * 关键逻辑：按顺序轮转 outcome，保证各类型曝光均衡，避免某些类型样本过少。
 * 复杂度评估：O(1)。
 * @param {Array<object>} outcomes 结果类型数组。
 * @param {number} questionIndex 题目索引。
 * @returns {object|null} 当前题对应的结果类型。
 */
function pickOutcomeForLikertQuestion(outcomes, questionIndex) {
  if (!Array.isArray(outcomes) || outcomes.length === 0) {
    return null;
  }

  const outcomeIndex = questionIndex % outcomes.length;
  return outcomes[outcomeIndex] ?? null;
}

/**
 * 构建统一 5 档同意度选项（非常同意 ~ 非常不同意）。
 * 关键逻辑：生成型测试统一采用 5 级李克特量表，便于用户理解并提升跨测试一致性。
 * 复杂度评估：O(1)。
 * @param {object} params 参数对象。
 * @param {string} params.questionId 题目 ID。
 * @param {string} params.outcomeKey 结果键。
 * @returns {Array<object>} 5 档同意度选项。
 */
function buildAgreementLikertOptions({ questionId, outcomeKey }) {
  return [
    {
      id: `${questionId}-option-a`,
      label: "非常同意",
      vector: {
        [outcomeKey]: 4,
      },
    },
    {
      id: `${questionId}-option-b`,
      label: "同意",
      vector: {
        [outcomeKey]: 3,
      },
    },
    {
      id: `${questionId}-option-c`,
      label: "中立",
      vector: {
        [outcomeKey]: 2,
      },
    },
    {
      id: `${questionId}-option-d`,
      label: "不太同意",
      vector: {
        [outcomeKey]: 1,
      },
    },
    {
      id: `${questionId}-option-e`,
      label: "非常不同意",
      vector: {
        [outcomeKey]: 0,
      },
    },
  ];
}

/**
 * 生成适配同意度量表的题干。
 * 关键逻辑：题干统一陈述句，确保“同意/不同意”可直接作答。
 * 复杂度评估：O(L)，L 为 cue 文本长度。
 * @param {object} params 参数对象。
 * @param {string} params.cueText 倾向描述文案。
 * @param {number} params.statementVariantIndex 题干变体索引。
 * @returns {string} 题干文本。
 */
function buildLikertQuestionTitle({ cueText, statementVariantIndex }) {
  const normalizedCueText = String(cueText ?? "")
    .trim()
    .replace(/[。！？!?]+$/g, "");
  // 关键逻辑：统一保留第一人称口语化句式，避免“术语堆叠+语义跳跃”。
  const refinedCueText = normalizedCueText.replace(/^我通常/, "我");
  const statementVariants = [
    // 关键逻辑：首个模板保持最短句，降低阅读负担。
    ({ cueSentence }) => `${cueSentence}。`,
    ({ cueSentence }) => `${cueSentence}。`,
    ({ cueSentence }) => `${cueSentence}。`,
    ({ cueSentence }) => `${cueSentence}。`,
    ({ cueSentence }) => `${cueSentence}。`,
    ({ cueSentence }) => `${cueSentence}。`,
    ({ cueSentence }) => `${cueSentence}。`,
    ({ cueSentence }) => `${cueSentence}。`,
  ];

  const normalizedVariantIndex = Number(statementVariantIndex ?? 0);
  const safeVariantIndex =
    Number.isFinite(normalizedVariantIndex) && normalizedVariantIndex >= 0
      ? Math.floor(normalizedVariantIndex)
      : 0;
  const activeVariantBuilder =
    statementVariants[safeVariantIndex % statementVariants.length];

  return activeVariantBuilder({
    cueSentence: refinedCueText,
  });
}

/**
 * 构建冲突兜底题干（自然语言，不暴露技术标记）。
 * 关键逻辑：通过“场景 + 引导短句 + 陈述句”组合扩大表达空间，确保题干可读且可唯一化。
 * 复杂度评估：O(1)。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {string} params.cueText 倾向描述文案。
 * @param {number} params.questionIndex 题目索引。
 * @param {number} params.attemptIndex 当前尝试次数。
 * @returns {string} 兜底题干文本。
 */
function buildFallbackLikertQuestionTitle({
  testConfig,
  cueText,
  questionIndex,
  attemptIndex,
}) {
  const normalizedCueText = String(cueText ?? "")
    .trim()
    .replace(/[。！？!?]+$/g, "");
  const refinedCueText = normalizedCueText.replace(/^我通常/, "我");
  const sceneText =
    SCENE_LIBRARY[
      (Number(questionIndex ?? 0) + Number(attemptIndex ?? 0)) % SCENE_LIBRARY.length
    ];
  const promptList = Array.isArray(testConfig?.promptTemplates)
    ? testConfig.promptTemplates
    : [];
  // 关键逻辑：优先输出短句，降低移动端阅读压力。
  const conciseFallbackTitle = `${sceneText}，${refinedCueText}。`;

  if (promptList.length > 0) {
    const promptIndex =
      Math.floor(
        (Number(questionIndex ?? 0) + Number(attemptIndex ?? 0)) /
          Math.max(1, SCENE_LIBRARY.length),
      ) % promptList.length;
    const normalizedPromptText = String(promptList[promptIndex] ?? "")
      .trim()
      .replace(/[。！？!?：:]+$/g, "");

    if (normalizedPromptText) {
      const promptFallbackTitle = `${sceneText}，${normalizedPromptText}：${refinedCueText}。`;
      // 关键逻辑：题干超过 34 字时回退短句，避免“场景+提示+陈述”叠加过长。
      if (promptFallbackTitle.length <= 34) {
        return promptFallbackTitle;
      }
    }
  }

  return conciseFallbackTitle;
}

/**
 * 题目选项文案口语化替换规则：
 * 关键逻辑：只改展示文本，不改题目向量与评分逻辑，保证结果稳定性。
 */
const OPTION_LABEL_SIMPLIFY_RULES = [
  { pattern: /校准标准/g, replacement: "把标准想清楚" },
  { pattern: /低干扰高准确/g, replacement: "少打扰、但更准确" },
  { pattern: /化学反应/g, replacement: "心动感觉" },
  { pattern: /并肩升级/g, replacement: "一起变得更好" },
  { pattern: /情绪承接能力/g, replacement: "接住你情绪的能力" },
  { pattern: /同频/g, replacement: "合拍" },
  { pattern: /过度捆绑/g, replacement: "绑得太紧" },
  { pattern: /逻辑自洽/g, replacement: "逻辑说得通" },
  { pattern: /概念精度/g, replacement: "表达准确度" },
  { pattern: /独立推演/g, replacement: "自己想清楚再做" },
  { pattern: /外部组织资源/g, replacement: "外部资源" },
  { pattern: /自我校准/g, replacement: "按内心重新调整" },
  { pattern: /现场信息/g, replacement: "眼前现场的信息" },
  { pattern: /稳态执行/g, replacement: "按稳定节奏执行" },
  { pattern: /跨域联想/g, replacement: "跨领域联想" },
  { pattern: /隐含模式/g, replacement: "隐藏规律" },
  { pattern: /深度洞察/g, replacement: "深入看透问题" },
  { pattern: /可预期推进/g, replacement: "按可预期节奏推进" },
  { pattern: /精细验证/g, replacement: "仔细核对验证" },
  { pattern: /问题模型/g, replacement: "问题结构" },
  { pattern: /情绪温度/g, replacement: "情绪状态" },
  { pattern: /行动态/g, replacement: "行动状态" },
  { pattern: /实际体感是否舒适/g, replacement: "身体和心理是否舒服" },
  { pattern: /守序/g, replacement: "守规则" },
  { pattern: /利他/g, replacement: "对他人有益" },
  { pattern: /工具化/g, replacement: "工具性" },
  { pattern: /绝对意志/g, replacement: "完全按自己意志" },
  { pattern: /拉扯反应/g, replacement: "一会靠近一会后退" },
  { pattern: /实体操作/g, replacement: "动手操作" },
  { pattern: /偏好高变化社交/g, replacement: "更喜欢变化多一点的社交节奏" },
  { pattern: /偏好幕后支撑/g, replacement: "更习惯在幕后支持团队" },
  { pattern: /喜欢把人和事快速排布/g, replacement: "喜欢先把人和事快速安排好" },
  { pattern: /不喜欢混乱协作/g, replacement: "不喜欢协作方式太混乱" },
  { pattern: /价值观一致优先/g, replacement: "更看重价值观一致" },
  { pattern: /节奏稳定比刺激更重要/g, replacement: "更喜欢稳定节奏，不追求太多刺激" },
  { pattern: /愿意长期经营与共建/g, replacement: "愿意长期经营这段关系" },
  { pattern: /会重视目标与能力匹配/g, replacement: "会看重双方目标和能力是否匹配" },
  { pattern: /高质量陪伴/g, replacement: "稳定且有质量的陪伴" },
  { pattern: /重视执行与生活能力/g, replacement: "看重执行力和生活能力" },
  { pattern: /偏好务实合作/g, replacement: "更喜欢务实配合" },
  { pattern: /看重责任分担/g, replacement: "看重责任是否能一起分担" },
  { pattern: /重视系统可预期/g, replacement: "看重系统是否稳定可预期" },
  { pattern: /倾向客观中立执行/g, replacement: "倾向按客观中立的方式执行" },
  { pattern: /重视均衡与弹性/g, replacement: "看重平衡和灵活度" },
  { pattern: /重视现实收益/g, replacement: "更看重现实收益" },
  { pattern: /重视问题本质/g, replacement: "更关注问题本质" },
  { pattern: /偏好影响与推动/g, replacement: "更喜欢影响他人并推动事情" },
  { pattern: /愿意承担目标压力/g, replacement: "愿意扛目标压力" },
  { pattern: /擅长资源整合/g, replacement: "擅长把资源整合起来" },
  { pattern: /情绪受对方反馈影响大/g, replacement: "我的情绪容易受对方反馈影响" },
];

/**
 * 需要启用“第一人称动作句”渲染的测试键集合。
 * 关键逻辑：按用户反馈，除 MBTI 外，其余类型学测试均统一做口语化增强。
 */
const FIRST_PERSON_OPTION_TEST_KEYS = new Set([
  "enneagram",
  "social-persona",
  "ideal-match",
  "jung-classic",
  "disc",
  "attitude-psy",
  "temperament",
  "big-five",
  "dnd-alignment",
  "attachment",
  "holland",
]);

/**
 * 判断测试是否应启用第一人称动作句。
 * @param {string} testKey 测试键。
 * @returns {boolean} 是否启用第一人称动作句。
 */
function shouldUseFirstPersonOptionStyle(testKey) {
  return FIRST_PERSON_OPTION_TEST_KEYS.has(testKey);
}

/**
 * 将短语改写为第一人称完整句。
 * 关键逻辑：社会人格题目优先呈现“我会/我更…”句式，降低抽象阅读成本。
 * @param {string} inputText 口语化替换后的文本。
 * @returns {string} 第一人称句式文本。
 */
function toFirstPersonSentence(inputText) {
  const normalizedText = String(inputText ?? "").trim();
  if (!normalizedText) {
    return normalizedText;
  }

  if (/^我/.test(normalizedText)) {
    return normalizedText;
  }

  if (normalizedText.startsWith("先")) {
    return `我会${normalizedText}`;
  }

  if (normalizedText.startsWith("会") || normalizedText.startsWith("愿意") || normalizedText.startsWith("喜欢")) {
    return `我${normalizedText}`;
  }

  if (
    normalizedText.startsWith("偏好") ||
    normalizedText.startsWith("倾向") ||
    normalizedText.startsWith("重视") ||
    normalizedText.startsWith("在意")
  ) {
    return `我更${normalizedText}`;
  }

  if (normalizedText.startsWith("不喜欢")) {
    return `我${normalizedText}`;
  }

  // 关键逻辑：兜底场景统一前缀，保证选项读起来像完整口语句子。
  return `我通常${normalizedText}`;
}

/**
 * 口语化选项文本。
 * 复杂度评估：O(R * L)；R 为替换规则数量，L 为文本长度。R 为固定小常数（< 40），可近似视为 O(L)。
 * @param {string} inputText 原始文本。
 * @param {string} testKey 测试键。
 * @returns {string} 口语化后的文本。
 */
function simplifyOptionLabel(inputText, testKey) {
  let normalizedText = String(inputText ?? "");

  OPTION_LABEL_SIMPLIFY_RULES.forEach((ruleItem) => {
    normalizedText = normalizedText.replace(ruleItem.pattern, ruleItem.replacement);
  });

  if (shouldUseFirstPersonOptionStyle(testKey)) {
    normalizedText = toFirstPersonSentence(normalizedText);
  }

  return normalizedText;
}

/**
 * 题干扩容后缀词库（通用版）。
 * 关键逻辑：在不改变原始倾向方向的前提下，为同一倾向生成更多口语化变体，提升题库容量。
 */
const DEFAULT_CUE_EXPANSION_SUFFIXES = [
  "这会让我更有掌控感",
  "这会让我更安心",
  "这会让我更愿意投入",
  "这会让我更容易坚持",
  "这会让我判断更清楚",
  "这会让我推进更顺手",
  "这会让我减少内耗",
  "这会让我更快进入状态",
  "这会让我更有把握",
  "这会让我更愿意长期这样做",
  "这会让我更容易和他人配合",
  "这会让我更稳定地做决定",
  "这会让我在压力下也更从容",
  "这会让我更容易看见重点",
  "这会让我更愿意承担结果",
  "这会让我更容易保持节奏",
];

/**
 * 题干扩容后缀词库（关系向测试）。
 */
const RELATION_CUE_EXPANSION_SUFFIXES = [
  "这会让我更有安全感",
  "这会让我更愿意长期投入",
  "这会让我更容易建立信任",
  "这会让我更愿意表达真实想法",
  "这会让我更愿意共同规划未来",
  "这会让我更容易放下防备",
  "这会让我在关系里更安心",
  "这会让我更愿意一起解决问题",
  "这会让我更愿意持续经营关系",
  "这会让我更愿意靠近对方",
  "这会让我更愿意沟通真实需求",
  "这会让我更容易稳定相处",
  "这会让我更愿意修复冲突",
  "这会让我对这段关系更有把握",
  "这会让我更愿意共同承担现实压力",
  "这会让我更相信彼此是同一队",
];

/**
 * 题干扩容后缀词库（协作向测试）。
 */
const COLLAB_CUE_EXPANSION_SUFFIXES = [
  "这会让协作推进更顺畅",
  "这能减少团队反复沟通成本",
  "这会让大家更容易达成共识",
  "这会让执行节奏更稳定",
  "这会让任务落地更可控",
  "这会让分工更清晰",
  "这会让我更快判断优先级",
  "这会让团队更容易对齐目标",
  "这会让推进阻力更小",
  "这会让整体配合更高效",
  "这会让我在复杂协作里更从容",
  "这会让任务交付更稳",
  "这会让信息传递更准确",
  "这会让协作质量更高",
  "这会让问题更快收口",
  "这会让关键节点更少失误",
];

/**
 * 解析测试对应的扩容后缀词库。
 * 复杂度评估：O(1)。
 * @param {string} testKey 测试键。
 * @returns {Array<string>} 后缀词库。
 */
function resolveCueExpansionSuffixes(testKey) {
  if (testKey === "ideal-match" || testKey === "attachment") {
    return RELATION_CUE_EXPANSION_SUFFIXES;
  }

  if (testKey === "social-persona" || testKey === "disc") {
    return COLLAB_CUE_EXPANSION_SUFFIXES;
  }

  return DEFAULT_CUE_EXPANSION_SUFFIXES;
}

/**
 * 去重并规范化 cue 列表。
 * 复杂度评估：O(N * L)，N 为 cue 数量，L 为平均文本长度。
 * @param {Array<string>} cueList 原始 cue 列表。
 * @returns {Array<string>} 去重后的 cue 列表。
 */
function normalizeCueList(cueList) {
  const dedupedCueList = [];
  const seenCueSet = new Set();
  const safeCueList = Array.isArray(cueList) ? cueList : [];

  safeCueList.forEach((cueText) => {
    const normalizedCueText = String(cueText ?? "")
      .trim()
      .replace(/[。！？!?]+$/g, "");
    if (!normalizedCueText || seenCueSet.has(normalizedCueText)) {
      return;
    }

    seenCueSet.add(normalizedCueText);
    dedupedCueList.push(normalizedCueText);
  });

  return dedupedCueList;
}

/**
 * 按目标容量扩展单个 outcome 的 cue 列表。
 * 关键逻辑：
 * 1. 先保留原始 cue；
 * 2. 若容量不足，则通过“原始 cue + 后缀词库”构造稳定变体；
 * 3. 保证生成过程确定性，避免线上会话题库抖动。
 * 复杂度评估：O(T)，T 为目标 cue 容量（常量级，通常 < 20）。
 * @param {object} params 参数对象。
 * @param {Array<string>} params.baseCueList 原始 cue 列表。
 * @param {string} params.testKey 测试键。
 * @param {number} params.targetCount 目标 cue 容量。
 * @returns {Array<string>} 扩展后的 cue 列表。
 */
function expandOutcomeCueList({ baseCueList, testKey, targetCount }) {
  const normalizedBaseCueList = normalizeCueList(baseCueList);
  if (normalizedBaseCueList.length === 0) {
    return [];
  }

  const safeTargetCount = Math.max(1, Math.floor(targetCount || 0));
  if (normalizedBaseCueList.length >= safeTargetCount) {
    return normalizedBaseCueList;
  }

  const suffixList = resolveCueExpansionSuffixes(testKey);
  const expandedCueList = [...normalizedBaseCueList];
  const seenCueSet = new Set(expandedCueList);
  const maxIteration = normalizedBaseCueList.length * Math.max(1, suffixList.length) * 2;
  let iterationIndex = 0;

  while (expandedCueList.length < safeTargetCount && iterationIndex < maxIteration) {
    const baseCue = normalizedBaseCueList[iterationIndex % normalizedBaseCueList.length];
    const suffix =
      suffixList[Math.floor(iterationIndex / normalizedBaseCueList.length) % suffixList.length];
    const expandedCue = `${baseCue}，${suffix}`;
    if (!seenCueSet.has(expandedCue)) {
      seenCueSet.add(expandedCue);
      expandedCueList.push(expandedCue);
    }
    iterationIndex += 1;
  }

  return expandedCueList;
}

/**
 * 生成单个测试的题库。
 * 复杂度评估：O(N)，N 为该测试题库容量。
 * @param {object} testConfig 测试配置。
 * @returns {Array<object>} 题库。
 */
function buildGeneratedQuestionPool(testConfig) {
  if (!Array.isArray(testConfig?.outcomes) || testConfig.outcomes.length === 0) {
    return [];
  }

  const outcomeCount = testConfig.outcomes.length;
  const modeList = Array.isArray(testConfig?.modes) ? testConfig.modes : [];
  const maxModeQuestionCount = modeList.reduce((maxCount, modeItem) => {
    const baseCount = Math.max(0, Math.floor(Number(modeItem?.baseCount ?? 0)));
    return Math.max(maxCount, baseCount);
  }, 0);
  const targetCueCountPerOutcome = Math.max(
    1,
    Math.ceil(maxModeQuestionCount / Math.max(1, outcomeCount)),
  );
  // 关键逻辑：对每个结果类型先扩容 cue，确保固定题量模式下题干覆盖更充分。
  const resolvedOutcomeList = testConfig.outcomes.map((outcomeItem) => ({
    ...outcomeItem,
    cues: expandOutcomeCueList({
      baseCueList: outcomeItem.cues,
      testKey: testConfig.key,
      targetCount: targetCueCountPerOutcome,
    }),
  }));
  const generatedQuestions = [];
  const usedTitleSet = new Set();
  const questionContextLabel = resolveQuestionContextLabel(testConfig.key);

  for (let questionIndex = 0; questionIndex < testConfig.poolSize; questionIndex += 1) {
    const questionId = `${testConfig.key}-q-${String(questionIndex + 1).padStart(3, "0")}`;
    const selectedOutcome = pickOutcomeForLikertQuestion(resolvedOutcomeList, questionIndex);
    if (!selectedOutcome) {
      continue;
    }

    const blockIndex = Math.floor(questionIndex / outcomeCount);
    const cueIndex = blockIndex % selectedOutcome.cues.length;
    const statementVariantIndex = Math.floor(
      blockIndex / Math.max(1, selectedOutcome.cues.length),
    );
    const normalizedCueText = simplifyOptionLabel(selectedOutcome.cues[cueIndex], testConfig.key);

    let resolvedTitle = buildLikertQuestionTitle({
      cueText: normalizedCueText,
      statementVariantIndex,
    });

    let titleRetryCount = 0;
    const maxTitleRetryCount = 48;
    while (usedTitleSet.has(resolvedTitle) && titleRetryCount < maxTitleRetryCount) {
      titleRetryCount += 1;
      // 关键逻辑：先走同语义变体，再走“场景+引导短句”兜底，确保题量不缩水。
      if (titleRetryCount <= 24) {
        resolvedTitle = buildLikertQuestionTitle({
          cueText: normalizedCueText,
          statementVariantIndex: statementVariantIndex + titleRetryCount,
        });
      } else {
        resolvedTitle = buildFallbackLikertQuestionTitle({
          testConfig,
          cueText: normalizedCueText,
          questionIndex,
          attemptIndex: titleRetryCount - 24,
        });
      }
    }

    if (usedTitleSet.has(resolvedTitle)) {
      // 关键逻辑：最终兜底不再丢题，避免模式题量被削减。
      resolvedTitle = buildFallbackLikertQuestionTitle({
        testConfig,
        cueText: normalizedCueText,
        questionIndex,
        attemptIndex: titleRetryCount + questionIndex + 97,
      });
    }

    usedTitleSet.add(resolvedTitle);

    generatedQuestions.push({
      id: questionId,
      title: resolvedTitle,
      contextLabel: questionContextLabel,
      // 关键逻辑：题目已统一陈述句，辅助文案统一为“符合程度”引导，降低理解成本。
      description: "请根据符合程度作答。",
      weight: 1,
      options: buildAgreementLikertOptions({
        questionId,
        outcomeKey: selectedOutcome.key,
      }),
    });
  }

  return generatedQuestions;
}

/**
 * 社会人格静态题目蓝图：
 * 1. 第一项为题干；
 * 2. 第二项为题目对应结果维度键。
 * 关键逻辑：使用“题干 + 维度键”最小结构，便于后续低风险批量替换题库。
 */
const SOCIAL_PERSONA_QUESTION_BLUEPRINT = [
  ["我会先定方向，再带着大家推进。", "s-lead"],
  ["我习惯照顾身边人的情绪和需求。", "s-empathy"],
  ["我做事理性，习惯先分析利弊。", "s-analyst"],
  ["我喜欢稳定，不喜欢频繁变动。", "s-stability"],
  ["我乐于尝试新鲜事物，敢于冒险。", "s-explorer"],
  ["我在社交中很主动，容易和人熟络。", "s-social"],
  ["我更愿意独处，享受安静的时光。", "s-independent"],
  ["我有自己的原则，不轻易妥协。", "s-principle"],
  ["团队出现分歧时，我会主动协调。", "s-lead"],
  ["别人难过时，我会真心安慰。", "s-empathy"],
  ["我做决定很少受情绪影响。", "s-analyst"],
  ["生活有规律，我才会觉得安心。", "s-stability"],
  ["我喜欢挑战自己，突破舒适区。", "s-explorer"],
  ["聚会时，我通常是活跃气氛的人。", "s-social"],
  ["人多的场合会让我觉得疲惫。", "s-independent"],
  ["我不会为了合群而违背本心。", "s-principle"],
  ["我喜欢安排任务，推动进度。", "s-lead"],
  ["我很在意身边人过得好不好。", "s-empathy"],
  ["我习惯用数据和事实说话。", "s-analyst"],
  ["突然的变动会让我很不适应。", "s-stability"],
  ["我对未知的事物充满好奇。", "s-explorer"],
  ["我主动认识新朋友，拓展圈子。", "s-social"],
  ["我更喜欢一个人完成事情。", "s-independent"],
  ["我清楚自己的底线，不会退让。", "s-principle"],
  ["大家遇到问题会习惯找我拿主意。", "s-lead"],
  ["我愿意为了在乎的人付出很多。", "s-empathy"],
  ["我能客观看待问题，不偏袒。", "s-analyst"],
  ["我喜欢按计划一步步执行。", "s-stability"],
  ["我不喜欢一成不变的生活。", "s-explorer"],
  ["我在社交场合中很放松自然。", "s-social"],
  ["社交过后，我需要独处恢复精力。", "s-independent"],
  ["我不喜欢虚伪客套，只做真实的自己。", "s-principle"],
  ["我享受掌控局面的感觉。", "s-lead"],
  ["我很会换位思考，体谅他人。", "s-empathy"],
  ["情绪波动很少影响我的判断。", "s-analyst"],
  ["安稳踏实的生活让我满足。", "s-stability"],
  ["我愿意为了兴趣尝试各种可能。", "s-explorer"],
  ["我很容易和陌生人聊得来。", "s-social"],
  ["我不太喜欢主动开启话题。", "s-independent"],
  ["我做事有底线，不会随波逐流。", "s-principle"],
  ["我擅长组织活动，统筹资源。", "s-lead"],
  ["我会记住别人对我的好。", "s-empathy"],
  ["我擅长理性分析，解决复杂问题。", "s-analyst"],
  ["我不喜欢突如其来的变化。", "s-stability"],
  ["我喜欢探索不同的生活方式。", "s-explorer"],
  ["我喜欢和很多人保持良好关系。", "s-social"],
  ["我更适合独立思考和工作。", "s-independent"],
  ["我不会为了利益放弃原则。", "s-principle"],
  ["我敢于拍板，承担责任。", "s-lead"],
  ["我待人真诚，愿意用心经营关系。", "s-empathy"],
  ["我看重逻辑自洽，不喜欢双标。", "s-analyst"],
  ["我追求长期稳定，而非短期刺激。", "s-stability"],
  ["我喜欢体验新鲜感，拒绝无聊。", "s-explorer"],
  ["我擅长表达，能清晰传递想法。", "s-social"],
  ["我喜欢安静的环境，远离喧嚣。", "s-independent"],
  ["我做人有态度，不迎合、不讨好。", "s-principle"],
  ["我愿意为团队目标付出全力。", "s-lead"],
  ["我能察觉别人的情绪变化。", "s-empathy"],
  ["遇到问题，我习惯先找原因。", "s-analyst"],
  ["我喜欢按部就班，不喜欢打乱节奏。", "s-stability"],
  ["我喜欢不断学习，拓宽眼界。", "s-explorer"],
  ["我在人群中容易成为焦点。", "s-social"],
  ["我习惯在自己的世界里放松。", "s-independent"],
  ["我坚持做正确的事，而不是容易的事。", "s-principle"],
];

/**
 * 构建社会人格静态题库。
 * 复杂度评估：O(N)，N 为题目数量。
 * @returns {Array<object>} 题库对象数组。
 */
function buildSocialPersonaStaticQuestionPool() {
  const contextLabel = resolveQuestionContextLabel("social-persona");
  const normalizedQuestionBlueprint = Array.isArray(SOCIAL_PERSONA_QUESTION_BLUEPRINT)
    ? SOCIAL_PERSONA_QUESTION_BLUEPRINT
    : [];
  const builtQuestionPool = [];
  const seenTitleSet = new Set();

  normalizedQuestionBlueprint.forEach((questionTuple, questionIndex) => {
    const tupleTitle = String(questionTuple?.[0] ?? "").trim();
    const tupleOutcomeKey = String(questionTuple?.[1] ?? "").trim();
    if (!tupleTitle || !tupleOutcomeKey || seenTitleSet.has(tupleTitle)) {
      return;
    }

    seenTitleSet.add(tupleTitle);
    const questionId = `social-persona-q-${String(questionIndex + 1).padStart(3, "0")}`;
    // 关键逻辑：选项结构统一复用李克特生成器，保证评分类口径一致。
    builtQuestionPool.push({
      id: questionId,
      title: tupleTitle,
      contextLabel,
      description: "请根据符合程度作答。",
      weight: 1,
      options: buildAgreementLikertOptions({
        questionId,
        outcomeKey: tupleOutcomeKey,
      }),
    });
  });

  return builtQuestionPool;
}

/**
 * DISC 静态题目蓝图。
 * 关键逻辑：保留 title / outcomeKey / weight 结构，便于后续直接用 JSON 覆盖题库。
 */
const DISC_QUESTION_BLUEPRINT = [
  { title: "我会在不确定时先拍板推进。", outcomeKey: "d", weight: 1 },
  { title: "我喜欢通过互动带动团队氛围。", outcomeKey: "i", weight: 1 },
  { title: "我做事稳重，尽量避免风险。", outcomeKey: "s", weight: 1 },
  { title: "我注重细节和规则，追求准确。", outcomeKey: "c", weight: 1 },
  { title: "我喜欢挑战，敢于直面冲突。", outcomeKey: "d", weight: 1 },
  { title: "我容易和陌生人快速熟悉。", outcomeKey: "i", weight: 1 },
  { title: "我习惯配合他人，不喜欢争抢。", outcomeKey: "s", weight: 1 },
  { title: "我做决定前会反复核对信息。", outcomeKey: "c", weight: 1 },
  { title: "我目标感强，不达目的不罢休。", outcomeKey: "d", weight: 1 },
  { title: "我喜欢表达自己，乐于分享。", outcomeKey: "i", weight: 1 },
  { title: "我性格温和，不轻易发脾气。", outcomeKey: "s", weight: 1 },
  { title: "我做事严谨，不喜欢模糊地带。", outcomeKey: "c", weight: 1 },
  { title: "我喜欢掌控局面，自己做决定。", outcomeKey: "d", weight: 1 },
  { title: "我擅长鼓励别人，带动气氛。", outcomeKey: "i", weight: 1 },
  { title: "我做事有耐心，愿意慢慢等待。", outcomeKey: "s", weight: 1 },
  { title: "我重视逻辑和事实，不凭感觉。", outcomeKey: "c", weight: 1 },
  { title: "我行动力强，想到就尽快做。", outcomeKey: "d", weight: 1 },
  { title: "我喜欢热闹环境，享受被关注。", outcomeKey: "i", weight: 1 },
  { title: "我追求稳定，不喜欢频繁变动。", outcomeKey: "s", weight: 1 },
  { title: "我习惯先分析再行动，谨慎严谨。", outcomeKey: "c", weight: 1 },
  { title: "我敢于竞争，希望比别人更强。", outcomeKey: "d", weight: 1 },
  { title: "我善于社交，人脉比较广。", outcomeKey: "i", weight: 1 },
  { title: "我不喜欢冲突，尽量息事宁人。", outcomeKey: "s", weight: 1 },
  { title: "我做事有条理，按流程执行。", outcomeKey: "c", weight: 1 },
  { title: "我说话直接，不喜欢绕弯子。", outcomeKey: "d", weight: 1 },
  { title: "我乐观积极，容易感染别人。", outcomeKey: "i", weight: 1 },
  { title: "我善于倾听，给人安全感。", outcomeKey: "s", weight: 1 },
  { title: "我追求完美，不允许马虎出错。", outcomeKey: "c", weight: 1 },
  { title: "我遇到压力会更想掌控局面。", outcomeKey: "d", weight: 1 },
  { title: "压力大时我会找人倾诉放松。", outcomeKey: "i", weight: 1 },
  { title: "压力大时我会保持沉默慢慢来。", outcomeKey: "s", weight: 1 },
  { title: "压力大时我会反复检查确认。", outcomeKey: "c", weight: 1 },
  { title: "我喜欢高效，讨厌拖延。", outcomeKey: "d", weight: 1 },
  { title: "我喜欢新鲜有趣，讨厌沉闷。", outcomeKey: "i", weight: 1 },
  { title: "我做事踏实，一步一个脚印。", outcomeKey: "s", weight: 1 },
  { title: "我重视数据和依据，讲究严谨。", outcomeKey: "c", weight: 1 },
  { title: "我敢于承担责任，带头做事。", outcomeKey: "d", weight: 1 },
  { title: "我擅长拉近关系，让人舒服。", outcomeKey: "i", weight: 1 },
  { title: "我包容性强，愿意迁就他人。", outcomeKey: "s", weight: 1 },
  { title: "我善于发现问题和漏洞。", outcomeKey: "c", weight: 1 },
  { title: "我不喜欢被指挥，渴望自主。", outcomeKey: "d", weight: 1 },
  { title: "我喜欢被认可、被赞美。", outcomeKey: "i", weight: 1 },
  { title: "我喜欢安稳，不喜欢突发变化。", outcomeKey: "s", weight: 1 },
  { title: "我做事讲原则，守规矩。", outcomeKey: "c", weight: 1 },
  { title: "我果断干脆，不优柔寡断。", outcomeKey: "d", weight: 1 },
  { title: "我擅长表达，感染力强。", outcomeKey: "i", weight: 1 },
  { title: "我态度平和，情绪稳定。", outcomeKey: "s", weight: 1 },
  { title: "我思考深入，注重本质。", outcomeKey: "c", weight: 1 },
  { title: "我争强好胜，渴望赢。", outcomeKey: "d", weight: 1 },
  { title: "我喜欢交朋友，拓展圈子。", outcomeKey: "i", weight: 1 },
  { title: "我做事低调，不喜欢张扬。", outcomeKey: "s", weight: 1 },
  { title: "我喜欢规划清晰，有据可依。", outcomeKey: "c", weight: 1 },
  { title: "我面对困难会迎难而上。", outcomeKey: "d", weight: 1 },
  { title: "我擅长用热情化解尴尬。", outcomeKey: "i", weight: 1 },
  { title: "我善于坚持，不轻易放弃。", outcomeKey: "s", weight: 1 },
  { title: "我善于理性分析，客观冷静。", outcomeKey: "c", weight: 1 },
  { title: "我喜欢主导事情发展方向。", outcomeKey: "d", weight: 1 },
  { title: "我喜欢轻松愉快的工作氛围。", outcomeKey: "i", weight: 1 },
  { title: "我善于配合团队完成任务。", outcomeKey: "s", weight: 1 },
  { title: "我注重质量，精益求精。", outcomeKey: "c", weight: 1 },
];

/**
 * 构建 DISC 静态题库。
 * 复杂度评估：O(N)，N 为题目数量。
 * @returns {Array<object>} 题库对象数组。
 */
function buildDiscStaticQuestionPool() {
  const contextLabel = resolveQuestionContextLabel("disc");
  const validOutcomeKeySet = new Set(["d", "i", "s", "c"]);
  const normalizedQuestionBlueprint = Array.isArray(DISC_QUESTION_BLUEPRINT)
    ? DISC_QUESTION_BLUEPRINT
    : [];
  const builtQuestionPool = [];
  const seenTitleSet = new Set();

  normalizedQuestionBlueprint.forEach((questionItem, questionIndex) => {
    const normalizedTitle = String(questionItem?.title ?? "").trim();
    const normalizedOutcomeKey = String(questionItem?.outcomeKey ?? "")
      .trim()
      .toLowerCase();
    const normalizedWeight = Number(questionItem?.weight ?? 1);
    const resolvedWeight =
      Number.isFinite(normalizedWeight) && normalizedWeight > 0 ? normalizedWeight : 1;

    // 关键逻辑：构建阶段显式做去重和合法性过滤，避免线上题库脏数据影响测评稳定性。
    if (
      !normalizedTitle ||
      seenTitleSet.has(normalizedTitle) ||
      !validOutcomeKeySet.has(normalizedOutcomeKey)
    ) {
      return;
    }

    seenTitleSet.add(normalizedTitle);
    const questionId = `disc-q-${String(questionIndex + 1).padStart(3, "0")}`;
    builtQuestionPool.push({
      id: questionId,
      title: normalizedTitle,
      contextLabel,
      description: "请根据符合程度作答。",
      weight: resolvedWeight,
      options: buildAgreementLikertOptions({
        questionId,
        outcomeKey: normalizedOutcomeKey,
      }),
    });
  });

  return builtQuestionPool;
}

/**
 * 测试定义列表。
 */
export const TYPEOLOGY_TESTS = [
  createTestDefinition({
    key: "mbti",
    name: "MBTI",
    heroTitle: "认知偏好测试",
    shortDescription: "测你的信息处理与决策偏好，得到 16 型人格类型。",
    moduleDescription:
      "选择 MBTI 测试版本后开始作答。专业版与速测版都采用四维度偏好模型。",
    history:
      "MBTI 基于荣格类型学发展而来，常用于了解沟通偏好、决策风格与协作方式。结果用于自我理解，不建议作为能力上限判断。",
    effectClass: "theme-type-mbti",
    sceneOffset: 3,
    modes: [createMode("pro72", "72题专业版", 72), createMode("quick32", "32题速测版", 32)],
    poolSize: 120,
    promptTemplates: [
      "你第一反应通常是？",
      "你平时更常这样做？",
      "你更倾向哪种处理方式？",
      "你会先考虑什么？",
      "你最容易进入哪种状态？",
      "你下意识会先关注哪一边？",
    ],
    outcomes: [],
    // 关键逻辑：pro72 保持当前题库；quick32 使用独立强区分题库，避免题面与专业版同质化。
    modeQuestionPoolMap: {
      pro72: MBTI_PRO_120_QUESTION_BANK,
      quick32: MBTI_QUICK_32_QUESTION_BANK,
    },
    staticQuestionPool: MBTI_PRO_120_QUESTION_BANK,
  }),
  createTestDefinition({
    key: "enneagram",
    name: "九型人格",
    heroTitle: "Enneaura 气质九道测试",
    shortDescription: "识别你的核心动机与防御模式，定位九型主型。",
    moduleDescription:
      "九型人格包含 9 个核心动机原型。专业版覆盖更完整行为场景，速测版适合快速筛查。",
    history:
      "九型人格广泛用于人格动机研究与教练场景。它强调“为什么这样做”，而不只“做了什么”。",
    effectClass: "theme-type-enneagram",
    sceneOffset: 7,
    modes: [createMode("pro120", "120题专业版", 120), createMode("quick36", "36题速测版", 36)],
    poolSize: 120,
    promptTemplates: [
      "你内心最常被什么驱动？",
      "你平时最在意哪类需求？",
      "这时你第一反应通常是？",
      "你最常用的应对方式是？",
      "你下意识最想先守住什么？",
      "压力大时你更容易进入哪种状态？",
    ],
    outcomes: [
      {
        key: "e1",
        label: "1号 · 改革者",
        cues: ["先校准标准，再行动", "希望每一步都更正确", "会主动修正不规范之处"],
        summary: "你关注秩序、原则与改进。",
        tags: ["原则性", "改进导向", "高标准"],
        actions: ["允许 80 分上线，减少过度自责", "先做优先级，再做完美度", "把标准写成可执行清单"],
      },
      {
        key: "e2",
        label: "2号 · 助人者",
        cues: ["先照顾关系，再推进任务", "会优先感知他人需要", "愿意通过支持别人建立连接"],
        summary: "你重视情感连结与被需要感。",
        tags: ["共情", "关系投入", "支持性"],
        actions: ["练习提出个人需求", "帮助前先确认边界", "把“付出”转为双向协作"],
      },
      {
        key: "e3",
        label: "3号 · 成就者",
        cues: ["先看目标和产出", "会主动优化效率路径", "倾向用结果证明价值"],
        summary: "你偏好目标达成与可见成果。",
        tags: ["执行力", "结果导向", "竞争感"],
        actions: ["定期校准目标与内在价值", "把休息纳入计划", "复盘“有效而非忙碌”"],
      },
      {
        key: "e4",
        label: "4号 · 自我者",
        cues: ["先确认感受是否真实", "会保留个人表达独特性", "在意体验是否有意义"],
        summary: "你重视真实表达与情绪深度。",
        tags: ["感受力", "表达欲", "意义感"],
        actions: ["在情绪高峰后再做关键决策", "把感受转译成可执行动作", "固定输出创作习惯"],
      },
      {
        key: "e5",
        label: "5号 · 观察者",
        cues: ["先观察和收集信息", "会先理解机制再行动", "偏好保留独立思考空间"],
        summary: "你偏好洞察、理解与认知掌控。",
        tags: ["理性", "洞察", "边界感"],
        actions: ["设置“先行动 20%”规则", "把知识转化为输出", "增加低风险社交暴露"],
      },
      {
        key: "e6",
        label: "6号 · 忠诚者",
        cues: ["先评估风险再承诺", "会提前准备备用方案", "重视稳定关系与规则"],
        summary: "你重视安全感、责任与可靠性。",
        tags: ["风险意识", "责任感", "稳定性"],
        actions: ["区分真实风险与想象风险", "把担忧写成行动清单", "为自己建立正反馈记录"],
      },
      {
        key: "e7",
        label: "7号 · 体验者",
        cues: ["先找可能性和空间", "会快速切换到更有趣路径", "倾向保持开放与灵活"],
        summary: "你偏好自由、探索与新鲜体验。",
        tags: ["创造力", "乐观", "探索欲"],
        actions: ["控制并行目标数量", "为每个目标设收口条件", "给长期项目设节奏奖励"],
      },
      {
        key: "e8",
        label: "8号 · 保护者",
        cues: ["先掌控局面再谈细节", "会直接表达立场", "遇到压力更倾向正面突破"],
        summary: "你重视力量、边界与行动掌控。",
        tags: ["决断", "保护欲", "主导性"],
        actions: ["增加倾听窗口", "把“强势”转为“清晰”", "在冲突前先定义共同目标"],
      },
      {
        key: "e9",
        label: "9号 · 调停者",
        cues: ["先维持整体和谐", "会尽量减少正面冲突", "倾向在不同观点中找平衡"],
        summary: "你重视稳定感、融合与内外和谐。",
        tags: ["包容", "稳定", "调和"],
        actions: ["练习更早表达个人立场", "把重要事项设置硬截止", "每天给自己一个优先任务"],
      },
    ],
    // 关键逻辑：九型人格按模式使用独立题库，避免 quick36 被专业版题面覆盖。
    modeQuestionPoolMap: {
      pro120: ENNEAGRAM_PRO_120_QUESTION_BANK,
      quick36: ENNEAGRAM_QUICK_36_QUESTION_BANK,
    },
    staticQuestionPool: ENNEAGRAM_PRO_120_QUESTION_BANK,
  }),
  createTestDefinition({
    key: "social-persona",
    name: "社会人格",
    heroTitle: "社会人格测试",
    shortDescription: "看你在群体协作、边界管理与影响方式中的社会角色。",
    moduleDescription: "社会人格聚焦你在社会互动中的默认策略与长期角色定位。",
    history: "社会人格测评常用于团队分工、沟通匹配与领导风格优化。",
    effectClass: "theme-type-social",
    sceneOffset: 11,
    modes: [createMode("core64", "64题", 64)],
    poolSize: 64,
    promptTemplates: [
      "这类场景下你通常会怎么做？",
      "你平时最常用哪种应对方式？",
      "在群体里你第一步一般会做什么？",
      "你更常怎么影响别人？",
      "你最愿意把精力先放在哪件事上？",
    ],
    outcomes: [
      {
        key: "s-lead",
        label: "推动掌舵型",
        cues: [
          "我会先定方向，再带着大家推进",
          "我喜欢安排任务，推动进度",
          "我敢于拍板，承担责任",
        ],
        summary: "擅长明确目标、组织资源并推动团队落地。",
        tags: ["方向感", "统筹力", "责任感"],
        actions: ["补充向上同步与风险披露", "关键节点引入共识确认", "沉淀可复用推进流程"],
      },
      {
        key: "s-empathy",
        label: "共情关怀型",
        cues: ["我习惯照顾身边人的情绪和需求", "我会真心安慰状态不好的同伴", "我能察觉别人的情绪变化"],
        summary: "擅长感知情绪、提供支持并维护关系温度。",
        tags: ["同理心", "信任感", "关系经营"],
        actions: ["持续共情同时明确边界", "将支持经验文档化", "避免长期情绪透支"],
      },
      {
        key: "s-analyst",
        label: "理性分析型",
        cues: ["我做事理性，习惯先分析利弊", "我习惯用数据和事实说话", "遇到问题，我习惯先找原因"],
        summary: "擅长提炼事实、拆解问题并形成可验证判断。",
        tags: ["逻辑性", "结构化", "客观判断"],
        actions: ["结论同步时增加业务语境", "避免分析过久错失窗口", "用小实验快速验证假设"],
      },
      {
        key: "s-stability",
        label: "稳健秩序型",
        cues: ["我喜欢按计划一步步执行", "生活有规律，我才会觉得安心", "我不喜欢突如其来的变化"],
        summary: "擅长维持节奏、控制波动并保证执行稳定性。",
        tags: ["稳定性", "计划性", "可靠性"],
        actions: ["为变化场景预留弹性区间", "建立异常处理预案", "定期评估规则是否过度保守"],
      },
      {
        key: "s-explorer",
        label: "探索开拓型",
        cues: ["我乐于尝试新鲜事物，敢于冒险", "我喜欢挑战自己，突破舒适区", "我喜欢不断学习，拓宽眼界"],
        summary: "擅长打开增量机会并推动个人与团队持续进化。",
        tags: ["好奇心", "行动力", "创新倾向"],
        actions: ["设定阶段性收口目标", "控制并行探索数量", "把探索结果沉淀成复盘资产"],
      },
      {
        key: "s-social",
        label: "社交影响型",
        cues: ["我在社交中很主动，容易和人熟络", "我很容易和陌生人聊得来", "我擅长表达，能清晰传递想法"],
        summary: "擅长建立连接、活跃协作氛围并扩展网络影响力。",
        tags: ["表达力", "外向性", "影响力"],
        actions: ["在高互动外加入深度倾听", "建立关键关系维护节奏", "减少无效社交分散成本"],
      },
      {
        key: "s-independent",
        label: "独立内倾型",
        cues: ["我更愿意独处，享受安静的时光", "社交过后，我需要独处恢复精力", "我更适合独立思考和工作"],
        summary: "擅长深度思考与自我驱动，偏好低噪声高专注环境。",
        tags: ["专注力", "自驱", "深度思考"],
        actions: ["主动同步阶段性产出", "与团队约定低成本沟通机制", "在关键节点提前暴露风险"],
      },
      {
        key: "s-principle",
        label: "原则坚守型",
        cues: ["我有自己的原则，不轻易妥协", "我清楚自己的底线，不会退让", "我坚持做正确的事，而不是容易的事"],
        summary: "擅长守住价值边界，在复杂场景中保持一致性与可信度。",
        tags: ["价值观", "一致性", "边界感"],
        actions: ["将原则转化为可执行判断标准", "区分“底线”与“偏好”以保留协作弹性", "高冲突场景先对齐共同目标"],
      },
    ],
    staticQuestionPool: buildSocialPersonaStaticQuestionPool(),
  }),
  createTestDefinition({
    key: "ideal-match",
    name: "理想型",
    heroTitle: "理想型关系测试",
    shortDescription: "识别你在关系中真正重视的匹配维度。",
    moduleDescription: "理想型测试聚焦关系偏好、吸引机制与长期匹配策略。",
    history: "理想型评估常用于关系咨询中，帮助识别“短期吸引”与“长期适配”的差异。",
    effectClass: "theme-type-ideal",
    sceneOffset: 15,
    modes: [createMode("core64", "64题", 64)],
    poolSize: 64,
    promptTemplates: [
      "你更容易被哪种特质吸引？",
      "长期相处时你最看重什么？",
      "有矛盾时你最希望对方怎么做？",
      "你更想要哪种关系节奏？",
      "在关系里，你的安全感主要来自哪里？",
    ],
    outcomes: [
      {
        key: "i-stable",
        label: "稳定共建型",
        cues: [
          "我更看重两个人价值观一致",
          "我更喜欢稳定的关系节奏，不追求反复拉扯",
          "我愿意把关系当作长期经营的事情",
        ],
        summary: "追求长期可靠、可成长的关系结构。",
        tags: ["稳定", "责任", "长期主义"],
        actions: ["明确双方成长目标", "建立定期沟通机制", "保留独立空间"],
      },
      {
        key: "i-passion",
        label: "高能吸引型",
        cues: [
          "我容易被强烈的心动感觉吸引",
          "我喜欢对方直接表达喜欢和在意",
          "我希望关系里一直有新鲜感",
        ],
        summary: "追求高强度连接与情绪共振。",
        tags: ["热度", "表达", "新鲜感"],
        actions: ["设置冲突降温机制", "把激情转为日常连接动作", "减少情绪化决策"],
      },
      {
        key: "i-growth",
        label: "共同成长型",
        cues: [
          "我希望两个人能互相鼓励、一起成长",
          "我会看重双方目标和能力是否匹配",
          "我更喜欢一起进步的伴侣关系",
        ],
        summary: "追求互相成就与阶段成长。",
        tags: ["成长", "目标", "互相赋能"],
        actions: ["定期共识复盘", "避免把关系工具化", "给亲密留白"],
      },
    ],
    staticQuestionPool: IDEAL_MATCH_CORE_64_QUESTION_BANK,
  }),
  createTestDefinition({
    key: "jung-classic",
    name: "经典荣格",
    heroTitle: "经典荣格心理功能测试",
    shortDescription: "识别你更偏好的荣格心理功能组合。",
    moduleDescription: "经典荣格测试聚焦心理能量流向与认知功能偏好。",
    history: "荣格类型学是现代人格分类的重要来源，强调功能偏好并非能力高低。",
    effectClass: "theme-type-jung",
    sceneOffset: 18,
    modes: [createMode("core60", "60题", 60)],
    poolSize: 60,
    promptTemplates: [
      "你平时更依赖哪种心理功能？",
      "你通常会先用哪种处理方式？",
      "压力大时你最容易回到哪种状态？",
      "你的思考方式更像哪一类？",
      "你更常凭哪种内在判断做决定？",
    ],
    outcomes: [
      {
        key: "j-te",
        label: "外倾思维 Te",
        cues: ["先设结构再推进", "重视效率与结果", "倾向外部组织资源"],
        summary: "偏好外部结构与高效执行。",
        tags: ["结构", "效率", "组织"],
        actions: ["增加情绪信息输入", "对复杂问题保留探索窗口", "训练反馈式管理"],
      },
      {
        key: "j-ti",
        label: "内倾思维 Ti",
        cues: ["先求逻辑自洽", "重视概念精度", "偏好独立推演"],
        summary: "偏好内部逻辑系统与精确建模。",
        tags: ["逻辑", "建模", "精度"],
        actions: ["提高对外表达频率", "避免过度内耗", "设置决策截止点"],
      },
      {
        key: "j-fe",
        label: "外倾情感 Fe",
        cues: ["先看关系氛围", "重视群体感受", "倾向对外协调"],
        summary: "偏好关系协调与外部情绪调节。",
        tags: ["协调", "共情", "关系"],
        actions: ["减少情绪迎合", "建立个人边界表达", "把共识写成行动方案"],
      },
      {
        key: "j-fi",
        label: "内倾情感 Fi",
        cues: ["先对齐内在价值", "重视真实感受", "倾向自我校准"],
        summary: "偏好价值一致与内在真实。",
        tags: ["价值观", "真实", "自我一致"],
        actions: ["提升外部协商能力", "区分价值冲突等级", "把感受落地到行动"],
      },
      {
        key: "j-se",
        label: "外倾感觉 Se",
        cues: ["先感知现场信息", "偏好即时反应", "注重体验和行动"],
        summary: "偏好即时感知与现实行动。",
        tags: ["临场", "体验", "反应"],
        actions: ["增强长期规划", "避免冲动成本", "建立复盘习惯"],
      },
      {
        key: "j-si",
        label: "内倾感觉 Si",
        cues: ["先调用经验模板", "重视熟悉路径", "倾向稳态执行"],
        summary: "偏好经验沉淀与稳定流程。",
        tags: ["经验", "稳定", "细节"],
        actions: ["引入有限创新实验", "减少路径依赖", "周期性更新方法库"],
      },
      {
        key: "j-ne",
        label: "外倾直觉 Ne",
        cues: ["先拓展可能性", "喜欢跨域联想", "偏好多方案并行"],
        summary: "偏好创意发散与机会探索。",
        tags: ["联想", "创意", "探索"],
        actions: ["加强收口能力", "减少目标并行数", "为灵感设验证节奏"],
      },
      {
        key: "j-ni",
        label: "内倾直觉 Ni",
        cues: ["先捕捉隐含模式", "重视长期图景", "偏好深度洞察"],
        summary: "偏好深层洞察与长期战略。",
        tags: ["洞察", "战略", "前瞻"],
        actions: ["增加事实校验频率", "把抽象洞察转为短动作", "减少过度预测"],
      },
    ],
    staticQuestionPool: JUNG_CLASSIC_QUESTION_BANK,
  }),
  createTestDefinition({
    key: "disc",
    name: "DISC",
    heroTitle: "DISC 行为风格测试",
    shortDescription: "识别你在压力、协作与执行中的 DISC 行为倾向。",
    moduleDescription: "DISC 聚焦行为风格，不评判好坏，主要用于沟通与协作适配。",
    history: "DISC 模型广泛用于企业团队协作和管理培训，强调场景化行为差异。",
    effectClass: "theme-type-disc",
    sceneOffset: 22,
    modes: [createMode("core60", "60题", 60)],
    poolSize: 60,
    promptTemplates: [
      "你的默认行为风格更像哪种？",
      "你通常会先采取哪类动作？",
      "你平时更常怎么影响局面？",
      "冲突时你最自然的反应是什么？",
      "团队里你更常扮演哪种角色？",
    ],
    outcomes: [
      {
        key: "d",
        label: "D · 支配型",
        cues: ["直接拍板并推进", "先抢节奏再优化", "偏好掌控关键决策"],
        summary: "行动果断、目标明确、推进强。",
        tags: ["决断", "推进", "目标"],
        actions: ["增加倾听窗口", "公开决策依据", "在关键节点征求反馈"],
      },
      {
        key: "i",
        label: "I · 影响型",
        cues: ["先调动氛围再推动", "擅长鼓舞他人", "喜欢通过互动达成目标"],
        summary: "表达活跃、感染力强、社交驱动。",
        tags: ["表达", "感染力", "外向"],
        actions: ["避免承诺过载", "建立任务追踪机制", "把灵感转成可交付清单"],
      },
      {
        key: "s",
        label: "S · 稳健型",
        cues: ["先稳住节奏和关系", "重视持续协作", "偏好可预期推进"],
        summary: "稳定耐心、支持协作、持续可靠。",
        tags: ["稳健", "耐心", "支持"],
        actions: ["提升表达主张的频率", "关键决策提前发声", "避免长期被动补位"],
      },
      {
        key: "c",
        label: "C · 谨慎型",
        cues: ["先核对标准和风险", "重视准确与规范", "倾向精细验证"],
        summary: "严谨理性、质量意识强、标准导向。",
        tags: ["严谨", "标准", "风险控制"],
        actions: ["减少过度求稳", "设定“足够好”阈值", "在不确定中练习小步试错"],
      },
    ],
    staticQuestionPool: buildDiscStaticQuestionPool(),
  }),
  createTestDefinition({
    key: "attitude-psy",
    name: "态度心理",
    heroTitle: "态度心理测试",
    shortDescription: "识别你在逻辑、情感、意志、体验四轴上的态度排序。",
    moduleDescription: "态度心理关注你在不同心理维度上的优先级与响应方式。",
    history: "态度心理模型常用于解释个体在关系与决策中的“先后顺序偏好”。",
    effectClass: "theme-type-attitude",
    sceneOffset: 25,
    modes: [createMode("core64", "64题", 64)],
    poolSize: 84,
    promptTemplates: [
      "你更习惯先调动哪种心理资源？",
      "你更相信哪类判断信号？",
      "冲突来临时你最先守住什么？",
      "你最自然的应对顺序是？",
      "做取舍时你通常更看重什么？",
    ],
    outcomes: [
      {
        key: "ap-l",
        label: "逻辑优先",
        cues: ["先求结构清晰", "先验证逻辑一致", "会先拆解问题模型"],
        summary: "先逻辑后情绪，偏好结构化判断。",
        tags: ["逻辑", "结构", "分析"],
        actions: ["补充情绪语境输入", "避免“对”但难落地", "增加低成本试验"],
      },
      {
        key: "ap-e",
        label: "情感优先",
        cues: ["先感知情绪温度", "先确认关系状态", "会先照顾感受再推进"],
        summary: "先感受后判断，重视关系质量。",
        tags: ["情感", "共情", "关系"],
        actions: ["把感受转译成明确需求", "避免过度承担他人情绪", "建立边界表达"],
      },
      {
        key: "ap-v",
        label: "意志优先",
        cues: ["先定目标和主线", "会快速进入行动态", "偏好掌控推进节奏"],
        summary: "先意志后协商，重视主导推进。",
        tags: ["意志", "主导", "推进"],
        actions: ["练习延迟判断", "让团队参与目标共创", "控制强压沟通"],
      },
      {
        key: "ap-f",
        label: "体验优先",
        cues: ["先看身体和现场感受", "偏好真实体验反馈", "更在意实际体感是否舒适"],
        summary: "先体验后抽象，重视现实感与生活质感。",
        tags: ["体验", "现实感", "生活化"],
        actions: ["提升长期规划意识", "避免只追短期舒服", "把体感转为可执行标准"],
      },
    ],
  }),
  createTestDefinition({
    key: "temperament",
    name: "体液气质",
    heroTitle: "体液气质测试",
    shortDescription: "识别你的气质底色：多血质、胆汁质、粘液质或抑郁质。",
    moduleDescription: "体液气质用于观察反应风格与情绪节奏，不代表能力高低。",
    history: "体液气质源于古典医学传统，现代常用于性格风格的描述与自我观察。",
    effectClass: "theme-type-temperament",
    sceneOffset: 29,
    modes: [createMode("core60", "60题", 60)],
    poolSize: 60,
    promptTemplates: [
      "你最常见的情绪节奏是？",
      "你的气质反应更像哪种？",
      "压力下你通常会进入哪种状态？",
      "你最自然的状态更接近哪种？",
      "你恢复精力的方式更像哪种？",
    ],
    outcomes: [
      {
        key: "temp-sanguine",
        label: "多血质",
        cues: ["乐观外放、反应快", "喜欢互动和新鲜感", "情绪来得快去得也快"],
        summary: "外向活跃，感染力强。",
        tags: ["乐观", "活跃", "感染力"],
        actions: ["注意执行收口", "减少目标切换", "用节奏管理替代冲动"],
      },
      {
        key: "temp-choleric",
        label: "胆汁质",
        cues: ["目标驱动、推进强", "遇阻会更想突破", "表达直接且果断"],
        summary: "高驱动高行动，冲劲明显。",
        tags: ["行动力", "主导", "冲劲"],
        actions: ["降低沟通压强", "练习倾听与迭代", "避免高压常态化"],
      },
      {
        key: "temp-phlegmatic",
        label: "粘液质",
        cues: ["稳定耐心、节奏平稳", "不喜欢高波动冲突", "倾向长期持续输出"],
        summary: "稳定持久，抗扰性较强。",
        tags: ["稳定", "耐心", "持续"],
        actions: ["提升主动表达", "关键节点更早发声", "防止舒适区停滞"],
      },
      {
        key: "temp-melancholic",
        label: "抑郁质",
        cues: ["敏感细腻、思考深", "重视细节和意义", "情绪体验较深"],
        summary: "深度敏感，洞察与审美突出。",
        tags: ["细腻", "深度", "洞察"],
        actions: ["避免过度内耗", "把情绪写成行动清单", "增加外部正反馈输入"],
      },
    ],
    staticQuestionPool: TEMPERAMENT_CORE_60_QUESTION_BANK,
  }),
  createTestDefinition({
    key: "big-five",
    name: "大五人格",
    heroTitle: "大五人格测试",
    shortDescription: "识别你在开放性、尽责性、外向性、宜人性、情绪稳定上的画像。",
    moduleDescription: "大五人格是现代心理学使用广泛的人格维度模型。",
    history: "大五模型常用于研究人格差异对学习、职业和关系的影响。",
    effectClass: "theme-type-bigfive",
    sceneOffset: 31,
    modes: [createMode("core60", "60题", 60)],
    poolSize: 60,
    promptTemplates: [
      "你的整体人格更接近哪种组合？",
      "你的长期行为倾向更像哪种？",
      "在压力和协作中你通常是什么状态？",
      "你更稳定的风格标签是什么？",
      "你平时更常展现哪类特征组合？",
    ],
    outcomes: [
      {
        key: "bf-scoei",
        label: "SCOEI",
        cues: ["社交外放且执行稳定", "探索欲与纪律感并存", "对人友好且情绪稳"],
        summary: "均衡高分型，适应场景较广。",
        tags: ["均衡", "稳定", "高适应"],
        actions: ["强化个人差异化优势", "避免“什么都能做”导致分散", "给关键目标加权"],
      },
      {
        key: "bf-sco--",
        label: "SCO--",
        cues: ["外向开放且高执行", "对结果和效率敏感", "关系中更偏任务导向"],
        summary: "高执行开拓型。",
        tags: ["执行", "开拓", "效率"],
        actions: ["增强共情反馈", "降低强任务语气", "设置关系维护动作"],
      },
      {
        key: "bf--oei",
        label: "--OEI",
        cues: ["偏内向但开放细腻", "重视体验质量", "情绪感受丰富"],
        summary: "内省感知型。",
        tags: ["内省", "体验", "敏感"],
        actions: ["提升行动起步速度", "建立目标可视化", "控制反刍时长"],
      },
      {
        key: "bf-sc--i",
        label: "SC--I",
        cues: ["稳定守序、条理清晰", "重视承诺和责任", "情绪恢复速度较快"],
        summary: "稳定尽责型。",
        tags: ["尽责", "可靠", "稳定"],
        actions: ["增加创新窗口", "避免路径依赖", "主动拥抱小范围变化"],
      },
      {
        key: "bf-s--e-",
        label: "S--E-",
        cues: ["外向表达强", "对关系和反馈敏感", "偏好高互动合作"],
        summary: "关系驱动型。",
        tags: ["互动", "表达", "关系"],
        actions: ["增加结构化规划", "避免情绪性承诺", "为目标设验收标准"],
      },
      {
        key: "bf--c-i",
        label: "--C-I",
        cues: ["低外放但高自律", "重视质量与精度", "偏好低噪音环境"],
        summary: "理性深潜型。",
        tags: ["自律", "深度", "精度"],
        actions: ["提高对外可见度", "练习快速表达", "减少完美主义门槛"],
      },
    ],
    staticQuestionPool: BIG_FIVE_CORE_60_QUESTION_BANK,
  }),
  createTestDefinition({
    key: "dnd-alignment",
    name: "DnD阵营",
    heroTitle: "DnD 阵营测试",
    shortDescription: "定位你的道德轴与秩序轴：9 宫格阵营归属。",
    moduleDescription: "DnD 阵营测试关注价值选择与行为边界，不代表现实道德评价。",
    history: "DnD 阵营源于桌游角色系统，常用于描述角色价值取向与行事准则。",
    effectClass: "theme-type-dnd",
    sceneOffset: 34,
    modes: [createMode("core60", "60题", 60)],
    poolSize: 60,
    promptTemplates: [
      "面对选择时你更会走哪条价值路径？",
      "在规则和善恶之间你更偏向哪边？",
      "你通常会先把什么放在第一位？",
      "面对冲突时你更认同哪种原则？",
      "你会先捍卫哪条底线？",
    ],
    outcomes: [
      {
        key: "dnd-lg",
        label: "守序善良",
        cues: ["遵守规则并保护弱者", "重视制度与公义", "希望用稳定方式做好事"],
        summary: "规则与善意并重的秩序型。",
        tags: ["秩序", "责任", "利他"],
        actions: ["避免规则僵化", "允许情境弹性", "把善意转成可执行机制"],
      },
      {
        key: "dnd-ng",
        label: "中立善良",
        cues: ["优先让事情更善良", "不执着固定规则", "以结果是否利他为核心"],
        summary: "以善意结果为核心的平衡型。",
        tags: ["善意", "灵活", "平衡"],
        actions: ["建立边界防止透支", "减少情绪性投入", "强化长期规划"],
      },
      {
        key: "dnd-cg",
        label: "混乱善良",
        cues: ["为善可以打破不合理规则", "重视自由与正义感", "行动风格偏自发"],
        summary: "自由导向的善意突破型。",
        tags: ["自由", "正义", "突破"],
        actions: ["提升执行稳定性", "避免冲动代价", "建立协作共识"],
      },
      {
        key: "dnd-ln",
        label: "守序中立",
        cues: ["先按规则办事", "重视系统可预期", "倾向客观中立执行"],
        summary: "秩序优先的系统维护型。",
        tags: ["系统", "规则", "稳定"],
        actions: ["增强人性化沟通", "规则解释更透明", "防止机械执行"],
      },
      {
        key: "dnd-tn",
        label: "绝对中立",
        cues: ["保持中立不轻易站队", "看情境选择最可行路径", "重视均衡与弹性"],
        summary: "平衡导向的情境适配型。",
        tags: ["平衡", "中立", "适配"],
        actions: ["关键时刻明确立场", "减少模糊决策", "定义优先原则"],
      },
      {
        key: "dnd-cn",
        label: "混乱中立",
        cues: ["优先个人自由与体验", "不喜欢被过度约束", "行为更随当下判断"],
        summary: "自由优先的流动探索型。",
        tags: ["自由", "探索", "流动"],
        actions: ["补强责任闭环", "减少频繁变轨", "提升长期承诺稳定度"],
      },
      {
        key: "dnd-le",
        label: "守序邪恶",
        cues: ["用规则服务自身利益", "擅长系统性掌控", "重视权力与秩序工具化"],
        summary: "工具理性极强的秩序操盘型。",
        tags: ["权力", "策略", "掌控"],
        actions: ["加入伦理校验", "避免过度工具化关系", "平衡长期声誉成本"],
      },
      {
        key: "dnd-ne",
        label: "中立邪恶",
        cues: ["优先结果对自己有利", "不被固定规则绑定", "重视现实收益"],
        summary: "结果导向的现实博弈型。",
        tags: ["现实", "收益", "博弈"],
        actions: ["增加长期信任投资", "避免短利伤长期", "建立底线红线"],
      },
      {
        key: "dnd-ce",
        label: "混乱邪恶",
        cues: ["拒绝约束并追求绝对意志", "高冲动高破坏倾向", "偏好强烈主观行动"],
        summary: "极端自由的破局型。",
        tags: ["破坏", "冲动", "极端自由"],
        actions: ["强化冲动管理", "建立后果评估机制", "增加稳定支持系统"],
      },
    ],
    staticQuestionPool: DND_ALIGNMENT_CORE_60_QUESTION_BANK,
  }),
  createTestDefinition({
    key: "attachment",
    name: "依恋类型",
    heroTitle: "依恋类型测试",
    shortDescription: "识别你的亲密关系依恋模式。",
    moduleDescription: "依恋类型测试聚焦亲密关系里的安全感来源与冲突反应。",
    history: "依恋理论常用于理解关系互动模式、情绪触发点与修复路径。",
    effectClass: "theme-type-attachment",
    sceneOffset: 37,
    modes: [createMode("core64", "64题", 64)],
    poolSize: 64,
    promptTemplates: [
      "在亲密关系里你更常出现哪种反应？",
      "关系不确定时你第一反应通常是？",
      "发生冲突时你更偏向哪种做法？",
      "你通常怎样确认自己被爱？",
      "在亲近和边界之间你更常怎么选？",
    ],
    outcomes: [
      {
        key: "att-secure",
        label: "安全型",
        cues: ["敢表达需求也能尊重边界", "冲突后愿意修复沟通", "关系里稳定且信任"],
        summary: "关系中有边界、有连接、可修复。",
        tags: ["稳定", "信任", "修复"],
        actions: ["继续保持开放沟通", "在压力期主动同步状态", "维持独立与连接平衡"],
      },
      {
        key: "att-anxious",
        label: "焦虑型",
        cues: ["关系波动时会反复确认", "容易担心被忽视", "情绪受对方反馈影响大"],
        summary: "高敏感高投入，容易过度警觉。",
        tags: ["敏感", "确认需求", "高投入"],
        actions: ["练习自我安抚工具", "把需求说清而非试探", "区分事实与担忧"],
      },
      {
        key: "att-avoidant",
        label: "回避型",
        cues: ["关系靠近时会想拉开距离", "不习惯暴露脆弱感受", "倾向用理性隔离情绪"],
        summary: "重边界重独立，亲密表达受限。",
        tags: ["边界", "独立", "情感抑制"],
        actions: ["小步表达真实感受", "冲突时延迟撤退", "练习接受支持"],
      },
      {
        key: "att-fearful",
        label: "恐惧型",
        cues: ["既渴望靠近又担心受伤", "关系中容易摇摆", "冲突时会出现拉扯反应"],
        summary: "靠近与防御并存，波动感较强。",
        tags: ["拉扯", "防御", "不稳定"],
        actions: ["先建立稳定日常连接", "分阶段建立信任", "必要时寻求专业支持"],
      },
    ],
    staticQuestionPool: ATTACHMENT_CORE_64_QUESTION_BANK,
  }),
  createTestDefinition({
    key: "holland",
    name: "霍兰德",
    heroTitle: "霍兰德职业兴趣测试",
    shortDescription: "定位你的职业兴趣代码（RIASEC）。",
    moduleDescription: "霍兰德模型用于识别职业兴趣取向，帮助做岗位选择与路径探索。",
    history: "RIASEC 模型在职业测评领域应用广泛，常用于职业咨询与教育规划。",
    effectClass: "theme-type-holland",
    sceneOffset: 41,
    modes: [createMode("core60", "60题", 60)],
    poolSize: 60,
    promptTemplates: [
      "你更愿意投入哪类工作场景？",
      "哪类任务最能让你有能量？",
      "你会优先选择哪种职业活动？",
      "你更享受哪种工作反馈？",
      "长期看你更适合哪种岗位氛围？",
    ],
    outcomes: [
      {
        key: "h-r",
        label: "R · 现实型",
        cues: ["偏好动手与实体操作", "喜欢可见成果", "愿意在现实场景解决问题"],
        summary: "擅长实操与现场解决。",
        tags: ["动手", "实操", "执行"],
        actions: ["补充沟通表达", "把经验流程化", "提升跨团队协同"],
      },
      {
        key: "h-i",
        label: "I · 研究型",
        cues: ["偏好分析、研究和推理", "喜欢深度学习", "重视问题本质"],
        summary: "擅长研究、分析与建模。",
        tags: ["研究", "分析", "推理"],
        actions: ["提升结果可视化", "增强对外表达", "让洞察快速转应用"],
      },
      {
        key: "h-a",
        label: "A · 艺术型",
        cues: ["偏好创意表达", "重视审美与个性", "喜欢开放式创作空间"],
        summary: "擅长创意表达与风格构建。",
        tags: ["创意", "审美", "表达"],
        actions: ["加强项目管理", "增加商业化思维", "建立稳定输出节奏"],
      },
      {
        key: "h-s",
        label: "S · 社会型",
        cues: ["偏好助人和沟通", "关注他人成长", "擅长协作和支持"],
        summary: "擅长服务、沟通与关系工作。",
        tags: ["助人", "沟通", "协作"],
        actions: ["避免情绪透支", "建立边界与节奏", "把经验沉淀为方法"],
      },
      {
        key: "h-e",
        label: "E · 企业型",
        cues: ["偏好影响与推动", "愿意承担目标压力", "擅长资源整合"],
        summary: "擅长推动、管理与商业落地。",
        tags: ["影响", "管理", "商业"],
        actions: ["提高数据化复盘", "避免目标过载", "强化长期团队建设"],
      },
      {
        key: "h-c",
        label: "C · 常规型",
        cues: ["偏好流程和秩序", "重视准确与规范", "喜欢有明确规则的系统"],
        summary: "擅长流程管理与系统维护。",
        tags: ["规范", "流程", "准确"],
        actions: ["增加变化适应训练", "学习自动化工具", "避免过度保守"],
      },
    ],
    staticQuestionPool: HOLLAND_CORE_60_QUESTION_BANK,
  }),
];

/**
 * 测试配置映射。
 */
export const TYPEOLOGY_TEST_MAP = TYPEOLOGY_TESTS.reduce((accumulator, testItem) => {
  accumulator.set(testItem.key, testItem);
  return accumulator;
}, new Map());

/**
 * 题库缓存。
 */
const QUESTION_POOL_CACHE = new Map();

/**
 * 获取测试配置。
 * @param {string} testKey 测试键。
 * @returns {object|null} 测试配置。
 */
export function getTypeologyTestConfig(testKey) {
  return TYPEOLOGY_TEST_MAP.get(testKey) ?? null;
}

/**
 * 获取测试题库。
 * 复杂度评估：
 * 1. 首次生成：O(N)。
 * 2. 缓存命中：O(1)。
 * @param {string} testKey 测试键。
 * @returns {Array<object>} 题库数组。
 */
export function getTypeologyQuestionPool(testKey) {
  if (QUESTION_POOL_CACHE.has(testKey)) {
    return QUESTION_POOL_CACHE.get(testKey);
  }

  const testConfig = getTypeologyTestConfig(testKey);
  if (!testConfig) {
    return [];
  }

  const questionPool =
    Array.isArray(testConfig.staticQuestionPool) && testConfig.staticQuestionPool.length > 0
      ? testConfig.staticQuestionPool
      : buildGeneratedQuestionPool(testConfig);

  QUESTION_POOL_CACHE.set(testKey, questionPool);
  return questionPool;
}

/**
 * 默认测试键。
 */
export const DEFAULT_TYPEOLOGY_TEST_KEY = "mbti";
