/**
 * 脑袋放气站版本号：用于区分题库和结果快照，旧缓存不会被错误复用。
 */
export const PRESSURE_RELIEF_VERSION = "1.2";

/**
 * 脑袋放气站的 12 道固定题目。
 * 前六题只记录小动作偏好；后六题才参与当下状态的趣味分数计算。
 */
export const PRESSURE_RELIEF_QUESTIONS = Object.freeze([
  {
    id: "q1",
    title: "方便面，危！",
    prompt: "自己买的方便面还没拆，你会想捏两下吗？",
    preferenceKey: "tactile",
    options: [
      { id: "A", label: "想，咔嚓一下很满足", preferenceScore: 1 },
      { id: "B", label: "偶尔，手闲着就想捏", preferenceScore: 0.5 },
      { id: "C", label: "不会，我只想煮着吃", preferenceScore: 0 },
    ],
  },
  {
    id: "q2",
    title: "手指又跑过去了",
    prompt: "等人或想事情时，会不自觉啃手指、抠指甲吗？",
    preferenceKey: "hand",
    options: [
      { id: "A", label: "会，反应过来才发现", preferenceScore: 1 },
      { id: "B", label: "偶尔会，没太注意", preferenceScore: 0.5 },
      { id: "C", label: "基本不会", preferenceScore: 0 },
    ],
  },
  {
    id: "q3",
    title: "这触感，有点想试",
    prompt: "看到自家米桶里的米，会想把手埋进去吗？",
    preferenceKey: "tactile",
    options: [
      { id: "A", label: "光想想就觉得舒服", preferenceScore: 1 },
      { id: "B", label: "有一点，但不一定动手", preferenceScore: 0.5 },
      { id: "C", label: "没兴趣，留着煮饭吧", preferenceScore: 0 },
    ],
  },
  {
    id: "q4",
    title: "快递里的隐藏赠品",
    prompt: "拆出一张气泡膜，你会顺手捏几颗吗？",
    preferenceKey: "tactile",
    options: [
      { id: "A", label: "会，捏起来停不下手", preferenceScore: 1 },
      { id: "B", label: "看心情，偶尔捏两颗", preferenceScore: 0.5 },
      { id: "C", label: "不会，直接收拾掉", preferenceScore: 0 },
    ],
  },
  {
    id: "q5",
    title: "这支笔有点忙",
    prompt: "想事情时，会下意识转笔或摆弄笔帽吗？",
    preferenceKey: "hand",
    options: [
      { id: "A", label: "会，手上总要有点事", preferenceScore: 1 },
      { id: "B", label: "偶尔会", preferenceScore: 0.5 },
      { id: "C", label: "基本不会", preferenceScore: 0 },
    ],
  },
  {
    id: "q6",
    title: "衣角被你发现了",
    prompt: "发呆时，会无意识搓衣角或摸袖口吗？",
    preferenceKey: "hand",
    options: [
      { id: "A", label: "会，手下意识就过去了", preferenceScore: 1 },
      { id: "B", label: "偶尔会摸两下", preferenceScore: 0.5 },
      { id: "C", label: "好像没有这个习惯", preferenceScore: 0 },
    ],
  },
  {
    id: "q7",
    title: "脑袋里的待办",
    prompt: "事情暂时放下后，你的脑袋还在想待办吗？",
    timeNote: "接下来，想想最近 7 天",
    options: [
      { id: "A", label: "直接躺平，啥也不想", stateScore: 0 },
      { id: "B", label: "偶尔想起，但是很快会放松", stateScore: 1 },
      { id: "C", label: "脑子里一直在想", stateScore: 2 },
    ],
  },
  {
    id: "q8",
    title: "一点小插曲",
    prompt: "等电梯、排队这类小事，会让你烦躁吗？",
    timeNote: "最近 7 天",
    options: [
      { id: "A", label: "大多没什么感觉", stateScore: 0 },
      { id: "B", label: "有时会，过会儿就好", stateScore: 1 },
      { id: "C", label: "经常会，很想赶紧结束", stateScore: 2 },
    ],
  },
  {
    id: "q9",
    title: "给今天按暂停",
    prompt: "终于有空休息，你能真正放松下来吗？",
    timeNote: "最近 7 天",
    options: [
      { id: "A", label: "大多能，休息挺舒服", stateScore: 0 },
      { id: "B", label: "要缓一阵，才能松下来", stateScore: 1 },
      { id: "C", label: "不太能，闲着也紧绷", stateScore: 2 },
    ],
  },
  {
    id: "q10",
    title: "消息又亮了",
    prompt: "手头正忙，又来一条待处理消息，你会？",
    timeNote: "最近 7 天",
    options: [
      { id: "A", label: "大多能按顺序处理", stateScore: 0 },
      { id: "B", label: "有点烦，但是还顾得过来", stateScore: 1 },
      { id: "C", label: "我要炸了！", stateScore: 2 },
    ],
  },
  {
    id: "q11",
    title: "临时加点事",
    prompt: "计划外多了一件小事，你通常觉得？",
    timeNote: "最近 7 天",
    options: [
      { id: "A", label: "还好，调整一下就行", stateScore: 0 },
      { id: "B", label: "虽然...但是还能应付得过来", stateScore: 1 },
      { id: "C", label: "按计划，其他的加不了一点", stateScore: 2 },
    ],
  },
  {
    id: "q12",
    title: "今天的心情余额",
    prompt: "一天结束，你还有精力做自己想做的事情吗？",
    timeNote: "最近 7 天",
    options: [
      { id: "A", label: "大多有，能做点喜欢的事", stateScore: 0 },
      { id: "B", label: "有时有，看当天状态", stateScore: 1 },
      { id: "C", label: "只想躺平，啥也不干", stateScore: 2 },
    ],
  },
]);

