/**
 * 古代身份四大类定义。
 */
const CATEGORY_LABELS = {
  A: "武力/权力/责任/气场",
  B: "才情/颜值/名声/风雅",
  C: "内敛/安稳/守护/细节",
  D: "烟火/财富/自在/快乐",
};

/**
 * 古代身份线别定义。
 */
const LINE_LABELS = {
  palace: "宫廷线",
  jianghu: "江湖线",
  literati: "文人线",
  market: "市井线",
};

/**
 * 类别与线别排序优先级：
 * 关键逻辑：同分时采用稳定排序，确保结果可复现。
 */
const CATEGORY_PRIORITY = ["A", "B", "C", "D"];
const LINE_PRIORITY = ["palace", "jianghu", "literati", "market"];

/**
 * 36 身份映射：基础线（16）+ 主题线（16）+ 隐藏稀有（4）。
 */
const BASE_IDENTITY_MATRIX = {
  A: {
    B: "少年将军",
    C: "禁军统领",
    D: "江湖盟主",
    SOLO: "铁血战神",
  },
  B: {
    A: "风雅侯爷",
    C: "清贵公子",
    D: "风流才子",
    SOLO: "绝世谪仙",
  },
  C: {
    A: "暗卫首领",
    B: "书院山长",
    D: "府邸大管家",
    SOLO: "隐世高人",
  },
  D: {
    A: "富甲侠商",
    B: "风雅掌柜",
    C: "市井善人",
    SOLO: "逍遥散仙",
  },
};

const LINE_IDENTITY_MATRIX = {
  palace: {
    A: "镇国大将军",
    B: "太子太傅",
    C: "内务府总管",
    D: "御膳房掌事",
  },
  jianghu: {
    A: "独行侠客",
    B: "琴剑书生",
    C: "神秘医者",
    D: "江湖吃货",
  },
  literati: {
    A: "谏议大夫",
    B: "文坛盟主",
    C: "私塾先生",
    D: "闲散诗人",
  },
  market: {
    A: "镖局总镖头",
    B: "书画老板",
    C: "杂货铺掌柜",
    D: "美食探店官",
  },
};

/**
 * 身份视觉风格映射：
 * 关键逻辑：不同身份复用风格组，保证配图风格统一且代码体积可控。
 */
const STYLE_TOKENS = {
  warrior: {
    gradientStart: "#2f1c18",
    gradientEnd: "#8d3f23",
    lineColor: "#f7d2a8",
    glowColor: "rgba(241, 139, 85, 0.34)",
    glyph: "戟",
  },
  scholar: {
    gradientStart: "#1d2438",
    gradientEnd: "#425f94",
    lineColor: "#d8e8ff",
    glowColor: "rgba(142, 184, 255, 0.34)",
    glyph: "墨",
  },
  guardian: {
    gradientStart: "#1f2b2a",
    gradientEnd: "#446c5f",
    lineColor: "#d6f6e5",
    glowColor: "rgba(121, 212, 181, 0.34)",
    glyph: "印",
  },
  market: {
    gradientStart: "#302315",
    gradientEnd: "#9e6e2f",
    lineColor: "#ffe6bd",
    glowColor: "rgba(252, 187, 96, 0.34)",
    glyph: "金",
  },
  mystic: {
    gradientStart: "#1f1c3a",
    gradientEnd: "#634f9a",
    lineColor: "#ece0ff",
    glowColor: "rgba(186, 152, 255, 0.34)",
    glyph: "玄",
  },
};

/**
 * 身份元数据（36 条）。
 * @type {Array<{ name: string, scope: "base"|"line"|"hidden", primary: "A"|"B"|"C"|"D", secondary?: "A"|"B"|"C"|"D", lineTag?: "palace"|"jianghu"|"literati"|"market", hiddenKey?: string, styleKey: "warrior"|"scholar"|"guardian"|"market"|"mystic", slogan: string, coreTag: string, summary: string }>} 身份定义列表。
 */
