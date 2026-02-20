/**
 * 最适合居住城市测试题库：
 * 1. 使用更日常、更口语化的问题，降低答题理解成本。
 * 2. 标题中不保留 Markdown 星号符号，直接展示自然文本。
 * 3. 每个选项映射城市偏好维度，供本地模型与深度分析使用。
 */
export const QUESTION_BANK = [
  {
    id: "window-view",
    title: "早上推窗，最想看见？",
    description: "你日常最想看到的城市画面。",
    weight: 1.1,
    options: [
      {
        id: "window-view-highrise",
        label: "高楼大厦",
        vector: { paceFast: 8, careerTech: 8, budgetHigh: 8, transitPublic: 7 },
      },
      {
        id: "window-view-water",
        label: "大海/湖泊",
        vector: { naturePreference: 10, climateWarm: 8, paceFast: 4, familyFriendly: 7 },
      },
      {
        id: "window-view-street",
        label: "热闹街道",
        vector: { paceFast: 9, foodDiversity: 8, transitPublic: 8, careerTech: 7 },
      },
      {
        id: "window-view-forest",
        label: "树林/山景",
        vector: { naturePreference: 10, familyFriendly: 8, paceFast: 3, climateWarm: 6 },
      },
    ],
  },
  {
    id: "takeout-outfit",
    title: "下楼拿外卖，穿什么？",
    description: "看你更偏爱怎样的城市生活状态。",
    weight: 1.0,
    options: [
      {
        id: "takeout-dressup",
        label: "精致全妆",
        vector: { paceFast: 8, careerTech: 7, foodDiversity: 8, budgetHigh: 7 },
      },
      {
        id: "takeout-casual",
        label: "休闲T恤",
        vector: { familyFriendly: 7, paceFast: 5, budgetHigh: 5, naturePreference: 6 },
      },
      {
        id: "takeout-pajama",
        label: "睡衣拖鞋",
        vector: { familyFriendly: 8, paceFast: 3, climateWarm: 7, budgetHigh: 4 },
      },
      {
        id: "takeout-free",
        label: "怎么舒服怎么来",
        vector: { paceFast: 2, climateWarm: 8, naturePreference: 6, familyFriendly: 4 },
      },
    ],
  },
  {
    id: "walking-speed",
    title: "走路速度通常是？",
    description: "你的步伐里有城市节奏偏好。",
    weight: 1.15,
    options: [
      {
        id: "walking-fast",
        label: "带风，赶时间",
        vector: { paceFast: 10, careerTech: 8, transitPublic: 8, familyFriendly: 5 },
      },
      {
        id: "walking-normal",
        label: "正常速度",
        vector: { paceFast: 6, familyFriendly: 7, transitPublic: 7, naturePreference: 6 },
      },
      {
        id: "walking-slow",
        label: "像散步一样",
        vector: { paceFast: 3, familyFriendly: 8, naturePreference: 8, climateWarm: 7 },
      },
      {
        id: "walking-sightseeing",
        label: "走走停停看风景",
        vector: { naturePreference: 10, paceFast: 2, familyFriendly: 8, climateWarm: 7 },
      },
    ],
  },
  {
    id: "breakfast-bite",
    title: "早餐偏爱哪一口？",
    description: "吃早餐的习惯也反映城市生活偏好。",
    weight: 1.0,
    options: [
      {
        id: "breakfast-coffee-bread",
        label: "咖啡 + 面包",
        vector: { paceFast: 8, careerTech: 7, foodDiversity: 8, budgetHigh: 7 },
      },
      {
        id: "breakfast-dim-sum",
        label: "早茶/点心",
        vector: { foodDiversity: 9, familyFriendly: 8, paceFast: 6, climateWarm: 7 },
      },
      {
        id: "breakfast-street-carb",
        label: "豆浆油条/煎饼",
        vector: { foodDiversity: 8, familyFriendly: 8, budgetHigh: 5, paceFast: 5 },
      },
      {
        id: "breakfast-skip",
        label: "不吃，直接午饭",
        vector: { paceFast: 9, careerTech: 8, familyFriendly: 4, transitPublic: 7 },
      },
    ],
  },
  {
    id: "hated-weather",
    title: "最讨厌的天气？",
    description: "你不能忍的天气，决定了长期体感舒适线。",
    weight: 1.2,
    options: [
      {
        id: "hated-weather-hot",
        label: "暴晒",
        vector: { climateWarm: 2, naturePreference: 6, familyFriendly: 6, paceFast: 5 },
      },
      {
        id: "hated-weather-rain",
        label: "阴雨连绵",
        vector: { climateWarm: 5, transitPublic: 7, familyFriendly: 7, paceFast: 6 },
      },
      {
        id: "hated-weather-dry",
        label: "干燥起皮",
        vector: { climateWarm: 8, naturePreference: 6, familyFriendly: 7, paceFast: 5 },
      },
      {
        id: "hated-weather-windy",
        label: "妖风阵阵",
        vector: { climateWarm: 7, familyFriendly: 7, naturePreference: 6, paceFast: 4 },
      },
    ],
  },
  {
    id: "weekend-two-days",
    title: "周末两天怎么过？",
    description: "周末安排最能看出你想住的城市类型。",
    weight: 1.15,
    options: [
      {
        id: "weekend-mall-exhibition",
        label: "商场/看展",
        vector: { paceFast: 8, foodDiversity: 8, careerTech: 7, transitPublic: 8 },
      },
      {
        id: "weekend-park-hike",
        label: "公园/爬山",
        vector: { naturePreference: 10, familyFriendly: 8, paceFast: 4, climateWarm: 7 },
      },
      {
        id: "weekend-dining-mahjong",
        label: "聚餐/麻将",
        vector: { familyFriendly: 9, foodDiversity: 8, paceFast: 5, budgetHigh: 5 },
      },
      {
        id: "weekend-home-lie",
        label: "宅家躺平",
        vector: { familyFriendly: 8, paceFast: 3, naturePreference: 6, budgetHigh: 4 },
      },
    ],
  },
  {
    id: "queue-for-food",
    title: "哪怕排队也要吃的店？",
    description: "吃这件事是城市幸福感的重要来源。",
    weight: 1.05,
    options: [
      {
        id: "queue-michelin",
        label: "米其林/网红店",
        vector: { foodDiversity: 10, budgetHigh: 9, paceFast: 8, careerTech: 7 },
      },
      {
        id: "queue-old-local",
        label: "老字号苍蝇馆子",
        vector: { foodDiversity: 9, familyFriendly: 7, budgetHigh: 6, paceFast: 6 },
      },
      {
        id: "queue-hidden-stall",
        label: "只有本地人知道的摊",
        vector: { foodDiversity: 8, familyFriendly: 8, budgetHigh: 5, paceFast: 5 },
      },
      {
        id: "queue-never",
        label: "绝不排队",
        vector: { paceFast: 4, familyFriendly: 7, budgetHigh: 6, foodDiversity: 4 },
      },
    ],
  },
  {
    id: "night-owl",
    title: "你是“夜猫子”吗？",
    description: "夜间活跃度会影响你对城市夜生活的需求。",
    weight: 1.0,
    options: [
      {
        id: "night-owl-yes",
        label: "是，越夜越嗨",
        vector: { paceFast: 9, foodDiversity: 8, careerTech: 8, transitPublic: 7 },
      },
      {
        id: "night-owl-sometimes",
        label: "偶尔熬夜",
        vector: { paceFast: 6, familyFriendly: 7, foodDiversity: 7, careerTech: 6 },
      },
      {
        id: "night-owl-no",
        label: "不是，早睡早起",
        vector: { familyFriendly: 9, paceFast: 3, naturePreference: 7, climateWarm: 6 },
      },
      {
        id: "night-owl-mood",
        label: "看心情",
        vector: { paceFast: 5, familyFriendly: 6, foodDiversity: 6, naturePreference: 6 },
      },
    ],
  },
  {
    id: "commute-duration",
    title: "理想的通勤时长？",
    description: "通勤容忍度决定你对城市密度与距离的接受度。",
    weight: 1.25,
    options: [
      {
        id: "commute-15",
        label: "15分钟内",
        vector: { transitPublic: 9, paceFast: 8, budgetHigh: 9, careerTech: 8 },
      },
      {
        id: "commute-30",
        label: "30分钟左右",
        vector: { transitPublic: 8, paceFast: 7, familyFriendly: 7, budgetHigh: 7 },
      },
      {
        id: "commute-60",
        label: "1小时也能忍",
        vector: { transitPublic: 8, budgetHigh: 5, paceFast: 5, familyFriendly: 6 },
      },
      {
        id: "commute-no-office",
        label: "只要不用去公司就行",
        vector: { naturePreference: 9, paceFast: 2, careerTech: 4, climateWarm: 7 },
      },
    ],
  },
  {
    id: "spicy-preference",
    title: "对于“吃辣”？",
    description: "饮食口味会影响你和城市风味文化的匹配度。",
    weight: 1.0,
    options: [
      {
        id: "spicy-love",
        label: "无辣不欢",
        vector: { foodDiversity: 10, paceFast: 7, climateWarm: 6, familyFriendly: 6 },
      },
      {
        id: "spicy-mild",
        label: "微辣点缀",
        vector: { foodDiversity: 8, familyFriendly: 7, paceFast: 6, climateWarm: 6 },
      },
      {
        id: "spicy-none",
        label: "一点不行",
        vector: { familyFriendly: 8, foodDiversity: 5, climateWarm: 6, paceFast: 4 },
      },
      {
        id: "spicy-sweet",
        label: "甜口才是王道",
        vector: { foodDiversity: 7, familyFriendly: 8, paceFast: 4, climateWarm: 7 },
      },
    ],
  },
  {
    id: "annoying-sound",
    title: "听到哪种声音最烦？",
    description: "噪音偏好反映你对城市密度和活跃度的接受程度。",
    weight: 1.05,
    options: [
      {
        id: "annoying-horn",
        label: "汽车喇叭声",
        vector: { naturePreference: 8, familyFriendly: 8, paceFast: 3, transitPublic: 5 },
      },
      {
        id: "annoying-square-dance",
        label: "广场舞音乐",
        vector: { familyFriendly: 6, paceFast: 6, naturePreference: 6, foodDiversity: 6 },
      },
      {
        id: "annoying-drill",
        label: "装修电钻声",
        vector: { familyFriendly: 8, paceFast: 4, naturePreference: 7, budgetHigh: 6 },
      },
      {
        id: "annoying-too-quiet",
        label: "太安静了反而慌",
        vector: { paceFast: 8, foodDiversity: 8, careerTech: 7, transitPublic: 7 },
      },
    ],
  },
  {
    id: "convenience-store",
    title: "必须要有便利店吗？",
    description: "便利性需求能体现你对城市服务密度的偏好。",
    weight: 1.1,
    options: [
      {
        id: "convenience-downstairs",
        label: "必须，要在楼下",
        vector: { paceFast: 9, transitPublic: 8, budgetHigh: 8, foodDiversity: 7 },
      },
      {
        id: "convenience-5min",
        label: "步行5分钟内",
        vector: { paceFast: 7, transitPublic: 7, familyFriendly: 7, budgetHigh: 6 },
      },
      {
        id: "convenience-supermarket",
        label: "有个超市就行",
        vector: { familyFriendly: 8, paceFast: 4, budgetHigh: 5, naturePreference: 6 },
      },
      {
        id: "convenience-online",
        label: "无所谓，网购万岁",
        vector: { paceFast: 3, naturePreference: 7, familyFriendly: 6, transitPublic: 4 },
      },
    ],
  },
  {
    id: "summer-heat",
    title: "夏天能接受多热？",
    description: "耐热程度是城市气候匹配的重要信号。",
    weight: 1.2,
    options: [
      {
        id: "summer-ac-all-day",
        label: "空调必须24小时开",
        vector: { climateWarm: 3, budgetHigh: 7, familyFriendly: 7, paceFast: 6 },
      },
      {
        id: "summer-shade",
        label: "有树荫就行",
        vector: { climateWarm: 6, naturePreference: 9, familyFriendly: 7, paceFast: 5 },
      },
      {
        id: "summer-sweat-ok",
        label: "出点汗挺好",
        vector: { climateWarm: 8, naturePreference: 7, paceFast: 6, familyFriendly: 6 },
      },
      {
        id: "summer-calm-mind",
        label: "心静自然凉",
        vector: { climateWarm: 9, paceFast: 3, naturePreference: 8, familyFriendly: 7 },
      },
    ],
  },
  {
    id: "winter-cold",
    title: "冬天能接受多冷？",
    description: "耐寒程度会影响你对不同城市冬季体感的适配度。",
    weight: 1.2,
    options: [
      {
        id: "winter-heating-required",
        label: "必须要有暖气",
        vector: { climateWarm: 8, familyFriendly: 8, budgetHigh: 7, paceFast: 5 },
      },
      {
        id: "winter-humid-cold-no",
        label: "湿冷绝对不行",
        vector: { climateWarm: 8, familyFriendly: 7, naturePreference: 6, paceFast: 5 },
      },
      {
        id: "winter-no-snow-ok",
        label: "只要不下雪就行",
        vector: { climateWarm: 6, familyFriendly: 7, paceFast: 5, budgetHigh: 6 },
      },
      {
        id: "winter-like-snow",
        label: "喜欢看雪，不怕冷",
        vector: { climateWarm: 2, naturePreference: 9, familyFriendly: 7, paceFast: 4 },
      },
    ],
  },
  {
    id: "neighbor-relationship",
    title: "理想的邻居关系？",
    description: "社区关系偏好会影响你对居住氛围的选择。",
    weight: 1.1,
    options: [
      {
        id: "neighbor-no-disturb",
        label: "互不打扰",
        vector: { paceFast: 7, familyFriendly: 5, budgetHigh: 7, naturePreference: 5 },
      },
      {
        id: "neighbor-nod",
        label: "见面点个头",
        vector: { familyFriendly: 7, paceFast: 6, budgetHigh: 6, transitPublic: 6 },
      },
      {
        id: "neighbor-borrow",
        label: "偶尔借个酱油",
        vector: { familyFriendly: 9, paceFast: 5, naturePreference: 7, budgetHigh: 5 },
      },
      {
        id: "neighbor-visit-often",
        label: "经常串门聊天",
        vector: { familyFriendly: 10, paceFast: 4, foodDiversity: 6, naturePreference: 7 },
      },
    ],
  },
  {
    id: "transport-first",
    title: "出门首选交通工具？",
    description: "日常交通方式会显著影响城市匹配。",
    weight: 1.25,
    options: [
      {
        id: "transport-metro-bus",
        label: "地铁/公交",
        vector: { transitPublic: 10, paceFast: 8, careerTech: 7, budgetHigh: 6 },
      },
      {
        id: "transport-car-taxi",
        label: "打车/开车",
        vector: { budgetHigh: 8, paceFast: 7, familyFriendly: 7, transitPublic: 4 },
      },
      {
        id: "transport-bike",
        label: "电动车/自行车",
        vector: { naturePreference: 8, paceFast: 6, budgetHigh: 5, familyFriendly: 7 },
      },
      {
        id: "transport-walk",
        label: "走路",
        vector: { naturePreference: 9, paceFast: 4, familyFriendly: 8, transitPublic: 5 },
      },
    ],
  },
  {
    id: "sea-obsession",
    title: "对“看海”有执念吗？",
    description: "对水域景观的偏好会影响城市地理选择。",
    weight: 1.0,
    options: [
      {
        id: "sea-must",
        label: "必须要有水",
        vector: { naturePreference: 10, climateWarm: 8, familyFriendly: 7, paceFast: 5 },
      },
      {
        id: "sea-sometimes",
        label: "偶尔看看就行",
        vector: { naturePreference: 7, climateWarm: 7, familyFriendly: 7, paceFast: 6 },
      },
      {
        id: "sea-river-ok",
        label: "河边也行",
        vector: { naturePreference: 6, climateWarm: 6, familyFriendly: 7, paceFast: 6 },
      },
      {
        id: "sea-no-feel",
        label: "没感觉",
        vector: { naturePreference: 3, paceFast: 7, careerTech: 7, transitPublic: 7 },
      },
    ],
  },
  {
    id: "pedestrian-style",
    title: "街上的行人最好是？",
    description: "你喜欢的街道人群，决定了城市氛围偏好。",
    weight: 1.0,
    options: [
      {
        id: "pedestrian-fashion",
        label: "穿搭时尚",
        vector: { paceFast: 8, careerTech: 8, foodDiversity: 8, budgetHigh: 8 },
      },
      {
        id: "pedestrian-tourists",
        label: "游客很多",
        vector: { foodDiversity: 8, paceFast: 7, transitPublic: 7, careerTech: 6 },
      },
      {
        id: "pedestrian-neighborhood",
        label: "大爷大妈多",
        vector: { familyFriendly: 9, paceFast: 4, budgetHigh: 5, naturePreference: 6 },
      },
      {
        id: "pedestrian-empty",
        label: "最好没人",
        vector: { naturePreference: 8, paceFast: 2, familyFriendly: 7, climateWarm: 6 },
      },
    ],
  },
  {
    id: "eat-fat-happy",
    title: "哪怕胖三斤也要吃？",
    description: "吃这件事是你城市满意度的重要权重。",
    weight: 1.0,
    options: [
      {
        id: "eat-dessert",
        label: "甜品/蛋糕",
        vector: { foodDiversity: 8, paceFast: 6, budgetHigh: 7, familyFriendly: 6 },
      },
      {
        id: "eat-hotpot",
        label: "火锅/烧烤",
        vector: { foodDiversity: 10, paceFast: 7, familyFriendly: 7, climateWarm: 6 },
      },
      {
        id: "eat-carb",
        label: "面食/碳水",
        vector: { foodDiversity: 8, familyFriendly: 8, budgetHigh: 5, paceFast: 5 },
      },
      {
        id: "eat-seafood-meat",
        label: "海鲜/大肉",
        vector: { foodDiversity: 9, climateWarm: 8, budgetHigh: 7, familyFriendly: 7 },
      },
    ],
  },
  {
    id: "bad-mood-place",
    title: "心情不好去哪里？",
    description: "情绪恢复方式反映你对城市治愈场景的需求。",
    weight: 1.1,
    options: [
      {
        id: "bad-mood-bar",
        label: "酒吧买醉",
        vector: { paceFast: 9, foodDiversity: 8, careerTech: 7, transitPublic: 7 },
      },
      {
        id: "bad-mood-waterside",
        label: "江边/海边吹风",
        vector: { naturePreference: 10, climateWarm: 7, familyFriendly: 7, paceFast: 4 },
      },
      {
        id: "bad-mood-supermarket",
        label: "超市捏方便面",
        vector: { familyFriendly: 7, paceFast: 5, budgetHigh: 4, foodDiversity: 6 },
      },
      {
        id: "bad-mood-bed",
        label: "被窝里哭",
        vector: { familyFriendly: 6, paceFast: 2, naturePreference: 5, climateWarm: 6 },
      },
    ],
  },
  {
    id: "humidity-feeling",
    title: "对于“潮湿”的感觉？",
    description: "湿度接受度是气候匹配的关键条件。",
    weight: 1.2,
    options: [
      {
        id: "humidity-like",
        label: "皮肤好，喜欢",
        vector: { climateWarm: 8, familyFriendly: 7, naturePreference: 7, paceFast: 5 },
      },
      {
        id: "humidity-ok",
        label: "还可以接受",
        vector: { climateWarm: 6, familyFriendly: 7, paceFast: 6, naturePreference: 6 },
      },
      {
        id: "humidity-annoy",
        label: "衣服晒不干，烦",
        vector: { climateWarm: 4, familyFriendly: 6, paceFast: 6, budgetHigh: 6 },
      },
      {
        id: "humidity-no-way",
        label: "绝对不行，会风湿",
        vector: { climateWarm: 2, familyFriendly: 8, naturePreference: 6, paceFast: 4 },
      },
    ],
  },
  {
    id: "city-scale",
    title: "理想的城市规模？",
    description: "城市体量决定了机会密度和生活节奏。",
    weight: 1.3,
    options: [
      {
        id: "city-scale-mega",
        label: "超一线，巨无霸",
        vector: { paceFast: 10, careerTech: 10, budgetHigh: 10, transitPublic: 9 },
      },
      {
        id: "city-scale-capital",
        label: "省会级别，方便",
        vector: { paceFast: 7, careerTech: 8, transitPublic: 8, familyFriendly: 7 },
      },
      {
        id: "city-scale-small",
        label: "小城，安逸",
        vector: { familyFriendly: 9, paceFast: 3, budgetHigh: 4, naturePreference: 8 },
      },
      {
        id: "city-scale-village",
        label: "可以是村里",
        vector: { naturePreference: 10, familyFriendly: 8, paceFast: 1, budgetHigh: 2 },
      },
    ],
  },
  {
    id: "acceptable-drawback",
    title: "能接受的缺点？",
    description: "你能接受的代价，就是你真正看重的城市价值。",
    weight: 1.25,
    options: [
      {
        id: "drawback-expensive-house",
        label: "房价高",
        vector: { budgetHigh: 10, careerTech: 8, paceFast: 8, transitPublic: 8 },
      },
      {
        id: "drawback-traffic",
        label: "堵车",
        vector: { paceFast: 8, budgetHigh: 7, careerTech: 7, transitPublic: 6 },
      },
      {
        id: "drawback-messy",
        label: "脏乱差",
        vector: { budgetHigh: 3, paceFast: 6, careerTech: 5, familyFriendly: 4 },
      },
      {
        id: "drawback-low-salary",
        label: "工资低",
        vector: { familyFriendly: 8, naturePreference: 8, paceFast: 3, careerTech: 3 },
      },
    ],
  },
  {
    id: "four-seasons",
    title: "喜欢四季分明吗？",
    description: "季节偏好会直接影响长期体感和心情。",
    weight: 1.1,
    options: [
      {
        id: "four-seasons-must",
        label: "必须分明",
        vector: { climateWarm: 5, naturePreference: 8, familyFriendly: 7, paceFast: 5 },
      },
      {
        id: "four-seasons-spring",
        label: "喜欢永远是春天",
        vector: { climateWarm: 8, naturePreference: 8, familyFriendly: 8, paceFast: 5 },
      },
      {
        id: "four-seasons-summer",
        label: "喜欢永远是夏天",
        vector: { climateWarm: 10, naturePreference: 7, paceFast: 6, familyFriendly: 6 },
      },
      {
        id: "four-seasons-any",
        label: "无所谓",
        vector: { climateWarm: 6, paceFast: 6, familyFriendly: 6, careerTech: 6 },
      },
    ],
  },
  {
    id: "activity-try",
    title: "想尝试的活动？",
    description: "你想玩的活动类型决定了城市资源偏好。",
    weight: 1.0,
    options: [
      {
        id: "activity-surf-diving",
        label: "冲浪/潜水",
        vector: { naturePreference: 10, climateWarm: 9, paceFast: 6, familyFriendly: 6 },
      },
      {
        id: "activity-camping-hiking",
        label: "露营/徒步",
        vector: { naturePreference: 10, familyFriendly: 8, paceFast: 4, climateWarm: 7 },
      },
      {
        id: "activity-market-bargain",
        label: "逛早市/杀价",
        vector: { foodDiversity: 8, familyFriendly: 8, budgetHigh: 4, paceFast: 5 },
      },
      {
        id: "activity-opera-tea",
        label: "听戏/喝茶",
        vector: { familyFriendly: 8, paceFast: 3, foodDiversity: 7, naturePreference: 6 },
      },
    ],
  },
  {
    id: "dialect-attitude",
    title: "看到“方言”的态度？",
    description: "对本地语言文化的态度会影响落地融入感。",
    weight: 1.0,
    options: [
      {
        id: "dialect-annoyed",
        label: "听不懂很烦",
        vector: { paceFast: 8, careerTech: 8, familyFriendly: 4, foodDiversity: 5 },
      },
      {
        id: "dialect-interesting",
        label: "觉得很有趣",
        vector: { foodDiversity: 8, familyFriendly: 7, naturePreference: 6, paceFast: 6 },
      },
      {
        id: "dialect-learn",
        label: "努力学两句",
        vector: { familyFriendly: 9, foodDiversity: 8, naturePreference: 7, paceFast: 5 },
      },
      {
        id: "dialect-whatever",
        label: "无所谓",
        vector: { paceFast: 6, familyFriendly: 6, careerTech: 6, foodDiversity: 6 },
      },
    ],
  },
  {
    id: "money-attitude",
    title: "关于“赚钱”？",
    description: "你对赚钱的排序会影响城市选择优先级。",
    weight: 1.25,
    options: [
      {
        id: "money-first",
        label: "搞钱第一",
        vector: { careerTech: 10, paceFast: 9, budgetHigh: 9, transitPublic: 8 },
      },
      {
        id: "money-enough",
        label: "够花就行",
        vector: { familyFriendly: 8, paceFast: 5, budgetHigh: 5, naturePreference: 7 },
      },
      {
        id: "money-happy",
        label: "开心比钱重要",
        vector: { naturePreference: 8, familyFriendly: 9, paceFast: 3, careerTech: 4 },
      },
      {
        id: "money-random",
        label: "随缘",
        vector: { paceFast: 3, naturePreference: 7, familyFriendly: 7, careerTech: 3 },
      },
    ],
  },
  {
    id: "nightlife-demand",
    title: "对“夜生活”的要求？",
    description: "夜间需求能反映你对城市活力边界的期待。",
    weight: 1.1,
    options: [
      {
        id: "nightlife-bar",
        label: "凌晨3点得有酒",
        vector: { paceFast: 10, foodDiversity: 9, careerTech: 8, transitPublic: 7 },
      },
      {
        id: "nightlife-snack",
        label: "只有宵夜摊就行",
        vector: { foodDiversity: 8, paceFast: 7, familyFriendly: 6, budgetHigh: 5 },
      },
      {
        id: "nightlife-sleep-early",
        label: "晚上10点该睡了",
        vector: { familyFriendly: 9, paceFast: 3, naturePreference: 7, climateWarm: 6 },
      },
      {
        id: "nightlife-quiet-walk",
        label: "安静散步就好",
        vector: { naturePreference: 8, familyFriendly: 8, paceFast: 2, climateWarm: 6 },
      },
    ],
  },
  {
    id: "living-style",
    title: "如果可以，你想住？",
    description: "理想住房形态是城市偏好的直观表达。",
    weight: 1.2,
    options: [
      {
        id: "living-top-highrise",
        label: "摩天大楼顶层",
        vector: { paceFast: 9, careerTech: 9, budgetHigh: 10, transitPublic: 8 },
      },
      {
        id: "living-lane",
        label: "弄堂/胡同里",
        vector: { familyFriendly: 8, foodDiversity: 8, paceFast: 5, budgetHigh: 6 },
      },
      {
        id: "living-villa-flat",
        label: "别墅/大平层",
        vector: { budgetHigh: 9, familyFriendly: 9, naturePreference: 7, paceFast: 5 },
      },
      {
        id: "living-courtyard",
        label: "带院子的平房",
        vector: { naturePreference: 9, familyFriendly: 9, paceFast: 3, climateWarm: 7 },
      },
    ],
  },
  {
    id: "city-meaning",
    title: "最后，城市给你的是？",
    description: "这道题用于确认你的最终城市核心诉求。",
    weight: 1.35,
    options: [
      {
        id: "city-meaning-opportunity",
        label: "机会",
        vector: { careerTech: 10, paceFast: 8, budgetHigh: 8, transitPublic: 8 },
      },
      {
        id: "city-meaning-enjoyment",
        label: "享受",
        vector: { foodDiversity: 9, paceFast: 6, climateWarm: 7, budgetHigh: 7 },
      },
      {
        id: "city-meaning-company",
        label: "陪伴",
        vector: { familyFriendly: 10, paceFast: 4, naturePreference: 7, budgetHigh: 6 },
      },
      {
        id: "city-meaning-freedom",
        label: "自由",
        vector: { naturePreference: 9, paceFast: 3, climateWarm: 7, familyFriendly: 7 },
      },
    ],
  },
];
