/**
 * 十六型人格题库（用户自定义版）：
 * 1. 题目来源：用户提供的 outcomeKey 题库（e/i/s/n/t/f/j/p）。
 * 2. 专业版：固定输出 120 题（目标为每个 outcomeKey 15 题，保证维度平衡）。
 * 3. 类型学 quick32 模式使用独立强区分题库，避免与专业版题面同质化。
 * 4. 独立 MBTI 页面仍保持 36 题速测版导出，兼容现有页面逻辑。
 */

/**
 * 版本配置：
 * key 作为组件模式切换标识。
 */
export const MBTI_VERSION_CONFIG = {
  quick36: {
    key: "quick36",
    title: "36题速测版",
    description: "题量更轻，约 4-6 分钟完成。",
    questionCount: 36,
  },
  pro120: {
    key: "pro120",
    title: "120题专业版",
    description: "题量更完整，约 12-18 分钟完成。",
    questionCount: 120,
  },
};

/**
 * MBTI outcomeKey 固定顺序：
 * 关键逻辑：用于题目交错排序，减少同维度连续出现。
 */
const MBTI_OUTCOME_ORDER = ["e", "i", "s", "n", "t", "f", "j", "p"];

/**
 * outcomeKey 到维度向量映射。
 * 关键逻辑：正负方向沿用现有分析器约定。
 */
const OUTCOME_KEY_AXIS_DIRECTION_MAP = {
  e: { dimensionTag: "ei", direction: 1 },
  i: { dimensionTag: "ei", direction: -1 },
  s: { dimensionTag: "sn", direction: -1 },
  n: { dimensionTag: "sn", direction: 1 },
  t: { dimensionTag: "tf", direction: 1 },
  f: { dimensionTag: "tf", direction: -1 },
  j: { dimensionTag: "jp", direction: 1 },
  p: { dimensionTag: "jp", direction: -1 },
};

/**
 * outcomeKey 别名映射：
 * 关键逻辑：兼容不同来源题库键名（如 mbti-e / e），统一到内部标准键。
 */
const OUTCOME_KEY_ALIAS_MAP = {
  "mbti-e": "e",
  "mbti-i": "i",
  "mbti-s": "s",
  "mbti-n": "n",
  "mbti-t": "t",
  "mbti-f": "f",
  "mbti-j": "j",
  "mbti-p": "p",
};

/**
 * 原始题目输入（用户提供）。
 * 格式：title + outcomeKey。
 */