const IDENTITY_DEFINITIONS = [
  {
    name: "少年将军",
    scope: "base",
    primary: "A",
    secondary: "B",
    styleKey: "warrior",
    slogan: "一身傲骨，半世锋芒，守家国也守心动。",
    coreTag: "锋芒与风雅并存",
    summary: "你在强执行与高审美之间找到了平衡，既能冲锋也会留白。",
  },
  {
    name: "禁军统领",
    scope: "base",
    primary: "A",
    secondary: "C",
    styleKey: "warrior",
    slogan: "沉默是刀，忠诚为甲，万人中央只护一人。",
    coreTag: "权责与守护并举",
    summary: "你重边界、重责任，关键时刻能稳住秩序并承担风险。",
  },
  {
    name: "江湖盟主",
    scope: "base",
    primary: "A",
    secondary: "D",
    styleKey: "warrior",
    slogan: "快意恩仇，潇洒如风，不跪天地只随心。",
    coreTag: "行动力拉满",
    summary: "你不爱被规则束缚，更擅长在变化局里靠魄力开路。",
  },
  {
    name: "铁血战神",
    scope: "base",
    primary: "A",
    styleKey: "warrior",
    slogan: "血染征袍，心藏温柔，战无不胜也念归途。",
    coreTag: "硬核破局者",
    summary: "你习惯先扛事再谈情绪，是团队里最能扛压的前排。",
  },
  {
    name: "风雅侯爷",
    scope: "base",
    primary: "B",
    secondary: "A",
    styleKey: "scholar",
    slogan: "眉眼如画，温润如玉，富贵堆里最清绝。",
    coreTag: "审美与掌控并存",
    summary: "你外在从容、内核有主见，善于在体面场合拿到主动权。",
  },
  {
    name: "清贵公子",
    scope: "base",
    primary: "B",
    secondary: "C",
    styleKey: "scholar",
    slogan: "书卷气藏，风骨自扬，一眼心动万年长。",
    coreTag: "温润坚定",
    summary: "你讲分寸、重质感，对人温和但原则感很清晰。",
  },
  {
    name: "风流才子",
    scope: "base",
    primary: "B",
    secondary: "D",
    styleKey: "scholar",
    slogan: "诗酒相伴，风月为友，人间浪漫皆入喉。",
    coreTag: "表达天赋强",
    summary: "你擅长营造氛围，能把普通日常变成有记忆点的场景。",
  },
  {
    name: "绝世谪仙",
    scope: "base",
    primary: "B",
    styleKey: "mystic",
    slogan: "不沾尘俗，自带清光，一眼便是天上人。",
    coreTag: "天生主角感",
    summary: "你对美感和精神追求有高标准，不轻易被庸常节奏拖拽。",
  },
  {
    name: "暗卫首领",
    scope: "base",
    primary: "C",
    secondary: "A",
    styleKey: "guardian",
    slogan: "藏于阴影，忠于一人，无声守护最深情。",
    coreTag: "低调高可靠",
    summary: "你在细节里控风险，擅长把隐患消灭在爆发之前。",
  },
  {
    name: "书院山长",
    scope: "base",
    primary: "C",
    secondary: "B",
    styleKey: "scholar",
    slogan: "温文尔雅，心怀天下，教书也教人间情。",
    coreTag: "稳中有光",
    summary: "你善于长期建设，用耐心和方法把事情做成体系。",
  },
  {
    name: "府邸大管家",
    scope: "base",
    primary: "C",
    secondary: "D",
    styleKey: "guardian",
    slogan: "内务如棋，分毫不乱，你把烟火过成秩序感。",
    coreTag: "细节运营高手",
    summary: "你擅长统筹资源，把复杂局面拆成可执行的日常流程。",
  },
  {
    name: "隐世高人",
    scope: "base",
    primary: "C",
    styleKey: "mystic",
    slogan: "看尽喧哗仍守本心，不争不抢却自有山河。",
    coreTag: "内核稳定",
    summary: "你更注重内在秩序，遇事先稳心，再稳局。",
  },
  {
    name: "富甲侠商",
    scope: "base",
    primary: "D",
    secondary: "A",
    styleKey: "market",
    slogan: "算盘有道，出手有义，江湖与生意都吃得开。",
    coreTag: "资源整合型",
    summary: "你能把机会、现金流和行动力连成闭环，执行落地效率高。",
  },
  {
    name: "风雅掌柜",
    scope: "base",
    primary: "D",
    secondary: "B",
    styleKey: "market",
    slogan: "账本有数，生活有诗，把人间买卖过成美学。",
    coreTag: "生意与审美兼修",
    summary: "你既会算账，也会讲故事，擅长把价值包装成体验。",
  },
  {
    name: "市井善人",
    scope: "base",
    primary: "D",
    secondary: "C",
    styleKey: "market",
    slogan: "脚踩尘土心怀热望，凡人日子也能发光。",
    coreTag: "温暖现实派",
    summary: "你重日常、重关系，用实在的方式让身边人更有安全感。",
  },
  {
    name: "逍遥散仙",
    scope: "base",
    primary: "D",
    styleKey: "mystic",
    slogan: "不被规矩困住，不被情绪拖拽，活得松弛又通透。",
    coreTag: "自由灵魂",
    summary: "你追求高自由度，擅长在压力环境中保持自洽与弹性。",
  },
  {
    name: "镇国大将军",
    scope: "line",
    primary: "A",
    lineTag: "palace",
    styleKey: "warrior",
    slogan: "肩扛山河，目有雷霆，你是乱局里的定海针。",
    coreTag: "宫廷权责核心",
    summary: "你在高压体系中仍能稳住军心与节奏，是典型的大局担当。",
  },
  {
    name: "太子太傅",
    scope: "line",
    primary: "B",
    lineTag: "palace",
    styleKey: "scholar",
    slogan: "执笔定策，开口成章，帝国的方向感来自你。",
    coreTag: "宫廷智囊",
    summary: "你擅长用知识和判断影响关键决策，属于高认知输出型角色。",
  },
  {
    name: "内务府总管",
    scope: "line",
    primary: "C",
    lineTag: "palace",
    styleKey: "guardian",
    slogan: "千头万绪你都能捋顺，低调却掌控全局温度。",
    coreTag: "宫廷运营中枢",
    summary: "你重细节、强执行，能把复杂系统维护得长期稳定。",
  },
  {
    name: "御膳房掌事",
    scope: "line",
    primary: "D",
    lineTag: "palace",
    styleKey: "market",
    slogan: "锅勺之间见修为，一餐一味都能安人心。",
    coreTag: "烟火治愈力",
    summary: "你擅长用具体可感的方式照顾关系，是氛围稳定器。",
  },
  {
    name: "独行侠客",
    scope: "line",
    primary: "A",
    lineTag: "jianghu",
    styleKey: "warrior",
    slogan: "一人一马一江湖，路见不平便拔刀相助。",
    coreTag: "高行动自由度",
    summary: "你执行快、反应快，更适合自主度高的场域与关系模式。",
  },
  {
    name: "琴剑书生",
    scope: "line",
    primary: "B",
    lineTag: "jianghu",
    styleKey: "scholar",
    slogan: "袖里藏锋，琴里藏月，温柔与锋芒你都不缺。",
    coreTag: "文武双修",
    summary: "你有表达魅力也有行动底气，面对复杂局势能文能武。",
  },
  {
    name: "神秘医者",
    scope: "line",
    primary: "C",
    lineTag: "jianghu",
    styleKey: "guardian",
    slogan: "悬壶济世不留名，越是危局越显你沉着。",
    coreTag: "冷静救场",
    summary: "你在波动环境中更能看清关键点，擅长稳定他人状态。",
  },
  {
    name: "江湖吃货",
    scope: "line",
    primary: "D",
    lineTag: "jianghu",
    styleKey: "market",
    slogan: "刀光剑影照样开席，你把苦日子过成热气腾腾。",
    coreTag: "高复原力",
    summary: "你能在不确定里找到快乐锚点，让团队保持生机和士气。",
  },
  {
    name: "谏议大夫",
    scope: "line",
    primary: "A",
    lineTag: "literati",
    styleKey: "scholar",
    slogan: "敢言敢谏不畏权势，清醒是你最硬的铠甲。",
    coreTag: "理性锋芒",
    summary: "你有强原则与表达勇气，适合承担纠偏与决策监督角色。",
  },
  {
    name: "文坛盟主",
    scope: "line",
    primary: "B",
    lineTag: "literati",
    styleKey: "scholar",
    slogan: "字字有骨，句句生花，你的表达能点燃时代。",
    coreTag: "影响力表达者",
    summary: "你擅长通过内容和叙事建立共识，拥有高传播天赋。",
  },
  {
    name: "私塾先生",
    scope: "line",
    primary: "C",
    lineTag: "literati",
    styleKey: "guardian",
    slogan: "循循善诱，润物无声，你让普通人也看见远方。",
    coreTag: "长期培养型",
    summary: "你对成长节奏把握精准，擅长把复杂知识变得可吸收。",
  },
  {
    name: "闲散诗人",
    scope: "line",
    primary: "D",
    lineTag: "literati",
    styleKey: "mystic",
    slogan: "风过竹窗你便成句，平凡日常被你写出月色。",
    coreTag: "松弛创作者",
    summary: "你拥有高感受力和生活审美，适合内容与创意密集型路径。",
  },
  {
    name: "镖局总镖头",
    scope: "line",
    primary: "A",
    lineTag: "market",
    styleKey: "warrior",
    slogan: "胆识与责任并行，押的不只是镖更是承诺。",
    coreTag: "执行与信用",
    summary: "你重结果也重信誉，擅长在高不确定场景里守住底线。",
  },
  {
    name: "书画老板",
    scope: "line",
    primary: "B",
    lineTag: "market",
    styleKey: "market",
    slogan: "左手审美右手生意，文气和财气都向你靠拢。",
    coreTag: "内容商业化",
    summary: "你能把审美价值变成真实交易，兼具表达力与经营感。",
  },
  {
    name: "杂货铺掌柜",
    scope: "line",
    primary: "C",
    lineTag: "market",
    styleKey: "market",
    slogan: "你最懂人间需求，小铺门口就是半座江湖。",
    coreTag: "日常洞察者",
    summary: "你观察细、反应快，擅长从琐碎信息里提炼真实需求。",
  },
  {
    name: "美食探店官",
    scope: "line",
    primary: "D",
    lineTag: "market",
    styleKey: "market",
    slogan: "舌尖有判断，生活有热爱，走到哪都能找到快乐。",
    coreTag: "生活体验派",
    summary: "你具备高生活敏感度，能把体验、内容和社交自然串联。",
  },
  {
    name: "人间帝王 / 女帝",
    scope: "hidden",
    primary: "A",
    hiddenKey: "balanced",
    styleKey: "mystic",
    slogan: "四象归一，心定乾坤，你天生自带王者调度力。",
    coreTag: "四维均衡稀有型",
    summary: "你的能力结构非常均衡，能在不同局势中切换最优策略。",
  },
  {
    name: "护国暗主",
    scope: "hidden",
    primary: "A",
    secondary: "C",
    hiddenKey: "ac-high",
    styleKey: "warrior",
    slogan: "明处镇国，暗处控局，你是风暴背后的终极手。",
    coreTag: "A/C 极高稀有型",
    summary: "你兼具破局与守局能力，既能冲锋也能精密布局。",
  },
  {
    name: "盛世名伶",
    scope: "hidden",
    primary: "B",
    secondary: "D",
    hiddenKey: "bd-high",
    styleKey: "scholar",
    slogan: "台上惊鸿照世，台下洞察人心，万众目光为你停驻。",
    coreTag: "B/D 极高稀有型",
    summary: "你把魅力、表达和烟火感结合得极好，天然具备舞台吸引力。",
  },
  {
    name: "穿越者本尊",
    scope: "hidden",
    primary: "D",
    hiddenKey: "scattered",
    styleKey: "mystic",
    slogan: "不按剧本、不被设限，你就是改写世界线的人。",
    coreTag: "高离散稀有型",
    summary: "你的选择不走常规路线，擅长打破旧框架并重写玩法。",
  },
];

