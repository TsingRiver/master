/**
 * 十六型人格题库（公开改编版，非官方版权原题）：
 * 1. 题库基于 MBTI 四维度常见公开测评框架改编（E/I、S/N、T/F、J/P）。
 * 2. 提供两个版本：120 题专业版、36 题速测版。
 * 3. 每题统一 4 档同意度选项，便于稳定计算维度倾向。
 */

/**
 * MBTI 轴顺序。
 */
const MBTI_AXIS_KEYS = ["ei", "sn", "tf", "jp"];

/**
 * 维度字母配置。
 */
const MBTI_DIMENSION_CONFIG = {
  ei: {
    positiveLabel: "E",
    negativeLabel: "I",
  },
  sn: {
    positiveLabel: "N",
    negativeLabel: "S",
  },
  tf: {
    positiveLabel: "T",
    negativeLabel: "F",
  },
  jp: {
    positiveLabel: "J",
    negativeLabel: "P",
  },
};

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
 * 构建 4 档同意度选项。
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
      label: "非常符合",
      vector: createAxisVector(dimensionTag, strong),
    },
    {
      id: `${id}-option-b`,
      label: "比较符合",
      vector: createAxisVector(dimensionTag, mild),
    },
    {
      id: `${id}-option-c`,
      label: "不太符合",
      vector: createAxisVector(dimensionTag, -mild),
    },
    {
      id: `${id}-option-d`,
      label: "完全不符合",
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
    description: `按第一反应作答（${MBTI_DIMENSION_CONFIG[dimensionTag].positiveLabel}/${MBTI_DIMENSION_CONFIG[dimensionTag].negativeLabel} 维度）`,
    weight,
    dimensionTag,
    options: buildLikertOptions({ id, dimensionTag, direction }),
  };
}

/**
 * 题干模板库：
 * 结构说明：
 * 1. positive：同意指向维度正向字母（例如 E、N、T、J）。
 * 2. negative：同意指向维度反向字母（例如 I、S、F、P）。
 * 3. 每个维度 30 题（15 + 15），四维共 120 题。
 */