const MBTI_CUSTOM_RAW_ITEMS = [
  { title: "我习惯先行动，再慢慢思考过程。", outcomeKey: "e" },
  { title: "我更喜欢一个人安静地待着充电。", outcomeKey: "i" },
  { title: "社交之后我常常觉得精力被耗尽。", outcomeKey: "i" },
  { title: "和很多人待在一起时我会更有活力。", outcomeKey: "e" },
  { title: "我更愿意听别人说，而不是主动开口。", outcomeKey: "i" },
  { title: "我很容易在人群中成为被关注的人。", outcomeKey: "e" },
  { title: "遇到新朋友，我通常比较被动。", outcomeKey: "i" },
  { title: "我喜欢主动认识有趣的陌生人。", outcomeKey: "e" },
  { title: "我更享受小圈子的深度交流，而非大聚会。", outcomeKey: "i" },
  { title: "热闹的环境能让我快速放松下来。", outcomeKey: "e" },
  { title: "我习惯在心里反复琢磨，不轻易说出来。", outcomeKey: "i" },
  { title: "我想到什么就会直接表达出来。", outcomeKey: "e" },
  { title: "我更关注现实中发生的具体事情。", outcomeKey: "s" },
  { title: "我常常会思考事情背后的意义和可能。", outcomeKey: "n" },
  { title: "我更相信亲眼看到、亲身体验的事。", outcomeKey: "s" },
  { title: "我的想象力很丰富，经常走神。", outcomeKey: "n" },
  { title: "我说话更偏向具体描述，而非抽象比喻。", outcomeKey: "s" },
  { title: "我很容易理解别人没说出口的潜台词。", outcomeKey: "n" },
  { title: "我更在意细节，而不是整体感觉。", outcomeKey: "s" },
  { title: "我习惯先看整体框架，再看细节。", outcomeKey: "n" },
  { title: "我对新鲜事物、未知领域充满好奇。", outcomeKey: "n" },
  { title: "我更喜欢熟悉、稳定、可预测的生活。", outcomeKey: "s" },
  { title: "我容易记住事实和数据。", outcomeKey: "s" },
  { title: "我容易记住画面、感觉和联想。", outcomeKey: "n" },
  { title: "我做决定时更依赖逻辑和客观分析。", outcomeKey: "t" },
  { title: "我做决定时更在意感受和人际关系。", outcomeKey: "f" },
  { title: "我认为公正比和谐更重要。", outcomeKey: "t" },
  { title: "我认为和谐比绝对公正更重要。", outcomeKey: "f" },
  { title: "批评时我会直接指出问题，不绕弯。", outcomeKey: "t" },
  { title: "批评时我会照顾对方情绪，委婉表达。", outcomeKey: "f" },
  { title: "我不容易被情绪影响判断。", outcomeKey: "t" },
  { title: "我很容易被别人的情绪带动。", outcomeKey: "f" },
  { title: "我更看重效率，而不是别人的脸色。", outcomeKey: "t" },
  { title: "我会为了照顾别人感受而妥协。", outcomeKey: "f" },
  { title: "我习惯先分析对错，再考虑心情。", outcomeKey: "t" },
  { title: "我习惯先照顾心情，再理性沟通。", outcomeKey: "f" },
  { title: "别人评价我：理性、客观、冷静。", outcomeKey: "t" },
  { title: "别人评价我：温柔、体贴、共情强。", outcomeKey: "f" },
  { title: "我喜欢把生活安排得井井有条。", outcomeKey: "j" },
  { title: "我喜欢随性、自由、不被计划束缚。", outcomeKey: "p" },
  { title: "事情确定下来我才会安心。", outcomeKey: "j" },
  { title: "临时改变计划我也能轻松接受。", outcomeKey: "p" },
  { title: "我习惯提前做好准备，不喜欢拖延。", outcomeKey: "j" },
  { title: "我经常在最后关头才爆发效率。", outcomeKey: "p" },
  { title: "我喜欢列清单、做规划。", outcomeKey: "j" },
  { title: "太多计划会让我觉得压抑。", outcomeKey: "p" },
  { title: "我做事有始有终，追求完成。", outcomeKey: "j" },
  { title: "我喜欢开始新项目，享受过程。", outcomeKey: "p" },
  { title: "deadline 能让我更专注。", outcomeKey: "j" },
  { title: "我讨厌被 deadline 逼得很紧。", outcomeKey: "p" },
  { title: "我不喜欢变数，希望一切可控。", outcomeKey: "j" },
  { title: "意外和惊喜让生活更有趣。", outcomeKey: "p" },
  { title: "我在团队里更愿意主动牵头。", outcomeKey: "e" },
  { title: "我在团队里更愿意做配合者。", outcomeKey: "i" },
  { title: "我学习时更偏向动手实践。", outcomeKey: "s" },
  { title: "我学习时更偏向理解原理。", outcomeKey: "n" },
  { title: "我很难接受不符合逻辑的事。", outcomeKey: "t" },
  { title: "我很难接受让别人不舒服的事。", outcomeKey: "f" },
  { title: "我出门前一定会提前收拾好东西。", outcomeKey: "j" },
  { title: "我出门前经常临时找东西。", outcomeKey: "p" },
  { title: "我喜欢表达自己的真实想法。", outcomeKey: "e" },
  { title: "我习惯把想法藏在心里。", outcomeKey: "i" },
  { title: "我更关注当下的生活品质。", outcomeKey: "s" },
  { title: "我更关注未来的可能性。", outcomeKey: "n" },
  { title: "我讲道理时不太顾及情面。", outcomeKey: "t" },
  { title: "我会为了情面适当妥协道理。", outcomeKey: "f" },
  { title: "我每天的生活节奏比较固定。", outcomeKey: "j" },
  { title: "我每天的生活都不太一样。", outcomeKey: "p" },
  { title: "和人交流时我习惯主动开启话题。", outcomeKey: "e" },
  { title: "和人交流时我习惯等对方开口。", outcomeKey: "i" },
  { title: "我更相信经验和常识。", outcomeKey: "s" },
  { title: "我更相信灵感和直觉。", outcomeKey: "n" },
  { title: "冲突时我优先解决问题。", outcomeKey: "t" },
  { title: "冲突时我优先安抚情绪。", outcomeKey: "f" },
  { title: "我喜欢把东西整理得整齐有序。", outcomeKey: "j" },
  { title: "我东西乱一点，但自己能找到。", outcomeKey: "p" },
  { title: "我喜欢和很多人保持联系。", outcomeKey: "e" },
  { title: "我只和少数人保持深度关系。", outcomeKey: "i" },
  { title: "我描述事情时很具体。", outcomeKey: "s" },
  { title: "我描述事情时比较概括。", outcomeKey: "n" },
  { title: "我不容易被感动。", outcomeKey: "t" },
  { title: "我很容易被感动。", outcomeKey: "f" },
  { title: "我做决策很快且坚定。", outcomeKey: "j" },
  { title: "我做决策比较犹豫，喜欢观望。", outcomeKey: "p" },
  { title: "聚会中我通常是活跃气氛的人。", outcomeKey: "e" },
  { title: "聚会中我通常是安静观察的人。", outcomeKey: "i" },
  { title: "我更在意实际用处。", outcomeKey: "s" },
  { title: "我更在意创意和美感。", outcomeKey: "n" },
  { title: "我认为对事不对人是基本态度。", outcomeKey: "t" },
  { title: "我认为做事也要顾及对方感受。", outcomeKey: "f" },
  { title: "我喜欢按计划一步步完成任务。", outcomeKey: "j" },
  { title: "我喜欢边做边调整节奏。", outcomeKey: "p" },
  { title: "我很容易融入新环境。", outcomeKey: "e" },
  { title: "我进入新环境需要适应时间。", outcomeKey: "i" },
  { title: "我喜欢脚踏实地的生活。", outcomeKey: "s" },
  { title: "我喜欢不切实际的幻想。", outcomeKey: "n" },
  { title: "我说话直接，不爱拐弯。", outcomeKey: "t" },
  { title: "我说话委婉，照顾他人。", outcomeKey: "f" },
  { title: "我讨厌半途而废。", outcomeKey: "j" },
  { title: "我觉得过程比结果更重要。", outcomeKey: "p" },
  { title: "我愿意主动分享情绪和生活。", outcomeKey: "e" },
  { title: "我不太愿意主动分享私生活。", outcomeKey: "i" },
  { title: "我关注细节，容易发现变化。", outcomeKey: "s" },
  { title: "我关注整体，忽略小细节。", outcomeKey: "n" },
  { title: "我能冷静面对批评。", outcomeKey: "t" },
  { title: "我很在意别人的评价。", outcomeKey: "f" },
  { title: "我习惯把事情做完再休息。", outcomeKey: "j" },
  { title: "我习惯边休息边做事。", outcomeKey: "p" },
  { title: "我喜欢认识各种各样的人。", outcomeKey: "e" },
  { title: "我只喜欢和同频的人深交。", outcomeKey: "i" },
  { title: "我更愿意接受看得见的事实。", outcomeKey: "s" },
  { title: "我更愿意相信直觉的判断。", outcomeKey: "n" },
  { title: "我更看重公平合理。", outcomeKey: "t" },
  { title: "我更看重彼此舒服。", outcomeKey: "f" },
  { title: "我喜欢有秩序的生活。", outcomeKey: "j" },
  { title: "我喜欢自由松散的生活。", outcomeKey: "p" },
  { title: "我在人群中不会感到紧张。", outcomeKey: "e" },
  { title: "人太多时我会感到紧张。", outcomeKey: "i" },
  { title: "我是一个很现实的人。", outcomeKey: "s" },
  { title: "我是一个很理想主义的人。", outcomeKey: "n" },
  { title: "我不容易妥协原则。", outcomeKey: "t" },
  { title: "我不容易妥协关系。", outcomeKey: "f" },
  { title: "我喜欢提前规划好每一天。", outcomeKey: "j" },
  { title: "我喜欢跟着感觉过一天。", outcomeKey: "p" },
];

