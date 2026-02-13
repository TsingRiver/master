/**
 * 2026 转运关键词测试题库：
 * 1. 题目采用日常场景提问，降低“被测试感”。
 * 2. 通过 option.vector 映射到隐含人格/行动维度，供后续关键词计算。
 */
export const FORTUNE_2026_QUESTION_BANK = [
  {
    id: "morning-state",
    title: "工作日出门前的 20 分钟，你通常怎么用？",
    description: "这个细节能看出你面对新一年时的行动基调。",
    weight: 1.15,
    options: [
      {
        id: "morning-plan",
        label: "写下当天三件最重要的事，按优先级推进",
        vector: { discipline: 9, execution: 9, clarity: 8 },
      },
      {
        id: "morning-news",
        label: "快速刷行业资讯，判断今天有没有新机会",
        vector: { vision: 9, opportunitySense: 8, execution: 6 },
      },
      {
        id: "morning-social",
        label: "回消息和联系关键人，先把关系盘活",
        vector: { network: 9, expression: 8, opportunitySense: 7 },
      },
      {
        id: "morning-calm",
        label: "留一点安静时间，整理情绪再出门",
        vector: { recovery: 9, emotionalStability: 8, clarity: 7 },
      },
    ],
  },
  {
    id: "new-chance",
    title: "突然出现一个新机会（合作/项目/兼职），你第一反应是？",
    description: "第一反应往往比理性分析更接近你的真实“运势抓取方式”。",
    weight: 1.3,
    options: [
      {
        id: "chance-action",
        label: "先做一个可执行的最小动作，边做边看反馈",
        vector: { execution: 9, courage: 8, opportunitySense: 7 },
      },
      {
        id: "chance-analysis",
        label: "先评估投入产出，宁可慢一点也要判断准确",
        vector: { clarity: 9, discipline: 8, riskControl: 9 },
      },
      {
        id: "chance-consult",
        label: "先问两位信任的人，听完再做决定",
        vector: { network: 8, riskControl: 7, emotionalStability: 7 },
      },
      {
        id: "chance-feel",
        label: "看状态和直觉，如果没感觉就先不接",
        vector: { recovery: 8, emotionalStability: 8, courage: 5 },
      },
    ],
  },
  {
    id: "weekend",
    title: "周末一整天可以自由安排，你最可能把时间投向哪里？",
    description: "周末资源分配会暴露你的长期“转运杠杆”。",
    weight: 1.2,
    options: [
      {
        id: "weekend-upskill",
        label: "学习新技能/系统复盘，给自己升级",
        vector: { growth: 10, discipline: 8, clarity: 7 },
      },
      {
        id: "weekend-side",
        label: "做副业或个人项目，把想法变成实际结果",
        vector: { execution: 9, opportunitySense: 8, courage: 8 },
      },
      {
        id: "weekend-network",
        label: "参加线下活动/见朋友，扩展圈层",
        vector: { network: 10, expression: 8, vision: 7 },
      },
      {
        id: "weekend-heal",
        label: "运动、休息、户外散步，恢复身心电量",
        vector: { recovery: 10, emotionalStability: 9, growth: 6 },
      },
    ],
  },
  {
    id: "work-block",
    title: "当你某件事推进不动时，最常见的卡点是？",
    description: "识别卡点，能定位 2026 年最该优先强化的关键词方向。",
    weight: 1.35,
    options: [
      {
        id: "block-focus",
        label: "事情太多、注意力分散，容易被打断",
        vector: { discipline: 4, clarity: 5, execution: 5 },
      },
      {
        id: "block-start",
        label: "前期犹豫太久，启动成本过高",
        vector: { courage: 4, execution: 4, riskControl: 8 },
      },
      {
        id: "block-resource",
        label: "缺资源或缺人脉，自己单打独斗太累",
        vector: { network: 4, opportunitySense: 5, expression: 5 },
      },
      {
        id: "block-energy",
        label: "精力起伏大，状态不稳影响连续性",
        vector: { recovery: 4, emotionalStability: 4, discipline: 5 },
      },
    ],
  },
  {
    id: "social-conflict",
    title: "和人出现分歧时，你更倾向于怎么处理？",
    description: "关系处理方式会影响你在关键节点的“贵人运”与“合作运”。",
    weight: 1.1,
    options: [
      {
        id: "conflict-direct",
        label: "直接沟通，尽快把问题说开",
        vector: { expression: 9, courage: 8, clarity: 7 },
      },
      {
        id: "conflict-structure",
        label: "先整理事实和证据，再给出明确方案",
        vector: { clarity: 9, riskControl: 8, discipline: 8 },
      },
      {
        id: "conflict-mediation",
        label: "找中立的人协助，减少正面冲突",
        vector: { network: 8, emotionalStability: 7, expression: 6 },
      },
      {
        id: "conflict-delay",
        label: "先冷处理，等彼此情绪过去再谈",
        vector: { emotionalStability: 8, recovery: 7, courage: 4 },
      },
    ],
  },
  {
    id: "money-think",
    title: "面对“收入提升”这件事，你更像哪种状态？",
    description: "财富增长方式通常直接决定一年中的转运节奏。",
    weight: 1.25,
    options: [
      {
        id: "money-main",
        label: "先把主业做深做强，争取更高议价",
        vector: { discipline: 8, growth: 8, execution: 7 },
      },
      {
        id: "money-multi",
        label: "主动尝试多元收入，寻找第二增长曲线",
        vector: { opportunitySense: 9, courage: 8, vision: 8 },
      },
      {
        id: "money-safe",
        label: "更重视稳健和安全感，不想承受大波动",
        vector: { riskControl: 10, emotionalStability: 8, recovery: 7 },
      },
      {
        id: "money-partner",
        label: "倾向找靠谱伙伴协作做增量",
        vector: { network: 9, expression: 7, opportunitySense: 7 },
      },
    ],
  },
  {
    id: "night-routine",
    title: "睡前你最常做的动作是？",
    description: "夜间习惯是第二天状态与长期势能的关键输入。",
    weight: 1.05,
    options: [
      {
        id: "night-review",
        label: "复盘今天，记录得失，给明天定重点",
        vector: { clarity: 9, discipline: 8, growth: 8 },
      },
      {
        id: "night-connect",
        label: "维护关系、回复重要信息，不让机会断线",
        vector: { network: 8, expression: 8, opportunitySense: 7 },
      },
      {
        id: "night-content",
        label: "看内容找灵感，激发新想法",
        vector: { vision: 9, growth: 7, execution: 5 },
      },
      {
        id: "night-offline",
        label: "尽量断网早睡，把恢复放第一位",
        vector: { recovery: 9, emotionalStability: 9, discipline: 6 },
      },
    ],
  },
];
