import { MBTI_PRO_120_QUESTION_BANK } from "./mbtiQuestionBank";

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
 * 获取题目场景文案。
 * 复杂度评估：O(1)。
 * @param {object} testConfig 测试配置。
 * @param {number} questionIndex 题目索引。
 * @returns {string} 场景文案。
 */
function resolveQuestionScene(testConfig, questionIndex) {
  return SCENE_LIBRARY[(questionIndex + testConfig.sceneOffset) % SCENE_LIBRARY.length];
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
 * @param {string} params.sceneText 场景文案。
 * @param {string} params.cueText 倾向描述文案。
 * @returns {string} 题干文本。
 */
function buildLikertQuestionTitle({ sceneText, cueText }) {
  const normalizedCueText = String(cueText ?? "")
    .trim()
    .replace(/[。！？!?]+$/g, "");
  // 关键逻辑：场景句已包含时间语义（如“...时”），首句出现“我通常...”会冗余，统一压缩为“我...”。
  const refinedCueText = normalizedCueText.replace(/^我通常/, "我");
  return `${sceneText}，${refinedCueText}。`;
}

/**
 * 题目选项文案口语化替换规则：
 * 关键逻辑：只改展示文本，不改题目向量与评分逻辑，保证结果稳定性。
 */
const OPTION_LABEL_SIMPLIFY_RULES = [
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
  const generatedQuestions = [];

  for (let questionIndex = 0; questionIndex < testConfig.poolSize; questionIndex += 1) {
    const questionId = `${testConfig.key}-q-${String(questionIndex + 1).padStart(3, "0")}`;
    const selectedOutcome = pickOutcomeForLikertQuestion(testConfig.outcomes, questionIndex);
    if (!selectedOutcome) {
      continue;
    }

    const cueIndex = Math.floor(questionIndex / outcomeCount) % selectedOutcome.cues.length;
    const normalizedCueText = simplifyOptionLabel(selectedOutcome.cues[cueIndex], testConfig.key);
    const sceneText = resolveQuestionScene(testConfig, questionIndex);

    generatedQuestions.push({
      id: questionId,
      title: buildLikertQuestionTitle({
        sceneText,
        cueText: normalizedCueText,
      }),
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
    poolSize: 140,
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
    poolSize: 84,
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
        label: "领航者",
        // 关键逻辑：社会人格选项采用第一人称动作句，降低术语感并提升可读性。
        cues: [
          "我会先定方向，再带着大家推进",
          "我愿意把人和事协调起来",
          "我喜欢先把任务排好，再快速推动执行",
        ],
        summary: "擅长定方向、起节奏与带队推进。",
        tags: ["组织力", "推进力", "决策性"],
        actions: ["留出讨论缓冲，避免压制他人节奏", "把决策依据公开化", "建立可继任的流程"],
      },
      {
        key: "s-bridge",
        label: "连接者",
        cues: ["我会先把关键的人连起来", "我擅长找到双方都能接受的说法", "我通常先沟通搭桥，再推进事情"],
        summary: "擅长联结资源与修复关系。",
        tags: ["关系敏感", "协同", "沟通"],
        actions: ["避免过度迎合", "关键议题写明边界", "把关系资产转成项目资产"],
      },
      {
        key: "s-analyst",
        label: "观察者",
        cues: ["我会先观察，再决定要不要参与", "我更看重信息是否真实准确", "我倾向少打扰、少发言，但判断尽量准确"],
        summary: "擅长评估局势与结构洞察。",
        tags: ["判断力", "信息过滤", "冷静"],
        actions: ["提高公开表达频次", "洞察配合行动建议输出", "给决策设置时限"],
      },
      {
        key: "s-guardian",
        label: "守序者",
        cues: ["我会先稳住规则和边界", "我看重说到做到、前后一致", "我不喜欢协作方式太混乱"],
        summary: "擅长维持秩序与系统可靠性。",
        tags: ["稳定", "规则", "责任"],
        actions: ["在变动场景保持弹性", "识别“必要破例”", "优化规则解释成本"],
      },
      {
        key: "s-explorer",
        label: "开拓者",
        cues: ["我会先试一试，再慢慢收口", "到新场合我会主动破冰聊天", "我更喜欢变化多一点的社交节奏"],
        summary: "擅长打开新局与探索机会。",
        tags: ["探索", "灵活", "机会感"],
        actions: ["建立收口机制", "减少目标切换频率", "把灵感转为迭代清单"],
      },
      {
        key: "s-support",
        label: "支持者",
        cues: ["我会先让团队状态稳定下来", "缺人手时我愿意补位把事做完", "我更习惯在幕后支持团队"],
        summary: "擅长托底执行与持续协同。",
        tags: ["稳定输出", "耐心", "配合度"],
        actions: ["主动争取可见度", "明确个人成长议程", "避免长期隐形劳动"],
      },
    ],
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
    poolSize: 84,
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
        cues: ["价值观一致优先", "节奏稳定比刺激更重要", "愿意长期经营与共建"],
        summary: "追求长期可靠、可成长的关系结构。",
        tags: ["稳定", "责任", "长期主义"],
        actions: ["明确双方成长目标", "建立定期沟通机制", "保留独立空间"],
      },
      {
        key: "i-passion",
        label: "高能吸引型",
        cues: ["化学反应与激情优先", "偏好强烈表达", "希望关系有持续新鲜感"],
        summary: "追求高强度连接与情绪共振。",
        tags: ["热度", "表达", "新鲜感"],
        actions: ["设置冲突降温机制", "把激情转为日常连接动作", "减少情绪化决策"],
      },
      {
        key: "i-growth",
        label: "共同成长型",
        cues: ["希望彼此推动进步", "会重视目标与能力匹配", "看重“并肩升级”"],
        summary: "追求互相成就与阶段成长。",
        tags: ["成长", "目标", "互相赋能"],
        actions: ["定期共识复盘", "避免把关系工具化", "给亲密留白"],
      },
      {
        key: "i-healing",
        label: "温柔疗愈型",
        cues: ["情绪承接能力优先", "偏好高质量陪伴", "在意是否被理解"],
        summary: "追求高共情和被接住感。",
        tags: ["共情", "情绪价值", "安全感"],
        actions: ["明确需求而非让对方猜", "避免过度依赖情绪确认", "建立现实层面协作"],
      },
      {
        key: "i-freedom",
        label: "自由同频型",
        cues: ["彼此独立又同频", "尊重边界和空间", "不喜欢过度捆绑"],
        summary: "追求边界清晰的轻负担亲密。",
        tags: ["独立", "边界", "松弛"],
        actions: ["设定连接仪式感", "关键议题及时沟通", "避免长期回避承诺"],
      },
      {
        key: "i-partner",
        label: "现实搭档型",
        cues: ["重视执行与生活能力", "偏好务实合作", "看重责任分担"],
        summary: "追求生活层面的高匹配伙伴关系。",
        tags: ["务实", "协作", "稳定产出"],
        actions: ["避免只看功能忽视情感", "明确财务与分工规则", "定期更新共同目标"],
      },
    ],
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
    poolSize: 80,
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
    poolSize: 80,
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
    poolSize: 80,
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
    poolSize: 80,
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
    poolSize: 80,
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
    modes: [createMode("core24", "24题", 24)],
    poolSize: 40,
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
    poolSize: 80,
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
