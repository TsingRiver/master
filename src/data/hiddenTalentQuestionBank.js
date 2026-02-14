/**
 * 隐藏天赋题库（50题）：
 * 1. 采用“看一眼就能选”的日常化题干，降低阅读负担。
 * 2. 题干与选项来自用户提供版本，不做主观重写。
 * 3. 通过“关键词规则 + 选项位次兜底”映射天赋维度向量，保证分析器可直接计算。
 */

/**
 * 隐藏天赋向量预设：
 * 字段必须与 hiddenTalent 分析器维度保持一致。
 */
const VECTOR_PRESETS = {
  logic: {
    intuition: 7,
    patternSense: 10,
    observation: 8,
    systemsThinking: 10,
    execution: 7,
    empathy: 4,
    expression: 5,
    creativity: 6,
    persuasion: 5,
    resilience: 7,
  },
  social: {
    intuition: 7,
    patternSense: 6,
    observation: 7,
    systemsThinking: 6,
    execution: 6,
    empathy: 10,
    expression: 10,
    creativity: 6,
    persuasion: 10,
    resilience: 7,
  },
  action: {
    intuition: 6,
    patternSense: 6,
    observation: 6,
    systemsThinking: 7,
    execution: 10,
    empathy: 5,
    expression: 6,
    creativity: 6,
    persuasion: 7,
    resilience: 10,
  },
  creative: {
    intuition: 8,
    patternSense: 6,
    observation: 7,
    systemsThinking: 5,
    execution: 6,
    empathy: 6,
    expression: 8,
    creativity: 10,
    persuasion: 7,
    resilience: 6,
  },
  intuition: {
    intuition: 10,
    patternSense: 8,
    observation: 9,
    systemsThinking: 6,
    execution: 5,
    empathy: 7,
    expression: 6,
    creativity: 8,
    persuasion: 6,
    resilience: 6,
  },
  steady: {
    intuition: 6,
    patternSense: 7,
    observation: 7,
    systemsThinking: 8,
    execution: 8,
    empathy: 6,
    expression: 5,
    creativity: 5,
    persuasion: 5,
    resilience: 9,
  },
  drift: {
    intuition: 4,
    patternSense: 3,
    observation: 4,
    systemsThinking: 3,
    execution: 3,
    empathy: 5,
    expression: 5,
    creativity: 5,
    persuasion: 4,
    resilience: 3,
  },
};

/**
 * 位次兜底映射：
 * 当选项文案未命中规则时，按 A/B/C/D 对应固定向量类型，保证每个选项都有可计算向量。
 */
const DEFAULT_VECTOR_TYPES = ["logic", "social", "action", "creative"];

/**
 * 文本规则到向量类型映射：
 * 关键逻辑：按顺序命中第一条规则即返回，避免重复命中产生歧义。
 */
const TYPE_RULES = [
  {
    type: "drift",
    pattern:
      /不想|放弃|看不懂|头晕|腿软|平地摔|慢半拍|第一个死|啥也记不住|扔掉|不敢开口|不玩游戏|不想穿|不想死|视而不见|投降|笨手笨脚/,
  },
  {
    type: "action",
    pattern:
      /组织|灭火|领袖|挑战|攀岩|跳伞|深潜|修家电|研究透彻|探险|军师|预判|接飞镖|长跑|球类|游泳|带头跑|独狼|总统|老大|推倒/,
  },
  {
    type: "social",
    pattern:
      /劝架|找人帮|说服|撒娇|圆谎|拆穿|领导|口才|魅力|听八卦|治愈|知心姐姐|吵架|社交/,
  },
  {
    type: "creative",
    pattern:
      /画|导演|喜剧|乐器|模仿|审美|抽象画|发明|外星人|神仙|鬼畜|书名|口哨|爱情动作|天才|潜力股|纪录片|影帝|五彩斑斓/,
  },
  {
    type: "logic",
    pattern:
      /拼图|代码|逻辑|侦探|数据|规律|说明书|地图|GPS|圆周率|WiFi|分析|图表|解开|方向感|观察力|看穿|复杂|读心眼镜|贴着墙走/,
  },
  {
    type: "intuition",
    pattern:
      /第六感|直觉|梦境|顺风耳|鹰眼|狗鼻|猫步|鱼鳃|视力|嗅觉|听力|时灵时不灵|过目不忘/,
  },
  {
    type: "steady",
    pattern:
      /耐心|一尘不染|整理|看图操作|工整|无限忍耐|逐字逐句|找蜡烛|手电筒|继续睡觉|单脚站一天|自动洗澡机/,
  },
];

