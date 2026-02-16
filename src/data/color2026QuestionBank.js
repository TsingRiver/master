/**
 * 2026 主题色测试题库（50题）：
 * 1. 题目全部使用日常场景表达，降低理解门槛。
 * 2. 每个选项通过关键词规则映射到颜色向量。
 * 3. 支持每轮随机抽取 10~15 题（由统一抽题逻辑控制）。
 */

/**
 * 颜色维度键。
 */
const COLOR_KEYS = [
  "black",
  "blue",
  "red",
  "green",
  "yellow",
  "purple",
  "orange",
  "white",
];

/**
 * 颜色相邻关系：
 * 关键逻辑：主色之外，给相邻色少量分值，避免结果过于离散。
 */
const COLOR_RELATION_MAP = {
  black: ["blue", "white"],
  blue: ["black", "white"],
  red: ["orange", "yellow"],
  green: ["blue", "yellow"],
  yellow: ["orange", "green"],
  purple: ["blue", "red"],
  orange: ["red", "yellow"],
  white: ["blue", "green"],
};

/**
 * 默认位次映射：
 * 当选项文案没有命中关键词规则时，按 A/B/C/D 映射颜色。
 */
const DEFAULT_COLOR_TYPES = ["black", "blue", "red", "white"];

/**
 * 文案关键词到颜色映射规则：
 * 关键逻辑：按优先级命中第一条规则即返回。
 */
const COLOR_TYPE_RULES = [
  {
    type: "black",
    pattern: /黑|深色|夜|极简|低调|静音|冷感|独处|纯色|曜石|暗调|无logo/,
  },
  {
    type: "blue",
    pattern: /蓝|海|风|通勤|理性|科技|冷静|深呼吸|雨|水感|雾蓝|深海/,
  },
  {
    type: "red",
    pattern: /红|热血|开干|主角|立刻|冲|燃|火辣|气场|硬刚|高能/,
  },
  {
    type: "green",
    pattern: /绿|植物|公园|自然|养生|清新|徒步|草地|森系|治愈感/, 
  },
  {
    type: "yellow",
    pattern: /黄|阳光|开心|甜|明亮|活力|柠檬|向日|元气|金色/, 
  },
  {
    type: "purple",
    pattern: /紫|浪漫|梦|神秘|星空|香薰|艺术|玄幻|氛围|灵感|夜紫/,
  },
  {
    type: "orange",
    pattern: /橙|奶茶|晚霞|烟火|温暖|社交|热闹|南瓜|落日|橘|暖调/,
  },
  {
    type: "white",
    pattern: /白|干净|云|棉|米白|整洁|纯净|留白|简洁|雾白/,
  },
];

/**
 * 创建零向量。
 * @returns {{ [key: string]: number }} 零向量对象。
 */
function createZeroVector() {
  return COLOR_KEYS.reduce((accumulator, colorKey) => {
    accumulator[colorKey] = 0;
    return accumulator;
  }, {});
}

/**
 * 根据主色构建向量。
 * @param {string} primaryColorKey 主颜色键。
 * @returns {{ [key: string]: number }} 颜色向量。
 */
function createColorVector(primaryColorKey) {
  const vector = createZeroVector();
  vector[primaryColorKey] = 10;

  const relatedColorList = COLOR_RELATION_MAP[primaryColorKey] ?? [];
  relatedColorList.forEach((relatedColorKey) => {
    vector[relatedColorKey] = 3;
  });

  return vector;
}

/**
 * 预置颜色向量。
 */
const COLOR_VECTOR_PRESETS = COLOR_KEYS.reduce((accumulator, colorKey) => {
  accumulator[colorKey] = createColorVector(colorKey);
  return accumulator;
}, {});

/**
 * 深拷贝向量，避免引用共享。
 * @param {string} colorType 颜色类型。
 * @returns {object} 向量副本。
 */
function cloneVector(colorType) {
  return { ...(COLOR_VECTOR_PRESETS[colorType] ?? COLOR_VECTOR_PRESETS.blue) };
}

/**
 * 解析选项文案对应的颜色类型。
 * @param {string} label 选项文案。
 * @param {number} optionIndex 选项索引（0~3）。
 * @returns {string} 颜色类型。
 */
function resolveColorType(label, optionIndex) {
  const normalizedLabel = String(label ?? "");

  for (const ruleItem of COLOR_TYPE_RULES) {
    if (ruleItem.pattern.test(normalizedLabel)) {
      return ruleItem.type;
    }
  }

  return DEFAULT_COLOR_TYPES[optionIndex] ?? "blue";
}

/**
 * 构建单题对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {Array<string>} params.options 选项文案。
 * @param {number} [params.weight=1.08] 题目权重。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<object> }} 标准题目对象。
 */
