/**
 * 九型人格题库（用户提供版）：
 * 1. 原始输入为 CSV 行文本，便于后续直接替换。
 * 2. 每题映射一个主倾向（e1 ~ e9），并统一输出 5 档同意度选项。
 * 3. 支持 reverse 反向计分，保证后续扩充时无需改分析器。
 */

/**
 * 九型 key 固定顺序：
 * 关键逻辑：与 CSV 中 type_1 ~ type_9 列一一对应，避免映射偏移。
 */
const ENNEAGRAM_OUTCOME_KEYS = ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9"];

/**
 * 用户提供原始 CSV 行：
 * 列顺序：id,question,type_1~type_9,reverse,weight,enabled。
 */
const ENNEAGRAM_RAW_CSV_ROWS = `
Q001,"我做事时会先考虑规则与正确性",1,0,0,0,0,0,0,0,0,false,1,true
Q002,"我经常优先满足他人的需要",0,1,0,0,0,0,0,0,0,false,1,true
Q003,"我很在意自己是否优秀、有成就",0,0,1,0,0,0,0,0,0,false,1,true
Q004,"我总觉得自己和别人不太一样",0,0,0,1,0,0,0,0,0,false,1,true
Q005,"我喜欢独处思考，不想被打扰",0,0,0,0,1,0,0,0,0,false,1,true
Q006,"我容易担心、害怕出错或意外",0,0,0,0,0,1,0,0,0,false,1,true
Q007,"我喜欢新鲜有趣、开心自由的事",0,0,0,0,0,0,1,0,0,false,1,true
Q008,"我不喜欢被控制，习惯自己做主",0,0,0,0,0,0,0,1,0,false,1,true
Q009,"我喜欢平和安稳，不想起冲突",0,0,0,0,0,0,0,0,1,false,1,true
Q010,"我很难容忍不守规矩的行为",1,0,0,0,0,0,0,0,0,false,1,true
Q011,"我很会察言观色，照顾别人情绪",0,1,0,0,0,0,0,0,0,false,1,true
Q012,"我渴望被认可，成为厉害的人",0,0,1,0,0,0,0,0,0,false,1,true
Q013,"我容易沉浸在自己的情绪世界里",0,0,0,1,0,0,0,0,0,false,1,true
Q014,"我喜欢研究原理、深挖本质",0,0,0,0,1,0,0,0,0,false,1,true
Q015,"我做决定前会反复考虑风险",0,0,0,0,0,1,0,0,0,false,1,true
Q016,"我讨厌沉闷，总想找点乐子",0,0,0,0,0,0,1,0,0,false,1,true
Q017,"我遇到不公时会直接站出来反抗",0,0,0,0,0,0,0,1,0,false,1,true
Q018,"我习惯妥协，维持和谐气氛",0,0,0,0,0,0,0,0,1,false,1,true
Q019,"我对自己和别人要求都很高",1,0,0,0,0,0,0,0,0,false,1,true
Q020,"我常常忽略自己去成全别人",0,1,0,0,0,0,0,0,0,false,1,true
Q021,"我很在意形象，希望看起来体面",0,0,1,0,0,0,0,0,0,false,1,true
Q022,"我容易感伤，怀念过去或遗憾",0,0,0,1,0,0,0,0,0,false,1,true
Q023,"我喜欢安静思考胜过社交",0,0,0,0,1,0,0,0,0,false,1,true
Q024,"我经常担心事情往坏的方向发展",0,0,0,0,0,1,0,0,0,false,1,true
Q025,"我遇到压力会转移注意力找快乐",0,0,0,0,0,0,1,0,0,false,1,true
Q026,"我不喜欢示弱，习惯强势保护自己",0,0,0,0,0,0,0,1,0,false,1,true
Q027,"我尽量避免争吵，能忍则忍",0,0,0,0,0,0,0,0,1,false,1,true
Q028,"我觉得对错比人情更重要",1,0,0,0,0,0,0,0,0,false,1,true
Q029,"别人有困难我会主动帮忙",0,1,0,0,0,0,0,0,0,false,1,true
Q030,"我会为目标努力，不断提升自己",0,0,1,0,0,0,0,0,0,false,1,true
Q031,"我追求独特，不想随波逐流",0,0,0,1,0,0,0,0,0,false,1,true
Q032,"我喜欢收集知识，充实内在",0,0,0,0,1,0,0,0,0,false,1,true
Q033,"我信任可靠、有安全感的人和事",0,0,0,0,0,1,0,0,0,false,1,true
Q034,"我喜欢规划很多好玩的事",0,0,0,0,0,0,1,0,0,false,1,true
Q035,"我习惯掌控局面，不喜欢被动",0,0,0,0,0,0,0,1,0,false,1,true
Q036,"我心态随和，不太计较得失",0,0,0,0,0,0,0,0,1,false,1,true
Q037,"我发现错误会立刻指出来",1,0,0,0,0,0,0,0,0,false,1,true
Q038,"我很在意别人开不开心",0,1,0,0,0,0,0,0,0,false,1,true
Q039,"我希望自己效率高、有竞争力",0,0,1,0,0,0,0,0,0,false,1,true
Q040,"我容易被情绪牵动，内心敏感",0,0,0,1,0,0,0,0,0,false,1,true
Q041,"我社交能量有限，需要独处恢复",0,0,0,0,1,0,0,0,0,false,1,true
Q042,"我习惯防备，不容易完全信任",0,0,0,0,0,1,0,0,0,false,1,true
Q043,"我喜欢尝试新鲜事物和体验",0,0,0,0,0,0,1,0,0,false,1,true
Q044,"我说话直接，不喜欢绕弯子",0,0,0,0,0,0,0,1,0,false,1,true
Q045,"我喜欢轻松自在，不喜欢压力",0,0,0,0,0,0,0,0,1,false,1,true
Q046,"我做事认真负责，不敷衍",1,0,0,0,0,0,0,0,0,false,1,true
Q047,"我习惯付出，希望被人需要",0,1,0,0,0,0,0,0,0,false,1,true
Q048,"我会主动展示自己的优点",0,0,1,0,0,0,0,0,0,false,1,true
Q049,"我追求有深度、有灵魂的东西",0,0,0,1,0,0,0,0,0,false,1,true
Q050,"我喜欢观察分析，少说话多思考",0,0,0,0,1,0,0,0,0,false,1,true
Q051,"我遇到压力会变得谨慎多疑",0,0,0,0,0,1,0,0,0,false,1,true
Q052,"我习惯往好处想，保持乐观",0,0,0,0,0,0,1,0,0,false,1,true
Q053,"我不喜欢被命令，讨厌被束缚",0,0,0,0,0,0,0,1,0,false,1,true
Q054,"我愿意配合别人，维持平稳",0,0,0,0,0,0,0,0,1,false,1,true
Q055,"我很难接受混乱和不规范",1,0,0,0,0,0,0,0,0,false,1,true
Q056,"我很会安慰人，理解别人痛苦",0,1,0,0,0,0,0,0,0,false,1,true
Q057,"我渴望成功，不想一事无成",0,0,1,0,0,0,0,0,0,false,1,true
Q058,"我常常觉得自己不被理解",0,0,0,1,0,0,0,0,0,false,1,true
Q059,"我喜欢独立思考，不依赖他人",0,0,0,0,1,0,0,0,0,false,1,true
Q060,"我做事前会设想最坏情况",0,0,0,0,0,1,0,0,0,false,1,true
Q061,"我压力大时会逃避去玩",0,0,0,0,0,0,1,0,0,false,1,true
Q062,"我保护身边的人，不容许被欺负",0,0,0,0,0,0,0,1,0,false,1,true
Q063,"我不喜欢冲突，尽量息事宁人",0,0,0,0,0,0,0,0,1,false,1,true
Q064,"我对自己的失误会自责很久",1,0,0,0,0,0,0,0,0,false,1,true
Q065,"我习惯先考虑别人再考虑自己",0,1,0,0,0,0,0,0,0,false,1,true
Q066,"我会为目标牺牲娱乐时间",0,0,1,0,0,0,0,0,0,false,1,true
Q067,"我喜欢艺术、美感和精神共鸣",0,0,0,1,0,0,0,0,0,false,1,true
Q068,"我喜欢深入研究，成为专业人士",0,0,0,0,1,0,0,0,0,false,1,true
Q069,"我需要安全感，害怕被抛弃",0,0,0,0,0,1,0,0,0,false,1,true
Q070,"我喜欢自由，不想被计划限制",0,0,0,0,0,0,1,0,0,false,1,true
Q071,"我有主见，不容易被说服",0,0,0,0,0,0,0,1,0,false,1,true
Q072,"我顺其自然，不太强求结果",0,0,0,0,0,0,0,0,1,false,1,true
Q073,"我讲究原则，不轻易妥协",1,0,0,0,0,0,0,0,0,false,1,true
Q074,"我很会照顾人，让人觉得温暖",0,1,0,0,0,0,0,0,0,false,1,true
Q075,"我希望被赞美、被崇拜",0,0,1,0,0,0,0,0,0,false,1,true
Q076,"我容易陷入孤独和自我怀疑",0,0,0,1,0,0,0,0,0,false,1,true
Q077,"我不喜欢闲聊，更愿意深度交流",0,0,0,0,1,0,0,0,0,false,1,true
Q078,"我习惯依赖可靠的人或规则",0,0,0,0,0,1,0,0,0,false,1,true
Q079,"我喜欢畅想未来，充满期待",0,0,0,0,0,0,1,0,0,false,1,true
Q080,"我面对挑战会迎难而上",0,0,0,0,0,0,0,1,0,false,1,true
Q081,"我喜欢简单安稳的日常生活",0,0,0,0,0,0,0,0,1,false,1,true
Q082,"我追求完美，不允许马虎",1,0,0,0,0,0,0,0,0,false,1,true
Q083,"我常常为别人着想，委屈自己",0,1,0,0,0,0,0,0,0,false,1,true
Q084,"我会不断学习，让自己更优秀",0,0,1,0,0,0,0,0,0,false,1,true
Q085,"我在意真实感受，讨厌虚伪",0,0,0,1,0,0,0,0,0,false,1,true
Q086,"我喜欢保留隐私，不轻易敞开",0,0,0,0,1,0,0,0,0,false,1,true
Q087,"我容易焦虑，需要反复确认",0,0,0,0,0,1,0,0,0,false,1,true
Q088,"我喜欢轻松幽默，化解尴尬",0,0,0,0,0,0,1,0,0,false,1,true
Q089,"我不喜欢被指使，要掌握主动权",0,0,0,0,0,0,0,1,0,false,1,true
Q090,"我性格温和，不容易生气",0,0,0,0,0,0,0,0,1,false,1,true
Q091,"我看到不合理就想纠正",1,0,0,0,0,0,0,0,0,false,1,true
Q092,"我很会讨好，让别人喜欢我",0,1,0,0,0,0,0,0,0,false,1,true
Q093,"我目标感强，做事很有冲劲",0,0,1,0,0,0,0,0,0,false,1,true
Q094,"我追求独特品味，拒绝平庸",0,0,0,1,0,0,0,0,0,false,1,true
Q095,"我喜欢思考人生、意义与本质",0,0,0,0,1,0,0,0,0,false,1,true
Q096,"我害怕变化，喜欢稳定环境",0,0,0,0,0,1,0,0,0,false,1,true
Q097,"我喜欢多尝试，人生要尽兴",0,0,0,0,0,0,1,0,0,false,1,true
Q098,"我强势果断，不优柔寡断",0,0,0,0,0,0,0,1,0,false,1,true
Q099,"我愿意让步，让大家都舒服",0,0,0,0,0,0,0,0,1,false,1,true
Q100,"我做事有条理，按步骤来",1,0,0,0,0,0,0,0,0,false,1,true
Q101,"我习惯付出，不求立刻回报",0,1,0,0,0,0,0,0,0,false,1,true
Q102,"我很在意成绩、排名和评价",0,0,1,0,0,0,0,0,0,false,1,true
Q103,"我容易多愁善感，内心细腻",0,0,0,1,0,0,0,0,0,false,1,true
Q104,"我喜欢独处充电，再出门社交",0,0,0,0,1,0,0,0,0,false,1,true
Q105,"我做决定很慢，怕后悔",0,0,0,0,0,1,0,0,0,false,1,true
Q106,"我讨厌被束缚，向往自由",0,0,0,0,0,0,1,0,0,false,1,true
Q107,"我不喜欢被欺负，会反击",0,0,0,0,0,0,0,1,0,false,1,true
Q108,"我性格佛系，随遇而安",0,0,0,0,0,0,0,0,1,false,1,true
Q109,"我对自己要求严格，不松懈",1,0,0,0,0,0,0,0,0,false,1,true
Q110,"我很会体谅别人的难处",0,1,0,0,0,0,0,0,0,false,1,true
Q111,"我希望成为行业里出色的人",0,0,1,0,0,0,0,0,0,false,1,true
Q112,"我喜欢真实表达，不伪装",0,0,0,1,0,0,0,0,0,false,1,true
Q113,"我喜欢安静思考，不被打扰",0,0,0,0,1,0,0,0,0,false,1,true
Q114,"我需要被保障，才敢放心",0,0,0,0,0,1,0,0,0,false,1,true
Q115,"我喜欢玩乐，享受当下",0,0,0,0,0,0,1,0,0,false,1,true
Q116,"我习惯保护自己和家人",0,0,0,0,0,0,0,1,0,false,1,true
Q117,"我不喜欢竞争，和平就好",0,0,0,0,0,0,0,0,1,false,1,true
Q118,"我觉得做人要正直守规矩",1,0,0,0,0,0,0,0,0,false,1,true
Q119,"我愿意为关系牺牲自我",0,1,0,0,0,0,0,0,0,false,1,true
Q120,"我很有上进心，不甘平凡",0,0,1,0,0,0,0,0,0,false,1,true
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
 * 解析单行 CSV（支持双引号包裹字段）。
 * 复杂度评估：O(L)，L 为行长度。
 * @param {string} rawLine 原始行文本。
 * @returns {Array<string>|null} 字段数组，解析失败返回 null。
 */
function parseCsvLine(rawLine) {
  const text = String(rawLine ?? "");
  const cellList = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      // 关键逻辑：双引号转义（""）需要折叠成一个字符，避免字段截断。
      if (inQuotes && text[index + 1] === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cellList.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (inQuotes) {
    return null;
  }

  cellList.push(currentCell.trim());
  return cellList;
}

/**
 * 从 type_1 ~ type_9 分值中解析主倾向 key。
 * 关键逻辑：使用“最大值优先、并列取前”策略，保证结果稳定可复现。
 * 复杂度评估：O(K)，K=9。
 * @param {Array<number>} typeScores 九型分值列表。
 * @returns {string|null} 九型 key（e1~e9）。
 */
function resolveOutcomeKey(typeScores) {
  let maxScore = Number.NEGATIVE_INFINITY;
  let maxIndex = -1;

  typeScores.forEach((score, index) => {
    if (score > maxScore) {
      maxScore = score;
      maxIndex = index;
    }
  });

  if (maxScore <= 0 || maxIndex < 0) {
    return null;
  }

  return ENNEAGRAM_OUTCOME_KEYS[maxIndex] ?? null;
}

/**
 * 规范化用户 CSV 行到内部题目结构。
 * 关键逻辑：
 * 1. 过滤无效/禁用题；
 * 2. 按 id 与题干双重去重；
 * 3. 保留输入顺序，确保历史会话可追踪。
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
    if (!Array.isArray(parsedCells) || parsedCells.length < 14) {
      return;
    }

    const questionId = String(parsedCells[0] ?? "").trim();
    const questionTitle = String(parsedCells[1] ?? "").trim();
    if (!questionId || !questionTitle) {
      return;
    }

    const isEnabled = parseBoolean(parsedCells[13], true);
    if (!isEnabled || seenIdSet.has(questionId) || seenTitleSet.has(questionTitle)) {
      return;
    }

    const typeScores = parsedCells.slice(2, 11).map((scoreCell) => parseNumber(scoreCell, 0));
    const outcomeKey = resolveOutcomeKey(typeScores);
    if (!outcomeKey) {
      return;
    }

    const reverse = parseBoolean(parsedCells[11], false);
    const weight = Math.max(0, parseNumber(parsedCells[12], 1));

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
 * 构建九型题目的 5 档同意度选项。
 * 关键逻辑：reverse=true 时反转分值映射，兼容反向题计分。
 * 复杂度评估：O(1)。
 * @param {object} params 参数对象。
 * @param {string} params.id 题目 ID。
 * @param {string} params.outcomeKey 九型 key。
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
 * 规范化后的用户题库。
 */
const ENNEAGRAM_NORMALIZED_ITEMS = normalizeRawItems(ENNEAGRAM_RAW_CSV_ROWS);

/**
 * 36 题速测版独立原始题库（用户提供）：
 * 列顺序：id,question,type_1~type_9,reverse,weight,enabled。
 * 关键逻辑：与 120 题专业版解耦，避免“速测版被专业版截断”导致题面不一致。
 */
const ENNEAGRAM_QUICK_36_RAW_CSV_ROWS = `
Q001,"我做事讲究对错，不允许马虎敷衍",1,0,0,0,0,0,0,0,0,false,1,true
Q002,"我对自己和他人都有严格的标准要求",1,0,0,0,0,0,0,0,0,false,1,true
Q003,"我看不惯不合理、不公正的事情",1,0,0,0,0,0,0,0,0,false,1,true
Q004,"我习惯按规则流程做事，讨厌随意变通",1,0,0,0,0,0,0,0,0,false,1,true
Q005,"我很容易察觉别人的需要并主动照顾",0,1,0,0,0,0,0,0,0,false,1,true
Q006,"我习惯优先满足别人，常常忽略自己",0,1,0,0,0,0,0,0,0,false,1,true
Q007,"我很在意人际关系和谐，愿意主动付出",0,1,0,0,0,0,0,0,0,false,1,true
Q008,"我容易因为别人不领情而感到委屈",0,1,0,0,0,0,0,0,0,false,1,true
Q009,"我很在意成就，希望被看见、被认可",0,0,1,0,0,0,0,0,0,false,1,true
Q010,"我会努力表现出优秀高效的一面",0,0,1,0,0,0,0,0,0,false,1,true
Q011,"我习惯用成绩证明自己的价值",0,0,1,0,0,0,0,0,0,false,1,true
Q012,"我很在意形象，不想显得失败或平庸",0,0,1,0,0,0,0,0,0,false,1,true
Q013,"我总觉得自己和别人不一样，难以被理解",0,0,0,1,0,0,0,0,0,false,1,true
Q014,"我容易沉浸情绪，对失落和遗憾特别敏感",0,0,0,1,0,0,0,0,0,false,1,true
Q015,"我向往深刻真实，讨厌肤浅平淡",0,0,0,1,0,0,0,0,0,false,1,true
Q016,"我习惯向内探索，重视内心感受与意义",0,0,0,1,0,0,0,0,0,false,1,true
Q017,"我喜欢独处思考，不喜欢被打扰",0,0,0,0,1,0,0,0,0,false,1,true
Q018,"我习惯观察分析，不太愿意表露情绪",0,0,0,0,1,0,0,0,0,false,1,true
Q019,"我重视知识与能力，以此获得安全感",0,0,0,0,1,0,0,0,0,false,1,true
Q020,"我能独立解决问题，不依赖他人",0,0,0,0,1,0,0,0,0,false,1,true
Q021,"我容易担心不安，做事谨慎小心",0,0,0,0,0,1,0,0,0,false,1,true
Q022,"我重视可靠与安全，不喜欢冒险",0,0,0,0,0,1,0,0,0,false,1,true
Q023,"我会反复确认，避免出错或意外",0,0,0,0,0,1,0,0,0,false,1,true
Q024,"我需要信任的人给我支持和肯定",0,0,0,0,0,1,0,0,0,false,1,true
Q025,"我喜欢新鲜有趣，讨厌枯燥压抑",0,0,0,0,0,0,1,0,0,false,1,true
Q026,"我习惯往好处想，逃避负面情绪",0,0,0,0,0,0,1,0,0,false,1,true
Q027,"我兴趣很多，喜欢多尝试、多体验",0,0,0,0,0,0,1,0,0,false,1,true
Q028,"我不喜欢被限制，渴望自由轻松",0,0,0,0,0,0,1,0,0,false,1,true
Q029,"我性格直接强势，不喜欢被控制",0,0,0,0,0,0,0,1,0,false,1,true
Q030,"我敢于保护自己和身边的人",0,0,0,0,0,0,0,1,0,false,1,true
Q031,"我不喜欢示弱，习惯自己扛下压力",0,0,0,0,0,0,0,1,0,false,1,true
Q032,"我面对冲突不会退缩，会直接面对",0,0,0,0,0,0,0,1,0,false,1,true
Q033,"我不喜欢冲突，希望大家和平相处",0,0,0,0,0,0,0,0,1,false,1,true
Q034,"我习惯随和迁就，不愿与人对立",0,0,0,0,0,0,0,0,1,false,1,true
Q035,"我容易忽略自己的立场，跟着别人走",0,0,0,0,0,0,0,0,1,false,1,true
Q036,"我喜欢安稳舒适，不喜欢变动和压力",0,0,0,0,0,0,0,0,1,false,1,true
`;

/**
 * 36 题速测版规范化题目。
 */
const ENNEAGRAM_QUICK_36_NORMALIZED_ITEMS = normalizeRawItems(ENNEAGRAM_QUICK_36_RAW_CSV_ROWS);

/**
 * 120 题专业版题库导出。
 */
export const ENNEAGRAM_PRO_120_QUESTION_BANK = buildQuestionBankFromRawItems(
  ENNEAGRAM_NORMALIZED_ITEMS,
);

/**
 * 36 题速测版题库导出：
 * 关键逻辑：使用独立题库，不再从专业版截取，保证题面可独立维护。
 */
export const ENNEAGRAM_QUICK_36_QUESTION_BANK = buildQuestionBankFromRawItems(
  ENNEAGRAM_QUICK_36_NORMALIZED_ITEMS,
);
