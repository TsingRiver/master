/**
 * 类型学 V2.0 柔性干预基础增益值：
 * 关键逻辑：增益保持轻量，仅用于打破边缘同分，不强行扭转用户真实作答。
 */
export const TYPEOLOGY_SOFT_INTERVENTION_BASE_BUFF = 1.5;

/**
 * 类型学柔性干预规则表：
 * 关键逻辑：
 * 1. 仅在已有 MBTI 基石结果时生效。
 * 2. 每条规则只给高度相关的 outcome 做轻量加权。
 * 3. `matchMode=all` 时要求 MBTI 同时包含全部指定字母；默认命中任一字母即可。
 */
export const TYPEOLOGY_SOFT_INTERVENTION_RULES = Object.freeze({
  "social-persona": Object.freeze([
    Object.freeze({
      id: "social-introvert-buff",
      mbtiLetters: Object.freeze(["I"]),
      outcomeKeys: Object.freeze(["s-independent", "s-analyst", "s-stability"]),
      buffValue: 1.4,
      reason: "基石 MBTI 呈现内倾能量分配，对低噪音、深度处理型社会角色做轻量校准。",
    }),
    Object.freeze({
      id: "social-extravert-buff",
      mbtiLetters: Object.freeze(["E"]),
      outcomeKeys: Object.freeze(["s-social", "s-lead"]),
      buffValue: 1.4,
      reason: "基石 MBTI 呈现外倾能量分配，对高互动、外部驱动型社会角色做轻量校准。",
    }),
    Object.freeze({
      id: "social-thinking-buff",
      mbtiLetters: Object.freeze(["T"]),
      outcomeKeys: Object.freeze(["s-analyst", "s-principle"]),
      buffValue: 0.9,
      reason: "基石 MBTI 更偏理性判断，对结构化与原则型社会角色做轻量校准。",
    }),
    Object.freeze({
      id: "social-feeling-buff",
      mbtiLetters: Object.freeze(["F"]),
      outcomeKeys: Object.freeze(["s-empathy", "s-social"]),
      buffValue: 0.9,
      reason: "基石 MBTI 更偏情感判断，对共情与关系型社会角色做轻量校准。",
    }),
  ]),
  disc: Object.freeze([
    Object.freeze({
      id: "disc-introvert-buff",
      mbtiLetters: Object.freeze(["I"]),
      outcomeKeys: Object.freeze(["s", "c"]),
      buffValue: TYPEOLOGY_SOFT_INTERVENTION_BASE_BUFF,
      reason: "基石 MBTI 呈现内倾能量分配，对 DISC 的稳健/谨慎维度做轻量校准。",
    }),
    Object.freeze({
      id: "disc-extravert-buff",
      mbtiLetters: Object.freeze(["E"]),
      outcomeKeys: Object.freeze(["d", "i"]),
      buffValue: TYPEOLOGY_SOFT_INTERVENTION_BASE_BUFF,
      reason: "基石 MBTI 呈现外倾能量分配，对 DISC 的支配/影响维度做轻量校准。",
    }),
    Object.freeze({
      id: "disc-thinking-buff",
      mbtiLetters: Object.freeze(["T"]),
      outcomeKeys: Object.freeze(["d", "c"]),
      buffValue: 1.0,
      reason: "基石 MBTI 更偏理性判断，对 DISC 的目标/标准导向做轻量校准。",
    }),
    Object.freeze({
      id: "disc-feeling-buff",
      mbtiLetters: Object.freeze(["F"]),
      outcomeKeys: Object.freeze(["i", "s"]),
      buffValue: 1.0,
      reason: "基石 MBTI 更偏情感判断，对 DISC 的关系/支持导向做轻量校准。",
    }),
  ]),
  "attitude-psy": Object.freeze([
    Object.freeze({
      id: "attitude-thinking-buff",
      mbtiLetters: Object.freeze(["T"]),
      outcomeKeys: Object.freeze(["ap-l"]),
      buffValue: 1.2,
      reason: "基石 MBTI 更偏思考决策，对“逻辑优先”做轻量校准。",
    }),
    Object.freeze({
      id: "attitude-feeling-buff",
      mbtiLetters: Object.freeze(["F"]),
      outcomeKeys: Object.freeze(["ap-e"]),
      buffValue: 1.2,
      reason: "基石 MBTI 更偏情感决策，对“情感优先”做轻量校准。",
    }),
    Object.freeze({
      id: "attitude-judging-buff",
      mbtiLetters: Object.freeze(["J"]),
      outcomeKeys: Object.freeze(["ap-v"]),
      buffValue: 0.8,
      reason: "基石 MBTI 更偏收敛与定向，对“意志优先”做轻量校准。",
    }),
    Object.freeze({
      id: "attitude-perceiving-buff",
      mbtiLetters: Object.freeze(["P"]),
      outcomeKeys: Object.freeze(["ap-f"]),
      buffValue: 0.8,
      reason: "基石 MBTI 更偏开放与感知，对“体验优先”做轻量校准。",
    }),
  ]),
  "big-five": Object.freeze([
    Object.freeze({
      id: "bigfive-extravert-buff",
      mbtiLetters: Object.freeze(["E"]),
      outcomeKeys: Object.freeze(["bf-scoei", "bf-sco--", "bf-s--e-"]),
      buffValue: 1.1,
      reason: "基石 MBTI 呈现外倾能量分配，对外放型大五组合做轻量校准。",
    }),
    Object.freeze({
      id: "bigfive-introvert-buff",
      mbtiLetters: Object.freeze(["I"]),
      outcomeKeys: Object.freeze(["bf--oei", "bf--c-i", "bf-sc--i"]),
      buffValue: 1.1,
      reason: "基石 MBTI 呈现内倾能量分配，对内省型大五组合做轻量校准。",
    }),
    Object.freeze({
      id: "bigfive-judging-buff",
      mbtiLetters: Object.freeze(["J"]),
      outcomeKeys: Object.freeze(["bf-sco--", "bf-sc--i"]),
      buffValue: 0.8,
      reason: "基石 MBTI 更偏秩序与收敛，对高尽责组合做轻量校准。",
    }),
    Object.freeze({
      id: "bigfive-perceiving-buff",
      mbtiLetters: Object.freeze(["P"]),
      outcomeKeys: Object.freeze(["bf-scoei", "bf--oei"]),
      buffValue: 0.8,
      reason: "基石 MBTI 更偏开放与弹性，对高开放组合做轻量校准。",
    }),
  ]),
  holland: Object.freeze([
    Object.freeze({
      id: "holland-introvert-buff",
      mbtiLetters: Object.freeze(["I"]),
      outcomeKeys: Object.freeze(["h-i", "h-c"]),
      buffValue: 1.1,
      reason: "基石 MBTI 呈现内倾能量分配，对研究/常规型职业兴趣做轻量校准。",
    }),
    Object.freeze({
      id: "holland-extravert-buff",
      mbtiLetters: Object.freeze(["E"]),
      outcomeKeys: Object.freeze(["h-e", "h-s"]),
      buffValue: 1.1,
      reason: "基石 MBTI 呈现外倾能量分配，对企业/社会型职业兴趣做轻量校准。",
    }),
    Object.freeze({
      id: "holland-intuition-buff",
      mbtiLetters: Object.freeze(["N"]),
      outcomeKeys: Object.freeze(["h-i", "h-a"]),
      buffValue: 1.2,
      reason: "基石 MBTI 更偏抽象与可能性，对研究/艺术型职业兴趣做轻量校准。",
    }),
    Object.freeze({
      id: "holland-sensing-buff",
      mbtiLetters: Object.freeze(["S"]),
      outcomeKeys: Object.freeze(["h-r", "h-c"]),
      buffValue: 1.2,
      reason: "基石 MBTI 更偏现实与经验，对现实/常规型职业兴趣做轻量校准。",
    }),
    Object.freeze({
      id: "holland-thinking-buff",
      mbtiLetters: Object.freeze(["T"]),
      outcomeKeys: Object.freeze(["h-i", "h-c"]),
      buffValue: 0.9,
      reason: "基石 MBTI 更偏理性判断，对研究/常规型职业兴趣做轻量校准。",
    }),
    Object.freeze({
      id: "holland-feeling-buff",
      mbtiLetters: Object.freeze(["F"]),
      outcomeKeys: Object.freeze(["h-s", "h-a"]),
      buffValue: 0.9,
      reason: "基石 MBTI 更偏情感判断，对社会/艺术型职业兴趣做轻量校准。",
    }),
  ]),
});