/**
 * MBTI quick32 独立题库输入（用户提供 64 题强区分题面）。
 * 关键逻辑：后续将按 outcomeKey 均衡抽取为 32 题（每类 4 题）。
 */
const MBTI_QUICK_32_RAW_ITEMS = [
  { title: "我更享受和他人相处，独处久了会疲惫。", outcomeKey: "mbti-e" },
  { title: "我喜欢主动社交，乐于认识新朋友。", outcomeKey: "mbti-e" },
  { title: "我习惯把想法说出来，而非藏在心里。", outcomeKey: "mbti-e" },
  { title: "热闹的环境能让我感到精力充沛。", outcomeKey: "mbti-e" },
  { title: "我擅长带动氛围，不害怕当众表达。", outcomeKey: "mbti-e" },
  { title: "遇到问题，我更愿意找人倾诉而非独自消化。", outcomeKey: "mbti-e" },
  { title: "我喜欢参与集体活动，不喜欢独自待着。", outcomeKey: "mbti-e" },
  { title: "我能快速融入新群体，和陌生人轻松搭话。", outcomeKey: "mbti-e" },

  { title: "我更偏爱独处，独处能让我恢复精力。", outcomeKey: "mbti-i" },
  { title: "我不擅长主动社交，更愿意深交少数人。", outcomeKey: "mbti-i" },
  { title: "我习惯先思考再表达，不喜欢即兴发言。", outcomeKey: "mbti-i" },
  { title: "人多的场合会让我感到疲惫和不自在。", outcomeKey: "mbti-i" },
  { title: "我更享受安静的时光，不愿刻意活跃氛围。", outcomeKey: "mbti-i" },
  { title: "遇到问题，我更愿意独自思考解决，而非倾诉。", outcomeKey: "mbti-i" },
  { title: "我不喜欢被过多打扰，需要专属私人空间。", outcomeKey: "mbti-i" },
  { title: "社交后，我需要独处一段时间才能平复状态。", outcomeKey: "mbti-i" },

  { title: "我更关注当下的现实，而非未来的想象。", outcomeKey: "mbti-s" },
  { title: "我习惯从具体事实出发，不喜欢抽象思考。", outcomeKey: "mbti-s" },
  { title: "我注重细节，能发现别人忽略的具体信息。", outcomeKey: "mbti-s" },
  { title: "我喜欢实操性工作，不擅长空泛的理论探讨。", outcomeKey: "mbti-s" },
  { title: "我相信亲眼所见、亲身经历的事情。", outcomeKey: "mbti-s" },
  { title: "我做事喜欢按部就班，基于过往经验推进。", outcomeKey: "mbti-s" },
  { title: "我更关注“是什么”，而非“可能是什么”。", outcomeKey: "mbti-s" },
  { title: "我对具体、可落地的计划更有兴趣。", outcomeKey: "mbti-s" },

  { title: "我更关注未来的可能性，而非当下的现实。", outcomeKey: "mbti-n" },
  { title: "我喜欢抽象思考，乐于探索事物背后的规律。", outcomeKey: "mbti-n" },
  { title: "我不纠结细节，更看重整体和趋势。", outcomeKey: "mbti-n" },
  { title: "我喜欢探讨理论和创意，不喜欢重复的实操。", outcomeKey: "mbti-n" },
  { title: "我常常有奇思妙想，喜欢想象不同的可能性。", outcomeKey: "mbti-n" },
  { title: "我做事喜欢创新，不喜欢按部就班。", outcomeKey: "mbti-n" },
  { title: "我更关注“可能是什么”，而非“是什么”。", outcomeKey: "mbti-n" },
  { title: "我对新鲜创意、未知领域充满好奇。", outcomeKey: "mbti-n" },

  { title: "我做决定更看重逻辑和理性，而非情绪。", outcomeKey: "mbti-t" },
  { title: "我习惯客观分析问题，不被个人情感左右。", outcomeKey: "mbti-t" },
  { title: "我认为公平和原则，比人情更重要。", outcomeKey: "mbti-t" },
  { title: "我擅长理性拆解问题，找到核心解决方案。", outcomeKey: "mbti-t" },
  { title: "我说话直接，更在意对错而非他人感受。", outcomeKey: "mbti-t" },
  { title: "我做选择时，会优先考虑利弊而非喜好。", outcomeKey: "mbti-t" },
  { title: "我能冷静面对批评，只关注合理的建议。", outcomeKey: "mbti-t" },
  { title: "我认为理性和逻辑，能解决大多数问题。", outcomeKey: "mbti-t" },

  { title: "我做决定更看重情绪和人情，而非纯粹逻辑。", outcomeKey: "mbti-f" },
  { title: "我习惯共情他人，容易被情感打动。", outcomeKey: "mbti-f" },
  { title: "我认为人情和关系，比单纯的对错更重要。", outcomeKey: "mbti-f" },
  { title: "我擅长察觉他人情绪，愿意主动安慰。", outcomeKey: "mbti-f" },
  { title: "我说话会顾及他人感受，不喜欢直接批评。", outcomeKey: "mbti-f" },
  { title: "我做选择时，会优先考虑自己和他人的喜好。", outcomeKey: "mbti-f" },
  { title: "他人的批评，容易让我感到难过和受伤。", outcomeKey: "mbti-f" },
  { title: "我认为真诚和善意，比理性更能拉近关系。", outcomeKey: "mbti-f" },

  { title: "我喜欢提前规划，不喜欢突发的变动。", outcomeKey: "mbti-j" },
  { title: "我做事果断，喜欢尽快做出决定并落地。", outcomeKey: "mbti-j" },
  { title: "我习惯按计划推进，讨厌拖延和混乱。", outcomeKey: "mbti-j" },
  { title: "我喜欢有秩序的生活，不喜欢随心所欲。", outcomeKey: "mbti-j" },
  { title: "完成任务后，我才会安心去做其他事情。", outcomeKey: "mbti-j" },
  { title: "我不喜欢模糊的状态，希望事情有明确结果。", outcomeKey: "mbti-j" },
  { title: "我擅长制定计划，并严格按计划执行。", outcomeKey: "mbti-j" },
  { title: "突发情况会让我感到焦虑，难以从容应对。", outcomeKey: "mbti-j" },

  { title: "我不喜欢提前规划，享受随心所欲的状态。", outcomeKey: "mbti-p" },
  { title: "我做事喜欢灵活变通，不急于做出决定。", outcomeKey: "mbti-p" },
  { title: "我习惯随机应变，不喜欢被计划束缚。", outcomeKey: "mbti-p" },
  { title: "我喜欢自由随性的生活，不追求绝对秩序。", outcomeKey: "mbti-p" },
  { title: "我可以边做边调整，不执着于一次性完成任务。", outcomeKey: "mbti-p" },
  { title: "我享受模糊的可能性，不急于得到明确结果。", outcomeKey: "mbti-p" },
  { title: "我不擅长制定固定计划，更喜欢随机发挥。", outcomeKey: "mbti-p" },
  { title: "突发情况能激发我的应变力，我能从容应对。", outcomeKey: "mbti-p" },
];

