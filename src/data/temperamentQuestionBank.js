/**
 * 体液气质题库（用户定制版）：
 * 1. 固定 60 题，覆盖四类气质（多血 / 胆汁 / 粘液 / 抑郁）。
 * 2. 每类 15 题，保证分布均衡，降低结果偏置风险。
 * 3. 统一 5 档同意度选项，和类型学中心其余测试保持一致。
 */

/**
 * 体液气质结果键顺序。
 * 关键逻辑：用于稳定生成题目 ID 和可追溯维护。
 */
const TEMPERAMENT_OUTCOME_ORDER = [
  "temp-sanguine",
  "temp-choleric",
  "temp-phlegmatic",
  "temp-melancholic",
];

/**
 * 体液气质原始题库条目（60 题）。
 * 结构：title + outcomeKey。
 */
const TEMPERAMENT_RAW_ITEMS = [
  { title: "我在新环境里通常很快进入状态。", outcomeKey: "temp-sanguine" },
  { title: "我做事有冲劲，喜欢主动带头。", outcomeKey: "temp-choleric" },
  { title: "我心思细腻，容易察觉到细节变化。", outcomeKey: "temp-melancholic" },
  { title: "我性格温和，不喜欢与人争执。", outcomeKey: "temp-phlegmatic" },
  { title: "我善于社交，很容易和陌生人打成一片。", outcomeKey: "temp-sanguine" },
  { title: "我脾气比较急，做事追求效率。", outcomeKey: "temp-choleric" },
  { title: "我容易多愁善感，内心比较敏感。", outcomeKey: "temp-melancholic" },
  { title: "我情绪稳定，很少大起大落。", outcomeKey: "temp-phlegmatic" },
  { title: "我兴趣广泛，喜欢尝试新鲜事物。", outcomeKey: "temp-sanguine" },
  { title: "我好胜心强，不甘心落在别人后面。", outcomeKey: "temp-choleric" },
  { title: "我做事谨慎，习惯深思熟虑。", outcomeKey: "temp-melancholic" },
  { title: "我做事有耐心，能坚持完成任务。", outcomeKey: "temp-phlegmatic" },
  { title: "我乐观开朗，遇到挫折也能快速调整。", outcomeKey: "temp-sanguine" },
  { title: "我敢于直面冲突，不喜欢忍气吞声。", outcomeKey: "temp-choleric" },
  { title: "我容易陷入回忆，对过去念念不忘。", outcomeKey: "temp-melancholic" },
  { title: "我喜欢安稳的生活，不喜欢频繁变动。", outcomeKey: "temp-phlegmatic" },
  { title: "我表达能力强，说话生动有趣。", outcomeKey: "temp-sanguine" },
  { title: "我做事果断，不喜欢拖泥带水。", outcomeKey: "temp-choleric" },
  { title: "我追求完美，对自己要求很高。", outcomeKey: "temp-melancholic" },
  { title: "我待人友善，包容性很强。", outcomeKey: "temp-phlegmatic" },
  { title: "我适应力强，能快速融入新集体。", outcomeKey: "temp-sanguine" },
  { title: "我有主见，不喜欢被别人指挥。", outcomeKey: "temp-choleric" },
  { title: "我容易共情，能体会别人的难处。", outcomeKey: "temp-melancholic" },
  { title: "我做事低调，不喜欢张扬表现。", outcomeKey: "temp-phlegmatic" },
  { title: "我人缘好，很受身边人欢迎。", outcomeKey: "temp-sanguine" },
  { title: "我行动力强，想到就会立刻去做。", outcomeKey: "temp-choleric" },
  { title: "我观察力强，能发现别人忽略的细节。", outcomeKey: "temp-melancholic" },
  { title: "我心态平和，很少焦虑或急躁。", outcomeKey: "temp-phlegmatic" },
  { title: "我喜欢热闹，享受和大家在一起的氛围。", outcomeKey: "temp-sanguine" },
  { title: "我有责任感，遇到事情会主动承担。", outcomeKey: "temp-choleric" },
  { title: "我内心丰富，喜欢深度思考。", outcomeKey: "temp-melancholic" },
  { title: "我做事稳重，让人觉得可靠。", outcomeKey: "temp-phlegmatic" },
  { title: "我反应快，思维灵活不拘束。", outcomeKey: "temp-sanguine" },
  { title: "我不怕困难，越有挑战越有动力。", outcomeKey: "temp-choleric" },
  { title: "我容易胡思乱想，给自己压力。", outcomeKey: "temp-melancholic" },
  { title: "我不喜欢争抢，顺其自然就好。", outcomeKey: "temp-phlegmatic" },
  { title: "我善于调节气氛，能让大家开心。", outcomeKey: "temp-sanguine" },
  { title: "我目标明确，会朝着方向努力前进。", outcomeKey: "temp-choleric" },
  { title: "我比较感性，容易被情绪影响。", outcomeKey: "temp-melancholic" },
  { title: "我做事循序渐进，不急于求成。", outcomeKey: "temp-phlegmatic" },
  { title: "我接受能力强，学习新东西很快。", outcomeKey: "temp-sanguine" },
  { title: "我性格强势，希望事情按自己的节奏来。", outcomeKey: "temp-choleric" },
  { title: "我注重安全感，喜欢稳定的环境。", outcomeKey: "temp-melancholic" },
  { title: "我善于倾听，愿意耐心陪伴别人。", outcomeKey: "temp-phlegmatic" },
  { title: "我精力充沛，每天都很有活力。", outcomeKey: "temp-sanguine" },
  { title: "我不喜欢拖延，习惯尽快完成任务。", outcomeKey: "temp-choleric" },
  { title: "我做事认真，不允许敷衍了事。", outcomeKey: "temp-melancholic" },
  { title: "我情绪平稳，不容易被激怒。", outcomeKey: "temp-phlegmatic" },
  { title: "我喜欢自由，不喜欢被规则束缚。", outcomeKey: "temp-sanguine" },
  { title: "我敢于表达，有什么就直接说出来。", outcomeKey: "temp-choleric" },
  { title: "我容易自我怀疑，对自己不够自信。", outcomeKey: "temp-melancholic" },
  { title: "我做事踏实，一步一个脚印。", outcomeKey: "temp-phlegmatic" },
  { title: "我擅长沟通，能化解尴尬和矛盾。", outcomeKey: "temp-sanguine" },
  { title: "我有领导力，适合组织和安排事务。", outcomeKey: "temp-choleric" },
  { title: "我内心敏感，很在意别人的评价。", outcomeKey: "temp-melancholic" },
  { title: "我性格佛系，对得失不太在意。", outcomeKey: "temp-phlegmatic" },
  { title: "我喜欢新鲜体验，讨厌一成不变。", outcomeKey: "temp-sanguine" },
  { title: "我抗压能力强，越挫越勇。", outcomeKey: "temp-choleric" },
  { title: "我喜欢安静，更适合独处思考。", outcomeKey: "temp-melancholic" },
  { title: "我做事沉稳，不会轻易冲动。", outcomeKey: "temp-phlegmatic" },
];

