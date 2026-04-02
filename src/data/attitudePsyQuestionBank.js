/**
 * 态度心理题库（生产版）：
 * 1. 使用固定 core64，彻底避免“少量 cue + 后缀扩容”带来的高重复感。
 * 2. 四个维度（逻辑 / 情感 / 意志 / 体验）均衡覆盖，每类 16 题。
 * 3. 题目顺序按维度交错排布，减少用户连续遇到同类问法时的重复体感。
 */

/**
 * 态度心理结果键顺序（固定）。
 * 关键逻辑：用于构建标准题库并校验原始条目，保证题库结构稳定。
 */
const ATTITUDE_PSY_OUTCOME_ORDER = ["ap-l", "ap-e", "ap-v", "ap-f"];

/**
 * 态度心理 core64 固定题量。
 */
const ATTITUDE_PSY_CORE64_COUNT = 64;

/**
 * 原始题库条目：
 * 1. 仅保留 title + outcomeKey，降低内容维护复杂度。
 * 2. 顺序按 L / E / V / F 交错，避免用户连续作答同一维度题目。
 */
const ATTITUDE_PSY_RAW_ITEMS = [
  { title: "做决定前，我会先把判断标准说清楚。", outcomeKey: "ap-l" },
  { title: "讨论事情前，我会先看大家现在的情绪状态。", outcomeKey: "ap-e" },
  { title: "任务一来，我会先抓目标，不想在原地讨论太久。", outcomeKey: "ap-v" },
  { title: "安排事情时，我会先看自己当下状态能不能扛得住。", outcomeKey: "ap-f" },

  { title: "听别人提方案时，我首先看这套说法是否讲得通。", outcomeKey: "ap-l" },
  { title: "别人一开口，我常先感受到对方的态度和用意。", outcomeKey: "ap-e" },
  { title: "需要人拍板时，我通常愿意先站出来定方向。", outcomeKey: "ap-v" },
  { title: "到了一个新环境，我会先感受这里待着舒不舒服。", outcomeKey: "ap-f" },

  { title: "事情出问题时，我习惯先找出哪一步出了逻辑漏洞。", outcomeKey: "ap-l" },
  { title: "有人需要帮助时，我会先判断他现在最在意的感受是什么。", outcomeKey: "ap-e" },
  { title: "事情拖着不动时，我会忍不住开始推动进度。", outcomeKey: "ap-v" },
  { title: "选方案时，我很在意实际用起来是不是顺手。", outcomeKey: "ap-f" },

  { title: "遇到分歧时，我会先追问各自依据是什么，而不是先被态度带走。", outcomeKey: "ap-l" },
  { title: "冲突升级时，我更想先让气氛缓下来再谈对错。", outcomeKey: "ap-e" },
  { title: "我一旦认定要做，就会尽快进入执行状态。", outcomeKey: "ap-v" },
  { title: "身体状态不好时，我很难只靠意志硬顶下去。", outcomeKey: "ap-f" },

  { title: "信息很多很乱时，我会先整理框架再表态。", outcomeKey: "ap-l" },
  { title: "如果一个决定可能让关系里的人留下被刺痛的感觉，我会反复权衡。", outcomeKey: "ap-e" },
  { title: "资源吃紧时，我首先会盘算先保哪条主线，别让事情直接掉地上。", outcomeKey: "ap-v" },
  { title: "我判断一件事适不适合自己，常先看真实体验。", outcomeKey: "ap-f" },

  { title: "别人情绪很强烈时，我也会先确认问题本身是什么。", outcomeKey: "ap-l" },
  { title: "团队沉默时，我会先去感受是不是有人没被照顾到。", outcomeKey: "ap-e" },
  { title: "面对阻力时，我更容易起“先冲过去再说”的念头。", outcomeKey: "ap-v" },
  { title: "比起纸面上很美的方案，我更信亲自试过的感觉。", outcomeKey: "ap-f" },

  { title: "计划要改动时，我会先比较不同方案的利弊。", outcomeKey: "ap-l" },
  { title: "别人给我反馈时，我会先在意对方说话的方式。", outcomeKey: "ap-e" },
  { title: "做关键决定时，对我来说能不能自己掌舵，比流程漂不漂亮更重要。", outcomeKey: "ap-v" },
  { title: "做安排时，我会先考虑吃得消、睡得好、节奏稳不稳。", outcomeKey: "ap-f" },

  { title: "我更容易被论证严密的观点说服，而不是被语气说服。", outcomeKey: "ap-l" },
  { title: "我愿意为了不让人难受，调整自己的表达。", outcomeKey: "ap-e" },
  { title: "我不太喜欢一直等别人准备好才开始行动。", outcomeKey: "ap-v" },
  { title: "我对空间、声音、温度这类现场感受比较敏感。", outcomeKey: "ap-f" },

  { title: "学新东西时，我会先搞懂原理，再开始上手。", outcomeKey: "ap-l" },
  { title: "关系一旦变冷，我会主动发信号确认对方是不是在往后退。", outcomeKey: "ap-e" },
  { title: "团队劲头散掉时，我常会重新定焦点，把大家拉回同一战线。", outcomeKey: "ap-v" },
  { title: "如果一个选择让我长期不舒服，我很难说服自己继续。", outcomeKey: "ap-f" },

  { title: "我不太能接受“差不多就行”，前提得先说得通。", outcomeKey: "ap-l" },
  { title: "我对“对方现在舒服不舒服”这件事很敏感。", outcomeKey: "ap-e" },
  { title: "我对“说了就做、定了就推”这件事要求比较高。", outcomeKey: "ap-v" },
  { title: "我会通过亲自做一遍，确认这件事到底合不合适。", outcomeKey: "ap-f" },

  { title: "别人给建议时，我通常会继续追问这套做法成立的前提条件。", outcomeKey: "ap-l" },
  { title: "面对重要谈话，我会先选一个合适的情绪时机。", outcomeKey: "ap-e" },
  { title: "机会出现时，我往往先想能不能马上拿下。", outcomeKey: "ap-v" },
  { title: "我做决定时，会直接想到这件事会不会打乱住处、作息和日常舒适度。", outcomeKey: "ap-f" },

  { title: "需要合作时，我倾向先把规则和边界讲清楚。", outcomeKey: "ap-l" },
  { title: "决定要不要答应别人前，我会先体会自己和对方的感受。", outcomeKey: "ap-e" },
  { title: "出现突发变化时，我会先稳住主线，不想被带着跑。", outcomeKey: "ap-v" },
  { title: "别人讲得再好，如果实际体验很差，我也很难认同。", outcomeKey: "ap-f" },

  { title: "我做复盘时，通常先看决策链路哪里断了。", outcomeKey: "ap-l" },
  { title: "我更容易记住一次互动里的情绪氛围，而不是细节顺序。", outcomeKey: "ap-e" },
  { title: "我对没有推进感的讨论耐心有限。", outcomeKey: "ap-v" },
  { title: "我更容易被真实可感的变化打动，而不是被抽象承诺打动。", outcomeKey: "ap-f" },

  { title: "面对模糊表达时，我会追问到意思足够明确。", outcomeKey: "ap-l" },
  { title: "别人明显受伤时，我很难直接跳过感受去谈效率。", outcomeKey: "ap-e" },
  { title: "如果一件事必须有人负责，我通常不排斥把责任接过来。", outcomeKey: "ap-v" },
  { title: "当下的身体反应，常常会提醒我这件事该不该继续。", outcomeKey: "ap-f" },

  { title: "选长期方向时，我会先检查目标、路径和代价能不能前后一致。", outcomeKey: "ap-l" },
  { title: "我判断一段关系好不好时，会先看相处时是否安心。", outcomeKey: "ap-e" },
  { title: "我更容易因为目标被卡住而着急，而不是因为气氛不舒服而着急。", outcomeKey: "ap-v" },
  { title: "我安排日常时，会优先让自己的节奏和环境比较舒服。", outcomeKey: "ap-f" },

  { title: "压力大时，我更依赖分析来稳定自己。", outcomeKey: "ap-l" },
  { title: "压力大时，我会先想找能理解我感受的人说一说。", outcomeKey: "ap-e" },
  { title: "压力大时，我会本能地想重新掌控局面。", outcomeKey: "ap-v" },
  { title: "压力大时，我会先想办法把吃住、休息和身体状态调回来。", outcomeKey: "ap-f" },
];

