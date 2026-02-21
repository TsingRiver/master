/**
 * 依恋类型题库（用户提供版）：
 * 1. 原始输入为 CSV 行文本，便于后续继续批量替换。
 * 2. 每题映射一个依恋类型键（att-secure/att-anxious/att-avoidant/att-fearful）。
 * 3. 支持 reverse 反向计分与 enabled 开关，满足生产维护需求。
 */

/**
 * 依恋类型键集合：
 * 关键逻辑：用于输入校验，避免非法 outcome_key 混入正式题库。
 */
const ATTACHMENT_OUTCOME_KEY_SET = new Set([
  "att-secure",
  "att-anxious",
  "att-avoidant",
  "att-fearful",
]);

/**
 * 用户提供原始 CSV 行：
 * 列顺序：id,question,outcome_key,reverse,weight,enabled。
 */
const ATTACHMENT_RAW_CSV_ROWS = `
id,question,outcome_key,reverse,weight,enabled
L001,"关系出现分歧时，我愿意主动沟通并修复",att-secure,false,1,true
L002,"我常常害怕被伴侣抛弃",att-anxious,false,1,true
L003,"我不习惯过于亲密的关系，想要保持距离",att-avoidant,false,1,true
L004,"我既想靠近又害怕靠近，内心很矛盾",att-fearful,false,1,true
L005,"我能安心依赖伴侣，也允许伴侣依赖我",att-secure,false,1,true
L006,"伴侣不回消息时，我会过度胡思乱想",att-anxious,false,1,true
L007,"我很少主动向伴侣表达内心的真实感受",att-avoidant,false,1,true
L008,"我渴望被爱，却又害怕投入后受伤",att-fearful,false,1,true
L009,"我能清晰表达自己在关系里的需求",att-secure,false,1,true
L010,"我很在意伴侣是否把我放在重要位置",att-anxious,false,1,true
L011,"过于亲密的接触会让我觉得不舒服",att-avoidant,false,1,true
L012,"靠近伴侣会不安，远离又会感到恐慌",att-fearful,false,1,true
L013,"我相信伴侣是可靠且值得信任的",att-secure,false,1,true
L014,"我会频繁查看伴侣的动态和消息",att-anxious,false,1,true
L015,"我不喜欢被伴侣过度关心和打扰",att-avoidant,false,1,true
L016,"我想依赖伴侣，又不敢真正敞开心扉",att-fearful,false,1,true
L017,"即使关系平淡，我也愿意稳定投入",att-secure,false,1,true
L018,"一点小事就会让我怀疑伴侣不爱我了",att-anxious,false,1,true
L019,"遇到矛盾时，我习惯沉默或躲开",att-avoidant,false,1,true
L020,"我在靠近和疏远伴侣之间反复纠结",att-fearful,false,1,true
L021,"吵架后我愿意冷静下来解决问题",att-secure,false,1,true
L022,"我常常需要伴侣反复确认爱我",att-anxious,false,1,true
L023,"我不喜欢依赖别人，也不喜欢别人依赖我",att-avoidant,false,1,true
L024,"我害怕被伤害，所以不敢完全投入感情",att-fearful,false,1,true
L025,"我能接纳伴侣的不完美，也欣赏其优点",att-secure,false,1,true
L026,"我容易在关系里变得敏感又卑微",att-anxious,false,1,true
L027,"我觉得一个人生活比恋爱更轻松自在",att-avoidant,false,1,true
L028,"我既渴望亲密，又害怕被亲密关系束缚",att-fearful,false,1,true
L029,"我不会因为爱伴侣就失去自我",att-secure,false,1,true
L030,"伴侣稍微冷淡，我就会感到不安",att-anxious,false,1,true
L031,"我很难完全信任伴侣，总会有所防备",att-avoidant,false,1,true
L032,"我想被偏爱，又不敢完全相信这份偏爱",att-fearful,false,1,true
L033,"我能接受和伴侣分开一段时间，不会焦虑",att-secure,false,1,true
L034,"我会因为害怕失去而刻意讨好伴侣",att-anxious,false,1,true
L035,"伴侣太黏人时，我会想刻意疏远",att-avoidant,false,1,true
L036,"我在关系里常常进退两难，不知所措",att-fearful,false,1,true
L037,"我愿意为关系负责，不逃避问题",att-secure,false,1,true
L038,"我的情绪很容易被伴侣的态度牵着走",att-anxious,false,1,true
L039,"我习惯用冷静伪装自己的真实情绪",att-avoidant,false,1,true
L040,"我害怕被控制，又害怕被伴侣冷落",att-fearful,false,1,true
L041,"我能坦然表达对伴侣的爱和在意",att-secure,false,1,true
L042,"我常常在关系里感到委屈，却不敢诉说",att-anxious,false,1,true
L043,"我更看重个人独立，而非亲密关系",att-avoidant,false,1,true
L044,"我想信任伴侣，又忍不住怀疑其真心",att-fearful,false,1,true
L045,"我尊重伴侣的空间，也会表达自身需求",att-secure,false,1,true
L046,"我越爱伴侣，越容易失去自我",att-anxious,false,1,true
L047,"我不擅长表达脆弱，只会用沉默应对",att-avoidant,false,1,true
L048,"我害怕亲密带来的伤害，又无法忍受孤独",att-fearful,false,1,true
L049,"我相信自己值得被稳定地爱着",att-secure,false,1,true
L050,"我需要很多关注才能感到安心",att-anxious,false,1,true
L051,"我不喜欢过度亲密的相处模式",att-avoidant,false,1,true
L052,"我在关系里常常感到纠结和内耗",att-fearful,false,1,true
L053,"我不会用冷战惩罚伴侣",att-secure,false,1,true
L054,"我很容易因为伴侣的一句话胡思乱想",att-anxious,false,1,true
L055,"我习惯和伴侣保持一定的心理距离",att-avoidant,false,1,true
L056,"我不敢完全依赖伴侣，也不敢彻底推开",att-fearful,false,1,true
L057,"我能给伴侣安全感，也能照顾好自己",att-secure,false,1,true
L058,"我常常担心伴侣会离开我",att-anxious,false,1,true
L059,"我很少主动向伴侣求助",att-avoidant,false,1,true
L060,"我既想让伴侣了解我，又害怕被看透",att-fearful,false,1,true
L061,"我在感情里整体是放松且安心的",att-secure,false,1,true
L062,"我会因为伴侣忽略我而感到难过",att-anxious,false,1,true
L063,"我不喜欢和伴侣分享太多私人想法",att-avoidant,false,1,true
L064,"我对亲密关系既期待又恐惧",att-fearful,false,1,true
`;