/**
 * 创建体液气质向量。
 * 复杂度评估：O(1)。
 * @param {string} outcomeKey 结果键。
 * @param {number} score 分值。
 * @returns {Record<string, number>} 向量对象。
 */
function createTemperamentVector(outcomeKey, score) {
  return {
    [outcomeKey]: score,
  };
}

/**
 * 构建 5 档同意度选项。
 * 复杂度评估：O(1)。
 * @param {string} questionId 题目 ID。
 * @param {string} outcomeKey 结果键。
 * @returns {Array<object>} 标准选项数组。
 */
function buildTemperamentOptions(questionId, outcomeKey) {
  return [
    {
      id: `${questionId}-option-a`,
      label: "非常同意",
      vector: createTemperamentVector(outcomeKey, 4),
    },
    {
      id: `${questionId}-option-b`,
      label: "同意",
      vector: createTemperamentVector(outcomeKey, 3),
    },
    {
      id: `${questionId}-option-c`,
      label: "中立",
      vector: createTemperamentVector(outcomeKey, 2),
    },
    {
      id: `${questionId}-option-d`,
      label: "不太同意",
      vector: createTemperamentVector(outcomeKey, 1),
    },
    {
      id: `${questionId}-option-e`,
      label: "非常不同意",
      vector: createTemperamentVector(outcomeKey, 0),
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
 * 2. 按题干去重，避免重复题面进入正式题库。
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
    if (!title || !TEMPERAMENT_OUTCOME_ORDER.includes(outcomeKey)) {
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
    const questionId = `temperament-custom-${String(index + 1).padStart(3, "0")}`;
    return {
      id: questionId,
      title: item.title,
      description: "请根据符合程度作答。",
      weight: 1,
      options: buildTemperamentOptions(questionId, item.outcomeKey),
    };
  });
}

/**
 * 规范化后的体液气质题目。
 */
const TEMPERAMENT_NORMALIZED_ITEMS = normalizeRawItems(TEMPERAMENT_RAW_ITEMS);

/**
 * core60 固定题库。
 */
export const TEMPERAMENT_CORE_60_QUESTION_BANK = buildQuestionBank(
  TEMPERAMENT_NORMALIZED_ITEMS,
);

/**
 * 兼容旧引用别名。
 */
export const TEMPERAMENT_QUESTION_BANK = TEMPERAMENT_CORE_60_QUESTION_BANK;