function buildQuestion({ id, title, options, weight = 1.08 }) {
  return {
    id,
    title,
    description: "按第一反应选你最有感觉的一项。",
    weight,
    options: options.map((label, optionIndex) => {
      const optionChar = String.fromCharCode(97 + optionIndex);
      const colorType = resolveColorType(label, optionIndex);

      return {
        id: `${id}-option-${optionChar}`,
        label,
        vector: cloneVector(colorType),
      };
    }),
  };
}

/**
 * 原始题库条目（50题）。
 */
const RAW_QUESTION_ITEMS = [
  { title: "周末突然空出半天，你第一反应会去？", options: ["拉上窗帘独处听黑胶", "去海边吹风", "去草地公园野餐", "去市集感受烟火热闹"] },
  { title: "下班回家后你最想先做？", options: ["把手机静音，安静放空", "打开待办，理性拆解任务", "换上运动鞋立刻开干", "洗个热水澡，给自己留白"] },
  { title: "旅行订酒店时你最看重窗外景色？", options: ["城市夜景，低调有层次", "海面和风，脑子会清醒", "树和草地，治愈感很足", "能看到晚霞落日，温暖又出片"] },
  { title: "如果换一张新壁纸，你更会选？", options: ["深夜安静街景", "海浪和风的画面", "阳光照在草地上", "星空和梦感氛围"] },
  { title: "朋友约局时你更偏好的氛围是？", options: ["角落独处深聊，不吵不闹", "有规划的理性聊天，主题明确", "现场热闹，大家都很有活力", "轻松陪伴，节奏柔和舒服"] },
  { title: "工作卡住时，你更常用哪种解法？", options: ["先断开打扰，独处冷静", "写清单，用理性结构化思路推进", "先开干再优化，保持行动", "出门晒太阳或散步恢复状态"] },
  { title: "早餐你更容易选到？", options: ["黑咖啡，偏冷感", "海盐酸奶，清爽通透", "南瓜热食，温暖有劲", "牛奶燕麦，干净轻负担"] },
  { title: "你喜欢的房间气味更像？", options: ["木质暗调，安静沉稳", "海风水感，清透理性", "草木香，像在公园里", "柑橘明亮，开心有活力"] },
  { title: "下雨天你更想安排什么？", options: ["关灯听歌，独处一会儿", "听雨看窗，整理思路", "约朋友吃热汤，社交回血", "泡澡早点睡，留白恢复"] },
  { title: "看电影时你更常点开哪类？", options: ["悬疑冷感片", "科幻理性片", "热血高能片", "治愈日常片"] },
  { title: "你想让自己练成哪种能力？", options: ["稳住边界，不被噪音牵走", "清晰判断，复杂事也有条理", "遇事敢冲，执行力拉满", "长期恢复，状态稳稳在线"] },
  { title: "运动方式你更偏好？", options: ["独处夜跑配低频音乐", "沿海慢跑吹风", "公园徒步看植物", "团课燃脂把气氛点燃"] },
  { title: "最想留在相册里的画面是？", options: ["深夜街景的静感", "海面反光和风", "草地树影和阳光", "烟火或落日的温度"] },
  { title: "朋友通常怎么形容你？", options: ["低调、稳、能扛事", "理性、清晰、可靠", "热情、主动、有冲劲", "温柔、干净、让人放松"] },
  { title: "周一开工时，你会优先准备？", options: ["降噪和边界，先稳情绪", "任务分区和节奏表", "激励句和冲刺清单", "桌面整洁和留白空间"] },
  { title: "逛街时更容易被哪类店吸引？", options: ["深色极简店", "通透科技感店", "暖灯热闹小店", "艺术灵感小展"] },
  { title: "理想假期节奏更接近？", options: ["一个人独处慢慢充电", "每天有计划地探索", "和朋友从白天玩到很热闹", "在自然里慢慢恢复"] },
  { title: "朋友圈内容你更常发？", options: ["简短冷静的当下感受", "结构清晰的攻略总结", "热闹现场和高能瞬间", "灵感碎片或梦感文字"] },
  { title: "压力大时你最有效的安抚方式？", options: ["戴耳机独处，先安静下来", "写下方案，理性拆问题", "狠狠干一件事找回掌控感", "热水+早睡，把身心放松"] },
  { title: "你会优先抢哪张活动票？", options: ["夜场电影或深夜展", "海边晨跑活动", "森林徒步营", "音乐节和烟火现场"] },
  { title: "理想工作环境更像？", options: ["低噪安静工位", "明亮有秩序的功能区", "可以高频协作的讨论区", "有植物和阳光的恢复角"] },
  { title: "什么最能让你重燃状态？", options: ["把外界噪音降到最低", "看见数据和进度条在动", "朋友在场一起把事做成", "突然冒出的灵感和新想法"] },
  { title: "饮料四选一，你更常点？", options: ["黑咖啡", "海盐气泡水", "热可可", "柠檬苏打"] },
  { title: "夜晚散步路线你会选？", options: ["安静夜路小巷", "河边吹风路线", "公园草地路线", "城市霓虹氛围路线"] },
  { title: "你希望家的整体气质是？", options: ["克制有边界", "清醒有秩序", "温暖有烟火", "干净有留白"] },
  { title: "如果今天只做一件事，你会选？", options: ["立刻开干最难的一件", "把资料理性整理成系统", "约朋友见面聊聊", "去草地晒太阳恢复能量"] },
  { title: "你的日常穿搭更接近？", options: ["深色简洁", "清爽通勤", "活力亮点", "软糯松弛"] },
  { title: "你和宠物相处更像哪种模式？", options: ["安静陪伴，各做各事", "规律散步，节奏稳定", "高互动，玩起来很热闹", "抱抱治愈，慢慢放松"] },
  { title: "你最常收藏的内容类型是？", options: ["冷静观点和深度表达", "方法论和工具清单", "探店和热闹生活切片", "诗歌或灵感片段"] },
  { title: "你想尝试一项新爱好，会选？", options: ["夜间摄影", "潜水看海", "园艺植物种植", "即兴舞蹈燃起来"] },
  { title: "在团队里你更常担任？", options: ["定边界和风险把关", "结构化总结和推进", "拉动节奏和行动", "照顾氛围和情绪"] },
  { title: "约会地点你更想去？", options: ["安静留白书吧角落", "海边步道", "草地野餐", "市集热闹小吃"] },
  { title: "收到坏消息后你通常先？", options: ["先独处冷静", "先写下应对方案", "先找人聊再出发", "先休息恢复再处理"] },
  { title: "你想把 2026 过成什么感觉？", options: ["稳住节奏，不乱不慌", "目标清晰，持续推进", "抓住机会，主动突破", "身心轻盈，长期松弛"] },
  { title: "去书店时你最先拿起？", options: ["冷感悬疑或纪实", "理性逻辑与策略类", "冒险或热血故事", "诗集或艺术集"] },
  { title: "哪种天气最让你舒服？", options: ["夜色安静的晚风", "海风晴天", "雨后草地植物味", "冬日明亮阳光"] },
  { title: "给工位加一个小物，你会选？", options: ["静音降噪耳机", "理性计划白板", "暖光小台灯", "留白便签架"] },
  { title: "如果拍一条 vlog，你更会做？", options: ["深夜独处记录", "效率清单复盘", "城市烟火探店", "灵感与梦感日记"] },
  { title: "做饭时你最享受哪一段？", options: ["安静切配的专注感", "按步骤复刻的秩序感", "朋友围着一起做的热闹感", "摆盘干净后的治愈感"] },
  { title: "给 2026 立一条规则，你选？", options: ["少噪音，守住边界", "多复盘，多结构", "多行动，少犹豫", "多休息，多留白"] },
  { title: "旅行纪念品你更愿意买？", options: ["深色手账本", "海风明信片", "向日葵挂件", "温暖手作陶杯"] },
  { title: "听歌列表你更偏好？", options: ["低频冷感电子", "清透海风器乐", "热血节奏", "梦幻氛围"] },
  { title: "你最期待哪种清晨？", options: ["云层柔光慢慢醒", "阳光照进窗台", "海风把脑子吹清醒", "公园慢跑出汗"] },
  { title: "如果调整社交状态，你更想要？", options: ["低频往来但边界清晰", "理性精准沟通高质量连接", "主动组局热闹一点", "轻松陪伴不内耗"] },
  { title: "今天给自己的奖励，你会选？", options: ["一个人看夜场电影", "去河边吹风散步", "吃一顿热气腾腾", "买束花放在桌上"] },
  { title: "你希望别人从你身上感受到？", options: ["沉稳低调力量", "理性清晰可靠", "热情冲劲感染力", "温柔舒展"] },
  { title: "哪种画面最让你放松？", options: ["远处海平线", "草地和树影", "壁炉和暖光", "干净床品和留白"] },
  { title: "允许保留一道颜色直觉题，你先选哪一组？", weight: 1.18, options: ["曜石黑", "深海蓝", "松柏绿", "珊瑚橙"] },
  { title: "再来一道场景题，你更想去哪拍照？", options: ["城市夜景天台", "海边风很大的堤岸", "草地帐篷午睡区", "白墙阳光和影子"] },
  { title: "最后一题：明天你只发一张照片，会发？", weight: 1.25, options: ["安静夜路", "海风和天空", "市集烟火人群", "云朵和留白"] },
];

/**
 * 颜色主题题库。
 */
export const COLOR_2026_QUESTION_BANK = RAW_QUESTION_ITEMS.map((item, index) => {
  const questionId = `color-2026-q-${String(index + 1).padStart(3, "0")}`;
  return buildQuestion({
    id: questionId,
    title: item.title,
    options: item.options,
    weight: item.weight,
  });
});
