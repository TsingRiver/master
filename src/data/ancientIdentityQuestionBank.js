/**
 * 古代身份测试题库（50题）：
 * 1. 使用更轻松、直觉化的生活化题干。
 * 2. 题目标题按用户提供文本保留，不保留 Markdown 星号。
 * 3. 选项向量通过关键词 + 默认位次规则映射，保证分析器可计算。
 */

/**
 * 身份向量预设库：
 * 每个预设覆盖古代身份分析器的全部维度（0~10）。
 */
const VECTOR_PRESETS = {
  regent: {
    wisdom: 7,
    leadership: 10,
    courage: 8,
    scholarship: 5,
    diplomacy: 6,
    craftsmanship: 4,
    healing: 3,
    tradeSense: 4,
    mobility: 6,
    discipline: 8,
  },
  scholar: {
    wisdom: 9,
    leadership: 6,
    courage: 4,
    scholarship: 10,
    diplomacy: 8,
    craftsmanship: 4,
    healing: 6,
    tradeSense: 5,
    mobility: 5,
    discipline: 7,
  },
  merchant: {
    wisdom: 6,
    leadership: 5,
    courage: 5,
    scholarship: 4,
    diplomacy: 7,
    craftsmanship: 8,
    healing: 4,
    tradeSense: 10,
    mobility: 7,
    discipline: 6,
  },
  rogue: {
    wisdom: 7,
    leadership: 4,
    courage: 8,
    scholarship: 3,
    diplomacy: 5,
    craftsmanship: 6,
    healing: 3,
    tradeSense: 5,
    mobility: 10,
    discipline: 4,
  },
  rebel: {
    wisdom: 6,
    leadership: 7,
    courage: 10,
    scholarship: 3,
    diplomacy: 4,
    craftsmanship: 6,
    healing: 2,
    tradeSense: 4,
    mobility: 8,
    discipline: 3,
  },
  recluse: {
    wisdom: 6,
    leadership: 2,
    courage: 3,
    scholarship: 6,
    diplomacy: 3,
    craftsmanship: 4,
    healing: 5,
    tradeSense: 3,
    mobility: 4,
    discipline: 5,
  },
  mystic: {
    wisdom: 8,
    leadership: 4,
    courage: 5,
    scholarship: 8,
    diplomacy: 5,
    craftsmanship: 4,
    healing: 8,
    tradeSense: 3,
    mobility: 6,
    discipline: 6,
  },
  hero: {
    wisdom: 7,
    leadership: 8,
    courage: 9,
    scholarship: 4,
    diplomacy: 6,
    craftsmanship: 5,
    healing: 6,
    tradeSense: 4,
    mobility: 7,
    discipline: 7,
  },
};

/**
 * 默认位次向量映射：
 * A/B/C/D 在无关键词命中时分别映射到固定风格，保证结果稳定。
 */
const DEFAULT_VECTOR_TYPES = ["regent", "scholar", "merchant", "rogue"];

/**
 * 关键词到向量类型映射规则：
 * 关键逻辑：先命中更强语义（如“砍/杀/造反”），再回退默认位次。
 */
const TYPE_RULES = [
  {
    type: "hero",
    pattern: /救|医术|开仓放粮|英雄/,
  },
  {
    type: "mystic",
    pattern: /成仙|飞升|炼丹|夜观天象|读心术|隐身术|长生不老|桃花源|古墓|山洞/,
  },
  {
    type: "merchant",
    pattern: /钱|账|生意|财神|点石成金|囤积|学费|算账|算了，当施舍|藏宝图/,
  },
  {
    type: "scholar",
    pattern: /诗|书|画|琴|棋|天象|毛笔|成语|李白|杜甫|工整|狂草|扇子|晒书/,
  },
  {
    type: "rebel",
    pattern: /砍|杀|刺|造反|反杀|战死|抢|祸乱|刺客|有种别跑|人头|杀气|抢劫/,
  },
  {
    type: "regent",
    pattern: /皇帝|皇宫|免死金牌|明黄|一人之下|当皇帝|普天同庆|尚方宝剑|八抬|来人|天下第一/,
  },
  {
    type: "recluse",
    pattern: /不想|无动于衷|绕道走|走开|不去约会|不过|无所谓|沉默是金|睡回笼觉|什么都不想说|不想动/,
  },
];

