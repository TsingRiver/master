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
    tags: [
      "高敏感",
      "怕失去",
      "确认需求",
      "情绪投入高",
      "关系警觉高",
      "反复确认",
    ],
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
      name: "暖心守护神",
      tag: "暖心守护神",
      brief: "温柔到骨子里，还能接住所有小情绪。",
    },
    avoidant: {
      key: "secure-boundary",
      name: "自在分寸感",
      tag: "自在分寸感",
      brief: "爱得亲密，也给足彼此呼吸的空间。",
    },
    fearful: {
      key: "secure-growth",
      name: "关系修复机",
      tag: "关系修复机",
      brief: "吵架不冷战，越闹反而越恩爱。",
    },
  },
  anxious: {
    secure: {
      key: "anxious-warm",
      name: "恋爱脑本脑",
      tag: "恋爱脑本脑",
      brief: "只要被偏爱，能把真心掏到底。",
    },
    fearful: {
      key: "anxious-alert",
      name: "细节捕手",
      tag: "细节捕手",
      brief: "对方的情绪变化，逃不过你的眼睛。",
    },
    avoidant: {
      key: "anxious-pullpush",
      name: "患得患失精",
      tag: "患得患失精",
      brief: "想贴贴又怕烦，拉扯到自己内耗。",
    },
  },
  avoidant: {
    secure: {
      key: "avoidant-rational",
      name: "高冷行动派",
      tag: "高冷行动派",
      brief: "嘴上不说爱，行动全是偏爱。",
    },
    fearful: {
      key: "avoidant-guarded",
      name: "心墙搭建师",
      tag: "心墙搭建师",
      brief: "不是不爱，是不敢轻易打开心。",
    },
    anxious: {
      key: "avoidant-coldwarm",
      name: "嘴硬心软怪",
      tag: "嘴硬心软怪",
      brief: "表面冷若冰霜，内心慌得一批。",
    },
  },
  fearful: {
    anxious: {
      key: "fearful-turbulent",
      name: "缺爱小哭包",
      tag: "缺爱小哭包",
      brief: "想要被抱紧，又怕抱太紧会失去。",
    },
    avoidant: {
      key: "fearful-defensive",
      name: "逃跑小能手",
      tag: "逃跑小能手",
      brief: "刚靠近就想逃，自己跟自己较劲。",
    },
    secure: {
      key: "fearful-healing",
      name: "自愈小太阳",
      tag: "自愈小太阳",
      brief: "遇到对的人，慢慢把不安都抚平。",
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
 * 恋爱底色兜底文案（按主类型映射，2 句话描述恋人特质）。
 */
const LOVE_BASE_COLOR_MAP = {
  secure:
    "你是那种让人安心的恋人，稳定但不乏味。你用行动证明爱，也懂得给彼此呼吸的空间。",
  anxious:
    "你是全情投入的恋人，爱起来不留余地。你对感情高度敏感，回应慢一拍就能让你想很多。",
  avoidant:
    "你是独立酷飒的恋人，靠近不容易但值得。你用自己的方式爱，只是不太习惯把心摊开。",
  fearful:
    "你是矛盾又深情的恋人，想靠近又怕受伤。你的爱像潮汐，涨落之间藏着最真实的渴望。",
};

/**
 * 最适配恋人类型兜底文案（按主类型映射）。
 */
const BEST_MATCH_MAP = {
  secure: "能跟你一起成长、不搞消失也不搞控制的「默契同行者」。",
  anxious: "情绪稳定、主动给反馈、让你不用猜的「安全感发射器」。",
  avoidant: "不粘人、有自己世界、但关键时刻会靠过来的「平行宇宙搭子」。",
  fearful: "有耐心、不轻易放手、能接住你反复拉扯的「定海神针型」。",
};

/**
 * 避雷恋人类型兜底文案（按主类型映射）。
 */
const AVOID_TYPE_MAP = {
  secure: "忽冷忽热、情绪全靠你兜底的「情绪黑洞型」。",
  anxious: "已读不回、从不主动、让你反复自我怀疑的「人间蒸发型」。",
  avoidant: "查岗式关心、每天要报备、让你窒息的「贴身监控型」。",
  fearful: "说走就走、毫无预兆断联的「情感闪退型」。",
};

/**
 * 恋爱忠告兜底文案（按主类型映射）。
 */
const LOVE_ADVICE_MAP = {
  secure: "别因为你扛得住，就忘了自己也需要被心疼。",
  anxious: "你值得被坚定选择，而不是被反复试探后才确认。",
  avoidant: "偶尔让人靠近，不会让你变弱，只会让你被看见。",
  fearful: "先停下来拉扯，问自己一句：你真正害怕的到底是什么？",
};

/**
 * 恋爱能力雷达维度配置（5 维度，满分 10 分）。
 */
const LOVE_RADAR_DIMENSIONS = [
  { key: "initiative", label: "恋爱主动度", pairLabel: "主动追人 / 被动等待" },
  { key: "charm", label: "主动魅力", pairLabel: "很需要陪伴 / 独立不粘人" },
  { key: "attachment", label: "依恋指数", pairLabel: "直球表达 / 闷在心里" },
  {
    key: "emotionTension",
    label: "情绪张力",
    pairLabel: "注重仪式感 / 务实过日子",
  },
  {
    key: "exclusivePreference",
    label: "专属偏爱",
    pairLabel: "爱吃醋 / 很信任对方",
  },
];

/**
 * 雷达维度权重矩阵（正负向并存）：
 * 关键逻辑：同一题答案会同时对不同维度产生“加分 + 减分”影响，避免纯叠加导致分数虚高。
 * 权重含义：
 * - 正值：推动维度得分上升。
 * - 负值：拉低维度得分，形成可争议的低分区间。
 */
const LOVE_RADAR_WEIGHT_MATRIX = {
  initiative: { secure: -0.25, anxious: 1.0, avoidant: -1.15, fearful: 0.45 },
  // 参数校准：降低 charm 维度的负向惩罚强度，避免系统性偏低。
  charm: { secure: 1.0, anxious: -0.6, avoidant: 0.55, fearful: -0.4 },
  // 参数校准：attachment 稍降正负极值，保留争议但减少极端扎堆。
  attachment: { secure: -0.35, anxious: 0.9, avoidant: -0.95, fearful: 0.65 },
  // 参数校准：emotionTension 下调 fearful 正向推动，修复此前整体偏高问题。
  emotionTension: { secure: -0.7, anxious: 0.4, avoidant: -0.3, fearful: 0.75 },
  // 参数校准：exclusivePreference 降低 anxious/fearful 增益，拉回中位分布。
  exclusivePreference: { secure: -0.75, anxious: 0.65, avoidant: -0.45, fearful: 0.55 },
};

/**
 * 将雷达分值限制在 [0, 10]。
 * @param {number} score 原始分值。
 * @returns {number} 合法分值（整数）。
 */
function clampLoveRadarScore(score) {
  if (!Number.isFinite(score)) {
    return 5;
  }
  return Math.max(0, Math.min(10, Math.round(score)));
}

/**
 * 将标准化信号映射为 0~10 雷达分值。
 * 关键逻辑：
 * 1. 先用高斜率 tanh 做极化放大，让强倾向更容易拉开差距。
 * 2. 再对“混合拉扯态”（|signal| 小）施加惩罚，避免中间态普遍高分。
 * 3. 最后给“高确定态”（|signal| 大）少量奖励，形成更有争议性的分布。
 * @param {number} normalizedSignal 标准化信号，理论区间 [-1, 1]。
 * @returns {number} 0~10 分值。
 */
function convertRadarSignalToScore(normalizedSignal) {
  const safeSignal = Number.isFinite(normalizedSignal) ? normalizedSignal : 0;
  const clampedSignal = Math.max(-1, Math.min(1, safeSignal));
  const signalStrength = Math.abs(clampedSignal);

  // 关键逻辑：提高斜率，让正负倾向在 0~10 区间内更快“分层”。
  // 参数校准：轻度降斜率，降低极端分布密度，保留争议性但避免过度两极化。
  const contrastSignal = Math.tanh(clampedSignal * 2.35);
  const baseScore = ((contrastSignal + 1) * 10) / 2;

  // 关键逻辑：答案越拉扯（越接近 0），惩罚越高，压低“平庸高分”。
  const controversyPenalty = Math.pow(1 - signalStrength, 1.25) * 1.45;
  // 关键逻辑：答案越稳定（越接近 ±1），奖励越高，强化“高低两极”。
  const certaintyBonus = Math.pow(signalStrength, 1.35) * 0.5;

  return clampLoveRadarScore(baseScore - controversyPenalty + certaintyBonus);
}

/**
 * 将答卷摘要转为 0-10 分的恋爱能力雷达分值。
 * 推导逻辑：
 * 1. 按题遍历已选答案向量（每道题都会参与计算）。
 * 2. 用“维度权重矩阵”累积正负贡献，形成加减分对冲。
 * 3. 用实际贡献绝对值做归一化，消除题量和权重波动带来的尺度偏差。
 * 4. 用非线性映射输出 0-10 分值，允许出现 0-2 的低分区间。
 * 复杂度评估：O(Q * K * D)，Q=题量，K=向量键数量（固定 4），D=雷达维度数（固定 5）。
 *
 * @param {Array<object>} answerSummary 结构化答卷摘要。
 * @returns {{ initiative: number, charm: number, attachment: number, emotionTension: number, exclusivePreference: number }} 雷达分值。
 */
function buildLoveRadarScores(answerSummary) {
  const signalMap = {
    initiative: 0,
    charm: 0,
    attachment: 0,
    emotionTension: 0,
    exclusivePreference: 0,
  };
  const amplitudeMap = {
    initiative: 0,
    charm: 0,
    attachment: 0,
    emotionTension: 0,
    exclusivePreference: 0,
  };

  (Array.isArray(answerSummary) ? answerSummary : []).forEach((summaryItem) => {
    const questionWeight = Number(summaryItem?.weight ?? 1);
    const vectorEntries = Object.entries(summaryItem?.vector ?? {});

    vectorEntries.forEach(([typeKey, rawTypeValue]) => {
      if (!ATTACHMENT_TYPE_KEYS.includes(typeKey)) {
        return;
      }

      const safeTypeValue = Number(rawTypeValue ?? 0);
      if (!Number.isFinite(safeTypeValue) || safeTypeValue === 0) {
        return;
      }

      LOVE_RADAR_DIMENSIONS.forEach(({ key: dimensionKey }) => {
        const typeWeight = Number(
          LOVE_RADAR_WEIGHT_MATRIX[dimensionKey]?.[typeKey] ?? 0,
        );
        if (typeWeight === 0) {
          return;
        }

        // 关键逻辑：同一答案对维度既可能加分也可能减分，形成真实拉扯。
        const weightedContribution =
          safeTypeValue * questionWeight * typeWeight;
        signalMap[dimensionKey] += weightedContribution;
        amplitudeMap[dimensionKey] += Math.abs(weightedContribution);
      });
    });
  });

  const radarScores = {};
  LOVE_RADAR_DIMENSIONS.forEach(({ key: dimensionKey }) => {
    const totalAmplitude = amplitudeMap[dimensionKey];
    const normalizedSignal =
      totalAmplitude > 0 ? signalMap[dimensionKey] / totalAmplitude : 0;
    radarScores[dimensionKey] = convertRadarSignalToScore(normalizedSignal);
  });

  return radarScores;
}

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

    Object.entries(selectedOption.vector ?? {}).forEach(
      ([vectorKey, rawValue]) => {
        if (typeof rawScoreMap[vectorKey] !== "number") {
          return;
        }

        const safeValue = Number(rawValue ?? 0);
        if (!Number.isFinite(safeValue)) {
          return;
        }

        // 关键逻辑：选项向量分值乘以题目权重，保持重点题影响力。
        rawScoreMap[vectorKey] += safeValue * questionWeight;
      },
    );
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
      ATTACHMENT_PROFILE_MAP[topType.key === "secure" ? "anxious" : "secure"]
        ?.name ?? ATTACHMENT_PROFILE_MAP.anxious.name,
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
    coreTypeName:
      topType.name || ATTACHMENT_PROFILE_MAP[topType.key]?.name || "安全依恋型",
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
  const profile =
    ATTACHMENT_PROFILE_MAP[topType.key] ?? ATTACHMENT_PROFILE_MAP.secure;
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
 * 4. 雷达分值推导（正负向加减分）：O(Q * K * D)
 * 总体复杂度：O(Q * K * D + T log T)
 * 其中 Q 为题量（固定 15），K=4，D=5，T=4。
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
  // 关键逻辑：雷达分值严格按“每题答案向量 + 正负权重”计算，不使用 AI 估算值。
  const radarScores = buildLoveRadarScores(answerSummary);

  const topType = distribution[0] ?? {
    key: "secure",
    name: ATTACHMENT_PROFILE_MAP.secure.name,
    color: ATTACHMENT_PROFILE_MAP.secure.color,
    score: 0,
    rawScore: 0,
  };

  const mainKey = topType.key;

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
    // 新增：恋爱能力雷达分值（5 维度，0-10 分，可出现低分）
    radarScores,
    // 新增：恋爱底色文案（2 句话）
    loveBaseColor: LOVE_BASE_COLOR_MAP[mainKey] ?? LOVE_BASE_COLOR_MAP.secure,
    // 新增：最适配恋人文案
    bestMatch: BEST_MATCH_MAP[mainKey] ?? BEST_MATCH_MAP.secure,
    // 新增：避雷类型文案
    avoidType: AVOID_TYPE_MAP[mainKey] ?? AVOID_TYPE_MAP.secure,
    // 新增：一句恋爱忠告
    loveAdvice: LOVE_ADVICE_MAP[mainKey] ?? LOVE_ADVICE_MAP.secure,
  };
}
