/**
 * 古代身份题库（50 题）：
 * 1. 每题固定 4 选项，对应 A/B/C/D 四类人格倾向。
 * 2. 选项额外携带身份提示与线别标签，用于 36 身份算法判定。
 * 3. 题目文本按产品文案要求落地，避免运行时再做语义转换。
 */

/**
 * 线别关键词规则：
 * 关键逻辑：先按身份提示词匹配宫廷/江湖/文人/市井，若未命中再回落到选项类别默认线别。
 */
const OPTION_LINE_KEYWORD_RULES = [
  {
    lineTag: "palace",
    pattern:
      /禁军|镇国|太子|内务府|御膳|宫廷|侍卫|掌事|王府|近侍|进士|太傅|统领|官府|钦差|内廷/u,
  },
  {
    lineTag: "jianghu",
    pattern:
      /江湖|侠|镖|猎户|战士|猛将|将军|暗卫|影卫|笛客|教头|沙场|戍边|护卫|仵作|刀客/u,
  },
  {
    lineTag: "literati",
    pattern:
      /书院|先生|文|诗|词|琴|书画|大儒|名士|公子|才子|谪仙|清谈|伴读|师者|塾/u,
  },
  {
    lineTag: "market",
    pattern:
      /掌柜|铺|商|货郎|小贩|厨|茶馆|钱庄|东家|小二|艺人|摊贩|探店|财主|顽童|吃货|乐工|戏班|杂耍/u,
  },
];

/**
 * 选项类别到默认线别的回退映射。
 */
const CATEGORY_DEFAULT_LINE_MAP = {
  A: "jianghu",
  B: "literati",
  C: "palace",
  D: "market",
};

/**
 * 解析选项线别标签。
 * @param {string} identityHint 选项身份提示。
 * @param {"A"|"B"|"C"|"D"} category 选项类别。
 * @returns {"palace"|"jianghu"|"literati"|"market"} 线别标签。
 */
function resolveLineTag(identityHint, category) {
  const normalizedHint = String(identityHint ?? "").trim();

  for (const rule of OPTION_LINE_KEYWORD_RULES) {
    if (rule.pattern.test(normalizedHint)) {
      return rule.lineTag;
    }
  }

  return CATEGORY_DEFAULT_LINE_MAP[category] ?? "market";
}

/**
 * 构建标准题目对象。
 * @param {object} params 题目参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {Array<{ code: "A"|"B"|"C"|"D", text: string, identityHint: string }>} params.options 选项数组。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<object> }} 统一题目结构。
 */
function buildQuestion({ id, title, options }) {
  return {
    id,
    title,
    description: "按第一直觉选择最像你的一项。",
    weight: 1,
    options: options.map((optionItem) => {
      const optionCode = String(optionItem.code ?? "").toUpperCase();
      const safeCode = ["A", "B", "C", "D"].includes(optionCode)
        ? optionCode
        : "A";

      return {
        id: `${id}-option-${safeCode.toLowerCase()}`,
        // 关键逻辑：选项展示保持“纯题面”文本，身份提示仅用于内部算法，不对用户透出。
        label: String(optionItem.text ?? "").trim(),
        category: safeCode,
        identityHint: String(optionItem.identityHint ?? "").trim(),
        lineTag: resolveLineTag(optionItem.identityHint, safeCode),
      };
    }),
  };
}

/**
 * 原始题库（50 题）。
 */