/**
 * 四种结果状态的文案池与图片映射。
 * 文案池 ID 用于保存快照，避免页面重绘、刷新或导出时重新抽取。
 */
export const PRESSURE_RELIEF_RESULTS = Object.freeze({
  cloud: {
    title: "云朵小气团",
    subtitle: "最近，还留得住松弛感",
    quote: "今天的松弛，不用拿效率来换。",
    color: "#8DAF81",
    heroImage: "/pressure-relief/result-cloud.webp",
    heroAlt: "轻轻漂在软垫上的云朵小气团",
    adviceImage: "/pressure-relief/advice-rest.webp",
    interpretations: [
      { id: "cloud-i01", text: "哇噻！看来你最近还挺松弛的嘛，脑袋里有风吹得动的空当。" },
      { id: "cloud-i02", text: "事情来一下也不至于把你卷走，你知道什么时候该先放一放。" },
      { id: "cloud-i03", text: "你现在的节奏像晒过太阳的被子，软乎乎的，还留得住自己的小角落。" },
      { id: "cloud-i04", text: "偶尔发个呆、摸个鱼，对你来说不是偷懒，是给电量充充电。" },
      { id: "cloud-i05", text: "你不需要为了证明自己努力，把每一点空闲都填满。能留一点余地，也是不错的日常节奏。" },
      { id: "cloud-i06", text: "这段时间不妨继续把这份松弛护住，别急着给每一分钟都安排任务。" },
    ],
    tips: [
      { id: "cloud-t01", text: "今天留几分钟，做一件不需要有成果的小事，比如看窗外发会儿呆。" },
      { id: "cloud-t02", text: "听一首喜欢的歌，先不顺手打开其他页面。" },
      { id: "cloud-t03", text: "把今天一个舒服的小瞬间记进备忘录，一句话就够。" },
      { id: "cloud-t04", text: "给自己留一小段空白时间，先不安排用途。" },
      { id: "cloud-t05", text: "如果方便，到窗边看看远处，换一下眼前的风景。" },
      { id: "cloud-t06", text: "挑一个手边的小角落简单收拾，不用顺带整理整个房间。" },
      { id: "cloud-t07", text: "给喜欢的人发个有趣的表情，也可以只是自己偷着乐。" },
      { id: "cloud-t08", text: "今晚挑一件纯粹因为喜欢的小事，给它留个位置。" },
    ],
  },
  bubble: {
    title: "冒泡小气团",
    subtitle: "有点挂心，也还能缓一缓",
    quote: "事情可以一件件来，你不用一直在线。",
    color: "#E1A94D",
    heroImage: "/pressure-relief/result-bubble.webp",
    heroAlt: "头顶有小泡泡的冒泡小气团",
    adviceImage: "/pressure-relief/advice-rest.webp",
    interpretations: [
      { id: "bubble-i01", text: "哎呀呀，你最近好像有点小紧绷哦，脑袋里时不时会冒出几个待办小泡泡。" },
      { id: "bubble-i02", text: "还好，这些小泡泡暂时没占满你的脑袋，找个空档戳破几个就好。" },
      { id: "bubble-i03", text: "也许是消息多了点、事情挤了点，总之你最近的心情有点想喘口气。" },
      { id: "bubble-i04", text: "不用等所有事情都排队站好，先把眼前这一件慢慢处理就很棒。" },
      { id: "bubble-i05", text: "给自己留个短暂停顿吧，喝口水、看会儿窗外，都能让小泡泡散一散。" },
      { id: "bubble-i06", text: "你不是没力气，只是最近需要一点缓冲，慢半拍也没关系。" },
    ],
    tips: [
      { id: "bubble-t01", text: "把挂心的事写下来，只圈出一件今天需要处理的。" },
      { id: "bubble-t02", text: "如果条件允许，给自己五分钟不用回复消息的时间。" },
      { id: "bubble-t03", text: "手边任务做到一个小节点后，先停一下再接下一件。" },
      { id: "bubble-t04", text: "找张纸随手画几条线，不需要画得像什么。" },
      { id: "bubble-t05", text: "给一件不紧急的小事约个稍后的时间，不必一直记着它。" },
      { id: "bubble-t06", text: "如果坐得有点久，方便时起身走两步，换个位置。" },
      { id: "bubble-t07", text: "问问自己现在最想少做哪一件事，看看能不能真的少做一点。" },
      { id: "bubble-t08", text: "选一首熟悉的歌当短暂停顿，让这几分钟不用服务于效率。" },
    ],
  },
  balloon: {
    title: "绷绷小气团",
    subtitle: "最近，好像不太容易松下来",
    quote: "不必等全部做完，才轮到你休息。",
    color: "#DD8C55",
    heroImage: "/pressure-relief/result-balloon.webp",
    heroAlt: "抱着靠枕的绷绷小气团",
    adviceImage: "/pressure-relief/advice-space.webp",
    interpretations: [
      { id: "balloon-i01", text: "嗯哼，你最近的气团有点绷起来啦，手里的事情好像一件接一件。" },
      { id: "balloon-i02", text: "你可能已经习惯一边赶路一边处理很多事，难怪脑袋不太容易彻底关机。" },
      { id: "balloon-i03", text: "先别催自己马上恢复满格，能把今天过得顺一点，就已经很好了。" },
      { id: "balloon-i04", text: "有些事情晚一点做，地球也不会停止转，先给自己挪出一点位置。" },
      { id: "balloon-i05", text: "现在适合把待办剪小一点，一次只拿起一件，剩下的先放桌上。" },
      { id: "balloon-i06", text: "这两天可以稍微偏心自己一点，把休息也算进正经安排。" },
    ],
    tips: [
      { id: "balloon-t01", text: "从待办里选一件能延后的事，给它重新安排时间。" },
      { id: "balloon-t02", text: "找个信任的人说一句：我最近有点绷，想找你聊两句。" },
      { id: "balloon-t03", text: "把眼前任务缩成一个很小的下一步，先只看这一步。" },
      { id: "balloon-t04", text: "如果可以，关掉一类不必要的提醒，让注意力少被拉走一点。" },
      { id: "balloon-t05", text: "给自己留十分钟，不安排学习、工作或自我提升。" },
      { id: "balloon-t06", text: "遇到新请求时，先确认是否真的需要今天完成。" },
      { id: "balloon-t07", text: "写下现在能处理和暂时处理不了的事，后者先不要求自己解决。" },
      { id: "balloon-t08", text: "找个坐着舒服的位置，靠一会儿，不必同时想出什么答案。" },
    ],
  },
  steam: {
    title: "待放气小气团",
    subtitle: "今天，想给脑袋留点空隙",
    quote: "现在慢一点，也可以。",
    color: "#D87868",
    heroImage: "/pressure-relief/result-steam.webp",
    heroAlt: "靠在软垫上休息的待放气小气团",
    adviceImage: "/pressure-relief/advice-space.webp",
    interpretations: [
      { id: "steam-i01", text: "辛苦啦，你最近的脑袋像塞了好多东西的背包，已经有点沉甸甸的。" },
      { id: "steam-i02", text: "现在最适合做的不是再咬牙冲一段，而是先把背包放下来一会儿。" },
      { id: "steam-i03", text: "不用急着把所有消息和待办清零，挑一件最要紧的处理就够了。" },
      { id: "steam-i04", text: "如果有人愿意搭把手，不妨把一件具体的小事分出去，让自己轻一点。" },
      { id: "steam-i05", text: "今天可以允许自己少完成一点、慢一点，留点空隙给吃饭、发呆和好好睡觉。" },
      { id: "steam-i06", text: "先照顾好眼前的自己吧，等气顺一点了，再慢慢安排后面的事。" },
    ],
    tips: [
      { id: "steam-t01", text: "给接下来十分钟只留一件事，其他能等的先等一下。" },
      { id: "steam-t02", text: "想想谁能帮你分担一件具体小事，试着把请求说得明确一点。" },
      { id: "steam-t03", text: "如果愿意，告诉信任的人：我今天余力不多，想有人陪我一会儿。" },
      { id: "steam-t04", text: "从今天的安排里撤掉一个非必要项目，不用拿另一个任务补上。" },
      { id: "steam-t05", text: "暂时离开不断刷新的信息流，给自己一小段安静时间。" },
      { id: "steam-t06", text: "允许一件不重要的事做到够用，不继续追着它修改。" },
      { id: "steam-t07", text: "如果方便，挪到一个让自己更舒服的地方，先安顿一下。" },
      { id: "steam-t08", text: "把今天必须全部解决改成先处理真正紧急的，其余另找时间安排。" },
    ],
  },
});

