/**
 * 2026 贵人星座测试题库（40题）：
 * 1. 题干聚焦日常场景，降低阅读负担。
 * 2. 通过“文案关键词 -> 向量预设”自动映射选项向量。
 * 3. 最终由分析器按多维匹配给出最契合的贵人星座。
 */

/**
 * 贵人星座维度向量预设：
 * 字段必须与 `benefactor2026Analyzer` 中维度定义完全一致。
 */
const VECTOR_PRESETS = {
  fire: {
    action: 10,
    social: 7,
    empathy: 5,
    reason: 5,
    stability: 3,
    exploration: 9,
    expression: 8,
    support: 4,
  },
  earth: {
    action: 5,
    social: 4,
    empathy: 6,
    reason: 9,
    stability: 10,
    exploration: 3,
    expression: 4,
    support: 8,
  },
  air: {
    action: 6,
    social: 10,
    empathy: 6,
    reason: 8,
    stability: 5,
    exploration: 8,
    expression: 9,
    support: 5,
  },
  warm: {
    action: 4,
    social: 7,
    empathy: 10,
    reason: 5,
    stability: 6,
    exploration: 4,
    expression: 7,
    support: 10,
  },
  strategic: {
    action: 7,
    social: 5,
    empathy: 4,
    reason: 10,
    stability: 8,
    exploration: 5,
    expression: 6,
    support: 6,
  },
  independent: {
    action: 8,
    social: 3,
    empathy: 4,
    reason: 7,
    stability: 7,
    exploration: 8,
    expression: 4,
    support: 3,
  },
  dreamer: {
    action: 5,
    social: 6,
    empathy: 8,
    reason: 4,
    stability: 4,
    exploration: 9,
    expression: 10,
    support: 6,
  },
  guardian: {
    action: 6,
    social: 6,
    empathy: 8,
    reason: 7,
    stability: 9,
    exploration: 4,
    expression: 5,
    support: 10,
  },
};

/**
 * 位次兜底映射：
 * 当选项文案未命中规则时，按 A/B/C/D 使用默认向量类型。
 */
const DEFAULT_VECTOR_TYPES = ["fire", "earth", "air", "warm"];

/**
 * 文案规则映射：
 * 关键逻辑：按优先级顺序命中首个规则并立即返回，避免多规则叠加导致向量失真。
 */
const TYPE_RULES = [
  {
    type: "strategic",
    pattern:
      /计划|清单|预算|复盘|步骤|方案|规则|流程|理性|优先级|备选|效率|先算|长期/, 
  },
  {
    type: "guardian",
    pattern:
      /兜底|负责|善后|照应|保底|托住|撑住|稳定局面|先确认|照顾全局|扛住/, 
  },
  {
    type: "warm",
    pattern:
      /安慰|先听|抱抱|陪着|情绪|温柔|治愈|慢慢来|安全感|共情|安抚|被理解/, 
  },
  {
    type: "air",
    pattern:
      /聊天|拉群|脑暴|分享|社交|热闹|表达|连接|讨论|互动|扩列|抛梗/, 
  },
  {
    type: "fire",
    pattern:
      /立刻|马上|直接|开干|冲|带头|挑战|刚正面|先上|快刀|硬刚|推进/, 
  },
  {
    type: "independent",
    pattern:
      /自己来|独处|先观察|先不说|先撤|随缘|一个人|晚点再说|不社交|保持距离/, 
  },
  {
    type: "dreamer",
    pattern:
      /想象|画面|灵感|浪漫|凭感觉|创作|故事|氛围|脑洞|做梦|艺术/, 
  },
  {
    type: "earth",
    pattern:
      /稳妥|按部就班|存起来|保守|耐心|踏实|慢节奏|固定|习惯|不冒险|先稳/, 
  },
];

/**
 * 深拷贝向量，避免对象引用被共享修改。
 * @param {string} type 向量类型。
 * @returns {object} 向量副本。
 */