/**
 * 构建态度心理向量。
 * 复杂度评估：O(1)。
 * @param {string} outcomeKey 结果键。
 * @param {number} score 分值。
 * @returns {Record<string, number>} 向量对象。
 */
function createAttitudePsyVector(outcomeKey, score) {
  return {
    [outcomeKey]: score,
  };
}

/**
 * 构建态度心理 5 档同意度选项。
 * 复杂度评估：O(1)。
 * @param {string} questionId 题目 ID。
 * @param {string} outcomeKey 结果键。
 * @returns {Array<object>} 选项数组。
 */
function buildAttitudePsyOptions(questionId, outcomeKey) {
  return [
    {
      id: `${questionId}-option-a`,
      label: "非常同意",
      vector: createAttitudePsyVector(outcomeKey, 4),
    },
    {
      id: `${questionId}-option-b`,
      label: "同意",
      vector: createAttitudePsyVector(outcomeKey, 3),
    },
    {
      id: `${questionId}-option-c`,
      label: "中立",
      vector: createAttitudePsyVector(outcomeKey, 2),
    },
    {
      id: `${questionId}-option-d`,
      label: "不太同意",
      vector: createAttitudePsyVector(outcomeKey, 1),
    },
    {
      id: `${questionId}-option-e`,
      label: "非常不同意",
      vector: createAttitudePsyVector(outcomeKey, 0),
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
 * 2. 按题干去重，避免近维护过程中误贴重复题；
 * 3. 保留原始顺序，确保维度交错排布稳定生效。
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
    if (!title || !ATTITUDE_PSY_OUTCOME_ORDER.includes(outcomeKey)) {
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
    const questionId = `attitude-psy-core-${String(index + 1).padStart(3, "0")}`;
    return {
      id: questionId,
      title: item.title,
      description: "请根据符合程度作答。",
      weight: 1,
      options: buildAttitudePsyOptions(questionId, item.outcomeKey),
    };
  });
}

/**
 * 规范化后的态度心理题库。
 */
const ATTITUDE_PSY_NORMALIZED_ITEMS = normalizeRawItems(ATTITUDE_PSY_RAW_ITEMS);

/**
 * core64 固定题库导出。
 * 关键逻辑：即使上游后续追加题目，正式导出也严格限制为 64 题。
 */
export const ATTITUDE_PSY_CORE_64_QUESTION_BANK = buildQuestionBank(
  ATTITUDE_PSY_NORMALIZED_ITEMS.slice(0, ATTITUDE_PSY_CORE64_COUNT),
);

/**
 * 兼容旧引用别名。
 */
export const ATTITUDE_PSY_QUESTION_BANK = ATTITUDE_PSY_CORE_64_QUESTION_BANK;
