/**
 * 理想型题库（用户自定义版）：
 * 1. 题目来源：用户提供的 outcomeKey 题库（i-stable / i-passion / i-growth）。
 * 2. 当前模式：core64，固定输出 64 题。
 * 3. 关键目标：去重、可维护、分布均衡，避免重复题面与偏科。
 */

/**
 * 理想型支持的 outcomeKey 列表（固定顺序）。
 * 关键逻辑：用于均衡抽样和交错排序，保证每轮题面分布稳定。
 */
const IDEAL_MATCH_OUTCOME_ORDER = ["i-stable", "i-passion", "i-growth"];

/**
 * 理想型 core64 题量配置。
 */
const IDEAL_MATCH_CORE64_COUNT = 64;

/**
 * 用户提供的原始题库条目。
 * 格式：title + outcomeKey。
 */
const IDEAL_MATCH_RAW_ITEMS = [
  { title: "我更看重两个人价值观一致。", outcomeKey: "i-stable" },
  { title: "我容易被强烈心动感吸引。", outcomeKey: "i-passion" },
  { title: "我希望关系里彼此支持、一起成长。", outcomeKey: "i-growth" },
  { title: "我希望对方情绪稳定、好沟通。", outcomeKey: "i-stable" },
  { title: "我喜欢有仪式感的浪漫相处。", outcomeKey: "i-passion" },
  { title: "我希望对方能带动我变得更好。", outcomeKey: "i-growth" },
  { title: "忠诚与专一对我最重要。", outcomeKey: "i-stable" },
  { title: "我喜欢有张力、有火花的感情。", outcomeKey: "i-passion" },
  { title: "我希望关系里能认真讨论未来的居住、工作和生活安排。", outcomeKey: "i-growth" },
  { title: "两个人在作息、整洁和日常节奏上别太拧巴，对我很重要。", outcomeKey: "i-stable" },
  { title: "我容易被颜值与气质吸引。", outcomeKey: "i-passion" },
  { title: "我希望关系里能坦诚复盘问题，而不是重复踩同样的坑。", outcomeKey: "i-growth" },
  { title: "我偏爱踏实靠谱、有责任感的人。", outcomeKey: "i-stable" },
  { title: "我喜欢暧昧与心动的拉扯感。", outcomeKey: "i-passion" },
  { title: "我希望对方能拓展我的眼界。", outcomeKey: "i-growth" },
  { title: "我看重长期发展胜过一时甜蜜。", outcomeKey: "i-stable" },
  { title: "能让我笑出来、相处起来有明显松弛感的人，会很快让我心动。", outcomeKey: "i-passion" },
  { title: "我希望两个人在状态稳定时，也愿意继续打磨自己。", outcomeKey: "i-growth" },
  { title: "我需要对方能听懂并接受我的相处边界和个人空间。", outcomeKey: "i-stable" },
  { title: "我会被那种初看克制、熟了之后层次很多的人吸引。", outcomeKey: "i-passion" },
  { title: "我希望对方愿意和我交换认知，一起打开新的视野。", outcomeKey: "i-growth" },
  { title: "我希望相处舒服、不用伪装。", outcomeKey: "i-stable" },
  { title: "我容易被温柔体贴的人打动。", outcomeKey: "i-passion" },
  { title: "我希望对方会提醒我回到真正重要的长期目标。", outcomeKey: "i-growth" },
  { title: "我看重家庭观念是否相近。", outcomeKey: "i-stable" },
  { title: "我喜欢有占有欲、被偏爱的感觉。", outcomeKey: "i-passion" },
  { title: "我希望彼此在职业或学业上都能提供具体支持。", outcomeKey: "i-growth" },
  { title: "我希望吵架能好好沟通、不冷战。", outcomeKey: "i-stable" },
  { title: "看到一个人在自己的领域里真有拿得出手的本事，我会明显心动。", outcomeKey: "i-passion" },
  { title: "我希望关系能把想法落到现实，而不只是停留在口头支持。", outcomeKey: "i-growth" },
  { title: "我偏爱成熟稳重、情绪平和。", outcomeKey: "i-stable" },
  { title: "我喜欢主动表达爱意的人。", outcomeKey: "i-passion" },
  { title: "我希望对方的存在能让我看见更高的标准和可能性。", outcomeKey: "i-growth" },
  { title: "我希望消费观与金钱观一致。", outcomeKey: "i-stable" },
  { title: "我容易被细节里的温柔打动。", outcomeKey: "i-passion" },
  { title: "我希望这段关系能推动彼此把作息、饮食和生活管理都调到更健康。", outcomeKey: "i-growth" },
  { title: "我希望对方坦诚不隐瞒。", outcomeKey: "i-stable" },
  { title: "我喜欢对方认真设计相处细节，让人感到被用心对待。", outcomeKey: "i-passion" },
  { title: "我希望我脆弱的时候，对方能稳稳接住而不是回避。", outcomeKey: "i-growth" },
  { title: "我看重三观合不合得来。", outcomeKey: "i-stable" },
  { title: "对方在关键时刻敢拍板、有自己的判断，会让我觉得很有吸引力。", outcomeKey: "i-passion" },
  { title: "我希望我们能把争吵慢慢练成有效沟通。", outcomeKey: "i-growth" },
  { title: "我希望关系里少一些猜测和拉扯，把精力留给真实生活。", outcomeKey: "i-stable" },
  { title: "我喜欢被坚定选择的感觉。", outcomeKey: "i-passion" },
  { title: "我希望对方在我犹豫时，能给出清晰而建设性的反馈。", outcomeKey: "i-growth" },
  { title: "我希望对方有上进心与规划。", outcomeKey: "i-stable" },
  { title: "我容易被那种会把喜欢落实成行动照顾的人吸引。", outcomeKey: "i-passion" },
  { title: "我希望遇到困难时，对方会和我站在同一边处理问题。", outcomeKey: "i-growth" },
  { title: "我希望彼此信任不猜忌。", outcomeKey: "i-stable" },
  { title: "对方偶尔露出和外表反差很大的可爱一面，会很戳我。", outcomeKey: "i-passion" },
  { title: "我希望这段关系能让我更敢承担自己想成为的样子。", outcomeKey: "i-growth" },
  { title: "我看重性格是否温和好相处。", outcomeKey: "i-stable" },
  { title: "我容易被热烈直接的爱意打动。", outcomeKey: "i-passion" },
  { title: "我希望我们能接受彼此阶段不同，而不是强行同步。", outcomeKey: "i-growth" },
  { title: "伴侣能真诚对待我的家人和朋友，会让我很加分。", outcomeKey: "i-stable" },
  { title: "我喜欢一起去陌生地方冒险，制造两个人独有的记忆。", outcomeKey: "i-passion" },
  { title: "我希望我们能认真对齐人生方向，而不是只凭当下感觉相处。", outcomeKey: "i-growth" },
  { title: "我希望吵架不翻旧账、就事论事。", outcomeKey: "i-stable" },
  { title: "如果对方能记住我随口提过的小偏好，我会觉得自己被认真放在心上。", outcomeKey: "i-passion" },
  { title: "我希望对方愿意和我一起建立能长期坚持的日常节奏。", outcomeKey: "i-growth" },
  { title: "我希望两个人对忙闲节奏和陪伴频率有基本默契。", outcomeKey: "i-stable" },
  { title: "我喜欢被偏爱、被特殊对待。", outcomeKey: "i-passion" },
  { title: "我希望关系能支持彼此做长期且重要的选择，即使短期会辛苦。", outcomeKey: "i-growth" },
  { title: "我希望对方说到做到、守信用。", outcomeKey: "i-stable" },
];

