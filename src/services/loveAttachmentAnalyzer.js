/**
 * 恋爱依恋类型中文信息表：
 * 1. 提供展示名称、标签、分布条颜色。
 * 2. 提供本地兜底文案（概述/原生家庭画像/机制解释）。
 */
const ATTACHMENT_PROFILE_MAP = {
  secure: {
    key: "secure",
    name: "安全依恋型",
    color: "#45A67E",
    summary: "你通常能在亲密与边界之间找到平衡，既敢表达也能稳定修复。",
    tags: ["#稳定连接", "#边界清晰", "#敢沟通", "#可修复", "#高安全感", "#关系韧性"],
    familyPortrait:
      "你的成长环境里大概率出现过“可回应、可依靠”的照顾体验。即使并不完美，你也较早学会了“情绪可以被表达，关系可以被修复”。在冲突后回到连接，对你来说是可行的。",
    familyPortraitPoints: [
      "成长中较常体验到“我表达了，会被听见”。",
      "照顾者在你需要时有较稳定回应，不总是失联式照护。",
      "你较早形成“问题可以谈、关系可修复”的认知。",
      "你对亲密与独立的边界感相对清晰，不容易全有全无。",
    ],
    whyPattern:
      "你对关系的底层预期偏正向：亲密不等于失控，冲突不等于结束，所以你更愿意在问题里寻找协商空间。你能把“情绪波动”与“关系终局”区分开。",
    whyPatternPoints: [
      "你更倾向把冲突视作“信息反馈”，而非“关系崩盘信号”。",
      "你在压力下仍能保留表达与倾听的双向能力。",
      "你对依赖与自主的理解更平衡，不易走极端策略。",
      "你更相信“关系可迭代”，因此修复意愿和执行力较强。",
    ],
    strengths: [
      "冲突后恢复速度较快",
      "能表达需求也能倾听对方",
      "关系稳定性与成长性较高",
      "在边界协商中较少使用攻击或回避",
      "更容易形成长期可持续的亲密节奏",
    ],
    risks: [
      "在长期稳定关系里可能忽略小问题累积",
      "容易承担过多“情绪调停者”角色",
      "对关系过度乐观时可能延后处理关键冲突",
      "在照顾对方时偶尔压低自己的真实需求",
      "把“我能扛”当作默认策略，导致隐性疲惫",
    ],
    actions: [
      "保持“每周一次关系复盘”习惯",
      "在照顾关系的同时同步个人需求",
      "把重要约定写成明确行动而非默认共识",
      "冲突后 24 小时内完成一次简短修复沟通",
      "每月做一次“关系目标对齐”，避免节奏漂移",
      "把“感谢/肯定”作为日常动作，强化正向循环",
    ],
  },
  anxious: {
    key: "anxious",
    name: "焦虑依恋型",
    color: "#F3A45A",
    summary: "你很重视关系连接，但在不确定时容易放大担忧并寻求高频确认。",
    tags: ["#高敏感", "#怕失去", "#确认需求", "#情绪投入高", "#关系警觉高", "#反复确认"],
    familyPortrait:
      "你可能经历过“回应不稳定”或情绪支持时有时无的成长体验，导致你更容易把关系波动解读成“可能被抛下”的信号。你对“关系温度变化”非常敏感。",
    familyPortraitPoints: [
      "成长中“被回应”体验可能存在波动，难以稳定预测。",
      "你可能需要通过表现/努力来争取情感确定感。",
      "关系中的微小变化更容易触发你的警觉系统。",
      "你较早学会“先确认关系，再考虑自己感受”。",
    ],
    whyPattern:
      "当安全感下降时，你会通过加深连接来降低焦虑，但高压确认也可能让关系进入“越追越慌”的循环。你越在乎，越容易把沉默解读成危险。",
    whyPatternPoints: [
      "不确定感会被你的大脑快速放大成“关系风险”。",
      "你倾向用“更多连接”缓解焦虑，而非先做情绪降温。",
      "高投入带来高期望，反馈落差会显著影响状态。",
      "你对关系信号非常敏锐，但有时会过度预测负面结局。",
    ],
    strengths: [
      "共情力强，能快速感知关系变化",
      "投入度高，愿意为关系付出",
      "情感表达直接且真实",
      "对伴侣状态变化有较高觉察能力",
      "在关系经营上有持续投入意愿",
    ],
    risks: [
      "过度确认导致双方沟通疲劳",
      "把短期波动误判为长期关系风险",
      "在焦虑高峰时使用“指责式求安抚”",
      "容易忽略自我节奏，陷入情绪透支",
      "关系问题还未核实就先进入防御反应",
    ],
    actions: [
      "把“担心”转换成具体需求表达",
      "建立自我安抚清单，先稳情绪再沟通",
      "减少“读心”假设，增加事实核对",
      "把确认频率从“实时”改为“约定时段”",
      "出现触发点时先做 10 分钟降温动作",
      "每周记录一次“担忧与事实”的对照复盘",
    ],
  },
  avoidant: {
    key: "avoidant",
    name: "回避依恋型",
    color: "#5F88DF",
    summary: "你重视独立和边界，面对高情绪或高压力亲密场景时更倾向先后撤。",
    tags: ["#独立", "#怕束缚", "#低暴露", "#理性自保", "#情绪克制", "#高边界"],
    familyPortrait:
      "你可能在成长中更早学会“靠自己解决问题”，情绪支持体验相对有限，于是形成了“减少依赖=减少受伤”的保护策略。独立曾经是你的核心生存优势。",
    familyPortraitPoints: [
      "早期可能更常被鼓励“先自己处理”，情绪承接偏少。",
      "你习惯通过理性和效率管理关系压力。",
      "“不麻烦别人”可能长期被强化为默认原则。",
      "你在亲密中容易把“需要帮助”解读为“失去掌控”。",
    ],
    whyPattern:
      "当关系压力上升时，你会优先守住自主感和可控性，这能短期降噪，但也可能让对方感到被隔离。你并非不在乎，而是更习惯先撤退再整理。",
    whyPatternPoints: [
      "压力场景下你会优先降低情绪噪音，减少即时暴露。",
      "你把“保持距离”当作保护关系与保护自己的双重策略。",
      "你偏好在内心完成处理后再表达，导致时差沟通问题。",
      "对自主的高度需求会在亲密推进期被放大。",
    ],
    strengths: [
      "边界意识强，不易情绪化失控",
      "独立解决问题能力高",
      "在高压场景下保持理性",
      "能在复杂局面里保持判断清晰",
      "不容易被短期情绪牵着走",
    ],
    risks: [
      "情感表达不足导致误解累积",
      "用距离代替修复，降低亲密质量",
      "关键时刻沉默撤离，使对方缺乏确定感",
      "把“被需要”误解为“被控制”",
      "长期低暴露导致连接感持续下降",
    ],
    actions: [
      "练习“小剂量情绪表达”而非一次性爆发",
      "冲突中保留最小连接动作（如约定回聊时间）",
      "把“我需要空间”说成可执行的边界信息",
      "每周做一次“需求可见化”训练（哪怕只说一句）",
      "遇到分歧时先给时间点，而不是直接消失",
      "把“独立”升级为“独立但可连接”策略",
    ],
  },
  fearful: {
    key: "fearful",
    name: "焦虑-回避矛盾型",
    color: "#A973DA",
    summary: "你既渴望亲密又害怕受伤，关系中容易出现“靠近-退开”的拉扯循环。",
    tags: ["#矛盾拉扯", "#怕亲密", "#怕失去", "#高波动", "#靠近又逃离", "#高触发"],
    familyPortrait:
      "你的成长体验里可能同时存在“想靠近却不够安全”的信号，比如支持与压力并存、亲密与受伤交替，让你难以稳定建立关系预期。你对关系有很强渴望，也有很强防御。",
    familyPortraitPoints: [
      "成长中可能出现“靠近有温暖，但也伴随风险”的双重体验。",
      "你对关系信号高度敏感，但安全感基础不稳定。",
      "你可能学会了“先试探亲密，再快速自保”。",
      "内在系统常在“想被爱”与“怕受伤”之间摇摆。",
    ],
    whyPattern:
      "当你感到被需要会靠近，一旦触发受伤预警又会撤离，这种双向驱动会让你在关系里反复消耗。你在“信任”与“防御”之间切换很快。",
    whyPatternPoints: [
      "亲密触发你的连接需求，同时也激活风险预警系统。",
      "情绪高峰期容易做“关系终局化”判断。",
      "你对失控和失去都敏感，因此常出现双向拉扯。",
      "缺乏稳定修复节奏时，关系波动会被进一步放大。",
    ],
    strengths: [
      "感受力和洞察力很强",
      "对关系真实度要求高",
      "愿意在关键时刻深度投入",
      "能快速识别关系中的不一致信号",
      "一旦建立安全框架，成长速度很快",
    ],
    risks: [
      "情绪波动导致关系节奏不稳",
      "把“防御”误当成“保护关系”",
      "靠近与撤退频繁切换造成双方困惑",
      "高压时容易过度解读对方行为",
      "在不安场景下忽略事实核对",
    ],
    actions: [
      "先建立稳定节奏，再推进深度承诺",
      "记录触发点，区分当下情绪与真实事实",
      "在高压时优先做“降温沟通”而非“终局判断”",
      "建立“暂停词”和“回聊时间”机制，降低升级冲突",
      "先做小承诺验证安全感，再做大承诺决策",
      "用“我感受到…我需要…”替代指责式表达",
    ],
  },
};