/**
 * 小动作偏好结果：它只描述互动偏好，不解释动作原因或人格。
 */
export const PRESSURE_RELIEF_PREFERENCES = Object.freeze({
  tactile: {
    label: "触感快乐派",
    description: "你对捏一捏、摸一摸这类触感比较有兴趣。小小的手感，也能成为日常乐趣。",
  },
  hand: {
    label: "手指忙碌派",
    description: "你的手偶尔会自己忙起来，等人、想事情时尤其容易被你注意到。",
  },
  mixed: {
    label: "手部小动作派",
    description: "你既喜欢有反馈的触感，也会有些不自觉的小动作，手上很有自己的节奏。",
  },
  plain: {
    label: "小动作随缘派",
    description: "这些动作对你吸引力不大。没有同款小动作，也不代表你一定没有压力。",
  },
});

/**
 * 返回当前结果配置。
 * @param {string} resultId 状态结果 ID。
 * @returns {object} 对应的结果配置。
 */
export function getPressureReliefResult(resultId) {
  return PRESSURE_RELIEF_RESULTS[resultId] ?? PRESSURE_RELIEF_RESULTS.cloud;
}

/**
 * 返回当前小动作偏好配置。
 * @param {string} preferenceId 偏好结果 ID。
 * @returns {object} 对应的偏好配置。
 */
export function getPressureReliefPreference(preferenceId) {
  return PRESSURE_RELIEF_PREFERENCES[preferenceId] ?? PRESSURE_RELIEF_PREFERENCES.plain;
}
