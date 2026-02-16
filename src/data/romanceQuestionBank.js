/**
 * 《你认为最浪漫的事》核心题库：
 * 1. 题库共 14 题，默认先出前 13 题，第 14 题由守门员机制按判定解锁。
 * 2. 每个选项都包含 4 维向量（仪式感/共情力/创造力/务实度），用于雷达图与总分计算。
 * 3. beliefWeight 用于“宿命解锁”算法，分值越高代表越坚定的浪漫信念。
 */
export const ROMANCE_QUESTION_BANK = [
  {
    id: "romance-rainy-weekend",
    title: "周末的早晨，窗外下着暴雨，你觉得最浪漫的打开方式是？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.2,
    options: [
      {
        id: "rainy-weekend-a",
        label: "两人窝在被窝里，听着雨声睡回笼觉。",
        beliefWeight: 1,
        vector: {
          ritualSense: 4,
          empathyPower: 7,
          creativeSpark: 4,
          practicalCommitment: 4,
        },
      },
      {
        id: "rainy-weekend-b",
        label: "起床做一份精致的Brunch，摆盘要有花。",
        beliefWeight: 2,
        vector: {
          ritualSense: 10,
          empathyPower: 6,
          creativeSpark: 7,
          practicalCommitment: 6,
        },
      },
      {
        id: "rainy-weekend-c",
        label: "挑一部老电影，一边看一边讨论剧情。",
        beliefWeight: 2,
        vector: {
          ritualSense: 6,
          empathyPower: 8,
          creativeSpark: 8,
          practicalCommitment: 6,
        },
      },
      {
        id: "rainy-weekend-d",
        label: "撑伞冲进雨里，去便利店买关东煮。",
        beliefWeight: 2,
        vector: {
          ritualSense: 5,
          empathyPower: 7,
          creativeSpark: 9,
          practicalCommitment: 3,
        },
      },
    ],
  },
  {
    id: "romance-crowded-street",
    title: "走在拥挤的人潮中，你会下意识做出的动作是？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.15,
    options: [
      {
        id: "crowded-street-a",
        label: "十指紧扣，生怕对方走丢。",
        beliefWeight: 1,
        vector: {
          ritualSense: 6,
          empathyPower: 8,
          creativeSpark: 4,
          practicalCommitment: 7,
        },
      },
      {
        id: "crowded-street-b",
        label: "搂着对方的肩膀或腰，宣示主权。",
        beliefWeight: 1,
        vector: {
          ritualSense: 5,
          empathyPower: 5,
          creativeSpark: 4,
          practicalCommitment: 5,
        },
      },
      {
        id: "crowded-street-c",
        label: "甚至不用牵手，只需要一个眼神就能懂对方的去向。",
        beliefWeight: 2,
        vector: {
          ritualSense: 7,
          empathyPower: 9,
          creativeSpark: 6,
          practicalCommitment: 8,
        },
      },
      {
        id: "crowded-street-d",
        label: "让对方走在内侧，自己挡住车流人群。",
        beliefWeight: 2,
        vector: {
          ritualSense: 4,
          empathyPower: 8,
          creativeSpark: 3,
          practicalCommitment: 10,
        },
      },
    ],
  },
  {
    id: "romance-business-trip",
    title: "对方突然要出差一周，临别前的拥抱，你心里在想？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.2,
    options: [
      {
        id: "business-trip-a",
        label: "“还没走我就开始想你了。”",
        beliefWeight: 2,
        vector: {
          ritualSense: 6,
          empathyPower: 8,
          creativeSpark: 5,
          practicalCommitment: 4,
        },
      },
      {
        id: "business-trip-b",
        label: "“太好了，终于有几天自由时间打游戏/追剧了！”",
        beliefWeight: 0,
        vector: {
          ritualSense: 2,
          empathyPower: 2,
          creativeSpark: 5,
          practicalCommitment: 6,
        },
      },
      {
        id: "business-trip-c",
        label: "“记得给他/她塞点维生素在包里。”",
        beliefWeight: 1,
        vector: {
          ritualSense: 4,
          empathyPower: 8,
          creativeSpark: 3,
          practicalCommitment: 10,
        },
      },
      {
        id: "business-trip-d",
        label: "“回来时会给我带什么礼物呢？”",
        beliefWeight: 1,
        vector: {
          ritualSense: 7,
          empathyPower: 5,
          creativeSpark: 6,
          practicalCommitment: 4,
        },
      },
    ],
  },
  {
    id: "romance-old-ticket",
    title: "你们在家里大扫除，翻出了一张旧车票/电影票，你会？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.1,
    options: [
      {
        id: "old-ticket-a",
        label: "偷偷收起来，那是只属于你的独家记忆。",
        beliefWeight: 1,
        vector: {
          ritualSense: 6,
          empathyPower: 6,
          creativeSpark: 6,
          practicalCommitment: 5,
        },
      },
      {
        id: "old-ticket-b",
        label: "兴奋地拿给对方看：“记得吗？那是我们第一次约会！”",
        beliefWeight: 2,
        vector: {
          ritualSense: 8,
          empathyPower: 8,
          creativeSpark: 6,
          practicalCommitment: 6,
        },
      },
      {
        id: "old-ticket-c",
        label: "随手扔掉，过去的不重要，重要的是现在。",
        beliefWeight: 0,
        vector: {
          ritualSense: 1,
          empathyPower: 3,
          creativeSpark: 2,
          practicalCommitment: 7,
        },
      },
      {
        id: "old-ticket-d",
        label: "拍照发朋友圈，配文感叹时光飞逝。",
        beliefWeight: 1,
        vector: {
          ritualSense: 7,
          empathyPower: 4,
          creativeSpark: 6,
          practicalCommitment: 4,
        },
      },
    ],
  },
  {
    id: "romance-opposite-word",
    title: "你认为“浪漫”的反义词是什么？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.25,
    options: [
      {
        id: "opposite-word-a",
        label: "贫穷。",
        beliefWeight: 0,
        vector: {
          ritualSense: 2,
          empathyPower: 3,
          creativeSpark: 3,
          practicalCommitment: 9,
        },
      },
      {
        id: "opposite-word-b",
        label: "敷衍。",
        beliefWeight: 1,
        vector: {
          ritualSense: 7,
          empathyPower: 7,
          creativeSpark: 5,
          practicalCommitment: 7,
        },
      },
      {
        id: "opposite-word-c",
        label: "沉默。",
        beliefWeight: 1,
        vector: {
          ritualSense: 6,
          empathyPower: 8,
          creativeSpark: 5,
          practicalCommitment: 6,
        },
      },
      {
        id: "opposite-word-d",
        label: "遗忘。",
        beliefWeight: 2,
        vector: {
          ritualSense: 8,
          empathyPower: 9,
          creativeSpark: 6,
          practicalCommitment: 5,
        },
      },
    ],
  },
  {
    id: "romance-love-superpower",
    title: "如果可以拥有一个超能力来提升恋爱质量，你选择？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.2,
    options: [
      {
        id: "love-superpower-a",
        label: "读心术：永远知道对方在想什么。",
        beliefWeight: 1,
        vector: {
          ritualSense: 5,
          empathyPower: 7,
          creativeSpark: 6,
          practicalCommitment: 4,
        },
      },
      {
        id: "love-superpower-b",
        label: "瞬移术：想见的时候下一秒就能见到。",
        beliefWeight: 2,
        vector: {
          ritualSense: 7,
          empathyPower: 8,
          creativeSpark: 8,
          practicalCommitment: 3,
        },
      },
      {
        id: "love-superpower-c",
        label: "时间停止：把最美好的瞬间永久定格。",
        beliefWeight: 2,
        vector: {
          ritualSense: 9,
          empathyPower: 7,
          creativeSpark: 9,
          practicalCommitment: 3,
        },
      },
      {
        id: "love-superpower-d",
        label: "记忆消除：吵架后一键消除不开心。",
        beliefWeight: 0,
        vector: {
          ritualSense: 4,
          empathyPower: 4,
          creativeSpark: 6,
          practicalCommitment: 2,
        },
      },
    ],
  },
  {
    id: "romance-anniversary-dinner",
    title: "纪念日晚餐，对方带你去了一家很好吃但环境嘈杂的苍蝇馆子，你的反应是？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.25,
    options: [
      {
        id: "anniversary-dinner-a",
        label: "很开心，只要味道好，形式不重要。",
        beliefWeight: 0,
        vector: {
          ritualSense: 3,
          empathyPower: 6,
          creativeSpark: 3,
          practicalCommitment: 9,
        },
      },
      {
        id: "anniversary-dinner-b",
        label: "有点失落，纪念日应该要有鲜花和烛光。",
        beliefWeight: 2,
        vector: {
          ritualSense: 9,
          empathyPower: 6,
          creativeSpark: 6,
          practicalCommitment: 4,
        },
      },
      {
        id: "anniversary-dinner-c",
        label: "觉得这就是“烟火气”，是过日子的感觉。",
        beliefWeight: 1,
        vector: {
          ritualSense: 5,
          empathyPower: 7,
          creativeSpark: 4,
          practicalCommitment: 8,
        },
      },
      {
        id: "anniversary-dinner-d",
        label: "只要是对面坐的是他/她，吃什么都无所谓。",
        beliefWeight: 2,
        vector: {
          ritualSense: 7,
          empathyPower: 9,
          creativeSpark: 5,
          practicalCommitment: 6,
        },
      },
    ],
  },
  {
    id: "romance-movie-tears",
    title: "电影里的哪种桥段最能戳中你的泪点？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.35,
    options: [
      {
        id: "movie-tears-a",
        label: "即使失忆了，我依然会重新爱上你。",
        beliefWeight: 2,
        vector: {
          ritualSense: 9,
          empathyPower: 8,
          creativeSpark: 8,
          practicalCommitment: 3,
        },
      },
      {
        id: "movie-tears-b",
        label: "为了你的梦想，我愿意放手让你飞。",
        beliefWeight: 2,
        vector: {
          ritualSense: 7,
          empathyPower: 9,
          creativeSpark: 7,
          practicalCommitment: 6,
        },
      },
      {
        id: "movie-tears-c",
        label: "两人白发苍苍，坐在长椅上晒太阳。",
        beliefWeight: 1,
        vector: {
          ritualSense: 6,
          empathyPower: 9,
          creativeSpark: 4,
          practicalCommitment: 9,
        },
      },
      {
        id: "movie-tears-d",
        label: "在世界末日来临前，最后一次拥吻。",
        beliefWeight: 2,
        vector: {
          ritualSense: 8,
          empathyPower: 7,
          creativeSpark: 9,
          practicalCommitment: 2,
        },
      },
    ],
  },
  {
    id: "romance-break-ice",
    title: "吵架冷战了，打破僵局的方式，你觉得最浪漫的是？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.3,
    options: [
      {
        id: "break-ice-a",
        label: "写一封长长的手写信塞在门缝里。",
        beliefWeight: 2,
        vector: {
          ritualSense: 9,
          empathyPower: 8,
          creativeSpark: 8,
          practicalCommitment: 6,
        },
      },
      {
        id: "break-ice-b",
        label: "什么都不说，直接强吻。",
        beliefWeight: 1,
        vector: {
          ritualSense: 5,
          empathyPower: 4,
          creativeSpark: 6,
          practicalCommitment: 2,
        },
      },
      {
        id: "break-ice-c",
        label: "默默把对方最爱吃的水果切好放在桌上。",
        beliefWeight: 1,
        vector: {
          ritualSense: 6,
          empathyPower: 8,
          creativeSpark: 4,
          practicalCommitment: 9,
        },
      },
      {
        id: "break-ice-d",
        label: "发一个搞笑的表情包，给个台阶下。",
        beliefWeight: 1,
        vector: {
          ritualSense: 4,
          empathyPower: 7,
          creativeSpark: 7,
          practicalCommitment: 7,
        },
      },
    ],
  },
  {
    id: "romance-sea-imagery",
    title: "闭上眼，想象一片海，你觉得海面上有什么？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.1,
    options: [
      {
        id: "sea-imagery-a",
        label: "一艘孤独的帆船。",
        beliefWeight: 1,
        vector: {
          ritualSense: 5,
          empathyPower: 7,
          creativeSpark: 7,
          practicalCommitment: 5,
        },
      },
      {
        id: "sea-imagery-b",
        label: "绚丽的夕阳。",
        beliefWeight: 1,
        vector: {
          ritualSense: 6,
          empathyPower: 8,
          creativeSpark: 6,
          practicalCommitment: 6,
        },
      },
      {
        id: "sea-imagery-c",
        label: "狂风暴雨。",
        beliefWeight: 2,
        vector: {
          ritualSense: 5,
          empathyPower: 5,
          creativeSpark: 9,
          practicalCommitment: 3,
        },
      },
      {
        id: "sea-imagery-d",
        label: "另一片陆地。",
        beliefWeight: 1,
        vector: {
          ritualSense: 4,
          empathyPower: 6,
          creativeSpark: 5,
          practicalCommitment: 8,
        },
      },
    ],
  },
  {
    id: "romance-love-plant",
    title: "如果要把你们的爱情比作一种植物，你希望是？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.2,
    options: [
      {
        id: "love-plant-a",
        label: "玫瑰：热烈、带刺、鲜艳。",
        beliefWeight: 2,
        vector: {
          ritualSense: 8,
          empathyPower: 6,
          creativeSpark: 7,
          practicalCommitment: 3,
        },
      },
      {
        id: "love-plant-b",
        label: "大树：稳固、遮风挡雨。",
        beliefWeight: 1,
        vector: {
          ritualSense: 5,
          empathyPower: 7,
          creativeSpark: 4,
          practicalCommitment: 10,
        },
      },
      {
        id: "love-plant-c",
        label: "苔藓：不起眼，但在此刻无处不在。",
        beliefWeight: 2,
        vector: {
          ritualSense: 6,
          empathyPower: 9,
          creativeSpark: 6,
          practicalCommitment: 7,
        },
      },
      {
        id: "love-plant-d",
        label: "向日葵：永远追随阳光。",
        beliefWeight: 2,
        vector: {
          ritualSense: 7,
          empathyPower: 8,
          creativeSpark: 6,
          practicalCommitment: 7,
        },
      },
    ],
  },
  {
    id: "romance-best-love-line",
    title: "你觉得最动听的一句情话是？",
    description: "请选择最符合你直觉的答案。",
    weight: 1.25,
    options: [
      {
        id: "best-love-line-a",
        label: "“我爱你。”",
        beliefWeight: 1,
        vector: {
          ritualSense: 7,
          empathyPower: 8,
          creativeSpark: 4,
          practicalCommitment: 5,
        },
      },
      {
        id: "best-love-line-b",
        label: "“别怕，有我在。”",
        beliefWeight: 2,
        vector: {
          ritualSense: 6,
          empathyPower: 9,
          creativeSpark: 5,
          practicalCommitment: 8,
        },
      },
      {
        id: "best-love-line-c",
        label: "“我想和你有个家。”",
        beliefWeight: 2,
        vector: {
          ritualSense: 8,
          empathyPower: 8,
          creativeSpark: 5,
          practicalCommitment: 10,
        },
      },
      {
        id: "best-love-line-d",
        label: "“和你在一起，我变成了更好的自己。”",
        beliefWeight: 2,
        vector: {
          ritualSense: 7,
          empathyPower: 9,
          creativeSpark: 7,
          practicalCommitment: 7,
        },
      },
    ],
  },
  {
    /**
     * 关键逻辑：Q13 为守门员题（Gatekeeper）。
     * 该题 beliefWeight 拉开梯度，用于判定是否解锁 Q14。
     */
    id: "romance-gatekeeper",
    title: "假如生命只剩最后 1 分钟，你只能给对方留一句话，你会说？",
    description: "请给出你此刻最真实的一句话。",
    weight: 1.6,
    options: [
      {
        id: "gatekeeper-final-a",
        label: "“下辈子，换你来追我。”",
        beliefWeight: 4,
        vector: {
          ritualSense: 7,
          empathyPower: 6,
          creativeSpark: 7,
          practicalCommitment: 4,
        },
      },
      {
        id: "gatekeeper-final-b",
        label: "“忘了我，找个更好的人。”",
        beliefWeight: 8,
        vector: {
          ritualSense: 8,
          empathyPower: 9,
          creativeSpark: 6,
          practicalCommitment: 5,
        },
      },
      {
        id: "gatekeeper-final-c",
        label: "“谢谢你，这一生我很满足。”",
        beliefWeight: 9,
        vector: {
          ritualSense: 8,
          empathyPower: 9,
          creativeSpark: 5,
          practicalCommitment: 8,
        },
      },
      {
        id: "gatekeeper-final-d",
        label: "“我会在终点等你，别急着来。”",
        beliefWeight: 10,
        vector: {
          ritualSense: 9,
          empathyPower: 9,
          creativeSpark: 7,
          practicalCommitment: 6,
        },
      },
    ],
  },
  {
    /**
     * 关键逻辑：Q14 为解锁题，当前机制下只有通过守门员后才会出现。
     * 根据产品定义，本题不论选项均视为“满分机会”。
     */
    id: "romance-final-chance",
    title: "既然说好了“一生一世”，你认为要把这两个字贯彻到底，最需要的是？",
    description: "请选择你最认同的一种坚持方式。",
    weight: 1.4,
    options: [
      {
        id: "final-chance-a",
        label: "即使平淡，也绝不放手的坚持。",
        beliefWeight: 10,
        vector: {
          ritualSense: 7,
          empathyPower: 8,
          creativeSpark: 5,
          practicalCommitment: 10,
        },
      },
      {
        id: "final-chance-b",
        label: "无论贫穷富贵，都生死相依的勇气。",
        beliefWeight: 10,
        vector: {
          ritualSense: 8,
          empathyPower: 9,
          creativeSpark: 6,
          practicalCommitment: 8,
        },
      },
      {
        id: "final-chance-c",
        label: "每天醒来，都像初恋一样心动的新鲜。",
        beliefWeight: 10,
        vector: {
          ritualSense: 9,
          empathyPower: 8,
          creativeSpark: 9,
          practicalCommitment: 5,
        },
      },
      {
        id: "final-chance-d",
        label: "不需要任何理由，就是命中注定的直觉。",
        beliefWeight: 10,
        vector: {
          ritualSense: 8,
          empathyPower: 7,
          creativeSpark: 8,
          practicalCommitment: 4,
        },
      },
    ],
  },
];