/**
 * 深拷贝向量，避免对象引用共享导致后续修改串联。
 * @param {string} type 向量类型。
 * @returns {{ intuition: number, patternSense: number, observation: number, systemsThinking: number, execution: number, empathy: number, expression: number, creativity: number, persuasion: number, resilience: number }} 向量副本。
 */
function cloneVector(type) {
  return { ...VECTOR_PRESETS[type] };
}

/**
 * 解析选项映射的向量类型。
 * @param {string} label 选项文案。
 * @param {number} optionIndex 选项索引（0~3）。
 * @returns {string} 命中的向量类型。
 */
function resolveVectorType(label, optionIndex) {
  const normalizedLabel = String(label ?? "");

  for (const rule of TYPE_RULES) {
    if (rule.pattern.test(normalizedLabel)) {
      return rule.type;
    }
  }

  return DEFAULT_VECTOR_TYPES[optionIndex] ?? "steady";
}

/**
 * 构建单题对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {number} [params.weight=1.1] 题目权重。
 * @param {Array<string>} params.options 选项文案数组（固定 4 项）。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<{ id: string, label: string, vector: object }> }} 标准题目对象。
 */
function buildQuestion({ id, title, weight = 1.1, options }) {
  return {
    id,
    title,
    description: "看一眼就选，别反复纠结。",
    weight,
    options: options.map((label, optionIndex) => {
      const optionChar = String.fromCharCode(97 + optionIndex);
      const vectorType = resolveVectorType(label, optionIndex);
      return {
        id: `${id}-option-${optionChar}`,
        label,
        vector: cloneVector(vectorType),
      };
    }),
  };
}

/**
 * 原始题库文本：
 * 仅维护题干与选项，向量映射由规则自动完成。
 */
