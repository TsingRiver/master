/**
 * DnD 阵营题库（用户定制版）：
 * 1. 题库源使用用户提供的阵营题目。
 * 2. 固定模式 core60：输出 60 题，保证分布尽量均衡。
 * 3. 统一 5 档同意度选项，与类型学中心其余测试一致。
 */

/**
 * DnD 阵营结果键顺序（固定）。
 * 关键逻辑：用于配额分配与稳定排序，确保题库构建可追溯。
 */
const DND_OUTCOME_ORDER = [
  "dnd-lg",
  "dnd-ng",
  "dnd-cg",
  "dnd-ln",
  "dnd-tn",
  "dnd-cn",
  "dnd-le",
  "dnd-ne",
  "dnd-ce",
];

/**
 * DnD core60 题量。
 */
const DND_CORE60_COUNT = 60;

/**
 * 用户提供的原始题库（含 63 条）。
 * 结构：title + outcomeKey。
 */
const DND_ALIGNMENT_RAW_ITEMS = [
  { title: "我更愿意遵守规则来解决问题。", outcomeKey: "dnd-lg" },
  { title: "我会主动帮助有困难的人，不计较回报。", outcomeKey: "dnd-lg" },
  { title: "我认为诚信和责任是做人的根本底线。", outcomeKey: "dnd-lg" },
  { title: "我会严格遵守承诺，绝不食言。", outcomeKey: "dnd-lg" },
  { title: "我愿意为了集体利益，适当牺牲个人意愿。", outcomeKey: "dnd-lg" },
  { title: "我认为合理的规则能让世界变得更有序。", outcomeKey: "dnd-lg" },
  { title: "我会挺身而出，维护公平正义和规则的尊严。", outcomeKey: "dnd-lg" },

  { title: "我会优先考虑对大多数人有益。", outcomeKey: "dnd-ng" },
  { title: "我做事只看对错，不刻意遵循或打破规则。", outcomeKey: "dnd-ng" },
  { title: "我会帮助他人，但不会为了行善违背自己的底线。", outcomeKey: "dnd-ng" },
  { title: "我认为善良比规则更重要，但不会主动破坏规则。", outcomeKey: "dnd-ng" },
  { title: "我会公平对待每一个人，不偏袒、不苛责。", outcomeKey: "dnd-ng" },
  { title: "我愿意伸出援手，但会先确保自身安全。", outcomeKey: "dnd-ng" },
  { title: "我认为善意的举动无需刻意张扬，发自内心即可。", outcomeKey: "dnd-ng" },

  { title: "必要时我愿意打破规则去做正确的事。", outcomeKey: "dnd-cg" },
  { title: "我追求自由，不喜欢被任何规则束缚。", outcomeKey: "dnd-cg" },
  { title: "我会帮助弱小，但拒绝被他人或规则绑架。", outcomeKey: "dnd-cg" },
  { title: "我认为正义不该被条条框框限制，应灵活变通。", outcomeKey: "dnd-cg" },
  { title: "我愿意为了守护在乎的人，打破不合理的规则。", outcomeKey: "dnd-cg" },
  { title: "我做事随心所欲，但始终坚守善良的本心。", outcomeKey: "dnd-cg" },
  { title: "我不认同僵化的规则，更相信自己的判断和善意。", outcomeKey: "dnd-cg" },

  { title: "我严格遵守规则，无论规则本身是否合理。", outcomeKey: "dnd-ln" },
  { title: "我认为秩序远比个人情感和善恶更重要。", outcomeKey: "dnd-ln" },
  { title: "我会按流程办事，不掺杂个人主观意愿。", outcomeKey: "dnd-ln" },
  { title: "我尊重权威，愿意服从合理的指令和规则。", outcomeKey: "dnd-ln" },
  { title: "我认为规则的存在是为了维持秩序，必须被遵守。", outcomeKey: "dnd-ln" },
  { title: "我做事一板一眼，严格遵循既定规范。", outcomeKey: "dnd-ln" },
  { title: "我不会因为个人好恶，改变对规则的遵守。", outcomeKey: "dnd-ln" },

  { title: "我对善恶、规则都保持中立，不刻意偏向任何一方。", outcomeKey: "dnd-tn" },
  { title: "我做事只看自身需求，不主动伤害他人也不刻意行善。", outcomeKey: "dnd-tn" },
  { title: "我认为万物自有其规律，不必刻意去改变或干预。", outcomeKey: "dnd-tn" },
  { title: "我不参与任何立场之争，保持旁观者的姿态。", outcomeKey: "dnd-tn" },
  { title: "我会根据实际情况行事，不被善恶、规则束缚。", outcomeKey: "dnd-tn" },
  { title: "我对他人的善恶行为不评判、不干预，专注自身。", outcomeKey: "dnd-tn" },
  { title: "我认为中立是最好的立场，能避免不必要的麻烦。", outcomeKey: "dnd-tn" },

  { title: "我讨厌被规则束缚，做事全凭自己的心情。", outcomeKey: "dnd-cn" },
  { title: "我追求绝对的自由，不接受任何形式的约束。", outcomeKey: "dnd-cn" },
  { title: "我做事随心所欲，不在乎他人眼光和规则限制。", outcomeKey: "dnd-cn" },
  { title: "我不会主动伤害他人，但也不会刻意帮助别人。", outcomeKey: "dnd-cn" },
  { title: "我认为规则是用来打破的，不必墨守成规。", outcomeKey: "dnd-cn" },
  { title: "我喜欢随机应变，不做任何提前规划。", outcomeKey: "dnd-cn" },
  { title: "我不站队、不妥协，只遵循自己的心意行事。", outcomeKey: "dnd-cn" },

  { title: "我会利用规则来实现自己的利益最大化。", outcomeKey: "dnd-le" },
  { title: "我认为规则是为强者服务的，应善用规则掌控局面。", outcomeKey: "dnd-le" },
  { title: "我会严格遵守规则，但只为了获得更大的利益。", outcomeKey: "dnd-le" },
  { title: "我尊重权威，因为权威能给我带来实际好处。", outcomeKey: "dnd-le" },
  { title: "我会利用合理的规则，打压对自己不利的人。", outcomeKey: "dnd-le" },
  { title: "我认为秩序和规则是实现个人野心的工具。", outcomeKey: "dnd-le" },
  { title: "我会遵守承诺，但只在承诺对自己有利时。", outcomeKey: "dnd-le" },

  { title: "我只在乎自身利益，为了利益可以不择手段。", outcomeKey: "dnd-ne" },
  { title: "我做事没有底线，只要能达成目的，不在乎善恶和规则。", outcomeKey: "dnd-ne" },
  { title: "我会根据利益得失做决定，不被任何立场束缚。", outcomeKey: "dnd-ne" },
  { title: "我不介意伤害他人，只要能让自己获得好处。", outcomeKey: "dnd-ne" },
  { title: "我认为善恶毫无意义，只有利益才是根本。", outcomeKey: "dnd-ne" },
  { title: "我会利用他人的善良和规则的漏洞，为自己谋利。", outcomeKey: "dnd-ne" },
  { title: "我做事冷酷无情，只关注最终的利益回报。", outcomeKey: "dnd-ne" },

  { title: "我喜欢制造混乱，从中获取自己想要的利益。", outcomeKey: "dnd-ce" },
  { title: "我乐于破坏规则和秩序，享受混乱带来的快感。", outcomeKey: "dnd-ce" },
  { title: "我会主动伤害他人，以此满足自己的欲望或乐趣。", outcomeKey: "dnd-ce" },
  { title: "我不遵守任何规则，也不在乎他人的死活。", outcomeKey: "dnd-ce" },
  { title: "我认为强者就该肆意妄为，弱者只能被欺凌。", outcomeKey: "dnd-ce" },
  { title: "我做事冲动易怒，常常因为一时兴起伤害他人。", outcomeKey: "dnd-ce" },
  { title: "我讨厌一切秩序和规则，会尽全力去破坏它们。", outcomeKey: "dnd-ce" },
];