/**
 * 生成轴零向量。
 * @returns {{ ei: number, sn: number, tf: number, jp: number }} 轴零向量。
 */
function createZeroAxisVector() {
  return {
    ei: 0,
    sn: 0,
    tf: 0,
    jp: 0,
  };
}

/**
 * 创建单维向量。
 * @param {"ei"|"sn"|"tf"|"jp"} dimensionTag 维度标签。
 * @param {number} strength 强度值（允许负值）。
 * @returns {{ ei: number, sn: number, tf: number, jp: number }} 向量对象。
 */
function createAxisVector(dimensionTag, strength) {
  const axisVector = createZeroAxisVector();
  axisVector[dimensionTag] = strength;
  return axisVector;
}

/**
 * 构建 5 档同意度选项。
 * @param {object} params 参数对象。
 * @param {string} params.id 题目 ID。
 * @param {"ei"|"sn"|"tf"|"jp"} params.dimensionTag 维度标签。
 * @param {1|-1} params.direction 方向：1 表示“同意 => 维度正向字母”，-1 反之。
 * @returns {Array<{ id: string, label: string, vector: object }>} 选项数组。
 */
function buildLikertOptions({ id, dimensionTag, direction }) {
  const strong = 2 * direction;
  const mild = 1 * direction;

  return [
    {
      id: `${id}-option-a`,
      label: "非常同意",
      vector: createAxisVector(dimensionTag, strong),
    },
    {
      id: `${id}-option-b`,
      label: "同意",
      vector: createAxisVector(dimensionTag, mild),
    },
    {
      id: `${id}-option-c`,
      label: "中立",
      vector: createAxisVector(dimensionTag, 0),
    },
    {
      id: `${id}-option-d`,
      label: "不太同意",
      vector: createAxisVector(dimensionTag, -mild),
    },
    {
      id: `${id}-option-e`,
      label: "非常不同意",
      vector: createAxisVector(dimensionTag, -strong),
    },
  ];
}

