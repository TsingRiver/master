/**
 * 2026 转运关键词测试题库（50题）：
 * 1. 采用用户提供的口语化题干与选项，降低阅读门槛。
 * 2. 标题中不保留编号前缀与 Markdown 标记。
 * 3. 通过“关键词规则 + 位次兜底”映射维度，保证分析器可计算。
 */

/**
 * Fortune 维度向量预设。
 * 字段必须与 fortune 分析器维度完全一致。
 */
const VECTOR_PRESETS = {
  stability: {
    discipline: 9,
    execution: 6,
    clarity: 9,
    vision: 5,
    opportunitySense: 5,
    network: 5,
    expression: 5,
    recovery: 7,
    emotionalStability: 9,
    courage: 4,
    riskControl: 10,
    growth: 6,
  },
  breakthrough: {
    discipline: 6,
    execution: 9,
    clarity: 6,
    vision: 8,
    opportunitySense: 9,
    network: 6,
    expression: 6,
    recovery: 4,
    emotionalStability: 5,
    courage: 9,
    riskControl: 4,
    growth: 8,
  },
  social: {
    discipline: 5,
    execution: 6,
    clarity: 6,
    vision: 6,
    opportunitySense: 7,
    network: 10,
    expression: 10,
    recovery: 6,
    emotionalStability: 7,
    courage: 6,
    riskControl: 5,
    growth: 6,
  },
  recovery: {
    discipline: 4,
    execution: 4,
    clarity: 5,
    vision: 5,
    opportunitySense: 4,
    network: 4,
    expression: 4,
    recovery: 10,
    emotionalStability: 9,
    courage: 4,
    riskControl: 7,
    growth: 4,
  },
  chaos: {
    discipline: 2,
    execution: 3,
    clarity: 2,
    vision: 4,
    opportunitySense: 4,
    network: 3,
    expression: 5,
    recovery: 3,
    emotionalStability: 2,
    courage: 5,
    riskControl: 2,
    growth: 3,
  },
  growth: {
    discipline: 7,
    execution: 7,
    clarity: 7,
    vision: 8,
    opportunitySense: 7,
    network: 5,
    expression: 5,
    recovery: 5,
    emotionalStability: 6,
    courage: 7,
    riskControl: 6,
    growth: 10,
  },
  money: {
    discipline: 7,
    execution: 7,
    clarity: 7,
    vision: 7,
    opportunitySense: 9,
    network: 6,
    expression: 6,
    recovery: 5,
    emotionalStability: 5,
    courage: 8,
    riskControl: 5,
    growth: 7,
  },
  detached: {
    discipline: 4,
    execution: 4,
    clarity: 5,
    vision: 5,
    opportunitySense: 4,
    network: 3,
    expression: 3,
    recovery: 8,
    emotionalStability: 8,
    courage: 3,
    riskControl: 7,
    growth: 3,
  },
};

/**
 * 位次兜底映射：
 * 当选项文本没有命中关键词规则时，按 A/B/C/D 使用默认向量类型。
 */
const DEFAULT_VECTOR_TYPES = ["stability", "breakthrough", "social", "recovery"];

/**
 * 文本规则到向量类型映射：
 * 关键逻辑：规则按优先级匹配，第一个命中即返回，避免冲突叠加。
 */