/**
 * 解析 CSV 布尔值。
 * 复杂度评估：O(1)。
 * @param {string} rawValue 原始值。
 * @param {boolean} fallbackValue 回退值。
 * @returns {boolean} 解析结果。
 */
function parseBoolean(rawValue, fallbackValue) {
  const normalizedValue = String(rawValue ?? "")
    .trim()
    .toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  return fallbackValue;
}

/**
 * 解析 CSV 数值。
 * 复杂度评估：O(1)。
 * @param {string} rawValue 原始值。
 * @param {number} fallbackValue 回退值。
 * @returns {number} 解析结果。
 */
function parseNumber(rawValue, fallbackValue) {
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

/**
 * 解析单行 CSV（支持双引号字段）。
 * 复杂度评估：O(L)，L 为行长度。
 * @param {string} rawLine 原始行文本。
 * @returns {Array<string>|null} 字段数组；解析失败返回 null。
 */
function parseCsvLine(rawLine) {
  const text = String(rawLine ?? "");
  const cellList = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const currentChar = text[index];

    if (currentChar === '"') {
      // 关键逻辑：处理双引号转义（"" -> "），避免字段截断。
      if (inQuotes && text[index + 1] === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (currentChar === "," && !inQuotes) {
      cellList.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    currentCell += currentChar;
  }

  if (inQuotes) {
    return null;
  }

  cellList.push(currentCell.trim());
  return cellList;
}

/**
 * 规范化 CSV 到内部题目结构。
 * 关键逻辑：
 * 1. 自动过滤表头与非法 outcome_key；
 * 2. 按 id + title 去重，避免脏数据导致重复题；
 * 3. 支持 enabled、reverse、weight 三个运行参数。
 * 复杂度评估：O(N * C)，N 为题量、C 为固定列数。
 * @param {string} rawCsvRows 原始 CSV 行文本。
 * @returns {Array<{ id: string, title: string, outcomeKey: string, reverse: boolean, weight: number }>} 规范化题目。
 */
function normalizeRawItems(rawCsvRows) {
  const lineList = String(rawCsvRows ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const seenIdSet = new Set();
  const seenTitleSet = new Set();
  const normalizedItems = [];

  lineList.forEach((lineItem) => {
    const parsedCells = parseCsvLine(lineItem);
    if (!Array.isArray(parsedCells) || parsedCells.length < 6) {
      return;
    }

    const questionId = String(parsedCells[0] ?? "").trim();
    const questionTitle = String(parsedCells[1] ?? "").trim();
    const outcomeKey = String(parsedCells[2] ?? "")
      .trim()
      .toLowerCase();

    if (
      !questionId ||
      !questionTitle ||
      !ATTACHMENT_OUTCOME_KEY_SET.has(outcomeKey) ||
      seenIdSet.has(questionId) ||
      seenTitleSet.has(questionTitle)
    ) {
      return;
    }

    const isEnabled = parseBoolean(parsedCells[5], true);
    if (!isEnabled) {
      return;
    }

    const reverse = parseBoolean(parsedCells[3], false);
    const weight = Math.max(0, parseNumber(parsedCells[4], 1));

    seenIdSet.add(questionId);
    seenTitleSet.add(questionTitle);
    normalizedItems.push({
      id: questionId,
      title: questionTitle,
      outcomeKey,
      reverse,
      weight,
    });
  });

  return normalizedItems;
}

/**
 * 构建 5 档同意度选项。
 * 关键逻辑：reverse=true 时使用反向计分。
 * 复杂度评估：O(1)。
 * @param {object} params 参数对象。
 * @param {string} params.id 题目 ID。
 * @param {string} params.outcomeKey 依恋类型键。
 * @param {boolean} params.reverse 是否反向计分。
 * @returns {Array<{ id: string, label: string, vector: Record<string, number> }>} 选项列表。
 */
function buildLikertOptions({ id, outcomeKey, reverse }) {
  const scoreLevels = reverse ? [0, 1, 2, 3, 4] : [4, 3, 2, 1, 0];

  return [
    {
      id: `${id}-option-a`,
      label: "非常同意",
      vector: { [outcomeKey]: scoreLevels[0] },
    },
    {
      id: `${id}-option-b`,
      label: "同意",
      vector: { [outcomeKey]: scoreLevels[1] },
    },
    {
      id: `${id}-option-c`,
      label: "中立",
      vector: { [outcomeKey]: scoreLevels[2] },
    },
    {
      id: `${id}-option-d`,
      label: "不太同意",
      vector: { [outcomeKey]: scoreLevels[3] },
    },
    {
      id: `${id}-option-e`,
      label: "非常不同意",
      vector: { [outcomeKey]: scoreLevels[4] },
    },
  ];
}

/**
 * 将规范化题目转换为标准题库对象。
 * 复杂度评估：O(N)。
 * @param {Array<{ id: string, title: string, outcomeKey: string, reverse: boolean, weight: number }>} rawItems 规范化题目。
 * @returns {Array<object>} 标准题库。
 */
function buildQuestionBankFromRawItems(rawItems) {
  return rawItems.map((rawItem) => ({
    id: rawItem.id,
    title: rawItem.title,
    contextLabel: "",
    description: "请根据符合程度作答。",
    weight: rawItem.weight,
    options: buildLikertOptions({
      id: rawItem.id,
      outcomeKey: rawItem.outcomeKey,
      reverse: rawItem.reverse,
    }),
  }));
}

/**
 * 规范化后的 64 题数据。
 */
const ATTACHMENT_NORMALIZED_ITEMS = normalizeRawItems(ATTACHMENT_RAW_CSV_ROWS);

/**
 * 依恋类型 64 题题库导出。
 */
export const ATTACHMENT_CORE_64_QUESTION_BANK = buildQuestionBankFromRawItems(
  ATTACHMENT_NORMALIZED_ITEMS,
);