const QUESTION_TEMPLATES = {
  ei: {
    positive: [
      "参加多人活动后，你通常会更有精神。",
      "见到新同事时，你往往会先主动打招呼。",
      "讨论中你更习惯边说边整理思路。",
      "周末你更愿意约人见面而不是单独待着。",
      "团队会议里你通常会较早表达观点。",
      "你在群聊中通常比较活跃。",
      "临时聚会邀请到来时，你多半愿意参加。",
      "你喜欢把想法先讲出来再一起完善。",
      "你更偏好多人协作完成任务。",
      "你在公开场合表达通常比较自然。",
      "你常常愿意承担小组发起或主持角色。",
      "你进入新圈子后通常能较快熟络。",
      "你更喜欢现场交流而不是长文字沟通。",
      "你觉得热闹氛围能明显提升状态。",
      "比起长时间独处，你更愿意和人互动。",
    ],
    negative: [
      "连续社交后，你通常需要独处恢复精力。",
      "你更喜欢先把想法想清楚再开口。",
      "比起多人场合，你更偏好一对一交流。",
      "周末你更愿意安排安静的个人时间。",
      "你在群聊里常常是潜水观察型。",
      "突发邀约出现时，你通常会先犹豫。",
      "会议中你更习惯先听完再发言。",
      "你在安静环境里效率通常更高。",
      "你更看重少量但深入的人际关系。",
      "你不太喜欢频繁的寒暄式社交。",
      "你更常通过文字表达复杂想法。",
      "你在人际中更重视边界和留白。",
      "进入新环境时你通常先观察再参与。",
      "你不喜欢长时间处于高频互动状态。",
      "你通常需要稳定的个人空间来充电。",
    ],
  },
  sn: {
    positive: [
      "面对问题时，你常先想整体趋势和可能性。",
      "你会自然联想到“这件事之后会怎样”。",
      "你容易被新观点、新模型吸引。",
      "你常从现象中归纳出背后的模式。",
      "你会主动提出不一样的解法尝试。",
      "讨论时你更在意“为什么”，再到“怎么做”。",
      "你愿意相信直觉提供的方向信号。",
      "你常把不同领域的想法联系起来。",
      "你偏好开放式问题而非标准答案题。",
      "在不确定情境下，你仍愿意探索新路径。",
      "你会把具体事件上升成可复用框架。",
      "你对前沿趋势和新方法保持好奇。",
      "你喜欢思考“如果这样会怎样”的分支。",
      "你对战略层面的话题有持续兴趣。",
      "你常从长期意义角度理解当前选择。",
    ],
    negative: [
      "你做决定时更信任可验证的事实和数据。",
      "你通常先看眼前细节，再谈远期方向。",
      "你偏好步骤明确、边界清晰的任务。",
      "你更依赖实践经验而非抽象推演。",
      "你习惯先解决当下问题，再考虑扩展。",
      "你更愿意沿用成熟流程而不是频繁换法。",
      "抽象讨论过久时你会希望尽快落地。",
      "你擅长把复杂目标拆成具体执行项。",
      "你更关注时间成本和现实可行性。",
      "遇事时你常先问“具体怎么做”。",
      "你喜欢有清晰标准和完成定义的工作。",
      "你更重视当下可交付结果而非远期愿景。",
      "你习惯记录具体事实而不是抽象感受。",
      "你在未知场景中更倾向先求稳。",
      "你偏好有参考样例的任务输入。",
    ],
  },
  tf: {
    positive: [
      "你做决定时更看重逻辑一致和标准统一。",
      "讨论中你会直接指出论证漏洞。",
      "你认为公平规则比个人偏好更重要。",
      "当效率和情绪冲突时，你常优先效率。",
      "你会尽量把个人情绪与判断分开。",
      "你喜欢围绕观点本身进行辩论。",
      "你强调“对事不对人”的沟通方式。",
      "你提供反馈时通常比较直接。",
      "你评估方案时更看结果和成本。",
      "你偏好结构化结论而非模糊共识。",
      "冲突场景里你通常先回到规则。",
      "你更重视原则一致性而非临时妥协。",
      "你常先判断方案是否合理，再谈感受。",
      "你在协作中更看重能力匹配度。",
      "你做选择时会自然做成本收益比较。",
    ],
    negative: [
      "你做决定时会优先考虑相关人的感受。",
      "你会尽量兼顾关系和结果的平衡。",
      "你表达不同意见时会先照顾对方情绪。",
      "你更愿意先维持团队和谐氛围。",
      "你评价他人时更看重动机和善意。",
      "你对他人情绪变化通常比较敏感。",
      "出现冲突时你会先尝试缓和关系。",
      "你习惯先听懂对方情绪再回应观点。",
      "你认为价值观一致比逻辑压制更关键。",
      "你常通过鼓励而不是批评推动行动。",
      "你在拒绝别人时会特别注意语气。",
      "你习惯换位思考后再下结论。",
      "你更在意“是否被理解”而不只“是否正确”。",
      "合作里你会主动照顾团队情绪温度。",
      "你觉得长期关系质量是重要决策条件。",
    ],
  },
  jp: {
    positive: [
      "你习惯先排计划，再进入执行。",
      "你做任务时会设节点并按节点推进。",
      "重要事项你通常会提前完成。",
      "你偏好把工作区维持在可控有序状态。",
      "你的日程安排通常比较清晰。",
      "计划变更时你会先重排节奏再继续。",
      "你不喜欢临时拖延到最后时刻。",
      "你偏好确定性较高的推进方式。",
      "有截止日期时你常提前预留缓冲。",
      "你倾向完成一个任务后再开新任务。",
      "旅行或出差前你习惯提前做准备。",
      "你对交付节奏和验收标准比较敏感。",
      "你喜欢规则明确的协作流程。",
      "你会定期复盘并调整下一阶段计划。",
      "做出决定后你通常会快速落地执行。",
    ],
    negative: [
      "你更享受临场调整和边走边看。",
      "你常同时推进多个可能方向。",
      "你经常等灵感到位再开始。",
      "你的计划会在执行中不断变化。",
      "你认为保留弹性比早定死更重要。",
      "你不太喜欢被固定流程限制。",
      "你常在截止前集中冲刺完成。",
      "你偏好先探索再收口，而非先收口再探索。",
      "你不喜欢把行程安排得过细。",
      "你乐于尝试未验证的新路线。",
      "你会因新信息及时调整原计划。",
      "面对未知时你反而更容易兴奋。",
      "你擅长随机应变而非严格照表执行。",
      "你的工作节奏常呈现波段式变化。",
      "你不喜欢过早把方案定稿。",
    ],
  },
};

