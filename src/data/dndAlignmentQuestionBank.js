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
 * 关键逻辑：题干优先使用“行为场景 + 决策偏好”表达，降低抽象关键词反复堆叠带来的重复感。
 */
const DND_ALIGNMENT_RAW_ITEMS = [
  { title: "遇到制度漏洞时，我会先推动补上流程，而不是私下变通。", outcomeKey: "dnd-lg" },
  { title: "就算没人监督，答应过团队的事我也会按约完成。", outcomeKey: "dnd-lg" },
  { title: "分配公共资源时，我会优先照顾最需要帮助的人。", outcomeKey: "dnd-lg" },
  { title: "看到有人靠违规占便宜，我会站出来维护共同规则。", outcomeKey: "dnd-lg" },
  { title: "我相信稳定的制度应该先保护弱者，而不是方便强者。", outcomeKey: "dnd-lg" },
  { title: "为了让合作更公平，我愿意承担别人不想做的责任。", outcomeKey: "dnd-lg" },
  { title: "面对强势者欺压他人时，我会通过正当程序替弱者争取公道。", outcomeKey: "dnd-lg" },

  { title: "看到别人陷入麻烦时，我先想怎样真正帮到对方。", outcomeKey: "dnd-ng" },
  { title: "判断一件事时，我更看它有没有让人过得更好。", outcomeKey: "dnd-ng" },
  { title: "帮助别人时，我会顾及现实条件，不把自己一起拖垮。", outcomeKey: "dnd-ng" },
  { title: "如果现有规定会误伤无辜，我会先寻找温和的补救办法。", outcomeKey: "dnd-ng" },
  { title: "我愿意做调解者，让冲突双方都少受一点伤害。", outcomeKey: "dnd-ng" },
  { title: "对我来说，善意是否落地，比姿态是否正确更重要。", outcomeKey: "dnd-ng" },
  { title: "做了好事之后，我不太在意别人知不知道是我。", outcomeKey: "dnd-ng" },

  { title: "碰到明显不公的命令时，我会直接拒绝执行。", outcomeKey: "dnd-cg" },
  { title: "我宁愿自己承担后果，也不想坐视朋友被欺负。", outcomeKey: "dnd-cg" },
  { title: "与其照本宣科，我更相信现场的良知判断。", outcomeKey: "dnd-cg" },
  { title: "救人这件事，在我心里比守格式更重要。", outcomeKey: "dnd-cg" },
  { title: "只要能保护在乎的人，我接受先行动再解释。", outcomeKey: "dnd-cg" },
  { title: "当权威本身失格时，我不会因为对方职位高就闭嘴。", outcomeKey: "dnd-cg" },
  { title: "我喜欢按自己的方式行善，不愿被标准答案绑住。", outcomeKey: "dnd-cg" },

  { title: "即使我不喜欢某条制度，也会先按制度执行。", outcomeKey: "dnd-ln" },
  { title: "分工明确、流程清楚，会让我觉得事情值得信赖。", outcomeKey: "dnd-ln" },
  { title: "做决策时，我会先看职责边界，而不是个人情绪。", outcomeKey: "dnd-ln" },
  { title: "我尊重层级和权限，不喜欢为了例外随意破规。", outcomeKey: "dnd-ln" },
  { title: "现场越混乱，我越会先想办法把秩序拉回来。", outcomeKey: "dnd-ln" },
  { title: "只要规则公开且一致，我认为所有人都该照章办理。", outcomeKey: "dnd-ln" },
  { title: "临时改口或随意变更约定，会让我非常反感。", outcomeKey: "dnd-ln" },

  { title: "遇到争执时，我更习惯先看清局面，再决定要不要介入。", outcomeKey: "dnd-tn" },
  { title: "我更在意事情会怎样影响自己当前的处境。", outcomeKey: "dnd-tn" },
  { title: "外部条件变了，我会跟着调整做法，而不是守死某种立场。", outcomeKey: "dnd-tn" },
  { title: "我不喜欢把任何价值推到极端，过头都会出问题。", outcomeKey: "dnd-tn" },
  { title: "很多冲突里，少介入往往比强行干预更有效。", outcomeKey: "dnd-tn" },
  { title: "只要不碰到我的核心利益，我能和不同立场的人合作。", outcomeKey: "dnd-tn" },
  { title: "我倾向让事情顺其自然，不总想主导走向。", outcomeKey: "dnd-tn" },

  { title: "我很难长期按固定节奏生活，临场感觉更重要。", outcomeKey: "dnd-cn" },
  { title: "只要别人试图控制我，我就会本能地反弹。", outcomeKey: "dnd-cn" },
  { title: "我不爱给自己贴阵营标签，也不想对谁宣誓忠诚。", outcomeKey: "dnd-cn" },
  { title: "做决定时，我更看当下想不想，而不是别人觉得该不该。", outcomeKey: "dnd-cn" },
  { title: "只要自己觉得有趣，我愿意尝试出格的新玩法。", outcomeKey: "dnd-cn" },
  { title: "对我来说，保留随时离开的自由比稳定安排更重要。", outcomeKey: "dnd-cn" },
  { title: "我不喜欢别人替我定义责任边界，我只对自己认可的事负责。", outcomeKey: "dnd-cn" },

  { title: "我擅长研究制度细节，把规则变成自己占优的筹码。", outcomeKey: "dnd-le" },
  { title: "只要合同站在我这边，我不介意结果对别人是否苛刻。", outcomeKey: "dnd-le" },
  { title: "我会主动靠近能拍板的人，因为资源通常握在他们手里。", outcomeKey: "dnd-le" },
  { title: "清晰的奖惩机制能让人更听话，这对我非常有用。", outcomeKey: "dnd-le" },
  { title: "我可以表现得很守规矩，但前提是这套秩序对我有利。", outcomeKey: "dnd-le" },
  { title: "比起亲自冲在前面，我更喜欢坐在审批位置决定别人能不能继续。", outcomeKey: "dnd-le" },
  { title: "我会履行承诺，只要这份承诺还能继续服务我的目标。", outcomeKey: "dnd-le" },

  { title: "只要回报足够高，我可以随时更换立场。", outcomeKey: "dnd-ne" },
  { title: "我做判断时先算得失，很少先想道义。", outcomeKey: "dnd-ne" },
  { title: "别人的信任、善意甚至脆弱，对我来说都可以成为筹码。", outcomeKey: "dnd-ne" },
  { title: "看到别人没发现的漏洞时，我通常先想怎样把它变成自己的机会。", outcomeKey: "dnd-ne" },
  { title: "如果牺牲别人能让我脱身，我通常不会犹豫太久。", outcomeKey: "dnd-ne" },
  { title: "我对“应该”没什么兴趣，能不能占到便宜才重要。", outcomeKey: "dnd-ne" },
  { title: "遇到合作时，我会先算清退出成本和个人收益。", outcomeKey: "dnd-ne" },

  { title: "看到场面失控时，我往往会觉得兴奋而不是不安。", outcomeKey: "dnd-ce" },
  { title: "只要能发泄情绪，我不介意把事情闹得更糟。", outcomeKey: "dnd-ce" },
  { title: "我享受把别人逼到害怕或崩溃的感觉。", outcomeKey: "dnd-ce" },
  { title: "一旦被冒犯，我很可能立刻用更狠的方式还回去。", outcomeKey: "dnd-ce" },
  { title: "规则、后果、别人会不会受伤，通常拦不住我当下的冲动。", outcomeKey: "dnd-ce" },
  { title: "有时候我就是想看秩序被砸烂后的样子。", outcomeKey: "dnd-ce" },
  { title: "如果制造破坏能让我开心，我不会太在乎谁来收拾残局。", outcomeKey: "dnd-ce" },
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