/**
 * 复制向量预设，避免引用复用导致潜在串改。
 * @param {string} type 向量类型。
 * @returns {object} 向量对象副本。
 */
function cloneVector(type) {
  return { ...VECTOR_PRESETS[type] };
}

/**
 * 根据选项文案解析向量类型。
 * @param {string} label 选项文案。
 * @param {number} optionIndex 选项序号（0~3）。
 * @returns {string} 向量类型。
 */
function resolveVectorType(label, optionIndex) {
  const normalizedLabel = String(label ?? "");

  for (const rule of TYPE_RULES) {
    if (rule.pattern.test(normalizedLabel)) {
      return rule.type;
    }
  }

  return DEFAULT_VECTOR_TYPES[optionIndex] ?? "recluse";
}

/**
 * 构建单题对象。
 * @param {object} params 题目参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {number} [params.weight=1.1] 题目权重。
 * @param {Array<string>} params.options 选项文案数组（固定 4 项）。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<object> }} 题目对象。
 */
function buildQuestion({ id, title, weight = 1.1, options }) {
  return {
    id,
    title,
    description: "按第一直觉选最像你的一项。",
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
 * 原始题库数据：
 * 仅维护标题与选项文本，向量由上方规则自动映射。
 */
const RAW_QUESTION_BANK = [
  {
    id: "ancient-01-first-look",
    title: "穿越第一件事，先看？",
    options: ["镜子（长啥样）", "钱袋（有多少钱）", "窗外（这是哪）", "枕边人（谁睡我旁边）"],
  },
  {
    id: "ancient-02-name-style",
    title: "你的古代名字，偏好？",
    options: ["霸气复姓（如皇甫）", "文雅单字（如雪、风）", "接地气（如二狗）", "不想要名字"],
  },
  {
    id: "ancient-03-call-someone",
    title: "早上醒来，怎么叫人？",
    options: ["“来人！”（威严）", "“小二！”（随意）", "自己默默起床", "踹醒旁边的人"],
  },
  {
    id: "ancient-04-vehicle",
    title: "出门代步工具？",
    options: ["豪华八抬大轿", "汗血宝马", "想骑驴", "轻功飞过去"],
  },
  {
    id: "ancient-05-bully-scene",
    title: "遇到恶霸欺负人？",
    weight: 1.25,
    options: ["亮出身份吓死他", "拔刀就砍", "讲道理/用计谋", "躲远点看戏"],
  },
  {
    id: "ancient-06-weapon",
    title: "你的兵器是？",
    options: ["尚方宝剑", "折扇/毛笔", "算盘", "暗器/毒药"],
  },
  {
    id: "ancient-07-emperor-summon",
    title: "皇帝突然召见你？",
    weight: 1.25,
    options: ["终于轮到我了！", "烦死了，不想去", "吓得腿软", "想想怎么刺杀他"],
  },
  {
    id: "ancient-08-clothing",
    title: "你的衣服材质？",
    options: ["金丝锦缎", "飘逸白纱", "粗布麻衣", "兽皮/盔甲"],
  },
  {
    id: "ancient-09-pet",
    title: "想养的宠物？",
    options: ["鹤/孔雀（祥瑞）", "老虎/鹰（猛兽）", "养条龙", "土狗/大橘"],
  },
  {
    id: "ancient-10-night-time",
    title: "晚上怎么打发时间？",
    options: ["逛青楼/听曲", "夜观天象", "练剑/打坐", "数钱"],
  },
  {
    id: "ancient-11-learn-skill",
    title: "如果要学一门手艺？",
    options: ["治国之道", "琴棋书画", "医术/炼丹", "想学偷东西"],
  },
  {
    id: "ancient-12-beggar",
    title: "看到路边乞丐？",
    options: ["扔一锭金子", "叹口气走开", "买个包子给他", "想加入他"],
  },
  {
    id: "ancient-13-power-view",
    title: "对于“权位”？",
    weight: 1.25,
    options: ["我要一人之下", "想当皇帝", "看着累，不要", "只要自由"],
  },
  {
    id: "ancient-14-alcohol",
    title: "你的酒量？",
    options: ["千杯不醉", "一杯就倒", "只喝茶，不喝酒", "喝白水"],
  },
  {
    id: "ancient-15-martial-marriage",
    title: "遇到比武招亲？",
    options: ["上去打赢带走", "在台下起哄", "想去摆擂台", "绕道走"],
  },
  {
    id: "ancient-16-catchphrase",
    title: "你的口头禅风格？",
    options: ["全是成语", "脏话连篇", "阴阳怪气", "沉默是金"],
  },
  {
    id: "ancient-17-exile",
    title: "被流放到边疆？",
    weight: 1.25,
    options: ["想造反", "写诗发牢骚", "做生意东山再起", "种田过日子"],
  },
  {
    id: "ancient-18-study-room",
    title: "你的书房里放着？",
    options: ["兵书/地图", "全是小黄书", "账本", "武功秘籍"],
  },
  {
    id: "ancient-19-debt-friend",
    title: "朋友借钱不还？",
    options: ["派杀手去要", "算了，当施舍", "写文章骂他", "把他家搬空"],
  },
  {
    id: "ancient-20-death-ideal",
    title: "你的理想死法？",
    weight: 1.25,
    options: ["战死沙场", "牡丹花下死", "老死/睡死", "成仙飞升"],
  },
  {
    id: "ancient-21-live-where",
    title: "想住在？",
    options: ["皇宫深处", "桃花源", "闹市豪宅", "山洞/古墓"],
  },
  {
    id: "ancient-22-beauty",
    title: "看到绝世美人？",
    options: ["想抢回家", "想画下来", "想比比谁美", "无动于衷"],
  },
  {
    id: "ancient-23-weakness",
    title: "你的致命弱点？",
    options: ["太贪财", "太心软", "太好色", "太聪明"],
  },
  {
    id: "ancient-24-if-eunuch",
    title: "如果你是太监？",
    weight: 1.25,
    options: ["也要做最有权的太监", "想自尽", "想祸乱朝纲", "想找对食"],
  },
  {
    id: "ancient-25-eye-style",
    title: "你的眼神通常是？",
    options: ["犀利/杀气", "迷离/多情", "呆滞/空洞", "精明/算计"],
  },
  {
    id: "ancient-26-color",
    title: "喜欢什么颜色？",
    options: ["明黄（帝王色）", "纯白/水墨", "大红大紫", "全黑"],
  },
  {
    id: "ancient-27-evaluation",
    title: "别人怎么评价你？",
    options: ["疯子", "英雄", "奸商", "高人"],
  },
  {
    id: "ancient-28-famine",
    title: "遇到饥荒年份？",
    weight: 1.25,
    options: ["开仓放粮", "囤积居奇", "带头抢劫", "自己种地"],
  },
  {
    id: "ancient-29-waist-item",
    title: "你的腰间挂着？",
    options: ["玉佩", "酒壶", "人头（）", "钥匙串"],
  },
  {
    id: "ancient-30-best-skill",
    title: "最擅长的事？",
    options: ["忽悠人", "砍人", "救人", "气人"],
  },
  {
    id: "ancient-31-date-place",
    title: "想在哪里约会？",
    options: ["御花园", "房顶上", "赌场里", "不去约会"],
  },
  {
    id: "ancient-32-loyalty",
    title: "对“忠诚”的看法？",
    weight: 1.25,
    options: ["愚蠢", "必须的", "看给多少钱", "只忠于自己"],
  },
  {
    id: "ancient-33-handwriting",
    title: "你的字迹？",
    options: ["看不懂（狂草）", "工整娟秀", "不会写字", "像鬼画符"],
  },
  {
    id: "ancient-34-superpower",
    title: "想拥有的超能力？",
    options: ["长生不老", "读心术", "隐身术", "点石成金"],
  },
  {
    id: "ancient-35-hairstyle",
    title: "你的日常发型？",
    options: ["一丝不苟", "披头散发", "插满金钗", "是个光头"],
  },
  {
    id: "ancient-36-brotherhood",
    title: "想和谁结拜？",
    options: ["不想结拜", "关羽/张飞", "李白/杜甫", "财神爷"],
  },
  {
    id: "ancient-37-sitting-posture",
    title: "你的坐姿？",
    options: ["正襟危坐", "葛优躺（古代版）", "蹲在椅子上", "翘二郎腿"],
  },
  {
    id: "ancient-38-assassin",
    title: "遇到刺客？",
    weight: 1.25,
    options: ["“有种别跑！”", "“壮士饶命！”", "“多少钱？我出双倍”", "反杀"],
  },
  {
    id: "ancient-39-heirloom",
    title: "你的传家宝？",
    options: ["是一把菜刀", "免死金牌", "藏宝图", "一本破书"],
  },
  {
    id: "ancient-40-travel",
    title: "想去哪里旅游？",
    options: ["想下西洋", "西域/沙漠", "江南水乡", "不想动"],
  },
  {
    id: "ancient-41-bath-water",
    title: "你的洗澡水？",
    options: ["要撒花瓣", "要加牛奶", "洗冷水澡", "去河里洗"],
  },
  {
    id: "ancient-42-gossip",
    title: "听到八卦？",
    options: ["拿小本记下来", "不屑一顾", "去添油加醋", "这就是我传的"],
  },
  {
    id: "ancient-43-fan-text",
    title: "你的扇子上写着？",
    options: ["“难得糊涂”", "“天下第一”", "“全是美女图”", "空白"],
  },
  {
    id: "ancient-44-hate-food",
    title: "讨厌的食物？",
    options: ["粗茶淡饭", "山珍海味（吃腻了）", "不挑食", "讨厌吃肉"],
  },
  {
    id: "ancient-45-wakeup-mood",
    title: "你的起床气？",
    options: ["想杀人", "会哭", "没有", "还要睡回笼觉"],
  },
  {
    id: "ancient-46-disciple",
    title: "想收的徒弟？",
    options: ["天赋极高的", "只要长得好看", "要有钱交学费", "不想教"],
  },
  {
    id: "ancient-47-last-words",
    title: "你的遗言风格？",
    options: ["“还没活够”", "“把钱都烧给我”", "“什么都不想说”", "“想再笑五百年”"],
  },
  {
    id: "ancient-48-favorite-weather",
    title: "喜欢的天气？",
    options: ["大雪纷飞（有意境）", "狂风暴雨（有杀气）", "晴空万里（好晒书）", "阴天（好睡觉）"],
  },
  {
    id: "ancient-49-birthday",
    title: "想怎么过生日？",
    options: ["普天同庆", "不过", "只想吃碗面", "大摆流水席"],
  },
  {
    id: "ancient-50-life-feeling",
    title: "这一生，你觉得？",
    weight: 1.25,
    options: ["像一场梦", "很爽", "很累", "是个笑话"],
  },
];

/**
 * 最终古代身份题库。
 */
export const ANCIENT_IDENTITY_QUESTION_BANK = RAW_QUESTION_BANK.map((item) =>
  buildQuestion(item),
);