function cloneVector(type) {
  return { ...VECTOR_PRESETS[type] };
}

/**
 * 解析选项文案对应的向量类型。
 * @param {string} label 选项文案。
 * @param {number} optionIndex 选项索引（0~3）。
 * @returns {string} 向量类型。
 */
function resolveVectorType(label, optionIndex) {
  const normalizedLabel = String(label ?? "");

  for (const ruleItem of TYPE_RULES) {
    if (ruleItem.pattern.test(normalizedLabel)) {
      return ruleItem.type;
    }
  }

  return DEFAULT_VECTOR_TYPES[optionIndex] ?? "earth";
}

/**
 * 构建单题对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {number} [params.weight=1.1] 题目权重。
 * @param {Array<string>} params.options 选项文案数组（固定 4 项）。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<object> }} 标准题目对象。
 */
function buildQuestion({ id, title, weight = 1.1, options }) {
  return {
    id,
    title,
    description: "按第一反应选择最像你的一项。",
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
 * 原始题库：
 * 仅维护题干与选项，向量交由规则自动映射。
 */
const RAW_QUESTION_BANK = [
  {
    id: "benefactor-2026-01-morning-message",
    title: "早上醒来看到 99+ 消息，你第一反应？",
    options: ["先回最重要的人，直接推进", "先分类处理，按优先级回复", "先在群里互动两句再说", "先放着，等心情稳定再回"],
  },
  {
    id: "benefactor-2026-02-temporary-task",
    title: "领导临时加任务，你通常会？",
    options: ["马上开干，边做边补细节", "先问清目标，再拆步骤", "拉同事脑暴一下再定", "先安抚团队情绪再分工"],
  },
  {
    id: "benefactor-2026-03-friend-late",
    title: "朋友连续迟到两次，你会？",
    options: ["直接说清规则，别再拖", "下次把时间提前 15 分钟", "边吐槽边笑着化解", "先问他最近是不是有难处"],
  },
  {
    id: "benefactor-2026-04-weekend-choice",
    title: "周末最想怎么过？",
    options: ["去没去过的地方挑战一下", "在家做整理和补觉", "约局聊天、逛街、吃饭", "追剧写点东西，沉浸在氛围里"],
  },
  {
    id: "benefactor-2026-05-conflict-scene",
    title: "遇到争执场面时你更像？",
    options: ["带头定调，先控局", "先听两边，再给方案", "边调侃边降温", "先安抚情绪，避免硬碰硬"],
  },
  {
    id: "benefactor-2026-06-shopping-cart",
    title: "购物车满了之后你会？",
    options: ["冲动下单，先买再说", "算预算，删到刚刚好", "发给朋友问哪个好看", "先收藏，慢慢等感觉"],
  },
  {
    id: "benefactor-2026-07-midnight-call",
    title: "半夜朋友打来电话说崩了，你会？",
    options: ["马上语音，直接给行动建议", "先问发生了什么，再拆问题", "拉上另一个朋友一起支援", "先听他讲完，陪他把情绪落地"],
  },
  {
    id: "benefactor-2026-08-presentation",
    title: "临时要你上台发言，你更可能？",
    options: ["上去就讲，气场先顶住", "先列 3 点提纲再讲", "现场互动，把大家带进来", "讲一个故事，慢慢带节奏"],
  },
  {
    id: "benefactor-2026-09-vacation-plan",
    title: "做旅行计划时你通常？",
    options: ["先看最刺激的项目", "先看交通和住宿是否稳妥", "先找会玩的朋友组队", "先看城市氛围和风景感"],
  },
  {
    id: "benefactor-2026-10-team-role",
    title: "在团队里你最常扮演？",
    options: ["推进者：把进度拉起来", "规划者：把流程搭完整", "连接者：把人和资源连起来", "守护者：负责托底和善后"],
  },
  {
    id: "benefactor-2026-11-failure-replay",
    title: "项目失手后你会先做什么？",
    options: ["立刻找下个突破口", "复盘原因，避免重复踩坑", "和同伴复盘并交换经验", "先消化情绪，再慢慢恢复"],
  },
  {
    id: "benefactor-2026-12-rainy-day",
    title: "下雨天突然堵车一小时，你会？",
    options: ["找替代路线，能走就走", "接受现实，安排可做的小事", "在群里开聊打发时间", "听歌放空，让自己慢下来"],
  },
  {
    id: "benefactor-2026-13-unknown-field",
    title: "面对陌生领域任务，你会？",
    options: ["先做一个最小尝试", "先查资料，搭建认知框架", "问圈内朋友，快速拿经验", "先靠感觉做方向判断"],
  },
  {
    id: "benefactor-2026-14-date-delay",
    title: "约会对象突然改时间，你会？",
    options: ["直接改，效率第一", "先确认双方都方便的时段", "顺势加点轻松聊天", "先关心对方是不是有状况"],
  },
  {
    id: "benefactor-2026-15-annual-goal",
    title: "写年度目标你更倾向？",
    options: ["写一个大的挑战清单", "写里程碑和执行步骤", "写想合作的人和资源", "写想成为什么样的自己"],
  },
  {
    id: "benefactor-2026-16-public-comment",
    title: "看到别人公开评价你，你会？",
    options: ["直接回应，讲明立场", "先判断是否有价值再回复", "用轻松表达化解尴尬", "先观察情绪，晚点再说"],
  },
  {
    id: "benefactor-2026-17-workbench",
    title: "你的桌面状态更像？",
    options: ["战场型，随手能拿到就行", "清单分区，规则很清楚", "贴满便签和灵感碎片", "暖色小物很多，氛围感拉满"],
  },
  {
    id: "benefactor-2026-18-cooperation-break",
    title: "合作对象突然掉线，你会？",
    options: ["自己补位，先把结果交出来", "重新排期，保底交付", "马上找替补资源", "先联系确认对方是否需要支持"],
  },
  {
    id: "benefactor-2026-19-reward-way",
    title: "完成一件大事后你会怎么奖励自己？",
    options: ["马上安排下一场刺激活动", "买一件实用且耐用的东西", "约朋友庆祝一下", "给自己留一段安静恢复时间"],
  },
  {
    id: "benefactor-2026-20-hard-choice",
    title: "两个机会都不错，你通常怎么选？",
    options: ["选更有挑战的那个", "选成功率更高的那个", "选资源协同更好的那个", "选内心更有感觉的那个"],
  },
  {
    id: "benefactor-2026-21-social-energy",
    title: "社交过载后你会怎么回血？",
    options: ["再运动一下，强行重启", "回家收拾环境，恢复秩序", "找熟人轻松聊几句", "独处+音乐，慢慢恢复"],
  },
  {
    id: "benefactor-2026-22-money-idea",
    title: "看到一个新赚钱点子，你会？",
    options: ["先小规模试一把", "先评估成本收益和风险", "先找懂的人聊可行性", "先想它是否符合长期愿景"],
  },
  {
    id: "benefactor-2026-23-friend-birthday",
    title: "朋友生日你更会送？",
    options: ["有冲击力的惊喜", "实用型、能长期用的礼物", "能一起玩的体验券", "走心手写卡+细节准备"],
  },
  {
    id: "benefactor-2026-24-learning-style",
    title: "学新技能时你更依赖？",
    options: ["直接上手，做中学", "教程+笔记+复盘", "找人结伴互相督促", "靠灵感和兴趣驱动"],
  },
  {
    id: "benefactor-2026-25-online-conflict",
    title: "看到评论区吵起来，你通常？",
    options: ["下场说重点，快速止损", "先看来龙去脉再发言", "抛个梗缓和氛围", "提醒大家先冷静"],
  },
  {
    id: "benefactor-2026-26-home-style",
    title: "你理想的居住氛围是？",
    options: ["功能齐全，行动效率高", "整洁有序，长期耐住", "常有朋友来，热闹通透", "温暖柔和，能安心放松"],
  },
  {
    id: "benefactor-2026-27-emergency",
    title: "突然断网但要交稿，你会？",
    options: ["热点开起来，先交了再说", "先本地整理，网络恢复再提交", "马上找同事借网络", "先稳住心态，避免慌乱"],
  },
  {
    id: "benefactor-2026-28-meeting-style",
    title: "开会时你更常做什么？",
    options: ["直接拍板关键点", "整理会议结论和下一步", "负责把大家意见串起来", "留意谁被忽略并补充照应"],
  },
  {
    id: "benefactor-2026-29-relation-repair",
    title: "关系有裂痕时你更可能？",
    options: ["当面聊开，快刀斩乱麻", "先写清楚问题和边界", "先找共同朋友缓和", "先表达理解，再谈问题"],
  },
  {
    id: "benefactor-2026-30-free-evening",
    title: "突然多出一个自由夜晚，你会？",
    options: ["去夜骑或夜跑，动起来", "整理账单和计划", "约人吃宵夜聊天", "看电影写点感受"],
  },
  {
    id: "benefactor-2026-31-feedback-receive",
    title: "收到尖锐反馈时你会？",
    options: ["先接住并立刻改", "先拆分有效信息再处理", "找信任的人对焦一下", "先稳定情绪再做决定"],
  },
  {
    id: "benefactor-2026-32-secret-keeping",
    title: "朋友告诉你秘密，你会？",
    options: ["守住，不外传", "判断边界，必要时提醒风险", "如果影响团队会建议沟通", "先给情绪支持，不逼问细节"],
  },
  {
    id: "benefactor-2026-33-busy-day",
    title: "忙到飞起的一天，你最怕什么？",
    options: ["节奏断掉，没法推进", "计划被打乱，流程失控", "没人协同，信息断层", "情绪被耗空，晚上失眠"],
  },
  {
    id: "benefactor-2026-34-opportunity-source",
    title: "你觉得机会最常从哪来？",
    options: ["敢冲敢试后的窗口", "长期积累带来的复利", "人脉连接后的转介绍", "直觉命中的关键选择"],
  },
  {
    id: "benefactor-2026-35-message-style",
    title: "你发消息最像哪种风格？",
    options: ["短句直接，立刻有结论", "结构清楚，条理分点", "表情包+梗，互动感强", "文字温柔，照顾对方感受"],
  },
  {
    id: "benefactor-2026-36-pressure-relief",
    title: "高压期结束后你第一件事？",
    options: ["安排下一轮挑战", "复盘并修正系统", "找人庆祝，释放压力", "给自己一晚彻底放空"],
  },
  {
    id: "benefactor-2026-37-new-circle",
    title: "进入新圈子时你会？",
    options: ["先展示能力，快速建立存在感", "先观察规则和关键角色", "主动认识人，建立连接", "先找一个舒服角落慢慢融入"],
  },
  {
    id: "benefactor-2026-38-difficult-friend",
    title: "朋友状态很差还嘴硬，你会？",
    options: ["直接点醒他，别拖", "先帮他列可执行小步骤", "拉他出来见人，别闷着", "先陪着他，等他愿意开口"],
  },
  {
    id: "benefactor-2026-39-ideal-partnering",
    title: "你最想要的合作伙伴是？",
    options: ["执行快、敢冲的人", "靠谱稳、能兜底的人", "会沟通、资源广的人", "懂你情绪、能支持的人"],
  },
  {
    id: "benefactor-2026-40-last-color",
    title: "凭感觉选个颜色？",
    weight: 1.25,
    options: ["热烈红", "沉稳棕", "灵动蓝", "治愈绿"],
  },
];

/**
 * 2026 贵人星座测试题库。
 */
export const BENEFACTOR_2026_QUESTION_BANK = RAW_QUESTION_BANK.map((item) =>
  buildQuestion(item),
);
