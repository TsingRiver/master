/**
 * 经典荣格题库（用户提供版）：
 * 1. 原始输入为 CSV 行文本，便于后续继续批量替换。
 * 2. 每题映射一个功能键（j-te ~ j-ni），统一输出 5 档同意度选项。
 * 3. 支持 reverse 反向计分与 enabled 开关，满足生产维护场景。
 */

/**
 * 经典荣格功能键集合：
 * 关键逻辑：用于输入校验，避免非法 outcome_key 进入线上题库。
 */
const JUNG_OUTCOME_KEY_SET = new Set([
  "j-te",
  "j-ti",
  "j-fe",
  "j-fi",
  "j-se",
  "j-si",
  "j-ne",
  "j-ni",
]);

/**
 * 用户提供原始 CSV 行：
 * 列顺序：id,question,outcome_key,reverse,weight,enabled。
 */
const JUNG_RAW_CSV_ROWS = `
J001,"我做决定时会先搭建清晰的执行结构",j-te,false,1,true
J002,"我会先追求逻辑自洽，再决定是否行动",j-ti,false,1,true
J003,"我会先关注现场氛围与他人感受",j-fe,false,1,true
J004,"我更在意自己内心是否认同，而非外界评价",j-fi,false,1,true
J005,"我对当下环境、细节和感官体验很敏感",j-se,false,1,true
J006,"我容易回忆过去经验，习惯参照过往",j-si,false,1,true
J007,"我很容易联想到各种可能性与关联",j-ne,false,1,true
J008,"我能直接感知事物背后的核心方向",j-ni,false,1,true
J009,"我重视效率、规则与结果",j-te,false,1,true
J010,"我习惯在心里梳理逻辑，不依赖外部标准",j-ti,false,1,true
J011,"我会主动照顾他人情绪，维持和谐",j-fe,false,1,true
J012,"我忠于内心真实感受与个人价值观",j-fi,false,1,true
J013,"我喜欢当下体验，享受实时互动",j-se,false,1,true
J014,"我重视熟悉感、惯例与稳定秩序",j-si,false,1,true
J015,"我兴趣广泛，喜欢发散思考",j-ne,false,1,true
J016,"我能洞察本质，看到长远趋势",j-ni,false,1,true
J017,"我做事讲究条理、计划与进度",j-te,false,1,true
J018,"我喜欢分析原理，追求精准合理",j-ti,false,1,true
J019,"我在意他人需求，容易共情",j-fe,false,1,true
J020,"我凭内心真诚度判断是非",j-fi,false,1,true
J021,"我喜欢动手实践、直观感受",j-se,false,1,true
J022,"我习惯依赖过去经验做判断",j-si,false,1,true
J023,"我擅长举一反三，产生新想法",j-ne,false,1,true
J024,"我对未来方向有强烈直觉",j-ni,false,1,true
J025,"我强调客观标准与执行力",j-te,false,1,true
J026,"我逻辑清晰，擅长抽丝剥茧",j-ti,false,1,true
J027,"我善于融入群体，照顾集体感受",j-fe,false,1,true
J028,"我坚持自我立场，不轻易妥协",j-fi,false,1,true
J029,"我反应快，擅长临场应变",j-se,false,1,true
J030,"我重视安全感与传统习惯",j-si,false,1,true
J031,"我思维跳跃，喜欢脑洞与创意",j-ne,false,1,true
J032,"我专注深层意义，而非表面",j-ni,false,1,true
J033,"我目标明确，推动事情落地",j-te,false,1,true
J034,"我追求内在逻辑一致",j-ti,false,1,true
J035,"我善于理解他人立场",j-fe,false,1,true
J036,"我重视真诚与个人信念",j-fi,false,1,true
J037,"我享受当下刺激与新鲜感",j-se,false,1,true
J038,"我对细节和过往印象深刻",j-si,false,1,true
J039,"我能看到多种可能与选择",j-ne,false,1,true
J040,"我直觉强烈，相信第六感",j-ni,false,1,true
J041,"我做事果断，强调结果导向",j-te,false,1,true
J042,"我擅长独立思考，理性冷静",j-ti,false,1,true
J043,"我愿意为关系和谐付出",j-fe,false,1,true
J044,"我遵从内心良知与好恶",j-fi,false,1,true
J045,"我注重现实体验，活在当下",j-se,false,1,true
J046,"我念旧，重视回忆与稳定",j-si,false,1,true
J047,"我喜欢探索不同可能性",j-ne,false,1,true
J048,"我能直达事物核心",j-ni,false,1,true
J049,"我擅长组织安排，推进事务",j-te,false,1,true
J050,"我分析问题客观中立",j-ti,false,1,true
J051,"我容易察觉他人情绪",j-fe,false,1,true
J052,"我重视真实自我表达",j-fi,false,1,true
J053,"我对环境变化很敏锐",j-se,false,1,true
J054,"我遵循惯例，不喜变动",j-si,false,1,true
J055,"我思维开放，接纳新可能",j-ne,false,1,true
J056,"我有强烈的内在洞见",j-ni,false,1,true
J057,"我看重秩序、责任与执行力",j-te,false,1,true
J058,"我擅长逻辑解构与推理",j-ti,false,1,true
J059,"我重视集体情感与共识",j-fe,false,1,true
J060,"我忠于自我感受与价值观",j-fi,false,1,true
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
      // 关键逻辑：处理双引号转义（"" -> "），避免字段提前截断。
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
 * 1. 过滤非法 outcome_key；
 * 2. 按 id + title 去重；
 * 3. 支持 enabled 开关与 reverse、weight 参数。
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
      !JUNG_OUTCOME_KEY_SET.has(outcomeKey) ||
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
 * 关键逻辑：reverse=true 时反向计分，保证反向题兼容。
 * 复杂度评估：O(1)。
 * @param {object} params 参数对象。
 * @param {string} params.id 题目 ID。
 * @param {string} params.outcomeKey 经典荣格功能键。
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
 * @returns {Array<object>} 标准题库数组。
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
 * 规范化后的经典荣格题目。
 */
const JUNG_CLASSIC_NORMALIZED_ITEMS = normalizeRawItems(JUNG_RAW_CSV_ROWS);

/**
 * 经典荣格 60 题题库导出。
 */
export const JUNG_CLASSIC_QUESTION_BANK = buildQuestionBankFromRawItems(
  JUNG_CLASSIC_NORMALIZED_ITEMS,
);