/**
 * 创建理想型选项向量。
 * @param {string} outcomeKey 结果键。
 * @param {number} score 分值。
 * @returns {Record<string, number>} 向量对象。
 */
function createIdealMatchVector(outcomeKey, score) {
  return {
    [outcomeKey]: score,
  };
}

/**
 * 构建理想型 5 档选项。
 * @param {string} questionId 题目 ID。
 * @param {string} outcomeKey 结果键。
 * @returns {Array<object>} 选项数组。
 */
function buildIdealMatchOptions(questionId, outcomeKey) {
  return [
    {
      id: `${questionId}-option-a`,
      label: "非常同意",
      vector: createIdealMatchVector(outcomeKey, 4),
    },
    {
      id: `${questionId}-option-b`,
      label: "同意",
      vector: createIdealMatchVector(outcomeKey, 3),
    },
    {
      id: `${questionId}-option-c`,
      label: "中立",
      vector: createIdealMatchVector(outcomeKey, 2),
    },
    {
      id: `${questionId}-option-d`,
      label: "不太同意",
      vector: createIdealMatchVector(outcomeKey, 1),
    },
    {
      id: `${questionId}-option-e`,
      label: "非常不同意",
      vector: createIdealMatchVector(outcomeKey, 0),
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
 * 规范化原始题目并去重。
 * 关键逻辑：
 * 1. 过滤空题干与非法 outcomeKey；
 * 2. 按题干文本去重，避免重复题面进入正式题库。
 * 复杂度评估：O(N * L)，N 为题量，L 为平均题干长度。
 * @param {Array<{title: string, outcomeKey: string}>} rawItems 原始题目数组。
 * @returns {Array<{title: string, outcomeKey: string}>} 规范化题目数组。
 */
function normalizeIdealMatchRawItems(rawItems) {
  const safeRawItems = Array.isArray(rawItems) ? rawItems : [];
  const seenTitleSet = new Set();
  const normalizedItems = [];

  safeRawItems.forEach((rawItem) => {
    const title = normalizeQuestionTitle(rawItem?.title);
    const outcomeKey = String(rawItem?.outcomeKey ?? "").trim();
    if (!title || !IDEAL_MATCH_OUTCOME_ORDER.includes(outcomeKey)) {
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
 * 按 outcomeKey 分组题目。
 * 复杂度评估：O(N)。
 * @param {Array<{title: string, outcomeKey: string}>} normalizedItems 规范化题目。
 * @returns {Map<string, Array<{title: string, outcomeKey: string}>>} 分组映射。
 */
function groupItemsByOutcome(normalizedItems) {
  const groupedMap = new Map();
  IDEAL_MATCH_OUTCOME_ORDER.forEach((outcomeKey) => {
    groupedMap.set(outcomeKey, []);
  });

  normalizedItems.forEach((item) => {
    const groupItems = groupedMap.get(item.outcomeKey);
    if (!groupItems) {
      return;
    }
    groupItems.push(item);
  });

  return groupedMap;
}

/**
 * 交错合并分组题目。
 * 关键逻辑：降低同类型题连续出现概率，提升作答体验。
 * 复杂度评估：O(N)。
 * @param {Map<string, Array<{title: string, outcomeKey: string}>>} groupedMap 分组映射。
 * @returns {Array<{title: string, outcomeKey: string}>} 交错后的题目数组。
 */
function interleaveGroupedItems(groupedMap) {
  const workingGroups = IDEAL_MATCH_OUTCOME_ORDER.map((outcomeKey) => [
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
 * 计算每个 outcomeKey 的目标配额。
 * 关键逻辑：按总题量平均分配，余数按固定顺序补到前几个 outcomeKey，保证结果稳定。
 * 复杂度评估：O(K)，K 为 outcomeKey 数量。
 * @param {number} totalCount 目标总题量。
 * @returns {Record<string, number>} outcomeKey -> 目标题量。
 */
function buildOutcomeQuotaMap(totalCount) {
  const safeTotalCount = Math.max(0, Math.floor(totalCount));
  const outcomeCount = IDEAL_MATCH_OUTCOME_ORDER.length;
  const baseQuota = Math.floor(safeTotalCount / outcomeCount);
  const remainderCount = safeTotalCount % outcomeCount;

  const quotaMap = {};
  IDEAL_MATCH_OUTCOME_ORDER.forEach((outcomeKey, index) => {
    quotaMap[outcomeKey] = baseQuota + (index < remainderCount ? 1 : 0);
  });

  return quotaMap;
}

/**
 * 从规范化题库构建 core64 原始题目。
 * 关键逻辑：
 * 1. 先按 outcome 配额抽题，保障类型均衡；
 * 2. 若某类不足，使用其余题目稳定补齐；
 * 3. 输出固定 64 题，避免线上题量波动。
 * 复杂度评估：O(N)。
 * @param {Array<{title: string, outcomeKey: string}>} normalizedItems 规范化题目数组。
 * @returns {Array<{title: string, outcomeKey: string}>} core64 原始题目数组。
 */
function buildCore64RawItems(normalizedItems) {
  const quotaMap = buildOutcomeQuotaMap(IDEAL_MATCH_CORE64_COUNT);
  const groupedMap = groupItemsByOutcome(normalizedItems);
  const selectedGroupedMap = new Map();
  const selectedTitleSet = new Set();

  IDEAL_MATCH_OUTCOME_ORDER.forEach((outcomeKey) => {
    const sourceItems = groupedMap.get(outcomeKey) ?? [];
    const requiredCount = quotaMap[outcomeKey] ?? 0;
    const selectedItems = sourceItems.slice(0, requiredCount);
    selectedGroupedMap.set(outcomeKey, selectedItems);
    selectedItems.forEach((item) => {
      selectedTitleSet.add(item.title);
    });
  });

  let mergedItems = interleaveGroupedItems(selectedGroupedMap);

  if (mergedItems.length < IDEAL_MATCH_CORE64_COUNT) {
    const remainingItems = normalizedItems.filter((item) => !selectedTitleSet.has(item.title));
    for (const remainingItem of remainingItems) {
      if (mergedItems.length >= IDEAL_MATCH_CORE64_COUNT) {
        break;
      }
      selectedTitleSet.add(remainingItem.title);
      mergedItems.push(remainingItem);
    }
  }

  return mergedItems.slice(0, IDEAL_MATCH_CORE64_COUNT);
}

/**
 * 构建标准题库对象。
 * 复杂度评估：O(N)。
 * @param {Array<{title: string, outcomeKey: string}>} rawItems 原始题目数组。
 * @returns {Array<object>} 标准题库数组。
 */
function buildQuestionBank(rawItems) {
  return rawItems.map((rawItem, index) => {
    const questionId = `ideal-match-custom-${String(index + 1).padStart(3, "0")}`;
    return {
      id: questionId,
      title: rawItem.title,
      description: "请根据符合程度作答。",
      weight: 1,
      options: buildIdealMatchOptions(questionId, rawItem.outcomeKey),
    };
  });
}

/**
 * 规范化后的原始题目。
 */
const IDEAL_MATCH_NORMALIZED_ITEMS = normalizeIdealMatchRawItems(IDEAL_MATCH_RAW_ITEMS);

/**
 * core64 原始题目集合。
 */
const IDEAL_MATCH_CORE64_RAW_ITEMS = buildCore64RawItems(IDEAL_MATCH_NORMALIZED_ITEMS);

/**
 * core64 题库导出。
 */
export const IDEAL_MATCH_CORE_64_QUESTION_BANK = buildQuestionBank(
  IDEAL_MATCH_CORE64_RAW_ITEMS,
);

/**
 * 兼容旧引用别名。
 */
export const IDEAL_MATCH_QUESTION_BANK = IDEAL_MATCH_CORE_64_QUESTION_BANK;
