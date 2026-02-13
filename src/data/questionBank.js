/**
 * 场景化问卷题库：
 * 设计原则：
 * 1. 以“日常生活选择”替代直接问偏好，降低用户答题负担。
 * 2. 通过 option.vector 映射到底层偏好维度，实现可计算的城市匹配。
 * 3. 每题设置 weight，控制该场景对最终结果的影响强度。
 */
export const QUESTION_BANK = [
  {
    id: "weekend-plan",
    title: "周末突然空下来半天，你最可能怎么安排？",
    description: "这个选择能反映你对城市资源密度与生活松弛度的偏好。",
    weight: 1.2,
    options: [
      {
        id: "weekend-citywalk",
        label: "去新开的街区 citywalk，顺便打卡两家店",
        vector: { paceFast: 8, foodDiversity: 9, transitPublic: 8, careerTech: 7 },
      },
      {
        id: "weekend-outdoor",
        label: "去公园或近郊徒步，尽量待在自然里",
        vector: { naturePreference: 10, paceFast: 3, climateWarm: 7, familyFriendly: 7 },
      },
      {
        id: "weekend-home",
        label: "在家做饭看书，恢复精力",
        vector: { familyFriendly: 8, budgetHigh: 4, paceFast: 3, climateWarm: 6 },
      },
      {
        id: "weekend-friends",
        label: "约朋友喝咖啡聊天，不追求太满行程",
        vector: { familyFriendly: 7, paceFast: 5, foodDiversity: 7, transitPublic: 7 },
      },
    ],
  },
  {
    id: "morning-commute",
    title: "工作日早上出门时，你最在意哪件事？",
    description: "通勤偏好会影响你和城市交通结构的契合度。",
    weight: 1.1,
    options: [
      {
        id: "commute-efficient",
        label: "通勤可预期，换乘少、准时到",
        vector: { transitPublic: 9, paceFast: 8, careerTech: 7 },
      },
      {
        id: "commute-short",
        label: "最好 20 分钟内，步行/骑行也能搞定",
        vector: { transitPublic: 8, naturePreference: 8, paceFast: 5 },
      },
      {
        id: "commute-drive",
        label: "更习惯自驾，路况和停车友好更重要",
        vector: { transitPublic: 4, budgetHigh: 7, paceFast: 6, familyFriendly: 7 },
      },
      {
        id: "commute-flex",
        label: "时间弹性大，不想被固定通勤绑定",
        vector: { paceFast: 3, naturePreference: 9, climateWarm: 6, careerTech: 5 },
      },
    ],
  },
  {
    id: "rent-priority",
    title: "租房/买房看房时，你第一眼最看重什么？",
    description: "这个问题会显著影响居住成本与城市形态匹配。",
    weight: 1.3,
    options: [
      {
        id: "rent-location",
        label: "离工作机会和核心商圈近，效率优先",
        vector: { careerTech: 10, paceFast: 8, budgetHigh: 9, transitPublic: 8 },
      },
      {
        id: "rent-value",
        label: "面积和性价比，长期住得舒服",
        vector: { budgetHigh: 4, familyFriendly: 9, paceFast: 4, naturePreference: 6 },
      },
      {
        id: "rent-community",
        label: "社区安静、配套稳定、生活省心",
        vector: { familyFriendly: 10, paceFast: 4, transitPublic: 7, climateWarm: 6 },
      },
      {
        id: "rent-view",
        label: "窗外最好有绿地或水景，环境感受最重要",
        vector: { naturePreference: 10, climateWarm: 7, familyFriendly: 8, paceFast: 3 },
      },
    ],
  },
  {
    id: "dinner-style",
    title: "平日下班后，你更常见的晚餐状态是？",
    description: "饮食与夜生活偏好能反映你对城市活力的需求。",
    weight: 1.0,
    options: [
      {
        id: "dinner-explore",
        label: "经常探索新店，愿意为体验买单",
        vector: { foodDiversity: 10, paceFast: 7, budgetHigh: 8 },
      },
      {
        id: "dinner-stable",
        label: "固定几家熟悉的店，稳定最重要",
        vector: { familyFriendly: 8, foodDiversity: 6, paceFast: 5, budgetHigh: 5 },
      },
      {
        id: "dinner-homecook",
        label: "以自己做饭为主，偶尔外卖",
        vector: { familyFriendly: 8, budgetHigh: 4, paceFast: 4, climateWarm: 6 },
      },
      {
        id: "dinner-light",
        label: "轻食加运动，保持规律生活",
        vector: { naturePreference: 8, paceFast: 6, climateWarm: 6, familyFriendly: 7 },
      },
    ],
  },
  {
    id: "social-style",
    title: "朋友临时约你晚上出门，你通常会？",
    description: "社交响应方式会影响对城市节奏和文化密度的判断。",
    weight: 1.1,
    options: [
      {
        id: "social-go",
        label: "说走就走，活动越丰富越好",
        vector: { paceFast: 9, foodDiversity: 8, transitPublic: 7, careerTech: 8 },
      },
      {
        id: "social-plan",
        label: "看地点和通勤成本，再决定是否出门",
        vector: { transitPublic: 8, paceFast: 6, familyFriendly: 7 },
      },
      {
        id: "social-daytime",
        label: "更偏好周末白天见，晚上想留给自己",
        vector: { familyFriendly: 8, paceFast: 4, naturePreference: 7 },
      },
      {
        id: "social-small",
        label: "小范围安静聚会，比热闹更重要",
        vector: { naturePreference: 7, familyFriendly: 8, paceFast: 3, climateWarm: 6 },
      },
    ],
  },
  {
    id: "weather-day",
    title: "遇到连续几天阴雨或闷热，你最在意什么？",
    description: "日常天气耐受度决定长期体感和心情稳定性。",
    weight: 1.05,
    options: [
      {
        id: "weather-commute",
        label: "通勤别失控，效率不能掉太多",
        vector: { transitPublic: 9, paceFast: 8, climateWarm: 6 },
      },
      {
        id: "weather-indoor",
        label: "室内舒适和空气质量要稳定",
        vector: { familyFriendly: 8, climateWarm: 7, budgetHigh: 6 },
      },
      {
        id: "weather-outdoor",
        label: "希望天气不影响户外活动安排",
        vector: { naturePreference: 9, climateWarm: 8, paceFast: 5 },
      },
      {
        id: "weather-rhythm",
        label: "只要生活节奏不被打断就行",
        vector: { paceFast: 8, climateWarm: 6, careerTech: 7 },
      },
    ],
  },
  {
    id: "career-3years",
    title: "未来 3 年，你最希望哪方面变化更明显？",
    description: "中期目标能帮助判断城市发展机会与生活承载力。",
    weight: 1.35,
    options: [
      {
        id: "career-jump",
        label: "职业跃迁，进入更大平台与更强团队",
        vector: { careerTech: 10, paceFast: 8, budgetHigh: 8, transitPublic: 8 },
      },
      {
        id: "career-steady",
        label: "工作稳定增长，生活质量稳步提升",
        vector: { familyFriendly: 9, budgetHigh: 6, paceFast: 5, naturePreference: 6 },
      },
      {
        id: "career-flex",
        label: "时间更自主，能远程或自由安排工作",
        vector: { naturePreference: 9, paceFast: 3, careerTech: 5, climateWarm: 7 },
      },
      {
        id: "career-diverse",
        label: "行业与文化都多元，视野持续打开",
        vector: { foodDiversity: 9, transitPublic: 8, careerTech: 8, paceFast: 7 },
      },
    ],
  },
  {
    id: "end-of-day",
    title: "理想的一天结束时，你最想感受到什么？",
    description: "终局感受通常最能代表你真正的长期居住诉求。",
    weight: 1.25,
    options: [
      {
        id: "day-achievement",
        label: "高效充实，今天推进了很多关键事",
        vector: { paceFast: 9, careerTech: 9, transitPublic: 7 },
      },
      {
        id: "day-relax",
        label: "内心松弛，生活和工作都不过载",
        vector: { naturePreference: 9, familyFriendly: 8, paceFast: 3, climateWarm: 7 },
      },
      {
        id: "day-balance",
        label: "效率和生活感并存，状态长期可持续",
        vector: {
          paceFast: 7,
          familyFriendly: 8,
          naturePreference: 7,
          careerTech: 7,
          budgetHigh: 6,
        },
      },
      {
        id: "day-family",
        label: "和家人/伴侣有高质量相处时间",
        vector: { familyFriendly: 10, paceFast: 4, budgetHigh: 6, climateWarm: 6 },
      },
    ],
  },
];