/**
 * 依恋类型键数组。
 */
const ATTACHMENT_TYPE_KEYS = Object.keys(ATTACHMENT_PROFILE_MAP);

/**
 * 创建零分值映射。
 * @returns {{ [key: string]: number }} 零分值对象。
 */
function createZeroScoreMap() {
  return ATTACHMENT_TYPE_KEYS.reduce((accumulator, typeKey) => {
    accumulator[typeKey] = 0;
    return accumulator;
  }, {});
}

/**
 * 构建结构化答卷摘要。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {Array<object>} 答卷摘要。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    return {
      questionId: questionItem.id,
      questionTitle: questionItem.title,
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      weight: Number(questionItem.weight ?? 1),
      vector: selectedOption?.vector ?? {},
    };
  });
}

/**
 * 生成可读摘要文本。
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {Array<string>} 摘要文本列表。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (summaryItem, index) =>
      `${index + 1}. ${summaryItem.questionTitle} -> ${summaryItem.optionLabel}`,
  );
}

/**
 * 累加原始分值。
 * 复杂度评估：O(Q * K)
 * Q 为题量，K 为选项向量键数量（固定 4）。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {{ [key: string]: number }} 原始分值映射。
 */
function buildRawScoreMap(questions, answerIds) {
  const rawScoreMap = createZeroScoreMap();

  questions.forEach((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    if (!selectedOption) {
      return;
    }

    const questionWeight = Number(questionItem.weight ?? 1);

    Object.entries(selectedOption.vector ?? {}).forEach(([vectorKey, rawValue]) => {
      if (typeof rawScoreMap[vectorKey] !== "number") {
        return;
      }

      const safeValue = Number(rawValue ?? 0);
      if (!Number.isFinite(safeValue)) {
        return;
      }

      // 关键逻辑：选项向量分值乘以题目权重，保持重点题影响力。
      rawScoreMap[vectorKey] += safeValue * questionWeight;
    });
  });

  return rawScoreMap;
}