const TYPE_RULES = [
  {
    type: "chaos",
    pattern:
      /倒霉|毁灭世界|负数|不敢看|逃避|摆烂|通宵|不想睡|狗窝|看不见地|一碰就碎|麻了|卡顿|扔手机|别搞我|甚至很累/,
  },
  {
    type: "money",
    pattern:
      /钱|暴富|彩票|余额|存起来|囤货|打折|搞钱|买房|打钱|发财树|够花|够花|够花/,
  },
  {
    type: "growth",
    pattern:
      /翻身|进行中|飞行|瞬移|读心|自己开|当老板|网红|过目不忘|越压越强|弹簧|旷野|来吧展示|搞快点/,
  },
  {
    type: "social",
    pattern:
      /对象|暗恋|结婚|秀恩爱|磕到了|想加入|桃花|社牛|社恐|理人|拥抱|微信|哈哈哈哈|卧槽/,
  },
  {
    type: "recovery",
    pattern:
      /温水|养生|回家|海岛|不想动|躺着|睡|粥|纯音乐|假期|南极|阴天|仙人掌|不想去|无感/,
  },
  {
    type: "stability",
    pattern:
      /稳|还可以|工具而已|不关心|存货|整洁|工整|100%|看心情|神准|偶尔准|轨道/,
  },
  {
    type: "breakthrough",
    pattern:
      /必须是我|买醉|下期彩票|想笑|期待|翻身|来吧展示|带风|蹦蹦跳跳|周杰伦|西瓜?/, // 兼容扩展词位
  },
  {
    type: "detached",
    pattern:
      /随缘|不想改|不想理人|不想谈|甚至没有|忘了|放弃|无所谓|不挑食|不想说|甚至不过|迷宫|笑话/,
  },
];

/**
 * 深拷贝向量，避免引用共享。
 * @param {string} type 向量类型。
 * @returns {object} 向量副本。
 */
function cloneVector(type) {
  return { ...VECTOR_PRESETS[type] };
}

/**
 * 解析选项对应向量类型。
 * @param {string} label 选项文案。
 * @param {number} optionIndex 选项索引（0~3）。
 * @returns {string} 向量类型。
 */
function resolveVectorType(label, optionIndex) {
  const normalizedLabel = String(label ?? "");

  for (const rule of TYPE_RULES) {
    if (rule.pattern.test(normalizedLabel)) {
      return rule.type;
    }
  }

  return DEFAULT_VECTOR_TYPES[optionIndex] ?? "detached";
}

/**
 * 构建单题对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {number} [params.weight=1.1] 题目权重。
 * @param {Array<string>} params.options 选项文案数组（固定4项）。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<object> }} 标准题目对象。
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
 * 原始题库文本：
 * 仅维护题干与选项文案，向量映射由规则自动处理。
 */