const RAW_QUESTION_BANK = [
  {
    id: "hidden-talent-01-draw",
    title: "假如现在给你一支笔，你会画？",
    options: ["圆圈/线条", "人脸/眼睛", "房子/树", "乱涂一团"],
  },
  {
    id: "hidden-talent-02-earphone",
    title: "看到一团打结的耳机线？",
    options: ["耐心解开", "直接剪断", "不想听了", "找人帮我解"],
  },
  {
    id: "hidden-talent-03-dream",
    title: "你的梦境通常是？",
    options: ["彩色的", "黑白的", "像连续剧", "醒来就忘"],
  },
  {
    id: "hidden-talent-04-quarrel",
    title: "遇到有人吵架？",
    options: ["上去劝架", "躲远点", "拿出手机拍", "分析谁对谁错"],
  },
  {
    id: "hidden-talent-05-blackout",
    title: "突然停电了？",
    options: ["尖叫", "打开手机手电筒", "继续睡觉", "找蜡烛/火柴"],
  },
  {
    id: "hidden-talent-06-desk",
    title: "你的书桌状态？",
    options: [
      "一尘不染",
      "乱而有序（只有自己找得到）",
      "全是零食",
      "全是纸团",
    ],
  },
  {
    id: "hidden-talent-07-time-travel",
    title: "如果能穿越，想去？",
    options: ["未来（看科技）", "古代（当皇帝）", "恐龙时代（看热闹）", "不想穿"],
  },
  {
    id: "hidden-talent-08-finger",
    title: "你的手指灵活度？",
    options: ["能转笔", "能织毛衣", "笨手笨脚", "能变魔术"],
  },
  {
    id: "hidden-talent-09-puzzle",
    title: "看到复杂的拼图？",
    options: ["想挑战", "头晕", "只想拼边框", "直接放弃"],
  },
  {
    id: "hidden-talent-10-sixth-sense",
    title: "你的第六感？",
    weight: 1.25,
    options: ["每次都准", "那是啥", "坏事准，好事不准", "时灵时不灵"],
  },
  {
    id: "hidden-talent-11-instrument",
    title: "想学的乐器？",
    options: ["架子鼓（躁）", "小提琴（雅）", "二胡（悲）", "口哨（吹）"],
  },
  {
    id: "hidden-talent-12-maze",
    title: "走迷宫时？",
    options: ["靠直觉", "一直贴着墙走", "画地图", "把墙推倒"],
  },
  {
    id: "hidden-talent-13-cry-point",
    title: "你的哭点？",
    options: ["泪失禁", "钢铁心", "只哭动物", "只哭自己"],
  },
  {
    id: "hidden-talent-14-movie",
    title: "假如你是导演，拍什么片？",
    options: ["悬疑烧脑", "喜剧", "纪录片", "爱情动作"],
  },
  {
    id: "hidden-talent-15-reading-speed",
    title: "你的阅读速度？",
    options: ["一目十行", "逐字逐句", "看图说话", "读不进去"],
  },
  {
    id: "hidden-talent-16-lie",
    title: "看到别人说谎？",
    options: ["一眼看穿", "信以为真", "帮他圆谎", "当众拆穿"],
  },
  {
    id: "hidden-talent-17-animal",
    title: "想拥有的动物天赋？",
    options: ["鹰眼（视力）", "狗鼻（嗅觉）", "猫步（静音）", "鱼鳃（呼吸）"],
  },
  {
    id: "hidden-talent-18-logic",
    title: "你的逻辑思维？",
    weight: 1.25,
    options: ["像侦探", "像浆糊", "跳跃式", "只有直觉"],
  },
  {
    id: "hidden-talent-19-game",
    title: "擅长的游戏类型？",
    options: ["射击/竞技", "解谜/策略", "种田/换装", "不玩游戏"],
  },
  {
    id: "hidden-talent-20-fire",
    title: "遇到突发火灾？",
    options: ["带头跑", "还能拿财物", "吓腿软", "组织灭火"],
  },
  {
    id: "hidden-talent-21-bargain",
    title: "你的砍价能力？",
    options: ["对半砍", "不敢开口", "让老板亏本", "直接付钱"],
  },
  {
    id: "hidden-talent-22-code",
    title: "看到满屏的代码？",
    options: ["觉得美", "头疼", "想找Bug", "看不懂"],
  },
  {
    id: "hidden-talent-23-extreme-sport",
    title: "想尝试的极限运动？",
    options: ["跳伞", "深潜", "攀岩", "不想死"],
  },
  {
    id: "hidden-talent-24-imitation",
    title: "你的模仿能力？",
    options: ["像影帝", "只会学狗叫", "谁也不像", "自带鬼畜"],
  },
  {
    id: "hidden-talent-25-organ",
    title: "觉得哪个器官最强？",
    options: ["脑子", "嘴（能说）", "手（能打）", "肝（能熬）"],
  },
  {
    id: "hidden-talent-26-direction",
    title: "你的方向感？",
    options: ["自带GPS", "路痴", "分不清左右", "只记地标"],
  },
  {
    id: "hidden-talent-27-housework",
    title: "擅长的家务？",
    options: ["收纳整理", "做饭", "修家电", "只会倒垃圾"],
  },
  {
    id: "hidden-talent-28-data",
    title: "看到一堆数据？",
    options: ["能看出规律", "想睡觉", "想画成图表", "想删掉"],
  },
  {
    id: "hidden-talent-29-persuasion",
    title: "你的说服力？",
    weight: 1.2,
    options: ["能把死人说活", "只会吵架", "靠撒娇", "没人听"],
  },
  {
    id: "hidden-talent-30-book-title",
    title: "想写的书名？",
    options: ["《如何搞钱》", "《我的奋斗》", "《这个世界疯了》", "《没想好》"],
  },
  {
    id: "hidden-talent-31-balance",
    title: "你的平衡感？",
    options: ["能走钢丝", "平地摔", "单脚站一天", "晕车"],
  },
  {
    id: "hidden-talent-32-invention",
    title: "想发明的机器？",
    options: ["后悔药打印机", "任意门", "自动洗澡机", "读心眼镜"],
  },
  {
    id: "hidden-talent-33-observation",
    title: "你的观察力？",
    options: ["看到毛孔", "脸盲", "只看美女/帅哥", "视而不见"],
  },
  {
    id: "hidden-talent-34-sport",
    title: "擅长的运动？",
    options: ["睡觉", "长跑", "球类", "游泳"],
  },
  {
    id: "hidden-talent-35-abstract-painting",
    title: "看到抽象画？",
    options: ["能解读", "觉得是垃圾", "觉得值钱", "我也能画"],
  },
  {
    id: "hidden-talent-36-patience",
    title: "你的耐心极限？",
    options: ["像钓鱼佬", "三秒钟", "看对象", "无限忍耐"],
  },
  {
    id: "hidden-talent-37-like-who",
    title: "觉得自己像？",
    options: ["外星人", "机器人", "野兽", "神仙"],
  },
  {
    id: "hidden-talent-38-hearing",
    title: "你的听力？",
    options: ["顺风耳", "听而不闻", "只听八卦", "听不懂人话"],
  },
  {
    id: "hidden-talent-39-zombie",
    title: "遇到僵尸爆发？",
    options: ["当领袖", "当独狼", "第一个死", "变僵尸"],
  },
  {
    id: "hidden-talent-40-memory",
    title: "你的记忆力巅峰？",
    options: ["背圆周率", "记得仇人脸", "记得WiFi密码", "啥也记不住"],
  },
  {
    id: "hidden-talent-41-job",
    title: "想当的职业？",
    options: ["杀手（酷）", "无业游民", "总统", "探险家"],
  },
  {
    id: "hidden-talent-42-aesthetic",
    title: "你的审美？",
    options: ["超前", "土味", "大众", "怪异"],
  },
  {
    id: "hidden-talent-43-psych",
    title: "擅长的心理战？",
    options: ["扮猪吃虎", "虚张声势", "直接投降", "看穿一切"],
  },
  {
    id: "hidden-talent-44-reaction",
    title: "你的反应速度？",
    options: ["接飞镖", "慢半拍", "被打到了才叫", "预判"],
  },
  {
    id: "hidden-talent-45-ability",
    title: "想拥有？",
    options: ["绝对音感", "过目不忘", "百毒不侵", "魅力无限"],
  },
  {
    id: "hidden-talent-46-leadership",
    title: "你的领导力？",
    weight: 1.2,
    options: ["天生老大", "只想被领导", "军师型", "独裁者"],
  },
  {
    id: "hidden-talent-47-core-talent",
    title: "觉得你的天赋在？",
    weight: 1.3,
    options: ["手上（技术）", "嘴上（口才）", "脑里（智慧）", "心里（直觉）"],
  },
  {
    id: "hidden-talent-48-manual",
    title: "遇到复杂说明书？",
    options: ["直接扔掉", "看图操作", "研究透彻", "盲装"],
  },
  {
    id: "hidden-talent-49-healing",
    title: "你的治愈能力？",
    options: ["知心姐姐", "只会说多喝热水", "逗比治愈", "需要被治愈"],
  },
  {
    id: "hidden-talent-50-self-eval",
    title: "最后，你觉得自己是？",
    weight: 1.25,
    options: ["天才", "凡人", "疯子", "潜力股"],
  },
];

/**
 * 隐藏天赋题库（标准结构）：
 * 关键逻辑：统一在导出阶段构建，降低后续增删题成本。
 */
export const HIDDEN_TALENT_QUESTION_BANK = RAW_QUESTION_BANK.map((item) =>
  buildQuestion(item),
);