/**
 * 身份元数据字典。
 */
const IDENTITY_RECORD_MAP = IDENTITY_DEFINITIONS.reduce(
  (accumulator, identityItem) => {
    accumulator[identityItem.name] = identityItem;
    return accumulator;
  },
  {},
);

/**
 * 分类行动建议映射。
 */
const CATEGORY_ACTION_LIBRARY = {
  A: {
    growthActions: [
      "把本周最重要的 1 件事写成“目标-截止-验收”三段，先抢占主动权。",
      "在关键决策前先列出最坏情形，提前准备 B 方案降低失误成本。",
      "每周固定一次体能或执行训练，维持高压场景下的稳定输出。",
    ],
    avoidSignals: ["只顾冲锋忽略协同", "把所有问题都用硬刚处理"],
  },
  B: {
    growthActions: [
      "把你的表达优势沉淀为固定输出栏目，持续放大个人影响力。",
      "为每次重要沟通设置“观点-证据-结论”结构，减少信息损耗。",
      "用作品而非情绪证明价值，保持长期可见度。",
    ],
    avoidSignals: ["过度在意评价导致节奏失衡", "灵感很多但落地不足"],
  },
  C: {
    growthActions: [
      "把你擅长的流程标准化，让稳定能力可以被团队复用。",
      "建立“提前半步”的风险清单，每周清理潜在隐患。",
      "把照顾他人的时间也分配给自己，防止长期透支。",
    ],
    avoidSignals: ["承担过多却不求反馈", "长期压抑需求导致内耗"],
  },
  D: {
    growthActions: [
      "为兴趣与收益建立双轨计划：一条养热情，一条养现金流。",
      "每次尝试新机会前先设止损点，保持自由同时控制风险。",
      "把你的生活化洞察转成内容或产品，形成可持续复利。",
    ],
    avoidSignals: ["过度追求即时快感", "资源分散导致推进断档"],
  },
};

/**
 * 专属称号词库（按主导类别）。
 */
const CATEGORY_HONOR_TITLE_LIBRARY = {
  A: "一剑霜寒十四州",
  B: "笔落惊风雨",
  C: "灯下守山河",
  D: "烟火定乾坤",
};

/**
 * 画面感人设概括模板（按主导类别）。
 */
const CATEGORY_PERSONA_TEMPLATE_LIBRARY = {
  A: "你是仗剑走天涯的孤勇${identityName}，见不平便拔刀，却也会为一壶好酒驻足。",
  B: "你是把风雅写进日常的${identityName}，一半是才情锋芒，一半是温柔留白。",
  C: "你是把细节守成城墙的${identityName}，不喧哗却总能在关键处稳住全局。",
  D: "你是把烟火气活成生命力的${identityName}，既会算账过日子，也懂得把快乐分享给众人。",
};

/**
 * 性格画像词库（按主导类别）。
 */
