/**
 * 国际版城市测试题库：
 * 1. 与国内版题库完全独立，题目围绕跨国居住场景设计。
 * 2. 题目 ID 使用 `global-` 前缀，便于在分析阶段识别国际版答卷。
 * 3. 选项向量沿用统一 8 维评分体系，保持分析器可复用。
 */
export const GLOBAL_CITY_QUESTION_BANK = [
  {
    id: "global-language",
    title: "工作与生活语言，你更希望是？",
    description: "语言环境会直接影响跨城适应速度。",
    weight: 1.2,
    options: [
      {
        id: "global-language-english",
        label: "英语为主，沟通门槛低",
        vector: { careerTech: 8, paceFast: 7, foodDiversity: 7, familyFriendly: 7 },
      },
      {
        id: "global-language-bilingual",
        label: "双语环境，慢慢融入",
        vector: { careerTech: 7, familyFriendly: 8, paceFast: 6, transitPublic: 7 },
      },
      {
        id: "global-language-local",
        label: "本地语言浓度高也可以",
        vector: { familyFriendly: 7, paceFast: 5, naturePreference: 6, budgetHigh: 5 },
      },
      {
        id: "global-language-remote",
        label: "远程办公，语言影响小",
        vector: { paceFast: 4, naturePreference: 8, climateWarm: 7, transitPublic: 5 },
      },
    ],
  },
  {
    id: "global-commute-style",
    title: "理想的跨城日常出行方式？",
    description: "出行方式决定你对城市基础设施的要求。",
    weight: 1.15,
    options: [
      {
        id: "global-commute-subway",
        label: "地铁/轨道优先",
        vector: { transitPublic: 10, paceFast: 8, budgetHigh: 7, familyFriendly: 7 },
      },
      {
        id: "global-commute-bus",
        label: "公交 + 步行即可",
        vector: { transitPublic: 8, paceFast: 6, budgetHigh: 6, naturePreference: 6 },
      },
      {
        id: "global-commute-drive",
        label: "自驾最自由",
        vector: { transitPublic: 3, paceFast: 5, naturePreference: 8, climateWarm: 8 },
      },
      {
        id: "global-commute-bike",
        label: "骑行/慢行友好最重要",
        vector: { transitPublic: 7, paceFast: 5, naturePreference: 8, familyFriendly: 8 },
      },
    ],
  },
  {
    id: "global-climate",
    title: "长期居住的体感气候，你更偏好？",
    description: "气候会影响通勤、社交与心情稳定度。",
    weight: 1.25,
    options: [
      {
        id: "global-climate-warm",
        label: "全年偏暖，少穿厚衣",
        vector: { climateWarm: 10, naturePreference: 7, paceFast: 6, familyFriendly: 7 },
      },
      {
        id: "global-climate-mild",
        label: "温和四季，不极端",
        vector: { climateWarm: 7, naturePreference: 7, familyFriendly: 8, paceFast: 6 },
      },
      {
        id: "global-climate-cool",
        label: "凉爽清醒，更有状态",
        vector: { climateWarm: 3, paceFast: 7, careerTech: 7, naturePreference: 6 },
      },
      {
        id: "global-climate-all",
        label: "都能适应，只看机会",
        vector: { climateWarm: 6, careerTech: 9, paceFast: 8, budgetHigh: 7 },
      },
    ],
  },
  {
    id: "global-career-focus",
    title: "跨国居住最看重哪类机会？",
    description: "职业路径决定你对城市机会密度的需求。",
    weight: 1.3,
    options: [
      {
        id: "global-career-tech",
        label: "科技/互联网机会",
        vector: { careerTech: 10, paceFast: 8, budgetHigh: 8, transitPublic: 7 },
      },
      {
        id: "global-career-finance",
        label: "金融/商业平台",
        vector: { careerTech: 9, paceFast: 8, budgetHigh: 9, foodDiversity: 8 },
      },
      {
        id: "global-career-creative",
        label: "创意/内容产业",
        vector: { careerTech: 7, foodDiversity: 9, paceFast: 6, naturePreference: 7 },
      },
      {
        id: "global-career-stable",
        label: "稳定岗位 + 长期安居",
        vector: { careerTech: 6, familyFriendly: 9, paceFast: 5, budgetHigh: 6 },
      },
    ],
  },
  {
    id: "global-weekend",
    title: "周末在国际城市里你最想？",
    description: "休闲偏好是长期幸福感的重要来源。",
    weight: 1.05,
    options: [
      {
        id: "global-weekend-museum",
        label: "博物馆/展览/演出",
        vector: { foodDiversity: 8, paceFast: 7, transitPublic: 8, budgetHigh: 7 },
      },
      {
        id: "global-weekend-outdoor",
        label: "海边/徒步/公园",
        vector: { naturePreference: 10, climateWarm: 7, paceFast: 4, familyFriendly: 8 },
      },
      {
        id: "global-weekend-social",
        label: "聚会/社交活动",
        vector: { foodDiversity: 9, paceFast: 7, transitPublic: 7, familyFriendly: 6 },
      },
      {
        id: "global-weekend-home",
        label: "宅家恢复能量",
        vector: { familyFriendly: 8, paceFast: 3, naturePreference: 6, budgetHigh: 5 },
      },
    ],
  },
  {
    id: "global-rent",
    title: "房租压力上限更接近？",
    description: "预算承受区间会筛掉大量不适配城市。",
    weight: 1.2,
    options: [
      {
        id: "global-rent-high",
        label: "高租金但机会密度高也可接受",
        vector: { budgetHigh: 10, careerTech: 9, paceFast: 8, transitPublic: 8 },
      },
      {
        id: "global-rent-mid",
        label: "中等租金，机会和生活平衡",
        vector: { budgetHigh: 7, familyFriendly: 8, paceFast: 6, careerTech: 7 },
      },
      {
        id: "global-rent-low",
        label: "优先控制成本",
        vector: { budgetHigh: 4, familyFriendly: 8, paceFast: 4, climateWarm: 7 },
      },
      {
        id: "global-rent-flex",
        label: "可短租切换，灵活就好",
        vector: { budgetHigh: 6, paceFast: 7, naturePreference: 6, foodDiversity: 7 },
      },
    ],
  },
  {
    id: "global-food",
    title: "你对国际城市“吃”的期待是？",
    description: "饮食多样性会影响长期生活满足感。",
    weight: 1.0,
    options: [
      {
        id: "global-food-diverse",
        label: "世界美食都要有",
        vector: { foodDiversity: 10, budgetHigh: 8, paceFast: 7, transitPublic: 7 },
      },
      {
        id: "global-food-chinese",
        label: "中餐选择要充足",
        vector: { foodDiversity: 8, familyFriendly: 8, paceFast: 6, budgetHigh: 6 },
      },
      {
        id: "global-food-simple",
        label: "简单健康就行",
        vector: { foodDiversity: 5, familyFriendly: 8, budgetHigh: 5, naturePreference: 7 },
      },
      {
        id: "global-food-cook",
        label: "主要自己做饭",
        vector: { foodDiversity: 4, budgetHigh: 4, familyFriendly: 8, paceFast: 4 },
      },
    ],
  },
  {
    id: "global-social-density",
    title: "更偏好的社交密度？",
    description: "社交密度会影响你对城市节奏和文化的体验。",
    weight: 1.05,
    options: [
      {
        id: "global-social-high",
        label: "高频社交，圈子越大越好",
        vector: { paceFast: 8, foodDiversity: 8, transitPublic: 8, careerTech: 8 },
      },
      {
        id: "global-social-mid",
        label: "小圈稳定，偶尔拓展",
        vector: { familyFriendly: 8, paceFast: 6, foodDiversity: 7, naturePreference: 6 },
      },
      {
        id: "global-social-low",
        label: "低社交，独处优先",
        vector: { paceFast: 3, naturePreference: 8, familyFriendly: 7, climateWarm: 6 },
      },
      {
        id: "global-social-work",
        label: "只保留工作相关社交",
        vector: { careerTech: 8, paceFast: 7, familyFriendly: 5, transitPublic: 7 },
      },
    ],
  },
  {
    id: "global-city-pace",
    title: "理想城市节奏更像？",
    description: "你对节奏的耐受度是关键筛选条件。",
    weight: 1.2,
    options: [
      {
        id: "global-city-pace-fast",
        label: "快节奏，效率优先",
        vector: { paceFast: 10, careerTech: 9, transitPublic: 8, budgetHigh: 8 },
      },
      {
        id: "global-city-pace-balanced",
        label: "工作高效，生活也要松弛",
        vector: { paceFast: 7, familyFriendly: 8, naturePreference: 7, careerTech: 7 },
      },
      {
        id: "global-city-pace-slow",
        label: "慢节奏，生活质感优先",
        vector: { paceFast: 3, naturePreference: 9, climateWarm: 7, familyFriendly: 8 },
      },
      {
        id: "global-city-pace-adaptive",
        label: "可快可慢，看阶段",
        vector: { paceFast: 6, careerTech: 7, budgetHigh: 6, familyFriendly: 6 },
      },
    ],
  },
  {
    id: "global-public-service",
    title: "你最在意的城市公共能力是？",
    description: "公共能力决定长期生活稳定度。",
    weight: 1.15,
    options: [
      {
        id: "global-public-service-medical",
        label: "医疗与公共服务",
        vector: { familyFriendly: 9, budgetHigh: 7, transitPublic: 7, paceFast: 6 },
      },
      {
        id: "global-public-service-transport",
        label: "通勤效率",
        vector: { transitPublic: 10, paceFast: 8, careerTech: 7, budgetHigh: 7 },
      },
      {
        id: "global-public-service-education",
        label: "教育资源",
        vector: { familyFriendly: 10, budgetHigh: 8, naturePreference: 6, paceFast: 5 },
      },
      {
        id: "global-public-service-digital",
        label: "办事数字化、流程清晰",
        vector: { paceFast: 8, careerTech: 8, familyFriendly: 7, transitPublic: 7 },
      },
    ],
  },
  {
    id: "global-flight-network",
    title: "你对国际航线便利度的需求？",
    description: "是否高频跨国出行，会影响城市枢纽偏好。",
    weight: 1.0,
    options: [
      {
        id: "global-flight-frequent",
        label: "高频出差/旅行，航班越多越好",
        vector: { paceFast: 8, careerTech: 8, budgetHigh: 8, transitPublic: 8 },
      },
      {
        id: "global-flight-regular",
        label: "每季度飞一次就够",
        vector: { paceFast: 6, budgetHigh: 6, familyFriendly: 7, transitPublic: 7 },
      },
      {
        id: "global-flight-rare",
        label: "一年几次，不是刚需",
        vector: { paceFast: 4, familyFriendly: 8, naturePreference: 7, budgetHigh: 5 },
      },
      {
        id: "global-flight-none",
        label: "希望就地安稳，不常飞",
        vector: { familyFriendly: 9, paceFast: 3, naturePreference: 8, climateWarm: 6 },
      },
    ],
  },
  {
    id: "global-safety",
    title: "夜间独自出行时你更在意？",
    description: "安全感需求会显著影响居住决策。",
    weight: 1.2,
    options: [
      {
        id: "global-safety-law-order",
        label: "治安与秩序稳定",
        vector: { familyFriendly: 10, paceFast: 6, transitPublic: 8, budgetHigh: 7 },
      },
      {
        id: "global-safety-lighting",
        label: "灯光与夜间公共交通",
        vector: { transitPublic: 9, familyFriendly: 8, paceFast: 7, foodDiversity: 7 },
      },
      {
        id: "global-safety-community",
        label: "社区熟悉感",
        vector: { familyFriendly: 9, paceFast: 4, naturePreference: 7, budgetHigh: 5 },
      },
      {
        id: "global-safety-self",
        label: "主要靠自己规划路线",
        vector: { paceFast: 7, careerTech: 7, familyFriendly: 5, transitPublic: 6 },
      },
    ],
  },
  {
    id: "global-nightlife",
    title: "夜生活在你生活里占比？",
    description: "夜间活跃度会影响城市功能偏好。",
    weight: 0.95,
    options: [
      {
        id: "global-nightlife-high",
        label: "很重要，夜间也要精彩",
        vector: { paceFast: 8, foodDiversity: 9, transitPublic: 8, careerTech: 7 },
      },
      {
        id: "global-nightlife-mid",
        label: "偶尔享受就够",
        vector: { paceFast: 6, foodDiversity: 7, familyFriendly: 7, transitPublic: 7 },
      },
      {
        id: "global-nightlife-low",
        label: "不太需要，早睡更重要",
        vector: { paceFast: 3, familyFriendly: 8, climateWarm: 6, naturePreference: 7 },
      },
      {
        id: "global-nightlife-work",
        label: "工作日不需要，周末再说",
        vector: { paceFast: 5, careerTech: 7, familyFriendly: 6, foodDiversity: 7 },
      },
    ],
  },
  {
    id: "global-nature-access",
    title: "你希望多快到达自然场景？",
    description: "自然可达性影响你的恢复效率。",
    weight: 1.15,
    options: [
      {
        id: "global-nature-immediate",
        label: "15分钟内看到海/山/公园",
        vector: { naturePreference: 10, climateWarm: 7, familyFriendly: 8, paceFast: 4 },
      },
      {
        id: "global-nature-weekend",
        label: "周末可达就够",
        vector: { naturePreference: 7, paceFast: 6, familyFriendly: 7, transitPublic: 7 },
      },
      {
        id: "global-nature-occasion",
        label: "偶尔接触自然即可",
        vector: { naturePreference: 5, paceFast: 7, careerTech: 8, foodDiversity: 8 },
      },
      {
        id: "global-nature-urban",
        label: "更喜欢纯都市密度",
        vector: { naturePreference: 3, paceFast: 8, careerTech: 9, transitPublic: 8 },
      },
    ],
  },
  {
    id: "global-family-plan",
    title: "未来 3-5 年你的生活重心更偏向？",
    description: "不同人生阶段对应不同城市优先级。",
    weight: 1.25,
    options: [
      {
        id: "global-family-career",
        label: "冲职业成长",
        vector: { careerTech: 10, paceFast: 8, budgetHigh: 8, familyFriendly: 5 },
      },
      {
        id: "global-family-balance",
        label: "职业与生活平衡",
        vector: { careerTech: 7, familyFriendly: 8, naturePreference: 7, paceFast: 6 },
      },
      {
        id: "global-family-home",
        label: "稳定安家",
        vector: { familyFriendly: 10, climateWarm: 7, naturePreference: 7, transitPublic: 7 },
      },
      {
        id: "global-family-explore",
        label: "先探索，多城市体验",
        vector: { paceFast: 7, foodDiversity: 8, careerTech: 7, budgetHigh: 6 },
      },
    ],
  },
  {
    id: "global-cultural-openness",
    title: "你对城市文化多样性的期待？",
    description: "文化包容度决定你的生活舒适边界。",
    weight: 1.05,
    options: [
      {
        id: "global-cultural-high",
        label: "越多元越好",
        vector: { foodDiversity: 10, paceFast: 7, careerTech: 8, familyFriendly: 7 },
      },
      {
        id: "global-cultural-mid",
        label: "多元但秩序稳定",
        vector: { foodDiversity: 8, familyFriendly: 8, transitPublic: 8, paceFast: 6 },
      },
      {
        id: "global-cultural-local",
        label: "本地文化感更重要",
        vector: { foodDiversity: 7, naturePreference: 7, paceFast: 5, familyFriendly: 8 },
      },
      {
        id: "global-cultural-low",
        label: "文化差异小更安心",
        vector: { familyFriendly: 8, paceFast: 4, budgetHigh: 6, transitPublic: 6 },
      },
    ],
  },
  {
    id: "global-work-life",
    title: "你最理想的工作-生活边界是？",
    description: "边界感偏好会影响你对城市节奏的匹配。",
    weight: 1.15,
    options: [
      {
        id: "global-work-life-growth",
        label: "短期冲刺，接受高强度",
        vector: { paceFast: 9, careerTech: 10, budgetHigh: 8, familyFriendly: 5 },
      },
      {
        id: "global-work-life-balance",
        label: "工作认真，下班有生活",
        vector: { paceFast: 6, familyFriendly: 8, naturePreference: 7, careerTech: 7 },
      },
      {
        id: "global-work-life-low-pressure",
        label: "低压力、慢节奏",
        vector: { paceFast: 3, familyFriendly: 8, climateWarm: 7, naturePreference: 8 },
      },
      {
        id: "global-work-life-flex",
        label: "弹性为主，地点自由",
        vector: { paceFast: 5, naturePreference: 8, foodDiversity: 7, budgetHigh: 6 },
      },
    ],
  },
  {
    id: "global-income-cost",
    title: "收入与成本，你更倾向哪种关系？",
    description: "这是国际居住决策里的核心权衡。",
    weight: 1.3,
    options: [
      {
        id: "global-income-cost-high",
        label: "高收入高成本，只要成长快",
        vector: { budgetHigh: 10, careerTech: 9, paceFast: 8, transitPublic: 7 },
      },
      {
        id: "global-income-cost-mid",
        label: "中高收入，中高成本，可持续",
        vector: { budgetHigh: 8, familyFriendly: 8, careerTech: 8, paceFast: 6 },
      },
      {
        id: "global-income-cost-low",
        label: "收入一般但生活轻松",
        vector: { budgetHigh: 5, paceFast: 4, naturePreference: 7, familyFriendly: 8 },
      },
      {
        id: "global-income-cost-stable",
        label: "稳定现金流比高薪更重要",
        vector: { budgetHigh: 6, familyFriendly: 9, careerTech: 6, paceFast: 5 },
      },
    ],
  },
];