/**
 * 按维度交错合并题目组：
 * 关键逻辑：交错排序可避免同维题连续过多，提高作答体验。
 * 复杂度评估：O(N)，N 为题目总数。
 * @param {Array<Array<object>>} questionGroups 题目组列表。
 * @returns {Array<object>} 交错后的题目数组。
 */
function interleaveQuestionGroups(questionGroups) {
  const workingGroups = questionGroups.map((group) => [...group]);
  const mergedQuestions = [];
  let hasRemaining = true;

  while (hasRemaining) {
    hasRemaining = false;

    for (const group of workingGroups) {
      if (group.length === 0) {
        continue;
      }

      mergedQuestions.push(group.shift());
      hasRemaining = true;
    }
  }

  return mergedQuestions;
}

/**
 * 由模板构建维度题目集合。
 * @param {"ei"|"sn"|"tf"|"jp"} axisKey 维度键。
 * @returns {{ positive: Array<object>, negative: Array<object> }} 该维度题目集合。
 */
function buildAxisQuestionSet(axisKey) {
  const axisTemplates = QUESTION_TEMPLATES[axisKey];

  const positiveQuestions = axisTemplates.positive.map((title, index) =>
    buildQuestion({
      id: `mbti-${axisKey}-p-${String(index + 1).padStart(2, "0")}`,
      title,
      dimensionTag: axisKey,
      direction: 1,
      weight: 1,
    }),
  );

  const negativeQuestions = axisTemplates.negative.map((title, index) =>
    buildQuestion({
      id: `mbti-${axisKey}-n-${String(index + 1).padStart(2, "0")}`,
      title,
      dimensionTag: axisKey,
      direction: -1,
      weight: 1,
    }),
  );

  return {
    positive: positiveQuestions,
    negative: negativeQuestions,
  };
}

/**
 * 构建 120 题专业版题库。
 * 规则：四个维度各 30 题（15 正向 + 15 反向），总计 120 题。
 * @returns {Array<object>} 120 题题库。
 */
function buildPro120QuestionBank() {
  const axisQuestionGroups = MBTI_AXIS_KEYS.map((axisKey) => {
    const axisSet = buildAxisQuestionSet(axisKey);
    return [...axisSet.positive, ...axisSet.negative];
  });

  return interleaveQuestionGroups(axisQuestionGroups);
}

/**
 * 构建 36 题速测版题库。
 * 规则：四个维度各 9 题（5 正向 + 4 反向），总计 36 题。
 * @returns {Array<object>} 36 题题库。
 */
function buildQuick36QuestionBank() {
  const axisQuestionGroups = MBTI_AXIS_KEYS.map((axisKey) => {
    const axisSet = buildAxisQuestionSet(axisKey);
    return [...axisSet.positive.slice(0, 5), ...axisSet.negative.slice(0, 4)];
  });

  return interleaveQuestionGroups(axisQuestionGroups);
}

/**
 * 120 题专业版题库导出。
 */
export const MBTI_PRO_120_QUESTION_BANK = buildPro120QuestionBank();

/**
 * 36 题速测版题库导出。
 */
export const MBTI_QUICK_36_QUESTION_BANK = buildQuick36QuestionBank();

/**
 * 兼容旧引用：
 * 旧逻辑若仍引用 MBTI_QUESTION_BANK，默认走 36 题速测版。
 */
export const MBTI_QUESTION_BANK = MBTI_QUICK_36_QUESTION_BANK;