const CATEGORY_TRAIT_PROFILE_LIBRARY = {
  A: [
    { keyword: "重情重义", note: "认定的人和事会护到底，关键时刻不掉链子。" },
    { keyword: "外冷内热", note: "表面克制，真正熟了会主动扛事和兜底。" },
    { keyword: "爱憎分明", note: "价值观清晰，不愿在灰色地带反复摇摆。" },
    { keyword: "先手破局", note: "遇到问题倾向先行动，靠执行力抢占主动权。" },
  ],
  B: [
    { keyword: "审美敏锐", note: "对氛围、细节和表达质感有天然高标准。" },
    { keyword: "温文锋利", note: "说话有分寸，但观点落点通常很有力度。" },
    { keyword: "表达在线", note: "擅长把抽象情绪讲清楚，让人愿意听下去。" },
    { keyword: "慕强自律", note: "会用长期主义要求自己，不满足于浅层反馈。" },
  ],
  C: [
    { keyword: "细节控场", note: "你会先看风险点和边界，习惯提前补漏洞。" },
    { keyword: "稳定守护", note: "在关系或团队里，你常常是最可靠的后盾。" },
    { keyword: "慢热长情", note: "信任建立较慢，但一旦建立就很难动摇。" },
    { keyword: "秩序感强", note: "你喜欢把混乱拆解为可执行的步骤和节奏。" },
  ],
  D: [
    { keyword: "烟火能量", note: "你能把普通日常过得有滋味，也带动周围人。" },
    { keyword: "资源感强", note: "对机会、价格和人情往来有较好的实战嗅觉。" },
    { keyword: "乐观自洽", note: "遇事先稳情绪，擅长在现实里寻找新出路。" },
    { keyword: "社交亲和", note: "很会制造轻松氛围，容易成为局里的连接点。" },
  ],
};

/**
 * 线别补充画像词库。
 */
const LINE_TRAIT_PROFILE_LIBRARY = {
  palace: { keyword: "规则意识", note: "懂得在复杂规则中找到可持续的进退路径。" },
  jianghu: { keyword: "江湖胆魄", note: "面对突发局面更敢拍板，行动上不拖泥带水。" },
  literati: { keyword: "文心洞察", note: "擅长用观察与表达穿透表象，理解人心脉络。" },
  market: { keyword: "市井智慧", note: "你对现实反馈非常敏感，决策更偏实用主义。" },
};

/**
 * 专属金句词库（按主导类别）。
 */
const CATEGORY_QUOTE_LIBRARY = {
  A: [
    "侠之大者，为国为民；侠之小者，为友为邻。",
    "别问，问就是刀未出鞘，酒先入喉。",
  ],
  B: [
    "胸中有丘壑，笔下见山河。",
    "风雅不是装出来的，是你天生自带的气场。",
  ],
  C: [
    "守一寸分寸，护一方周全。",
    "你不爱抢戏，但关键局永远有你兜底。",
  ],
  D: [
    "人间烟火最抚人心，柴米油盐也能写成诗。",
    "别人闯江湖靠刀，你闯江湖靠生活智慧。",
  ],
};

/**
 * 古代职业/场景映射（按线别）。
 */
const LINE_ANCIENT_FIT_LIBRARY = {
  palace: {
    jobs: ["禁军侍卫", "内务管事", "朝堂幕僚"],
    scenes: ["宫门值守", "朝议议事", "内廷夜巡"],
  },
  jianghu: {
    jobs: ["游侠镖师", "江湖医者", "山门教头"],
    scenes: ["客栈渡口", "武林大会", "山道夜行"],
  },
  literati: {
    jobs: ["书院先生", "文案主笔", "清谈名士"],
    scenes: ["书院讲席", "诗会雅集", "山亭论道"],
  },
  market: {
    jobs: ["商行掌柜", "市集主理", "酒楼东家"],
    scenes: ["坊市开张", "茶楼会客", "夜市盘货"],
  },
};

/**
 * 现代职业/性格映射（按主导类别）。
 */
const CATEGORY_MODERN_MAPPING_LIBRARY = {
  A: {
    jobs: ["应急管理者", "户外领队", "行动派创业者"],
    traits: ["执行力强", "边界清晰", "高压抗性高"],
  },
  B: {
    jobs: ["内容创作者", "品牌策划", "文化媒体从业者"],
    traits: ["表达力强", "审美在线", "洞察情绪变化"],
  },
  C: {
    jobs: ["运营管理者", "项目管控岗", "咨询/辅导型角色"],
    traits: ["稳定可靠", "注重细节", "关系维护能力强"],
  },
  D: {
    jobs: ["商业主理人", "生活方式博主", "餐饮/零售创业者"],
    traits: ["资源整合快", "务实灵活", "社交驱动力强"],
  },
};

/**
 * 社交互动钩子模板（按主导类别）。
 */
const CATEGORY_SOCIAL_HOOK_LIBRARY = {
  A: {
    confidant: "隐世高人",
    partner: "风雅掌柜",
  },
  B: {
    confidant: "神秘医者",
    partner: "富甲侠商",
  },
  C: {
    confidant: "清贵公子",
    partner: "少年将军",
  },
  D: {
    confidant: "书院山长",
    partner: "镖局总镖头",
  },
};

/**
 * 创建零计数对象。
 * @param {Array<string>} keys 计数字段。
 * @returns {{ [key: string]: number }} 零计数字典。
 */
function createZeroCounter(keys) {
  return keys.reduce((accumulator, keyItem) => {
    accumulator[keyItem] = 0;
    return accumulator;
  }, {});
}

/**
 * 取值限定到区间。
 * @param {number} value 原始值。
 * @param {number} minValue 最小值。
 * @param {number} maxValue 最大值。
 * @returns {number} 限定后值。
 */
function clamp(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, value));
}

/**
 * 从模板生成文本。
 * @param {string} templateText 模板文本。
 * @param {object} params 模板参数。
 * @returns {string} 替换后文本。
 */
function interpolateTemplate(templateText, params) {
  return String(templateText ?? "").replace(/\$\{(\w+)\}/g, (_, keyName) => {
    return String(params?.[keyName] ?? "");
  });
}

/**
 * 构建答卷摘要。
 * @param {Array<object>} questions 本轮题目。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {Array<object>} 摘要数组。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((questionItem, questionIndex) => {
    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === answerIds[questionIndex],
    );

    return {
      questionId: questionItem.id,
      questionTitle: questionItem.title,
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      category: selectedOption?.category ?? null,
      identityHint: selectedOption?.identityHint ?? "",
      lineTag: selectedOption?.lineTag ?? "",
    };
  });
}

/**
 * 转换为答卷回放文案。
 * @param {Array<object>} answerSummary 答卷摘要。
 * @returns {Array<string>} 回放文本。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map((item, index) => {
    // 关键逻辑：结果页回放仅保留场景与用户选择，不暴露 A/B/C/D 分类标签。
    return `${index + 1}. ${item.questionTitle} → ${item.optionLabel}`;
  });
}

/**
 * 统计类别与线别分布。
 * 复杂度评估：O(Q)
 * Q 为题目数量（随题库规模变化），线性遍历一次即可。
 * @param {Array<object>} answerSummary 答卷摘要。
 * @returns {{ categoryCounts: object, lineCounts: object, categorySwitchCount: number }} 统计结果。
 */