/**
 * 类型学跨测评冲突/稀有标签规则：
 * 关键逻辑：系统将“显著反差”解释为稀有特质，而不是直接判定为误差。
 */
export const TYPEOLOGY_CROSS_VALIDATION_RULES = Object.freeze([
  Object.freeze({
    id: "rule_masked_danren",
    type: "rare",
    uiTag: "稀有组合 · 伪装淡人",
    conditions: Object.freeze([
      Object.freeze({
        testType: "mbti",
        field: "resultCode",
        value: Object.freeze(["INTP", "ISTP", "INTJ", "ISTJ", "INFJ"]),
      }),
      Object.freeze({
        testType: "social-persona",
        field: "resultKey",
        value: Object.freeze(["s-social", "s-lead"]),
      }),
    ]),
    insightText:
      "系统捕捉到极具张力的反差：你的内核更偏冷静、低耗能、重独立的“淡人”底色，但在关键社交舞台上，你又能切换出高浓度的表达与掌控力。这种按需切换能量面具的能力，是你很少见的优势。",
  }),
  Object.freeze({
    id: "rule_burning_ice",
    type: "rare",
    uiTag: "稀有组合 · 燃烧的冰",
    conditions: Object.freeze([
      Object.freeze({
        testType: "mbti",
        field: "resultCode",
        value: Object.freeze(["ENFJ", "ESFJ", "ENFP", "ESFP"]),
      }),
      Object.freeze({
        testType: "big-five",
        field: "resultKey",
        value: Object.freeze(["bf--oei", "bf--c-i"]),
      }),
    ]),
    insightText:
      "你的人格底色带着明显的外放感染力，但当前大五结果却显露出更强的向内回收与独处修复需求。这不是互相打架，而是说明你拥有“对外点亮场域、对内深度充电”的双模结构。",
  }),
  Object.freeze({
    id: "rule_cold_core_warm_heart",
    type: "rare",
    uiTag: "稀有组合 · 冷核柔心",
    conditions: Object.freeze([
      Object.freeze({
        testType: "mbti",
        field: "resultCode",
        value: Object.freeze(["INTJ", "ENTJ", "INTP", "ISTP", "ESTJ"]),
      }),
      Object.freeze({
        testType: "attitude-psy",
        field: "resultKey",
        value: Object.freeze(["ap-e"]),
      }),
    ]),
    insightText:
      "你的表层策略结构非常理性，像是在用清晰框架掌控世界；但态度心理又显示你在关键时刻会优先保护情感温度。这种“冷静外壳 + 柔软内核”的组合并不常见，也意味着你比同类人更懂得在关系里保留人味。",
  }),
  Object.freeze({
    id: "rule_strategic_empathy_core",
    type: "rare",
    uiTag: "稀有组合 · 战略型共情核",
    conditions: Object.freeze([
      Object.freeze({
        testType: "mbti",
        field: "resultCode",
        value: Object.freeze(["INTJ", "ENTJ", "INTP", "ISTJ"]),
      }),
      Object.freeze({
        testType: "jung-classic",
        field: "resultKey",
        value: Object.freeze(["j-fi", "j-fe"]),
      }),
    ]),
    insightText:
      "系统识别到一种容易被误读的少见结构：你在认知上偏战略、偏抽象、偏结构化，但荣格功能又把情感维度推到了前排。这更像“有边界的共情”，不是失去理性，而是让判断里保留价值和温度。",
  }),
  Object.freeze({
    id: "rule_ordered_rebel",
    type: "rare",
    uiTag: "稀有组合 · 秩序里的反叛",
    conditions: Object.freeze([
      Object.freeze({
        testType: "mbti",
        field: "resultCode",
        value: Object.freeze(["INTJ", "INFJ", "ENTJ", "ENFJ", "ISTJ", "ISFJ", "ESTJ", "ESFJ"]),
      }),
      Object.freeze({
        testType: "dnd-alignment",
        field: "resultKey",
        value: Object.freeze(["dnd-cg", "dnd-cn", "dnd-ce"]),
      }),
    ]),
    insightText:
      "你的底层仍然重视结构、节奏和长期秩序，但在价值站位上又保留了明显的反叛性。你不是无规则，而是只愿意服从自己认定为合理的规则，这种“选择性守序”会让你在变革场景里更有穿透力。",
  }),
  Object.freeze({
    id: "rule_quiet_commander",
    type: "rare",
    uiTag: "稀有组合 · 静默掌舵者",
    conditions: Object.freeze([
      Object.freeze({
        testType: "mbti",
        field: "resultCode",
        value: Object.freeze(["INTJ", "INFJ", "INTP", "ISTJ", "ISFJ", "ISTP"]),
      }),
      Object.freeze({
        testType: "disc",
        field: "resultKey",
        value: Object.freeze(["d"]),
      }),
    ]),
    insightText:
      "你的能量外显并不喧哗，但在真正进入任务和压力场景后，掌控欲与推进力会迅速上线。你更像“静默型主导者”，平时低调，关键时刻却会自然接过方向盘。",
  }),
]);
