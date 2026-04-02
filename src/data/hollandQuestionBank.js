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
 * 1. 结构：title + outcomeKey。
 * 2. 顺序按 R / I / A / S / E / C 交错，避免用户连续答到同类题面。
 */
const HOLLAND_RAW_ITEMS = [
  { title: "家里有东西需要装起来时，我多半会自己拿工具试一试。", outcomeKey: "h-r" },
  { title: "遇到复杂问题时，我会想先查资料、找规律再下结论。", outcomeKey: "h-i" },
  { title: "同样一项任务，我会自然想把它做得更有风格和表达感。", outcomeKey: "h-a" },
  { title: "别人一旦卡住，我常会主动把思路拆开，陪对方一步步理清。", outcomeKey: "h-s" },
  { title: "涉及拉资源、定方向或拍推进节奏时，我愿意扛起主导角色。", outcomeKey: "h-e" },
  { title: "我处理资料时，会主动分类、归档并保持清楚。", outcomeKey: "h-c" },

  { title: "比起开会讨论，我更喜欢到现场把问题解决掉。", outcomeKey: "h-r" },
  { title: "比起直接接受答案，我更想知道事情为什么会这样。", outcomeKey: "h-i" },
  { title: "我很在意作品或内容呈现出来的审美和气质。", outcomeKey: "h-a" },
  { title: "通过沟通、陪伴或指导让别人变好，会让我有成就感。", outcomeKey: "h-s" },
  { title: "我对带队、谈判或主导项目这类角色并不排斥。", outcomeKey: "h-e" },
  { title: "按规则、流程和标准做事，会让我更安心。", outcomeKey: "h-c" },

  { title: "工作成果能被直接看见、摸到，会让我更有成就感。", outcomeKey: "h-r" },
  { title: "我愿意花很多时间把一个难题研究透。", outcomeKey: "h-i" },
  { title: "只要有空间，我就会想尝试不那么标准化的做法。", outcomeKey: "h-a" },
  { title: "我愿意花时间听别人把困扰说完整。", outcomeKey: "h-s" },
  { title: "有明确目标和结果压力的任务，反而容易激起我的劲头。", outcomeKey: "h-e" },
  { title: "我很少能忍受数据、表格或细节长期处于混乱状态。", outcomeKey: "h-c" },

  { title: "我愿意学习工具、设备或工艺的具体用法。", outcomeKey: "h-r" },
  { title: "看到数据或现象时，我会自然去想它背后的原因。", outcomeKey: "h-i" },
  { title: "用文字、图像、音乐或画面表达想法，会让我很有感觉。", outcomeKey: "h-a" },
  { title: "团队里如果有人被忽略，我通常会留意到。", outcomeKey: "h-s" },
  { title: "我愿意为一个有潜力的机会主动去争取。", outcomeKey: "h-e" },
  { title: "做完一件事后，我通常会再核对一遍是否有遗漏。", outcomeKey: "h-c" },

  { title: "面对损坏或卡住的东西，我常先想能不能修好它。", outcomeKey: "h-r" },
  { title: "我对“提出假设再验证”这种过程本身有兴趣。", outcomeKey: "h-i" },
  { title: "我喜欢给普通的东西加入自己的创意和个人味道。", outcomeKey: "h-a" },
  { title: "我做事时会在意这件事对别人有没有实际帮助。", outcomeKey: "h-s" },
  { title: "我喜欢把人、资源和节奏组织起来，把事情推成。", outcomeKey: "h-e" },
  { title: "明确的制度、分工和步骤，通常能让我发挥更稳定。", outcomeKey: "h-c" },

  { title: "整天闷在桌前反复写材料，会很快消耗我的耐心。", outcomeKey: "h-r" },
  { title: "独立钻研一个问题，往往比频繁社交更让我投入。", outcomeKey: "h-i" },
  { title: "完全按固定模板做事，常会让我觉得有点压抑。", outcomeKey: "h-a" },
  { title: "比起单纯追结果，我也很重视合作中的感受和支持。", outcomeKey: "h-s" },
  { title: "碰到方案需要路演或谈判时，我乐意亲自去把人说服。", outcomeKey: "h-e" },
  { title: "我愿意做需要耐心、准确和持续重复的基础工作。", outcomeKey: "h-c" },

  { title: "我喜欢一步步把零散部件组装成能用的成品。", outcomeKey: "h-r" },
  { title: "我喜欢把零散信息整理成结论或模型。", outcomeKey: "h-i" },
  { title: "我会留意生活里配色、构图、节奏这些美感细节。", outcomeKey: "h-a" },
  { title: "我乐于把自己会的东西讲给别人听，帮助对方学会。", outcomeKey: "h-s" },
  { title: "我对“把想法变成结果”这件事有明显动力。", outcomeKey: "h-e" },
  { title: "面对复杂信息时，我会先整理顺序，再开始处理。", outcomeKey: "h-c" },

  { title: "遇到实际问题时，我更愿意先试做，再慢慢调整。", outcomeKey: "h-r" },
  { title: "没有足够证据支撑的判断，很难真正说服我。", outcomeKey: "h-i" },
  { title: "一个项目能自由发挥创意时，我通常更愿意投入。", outcomeKey: "h-a" },
  { title: "需要协调关系、安抚情绪的场合，我不太会躲开。", outcomeKey: "h-s" },
  { title: "在竞争或目标导向强的环境里，我往往更能进入状态。", outcomeKey: "h-e" },
  { title: "我比较在意记录是否完整、格式是否统一。", outcomeKey: "h-c" },

  { title: "我对户外、工地、实验现场这类真实作业环境不排斥。", outcomeKey: "h-r" },
  { title: "我会因为一个有意思的问题，主动去读资料或做对比。", outcomeKey: "h-i" },
  { title: "我不太满足于“能用就行”，还会在意它好不好看、有没有感觉。", outcomeKey: "h-a" },
  { title: "看到别人因为我的帮助轻松下来，我会觉得这件事很值得。", outcomeKey: "h-s" },
  { title: "我不太抗拒承担决策责任，尤其在关键节点上。", outcomeKey: "h-e" },
  { title: "交接前若关键步骤还没梳理清楚，我会一直记挂着。", outcomeKey: "h-c" },

  { title: "只要任务考验手上功夫和配合感，我做起来往往会越干越顺。", outcomeKey: "h-r" },
  { title: "让我连续几天拆解问题、推演假设，我反而更容易进入状态。", outcomeKey: "h-i" },
  { title: "要自己定调性、做表达取舍的创作任务，会明显勾起我的兴趣。", outcomeKey: "h-a" },
  { title: "当工作核心是陪人、支持人、帮助人成长时，我会更投入。", outcomeKey: "h-s" },
  { title: "那种要拿结果、带队伍、把事情往前拱的岗位，会让我有冲劲。", outcomeKey: "h-e" },
  { title: "反复核对、稳住流程、把细节执行到位的岗位，我通常能做得很稳。", outcomeKey: "h-c" },
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