function buildCountStats(answerSummary) {
  const categoryCounts = createZeroCounter(CATEGORY_PRIORITY);
  const lineCounts = createZeroCounter(LINE_PRIORITY);

  let categorySwitchCount = 0;

  answerSummary.forEach((item, index) => {
    if (CATEGORY_PRIORITY.includes(item.category)) {
      categoryCounts[item.category] += 1;
    }

    if (LINE_PRIORITY.includes(item.lineTag)) {
      lineCounts[item.lineTag] += 1;
    }

    if (index > 0) {
      const previousCategory = answerSummary[index - 1]?.category;
      if (
        previousCategory &&
        item.category &&
        previousCategory !== item.category
      ) {
        categorySwitchCount += 1;
      }
    }
  });

  return {
    categoryCounts,
    lineCounts,
    categorySwitchCount,
  };
}

/**
 * 对计数结果做稳定排序。
 * @param {object} counter 计数字典。
 * @param {Array<string>} priorityOrder 排序优先级。
 * @returns {Array<{ key: string, count: number }>} 排序结果。
 */
function sortCounter(counter, priorityOrder) {
  return Object.entries(counter)
    .map(([key, count]) => ({
      key,
      count,
    }))
    .sort((leftItem, rightItem) => {
      const countDiff = rightItem.count - leftItem.count;
      if (countDiff !== 0) {
        return countDiff;
      }

      return priorityOrder.indexOf(leftItem.key) - priorityOrder.indexOf(rightItem.key);
    });
}

/**
 * 对身份分值榜做稳定排序。
 * 复杂度评估：O(N log N)
 * N 为身份候选条目数量（当前固定 36），排序开销可控。
 * @param {Array<{ name: string, score: number }>} scoreItems 身份分值条目。
 * @returns {Array<{ name: string, score: number }>} 排序后的条目。
 */
function sortIdentityScoreItems(scoreItems) {
  return [...scoreItems].sort((leftItem, rightItem) => {
    const scoreDiff = Number(rightItem?.score ?? 0) - Number(leftItem?.score ?? 0);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return String(leftItem?.name ?? "").localeCompare(
      String(rightItem?.name ?? ""),
      "zh-Hans-CN",
    );
  });
}

/**
 * 计算隐藏身份触发标记。
 * @param {object} categoryCounts 分类统计。
 * @param {Array<{ key: string, count: number }>} sortedCategories 排序后分类。
 * @param {number} categorySwitchCount 类别切换次数。
 * @returns {{ balanced: boolean, acHigh: boolean, bdHigh: boolean, scattered: boolean }} 触发标记。
 */
function resolveRareFlags(categoryCounts, sortedCategories, categorySwitchCount) {
  const maxCount = sortedCategories[0]?.count ?? 0;
  const minCount = sortedCategories[sortedCategories.length - 1]?.count ?? 0;

  const balanced = maxCount - minCount <= 1;

  const acHigh =
    categoryCounts.A >= 9 &&
    categoryCounts.C >= 9 &&
    sortedCategories[0]?.key !== "B" &&
    sortedCategories[0]?.key !== "D" &&
    categoryCounts.B <= 7 &&
    categoryCounts.D <= 7;

  const bdHigh =
    categoryCounts.B >= 9 &&
    categoryCounts.D >= 9 &&
    sortedCategories[0]?.key !== "A" &&
    sortedCategories[0]?.key !== "C" &&
    categoryCounts.A <= 7 &&
    categoryCounts.C <= 7;

  /**
   * 关键逻辑：高离散定义为“切换频繁 + 无单一强势类别”，用于命中“穿越者本尊”。
   */
  const scattered =
    maxCount <= 10 &&
    minCount >= 5 &&
    categorySwitchCount >= 22 &&
    !balanced &&
    !acHigh &&
    !bdHigh;

  return {
    balanced,
    acHigh,
    bdHigh,
    scattered,
  };
}

/**
 * 根据分类领先关系解析基础身份名。
 * @param {Array<{ key: string, count: number }>} sortedCategories 分类排序。
 * @returns {{ identityName: string, mode: "combo"|"solo" }} 基础身份与判定模式。
 */
function resolveBaseIdentity(sortedCategories) {
  const topCategory = sortedCategories[0]?.key ?? "A";
  const secondCategory = sortedCategories[1]?.key ?? "B";

  const leadGap = (sortedCategories[0]?.count ?? 0) - (sortedCategories[1]?.count ?? 0);
  if (leadGap >= 3) {
    return {
      identityName: BASE_IDENTITY_MATRIX[topCategory].SOLO,
      mode: "solo",
    };
  }

  return {
    identityName:
      BASE_IDENTITY_MATRIX[topCategory][secondCategory] ??
      BASE_IDENTITY_MATRIX[topCategory].SOLO,
    mode: "combo",
  };
}

/**
 * 根据线别领先关系解析线别身份名。
 * @param {Array<{ key: string, count: number }>} sortedLines 线别排序。
 * @param {string} topCategory 主导类别。
 * @returns {{ identityName: string, shouldUseLineIdentity: boolean }} 线别判定结果。
 */
function resolveLineIdentity(sortedLines, topCategory) {
  const topLine = sortedLines[0]?.key ?? "palace";
  const secondLineCount = sortedLines[1]?.count ?? 0;
  const topLineCount = sortedLines[0]?.count ?? 0;

  /**
   * 关键逻辑：线别领先至少 2 题且总量不低于 9，才覆盖基础身份。
   * 这样能避免轻微波动导致身份在基础线和主题线之间频繁跳动。
   */
  const shouldUseLineIdentity =
    topLineCount >= 9 && topLineCount - secondLineCount >= 2;

  return {
    identityName: LINE_IDENTITY_MATRIX[topLine]?.[topCategory] ?? "镇国大将军",
    shouldUseLineIdentity,
  };
}

/**
 * 解析隐藏身份。
 * @param {{ balanced: boolean, acHigh: boolean, bdHigh: boolean, scattered: boolean }} rareFlags 隐藏触发标记。
 * @returns {string} 隐藏身份名，未命中返回空字符串。
 */