/**
 * 创建 DnD 向量。
 * 复杂度评估：O(1)。
 * @param {string} outcomeKey 结果键。
 * @param {number} score 分值。
 * @returns {Record<string, number>} 向量对象。
 */
function createDndVector(outcomeKey, score) {
  return {
    [outcomeKey]: score,
  };
}

/**
 * 构建 DnD 5 档同意度选项。
 * 复杂度评估：O(1)。
 * @param {string} questionId 题目 ID。
 * @param {string} outcomeKey 结果键。
 * @returns {Array<object>} 选项数组。
 */
function buildDndOptions(questionId, outcomeKey) {
  return [
    {
      id: `${questionId}-option-a`,
      label: "非常同意",
      vector: createDndVector(outcomeKey, 4),
    },
    {
      id: `${questionId}-option-b`,
      label: "同意",
      vector: createDndVector(outcomeKey, 3),
    },
    {
      id: `${questionId}-option-c`,
      label: "中立",
      vector: createDndVector(outcomeKey, 2),
    },
    {
      id: `${questionId}-option-d`,
      label: "不太同意",
      vector: createDndVector(outcomeKey, 1),
    },
    {
      id: `${questionId}-option-e`,
      label: "非常不同意",
      vector: createDndVector(outcomeKey, 0),
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
 * 1. 过滤空题干、非法 outcomeKey；
 * 2. 按题干去重，防止重复题面进入正式题库。
 * 复杂度评估：O(N * L)，N 为题量，L 为平均题干长度。
 * @param {Array<{title: string, outcomeKey: string}>} rawItems 原始题库条目。
 * @returns {Array<{title: string, outcomeKey: string}>} 规范化题目数组。
 */
function normalizeRawItems(rawItems) {
  const safeRawItems = Array.isArray(rawItems) ? rawItems : [];
  const seenTitleSet = new Set();
  const normalizedItems = [];

  safeRawItems.forEach((rawItem) => {
    const title = normalizeQuestionTitle(rawItem?.title);
    const outcomeKey = String(rawItem?.outcomeKey ?? "").trim();
    if (!title || !DND_OUTCOME_ORDER.includes(outcomeKey)) {
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
  DND_OUTCOME_ORDER.forEach((outcomeKey) => {
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
 * 关键逻辑：减少同阵营题连续出现，提升作答体验。
 * 复杂度评估：O(N)。
 * @param {Map<string, Array<{title: string, outcomeKey: string}>>} groupedMap 分组映射。
 * @returns {Array<{title: string, outcomeKey: string}>} 交错后的题目列表。
 */
function interleaveGroupedItems(groupedMap) {
  const workingGroups = DND_OUTCOME_ORDER.map((outcomeKey) => [
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
 * 计算各阵营题量配额。
 * 关键逻辑：
 * 1. 平均分配 baseQuota；
 * 2. 余数按固定顺序分配，确保结果稳定可复现。
 * 复杂度评估：O(K)，K 为阵营数量。
 * @param {number} totalCount 总题量。
 * @returns {Record<string, number>} 阵营配额映射。
 */
function buildOutcomeQuotaMap(totalCount) {
  const safeTotalCount = Math.max(0, Math.floor(totalCount));
  const outcomeCount = DND_OUTCOME_ORDER.length;
  const baseQuota = Math.floor(safeTotalCount / outcomeCount);
  const remainderCount = safeTotalCount % outcomeCount;

  const quotaMap = {};
  DND_OUTCOME_ORDER.forEach((outcomeKey, index) => {
    quotaMap[outcomeKey] = baseQuota + (index < remainderCount ? 1 : 0);
  });

  return quotaMap;
}

/**
 * 构建 core60 原始题目。
 * 关键逻辑：
 * 1. 先按配额从各阵营抽取，保证分布均衡；
 * 2. 若某阵营不足，再用剩余题稳定补齐到 60。
 * 复杂度评估：O(N)，N 为规范化题量。
 * @param {Array<{title: string, outcomeKey: string}>} normalizedItems 规范化题目。
 * @returns {Array<{title: string, outcomeKey: string}>} core60 原始题目数组。
 */
function buildCore60RawItems(normalizedItems) {
  const quotaMap = buildOutcomeQuotaMap(DND_CORE60_COUNT);
  const groupedMap = groupItemsByOutcome(normalizedItems);
  const selectedGroupedMap = new Map();
  const selectedTitleSet = new Set();

  DND_OUTCOME_ORDER.forEach((outcomeKey) => {
    const sourceItems = groupedMap.get(outcomeKey) ?? [];
    const requiredCount = quotaMap[outcomeKey] ?? 0;
    const selectedItems = sourceItems.slice(0, requiredCount);
    selectedGroupedMap.set(outcomeKey, selectedItems);
    selectedItems.forEach((item) => {
      selectedTitleSet.add(item.title);
    });
  });

  let mergedItems = interleaveGroupedItems(selectedGroupedMap);

  if (mergedItems.length < DND_CORE60_COUNT) {
    const remainingItems = normalizedItems.filter((item) => !selectedTitleSet.has(item.title));
    for (const remainingItem of remainingItems) {
      if (mergedItems.length >= DND_CORE60_COUNT) {
        break;
      }

      selectedTitleSet.add(remainingItem.title);
      mergedItems.push(remainingItem);
    }
  }

  return mergedItems.slice(0, DND_CORE60_COUNT);
}

/**
 * 构建标准题库对象。
 * 复杂度评估：O(N)。
 * @param {Array<{title: string, outcomeKey: string}>} rawItems 原始题目。
 * @returns {Array<object>} 标准题库。
 */
function buildQuestionBank(rawItems) {
  return rawItems.map((item, index) => {
    const questionId = `dnd-custom-${String(index + 1).padStart(3, "0")}`;
    return {
      id: questionId,
      title: item.title,
      description: "请根据符合程度作答。",
      weight: 1,
      options: buildDndOptions(questionId, item.outcomeKey),
    };
  });
}

/**
 * 规范化后的完整 DnD 题库条目。
 */
const DND_NORMALIZED_ITEMS = normalizeRawItems(DND_ALIGNMENT_RAW_ITEMS);

/**
 * core60 固定题目。
 */
const DND_CORE60_RAW_ITEMS = buildCore60RawItems(DND_NORMALIZED_ITEMS);

/**
 * DnD core60 题库导出。
 */
export const DND_ALIGNMENT_CORE_60_QUESTION_BANK = buildQuestionBank(
  DND_CORE60_RAW_ITEMS,
);

/**
 * 兼容旧引用别名。
 */
export const DND_ALIGNMENT_QUESTION_BANK = DND_ALIGNMENT_CORE_60_QUESTION_BANK;