const RAW_QUESTION_BANK = [
  {
    id: "ancient-01-first-focus",
    title: "穿越古代，你第一眼先关注？",
    options: [
      { code: "A", text: "安全与局势", identityHint: "镇边守卫" },
      { code: "B", text: "自身形象气质", identityHint: "清雅公子" },
      { code: "C", text: "环境细节线索", identityHint: "暗卫探子" },
      { code: "D", text: "食物与生存", identityHint: "市井厨子" },
    ],
  },
  {
    id: "ancient-02-superpower",
    title: "你最想拥有的能力？",
    options: [
      { code: "A", text: "武力高强", identityHint: "江湖侠客" },
      { code: "B", text: "才情绝世", identityHint: "文坛墨客" },
      { code: "C", text: "心思缜密", identityHint: "谋臣幕僚" },
      { code: "D", text: "财运亨通", identityHint: "商行掌柜" },
    ],
  },
  {
    id: "ancient-03-kindness-reaction",
    title: "别人对你好，你会？",
    options: [
      { code: "A", text: "涌泉相报", identityHint: "忠义之士" },
      { code: "B", text: "以礼相待", identityHint: "世家子弟" },
      { code: "C", text: "默默记恩", identityHint: "贴身近侍" },
      { code: "D", text: "坦然接受", identityHint: "富贵闲人" },
    ],
  },
  {
    id: "ancient-04-trouble-attitude",
    title: "遇到麻烦，你的态度？",
    options: [
      { code: "A", text: "直面解决", identityHint: "铁血武将" },
      { code: "B", text: "理性分析", identityHint: "文官谋士" },
      { code: "C", text: "静观其变", identityHint: "隐世高人" },
      { code: "D", text: "随缘化解", identityHint: "逍遥散人" },
    ],
  },
  {
    id: "ancient-05-color-preference",
    title: "你偏爱的古风颜色？",
    options: [
      { code: "A", text: "玄黑肃色", identityHint: "刑律执事" },
      { code: "B", text: "正红亮色", identityHint: "宫廷乐师" },
      { code: "C", text: "月白浅青", identityHint: "书院先生" },
      { code: "D", text: "暖黄柔色", identityHint: "绣坊匠人" },
    ],
  },
  {
    id: "ancient-06-live-place",
    title: "你更想住在哪里？",
    options: [
      { code: "A", text: "边关要塞", identityHint: "戍边将军" },
      { code: "B", text: "江南水乡", identityHint: "画舫主人" },
      { code: "C", text: "深山竹林", identityHint: "采药隐士" },
      { code: "D", text: "繁华闹市", identityHint: "杂货铺主" },
    ],
  },
  {
    id: "ancient-07-hate-behavior",
    title: "你最讨厌的行为？",
    options: [
      { code: "A", text: "背叛失信", identityHint: "侠义刀客" },
      { code: "B", text: "虚伪做作", identityHint: "清高文人" },
      { code: "C", text: "多管闲事", identityHint: "独行医者" },
      { code: "D", text: "贪小便宜", identityHint: "公正商贾" },
    ],
  },
  {
    id: "ancient-08-treasure-choice",
    title: "赐你一件宝物，你选？",
    options: [
      { code: "A", text: "神兵利器", identityHint: "护国侍卫" },
      { code: "B", text: "名家墨宝", identityHint: "藏书大家" },
      { code: "C", text: "济世医书", identityHint: "游方郎中" },
      { code: "D", text: "万贯银票", identityHint: "钱庄东家" },
    ],
  },
  {
    id: "ancient-09-friend-crisis",
    title: "朋友有难，你会？",
    options: [
      { code: "A", text: "拼命相助", identityHint: "热血义士" },
      { code: "B", text: "出谋划策", identityHint: "智囊谋士" },
      { code: "C", text: "默默陪伴", identityHint: "忠心事仆" },
      { code: "D", text: "出钱解决", identityHint: "仗义富商" },
    ],
  },
  {
    id: "ancient-10-core-personality",
    title: "你的性格底色？",
    options: [
      { code: "A", text: "刚烈果决", identityHint: "先锋猛将" },
      { code: "B", text: "温柔内敛", identityHint: "闺塾师者" },
      { code: "C", text: "沉静低调", identityHint: "隐秘影卫" },
      { code: "D", text: "乐观随性", identityHint: "杂耍艺人" },
    ],
  },
  {
    id: "ancient-11-street-priority",
    title: "古代逛街，你优先逛？",
    options: [
      { code: "A", text: "兵器武备", identityHint: "锻铁铁匠" },
      { code: "B", text: "书肆文房", identityHint: "诗词才子" },
      { code: "C", text: "脂粉妆饰", identityHint: "宫廷妆师" },
      { code: "D", text: "吃食点心", identityHint: "街头厨娘" },
    ],
  },
  {
    id: "ancient-12-season-preference",
    title: "你更喜欢的季节？",
    options: [
      { code: "A", text: "凛冽寒冬", identityHint: "边关战士" },
      { code: "B", text: "烟雨春日", identityHint: "江南词人" },
      { code: "C", text: "清爽秋日", identityHint: "山间居士" },
      { code: "D", text: "温暖长夏", identityHint: "茶馆掌柜" },
    ],
  },
  {
    id: "ancient-13-misunderstood-response",
    title: "被人误解，你会？",
    options: [
      { code: "A", text: "当场辩解", identityHint: "公正讼师" },
      { code: "B", text: "不屑多言", identityHint: "世外散仙" },
      { code: "C", text: "暗自委屈", identityHint: "温柔侍女" },
      { code: "D", text: "转头就忘", identityHint: "乐天小二" },
    ],
  },
  {
    id: "ancient-14-animal-like",
    title: "你更喜欢的动物？",
    options: [
      { code: "A", text: "猛虎猎豹", identityHint: "山林猎户" },
      { code: "B", text: "仙鹤灵鹿", identityHint: "修道真人" },
      { code: "C", text: "灵猫巧兽", identityHint: "王府近侍" },
      { code: "D", text: "锦鲤游鱼", identityHint: "福气财主" },
    ],
  },
  {
    id: "ancient-15-free-time",
    title: "空闲时间你更愿意？",
    options: [
      { code: "A", text: "习武强身", identityHint: "官府捕快" },
      { code: "B", text: "挥毫泼墨", identityHint: "书画名家" },
      { code: "C", text: "静坐观心", identityHint: "园林守者" },
      { code: "D", text: "钻研美味", identityHint: "宫廷私厨" },
    ],
  },
  {
    id: "ancient-16-value-priority",
    title: "你最看重的东西？",
    options: [
      { code: "A", text: "尊严气节", identityHint: "傲骨将军" },
      { code: "B", text: "才华名声", identityHint: "状元之才" },
      { code: "C", text: "安稳生活", identityHint: "府邸管家" },
      { code: "D", text: "实惠自在", identityHint: "游走货郎" },
    ],
  },
  {
    id: "ancient-17-speaking-style",
    title: "你的说话风格？",
    options: [
      { code: "A", text: "直来直去", identityHint: "镖局镖头" },
      { code: "B", text: "温文尔雅", identityHint: "教书先生" },
      { code: "C", text: "少言寡语", identityHint: "隐秘暗卫" },
      { code: "D", text: "俏皮风趣", identityHint: "说书先生" },
    ],
  },
  {
    id: "ancient-18-become-who",
    title: "你更想成为哪类人？",
    options: [
      { code: "A", text: "手握权柄", identityHint: "禁军统领" },
      { code: "B", text: "名满天下", identityHint: "风流名士" },
      { code: "C", text: "安稳度日", identityHint: "内廷掌事" },
      { code: "D", text: "吃喝不愁", identityHint: "食肆老板" },
    ],
  },
  {
    id: "ancient-19-work-style",
    title: "你的做事风格？",
    options: [
      { code: "A", text: "雷厉风行", identityHint: "钦差侍卫" },
      { code: "B", text: "慢条斯理", identityHint: "书法大家" },
      { code: "C", text: "细致周全", identityHint: "奶嬷嬷" },
      { code: "D", text: "灵活变通", identityHint: "市井商人" },
    ],
  },
  {
    id: "ancient-20-food-taste",
    title: "你更喜欢的食物？",
    options: [
      { code: "A", text: "大块酒肉", identityHint: "军营伙夫" },
      { code: "B", text: "精致糕点", identityHint: "御膳点心师" },
      { code: "C", text: "清淡素食", identityHint: "禅房居士" },
      { code: "D", text: "街头小吃", identityHint: "游食小贩" },
    ],
  },
  {
    id: "ancient-21-attract-type",
    title: "你更吸引哪类人？",
    options: [
      { code: "A", text: "强势守护者", identityHint: "将门虎女" },
      { code: "B", text: "灵魂知己者", identityHint: "诗酒文友" },
      { code: "C", text: "温柔治愈者", identityHint: "书香伴读" },
      { code: "D", text: "欢喜冤家者", identityHint: "市井顽童" },
    ],
  },
  {
    id: "ancient-22-cannot-miss",
    title: "你最不能缺少？",
    options: [
      { code: "A", text: "安全底气", identityHint: "近身护卫" },
      { code: "B", text: "成就认可", identityHint: "科举进士" },
      { code: "C", text: "归属温暖", identityHint: "家仆主管" },
      { code: "D", text: "银钱富足", identityHint: "行商小贩" },
    ],
  },
  {
    id: "ancient-23-dislike-person",
    title: "遇到不喜欢的人？",
    options: [
      { code: "A", text: "正面硬刚", identityHint: "江湖侠女" },
      { code: "B", text: "冷淡疏远", identityHint: "清冷公子" },
      { code: "C", text: "表面客气", identityHint: "圆滑管事" },
      { code: "D", text: "绕道而行", identityHint: "佛系摊贩" },
    ],
  },
  {
    id: "ancient-24-instrument",
    title: "你更喜欢的乐器？",
    options: [
      { code: "A", text: "战鼓号角", identityHint: "随军乐师" },
      { code: "B", text: "古琴雅乐", identityHint: "宫廷琴师" },
      { code: "C", text: "玉笛清声", identityHint: "江湖笛客" },
      { code: "D", text: "笙箫婉转", identityHint: "宴饮乐工" },
    ],
  },
  {
    id: "ancient-25-evaluation",
    title: "你最希望被评价为？",
    options: [
      { code: "A", text: "英勇无畏", identityHint: "沙场猛将" },
      { code: "B", text: "才高八斗", identityHint: "文坛领袖" },
      { code: "C", text: "可靠贴心", identityHint: "忠仆义士" },
      { code: "D", text: "有趣鲜活", identityHint: "民间艺人" },
    ],
  },
  {
    id: "ancient-26-party-role",
    title: "聚会中你通常是？",
    options: [
      { code: "A", text: "镇场核心", identityHint: "一方头领" },
      { code: "B", text: "谈吐担当", identityHint: "清谈名士" },
      { code: "C", text: "照顾众人", identityHint: "贴身丫鬟" },
      { code: "D", text: "搞笑气氛", identityHint: "戏班丑角" },
    ],
  },
  {
    id: "ancient-27-life-vision",
    title: "你最向往的生活？",
    options: [
      { code: "A", text: "征战四方", identityHint: "兵马大元帅" },
      { code: "B", text: "流芳百世", identityHint: "一代大儒" },
      { code: "C", text: "岁月静好", identityHint: "田园庄主" },
      { code: "D", text: "吃喝玩乐", identityHint: "逍遥财主" },
    ],
  },
  {
    id: "ancient-28-best-at",
    title: "你更擅长？",
    options: [
      { code: "A", text: "武力破局", identityHint: "江湖教头" },
      { code: "B", text: "智力布局", identityHint: "幕后谋士" },
      { code: "C", text: "细节洞察", identityHint: "官府仵作" },
      { code: "D", text: "生活打理", identityHint: "内宅总管" },
    ],
  },
  {
    id: "ancient-29-fear-most",
    title: "你最害怕？",
    options: [
      { code: "A", text: "受辱失节", identityHint: "侠义之士" },
      { code: "B", text: "平庸无为", identityHint: "追梦书生" },
      { code: "C", text: "漂泊无依", identityHint: "守家之人" },
      { code: "D", text: "饥寒交迫", identityHint: "吃货散仙" },
    ],
  },
  {
    id: "ancient-30-moments-post",
    title: "古代有朋友圈，你会发？",
    options: [
      { code: "A", text: "战绩狩猎", identityHint: "铁血武将" },
      { code: "B", text: "诗词风景", identityHint: "风雅文人" },
      { code: "C", text: "日常花草", identityHint: "温婉侍女" },
      { code: "D", text: "美食小摊", identityHint: "市井博主" },
    ],
  },
  {
    id: "ancient-31-night-conflict",
    title: "夜里听到巷口打斗声，你会？",
    options: [
      { code: "A", text: "抄家伙去制止", identityHint: "巡街武卫" },
      { code: "B", text: "先判断谁在撒谎", identityHint: "书院辩士" },
      { code: "C", text: "藏在暗处观察", identityHint: "夜行暗探" },
      { code: "D", text: "先护好家人再报官", identityHint: "巷陌掌柜" },
    ],
  },
  {
    id: "ancient-32-windfall-plan",
    title: "手里突然有一笔横财，你第一反应？",
    options: [
      { code: "A", text: "购置兵甲和马匹", identityHint: "边军统筹" },
      { code: "B", text: "置办书画与琴器", identityHint: "雅集主人" },
      { code: "C", text: "存入库房留后路", identityHint: "府库管事" },
      { code: "D", text: "投进生意滚雪球", identityHint: "行旅商贾" },
    ],
  },
  {
    id: "ancient-33-long-trip",
    title: "赶远路时你更看重？",
    options: [
      { code: "A", text: "路线安全与效率", identityHint: "押镖头领" },
      { code: "B", text: "沿途风景与故事", identityHint: "山水词客" },
      { code: "C", text: "行囊细节与备份", identityHint: "随行近侍" },
      { code: "D", text: "吃住舒适与性价比", identityHint: "客栈东家" },
    ],
  },
  {
    id: "ancient-34-hate-boss",
    title: "你最受不了哪种上司？",
    options: [
      { code: "A", text: "临阵退缩", identityHint: "前线将官" },
      { code: "B", text: "粗鄙无礼", identityHint: "清谈名士" },
      { code: "C", text: "朝令夕改", identityHint: "内府司官" },
      { code: "D", text: "拖欠工钱", identityHint: "市井掌柜" },
    ],
  },
  {
    id: "ancient-35-exam-night",
    title: "古代考试前一晚，你会？",
    options: [
      { code: "A", text: "练刀练枪稳心气", identityHint: "武备都尉" },
      { code: "B", text: "背诵到天亮", identityHint: "科举才子" },
      { code: "C", text: "检查文具和路线", identityHint: "内廷执事" },
      { code: "D", text: "先睡饱明天再说", identityHint: "茶肆老板" },
    ],
  },
  {
    id: "ancient-36-secret-attitude",
    title: "面对朋友的秘密，你会？",
    options: [
      { code: "A", text: "替他扛事不外传", identityHint: "义胆侠士" },
      { code: "B", text: "规劝他做更好选择", identityHint: "温雅师者" },
      { code: "C", text: "烂在肚子里不多话", identityHint: "贴身暗卫" },
      { code: "D", text: "帮他把损失降到最低", identityHint: "通达商人" },
    ],
  },
  {
    id: "ancient-37-team-role",
    title: "在团队里你常担任？",
    options: [
      { code: "A", text: "冲锋定调的人", identityHint: "先锋统领" },
      { code: "B", text: "组织表达的人", identityHint: "文案主笔" },
      { code: "C", text: "把关细节的人", identityHint: "账房管家" },
      { code: "D", text: "协调资源的人", identityHint: "市集行头" },
    ],
  },
  {
    id: "ancient-38-collection-choice",
    title: "你更想收藏什么？",
    options: [
      { code: "A", text: "传世兵器", identityHint: "镇馆武者" },
      { code: "B", text: "孤本典籍", identityHint: "藏经大家" },
      { code: "C", text: "密函档案", identityHint: "机要司吏" },
      { code: "D", text: "稀有食谱", identityHint: "名厨掌勺" },
    ],
  },
  {
    id: "ancient-39-stand-up",
    title: "被突然放鸽子，你会？",
    options: [
      { code: "A", text: "当面问清楚", identityHint: "镖局镖头" },
      { code: "B", text: "写封信讲感受", identityHint: "词章名士" },
      { code: "C", text: "记下这次教训", identityHint: "内宅管事" },
      { code: "D", text: "转头约别人去玩", identityHint: "酒楼少东" },
    ],
  },
  {
    id: "ancient-40-ideal-morning",
    title: "你理想的清晨是？",
    options: [
      { code: "A", text: "闻鸡起舞", identityHint: "戍城武官" },
      { code: "B", text: "临窗读诗", identityHint: "书院学正" },
      { code: "C", text: "整理房间与清单", identityHint: "府邸主事" },
      { code: "D", text: "逛早市吃热汤", identityHint: "街巷食客" },
    ],
  },
  {
    id: "ancient-41-complex-rule",
    title: "遇到复杂规则时，你会？",
    options: [
      { code: "A", text: "先试再改", identityHint: "军令执行官" },
      { code: "B", text: "先读懂底层逻辑", identityHint: "典章学士" },
      { code: "C", text: "按流程逐步推进", identityHint: "内务总管" },
      { code: "D", text: "找最省力解法", identityHint: "机灵摊主" },
    ],
  },
  {
    id: "ancient-42-skill-upgrade",
    title: "你最想点亮哪项天赋？",
    options: [
      { code: "A", text: "以一敌十的压场力", identityHint: "沙场战将" },
      { code: "B", text: "一语惊人的表达力", identityHint: "文坛客卿" },
      { code: "C", text: "洞察人心的敏锐度", identityHint: "宫闱近侍" },
      { code: "D", text: "把日子过香的能力", identityHint: "市井生活家" },
    ],
  },
  {
    id: "ancient-43-marriage-pressure",
    title: "被长辈催婚时，你会？",
    options: [
      { code: "A", text: "先把事业立住", identityHint: "将门后生" },
      { code: "B", text: "讲缘分与精神共鸣", identityHint: "清雅公子" },
      { code: "C", text: "微笑听完按自己节奏", identityHint: "内府女官" },
      { code: "D", text: "先见一面也无妨", identityHint: "会来事掌柜" },
    ],
  },
  {
    id: "ancient-44-open-shop",
    title: "如果要开一家店，你选？",
    options: [
      { code: "A", text: "武馆镖局", identityHint: "镖局总镖头" },
      { code: "B", text: "书肆茶社", identityHint: "书画老板" },
      { code: "C", text: "药铺诊舍", identityHint: "医馆管事" },
      { code: "D", text: "小吃食肆", identityHint: "美食探店官" },
    ],
  },
  {
    id: "ancient-45-face-definition",
    title: "你对“体面”的理解是？",
    options: [
      { code: "A", text: "关键时刻扛得住", identityHint: "铁血都督" },
      { code: "B", text: "说话做事有分寸", identityHint: "翰林修撰" },
      { code: "C", text: "让身边人都安心", identityHint: "内堂掌事" },
      { code: "D", text: "赚钱养家不狼狈", identityHint: "市井实干家" },
    ],
  },
  {
    id: "ancient-46-old-things",
    title: "对待旧物你通常？",
    options: [
      { code: "A", text: "能用就修继续上", identityHint: "边城军匠" },
      { code: "B", text: "写下故事好好存", identityHint: "文墨收藏家" },
      { code: "C", text: "分类归档整齐放", identityHint: "内务管库" },
      { code: "D", text: "二手转卖变现", identityHint: "行商牙人" },
    ],
  },
  {
    id: "ancient-47-bad-mood",
    title: "当你状态很差时，你会？",
    options: [
      { code: "A", text: "去练武出汗", identityHint: "江湖刀客" },
      { code: "B", text: "去写字抄经", identityHint: "书院先生" },
      { code: "C", text: "独处整理情绪", identityHint: "影卫执事" },
      { code: "D", text: "吃顿好的回血", identityHint: "夜市掌勺" },
    ],
  },
  {
    id: "ancient-48-success-belief",
    title: "你更相信哪种成功？",
    options: [
      { code: "A", text: "拼硬实力赢下场面", identityHint: "军中主将" },
      { code: "B", text: "靠才华长期发光", identityHint: "才名学士" },
      { code: "C", text: "稳扎稳打慢慢积累", identityHint: "内廷管事" },
      { code: "D", text: "现金流稳定最重要", identityHint: "钱庄东家" },
    ],
  },
  {
    id: "ancient-49-time-travel-item",
    title: "如果穿越后只能带一件现代物品？",
    options: [
      { code: "A", text: "多功能刀具", identityHint: "荒野武者" },
      { code: "B", text: "电子书阅读器", identityHint: "风雅书生" },
      { code: "C", text: "急救包", identityHint: "贴身医侍" },
      { code: "D", text: "调味料套装", identityHint: "江湖厨客" },
    ],
  },
  {
    id: "ancient-50-memory-point",
    title: "你希望别人记住你的哪一点？",
    options: [
      { code: "A", text: "说到做到有担当", identityHint: "护城将领" },
      { code: "B", text: "风骨与才情兼具", identityHint: "文坛宗师" },
      { code: "C", text: "可靠温厚不失分寸", identityHint: "王府掌事" },
      { code: "D", text: "让日子有烟火气", identityHint: "市井福星" },
    ],
  },
];

/**
 * 导出古代身份题库。
 */
export const ANCIENT_IDENTITY_QUESTION_BANK = RAW_QUESTION_BANK.map((item) =>
  buildQuestion(item),
);
