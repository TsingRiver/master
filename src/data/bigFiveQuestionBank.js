/**
 * 大五人格题库（用户提供版）：
 * 1. 原始输入为 CSV 行文本，便于后续继续替换和审校。
 * 2. 每题映射一个 outcome_key（与现有大五分析结果键保持一致）。
 * 3. 支持 reverse 反向计分、weight 权重与 enabled 开关。
 */

/**
 * 大五结果键集合：
 * 关键逻辑：用于校验输入 outcome_key，避免非法值污染题库。
 */
const BIG_FIVE_OUTCOME_KEY_SET = new Set([
  "bf-scoei",
  "bf-sco--",
  "bf--oei",
  "bf-sc--i",
  "bf-s--e-",
  "bf--c-i",
]);

/**
 * 用户提供原始 CSV 行：
 * 列顺序：id,question,outcome_key,reverse,weight,enabled。
 */
const BIG_FIVE_RAW_CSV_ROWS = `
id,question,outcome_key,reverse,weight,enabled
B001,"我喜欢尝试新方法而不是重复旧流程",bf-scoei,false,1,true
B002,"我做事前会先设好计划并按节点推进",bf-sc--i,false,1,true
B003,"我在人多的场景中容易主动发起交流",bf-s--e-,false,1,true
B004,"我更喜欢独立深度思考，不爱高频社交",bf--c-i,false,1,true
B005,"我对情绪和体验细节很敏感",bf--oei,false,1,true
B006,"我会优先结果与效率，即使过程有压力",bf-sco--,false,1,true
B007,"我经常半途切换目标，难以长期坚持",bf-sc--i,true,1,true
B008,"我更愿意先听感受，再讨论对错",bf--oei,false,1,true
B009,"我会主动复盘并持续优化自己的方法",bf-scoei,false,1,true
B010,"我对陌生变化通常会先观望再行动",bf--c-i,false,1,true
B011,"我乐于接受新鲜事物，不排斥未知挑战",bf-scoei,false,1,true
B012,"我做事有条理，很少出现混乱无序的情况",bf-sco--,false,1,true
B013,"我能快速融入新群体，与陌生人轻松搭话",bf-s--e-,false,1,true
B014,"我享受独处时光，不觉得孤独或无聊",bf--c-i,false,1,true
B015,"我容易察觉他人的情绪变化并共情",bf--oei,false,1,true
B016,"我面对任务时，会全力以赴追求最优结果",bf-sco--,false,1,true
B017,"我做事容易分心，难以长时间专注一件事",bf-sc--i,true,1,true
B018,"我喜欢参与集体活动，不喜欢独自待着",bf-s--e-,false,1,true
B019,"我愿意尝试不同的生活方式，突破舒适区",bf-scoei,false,1,true
B020,"我做决定前会谨慎思考，不轻易冲动",bf--c-i,false,1,true
B021,"我对新观点、新思想抱有开放接纳的态度",bf-scoei,false,1,true
B022,"我注重细节，能发现别人忽略的小问题",bf-sc--i,false,1,true
B023,"我善于表达自己的想法，不害怕当众发言",bf-s--e-,false,1,true
B024,"我不擅长主动社交，通常等待别人主动",bf--c-i,false,1,true
B025,"我对他人的需求很敏感，愿意提供帮助",bf--oei,false,1,true
B026,"我有强烈的责任心，答应的事一定会做到",bf-sco--,false,1,true
B027,"我常常拖延任务，不到最后不着急完成",bf-sc--i,true,1,true
B028,"我乐于分享自己的经历和感受，增进彼此了解",bf--oei,false,1,true
B029,"我喜欢探索未知领域，充满好奇心",bf-scoei,false,1,true
B030,"我性格沉稳，遇到突发情况不会慌乱",bf--c-i,false,1,true
B031,"我愿意倾听不同的意见，不固执己见",bf--oei,false,1,true
B032,"我做事有始有终，不会轻易半途而废",bf-sco--,false,1,true
B033,"我在社交场合中很活跃，能带动氛围",bf-s--e-,false,1,true
B034,"我更倾向于独立完成任务，不依赖他人",bf--c-i,false,1,true
B035,"我情感丰富，容易被文字、画面打动",bf--oei,false,1,true
B036,"我面对困难时，会积极寻找解决办法",bf-sco--,false,1,true
B037,"我做事缺乏规划，常常临时抱佛脚",bf-sc--i,true,1,true
B038,"我喜欢结交新朋友，拓展自己的社交圈",bf-s--e-,false,1,true
B039,"我对新鲜事物充满热情，愿意主动尝试",bf-scoei,false,1,true
B040,"我不喜欢频繁社交，会觉得身心疲惫",bf--c-i,false,1,true
B041,"我善于观察，能捕捉到环境中的细微变化",bf--oei,false,1,true
B042,"我注重效率，会合理安排时间完成任务",bf-sco--,false,1,true
B043,"我容易半途而废，缺乏坚持下去的毅力",bf-sc--i,true,1,true
B044,"我能快速适应新的社交环境，不怯生",bf-s--e-,false,1,true
B045,"我愿意接受新的挑战，不畏惧失败",bf-scoei,false,1,true
B046,"我做决定时很谨慎，会反复权衡利弊",bf-sc--i,false,1,true
B047,"我对各种文化、理念都抱有开放的心态",bf-scoei,false,1,true
B048,"我做事严谨认真，不敷衍、不马虎",bf-sco--,false,1,true
B049,"我喜欢与人交流合作，不喜欢单打独斗",bf-s--e-,false,1,true
B050,"我独处时能更好地整理思路，提高效率",bf--c-i,false,1,true
B051,"我能理解他人的处境，给予包容和支持",bf--oei,false,1,true
B052,"我有很强的执行力，能快速落实计划",bf-sco--,false,1,true
B053,"我做事没有耐心，容易急躁冒进",bf-sc--i,true,1,true
B054,"我乐于参与社交活动，享受与人相处的时光",bf-s--e-,false,1,true
B055,"我喜欢探索新的可能性，不局限于现状",bf-scoei,false,1,true
B056,"我性格内敛，不善于表达自己的情绪",bf--c-i,false,1,true
B057,"我对他人的情绪很敏感，容易被影响",bf--oei,false,1,true
B058,"我面对责任时，会勇于承担，不推诿",bf-sco--,false,1,true
B059,"我做事缺乏条理，常常丢三落四",bf-sc--i,true,1,true
B060,"我善于与人打交道，能建立良好的人际关系",bf-s--e-,false,1,true
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
      // 关键逻辑：处理双引号转义（"" -> "），避免字段解析异常。
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
 * 1. 过滤表头、非法 outcome_key、空题干；
 * 2. 按 id + title 双重去重；
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
      !BIG_FIVE_OUTCOME_KEY_SET.has(outcomeKey) ||
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
 * @param {string} params.outcomeKey 大五结果键。
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
 * 规范化后的 60 题数据。
 */
const BIG_FIVE_NORMALIZED_ITEMS = normalizeRawItems(BIG_FIVE_RAW_CSV_ROWS);

/**
 * 大五人格 core60 题库导出。
 */
export const BIG_FIVE_CORE_60_QUESTION_BANK = buildQuestionBankFromRawItems(
  BIG_FIVE_NORMALIZED_ITEMS,
);
