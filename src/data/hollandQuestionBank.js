/**
 * 霍兰德职业兴趣题库（用户定制版）：
 * 1. 固定 core60，共 60 题。
 * 2. 六个兴趣维度（RIASEC）均衡覆盖，每类 10 题。
 * 3. 统一 5 档同意度选项，便于与类型学中心统一计分。
 */

/**
 * 霍兰德结果键顺序（固定）。
 * 关键逻辑：用于稳定排序与题目构建，可追溯且可复现。
 */
const HOLLAND_OUTCOME_ORDER = ["h-r", "h-i", "h-a", "h-s", "h-e", "h-c"];

/**
 * 霍兰德 core60 题量。
 */
const HOLLAND_CORE60_COUNT = 60;

/**
 * 用户提供的原始题库条目。
 * 结构：title + outcomeKey。
 */
const HOLLAND_RAW_ITEMS = [
  { title: "我喜欢动手拆装和修理实物。", outcomeKey: "h-r" },
  { title: "我擅长使用各类工具完成任务。", outcomeKey: "h-r" },
  { title: "我喜欢户外体力劳动或实操工作。", outcomeKey: "h-r" },
  { title: "我愿意动手解决实际机械问题。", outcomeKey: "h-r" },
  { title: "我喜欢组装搭建各类物品。", outcomeKey: "h-r" },
  { title: "我擅长维修电器、家具等物品。", outcomeKey: "h-r" },
  { title: "我喜欢从事需要动手操作的工作。", outcomeKey: "h-r" },
  { title: "我愿意参与手工制作类活动。", outcomeKey: "h-r" },
  { title: "我擅长实操性强、流程明确的工作。", outcomeKey: "h-r" },
  { title: "我喜欢亲手完成具体可见的成果。", outcomeKey: "h-r" },

  { title: "我喜欢分析问题并寻找规律。", outcomeKey: "h-i" },
  { title: "我乐于研究未知的事物和现象。", outcomeKey: "h-i" },
  { title: "我擅长逻辑推理和数据分析。", outcomeKey: "h-i" },
  { title: "我喜欢独立思考并解决难题。", outcomeKey: "h-i" },
  { title: "我愿意投入时间做学术研究。", outcomeKey: "h-i" },
  { title: "我对自然科学、社会科学充满兴趣。", outcomeKey: "h-i" },
  { title: "我擅长观察并总结事物的特点。", outcomeKey: "h-i" },
  { title: "我喜欢探索事物背后的原理。", outcomeKey: "h-i" },
  { title: "我愿意严谨分析各类复杂信息。", outcomeKey: "h-i" },
  { title: "我擅长提出假设并验证结论。", outcomeKey: "h-i" },

  { title: "我喜欢创作有美感的内容。", outcomeKey: "h-a" },
  { title: "我擅长绘画、书法或手工创作。", outcomeKey: "h-a" },
  { title: "我喜欢音乐、舞蹈等艺术形式。", outcomeKey: "h-a" },
  { title: "我愿意用文字、图像表达想法。", outcomeKey: "h-a" },
  { title: "我擅长设计有创意的作品。", outcomeKey: "h-a" },
  { title: "我喜欢欣赏各类艺术作品。", outcomeKey: "h-a" },
  { title: "我愿意尝试不同的创作形式。", outcomeKey: "h-a" },
  { title: "我擅长捕捉生活中的美感。", outcomeKey: "h-a" },
  { title: "我喜欢自由发挥，展现创意。", outcomeKey: "h-a" },
  { title: "我愿意从事与艺术相关的工作。", outcomeKey: "h-a" },

  { title: "我愿意帮助他人解决实际困难。", outcomeKey: "h-s" },
  { title: "我擅长与人沟通并倾听他人诉求。", outcomeKey: "h-s" },
  { title: "我喜欢关心身边人的生活状态。", outcomeKey: "h-s" },
  { title: "我愿意参与公益或助人活动。", outcomeKey: "h-s" },
  { title: "我擅长协调人际关系、化解矛盾。", outcomeKey: "h-s" },
  { title: "我喜欢帮助他人成长和进步。", outcomeKey: "h-s" },
  { title: "我愿意主动关心有需要的人。", outcomeKey: "h-s" },
  { title: "我擅长与人合作完成共同目标。", outcomeKey: "h-s" },
  { title: "我喜欢从事服务他人的工作。", outcomeKey: "h-s" },
  { title: "我愿意耐心倾听他人的烦恼并开导。", outcomeKey: "h-s" },

  { title: "我喜欢说服他人并推动结果达成。", outcomeKey: "h-e" },
  { title: "我擅长组织活动并统筹安排。", outcomeKey: "h-e" },
  { title: "我喜欢带领团队完成目标任务。", outcomeKey: "h-e" },
  { title: "我愿意主动争取机会、展现自己。", outcomeKey: "h-e" },
  { title: "我擅长谈判并达成有利共识。", outcomeKey: "h-e" },
  { title: "我喜欢制定计划并推动落地。", outcomeKey: "h-e" },
  { title: "我愿意承担领导责任、做出决策。", outcomeKey: "h-e" },
  { title: "我擅长挖掘机会并实现价值。", outcomeKey: "h-e" },
  { title: "我喜欢与人竞争并争取胜利。", outcomeKey: "h-e" },
  { title: "我愿意主导项目并把控整体进度。", outcomeKey: "h-e" },

  { title: "我喜欢整理信息并按流程执行。", outcomeKey: "h-c" },
  { title: "我擅长细致核对各类数据和资料。", outcomeKey: "h-c" },
  { title: "我喜欢按规则和流程完成工作。", outcomeKey: "h-c" },
  { title: "我愿意整理文件、归类各类信息。", outcomeKey: "h-c" },
  { title: "我擅长严谨细致、有条不紊的工作。", outcomeKey: "h-c" },
  { title: "我喜欢遵循既定规范，不随意变通。", outcomeKey: "h-c" },
  { title: "我愿意完成重复性高、流程固定的任务。", outcomeKey: "h-c" },
  { title: "我擅长记录和整理各类台账。", outcomeKey: "h-c" },
  { title: "我喜欢保持工作环境的整洁有序。", outcomeKey: "h-c" },
  { title: "我愿意按要求精准完成各项工作。", outcomeKey: "h-c" },
];

