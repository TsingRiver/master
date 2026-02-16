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
    tags: ["稳定连接", "边界清晰", "敢沟通", "可修复", "高安全感", "关系韧性"],
    familyPortrait:
      "家里通常至少有一位情绪上可接近的照料者：你难过时会被安抚，你表达时会被听见。即便家人风格不同，家庭整体仍倾向“先沟通再修复”，让你更早建立了“关系可被修好”的底层感受。",
    familyPortraitPoints: [
      "家里常见场景是：你情绪上来时，至少一位大人会停下来听你说。",
      "父母或主要照料者在冲突后更倾向解释和修补，而非长期冷战。",
      "家庭规则虽然存在要求，但通常会说明原因，边界相对清晰。",
      "你从家庭互动里学到：亲密是安全的，分歧也可以被讨论。",
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
    tags: ["高敏感", "怕失去", "确认需求", "情绪投入高", "关系警觉高", "反复确认"],
    familyPortrait:
      "家里可能出现过“回应忽近忽远”的照料模式：有时很亲近，有时突然冷下来。你需要靠表现、懂事或反复确认，才能换来稳定关注，这会让你对关系温度变化异常敏感。",
    familyPortraitPoints: [
      "家里某位重要照料者回应节奏不稳定，今天靠近、明天疏离。",
      "你可能从小习惯先“做对、做好”，再争取被看见和被安慰。",
      "家庭对情绪的接纳不连续，安慰常取决于对方当下状态。",
      "你因此学会了先盯紧关系，再考虑自己的真实感受。",
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
    tags: ["独立", "怕束缚", "低暴露", "理性自保", "情绪克制", "高边界"],
    familyPortrait:
      "家里可能有一位“情感隐形人”：ta 不一定打骂，但常缺席你的情绪时刻。你难过时得到的是道理和要求，不是安慰与承接。久而久之，你学会了“靠自己最安全”。",
    familyPortraitPoints: [
      "家里可能重结果轻感受，情绪话题经常被快速跳过或打断。",
      "当你脆弱时，家庭反馈常是“自己处理”，求助容易被视为麻烦。",
      "家庭沟通偏功能化：学习、工作能聊，委屈和害怕不太能聊。",
      "你因此把独立当成盔甲，用距离来避免再次失望。",
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
    tags: ["矛盾拉扯", "怕亲密", "怕失去", "高波动", "靠近又逃离", "高触发"],
    familyPortrait:
      "家庭里可能同时存在“给温暖的人”和“制造压力的人”，或者同一位照料者忽冷忽热。你靠近时可能被刺痛，后退时又想被理解，这种双重体验让亲密与防御长期并存。",
    familyPortraitPoints: [
      "家里关系氛围可能忽冷忽热，亲密与冲突切换速度很快。",
      "某位长辈一边给关心一边给压力，让你靠近时也保持紧绷。",
      "家庭处理矛盾时可能出现爆发、指责或突然断联。",
      "你在家庭脚本中学到“想靠近又要防备”，形成拉扯式自保。",
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
 * 依恋亚型映射：
 * 关键逻辑：在 4 大核心依恋类型基础上，使用“主类型 + 次类型”形成 12 个细分亚型，
 * 既保持理论稳定性，也让结果更具个体区分度。
 */
const ATTACHMENT_SUBTYPE_MAP = {
  secure: {
    anxious: {
      key: "secure-empathic",
      name: "共情守护型",
      tag: "稳中带敏",
      brief: "你整体稳定，同时对关系细节敏感，擅长在照顾与边界间找平衡。",
    },
    avoidant: {
      key: "secure-boundary",
      name: "边界稳健型",
      tag: "稳定独立",
      brief: "你重视亲密也重视空间，关系推进更看重节奏与实际行动的一致性。",
    },
    fearful: {
      key: "secure-growth",
      name: "修复成长型",
      tag: "修复驱动",
      brief: "你能在波动里回到理性协商，愿意通过复盘和修复提升关系质量。",
    },
  },
  anxious: {
    secure: {
      key: "anxious-warm",
      name: "投入共情型",
      tag: "高投入高感知",
      brief: "你情感投入度高、愿意靠近，若获得稳定反馈，关系表现会非常正向。",
    },
    fearful: {
      key: "anxious-alert",
      name: "高敏守望型",
      tag: "高警觉",
      brief: "你对关系温度变化很敏锐，容易先预判风险，需要更稳定的安全锚点。",
    },
    avoidant: {
      key: "anxious-pullpush",
      name: "追退拉扯型",
      tag: "拉扯循环",
      brief: "你一方面想要确认连接，一方面又怕受伤，容易出现“靠近-担忧-后撤”。",
    },
  },
  avoidant: {
    secure: {
      key: "avoidant-rational",
      name: "理性边界型",
      tag: "独立理性",
      brief: "你擅长保持冷静和独立，在关系里更偏向先处理事实再处理情绪。",
    },
    fearful: {
      key: "avoidant-guarded",
      name: "防御观察型",
      tag: "防御先行",
      brief: "你在高压场景会优先自保，情绪暴露阈值高，需要更温和的信任建立路径。",
    },
    anxious: {
      key: "avoidant-coldwarm",
      name: "冷暖切换型",
      tag: "外冷内敏",
      brief: "你表面克制、内在敏感，关系里常通过“保持距离”来维持掌控感。",
    },
  },
  fearful: {
    anxious: {
      key: "fearful-turbulent",
      name: "情绪湍流型",
      tag: "靠近又担忧",
      brief: "你既强烈渴望连接又担心受伤，情绪波动常与关系不确定感绑定出现。",
    },
    avoidant: {
      key: "fearful-defensive",
      name: "矛盾防御型",
      tag: "想靠近又逃离",
      brief: "你在亲密中更容易启动双重防御，常在表达与撤离之间快速切换。",
    },
    secure: {
      key: "fearful-healing",
      name: "重建安全型",
      tag: "修复式成长",
      brief: "你有明显的自我觉察和修复意愿，稳定关系节奏后改善速度通常很快。",
    },
  },
};

/**
 * 依恋亚型默认兜底映射。
 */
const ATTACHMENT_SUBTYPE_DEFAULT_MAP = {
  secure: ATTACHMENT_SUBTYPE_MAP.secure.anxious,
  anxious: ATTACHMENT_SUBTYPE_MAP.anxious.secure,
  avoidant: ATTACHMENT_SUBTYPE_MAP.avoidant.secure,
  fearful: ATTACHMENT_SUBTYPE_MAP.fearful.anxious,
};

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
 * 计算依恋结果强度等级。
 * 复杂度评估：O(1)
 * @param {number} topScore 主类型占比。
 * @param {number} gapScore 主次类型分差。
 * @returns {{ label: string, description: string }} 强度信息。
 */
function resolveAttachmentIntensity(topScore, gapScore) {
  if (topScore >= 36 || gapScore >= 14) {
    return {
      label: "高",
      description: "你的主导模式非常清晰，在多数亲密场景会稳定出现。",
    };
  }

  if (topScore >= 30 || gapScore >= 8) {
    return {
      label: "中",
      description: "你有较明显倾向，但在不同关系阶段会出现一定波动。",
    };
  }

  return {
    label: "轻",
    description: "你的模式更接近平衡型，实际表现会随关系对象与情境变化。",
  };
}

/**
 * 根据分布推导细分依恋亚型。
 * 复杂度评估：O(T)
 * T 为类型数量（固定 4）。
 * @param {Array<{ key: string, name: string, score: number }>} distribution 类型分布列表。
 * @returns {{ coreTypeKey: string, coreTypeName: string, secondaryTypeKey: string, secondaryTypeName: string, subtypeKey: string, subtypeName: string, subtypeTag: string, subtypeBrief: string, signature: string, tendencyGap: number, intensityLabel: string, intensityDescription: string }} 细分亚型结果。
 */
export function deriveAttachmentSubtypeProfile(distribution) {
  const safeDistribution = Array.isArray(distribution)
    ? distribution
        .map((item) => ({
          key: String(item?.key ?? ""),
          name: String(item?.name ?? ""),
          score: Number(item?.score ?? 0),
        }))
        .filter((item) => ATTACHMENT_TYPE_KEYS.includes(item.key))
        .sort((leftItem, rightItem) => rightItem.score - leftItem.score)
    : [];

  const topType = safeDistribution[0] ?? {
    key: "secure",
    name: ATTACHMENT_PROFILE_MAP.secure.name,
    score: 0,
  };
  const secondaryType = safeDistribution[1] ?? {
    key: topType.key === "secure" ? "anxious" : "secure",
    name:
      ATTACHMENT_PROFILE_MAP[topType.key === "secure" ? "anxious" : "secure"]?.name ??
      ATTACHMENT_PROFILE_MAP.anxious.name,
    score: 0,
  };

  const subtype =
    ATTACHMENT_SUBTYPE_MAP[topType.key]?.[secondaryType.key] ??
    ATTACHMENT_SUBTYPE_DEFAULT_MAP[topType.key] ??
    ATTACHMENT_SUBTYPE_DEFAULT_MAP.secure;

  const tendencyGap = clampPercentage(topType.score - secondaryType.score);
  const intensity = resolveAttachmentIntensity(topType.score, tendencyGap);

  return {
    coreTypeKey: topType.key,
    coreTypeName: topType.name || ATTACHMENT_PROFILE_MAP[topType.key]?.name || "安全依恋型",
    secondaryTypeKey: secondaryType.key,
    secondaryTypeName:
      secondaryType.name ||
      ATTACHMENT_PROFILE_MAP[secondaryType.key]?.name ||
      ATTACHMENT_PROFILE_MAP.anxious.name,
    subtypeKey: subtype.key,
    subtypeName: subtype.name,
    subtypeTag: subtype.tag,
    subtypeBrief: subtype.brief,
    signature: `${topType.name || ATTACHMENT_PROFILE_MAP[topType.key]?.name} · ${subtype.name}`,
    tendencyGap,
    intensityLabel: intensity.label,
    intensityDescription: intensity.description,
  };
}

/**
 * 生成本地说明文本。
 * @param {object} topType 主类型对象。
 * @param {object} subtypeProfile 细分亚型信息。
 * @returns {string} 本地说明。
 */
function buildLocalNarrative(topType, subtypeProfile) {
  const profile = ATTACHMENT_PROFILE_MAP[topType.key] ?? ATTACHMENT_PROFILE_MAP.secure;
  const subtypeSummary = subtypeProfile?.subtypeBrief
    ? `细分结果为「${subtypeProfile.subtypeName}」，${subtypeProfile.subtypeBrief}`
    : "";

  return `你的当前主类型是「${profile.name}」。${profile.summary}${subtypeSummary}`;
}

/**
 * 恋爱心理本地分析。
 * 复杂度评估：
 * 1. 原始分值累加：O(Q * K)
 * 2. 类型分布排序：O(T log T)
 * 3. 亚型推导：O(T)
 * 总体复杂度：O(Q * K + T log T)
 * 其中 Q 为题量（固定 15），K=4，T=4。
 * @param {object} params 参数对象。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @returns {{ topType: object, topThree: Array<object>, distribution: Array<object>, rawScoreMap: object, answerSummary: Array<object>, summaryLines: Array<string>, localNarrative: string, subtypeProfile: object, profileMap: object }} 本地分析结果。
 */
export function analyzeLoveAttachmentLocally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const rawScoreMap = buildRawScoreMap(questions, answerIds);
  const distribution = buildDistribution(rawScoreMap);
  const subtypeProfile = deriveAttachmentSubtypeProfile(distribution);

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
    localNarrative: buildLocalNarrative(topType, subtypeProfile),
    subtypeProfile,
    profileMap: ATTACHMENT_PROFILE_MAP,
  };
}