function resolveRareIdentity(rareFlags) {
  if (rareFlags.balanced) {
    return "人间帝王 / 女帝";
  }

  if (rareFlags.acHigh) {
    return "护国暗主";
  }

  if (rareFlags.bdHigh) {
    return "盛世名伶";
  }

  if (rareFlags.scattered) {
    return "穿越者本尊";
  }

  return "";
}

/**
 * 计算身份候选分值。
 * 复杂度评估：O(I)
 * I 为身份数量（固定 36），属于常量级线性计算。
 * @param {object} identityItem 身份定义。
 * @param {object} context 上下文统计。
 * @returns {number} 候选分值（0~100）。
 */
function calculateIdentityCandidateScore(identityItem, context) {
  const {
    categoryCounts,
    lineCounts,
    sortedCategories,
    sortedLines,
    rareFlags,
  } = context;

  const primaryCount = categoryCounts[identityItem.primary] ?? 0;
  const secondaryCount = identityItem.secondary
    ? categoryCounts[identityItem.secondary] ?? 0
    : 0;

  let score = 26;

  if (identityItem.scope === "base") {
    score += primaryCount * 4.15;

    if (identityItem.secondary) {
      score += secondaryCount * 2.95;
    } else {
      score += Math.max(0, primaryCount - (sortedCategories[1]?.count ?? 0)) * 2.75;
    }

    if (sortedCategories[0]?.key === identityItem.primary) {
      score += 11;
    }

    if (identityItem.secondary && sortedCategories[1]?.key === identityItem.secondary) {
      score += 8;
    }
  }

  if (identityItem.scope === "line") {
    const lineScore = lineCounts[identityItem.lineTag] ?? 0;
    score += primaryCount * 3.4 + lineScore * 3.2;

    if (sortedCategories[0]?.key === identityItem.primary) {
      score += 8;
    }

    if (sortedLines[0]?.key === identityItem.lineTag) {
      score += 12;
    }
  }

  if (identityItem.scope === "hidden") {
    if (identityItem.hiddenKey === "balanced") {
      score = rareFlags.balanced ? 99 : 56;
    } else if (identityItem.hiddenKey === "ac-high") {
      score = rareFlags.acHigh ? 97 : 54;
    } else if (identityItem.hiddenKey === "bd-high") {
      score = rareFlags.bdHigh ? 97 : 54;
    } else if (identityItem.hiddenKey === "scattered") {
      score = rareFlags.scattered ? 95 : 53;
    }
  }

  return Math.round(clamp(score, 0, 100));
}

/**
 * HTML 转义。
 * @param {string} rawText 原文。
 * @returns {string} 转义文本。
 */
