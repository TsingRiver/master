/**
 * 恋爱心理测试题库（50题）：
 * 1. 题目聚焦亲密关系中的日常互动场景。
 * 2. 每题 4 个选项分别映射安全/焦虑/回避/焦虑-回避矛盾倾向。
 * 3. 实际抽题数量由主题配置控制（本主题固定抽 15 题）。
 */

/**
 * 依恋类型向量预设：
 * 关键逻辑：主类型高分 + 关联类型次级分，避免结果过于绝对。
 */
const ATTACHMENT_VECTOR_PRESETS = {
  secure: {
    secure: 10,
    anxious: 2,
    avoidant: 1,
    fearful: 1,
  },
  anxious: {
    secure: 2,
    anxious: 10,
    avoidant: 2,
    fearful: 6,
  },
  avoidant: {
    secure: 2,
    anxious: 1,
    avoidant: 10,
    fearful: 4,
  },
  fearful: {
    secure: 1,
    anxious: 6,
    avoidant: 6,
    fearful: 10,
  },
};

/**
 * 深拷贝向量，避免对象引用共享。
 * @param {string} typeKey 类型键。
 * @returns {object} 向量副本。
 */
function cloneVector(typeKey) {
  return { ...(ATTACHMENT_VECTOR_PRESETS[typeKey] ?? ATTACHMENT_VECTOR_PRESETS.secure) };
}

/**
 * 构建单题对象。
 * @param {object} params 构建参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {Array<{ label: string, type: string }>} params.options 选项配置。
 * @param {number} [params.weight=1.12] 题目权重。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<object> }} 标准题目对象。
 */
function buildQuestion({ id, title, options, weight = 1.12 }) {
  return {
    id,
    title,
    description: "选最像你第一反应的一项。",
    weight,
    options: options.map((optionItem, optionIndex) => {
      const optionChar = String.fromCharCode(97 + optionIndex);

      return {
        id: `${id}-option-${optionChar}`,
        label: optionItem.label,
        vector: cloneVector(optionItem.type),
      };
    }),
  };
}

/**
 * 原始题库条目（50题）。
 */