/**
 * 创建霍兰德向量。
 * 复杂度评估：O(1)。
 * @param {string} outcomeKey 结果键。
 * @param {number} score 分值。
 * @returns {Record<string, number>} 向量对象。
 */
function createHollandVector(outcomeKey, score) {
  return {
    [outcomeKey]: score,
  };
}

/**
 * 构建霍兰德 5 档同意度选项。
 * 复杂度评估：O(1)。
 * @param {string} questionId 题目 ID。
 * @param {string} outcomeKey 结果键。
 * @returns {Array<object>} 选项数组。
 */
function buildHollandOptions(questionId, outcomeKey) {
  return [
    {
      id: `${questionId}-option-a`,
      label: "非常同意",
      vector: createHollandVector(outcomeKey, 4),
    },
    {
      id: `${questionId}-option-b`,
      label: "同意",
      vector: createHollandVector(outcomeKey, 3),
    },
    {
      id: `${questionId}-option-c`,
      label: "中立",
      vector: createHollandVector(outcomeKey, 2),
    },
    {
      id: `${questionId}-option-d`,
      label: "不太同意",
      vector: createHollandVector(outcomeKey, 1),
    },
    {
      id: `${questionId}-option-e`,
      label: "非常不同意",
      vector: createHollandVector(outcomeKey, 0),
    },
  ];
}

/**
 * 规范化题干文本。
 * 复杂度评估：O(L)，L 为题干长度。
 * @param {string} rawTitle 原始题干。
 * @returns {string} 规范化题干。
 */
function normalizeQuestionTitle(rawTitle) {
  return String(rawTitle ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 规范化并去重原始题目。
 * 关键逻辑：
 * 1. 过滤空题干和非法 outcomeKey；
 * 2. 按题干去重，防止重复题面进入正式题库。
 * 复杂度评估：O(N * L)，N 为题量，L 为平均题干长度。
 * @param {Array<{title: string, outcomeKey: string}>} rawItems 原始题目。
 * @returns {Array<{title: string, outcomeKey: string}>} 规范化题目。
 */
function normalizeRawItems(rawItems) {
  const safeRawItems = Array.isArray(rawItems) ? rawItems : [];
  const seenTitleSet = new Set();
  const normalizedItems = [];

  safeRawItems.forEach((rawItem) => {
    const title = normalizeQuestionTitle(rawItem?.title);
    const outcomeKey = String(rawItem?.outcomeKey ?? "").trim();
    if (!title || !HOLLAND_OUTCOME_ORDER.includes(outcomeKey)) {
      return;
    }

    if (seenTitleSet.has(title)) {
      return;
    }

    seenTitleSet.add(title);
    normalizedItems.push({
      title,
      outcomeKey,
    });
  });

  return normalizedItems;
}

/**
 * 构建标准题库对象。
 * 复杂度评估：O(N)。
 * @param {Array<{title: string, outcomeKey: string}>} normalizedItems 规范化题目。
 * @returns {Array<object>} 标准题库。
 */
function buildQuestionBank(normalizedItems) {
  return normalizedItems.map((item, index) => {
    const questionId = `holland-custom-${String(index + 1).padStart(3, "0")}`;
    return {
      id: questionId,
      title: item.title,
      description: "请根据符合程度作答。",
      weight: 1,
      options: buildHollandOptions(questionId, item.outcomeKey),
    };
  });
}

/**
 * 规范化后的霍兰德题库。
 */
const HOLLAND_NORMALIZED_ITEMS = normalizeRawItems(HOLLAND_RAW_ITEMS);

/**
 * core60 固定题库导出。
 * 关键逻辑：若上游输入超量/异常，最终仍严格限制为 60 题。
 */
export const HOLLAND_CORE_60_QUESTION_BANK = buildQuestionBank(
  HOLLAND_NORMALIZED_ITEMS.slice(0, HOLLAND_CORE60_COUNT),
);

/**
 * 兼容旧引用别名。
 */
export const HOLLAND_QUESTION_BANK = HOLLAND_CORE_60_QUESTION_BANK;
