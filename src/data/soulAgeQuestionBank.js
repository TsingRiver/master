/**
 * 灵魂年龄测试维度字段：
 * 1. 所有选项向量都基于同一组维度，便于稳定生成雷达图。
 * 2. 字段顺序固定，避免后续维护时展示顺序抖动。
 */
export const SOUL_AGE_DIMENSION_KEYS = [
  "rationality",
  "emotionality",
  "inclusiveness",
  "exploration",
  "security",
  "healing",
];

/**
 * 选项模板画像：
 * 关键逻辑：A/B/C/D 分别对应不同成熟梯度，保证题目改版后仍可稳定输出年龄分层。
 */
const OPTION_PROFILE_BY_LETTER = {
  a: {
    ageScore: 21,
    vector: {
      rationality: 44,
      emotionality: 84,
      inclusiveness: 70,
      exploration: 80,
      security: 40,
      healing: 60,
    },
    distribution: {
      childlike: 8,
      mature: 2,
      insightful: 1,
    },
  },
  b: {
    ageScore: 27,
    vector: {
      rationality: 60,
      emotionality: 74,
      inclusiveness: 68,
      exploration: 66,
      security: 56,
      healing: 66,
    },
    distribution: {
      childlike: 5,
      mature: 3,
      insightful: 2,
    },
  },
  c: {
    ageScore: 35,
    vector: {
      rationality: 84,
      emotionality: 66,
      inclusiveness: 76,
      exploration: 58,
      security: 86,
      healing: 78,
    },
    distribution: {
      childlike: 2,
      mature: 7,
      insightful: 2,
    },
  },
  d: {
    ageScore: 41,
    vector: {
      rationality: 92,
      emotionality: 62,
      inclusiveness: 80,
      exploration: 48,
      security: 90,
      healing: 84,
    },
    distribution: {
      childlike: 1,
      mature: 4,
      insightful: 7,
    },
  },
};

/**
 * 题面源数据（按用户指定文案）：
 * 1. 总题量固定 20 题。
 * 2. 每题固定 4 个选项，按 A/B/C/D 顺序写入。
 */