/**
 * 构建单题对象。
 * @param {object} params 参数对象。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题干。
 * @param {"ei"|"sn"|"tf"|"jp"} params.dimensionTag 维度标签。
 * @param {1|-1} params.direction 题目方向。
 * @param {number} [params.weight=1] 题目权重。
 * @returns {{ id: string, title: string, description: string, weight: number, dimensionTag: string, options: Array<object> }} 标准题目对象。
 */
function buildQuestion({ id, title, dimensionTag, direction, weight = 1 }) {
  return {
    id,
    title,
    description: "请根据符合程度作答。",
    weight,
    dimensionTag,
    options: buildLikertOptions({ id, dimensionTag, direction }),
  };
}

/**
 * 规范化题干文本。
 * 复杂度评估：O(L)，L 为题干长度。
 * @param {string} rawTitle 原始题干。
 * @returns {string} 规范化后的题干。
 */
function normalizeQuestionTitle(rawTitle) {
  return String(rawTitle ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 规范化并过滤原始题目。
 * 关键逻辑：
 * 1. 去除空题干或非法 outcomeKey；
 * 2. 按题干去重，避免题面重复；
 * 3. 保留原始顺序，保证题库可追溯。
 * 复杂度评估：O(N * L)，N 为题量，L 为平均题干长度。
 * @param {Array<{title: string, outcomeKey: string}>} rawItems 原始题目数组。
 * @returns {Array<{ title: string, outcomeKey: string, dimensionTag: "ei"|"sn"|"tf"|"jp", direction: 1|-1 }>} 规范化题目。
 */
function normalizeRawItems(rawItems) {
  const safeItems = Array.isArray(rawItems) ? rawItems : [];
  const seenTitleSet = new Set();
  const normalizedItems = [];

  safeItems.forEach((rawItem) => {
    const title = normalizeQuestionTitle(rawItem?.title);
    const outcomeKey = String(rawItem?.outcomeKey ?? "")
      .trim()
      .toLowerCase();
    const normalizedOutcomeKey = OUTCOME_KEY_ALIAS_MAP[outcomeKey] ?? outcomeKey;
    const axisMeta = OUTCOME_KEY_AXIS_DIRECTION_MAP[normalizedOutcomeKey];

    if (!title || !axisMeta || seenTitleSet.has(title)) {
      return;
    }

    seenTitleSet.add(title);
    normalizedItems.push({
      title,
      outcomeKey: normalizedOutcomeKey,
      dimensionTag: axisMeta.dimensionTag,
      direction: axisMeta.direction,
    });
  });

  return normalizedItems;
}

/**
 * 将题目按 outcomeKey 分组。
 * 复杂度评估：O(N)。
 * @param {Array<{ title: string, outcomeKey: string, dimensionTag: string, direction: number }>} questionItems 题目数组。
 * @returns {Map<string, Array<object>>} outcomeKey 分组映射。
 */
function groupQuestionsByOutcome(questionItems) {
  const groupedMap = new Map();
  MBTI_OUTCOME_ORDER.forEach((outcomeKey) => {
    groupedMap.set(outcomeKey, []);
  });

  questionItems.forEach((questionItem) => {
    const targetGroup = groupedMap.get(questionItem.outcomeKey);
    if (!targetGroup) {
      return;
    }
    targetGroup.push(questionItem);
  });

  return groupedMap;
}

/**
 * 交错合并 outcome 分组。
 * 关键逻辑：避免同类题连续出现，提升答题体验。
 * 复杂度评估：O(N)。
 * @param {Map<string, Array<object>>} groupedMap 分组映射。
 * @returns {Array<object>} 交错后的题目数组。
 */
function interleaveOutcomeGroups(groupedMap) {
  const workingGroups = MBTI_OUTCOME_ORDER.map((outcomeKey) => [
    ...(groupedMap.get(outcomeKey) ?? []),
  ]);
  const mergedItems = [];
  let hasRemaining = true;

  while (hasRemaining) {
    hasRemaining = false;

    workingGroups.forEach((groupItems) => {
      if (groupItems.length === 0) {
        return;
      }
      mergedItems.push(groupItems.shift());
      hasRemaining = true;
    });
  }

  return mergedItems;
}

/**
 * 构建 120 题专业版原始题目。
 * 关键逻辑：
 * 1. 优先每个 outcomeKey 取固定配额，目标 15 题 * 8 = 120；
 * 2. 若某类不足，使用其他剩余题补齐到 120（仍去重且稳定顺序）。
 * 复杂度评估：O(N)。
 * @param {Array<{ title: string, outcomeKey: string, dimensionTag: string, direction: number }>} normalizedItems 规范化题目。
 * @returns {Array<object>} 120 题原始题目。
 */
function buildProRawQuestionItems(normalizedItems) {
  const groupedMap = groupQuestionsByOutcome(normalizedItems);
  const selectedGroupedMap = new Map();
  const selectedTitleSet = new Set();
  const PRO_TARGET_COUNT = 120;
  const OUTCOME_TARGET_COUNT = 15;

  MBTI_OUTCOME_ORDER.forEach((outcomeKey) => {
    const sourceItems = groupedMap.get(outcomeKey) ?? [];
    const selectedItems = sourceItems.slice(0, OUTCOME_TARGET_COUNT);
    selectedGroupedMap.set(outcomeKey, selectedItems);
    selectedItems.forEach((item) => {
      selectedTitleSet.add(item.title);
    });
  });

  let proRawItems = interleaveOutcomeGroups(selectedGroupedMap);

  if (proRawItems.length < PRO_TARGET_COUNT) {
    const remainingItems = normalizedItems.filter((item) => !selectedTitleSet.has(item.title));
    for (const remainingItem of remainingItems) {
      if (proRawItems.length >= PRO_TARGET_COUNT) {
        break;
      }
      selectedTitleSet.add(remainingItem.title);
      proRawItems.push(remainingItem);
    }
  }

  return proRawItems.slice(0, PRO_TARGET_COUNT);
}

/**
 * 构建 quick32 速测版原始题目。
 * 关键逻辑：
 * 1. 目标每个 outcomeKey 取 4 题，共 32 题，保证四维两极均衡覆盖；
 * 2. 若个别 outcome 不足，则使用剩余题稳定补齐，仍保持去重。
 * 复杂度评估：O(N)。
 * @param {Array<{ title: string, outcomeKey: string, dimensionTag: string, direction: number }>} normalizedItems 规范化题目。
 * @returns {Array<object>} quick32 原始题目。
 */
function buildQuick32RawQuestionItems(normalizedItems) {
  const groupedMap = groupQuestionsByOutcome(normalizedItems);
  const selectedGroupedMap = new Map();
  const selectedTitleSet = new Set();
  const QUICK_TARGET_COUNT = 32;
  const OUTCOME_TARGET_COUNT = 4;

  MBTI_OUTCOME_ORDER.forEach((outcomeKey) => {
    const sourceItems = groupedMap.get(outcomeKey) ?? [];
    const selectedItems = sourceItems.slice(0, OUTCOME_TARGET_COUNT);
    selectedGroupedMap.set(outcomeKey, selectedItems);
    selectedItems.forEach((item) => {
      selectedTitleSet.add(item.title);
    });
  });

  let quickRawItems = interleaveOutcomeGroups(selectedGroupedMap);

  if (quickRawItems.length < QUICK_TARGET_COUNT) {
    const remainingItems = normalizedItems.filter((item) => !selectedTitleSet.has(item.title));
    for (const remainingItem of remainingItems) {
      if (quickRawItems.length >= QUICK_TARGET_COUNT) {
        break;
      }
      selectedTitleSet.add(remainingItem.title);
      quickRawItems.push(remainingItem);
    }
  }

  return quickRawItems.slice(0, QUICK_TARGET_COUNT);
}

/**
 * 原始题目转标准题库对象。
 * 复杂度评估：O(N)。
 * @param {Array<{ title: string, dimensionTag: "ei"|"sn"|"tf"|"jp", direction: 1|-1 }>} rawItems 原始题目。
 * @returns {Array<object>} 标准题库。
 */
function buildQuestionBankFromRawItems(rawItems) {
  return rawItems.map((rawItem, index) => {
    const questionId = `mbti-custom-${String(index + 1).padStart(3, "0")}`;
    return buildQuestion({
      id: questionId,
      title: rawItem.title,
      dimensionTag: rawItem.dimensionTag,
      direction: rawItem.direction,
      weight: 1,
    });
  });
}

/**
 * 规范化后的完整用户题库。
 */
const MBTI_NORMALIZED_ITEMS = normalizeRawItems(MBTI_CUSTOM_RAW_ITEMS);

/**
 * 120 题专业版原始题集。
 */
const MBTI_PRO_120_RAW_ITEMS = buildProRawQuestionItems(MBTI_NORMALIZED_ITEMS);

/**
 * quick32 规范化后的独立题库。
 */
const MBTI_QUICK_32_NORMALIZED_ITEMS = normalizeRawItems(MBTI_QUICK_32_RAW_ITEMS);

/**
 * quick32 原始题集。
 */
const MBTI_QUICK_32_RAW_ITEMS_SELECTED = buildQuick32RawQuestionItems(
  MBTI_QUICK_32_NORMALIZED_ITEMS,
);

/**
 * 120 题专业版题库导出。
 */
export const MBTI_PRO_120_QUESTION_BANK = buildQuestionBankFromRawItems(
  MBTI_PRO_120_RAW_ITEMS,
);

/**
 * 32 题速测版（类型学 quick32 专用）导出。
 */
export const MBTI_QUICK_32_QUESTION_BANK = buildQuestionBankFromRawItems(
  MBTI_QUICK_32_RAW_ITEMS_SELECTED,
);

/**
 * 36 题速测版题库导出：
 * 关键逻辑：从 120 题稳定截取前 36 题，避免多版本题库不一致导致的测后波动。
 */
export const MBTI_QUICK_36_QUESTION_BANK = MBTI_PRO_120_QUESTION_BANK.slice(0, 36);

/**
 * 兼容旧引用：
 * 旧逻辑若仍引用 MBTI_QUESTION_BANK，默认走 36 题速测版。
 */
export const MBTI_QUESTION_BANK = MBTI_QUICK_36_QUESTION_BANK;