const RAW_QUESTION_BANK = [
  {
    id: "fortune-2026-01-opening-feeling",
    title: "2026年开局这两个月，感觉？",
    options: ["有点懵", "累但充实", "甚至有点倒霉", "还可以，稳"],
  },
  {
    id: "fortune-2026-02-battery",
    title: "手机现在的电量？",
    options: ["80%以上（满）", "50%左右（稳）", "20%以下（慌）", "正在充电（救）"],
  },
  {
    id: "fortune-2026-03-rich-word",
    title: "看到“暴富”两个字？",
    options: ["甚至觉得是骗局", "必须是我", "随缘吧", "甚至想笑"],
  },
  {
    id: "fortune-2026-04-lack",
    title: "最近最缺的是？",
    options: ["钱", "觉", "爱", "头发"],
  },
  {
    id: "fortune-2026-05-drink",
    title: "此时此刻，想喝？",
    options: ["冰美式（续命）", "奶茶（快乐）", "烈酒（买醉）", "温水（养生）"],
  },
  {
    id: "fortune-2026-06-future-preview",
    title: "如果能预知未来，想看？",
    options: ["下期彩票号码", "和谁结婚", "什么时候死", "世界末日"],
  },
  {
    id: "fortune-2026-07-wechat-top",
    title: "你的微信置顶是？",
    options: ["工作群", "对象/暗恋", "甚至没有置顶", "文件传输助手"],
  },
  {
    id: "fortune-2026-08-pick-money",
    title: "走在路上捡到钱？",
    options: ["立马花掉", "甚至不敢捡", "存起来", "买彩票"],
  },
  {
    id: "fortune-2026-09-annual-wish",
    title: "你的 2026 年度愿望？",
    weight: 1.25,
    options: ["甚至已经放弃", "正在进行中", "甚至忘了许啥", "甚至还没许"],
  },
  {
    id: "fortune-2026-10-pda",
    title: "看到别人秀恩爱？",
    options: ["甚至想屏蔽", "磕到了", "甚至想加入", "无感"],
  },
  {
    id: "fortune-2026-11-monday-mood",
    title: "周一早上的心情？",
    options: ["想辞职", "甚至想毁灭世界", "甚至有点期待", "麻木"],
  },
  {
    id: "fortune-2026-12-wallet",
    title: "你的钱包/余额？",
    options: ["甚至是个负数", "甚至不敢看", "甚至有点存货", "甚至够花"],
  },
  {
    id: "fortune-2026-13-superpower",
    title: "最想拥有的超能力？",
    options: ["隐身（社恐）", "瞬移（迟到）", "读心（搞钱）", "飞行（自由）"],
  },
  {
    id: "fortune-2026-14-trouble-reaction",
    title: "遇到困难，第一反应？",
    options: ["甚至想逃避", "找人帮忙", "自己死磕", "甚至想摆烂"],
  },
  {
    id: "fortune-2026-15-sleep-quality",
    title: "你的睡眠质量？",
    options: ["甚至秒睡", "甚至通宵", "多梦易醒", "甚至不想睡"],
  },
  {
    id: "fortune-2026-16-ticket",
    title: "假如现在有张机票？",
    options: ["甚至想去南极", "去海岛躺着", "回家", "甚至不想动"],
  },
  {
    id: "fortune-2026-17-room-status",
    title: "你的房间乱吗？",
    options: ["甚至像狗窝", "甚至很整洁", "乱中有序", "甚至看不见地"],
  },
  {
    id: "fortune-2026-18-last-laugh",
    title: "最近一次大笑？",
    options: ["刚刚", "甚至忘了", "刷视频时", "甚至是在苦笑"],
  },
  {
    id: "fortune-2026-19-ai-view",
    title: "对“AI”的看法？",
    options: ["甚至怕失业", "甚至想谈恋爱", "工具而已", "甚至不关心"],
  },
  {
    id: "fortune-2026-20-social-state",
    title: "你的社交状态？",
    options: ["社牛", "社恐", "甚至不想理人", "间歇性自闭"],
  },
  {
    id: "fortune-2026-21-hair-color",
    title: "甚至想尝试的发色？",
    options: ["黑长直", "甚至光头", "五彩斑斓", "甚至想植发"],
  },
  {
    id: "fortune-2026-22-lucky-number",
    title: "你的幸运数字？",
    options: ["6", "8", "7", "甚至没有"],
  },
  {
    id: "fortune-2026-23-discount",
    title: "看到“打折”两个字？",
    options: ["甚至想买", "甚至觉得是坑", "甚至不看", "必须囤货"],
  },
  {
    id: "fortune-2026-24-retire-age",
    title: "你的理想退休年龄？",
    options: ["甚至现在", "35岁", "60岁", "甚至想干到死"],
  },
  {
    id: "fortune-2026-25-romance-luck",
    title: "最近的桃花运？",
    options: ["甚至烂桃花", "甚至没有", "甚至有点多", "甚至不想谈"],
  },
  {
    id: "fortune-2026-26-catchphrase",
    title: "你的口头禅？",
    options: ["“随便”", "“烦死了”", "“哈哈哈哈”", "“卧槽”"],
  },
  {
    id: "fortune-2026-27-plant",
    title: "甚至想养的植物？",
    options: ["发财树", "甚至仙人掌（好活）", "甚至不想养", "甚至想种菜"],
  },
  {
    id: "fortune-2026-28-dress-style",
    title: "你的穿衣风格？",
    options: ["甚至全是黑白灰", "多巴胺色", "甚至乱穿", "甚至只穿优衣库"],
  },
  {
    id: "fortune-2026-29-hate-vegetable",
    title: "甚至讨厌的蔬菜？",
    options: ["香菜", "甚至没有", "胡萝卜", "甚至不吃菜"],
  },
  {
    id: "fortune-2026-30-pressure",
    title: "你的抗压能力？",
    weight: 1.25,
    options: ["甚至一碰就碎", "甚至越压越强", "甚至像弹簧", "甚至已经麻了"],
  },
  {
    id: "fortune-2026-31-delete-app",
    title: "甚至想删除的APP？",
    options: ["闹钟", "甚至微信", "甚至没有", "甚至想扔手机"],
  },
  {
    id: "fortune-2026-32-keyword-forecast",
    title: "你的年度关键词预测？",
    options: ["苟住", "翻身", "桃花", "暴瘦"],
  },
  {
    id: "fortune-2026-33-night-snack",
    title: "甚至想吃的宵夜？",
    options: ["甚至不吃", "炸鸡啤酒", "甚至想喝粥", "甚至想吃辣条"],
  },
  {
    id: "fortune-2026-34-patience",
    title: "你的耐心程度？",
    options: ["0%", "50%", "100%", "甚至看心情"],
  },
  {
    id: "fortune-2026-35-concert",
    title: "甚至想去的演唱会？",
    options: ["甚至抢不到票", "甚至不想去", "周杰伦", "甚至想自己开"],
  },
  {
    id: "fortune-2026-36-memory",
    title: "你的记性？",
    options: ["金鱼记忆（7秒）", "甚至过目不忘", "甚至只记仇", "甚至只记吃"],
  },
  {
    id: "fortune-2026-37-job-change",
    title: "甚至想换的工作？",
    options: ["甚至想当老板", "甚至想当保安", "甚至想当网红", "甚至不想工作"],
  },
  {
    id: "fortune-2026-38-walk-style",
    title: "你的走路姿势？",
    options: ["甚至带风", "甚至拖地", "甚至蹦蹦跳跳", "甚至低头看手机"],
  },
  {
    id: "fortune-2026-39-fear",
    title: "甚至害怕的东西？",
    options: ["甚至穷", "甚至鬼", "甚至虫子", "甚至人心"],
  },
  {
    id: "fortune-2026-40-cooking",
    title: "你的做饭水平？",
    options: ["甚至炸厨房", "甚至米其林", "甚至只会泡面", "甚至点外卖"],
  },
  {
    id: "fortune-2026-41-luxury",
    title: "甚至想买的奢侈品？",
    options: ["甚至买不起", "甚至觉得丑", "甚至想买房", "包包/手表"],
  },
  {
    id: "fortune-2026-42-music-style",
    title: "你的听歌风格？",
    options: ["甚至全是老歌", "甚至全是DJ", "甚至全是纯音乐", "甚至什么都听"],
  },
  {
    id: "fortune-2026-43-rant",
    title: "甚至想吐槽的事？",
    options: ["甚至全是槽点", "甚至不想说", "甚至领导", "甚至天气"],
  },
  {
    id: "fortune-2026-44-life-speed",
    title: "你的生活节奏？",
    options: ["甚至倍速播放", "甚至暂停", "甚至倒带", "甚至卡顿"],
  },
  {
    id: "fortune-2026-45-gift",
    title: "甚至想得到的礼物？",
    options: ["甚至直接打钱", "甚至一个拥抱", "甚至假期", "甚至惊喜"],
  },
  {
    id: "fortune-2026-46-intuition",
    title: "你的直觉准吗？",
    options: ["甚至神准", "甚至反着来", "甚至没直觉", "甚至偶尔准"],
  },
  {
    id: "fortune-2026-47-change-flaw",
    title: "甚至想改变的缺点？",
    options: ["甚至拖延症", "甚至懒", "甚至脾气差", "甚至不想改"],
  },
  {
    id: "fortune-2026-48-life-metaphor",
    title: "甚至觉得人生是？",
    options: ["甚至旷野", "甚至轨道", "甚至迷宫", "甚至游戏"],
  },
  {
    id: "fortune-2026-49-message-to-year",
    title: "甚至想对2026说？",
    weight: 1.2,
    options: ["“对我好点”", "“搞快点”", "“别搞我”", "“来吧展示”"],
  },
  {
    id: "fortune-2026-50-pick-color",
    title: "最后一个，此时选个颜色？",
    weight: 1.25,
    options: ["红（旺）", "金（富）", "绿（闲）", "紫（贵）"],
  },
];

/**
 * 2026 转运关键词题库。
 */
export const FORTUNE_2026_QUESTION_BANK = RAW_QUESTION_BANK.map((item) =>
  buildQuestion(item),
);
