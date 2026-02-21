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
  { title: "我愿意和对方一起规划未来。", outcomeKey: "i-growth" },
  { title: "我希望生活习惯能合得来。", outcomeKey: "i-stable" },
  { title: "我容易被颜值与气质吸引。", outcomeKey: "i-passion" },
  { title: "我希望彼此能互相鼓励。", outcomeKey: "i-growth" },
  { title: "我偏爱踏实靠谱、有责任感的人。", outcomeKey: "i-stable" },
  { title: "我喜欢暧昧与心动的拉扯感。", outcomeKey: "i-passion" },
  { title: "我希望对方能拓展我的眼界。", outcomeKey: "i-growth" },
  { title: "我看重长期发展胜过一时甜蜜。", outcomeKey: "i-stable" },
  { title: "我容易被幽默有趣的人吸引。", outcomeKey: "i-passion" },
  { title: "我希望我们能共同进步。", outcomeKey: "i-growth" },
  { title: "我希望对方尊重我的边界。", outcomeKey: "i-stable" },
  { title: "我偏爱有反差感、有神秘感的人。", outcomeKey: "i-passion" },
  { title: "我希望一起学习新事物。", outcomeKey: "i-growth" },
  { title: "我希望相处舒服、不用伪装。", outcomeKey: "i-stable" },
  { title: "我容易被温柔体贴的人打动。", outcomeKey: "i-passion" },
  { title: "我希望对方能推动我自律。", outcomeKey: "i-growth" },
  { title: "我看重家庭观念是否相近。", outcomeKey: "i-stable" },
  { title: "我喜欢有占有欲、被偏爱的感觉。", outcomeKey: "i-passion" },
  { title: "我希望彼此能互相成就。", outcomeKey: "i-growth" },
  { title: "我希望吵架能好好沟通、不冷战。", outcomeKey: "i-stable" },
  { title: "我容易被有才华能力的人吸引。", outcomeKey: "i-passion" },
  { title: "我希望一起实现目标。", outcomeKey: "i-growth" },
  { title: "我偏爱成熟稳重、情绪平和。", outcomeKey: "i-stable" },
  { title: "我喜欢主动表达爱意的人。", outcomeKey: "i-passion" },
  { title: "我希望对方能给我正向影响。", outcomeKey: "i-growth" },
  { title: "我希望消费观与金钱观一致。", outcomeKey: "i-stable" },
  { title: "我容易被细节里的温柔打动。", outcomeKey: "i-passion" },
  { title: "我希望一起变得更优秀。", outcomeKey: "i-growth" },
  { title: "我希望对方坦诚不隐瞒。", outcomeKey: "i-stable" },
  { title: "我喜欢有氛围感的浪漫惊喜。", outcomeKey: "i-passion" },
  { title: "我希望彼此能互相治愈。", outcomeKey: "i-growth" },
  { title: "我看重三观合不合得来。", outcomeKey: "i-stable" },
  { title: "我容易被强势有主见的人吸引。", outcomeKey: "i-passion" },
  { title: "我希望一起变得更成熟。", outcomeKey: "i-growth" },
  { title: "我希望相处轻松、少内耗。", outcomeKey: "i-stable" },
  { title: "我喜欢被坚定选择的感觉。", outcomeKey: "i-passion" },
  { title: "我希望对方能激励我前行。", outcomeKey: "i-growth" },
  { title: "我希望对方有上进心与规划。", outcomeKey: "i-stable" },
  { title: "我容易被温柔宠溺的人吸引。", outcomeKey: "i-passion" },
  { title: "我希望一起面对挑战。", outcomeKey: "i-growth" },
  { title: "我希望彼此信任不猜忌。", outcomeKey: "i-stable" },
  { title: "我喜欢有反差萌的人。", outcomeKey: "i-passion" },
  { title: "我希望一起成为更好的人。", outcomeKey: "i-growth" },
  { title: "我看重性格是否温和好相处。", outcomeKey: "i-stable" },
  { title: "我容易被热烈直接的爱意打动。", outcomeKey: "i-passion" },
  { title: "我希望彼此能互相包容成长。", outcomeKey: "i-growth" },
  { title: "我希望对方尊重我的家人朋友。", outcomeKey: "i-stable" },
  { title: "我喜欢有氛围感的约会与旅行。", outcomeKey: "i-passion" },
  { title: "我希望一起规划人生方向。", outcomeKey: "i-growth" },
  { title: "我希望吵架不翻旧账、就事论事。", outcomeKey: "i-stable" },
  { title: "我容易被细心体贴的人吸引。", outcomeKey: "i-passion" },
  { title: "我希望对方能帮我变得更自律。", outcomeKey: "i-growth" },
  { title: "我希望生活节奏能匹配。", outcomeKey: "i-stable" },
  { title: "我喜欢被偏爱、被特殊对待。", outcomeKey: "i-passion" },
  { title: "我希望彼此能互相支持梦想。", outcomeKey: "i-growth" },
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