function escapeSvgText(rawText) {
  return String(rawText ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 构建身份插画（SVG Data URL）。
 * @param {object} identityItem 身份定义。
 * @param {string} lineLabel 线别文案。
 * @returns {string} Data URL。
 */
function buildIdentityArtworkDataUrl(identityItem, lineLabel) {
  const styleTokens = STYLE_TOKENS[identityItem.styleKey] ?? STYLE_TOKENS.mystic;
  const safeIdentityName = escapeSvgText(identityItem.name);
  const safeCoreTag = escapeSvgText(identityItem.coreTag);
  const safeLineLabel = escapeSvgText(lineLabel);
  const safeGlyph = escapeSvgText(styleTokens.glyph);

  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1240" height="760" viewBox="0 0 1240 760" fill="none">
      <defs>
        <linearGradient id="bg" x1="120" y1="90" x2="1110" y2="670" gradientUnits="userSpaceOnUse">
          <stop stop-color="${styleTokens.gradientStart}"/>
          <stop offset="1" stop-color="${styleTokens.gradientEnd}"/>
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(938 170) rotate(117) scale(460 570)">
          <stop stop-color="${styleTokens.glowColor}"/>
          <stop offset="1" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>

      <rect x="28" y="24" width="1184" height="712" rx="34" fill="url(#bg)"/>
      <rect x="28" y="24" width="1184" height="712" rx="34" fill="url(#glow)"/>
      <rect x="52" y="48" width="1136" height="664" rx="26" stroke="${styleTokens.lineColor}" stroke-opacity="0.58" stroke-width="2.4" stroke-dasharray="9 8"/>

      <text x="110" y="164" fill="${styleTokens.lineColor}" fill-opacity="0.9" font-size="42" font-family="Noto Serif SC" letter-spacing="5">${safeLineLabel} · 终极身份</text>
      <text x="110" y="286" fill="white" font-size="98" font-weight="700" font-family="Noto Serif SC">${safeIdentityName}</text>
      <text x="110" y="372" fill="${styleTokens.lineColor}" font-size="44" font-family="Noto Sans SC">${safeCoreTag}</text>

      <circle cx="1006" cy="548" r="118" fill="rgba(255,255,255,0.08)"/>
      <circle cx="1006" cy="548" r="118" stroke="${styleTokens.lineColor}" stroke-opacity="0.42" stroke-width="2"/>
      <text x="960" y="574" fill="${styleTokens.lineColor}" font-size="112" font-family="Noto Serif SC">${safeGlyph}</text>

      <text x="110" y="622" fill="rgba(255,255,255,0.84)" font-size="34" font-family="Noto Sans SC">古风江湖人格画像 · 可保存分享</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}

/**
 * 计算主身份展示分值。
 * @param {object} categoryCounts 分类统计。
 * @param {Array<{ key: string, count: number }>} sortedCategories 排序后分类。
 * @param {string} decisionMode 判定模式。
 * @returns {number} 主身份匹配分值。
 */
function buildMainIdentityScore(categoryCounts, sortedCategories, decisionMode) {
  const topCount = sortedCategories[0]?.count ?? 0;
  const secondCount = sortedCategories[1]?.count ?? 0;
  const thirdCount = sortedCategories[2]?.count ?? 0;

  let score = 52 + topCount * 3.2 + secondCount * 1.7 + thirdCount * 0.6;

  if (decisionMode === "hidden") {
    score += 8;
  }

  if (decisionMode === "line") {
    score += 4;
  }

  return Math.round(clamp(score, 60, 99));
}

/**
 * 构建本地分析叙事。
 * @param {object} params 叙事参数。
 * @returns {string} 叙事文案。
 */
function buildLocalNarrative({
  identityItem,
  topCategoryKey,
  secondCategoryKey,
  topLineKey,
  decisionMode,
  rareIdentityName,
}) {
  const topCategoryLabel = CATEGORY_LABELS[topCategoryKey] ?? "综合倾向";
  const secondCategoryLabel = CATEGORY_LABELS[secondCategoryKey] ?? "辅助倾向";
  const topLineLabel = LINE_LABELS[topLineKey] ?? "综合线";

  if (decisionMode === "hidden") {
    return `你触发了隐藏稀有身份「${rareIdentityName}」。答卷呈现出非常规结构，说明你在不同情境下会主动切换策略，不被单一路径锁死。${identityItem.summary}`;
  }

  if (decisionMode === "line") {
    return `你的主导倾向是「${topCategoryLabel}」，并且在「${topLineLabel}」明显领先，因此最终锁定为「${identityItem.name}」。${identityItem.summary}`;
  }

  return `你的答卷以「${topCategoryLabel}」为主轴，同时叠加「${secondCategoryLabel}」，最终匹配到「${identityItem.name}」。${identityItem.summary}`;
}

/**
 * 解析最终身份。
 * @param {object} context 判定上下文。
 * @returns {{ finalIdentityName: string, baseIdentityName: string, lineIdentityName: string, decisionMode: "base"|"line"|"hidden", rareIdentityName: string }} 身份判定结果。
 */
function resolveFinalIdentity(context) {
  const { sortedCategories, sortedLines, rareFlags } = context;
  const topCategoryKey = sortedCategories[0]?.key ?? "A";

  const rareIdentityName = resolveRareIdentity(rareFlags);
  if (rareIdentityName) {
    return {
      finalIdentityName: rareIdentityName,
      baseIdentityName: resolveBaseIdentity(sortedCategories).identityName,
      lineIdentityName: resolveLineIdentity(sortedLines, topCategoryKey).identityName,
      decisionMode: "hidden",
      rareIdentityName,
    };
  }

  const baseIdentityResult = resolveBaseIdentity(sortedCategories);
  const lineIdentityResult = resolveLineIdentity(sortedLines, topCategoryKey);

  if (lineIdentityResult.shouldUseLineIdentity) {
    return {
      finalIdentityName: lineIdentityResult.identityName,
      baseIdentityName: baseIdentityResult.identityName,
      lineIdentityName: lineIdentityResult.identityName,
      decisionMode: "line",
      rareIdentityName: "",
    };
  }

  return {
    finalIdentityName: baseIdentityResult.identityName,
    baseIdentityName: baseIdentityResult.identityName,
    lineIdentityName: lineIdentityResult.identityName,
    decisionMode: "base",
    rareIdentityName: "",
  };
}

/**
 * 构建性格画像卡片。
 * @param {object} params 参数对象。
 * @param {"A"|"B"|"C"|"D"} params.topCategoryKey 主导类别。
 * @param {"A"|"B"|"C"|"D"} params.secondCategoryKey 次级类别。
 * @param {"palace"|"jianghu"|"literati"|"market"} params.topLineKey 主导线别。
 * @returns {Array<{ keyword: string, note: string }>} 性格画像项。
 */
function buildTraitProfiles({ topCategoryKey, secondCategoryKey, topLineKey }) {
  const topTraitProfiles =
    CATEGORY_TRAIT_PROFILE_LIBRARY[topCategoryKey] ??
    CATEGORY_TRAIT_PROFILE_LIBRARY.A;
  const secondaryTraitProfiles =
    CATEGORY_TRAIT_PROFILE_LIBRARY[secondCategoryKey] ??
    CATEGORY_TRAIT_PROFILE_LIBRARY.B;
  const lineTraitProfile =
    LINE_TRAIT_PROFILE_LIBRARY[topLineKey] ??
    LINE_TRAIT_PROFILE_LIBRARY.palace;

  const mergedTraitProfiles = [
    ...topTraitProfiles.slice(0, 3),
    secondaryTraitProfiles[0],
    lineTraitProfile,
  ].filter(Boolean);

  const seenKeywordSet = new Set();
  const dedupedTraitProfiles = [];
  mergedTraitProfiles.forEach((traitProfile) => {
    if (seenKeywordSet.has(traitProfile.keyword)) {
      return;
    }

    seenKeywordSet.add(traitProfile.keyword);
    dedupedTraitProfiles.push(traitProfile);
  });

  return dedupedTraitProfiles.slice(0, 5);
}

/**
 * 生成结果页模块数据。
 * @param {object} params 参数对象。
 * @param {string} params.identityName 身份名称。
 * @param {string} params.identitySlogan 身份爆款判词。
 * @param {"A"|"B"|"C"|"D"} params.topCategoryKey 主导类别。
 * @param {"A"|"B"|"C"|"D"} params.secondCategoryKey 次级类别。
 * @param {"palace"|"jianghu"|"literati"|"market"} params.topLineKey 主导线别。
 * @returns {{ honorTitle: string, personaLine: string, traitProfiles: Array<{ keyword: string, note: string }>, quoteLines: Array<string>, ancientJobs: Array<string>, ancientScenes: Array<string>, modernJobs: Array<string>, modernTraits: Array<string>, socialHookLines: Array<string> }} 结果页模块数据。
 */
function buildIdentityModules({
  identityName,
  identitySlogan,
  topCategoryKey,
  secondCategoryKey,
  topLineKey,
}) {
  const honorTitle =
    CATEGORY_HONOR_TITLE_LIBRARY[topCategoryKey] ??
    CATEGORY_HONOR_TITLE_LIBRARY.A;
  const personaTemplate =
    CATEGORY_PERSONA_TEMPLATE_LIBRARY[topCategoryKey] ??
    CATEGORY_PERSONA_TEMPLATE_LIBRARY.A;
  const personaLine = interpolateTemplate(personaTemplate, {
    identityName,
  });

  const traitProfiles = buildTraitProfiles({
    topCategoryKey,
    secondCategoryKey,
    topLineKey,
  });

  const quoteLines = [
    String(identitySlogan ?? "").trim(),
    ...(CATEGORY_QUOTE_LIBRARY[topCategoryKey] ?? CATEGORY_QUOTE_LIBRARY.A),
  ].filter(Boolean);

  const ancientFitConfig =
    LINE_ANCIENT_FIT_LIBRARY[topLineKey] ?? LINE_ANCIENT_FIT_LIBRARY.palace;
  const modernMappingConfig =
    CATEGORY_MODERN_MAPPING_LIBRARY[topCategoryKey] ??
    CATEGORY_MODERN_MAPPING_LIBRARY.A;
  const socialHookConfig =
    CATEGORY_SOCIAL_HOOK_LIBRARY[topCategoryKey] ??
    CATEGORY_SOCIAL_HOOK_LIBRARY.A;

  const socialHookLines = [
    `你的古代身份是「${identityName}」，最适合和「${socialHookConfig.confidant}」做知己，和「${socialHookConfig.partner}」做搭档。`,
    "把结果发给朋友来配对，看你们是并肩闯江湖，还是互补成王炸。",
  ];

  return {
    honorTitle,
    personaLine,
    traitProfiles,
    quoteLines: quoteLines.slice(0, 3),
    ancientJobs: ancientFitConfig.jobs,
    ancientScenes: ancientFitConfig.scenes,
    modernJobs: modernMappingConfig.jobs,
    modernTraits: modernMappingConfig.traits,
    socialHookLines,
  };
}

/**
 * 古代身份本地分析。
 * 复杂度评估：
 * 1. 答卷摘要与统计：O(Q)
 * 2. 36 身份候选评分：O(I)
 * 3. 排序：O(I log I)
 * 总体复杂度：O(Q + I log I)
 * Q=题目数量，I=身份数量（固定 36），实际运行开销稳定。
 * @param {object} params 参数对象。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @returns {{ topIdentity: object, topThree: Array<object>, scoredIdentities: Array<object>, answerSummary: Array<object>, summaryLines: Array<string>, categoryCounts: object, lineCounts: object, sortedCategories: Array<object>, sortedLines: Array<object>, rareFlags: object, localNarrative: string, typeCardItems: Array<object>, distributionItems: Array<object>, identityModules: object, dominantCategoryLabel: string, secondaryCategoryLabel: string, dominantLineLabel: string }} 本地分析结果。
 */
export function analyzeAncientIdentityLocally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const { categoryCounts, lineCounts, categorySwitchCount } = buildCountStats(
    answerSummary,
  );

  const sortedCategories = sortCounter(categoryCounts, CATEGORY_PRIORITY);
  const sortedLines = sortCounter(lineCounts, LINE_PRIORITY);
  const rareFlags = resolveRareFlags(
    categoryCounts,
    sortedCategories,
    categorySwitchCount,
  );

  const identityContext = {
    categoryCounts,
    lineCounts,
    sortedCategories,
    sortedLines,
    rareFlags,
  };

  const scoredIdentities = IDENTITY_DEFINITIONS.map((identityItem) => ({
    ...identityItem,
    score: calculateIdentityCandidateScore(identityItem, identityContext),
  })).sort((leftItem, rightItem) => rightItem.score - leftItem.score);

  const identityDecision = resolveFinalIdentity({
    sortedCategories,
    sortedLines,
    rareFlags,
  });

  const finalIdentityDefinition = IDENTITY_RECORD_MAP[identityDecision.finalIdentityName];

  /**
   * 关键逻辑：主身份分值使用独立公式，避免被“候选排序分值”压低可读性。
   */
  const topIdentityScore = buildMainIdentityScore(
    categoryCounts,
    sortedCategories,
    identityDecision.decisionMode,
  );

  const topIdentity = {
    ...finalIdentityDefinition,
    score: topIdentityScore,
    lineLabel: LINE_LABELS[sortedLines[0]?.key] ?? "综合线",
    artwork: {
      url: buildIdentityArtworkDataUrl(
        finalIdentityDefinition,
        LINE_LABELS[sortedLines[0]?.key] ?? "综合线",
      ),
      alt: `${finalIdentityDefinition.name}古风画像`,
      caption: `${LINE_LABELS[sortedLines[0]?.key] ?? "综合线"} · ${
        finalIdentityDefinition.coreTag
      }`,
    },
  };

  /**
   * 关键逻辑：
   * 1. Top3 必须严格按分值降序展示，避免出现“99 排在 100 前面”的视觉矛盾。
   * 2. 主身份若出现在榜单中，沿用主身份展示分值，保证同一身份在页面内分值一致。
   */
  const topThreeScoreItems = scoredIdentities.map((identityItem) => ({
    name: identityItem.name,
    score:
      identityItem.name === topIdentity.name
        ? topIdentity.score
        : identityItem.score,
  }));
  const topThree = sortIdentityScoreItems(topThreeScoreItems).slice(0, 3);

  const topCategoryKey = sortedCategories[0]?.key ?? "A";
  const secondCategoryKey = sortedCategories[1]?.key ?? "B";
  const topLineKey = sortedLines[0]?.key ?? "palace";

  const localNarrative = buildLocalNarrative({
    identityItem: finalIdentityDefinition,
    topCategoryKey,
    secondCategoryKey,
    topLineKey,
    decisionMode: identityDecision.decisionMode,
    rareIdentityName: identityDecision.rareIdentityName,
  });
  const identityModules = buildIdentityModules({
    identityName: finalIdentityDefinition.name,
    identitySlogan: finalIdentityDefinition.slogan,
    topCategoryKey,
    secondCategoryKey,
    topLineKey,
  });

  const dominantActionSet = CATEGORY_ACTION_LIBRARY[topCategoryKey] ??
    CATEGORY_ACTION_LIBRARY.A;

  const distributionItems = CATEGORY_PRIORITY.map((categoryKey) => {
    const ratio = Math.round((categoryCounts[categoryKey] / Math.max(1, questions.length)) * 100);
    return {
      name: `${categoryKey} 类`,
      score: ratio,
      color:
        categoryKey === "A"
          ? "#B45A3C"
          : categoryKey === "B"
            ? "#5D70B7"
            : categoryKey === "C"
              ? "#4C8874"
              : "#B8863A",
    };
  });

  return {
    topIdentity,
    topThree,
    scoredIdentities,
    answerSummary,
    summaryLines,
    categoryCounts,
    lineCounts,
    sortedCategories,
    sortedLines,
    rareFlags,
    localNarrative,
    typeCardItems: identityModules.traitProfiles.map((traitProfile) => ({
      value: traitProfile.keyword,
      label: traitProfile.note,
    })),
    distributionItems,
    identityModules,
    growthActions: dominantActionSet.growthActions,
    avoidSignals: dominantActionSet.avoidSignals,
    dominantCategoryLabel: CATEGORY_LABELS[topCategoryKey],
    secondaryCategoryLabel: CATEGORY_LABELS[secondCategoryKey],
    dominantLineLabel: LINE_LABELS[topLineKey],
  };
}