const RAW_QUESTION_ITEMS = [
  {
    title: "对方半天没回你消息时，你更常见的反应是？",
    options: [
      { label: "先忙自己的事，晚点再沟通", type: "secure" },
      { label: "会反复点开聊天框确认是不是被忽略", type: "anxious" },
      { label: "干脆不发了，等他主动", type: "avoidant" },
      { label: "一边想靠近一边想拉黑，心里很拉扯", type: "fearful" },
    ],
  },
  {
    title: "吵架后你通常会怎么做？",
    options: [
      { label: "冷静后主动沟通，想把问题讲清楚", type: "secure" },
      { label: "会一直想对方是不是不爱我了", type: "anxious" },
      { label: "先沉默几天，不太想解释", type: "avoidant" },
      { label: "想和好又怕再受伤，反复纠结", type: "fearful" },
    ],
  },
  {
    title: "关系进入稳定期后，你更像？",
    options: [
      { label: "既亲密也保留彼此空间", type: "secure" },
      { label: "会更需要高频确认和陪伴", type: "anxious" },
      { label: "会下意识减少情感表达", type: "avoidant" },
      { label: "时近时远，自己也摸不准节奏", type: "fearful" },
    ],
  },
  {
    title: "当你需要安慰时，你会？",
    options: [
      { label: "直接说出我现在需要被听见", type: "secure" },
      { label: "试探对方在不在乎自己", type: "anxious" },
      { label: "不太想麻烦别人，自己扛", type: "avoidant" },
      { label: "想求助但怕被嫌弃，最后闭嘴", type: "fearful" },
    ],
  },
  {
    title: "恋人和异性朋友走得近时，你通常？",
    options: [
      { label: "先沟通边界，不做脑补", type: "secure" },
      { label: "会焦虑到反复追问细节", type: "anxious" },
      { label: "表面无所谓，实际会退后", type: "avoidant" },
      { label: "想查清楚又怕查到结果，情绪失控", type: "fearful" },
    ],
  },
  {
    title: "对方说“我今天想自己待会儿”时，你更可能？",
    options: [
      { label: "理解并约好晚点联系", type: "secure" },
      { label: "会担心是不是我做错了", type: "anxious" },
      { label: "正好，我也不太想一直黏着", type: "avoidant" },
      { label: "会突然很失落，又不敢问", type: "fearful" },
    ],
  },
  {
    title: "你在关系里表达需求的方式更像？",
    options: [
      { label: "直接且尊重地表达", type: "secure" },
      { label: "常用情绪表达来换回应", type: "anxious" },
      { label: "很少主动提需求", type: "avoidant" },
      { label: "想到就提、提完又后悔", type: "fearful" },
    ],
  },
  {
    title: "刚确认关系那阵子，你会？",
    options: [
      { label: "慢慢了解，稳定推进", type: "secure" },
      { label: "很快投入，怕错过", type: "anxious" },
      { label: "会保持距离，不想太快靠近", type: "avoidant" },
      { label: "前几天很热情，后面又想逃开", type: "fearful" },
    ],
  },
  {
    title: "当对方情绪不好时，你更像？",
    options: [
      { label: "先听对方，再一起找办法", type: "secure" },
      { label: "会担心自己做得不够，急着安抚", type: "anxious" },
      { label: "不太擅长处理情绪，想先回避", type: "avoidant" },
      { label: "想靠近但怕被推开，自己先乱了", type: "fearful" },
    ],
  },
  {
    title: "你如何看待“公开关系”这件事？",
    options: [
      { label: "双方舒服就好，不强求形式", type: "secure" },
      { label: "希望尽快公开，这样更有安全感", type: "anxious" },
      { label: "倾向低调，不太想公开", type: "avoidant" },
      { label: "想公开又怕被评价，摇摆不定", type: "fearful" },
    ],
  },
  {
    title: "遇到意见不合时，你更常怎么处理？",
    options: [
      { label: "先理解差异，再协商", type: "secure" },
      { label: "会担心对方因此离开", type: "anxious" },
      { label: "觉得麻烦，能不谈就不谈", type: "avoidant" },
      { label: "会突然激烈又突然沉默", type: "fearful" },
    ],
  },
  {
    title: "对方工作很忙时，你会？",
    options: [
      { label: "理解现实，约好固定沟通点", type: "secure" },
      { label: "会觉得自己被排在后面", type: "anxious" },
      { label: "刚好降低联系频率，轻松些", type: "avoidant" },
      { label: "又想体谅又积累委屈", type: "fearful" },
    ],
  },
  {
    title: "你在亲密关系里的“底线”通常？",
    options: [
      { label: "边界清晰，愿意提前沟通", type: "secure" },
      { label: "底线会随情绪波动", type: "anxious" },
      { label: "边界很高，不轻易让人靠近", type: "avoidant" },
      { label: "有底线但执行起来很矛盾", type: "fearful" },
    ],
  },
  {
    title: "被伴侣指出问题时，你第一反应是？",
    options: [
      { label: "先听完，再判断是否需要调整", type: "secure" },
      { label: "会敏感成“他是不是不喜欢我了”", type: "anxious" },
      { label: "会本能防御，不太想解释", type: "avoidant" },
      { label: "情绪上来很快，之后又自责", type: "fearful" },
    ],
  },
  {
    title: "你希望的聊天频率更接近？",
    options: [
      { label: "稳定沟通，不需要刷屏", type: "secure" },
      { label: "高频互动才安心", type: "anxious" },
      { label: "低频但有事再说", type: "avoidant" },
      { label: "忽冷忽热，看状态", type: "fearful" },
    ],
  },
  {
    title: "当你很喜欢一个人时，你会？",
    options: [
      { label: "真诚表达，同时观察匹配度", type: "secure" },
      { label: "容易投入很深，害怕失去", type: "anxious" },
      { label: "会先保持理智和距离", type: "avoidant" },
      { label: "特别上头后又突然抽离", type: "fearful" },
    ],
  },
  {
    title: "分歧出现时你更在意？",
    options: [
      { label: "问题是否被有效解决", type: "secure" },
      { label: "关系会不会因此变差", type: "anxious" },
      { label: "能不能尽快结束争执", type: "avoidant" },
      { label: "既怕冲突又怕被忽略", type: "fearful" },
    ],
  },
  {
    title: "你怎么看“查岗”这件事？",
    options: [
      { label: "必要信息同步即可，不控制", type: "secure" },
      { label: "会想知道对方在做什么才安心", type: "anxious" },
      { label: "很反感被追问行程", type: "avoidant" },
      { label: "自己也纠结要不要问", type: "fearful" },
    ],
  },
  {
    title: "伴侣想见你家人时，你更可能？",
    options: [
      { label: "看关系阶段，稳步推进", type: "secure" },
      { label: "会期待这代表“被认真对待”", type: "anxious" },
      { label: "会觉得太快，想拖一拖", type: "avoidant" },
      { label: "一边期待一边紧张想退", type: "fearful" },
    ],
  },
  {
    title: "如果当天约会被临时取消，你通常？",
    options: [
      { label: "先确认原因，再改约", type: "secure" },
      { label: "会很受伤，开始怀疑关系", type: "anxious" },
      { label: "表面说没事，内心更疏离", type: "avoidant" },
      { label: "想发火又怕关系更糟", type: "fearful" },
    ],
  },
  {
    title: "你在恋爱里的“安全感来源”更像？",
    options: [
      { label: "稳定沟通 + 真实行动", type: "secure" },
      { label: "对方持续高频回应", type: "anxious" },
      { label: "保有个人空间和自主", type: "avoidant" },
      { label: "既要亲密又怕太近", type: "fearful" },
    ],
  },
  {
    title: "亲密关系中你最怕的是？",
    options: [
      { label: "长期不沟通导致误解", type: "secure" },
      { label: "被忽略或被抛下", type: "anxious" },
      { label: "被过度绑定失去自由", type: "avoidant" },
      { label: "越靠近越容易受伤", type: "fearful" },
    ],
  },
  {
    title: "你表达爱意的方式更偏向？",
    options: [
      { label: "稳定陪伴和尊重边界", type: "secure" },
      { label: "高频表达和情感确认", type: "anxious" },
      { label: "实际行动多于情绪表达", type: "avoidant" },
      { label: "热烈又不稳定", type: "fearful" },
    ],
  },
  {
    title: "对方说“我们需要聊聊”时，你第一感受是？",
    options: [
      { label: "好，聊清楚会更好", type: "secure" },
      { label: "瞬间紧张，怕被否定", type: "anxious" },
      { label: "本能想回避这次谈话", type: "avoidant" },
      { label: "既想知道又怕听到答案", type: "fearful" },
    ],
  },
  {
    title: "你会如何处理“旧问题反复发生”？",
    options: [
      { label: "复盘触发点，重新约定", type: "secure" },
      { label: "会越来越不安，情绪升级", type: "anxious" },
      { label: "会慢慢失去沟通意愿", type: "avoidant" },
      { label: "时而爆发时而自我封闭", type: "fearful" },
    ],
  },
  {
    title: "在关系里你更容易“想太多”关于？",
    options: [
      { label: "关系是否持续对双方都健康", type: "secure" },
      { label: "对方一句话是不是不爱我", type: "anxious" },
      { label: "这段关系会不会让我失去自己", type: "avoidant" },
      { label: "我到底该靠近还是退出", type: "fearful" },
    ],
  },
  {
    title: "你希望另一半如何支持你？",
    options: [
      { label: "理解我并和我一起解决问题", type: "secure" },
      { label: "多给我确定感和回应", type: "anxious" },
      { label: "尊重我的空间和节奏", type: "avoidant" },
      { label: "别突然靠近又突然冷掉", type: "fearful" },
    ],
  },
  {
    title: "争执时你更可能说出哪句话？",
    options: [
      { label: "我们先把彼此需求讲清楚", type: "secure" },
      { label: "你是不是根本不在乎我", type: "anxious" },
      { label: "算了，不想再说了", type: "avoidant" },
      { label: "你别靠近我…又别离开我", type: "fearful" },
    ],
  },
  {
    title: "异地恋场景下你更容易？",
    options: [
      { label: "建立固定联系节奏", type: "secure" },
      { label: "会不断确认关系状态", type: "anxious" },
      { label: "减少期待，降低投入", type: "avoidant" },
      { label: "忽然很黏，忽然很冷", type: "fearful" },
    ],
  },
  {
    title: "你看待“依赖”这件事更像？",
    options: [
      { label: "适度依赖是亲密的一部分", type: "secure" },
      { label: "很需要对方，怕失去支点", type: "anxious" },
      { label: "尽量不依赖任何人", type: "avoidant" },
      { label: "想依赖却害怕被控制", type: "fearful" },
    ],
  },
  {
    title: "如果伴侣提出“先冷静一晚”，你会？",
    options: [
      { label: "接受并约定明天沟通", type: "secure" },
      { label: "会整晚焦虑，反复猜测", type: "anxious" },
      { label: "会觉得挺好，先各自消化", type: "avoidant" },
      { label: "会陷入“他要走了”的恐慌", type: "fearful" },
    ],
  },
  {
    title: "你更擅长哪种亲密表达？",
    options: [
      { label: "稳定、持续、可被感知", type: "secure" },
      { label: "热烈、频繁、需要回应", type: "anxious" },
      { label: "克制、理性、重行动", type: "avoidant" },
      { label: "起伏大、受情绪影响", type: "fearful" },
    ],
  },
  {
    title: "你在关系里做重大决定前通常？",
    options: [
      { label: "先沟通，再共同决定", type: "secure" },
      { label: "会更关注对方会不会离开", type: "anxious" },
      { label: "倾向自己做决定，不想被干预", type: "avoidant" },
      { label: "反复犹豫，很难稳定下来", type: "fearful" },
    ],
  },
  {
    title: "你对“被看见脆弱”这件事的感受是？",
    options: [
      { label: "能表达脆弱，也能接住彼此", type: "secure" },
      { label: "很想被看见，但怕不被接住", type: "anxious" },
      { label: "不太习惯暴露脆弱", type: "avoidant" },
      { label: "渴望被看见又害怕被利用", type: "fearful" },
    ],
  },
  {
    title: "关系变得平淡时你更可能？",
    options: [
      { label: "主动制造连接和新体验", type: "secure" },
      { label: "会怀疑对方是不是变心", type: "anxious" },
      { label: "觉得平淡挺好，不必太黏", type: "avoidant" },
      { label: "想靠近但提不起安全感", type: "fearful" },
    ],
  },
  {
    title: "你在恋爱中最常被触发的点是？",
    options: [
      { label: "长期回避沟通", type: "secure" },
      { label: "回应变少或忽冷忽热", type: "anxious" },
      { label: "被要求随时汇报", type: "avoidant" },
      { label: "关系推进太快或太慢都不安", type: "fearful" },
    ],
  },
  {
    title: "对方忘记纪念日时，你会？",
    options: [
      { label: "说出感受并约好改进", type: "secure" },
      { label: "会很受伤，觉得不被重视", type: "anxious" },
      { label: "表面无所谓，心里记账", type: "avoidant" },
      { label: "又委屈又不敢直接表达", type: "fearful" },
    ],
  },
  {
    title: "恋人说“最近压力大不太想说话”时，你倾向？",
    options: [
      { label: "理解并保持温和连接", type: "secure" },
      { label: "担心关系降温，想立刻确认", type: "anxious" },
      { label: "那就各忙各的，少打扰", type: "avoidant" },
      { label: "想关心又怕被拒绝", type: "fearful" },
    ],
  },
  {
    title: "你更认可哪种“亲密节奏”？",
    options: [
      { label: "稳定推进，边了解边承诺", type: "secure" },
      { label: "尽快确认关系，越快越安心", type: "anxious" },
      { label: "慢一点，先保持独立", type: "avoidant" },
      { label: "时快时慢，很难拿捏", type: "fearful" },
    ],
  },
  {
    title: "当关系出现不确定时，你更会？",
    options: [
      { label: "主动沟通并核对事实", type: "secure" },
      { label: "靠想象放大最坏结果", type: "anxious" },
      { label: "降低投入，保护自己", type: "avoidant" },
      { label: "拉扯反复，情绪很耗", type: "fearful" },
    ],
  },
  {
    title: "你在关系里的“修复能力”更像？",
    options: [
      { label: "能复盘、能道歉、能调整", type: "secure" },
      { label: "情绪上来后很难收住", type: "anxious" },
      { label: "常用距离来代替修复", type: "avoidant" },
      { label: "想修复却害怕再受伤", type: "fearful" },
    ],
  },
  {
    title: "你希望关系中的“自由”是？",
    options: [
      { label: "有边界也有连接", type: "secure" },
      { label: "自由可以少一点，别离我太远", type: "anxious" },
      { label: "自由必须很多，不能被束缚", type: "avoidant" },
      { label: "怕被束缚也怕被放弃", type: "fearful" },
    ],
  },
  {
    title: "你对“长久关系”的直觉更像？",
    options: [
      { label: "可以通过磨合慢慢变好", type: "secure" },
      { label: "总担心自己不够好留不住人", type: "anxious" },
      { label: "长久往往意味着压力和牺牲", type: "avoidant" },
      { label: "很想要但又觉得不现实", type: "fearful" },
    ],
  },
  {
    title: "伴侣翻看你手机时，你会？",
    options: [
      { label: "说明不舒服点，重建信任", type: "secure" },
      { label: "会觉得他是不是也不信任我", type: "anxious" },
      { label: "强烈反感，想立刻拉开距离", type: "avoidant" },
      { label: "心里震荡但不知怎么处理", type: "fearful" },
    ],
  },
  {
    title: "你在恋爱里最容易忽略的是？",
    options: [
      { label: "偶尔会忽略自己的感受", type: "secure" },
      { label: "容易忽略自我边界", type: "anxious" },
      { label: "容易忽略对方情绪", type: "avoidant" },
      { label: "容易忽略关系稳定节奏", type: "fearful" },
    ],
  },
  {
    title: "关系冲突时你更常用哪种方式降温？",
    options: [
      { label: "先暂停，再回到问题", type: "secure" },
      { label: "通过确认“你还爱我吗”降温", type: "anxious" },
      { label: "先撤离现场，过后再说", type: "avoidant" },
      { label: "先激烈表达再后悔", type: "fearful" },
    ],
  },
  {
    title: "如果伴侣忘记回复你“晚安”，你会？",
    options: [
      { label: "可能太累了，明天再聊", type: "secure" },
      { label: "会想很多，睡前反复确认", type: "anxious" },
      { label: "无所谓，我也不会补发", type: "avoidant" },
      { label: "会难受但又不想表现出来", type: "fearful" },
    ],
  },
  {
    title: "你更接近哪种“亲密冲突反应”？",
    options: [
      { label: "先理解对方，再表达自己", type: "secure" },
      { label: "先表达不安，希望被安抚", type: "anxious" },
      { label: "先切断连接，保留空间", type: "avoidant" },
      { label: "先靠近后退缩，来回拉扯", type: "fearful" },
    ],
  },
  {
    title: "在关系中你最想被满足的是？",
    options: [
      { label: "稳定信任和共同成长", type: "secure" },
      { label: "持续回应和情感确认", type: "anxious" },
      { label: "空间自主和不过度介入", type: "avoidant" },
      { label: "既被理解又不被伤害", type: "fearful" },
    ],
  },
  {
    title: "最后一题：你理想中的亲密关系更像？",
    weight: 1.28,
    options: [
      { label: "彼此稳定、坦诚、可修复", type: "secure" },
      { label: "高浓度陪伴、持续确认", type: "anxious" },
      { label: "独立并行、不过度捆绑", type: "avoidant" },
      { label: "很深很真，但别让我太受伤", type: "fearful" },
    ],
  },
];

/**
 * 恋爱心理测试题库。
 */
export const LOVE_ATTACHMENT_QUESTION_BANK = RAW_QUESTION_ITEMS.map((item, index) => {
  const questionId = `love-attachment-q-${String(index + 1).padStart(3, "0")}`;
  return buildQuestion({
    id: questionId,
    title: item.title,
    options: item.options,
    weight: item.weight,
  });
});