const SOURCE_QUESTION_ITEMS = [
  {
    id: "soul-age-q01",
    title: "遇到烦心事，你更倾向？",
    options: [
      "找人吐槽、哭一哭就好",
      "先玩一会儿，暂时不想",
      "冷静分析，想办法解决",
      "看淡了，顺其自然就好",
    ],
  },
  {
    id: "soul-age-q02",
    title: "你对未来的态度更像？",
    options: [
      "充满幻想，觉得一切都很美好",
      "有点迷茫，但还是期待",
      "会规划，一步一步走",
      "不太想太远，珍惜当下",
    ],
  },
  {
    id: "soul-age-q03",
    title: "别人误会你时，你通常？",
    options: [
      "立刻委屈，想马上解释",
      "生气，不想理对方",
      "冷静沟通，说清楚就行",
      "无所谓，懂的人自然懂",
    ],
  },
  {
    id: "soul-age-q04",
    title: "你更喜欢的生活节奏？",
    options: [
      "轻松快乐，每天有新鲜感",
      "自由随性，不想被束缚",
      "稳定规律，有目标有节奏",
      "安静平淡，简单就好",
    ],
  },
  {
    id: "soul-age-q05",
    title: "看到很幼稚的行为，你会？",
    options: [
      "觉得可爱，想一起玩",
      "有点好笑，但不反感",
      "能理解，但自己不会做",
      "觉得没必要，有点幼稚",
    ],
  },
  {
    id: "soul-age-q06",
    title: "难过时最有效的治愈方式？",
    options: [
      "吃甜食、看治愈的东西",
      "听歌、发呆、自己消化",
      "梳理情绪，告诉自己会好",
      "看淡，人生本来就有起落",
    ],
  },
  {
    id: "soul-age-q07",
    title: "你对“人情世故”的看法？",
    options: [
      "不太懂，也不想懂",
      "有点烦，但偶尔要应付",
      "理解，也会得体处理",
      "早已看透，懒得参与",
    ],
  },
  {
    id: "soul-age-q08",
    title: "新环境新朋友，你会？",
    options: [
      "很快融入，主动聊天",
      "有点害羞，但慢慢适应",
      "礼貌保持距离，观察再靠近",
      "不太在意，随缘就好",
    ],
  },
  {
    id: "soul-age-q09",
    title: "你内心最渴望的是？",
    options: [
      "被宠爱、被照顾",
      "自由、被理解",
      "成就、安全感",
      "平静、心安",
    ],
  },
  {
    id: "soul-age-q10",
    title: "做决定时你通常？",
    options: [
      "凭感觉，喜欢就好",
      "犹豫很久，怕选错",
      "理性权衡，利弊分析",
      "跟着心走，不勉强自己",
    ],
  },
  {
    id: "soul-age-q11",
    title: "别人求助你，你会？",
    options: [
      "马上答应，不忍心拒绝",
      "看心情，想帮就帮",
      "看能力，能帮才帮",
      "先顾好自己，再谈其他",
    ],
  },
  {
    id: "soul-age-q12",
    title: "你对“过去”的态度？",
    options: [
      "经常怀念，舍不得",
      "偶尔想起，有点感慨",
      "感谢经历，但不回头",
      "都过去了，没什么好念",
    ],
  },
  {
    id: "soul-age-q13",
    title: "你更喜欢的社交状态？",
    options: [
      "热热闹闹，很多朋友",
      "三五好友，轻松舒服",
      "少量高质量朋友就够",
      "喜欢独处，不太社交",
    ],
  },
  {
    id: "soul-age-q14",
    title: "看到别人秀恩爱 / 炫耀，你？",
    options: [
      "觉得甜，真心祝福",
      "无感，跟我没关系",
      "理解，但不羡慕",
      "看淡，各有各的生活",
    ],
  },
  {
    id: "soul-age-q15",
    title: "你对“仪式感”的看法？",
    options: [
      "超喜欢，生活必须有",
      "偶尔需要，增加情趣",
      "有更好，没有也无所谓",
      "不太在意，实用最重要",
    ],
  },
  {
    id: "soul-age-q16",
    title: "压力很大时，你会？",
    options: [
      "崩溃、想哭、想撒娇",
      "沉默、逃避、不想说话",
      "咬牙扛住，继续努力",
      "放下一切，先让自己轻松",
    ],
  },
  {
    id: "soul-age-q17",
    title: "你相信童话 / 浪漫吗？",
    options: [
      "深信不疑，一直相信",
      "半信半疑，但仍期待",
      "不太信，现实更重要",
      "不信，内心很清醒",
    ],
  },
  {
    id: "soul-age-q18",
    title: "你对“改变”的态度？",
    options: [
      "期待，喜欢新鲜感",
      "害怕，但也愿意尝试",
      "接受，适者生存",
      "不抗拒，也不强求",
    ],
  },
  {
    id: "soul-age-q19",
    title: "你觉得自己最像？",
    options: [
      "没长大的小朋友",
      "敏感又叛逆的少年",
      "成熟稳重的成年人",
      "看淡一切的长者",
    ],
  },
  {
    id: "soul-age-q20",
    title: "当生活突然失控时，你会先做什么？",
    options: [
      "先找情绪出口，哭完再说",
      "先躲一会儿，等状态回来",
      "先列优先级，把能控的先控住",
      "接受无常，慢慢把心放平",
    ],
  },
];

/**
 * 构建单题选项对象。
 * @param {string} questionId 题目 ID。
 * @param {"a" | "b" | "c" | "d"} letter 选项字母。
 * @param {string} label 选项文案。
 * @returns {{ id: string, label: string, ageScore: number, vector: object, distribution: object }} 标准选项对象。
 */
function buildOptionItem(questionId, letter, label) {
  const profileItem = OPTION_PROFILE_BY_LETTER[letter];
  return {
    id: `${questionId}-${letter}`,
    label,
    ageScore: profileItem.ageScore,
    vector: profileItem.vector,
    distribution: profileItem.distribution,
  };
}

/**
 * 构建标准题库对象。
 * @param {{ id: string, title: string, options: string[] }} sourceItem 题目源对象。
 * @returns {{ id: string, title: string, weight: number, options: Array<object> }} 标准题目对象。
 */
function buildQuestionItem(sourceItem) {
  const optionLetters = ["a", "b", "c", "d"];
  return {
    id: sourceItem.id,
    title: sourceItem.title,
    weight: 1,
    options: optionLetters.map((letterItem, optionIndex) =>
      buildOptionItem(
        sourceItem.id,
        /** @type {"a" | "b" | "c" | "d"} */ (letterItem),
        sourceItem.options[optionIndex],
      ),
    ),
  };
}

/**
 * 灵魂年龄测试题库（固定 20 题）：
 * 关键逻辑：本题库供业务层按轮次随机抽取 12 题，不在数据层做抽题。
 */
export const SOUL_AGE_QUESTION_BANK = SOURCE_QUESTION_ITEMS.map((sourceItem) =>
  buildQuestionItem(sourceItem),
);