/**
 * 限制百分比分值到 [0, 100]。
 * @param {number} score 原始分值。
 * @returns {number} 合法百分比分值。
 */
function clampPercentage(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Number(score.toFixed(1))));
}

/**
 * 将原始分值映射转为占比分布列表。
 * 复杂度评估：O(T log T)
 * T 为类型数量（固定 4）。
 * @param {{ [key: string]: number }} rawScoreMap 原始分值映射。
 * @returns {Array<object>} 类型分布列表（降序）。
 */
function buildDistribution(rawScoreMap) {
  const totalScore = Math.max(
    1,
    Object.values(rawScoreMap).reduce(
      (sum, rawValue) => sum + (Number(rawValue) || 0),
      0,
    ),
  );

  return ATTACHMENT_TYPE_KEYS.map((typeKey) => {
    const profile = ATTACHMENT_PROFILE_MAP[typeKey];
    const rawScore = Number(rawScoreMap[typeKey] ?? 0);

    return {
      key: typeKey,
      name: profile.name,
      color: profile.color,
      rawScore,
      score: clampPercentage((rawScore / totalScore) * 100),
    };
  }).sort((leftItem, rightItem) => {
    const scoreDiff = rightItem.score - leftItem.score;
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return rightItem.rawScore - leftItem.rawScore;
  });
}

/**
 * 生成本地说明文本。
 * @param {object} topType 主类型对象。
 * @returns {string} 本地说明。
 */
function buildLocalNarrative(topType) {
  const profile = ATTACHMENT_PROFILE_MAP[topType.key] ?? ATTACHMENT_PROFILE_MAP.secure;
  return `你的当前主类型是「${profile.name}」。${profile.summary}`;
}

/**
 * 恋爱心理本地分析。
 * 复杂度评估：
 * 1. 原始分值累加：O(Q * K)
 * 2. 类型分布排序：O(T log T)
 * 总体复杂度：O(Q * K + T log T)
 * 其中 Q 为题量（固定 15），K=4，T=4。
 * @param {object} params 参数对象。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @returns {{ topType: object, topThree: Array<object>, distribution: Array<object>, rawScoreMap: object, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string, profileMap: object }} 本地分析结果。
 */
export function analyzeLoveAttachmentLocally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const rawScoreMap = buildRawScoreMap(questions, answerIds);
  const distribution = buildDistribution(rawScoreMap);

  const topType = distribution[0] ?? {
    key: "secure",
    name: ATTACHMENT_PROFILE_MAP.secure.name,
    color: ATTACHMENT_PROFILE_MAP.secure.color,
    score: 0,
    rawScore: 0,
  };

  return {
    topType,
    topThree: distribution.slice(0, 3),
    distribution,
    rawScoreMap,
    answerSummary,
    summaryLines,
    localNarrative: buildLocalNarrative(topType),
    profileMap: ATTACHMENT_PROFILE_MAP,
  };
}
