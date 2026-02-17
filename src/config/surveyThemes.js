/**
 * 浪漫主题守门员默认配置：
 * 关键逻辑：从 analyzer 中下沉到配置层常量，避免首屏静态引入 romance 分析模块。
 */
const ROMANCE_DESTINY_GATE_DEFAULTS = {
  gateQuestionNumber: 13,
  thresholdPercent: 80,
};

/**
 * 统一结果结构说明：
 * 1. 所有主题最终都映射到该结构，页面组件只做通用渲染。
 * 2. 这样新增主题只需新增配置，不需要复制页面代码。
 */
export const UNIFIED_RESULT_TEMPLATE = {
  source: "deep",
  prefixLabel: "",
  scoreLabel: "",
  scoreSuffix: "%",
  main: { name: "", score: 0 },
  heroArtwork: null,
  highlightCard: { title: "", content: "" },
  insight: "",
  easterEggText: "",
  tagChips: [],
  distributionChart: { title: "", items: [] },
  typeCard: { title: "", items: [] },
  topThreeTitle: "",
  topThree: [],
  detailSections: [],
  summaryTitle: "",
  summaryLines: [],
  restartButtonText: "重新测试",
};

/**
 * 创建标准化结果对象。
 * @param {object} payload 渲染数据。
 * @param {"deep"|"local"} payload.source 结果来源。
 * @param {string} payload.prefixLabel 主结果前缀文案。
 * @param {string} payload.scoreLabel 分值文案。
 * @param {string} [payload.scoreSuffix="%"] 主结果分值后缀。
 * @param {{ name: string, score: number }} payload.main 主结果对象。
 * @param {{ url: string, alt: string, caption?: string } | null} [payload.heroArtwork] 主视觉插画（可选）。
 * @param {{ title: string, content: string }} payload.highlightCard 高亮卡片。
 * @param {string} payload.insight 解释文案。
 * @param {string} [payload.easterEggText] 彩蛋文案（可选）。
 * @param {{ title: string, items: Array<{ label: string, value: string }> }} [payload.typeCard] 类型学卡片。
 * @param {string} payload.topThreeTitle Top3 标题。
 * @param {Array<{ name: string, score: number }>} payload.topThree Top3 列表。
 * @param {Array<{ title: string, items: Array<string> }>} payload.detailSections 详情分组。
 * @param {string} payload.summaryTitle 摘要标题。
 * @param {Array<string>} payload.summaryLines 摘要内容。
 * @param {string} payload.restartButtonText 重测按钮文案。
 * @returns {object} 统一结果对象。
 */
function createUnifiedResult(payload) {
  return {
    ...UNIFIED_RESULT_TEMPLATE,
    ...payload,
  };
}

/**
 * 城市主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ answerSummary: Array<object>, summaryLines: Array<string>, preferenceVector: object, candidateCities: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildCityDeepPayload(localResult) {
  return {
    answerSummary: localResult.answerSummary,
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    // 关键逻辑：仅传必要字段，降低请求体体积和接口延迟。
    candidateCities: localResult.candidateCities ?? [],
    localTopThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
      traits: item.traits,
    })),
  };
}

/**
 * 城市主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildCityDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "最终推荐城市",
    scoreLabel: "综合匹配度",
    main: deepResult.topCity,
    highlightCard: {
      title: "城市生活建议",
      content: deepResult.cityLifeAdvice,
    },
    insight: deepResult.insight,
    topThreeTitle: "Top 3 匹配城市",
    topThree: deepResult.topThree,
    detailSections: [
      {
        title: "匹配标签",
        items: ["生活习惯映射", "结构化偏好拟合", "语义化结论生成"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测评",
  });
}

/**
 * 城市主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildCityLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "最终推荐城市",
    scoreLabel: "综合匹配度",
    main: { name: localResult.topCity.name, score: localResult.topCity.score },
    highlightCard: {
      title: "城市生活建议",
      content: "建议先在通勤半径内试住 1-3 个月，再决定长期定居。",
    },
    insight: localResult.localInsight,
    topThreeTitle: "Top 3 匹配城市",
    topThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
    })),
    detailSections: [
      {
        title: "匹配标签",
        items: ["生活习惯映射", "结构化偏好拟合", "规则模型兜底"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测评",
  });
}

/**
 * 转运关键词主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, preferenceVector: object, keywordCandidates: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildFortuneDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    keywordCandidates: localResult.scoredKeywords.map((item) => ({
      keyword: item.keyword,
      meaning: item.meaning,
      profile: item.profile,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      keyword: item.keyword,
      score: item.score,
      meaning: item.meaning,
    })),
  };
}

/**
 * 转运关键词主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildFortuneDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的 2026 主关键词",
    scoreLabel: "关键词匹配度",
    main: deepResult.mainKeyword,
    highlightCard: {
      title: "年度主题",
      content: deepResult.annualTheme,
    },
    insight: deepResult.insight,
    topThreeTitle: "关键词 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "机会动作", items: deepResult.opportunityActions },
      { title: "避坑信号", items: deepResult.avoidSignals },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 转运关键词主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildFortuneLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的 2026 主关键词",
    scoreLabel: "关键词匹配度",
    main: {
      name: localResult.topKeyword.keyword,
      score: localResult.topKeyword.score,
    },
    highlightCard: {
      title: "年度主题",
      content: "先稳住节奏，再把优势动作做成连续复利。",
    },
    insight: localResult.localNarrative,
    topThreeTitle: "关键词 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.keyword,
      score: item.score,
    })),
    detailSections: [
      {
        title: "机会动作",
        items: [
          "把本周最关键事项压缩为 3 件，并设完成标准。",
          "把一次尝试动作提前到今天执行，避免长期准备不落地。",
          "每周固定一次复盘，记录有效策略并持续迭代。",
        ],
      },
      {
        title: "避坑信号",
        items: ["目标频繁切换", "连续两周没有明确推进结果"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 古代身份主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, categoryCounts: object, lineCounts: object, mainIdentity: object, topThree: Array<object>, growthActions: Array<string>, avoidSignals: Array<string>, dominantCategoryLabel: string, dominantLineLabel: string }} 深度分析负载。
 */
function buildAncientDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    categoryCounts: localResult.categoryCounts,
    lineCounts: localResult.lineCounts,
    mainIdentity: {
      name: localResult.topIdentity.name,
      score: localResult.topIdentity.score,
      slogan: localResult.topIdentity.slogan,
      coreTag: localResult.topIdentity.coreTag,
      summary: localResult.topIdentity.summary,
    },
    topThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
    })),
    growthActions: localResult.growthActions,
    avoidSignals: localResult.avoidSignals,
    dominantCategoryLabel: localResult.dominantCategoryLabel,
    dominantLineLabel: localResult.dominantLineLabel,
  };
}

/**
 * 古代身份主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildAncientDeepUnifiedResult(deepResult, localResult) {
  const identityModules = localResult.identityModules ?? {};
  const traitProfiles = Array.isArray(identityModules.traitProfiles)
    ? identityModules.traitProfiles
    : [];
  const mergedTagChips = Array.from(
    new Set([
      ...traitProfiles.map((item) => item.keyword),
      ...(deepResult.narrativeTags ?? []),
    ]),
  )
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 5);

  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的古代身份",
    scoreLabel: "身份匹配度",
    main: {
      name: deepResult.mainIdentity.name,
      score: deepResult.mainIdentity.score,
    },
    heroArtwork: localResult.topIdentity.artwork,
    highlightCard: {
      title: "专属称号",
      content: identityModules.honorTitle ?? localResult.topIdentity.slogan,
    },
    insight:
      identityModules.personaLine ??
      localResult.localNarrative ??
      deepResult.insight,
    tagChips: mergedTagChips,
    typeCard: {
      title: "性格画像",
      items: traitProfiles.map((item) => ({
        value: item.keyword,
        label: item.note,
      })),
    },
    topThreeTitle: "身份 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      {
        title: "专属金句 / 台词",
        items: [
          ...(identityModules.quoteLines ?? []),
          deepResult.identitySeal,
        ]
          .map((item) => String(item ?? "").trim())
          .filter(Boolean)
          .slice(0, 3),
      },
      {
        title: "适配的古代职业 / 场景",
        items: [
          `适配职业：${(identityModules.ancientJobs ?? []).join("、")}`,
          `适配场景：${(identityModules.ancientScenes ?? []).join("、")}`,
        ],
      },
      {
        title: "匹配的现代职业 / 性格",
        items: [
          `现代职业：${(identityModules.modernJobs ?? []).join("、")}`,
          `性格映射：${(identityModules.modernTraits ?? []).join("、")}`,
        ],
      },
      {
        title: "社交互动钩子",
        items: identityModules.socialHookLines ?? [],
      },
      {
        title: "AI 深层解读",
        items: [deepResult.insight, ...(deepResult.growthActions ?? []), ...(deepResult.avoidSignals ?? [])]
          .map((item) => String(item ?? "").trim())
          .filter(Boolean)
          .slice(0, 3),
      },
    ],
    summaryTitle: "答卷回放",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 古代身份主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildAncientLocalUnifiedResult(localResult) {
  const identityModules = localResult.identityModules ?? {};
  const traitProfiles = Array.isArray(identityModules.traitProfiles)
    ? identityModules.traitProfiles
    : [];

  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的古代身份",
    scoreLabel: "身份匹配度",
    main: {
      name: localResult.topIdentity.name,
      score: localResult.topIdentity.score,
    },
    heroArtwork: localResult.topIdentity.artwork,
    highlightCard: {
      title: "专属称号",
      content: identityModules.honorTitle ?? localResult.topIdentity.slogan,
    },
    insight: identityModules.personaLine ?? localResult.localNarrative,
    tagChips: traitProfiles
      .map((item) => String(item.keyword ?? "").trim())
      .filter(Boolean)
      .slice(0, 5),
    typeCard: {
      title: "性格画像",
      items: traitProfiles.map((item) => ({
        value: item.keyword,
        label: item.note,
      })),
    },
    topThreeTitle: "身份 Top 3",
    topThree: localResult.topThree,
    detailSections: [
      {
        title: "专属金句 / 台词",
        items: identityModules.quoteLines ?? [localResult.topIdentity.slogan],
      },
      {
        title: "适配的古代职业 / 场景",
        items: [
          `适配职业：${(identityModules.ancientJobs ?? []).join("、")}`,
          `适配场景：${(identityModules.ancientScenes ?? []).join("、")}`,
        ],
      },
      {
        title: "匹配的现代职业 / 性格",
        items: [
          `现代职业：${(identityModules.modernJobs ?? []).join("、")}`,
          `性格映射：${(identityModules.modernTraits ?? []).join("、")}`,
        ],
      },
      {
        title: "社交互动钩子",
        items: identityModules.socialHookLines ?? [],
      },
    ],
    summaryTitle: "答卷回放",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 隐藏天赋主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, preferenceVector: object, talentCandidates: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildTalentDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    talentCandidates: localResult.scoredTalents.map((item) => ({
      talent: item.talent,
      trait: item.trait,
      profile: item.profile,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      talent: item.talent,
      score: item.score,
      trait: item.trait,
    })),
  };
}

/**
 * 隐藏天赋主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildTalentDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的隐藏天赋",
    scoreLabel: "天赋匹配度",
    main: deepResult.mainTalent,
    highlightCard: {
      title: "天赋定义",
      content: deepResult.talentDefinition,
    },
    insight: deepResult.insight,
    topThreeTitle: "天赋 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "解锁动作", items: deepResult.unlockActions },
      { title: "盲点提醒", items: deepResult.blindSpots },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 隐藏天赋主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildTalentLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的隐藏天赋",
    scoreLabel: "天赋匹配度",
    main: {
      name: localResult.topTalent.talent,
      score: localResult.topTalent.score,
    },
    highlightCard: {
      title: "天赋定义",
      content: "你更擅长把直觉、结构和行动连接成完整的解题路径。",
    },
    insight: localResult.localNarrative,
    topThreeTitle: "天赋 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.talent,
      score: item.score,
    })),
    detailSections: [
      {
        title: "解锁动作",
        items: [
          "把一个直觉判断写成可执行小实验，并在当天启动。",
          "每周复盘一次“最有效动作”，持续强化天赋通路。",
          "把你的判断过程讲给他人，提升天赋可见度。",
        ],
      },
      {
        title: "盲点提醒",
        items: ["灵感多但收口不足", "执行节奏被外部噪声打断"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 贵人星座主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, preferenceVector: object, signCandidates: Array<object>, localTopThree: Array<object>, localFallback: object }} 深度分析负载。
 */
function buildBenefactorDimensionHintItems(items, mode) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map((item) => {
    const label = item.label ?? "关键维度";
    const userValue = Number(item.userValue ?? 0).toFixed(1);
    const signValue = Number(item.signValue ?? 0).toFixed(1);
    const gapValue = Number(item.gapValue ?? 0).toFixed(1);

    if (mode === "resonance") {
      return `${label}：你 ${userValue} / 贵人 ${signValue}，互动阻力更低，彼此更容易自然同频。`;
    }

    if (mode === "boost") {
      return `${label}：贵人侧高出 ${gapValue}，在这块更能接住你、补足你短板。`;
    }

    return `${label}：你当前约 ${userValue}，这块波动时更容易出现关系误会。`;
  });
}

/**
 * 构建贵人主题本地兜底模块。
 * @param {object} localResult 本地分析结果。
 * @returns {{ tagChips: Array<string>, encounterScenes: Array<string>, collaborationStyles: Array<string>, communicationTips: Array<string>, resourceChannels: Array<string>, monthlyRhythm: Array<string>, resonanceHints: Array<string>, supplementHints: Array<string>, cautionHints: Array<string>, keyOpportunities: Array<string>, avoidSignals: Array<string> }} 本地兜底模块。
 */
function buildBenefactorLocalFallback(localResult) {
  const dimensionInsights = localResult.dimensionInsights ?? {};

  return {
    tagChips: localResult.tagChips ?? [],
    encounterScenes: localResult.encounterScenes ?? [],
    collaborationStyles: localResult.collaborationStyles ?? [],
    communicationTips: localResult.communicationTips ?? [],
    resourceChannels: localResult.resourceChannels ?? [],
    monthlyRhythm: localResult.monthlyRhythm ?? [],
    resonanceHints: buildBenefactorDimensionHintItems(
      dimensionInsights.resonance ?? [],
      "resonance",
    ),
    supplementHints: buildBenefactorDimensionHintItems(
      dimensionInsights.supportBoost ?? [],
      "boost",
    ),
    cautionHints: buildBenefactorDimensionHintItems(
      dimensionInsights.caution ?? [],
      "caution",
    ),
    keyOpportunities: localResult.keyOpportunities ?? [],
    avoidSignals: localResult.avoidSignals ?? [],
  };
}

/**
 * 获取首个可用字符串。
 * @param {Array<unknown>} candidates 候选项。
 * @param {string} fallbackText 兜底文本。
 * @returns {string} 首个可用文案。
 */
function pickFirstAvailableText(candidates, fallbackText) {
  for (const candidateItem of candidates) {
    const normalizedText = String(candidateItem ?? "").trim();
    if (normalizedText) {
      return normalizedText;
    }
  }

  return fallbackText;
}

/**
 * 把多条要点压缩为一段可读性更强的文本。
 * @param {Array<unknown>} items 候选条目。
 * @param {string} fallbackText 兜底文本。
 * @returns {string} 段落文本。
 */
function buildParagraphFromItems(items, fallbackText) {
  if (!Array.isArray(items) || items.length === 0) {
    return fallbackText;
  }

  const normalizedItems = items
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);

  if (normalizedItems.length === 0) {
    return fallbackText;
  }

  // 关键逻辑：统一用“。 ”连接，确保模块展示为连续段落而非列表断句。
  const paragraphText = normalizedItems.join("。 ");
  const normalizedParagraph = paragraphText.replace(/。+\s*$/u, "");
  return `${normalizedParagraph}。`;
}

function buildBenefactorDeepPayload(localResult) {
  const localFallback = buildBenefactorLocalFallback(localResult);

  return {
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    signCandidates: localResult.scoredSigns.map((item) => ({
      sign: item.sign,
      code: item.code,
      supportStyle: item.supportStyle,
      profile: item.profile,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      sign: item.sign,
      score: item.score,
      supportStyle: item.supportStyle,
    })),
    localFallback,
  };
}

/**
 * 贵人星座主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildBenefactorDeepUnifiedResult(deepResult, localResult) {
  const localFallback = buildBenefactorLocalFallback(localResult);
  const topDistribution = (localResult.scoredSigns ?? []).slice(0, 6);
  const mainSignSupportStyle =
    localResult.scoredSigns?.find((item) => item.sign === deepResult.mainSign?.name)
      ?.supportStyle ?? localResult.topSign.supportStyle;

  const encounterScenes = deepResult.encounterScenes?.length
    ? deepResult.encounterScenes
    : localFallback.encounterScenes;
  const collaborationStyles = deepResult.collaborationStyles?.length
    ? deepResult.collaborationStyles
    : localFallback.collaborationStyles;
  const communicationTips = deepResult.communicationTips?.length
    ? deepResult.communicationTips
    : localFallback.communicationTips;
  const resourceChannels = deepResult.resourceChannels?.length
    ? deepResult.resourceChannels
    : localFallback.resourceChannels;
  const monthlyRhythm = deepResult.monthlyRhythm?.length
    ? deepResult.monthlyRhythm
    : localFallback.monthlyRhythm;
  const resonanceHints = deepResult.resonanceHints?.length
    ? deepResult.resonanceHints
    : localFallback.resonanceHints;
  const supplementHints = deepResult.supplementHints?.length
    ? deepResult.supplementHints
    : localFallback.supplementHints;
  const cautionHints = deepResult.cautionHints?.length
    ? deepResult.cautionHints
    : localFallback.cautionHints;
  const keyOpportunities = deepResult.keyOpportunities?.length
    ? deepResult.keyOpportunities
    : localFallback.keyOpportunities;
  const avoidSignals = deepResult.avoidSignals?.length
    ? deepResult.avoidSignals
    : localFallback.avoidSignals;
  const tagChips = deepResult.tags?.length ? deepResult.tags : localFallback.tagChips;

  const encounterSceneParagraph = buildParagraphFromItems(
    encounterScenes,
    "你的贵人更容易在生活圈与稳定互动里出现，而不是一次性陌生社交。",
  );
  const relationStyleParagraph = buildParagraphFromItems(
    collaborationStyles,
    "你更适合通过稳定往来建立信任，让关系在自然互动中逐步升温。",
  );
  const communicationParagraph = buildParagraphFromItems(
    communicationTips,
    "沟通时先说感受再说需求，会更容易得到对方真实回应。",
  );
  const supportParagraph = buildParagraphFromItems(
    resourceChannels,
    "真正的支持通常来自日常可持续联系的人，而不是临时关系。",
  );
  const rhythmParagraph = buildParagraphFromItems(
    monthlyRhythm,
    "先清理无效社交，再经营同频关系，你的人际运势会更稳。",
  );
  const resonanceParagraph = buildParagraphFromItems(
    resonanceHints,
    "你与贵人在关键互动维度上有天然同频，关系推进阻力较小。",
  );
  const supplementParagraph = buildParagraphFromItems(
    supplementHints,
    "贵人会在你当前薄弱环节形成补位，帮你更快走出卡点。",
  );
  const cautionParagraph = buildParagraphFromItems(
    cautionHints,
    "情绪上头时先暂停再沟通，能显著减少关系误判。",
  );
  const keyActionParagraph = buildParagraphFromItems(
    keyOpportunities,
    "先保持真诚表达与稳定联系，你更容易获得持续支持。",
  );
  const avoidSignalParagraph = buildParagraphFromItems(
    avoidSignals,
    "避免高频内耗和无效社交，聚焦高质量连接更关键。",
  );

  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你在 2026 的贵人星座画像",
    scoreLabel: "星座契合度",
    main: deepResult.mainSign,
    highlightCard: {
      title: "贵人信号",
      content: deepResult.guardianSignal,
    },
    insight: deepResult.insight,
    tagChips,
    typeCard: {
      title: "贵人协作卡片",
      items: [
        { label: "主贵人", value: deepResult.mainSign.name },
        { label: "支持风格", value: mainSignSupportStyle },
        {
          label: "高频出现",
          value: pickFirstAvailableText(
            encounterScenes,
            "跨团队协作和资源整合场景",
          ),
        },
        {
          label: "沟通关键词",
          value: pickFirstAvailableText(communicationTips, "目标清晰、请求具体"),
        },
      ],
    },
    distributionChart: {
      title: "星座契合分布（Top 6）",
      items: topDistribution.map((item) => ({
        key: item.code,
        name: item.sign,
        score: item.score,
        color: item.color,
      })),
    },
    topThreeTitle: "贵人星座 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "生活圈遇见场景", items: [encounterSceneParagraph] },
      { title: "人际互动画像", items: [relationStyleParagraph] },
      { title: "沟通钥匙", items: [communicationParagraph] },
      { title: "情绪支持方式", items: [supportParagraph] },
      { title: "年度人际节奏", items: [rhythmParagraph] },
      { title: "同频点", items: [resonanceParagraph] },
      { title: "互补点", items: [supplementParagraph] },
      { title: "温柔提醒", items: [cautionParagraph] },
      { title: "关系升温动作", items: [keyActionParagraph] },
      { title: "社交避坑提示", items: [avoidSignalParagraph] },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 贵人星座主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildBenefactorLocalUnifiedResult(localResult) {
  const localFallback = buildBenefactorLocalFallback(localResult);
  const topDistribution = (localResult.scoredSigns ?? []).slice(0, 6);
  const encounterSceneParagraph = buildParagraphFromItems(
    localFallback.encounterScenes,
    "你的贵人更容易在日常生活圈里通过稳定互动慢慢出现。",
  );
  const relationStyleParagraph = buildParagraphFromItems(
    localFallback.collaborationStyles,
    "你的人际关系更适合慢热建立信任，不需要刻意用力社交。",
  );
  const communicationParagraph = buildParagraphFromItems(
    localFallback.communicationTips,
    "先表达感受再提出需求，会让沟通更轻松更有效。",
  );
  const supportParagraph = buildParagraphFromItems(
    localFallback.resourceChannels,
    "真正能帮到你的人通常来自长期稳定联系，而非短期热络关系。",
  );
  const rhythmParagraph = buildParagraphFromItems(
    localFallback.monthlyRhythm,
    "今年的人际重点是减少无效连接，经营少量但高质量的关系。",
  );
  const resonanceParagraph = buildParagraphFromItems(
    localFallback.resonanceHints,
    "你和贵人在关键关系维度上有天然同频。",
  );
  const supplementParagraph = buildParagraphFromItems(
    localFallback.supplementHints,
    "贵人更擅长补你短板，让你在关系里更有底气。",
  );
  const cautionParagraph = buildParagraphFromItems(
    localFallback.cautionHints,
    "当情绪波动时放慢节奏，会减少关系误会。",
  );
  const keyActionParagraph = buildParagraphFromItems(
    localFallback.keyOpportunities,
    "把联系、表达和感谢做成习惯，贵人运会逐步变强。",
  );
  const avoidSignalParagraph = buildParagraphFromItems(
    localFallback.avoidSignals,
    "尽量减少高消耗关系，把精力留给真正值得的人。",
  );

  return createUnifiedResult({
    source: "local",
    prefixLabel: "你在 2026 的贵人星座画像",
    scoreLabel: "星座契合度",
    main: {
      name: localResult.topSign.sign,
      score: localResult.topSign.score,
    },
    highlightCard: {
      title: "贵人信号",
      content: localResult.topSign.supportStyle,
    },
    insight: localResult.localNarrative,
    tagChips: localFallback.tagChips,
    typeCard: {
      title: "贵人协作卡片",
      items: [
        { label: "主贵人", value: localResult.topSign.sign },
        { label: "支持风格", value: localResult.topSign.supportStyle },
        {
          label: "高频出现",
          value: pickFirstAvailableText(
            localFallback.encounterScenes,
            "项目协作和资源联动场景",
          ),
        },
        {
          label: "沟通关键词",
          value: pickFirstAvailableText(
            localFallback.communicationTips,
            "目标清晰、节奏对齐",
          ),
        },
      ],
    },
    distributionChart: {
      title: "星座契合分布（Top 6）",
      items: topDistribution.map((item) => ({
        key: item.code,
        name: item.sign,
        score: item.score,
        color: item.color,
      })),
    },
    topThreeTitle: "贵人星座 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.sign,
      score: item.score,
    })),
    detailSections: [
      { title: "生活圈遇见场景", items: [encounterSceneParagraph] },
      { title: "人际互动画像", items: [relationStyleParagraph] },
      { title: "沟通钥匙", items: [communicationParagraph] },
      { title: "情绪支持方式", items: [supportParagraph] },
      { title: "年度人际节奏", items: [rhythmParagraph] },
      { title: "同频点", items: [resonanceParagraph] },
      { title: "互补点", items: [supplementParagraph] },
      { title: "温柔提醒", items: [cautionParagraph] },
      { title: "关系升温动作", items: [keyActionParagraph] },
      { title: "社交避坑提示", items: [avoidSignalParagraph] },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 2026 主题色运行时调色板：
 * 关键逻辑：全部为“降饱和适配值”，避免黑/红等高冲击颜色直接铺满页面造成可读性问题。
 */
const COLOR_2026_RUNTIME_PALETTE = {
  black: {
    key: "black",
    name: "曜石黑",
    accent: "#454B58",
    accentSoft: "#8B94A6",
    bgStart: "#F2F4F8",
    bgMid: "#EAEFF5",
    bgEnd: "#F8F9FC",
    textMain: "#2A2F3A",
    textMuted: "#646D7C",
    surface: "#FFFFFF",
    surfaceBorder: "#D7DEE9",
    optionBorder: "#D0D8E4",
    optionSelectedBorder: "#8E99AB",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#EEF2F7",
    highlightBorder: "#D5DCE7",
    highlightBgStart: "#F7F9FC",
    highlightBgEnd: "#EEF2F8",
    auraLeft: "#A7B1C0",
    auraRight: "#CDD4DF",
  },
  blue: {
    key: "blue",
    name: "深海蓝",
    accent: "#4B6DD9",
    accentSoft: "#8CA4F2",
    bgStart: "#EFF3FF",
    bgMid: "#E8F0FF",
    bgEnd: "#F5F8FF",
    textMain: "#27335C",
    textMuted: "#5E6C97",
    surface: "#FFFFFF",
    surfaceBorder: "#D7E0FF",
    optionBorder: "#D3DCFA",
    optionSelectedBorder: "#8EA4EC",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#EEF3FF",
    highlightBorder: "#D6E0FF",
    highlightBgStart: "#F5F8FF",
    highlightBgEnd: "#EDF2FF",
    auraLeft: "#A9BEFF",
    auraRight: "#C7D4FF",
  },
  red: {
    key: "red",
    name: "赤焰红",
    accent: "#D26072",
    accentSoft: "#E8A0AB",
    bgStart: "#FFF1F4",
    bgMid: "#FFE9EE",
    bgEnd: "#FFF6F8",
    textMain: "#4E2A35",
    textMuted: "#855E69",
    surface: "#FFFFFF",
    surfaceBorder: "#F6D7DF",
    optionBorder: "#F2D1DA",
    optionSelectedBorder: "#E099A7",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#FFF0F3",
    highlightBorder: "#F1CED8",
    highlightBgStart: "#FFF7F9",
    highlightBgEnd: "#FFEFF3",
    auraLeft: "#F0B3BF",
    auraRight: "#FFD1D8",
  },
  green: {
    key: "green",
    name: "松柏绿",
    accent: "#4D9A78",
    accentSoft: "#8ECBAF",
    bgStart: "#EEF9F3",
    bgMid: "#E7F5EE",
    bgEnd: "#F6FCF9",
    textMain: "#274537",
    textMuted: "#5D7F71",
    surface: "#FFFFFF",
    surfaceBorder: "#D3EDDF",
    optionBorder: "#CEE7DA",
    optionSelectedBorder: "#8FC5AD",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#ECF8F2",
    highlightBorder: "#CEE8DA",
    highlightBgStart: "#F5FCF8",
    highlightBgEnd: "#ECF7F1",
    auraLeft: "#A8DCC4",
    auraRight: "#CBECDD",
  },
  yellow: {
    key: "yellow",
    name: "日光黄",
    accent: "#C79A38",
    accentSoft: "#E0C17E",
    bgStart: "#FFF8EB",
    bgMid: "#FFF3DF",
    bgEnd: "#FFFBEF",
    textMain: "#4E3D1E",
    textMuted: "#7C6841",
    surface: "#FFFFFF",
    surfaceBorder: "#F0E1BC",
    optionBorder: "#EEDDB2",
    optionSelectedBorder: "#DBBE79",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#FFF6E5",
    highlightBorder: "#EDDDAF",
    highlightBgStart: "#FFFCEE",
    highlightBgEnd: "#FFF4DF",
    auraLeft: "#F1DAA0",
    auraRight: "#FFE9B8",
  },
  purple: {
    key: "purple",
    name: "雾霭紫",
    accent: "#7A65BE",
    accentSoft: "#AA98DE",
    bgStart: "#F4F0FF",
    bgMid: "#EEE8FF",
    bgEnd: "#F9F6FF",
    textMain: "#3B2F62",
    textMuted: "#6C6090",
    surface: "#FFFFFF",
    surfaceBorder: "#E1D9F8",
    optionBorder: "#DCD2F4",
    optionSelectedBorder: "#A999D8",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#F1ECFF",
    highlightBorder: "#DDD2F5",
    highlightBgStart: "#F8F4FF",
    highlightBgEnd: "#F0E9FF",
    auraLeft: "#C8BAEC",
    auraRight: "#E1D7FA",
  },
  orange: {
    key: "orange",
    name: "珊瑚橙",
    accent: "#D07A4C",
    accentSoft: "#E5A782",
    bgStart: "#FFF4EC",
    bgMid: "#FFEDE1",
    bgEnd: "#FFF8F1",
    textMain: "#543425",
    textMuted: "#886350",
    surface: "#FFFFFF",
    surfaceBorder: "#F4DDCE",
    optionBorder: "#F0D7C7",
    optionSelectedBorder: "#E3AF8F",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#FFF2E8",
    highlightBorder: "#EFD7C6",
    highlightBgStart: "#FFF9F3",
    highlightBgEnd: "#FFEFE3",
    auraLeft: "#F0BF9F",
    auraRight: "#FFD9C1",
  },
  white: {
    key: "white",
    name: "云朵白",
    accent: "#8A94A8",
    accentSoft: "#B8C0D1",
    bgStart: "#FAFBFD",
    bgMid: "#F4F6FA",
    bgEnd: "#FFFFFF",
    textMain: "#2D3442",
    textMuted: "#697285",
    surface: "#FFFFFF",
    surfaceBorder: "#E0E5EF",
    optionBorder: "#DAE0EA",
    optionSelectedBorder: "#AAB3C5",
    optionSelectedBgStart: "#FFFFFF",
    optionSelectedBgEnd: "#F4F7FC",
    highlightBorder: "#DDE3EE",
    highlightBgStart: "#FBFCFF",
    highlightBgEnd: "#F4F7FC",
    auraLeft: "#D6DDE8",
    auraRight: "#EAEFF7",
  },
};

/**
 * 主题色主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, colorCandidates: Array<object>, localTopThree: Array<object> }} 深度分析负载。
 */
function buildColorThemeDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    colorCandidates: localResult.scoredColors.map((item) => ({
      key: item.key,
      name: item.name,
      hex: item.hex,
      vibe: item.vibe,
      lifeHint: item.lifeHint,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      key: item.key,
      name: item.name,
      score: item.score,
      hex: item.hex,
    })),
  };
}

/**
 * 主题色主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildColorThemeDeepUnifiedResult(deepResult, localResult) {
  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的 2026 主题色",
    scoreLabel: "主题色匹配度",
    main: deepResult.mainColor,
    highlightCard: {
      title: "颜色气质",
      content: deepResult.dailyMood,
    },
    insight: deepResult.insight,
    typeCard: {
      title: "我的主题色卡",
      items: deepResult.topThree.map((item, index) => ({
        label: index === 0 ? "主色" : index === 1 ? "辅助色" : "点缀色",
        value: item.name,
      })),
    },
    topThreeTitle: "主题色 Top 3",
    topThree: deepResult.topThree,
    detailSections: [
      { title: "日常建议", items: deepResult.keyActions },
      { title: "避坑提醒", items: deepResult.avoidSignals },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
    runtimeColorKey: deepResult.mainColor?.key ?? localResult.topColor.key,
  });
}

/**
 * 主题色主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildColorThemeLocalUnifiedResult(localResult) {
  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的 2026 主题色",
    scoreLabel: "主题色匹配度",
    main: {
      name: localResult.topColor.name,
      score: localResult.topColor.score,
    },
    highlightCard: {
      title: "颜色气质",
      content: `${localResult.topColor.vibe}。${localResult.topColor.lifeHint}`,
    },
    insight: localResult.localNarrative,
    typeCard: {
      title: "我的主题色卡",
      items: localResult.topThree.map((item, index) => ({
        label: index === 0 ? "主色" : index === 1 ? "辅助色" : "点缀色",
        value: item.name,
      })),
    },
    topThreeTitle: "主题色 Top 3",
    topThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
    })),
    detailSections: [
      {
        title: "日常建议",
        items: [
          "把主色用于壁纸、待办封面或常用物品，强化目标感。",
          "每周围绕一个核心任务推进，减少频繁切换。",
          "用你最舒服的节奏安排生活，让状态长期在线。",
        ],
      },
      {
        title: "避坑提醒",
        items: ["短期冲动后连续摆烂", "目标过多导致执行分散"],
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
    runtimeColorKey: localResult.topColor.key,
  });
}

/**
 * 浪漫主题：根据答题数生成彩蛋文案。
 * @param {number} answerCount 实际答题数。
 * @returns {string} 彩蛋文案。
 */
function buildRomanceEasterEggText(answerCount) {
  const safeAnswerCount = Math.max(0, Math.floor(Number(answerCount) || 0));

  if (safeAnswerCount === 13) {
    return "历经 13 个爱的抉择，愿你不仅拥有前半生的浪漫……";
  }

  if (safeAnswerCount === 14) {
    return "跨越 14 个心动瞬间，你已集齐了一生一世的浪漫拼图。";
  }

  return "";
}

/**
 * 计算浪漫主题答题数量：
 * 关键逻辑：优先使用已选答案统计，避免“题目存在但未作答”导致计数偏差。
 * @param {object} localResult 本地分析结果。
 * @returns {number} 实际答题数。
 */
function resolveRomanceAnswerCount(localResult) {
  const answeredBySummary = Array.isArray(localResult.answerSummary)
    ? localResult.answerSummary.filter((summaryItem) => Boolean(summaryItem.optionId))
        .length
    : 0;
  if (answeredBySummary > 0) {
    return answeredBySummary;
  }

  return Array.isArray(localResult.summaryLines) ? localResult.summaryLines.length : 0;
}

/**
 * 浪漫主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ romanceIndex: number, tierConfig: object, dimensionScores: Array<object>, topDimensions: Array<object>, weakestDimensions: Array<object>, tagChips: Array<string>, summaryLines: Array<string>, growthActions: Array<string>, destinyGate: object, destinyOutcome: object, answeredCount: number, posterModel: object }} 深度分析负载。
 */
function buildRomanceDeepPayload(localResult) {
  return {
    romanceIndex: localResult.romanceIndex,
    tierConfig: localResult.tierConfig,
    dimensionScores: localResult.dimensionScores,
    topDimensions: localResult.topDimensions,
    weakestDimensions: localResult.weakestDimensions,
    tagChips: localResult.tagChips,
    summaryLines: localResult.summaryLines,
    growthActions: localResult.growthActions,
    destinyGate: localResult.destinyGate,
    destinyOutcome: localResult.destinyOutcome,
    answeredCount: localResult.answeredCount,
    posterModel: localResult.posterModel,
  };
}

/**
 * 浪漫主题：构建顶部简短结论文案。
 * 关键逻辑：该文案用于结果页上半区“速览”，避免与“深度解析”长文重复。
 * @param {object} params 参数对象。
 * @param {object} params.destinyGate 宿命判定结果。
 * @param {object} params.destinyOutcome 宿命结局结果。
 * @param {Array<object>} params.topDimensions 维度 Top 列表。
 * @returns {string} 简短结论。
 */
function buildRomanceBriefInsight({
  destinyGate,
  destinyOutcome,
  topDimensions,
}) {
  const thresholdPercent = Number(destinyGate?.thresholdPercent ?? 80);
  const scorePercent = Number(destinyGate?.scorePercent ?? 0);
  const isUnlockedOutcome = destinyOutcome?.key === "unlocked";
  const topLabelText = Array.isArray(topDimensions)
    ? topDimensions
        .slice(0, 2)
        .map((dimensionItem) => String(dimensionItem?.label ?? "").trim())
        .filter(Boolean)
        .join("、")
    : "";

  if (isUnlockedOutcome) {
    return `你已触发隐藏关卡（${scorePercent}%）。当前优势在${topLabelText || "共情与行动"}，把这份坚定持续落地，会更接近你理想中的“一生一世”。`;
  }

  const gapScore = Math.max(0, thresholdPercent - scorePercent);
  return `你与隐藏关卡还差 ${gapScore}% 。你在${topLabelText || "关系感知"}上基础不错，下一步优先补强“主动表达与仪式行动”。`;
}

/**
 * 浪漫主题：构建深度结果展示模型。
 * @param {object} deepResult 深度规则结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildRomanceDeepUnifiedResult(deepResult, localResult) {
  const tierConfig = deepResult.tierConfig ?? localResult.tierConfig;
  const destinyGate = deepResult.destinyGate ?? localResult.destinyGate ?? {};
  const destinyOutcome = deepResult.destinyOutcome ?? localResult.destinyOutcome ?? {};
  const isUnlockedOutcome = destinyOutcome.key === "unlocked";
  const easterEggText = buildRomanceEasterEggText(
    resolveRomanceAnswerCount(localResult),
  );
  const radarItems = deepResult.radarItems?.length
    ? deepResult.radarItems
    : localResult.dimensionScores;
  const mainProfile = deepResult.mainProfile ?? {
    name: tierConfig.title,
    score: localResult.romanceIndex,
  };
  const briefInsightText = buildRomanceBriefInsight({
    destinyGate,
    destinyOutcome,
    topDimensions: localResult.topDimensions,
  });
  const deepInsightPrimaryText =
    deepResult.insight ?? tierConfig.insight ?? localResult.localNarrative;
  const deepInsightSecondaryText = String(
    deepResult.summaryParagraph ?? "",
  ).trim();
  /**
   * 深度解析展示策略：
   * 1. 第一条始终展示更完整的 AI 洞察正文。
   * 2. 第二条可选展示摘要补充，且避免与第一条重复。
   */
  const deepInsightItems = [
    deepInsightPrimaryText,
    deepInsightSecondaryText &&
    deepInsightSecondaryText !== deepInsightPrimaryText
      ? deepInsightSecondaryText
      : "",
  ].filter(Boolean);

  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的浪漫指数",
    scoreLabel: "浪漫指数",
    main: mainProfile,
    highlightCard:
      deepResult.highlightCard ??
      {
        title: "浪漫称号解析",
        content: tierConfig.insight,
      },
    // 关键逻辑：顶部 insight 使用“短结论”，避免与“深度解析”模块内容重复。
    insight: briefInsightText,
    easterEggText,
    tagChips: deepResult.tagChips ?? localResult.tagChips,
    typeCard: {
      title: "浪漫 DNA 卡片",
      items: radarItems.map((item) => ({
        label: item.label,
        value: `${item.score}%`,
      })),
    },
    distributionChart: {
      title: "维度分布条形图",
      items: radarItems,
    },
    radarChart: {
      title: "浪漫维度雷达图",
      items: radarItems,
    },
    topThreeTitle: isUnlockedOutcome
      ? "突破后浪漫维度 Top 3"
      : "遗憾结局下仍闪耀的维度 Top 3",
    topThree: deepResult.topThree ?? localResult.topThree,
    detailSections: [
      {
        title: "宿命判定",
        items: [
          `守门员阈值：${Number(destinyGate.thresholdPercent ?? 80)}%，你的信念值：${Number(destinyGate.scorePercent ?? 0)}%。`,
          isUnlockedOutcome
            ? "检测到过量的浪漫因子，系统判定为“突破宿命”并解锁第 14 次机会。"
            : "你的理性在第 13 章形成了保护壳，故事停在“遗憾美”结局。",
        ],
      },
      {
        title: "深度解析",
        items: deepInsightItems,
      },
      {
        title: "关系升级动作",
        items: deepResult.growthActions ?? localResult.growthActions,
      },
      {
        title: "关系避坑提醒",
        items: deepResult.avoidSignals ?? tierConfig.avoidSignals,
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "再测一次浪漫指数",
    posterModel: {
      ...deepResult.posterModel,
      romanceIndex: mainProfile.score ?? localResult.romanceIndex,
      title: mainProfile.name ?? tierConfig.title,
      quote: deepResult.posterModel?.quote ?? tierConfig.posterQuote,
      easterEggText,
      radarItems,
    },
  });
}

/**
 * 浪漫主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildRomanceLocalUnifiedResult(localResult) {
  const destinyGate = localResult.destinyGate ?? {};
  const destinyOutcome = localResult.destinyOutcome ?? {};
  const isUnlockedOutcome = destinyOutcome.key === "unlocked";
  const easterEggText = buildRomanceEasterEggText(
    resolveRomanceAnswerCount(localResult),
  );
  const briefInsightText = buildRomanceBriefInsight({
    destinyGate,
    destinyOutcome,
    topDimensions: localResult.topDimensions,
  });

  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的浪漫指数",
    scoreLabel: "浪漫指数",
    main: {
      name: localResult.tierConfig.title,
      score: localResult.romanceIndex,
    },
    highlightCard: {
      title: "浪漫称号解析",
      content: localResult.tierConfig.insight,
    },
    insight: briefInsightText,
    easterEggText,
    tagChips: localResult.tagChips,
    typeCard: {
      title: "浪漫 DNA 卡片",
      items: localResult.dimensionScores.map((item) => ({
        label: item.label,
        value: `${item.score}%`,
      })),
    },
    distributionChart: {
      title: "维度分布条形图",
      items: localResult.dimensionScores,
    },
    radarChart: {
      title: "浪漫维度雷达图",
      items: localResult.dimensionScores,
    },
    topThreeTitle: isUnlockedOutcome
      ? "突破后浪漫维度 Top 3"
      : "遗憾结局下仍闪耀的维度 Top 3",
    topThree: localResult.topThree,
    detailSections: [
      {
        title: "宿命判定",
        items: [
          `守门员阈值：${Number(destinyGate.thresholdPercent ?? 80)}%，你的信念值：${Number(destinyGate.scorePercent ?? 0)}%。`,
          isUnlockedOutcome
            ? "你通过了第 13 题判定，成功解锁第 14 题。你是会为爱打破规则的人。"
            : "你止步第 13 题，故事停在“理智保护你”的遗憾美结局。",
        ],
      },
      {
        title: "关系升级动作",
        items: localResult.growthActions,
      },
      {
        title: "关系避坑提醒",
        items: localResult.tierConfig.avoidSignals,
      },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "再测一次浪漫指数",
    posterModel: {
      ...localResult.posterModel,
      romanceIndex: localResult.romanceIndex,
      title: localResult.tierConfig.title,
      quote: localResult.posterModel.quote,
      easterEggText,
      radarItems: localResult.dimensionScores,
    },
  });
}

/**
 * 恋爱主题：清洗标签展示文本。
 * @param {unknown} tag 标签输入。
 * @returns {string} 去除 # 后的标签文本。
 */
function sanitizeLoveTagLabel(tag) {
  return String(tag ?? "")
    .replace(/^#/, "")
    .trim();
}

/**
 * 恋爱主题：合并并去重标签（不保留 #）。
 * @param {Array<unknown>} tags 标签列表。
 * @returns {Array<string>} 清洗后的标签列表。
 */
function normalizeLoveTagChips(tags) {
  const normalizedList = tags
    .map(sanitizeLoveTagLabel)
    .filter(Boolean);

  return [...new Set(normalizedList)].slice(0, 8);
}

/**
 * 恋爱心理主题：本地兜底细分亚型推导。
 * 关键逻辑：当分析器未返回 subtypeProfile 时，保证结果页字段完整可渲染。
 * @param {Array<object>} distribution 类型分布列表。
 * @returns {{ signature: string, coreTypeName: string, subtypeName: string, subtypeBrief: string, subtypeTag: string, secondaryTypeName: string, intensityLabel: string, tendencyGap: number }} 兜底亚型。
 */
function buildFallbackAttachmentSubtypeProfile(distribution) {
  const sortedDistribution = Array.isArray(distribution)
    ? [...distribution].sort((leftItem, rightItem) => Number(rightItem?.score ?? 0) - Number(leftItem?.score ?? 0))
    : [];

  const mainType = sortedDistribution[0] ?? {};
  const secondaryType = sortedDistribution[1] ?? {};
  const tendencyGap = Math.max(
    0,
    Math.round(Number(mainType?.score ?? 0) - Number(secondaryType?.score ?? 0)),
  );
  const intensityLabel =
    tendencyGap >= 30 ? "高确定性" : tendencyGap >= 15 ? "中等确定性" : "混合波动";

  const mainTypeName = String(mainType?.name ?? "").trim() || "待判定";
  const secondaryTypeName = String(secondaryType?.name ?? "").trim() || "暂无";
  return {
    signature: `${mainTypeName}倾向`,
    coreTypeName: mainTypeName,
    subtypeName: `${mainTypeName}稳定子型`,
    subtypeBrief: "当前细分亚型由分布数据推导，建议结合完整题量再次验证。",
    subtypeTag: `${mainTypeName}倾向`,
    secondaryTypeName,
    intensityLabel,
    tendencyGap,
  };
}

/**
 * 恋爱心理主题：构建深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ typeCandidates: Array<object>, localDistribution: Array<object>, localMainType: object, localSubtypeProfile: object, summaryLines: Array<string> }} 深度分析负载。
 */
function buildLoveAttachmentDeepPayload(localResult) {
  const profileMap = localResult.profileMap ?? {};
  const typeCandidates = Object.values(profileMap).map((profileItem) => ({
    key: profileItem.key,
    name: profileItem.name,
    summary: profileItem.summary,
    tags: profileItem.tags,
    familyPortrait: profileItem.familyPortrait,
    whyPattern: profileItem.whyPattern,
    familyPortraitPoints: profileItem.familyPortraitPoints,
    whyPatternPoints: profileItem.whyPatternPoints,
    strengths: profileItem.strengths,
    risks: profileItem.risks,
    actions: profileItem.actions,
  }));

  return {
    typeCandidates,
    localDistribution: localResult.distribution,
    localMainType: localResult.topType,
    localSubtypeProfile: localResult.subtypeProfile,
    summaryLines: localResult.summaryLines,
  };
}

/**
 * 恋爱心理主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildLoveAttachmentDeepUnifiedResult(deepResult, localResult) {
  const sortedDistribution = [...(deepResult.distribution ?? [])].sort(
    (leftItem, rightItem) => rightItem.score - leftItem.score,
  );

  const fallbackMainType = sortedDistribution[0] ?? localResult.topType;
  const mainType = deepResult.mainType ?? fallbackMainType;
  const subtypeProfile =
    deepResult.subtypeProfile ??
    localResult.subtypeProfile ??
    buildFallbackAttachmentSubtypeProfile(
      sortedDistribution.length > 0 ? sortedDistribution : localResult.distribution,
    );

  // 关键逻辑：优先使用 AI 返回的结构化要点，缺失时再回退到单段文本，保证展示密度与兼容性。
  const familyPortraitItems =
    Array.isArray(deepResult.familyPortraitPoints) &&
    deepResult.familyPortraitPoints.length > 0
      ? deepResult.familyPortraitPoints
      : deepResult.familyPortrait
        ? [deepResult.familyPortrait]
        : ["暂无"];

  // 关键逻辑：保持“机制解释”模块与“画像模块”同样的多条目策略，避免结果过于简短。
  const whyPatternItems =
    Array.isArray(deepResult.whyPatternPoints) && deepResult.whyPatternPoints.length > 0
      ? deepResult.whyPatternPoints
      : deepResult.whyPattern
        ? [deepResult.whyPattern]
        : ["暂无"];

  // 关键逻辑：把细分亚型标签并入标签区，增强可读性和结果辨识度。
  const mergedTagChips = normalizeLoveTagChips([
    subtypeProfile.subtypeTag,
    ...(deepResult.tags ?? []),
  ]);

  return createUnifiedResult({
    source: "deep",
    prefixLabel: "你的恋爱心理画像",
    scoreLabel: "主类型匹配度",
    main: {
      name: subtypeProfile.signature,
      score: mainType.score,
    },
    highlightCard: {
      title: "一句话概述",
      content: deepResult.oneLineSummary,
    },
    insight: `${subtypeProfile.subtypeBrief} ${deepResult.insight}`.trim(),
    tagChips: mergedTagChips,
    distributionChart: {
      title: "类型分布",
      items: sortedDistribution.map((item) => ({
        key: item.key,
        name: item.name,
        score: item.score,
        color: item.color,
      })),
    },
    typeCard: {
      title: "恋爱心理卡片",
      items: [
        { label: "核心类型", value: subtypeProfile.coreTypeName },
        { label: "细分亚型", value: subtypeProfile.subtypeName },
        { label: "次类型", value: subtypeProfile.secondaryTypeName },
        {
          label: "倾向强度",
          value: `${subtypeProfile.intensityLabel}（主次差值 ${subtypeProfile.tendencyGap}%）`,
        },
      ],
    },
    topThreeTitle: "Top 3 类型倾向",
    topThree: sortedDistribution.slice(0, 3).map((item) => ({
      name: item.name,
      score: item.score,
    })),
    detailSections: [
      {
        title: "细分亚型说明",
        items: [
          `${subtypeProfile.subtypeName}：${subtypeProfile.subtypeBrief}`,
          `你的次类型为${subtypeProfile.secondaryTypeName}，说明在部分关系场景会出现复合倾向。`,
        ],
      },
      { title: "原生家庭画像", items: familyPortraitItems },
      { title: "为什么会这样", items: whyPatternItems },
      { title: "你的关系优势", items: deepResult.strengths },
      { title: "高风险触发点", items: deepResult.risks },
      { title: "关系升级建议", items: deepResult.actions },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 恋爱心理主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildLoveAttachmentLocalUnifiedResult(localResult) {
  const topType = localResult.topType;
  const topTypeProfile = localResult.profileMap[topType.key] ?? {};
  const secondaryType = localResult.distribution[1] ?? null;
  const subtypeProfile =
    localResult.subtypeProfile ??
    buildFallbackAttachmentSubtypeProfile(localResult.distribution);

  // 关键逻辑：本地兜底也保持多条目展示，避免在 AI 不可用时信息密度明显下降。
  const familyPortraitItems =
    Array.isArray(topTypeProfile.familyPortraitPoints) &&
    topTypeProfile.familyPortraitPoints.length > 0
      ? topTypeProfile.familyPortraitPoints
      : topTypeProfile.familyPortrait
        ? [topTypeProfile.familyPortrait]
        : ["暂无"];

  // 关键逻辑：机制说明模块使用与画像模块一致的兜底策略，保证展示结构稳定。
  const whyPatternItems =
    Array.isArray(topTypeProfile.whyPatternPoints) &&
    topTypeProfile.whyPatternPoints.length > 0
      ? topTypeProfile.whyPatternPoints
      : topTypeProfile.whyPattern
        ? [topTypeProfile.whyPattern]
        : ["暂无"];

  return createUnifiedResult({
    source: "local",
    prefixLabel: "你的恋爱心理画像",
    scoreLabel: "主类型匹配度",
    main: {
      name: subtypeProfile.signature,
      score: topType.score,
    },
    highlightCard: {
      title: "一句话概述",
      content: topTypeProfile.summary ?? localResult.localNarrative,
    },
    insight: `${subtypeProfile.subtypeBrief} ${localResult.localNarrative}`.trim(),
    tagChips: normalizeLoveTagChips([
      subtypeProfile.subtypeTag,
      ...(topTypeProfile.tags ?? []),
    ]),
    distributionChart: {
      title: "类型分布",
      items: localResult.distribution.map((item) => ({
        key: item.key,
        name: item.name,
        score: item.score,
        color: item.color,
      })),
    },
    typeCard: {
      title: "恋爱心理卡片",
      items: [
        { label: "核心类型", value: subtypeProfile.coreTypeName },
        { label: "细分亚型", value: subtypeProfile.subtypeName },
        { label: "次类型", value: secondaryType?.name ?? subtypeProfile.secondaryTypeName ?? "暂无" },
        {
          label: "倾向强度",
          value: `${subtypeProfile.intensityLabel}（主次差值 ${subtypeProfile.tendencyGap}%）`,
        },
      ],
    },
    topThreeTitle: "Top 3 类型倾向",
    topThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
    })),
    detailSections: [
      {
        title: "细分亚型说明",
        items: [
          `${subtypeProfile.subtypeName}：${subtypeProfile.subtypeBrief}`,
          `你的次类型为${subtypeProfile.secondaryTypeName}，在高压场景可能会放大该倾向。`,
        ],
      },
      { title: "原生家庭画像", items: familyPortraitItems },
      { title: "为什么会这样", items: whyPatternItems },
      { title: "你的关系优势", items: topTypeProfile.strengths ?? [] },
      { title: "高风险触发点", items: topTypeProfile.risks ?? [] },
      { title: "关系升级建议", items: topTypeProfile.actions ?? [] },
    ],
    summaryTitle: "答卷摘要",
    summaryLines: localResult.summaryLines,
    restartButtonText: "重新测试",
  });
}

/**
 * 恋爱脑封面语录池：
 * 1. sharp 为“毒舌向”语录，强调风险提醒。
 * 2. healing 为“治愈向”语录，强调自我接住。
 */
const LOVE_BRAIN_COVER_QUOTES = {
  sharp: [
    "你把已读不回解读成欲擒故纵，他可能只是在省流。",
    "你不是在谈恋爱，你是在给幻想打白工。",
    "把他偶尔的温柔当承诺，是恋爱脑最贵的一笔分期。",
    "你在等他回头，他在等你自己想通。",
    "他画的是大饼，你交的是首付。",
    "你反复复盘聊天记录，他可能连你置顶都没置顶。",
    "你以为自己是例外，多半只是备选项里的高活跃用户。",
    "心软不是错，把底线当门帘才是。",
  ],
  healing: [
    "真正的爱会让你更像自己，而不是更不像自己。",
    "先照顾好情绪，再决定要不要继续这段关系。",
    "你值得被坚定选择，而不是被反复试探。",
    "把期待收回来一点，自我价值就会回来很多。",
    "关系可以慢慢来，但你不必委屈着等。",
    "先把自己站稳，爱才不会变成求。",
    "愿你被温柔对待，也能温柔地对待自己。",
    "清醒不是无情，是把爱放在更安全的位置。",
  ],
};

/**
 * 从候选数组中随机抽取不重复条目。
 * 复杂度评估：O(n)
 * 采用 Fisher-Yates 洗牌后截断，空间复杂度 O(n)。
 * @param {Array<string>} sourceItems 候选文案。
 * @param {number} expectedCount 期望抽取数量。
 * @returns {Array<string>} 随机不重复结果。
 */
function pickRandomUniqueItems(sourceItems, expectedCount) {
  if (!Array.isArray(sourceItems) || sourceItems.length === 0) {
    return [];
  }

  const normalizedCount = Math.max(
    0,
    Math.min(Math.floor(Number(expectedCount) || 0), sourceItems.length),
  );
  if (normalizedCount === 0) {
    return [];
  }

  const shuffledItems = [...sourceItems];
  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const tempItem = shuffledItems[index];
    shuffledItems[index] = shuffledItems[randomIndex];
    shuffledItems[randomIndex] = tempItem;
  }

  return shuffledItems.slice(0, normalizedCount);
}

/**
 * 生成恋爱脑封面语录（每轮 3 条）。
 * 关键逻辑：保证“毒舌 + 治愈”都有露出，避免语气单一。
 * @returns {Array<string>} 3 条封面语录。
 */
function buildLoveBrainCoverQuotes() {
  const totalCount = 3;
  // 关键逻辑：随机决定 1:2 或 2:1 配比，保证每次都有反差感。
  const sharpCount = Math.random() < 0.5 ? 1 : 2;
  const healingCount = totalCount - sharpCount;

  const pickedSharpQuotes = pickRandomUniqueItems(
    LOVE_BRAIN_COVER_QUOTES.sharp,
    sharpCount,
  );
  const pickedHealingQuotes = pickRandomUniqueItems(
    LOVE_BRAIN_COVER_QUOTES.healing,
    healingCount,
  );

  return pickRandomUniqueItems(
    [...pickedSharpQuotes, ...pickedHealingQuotes],
    totalCount,
  );
}

/**
 * 古代身份主题描述文案池：
 * 关键逻辑：主题页头部与主题中心卡片共用该文案池，保证品牌语气统一。
 */
const ANCIENT_THEME_DESCRIPTION_POOL = [
  "是仗剑天涯的隐士，还是富甲一方的权臣？完成 30 道场景题，系统将锁定你的终极古代身份。",
  "你会是镇守一方的将门英才，还是纵横商道的传奇掌柜？答完 30 道场景题，命格卷轴即刻揭晓。",
  "若你一朝穿越，会在庙堂运筹帷幄，还是在江湖快意恩仇？完成 30 道沉浸式场景题，解锁你的古代真身。",
  "刀光剑影与诗酒风月之间，你最终会站在哪一边？完成 30 道场景推演，系统将判定你的江湖归位。",
  "你以为自己只是路人，其实可能天生带着主角命格。做完 30 道场景题，看看你在古代究竟是谁。",
  "当命运把你丢进古代，你会选择守护天下，还是经营人间烟火？完成 30 道场景题，锁定你的专属身份。",
];

/**
 * 从数组中随机抽取单条文案。
 * 复杂度评估：O(1)
 * 仅执行一次随机索引读取，空间复杂度 O(1)。
 * @param {Array<string>} sourceItems 候选文案列表。
 * @param {string} fallbackValue 兜底文案。
 * @returns {string} 随机抽取结果。
 */
function pickRandomSingleItem(sourceItems, fallbackValue) {
  if (!Array.isArray(sourceItems) || sourceItems.length === 0) {
    return fallbackValue;
  }

  const randomIndex = Math.floor(Math.random() * sourceItems.length);
  return String(sourceItems[randomIndex] ?? fallbackValue).trim() || fallbackValue;
}

/**
 * 构建古代身份主题描述文案。
 * 关键逻辑：每次进入主题时随机抽一条，增强重测新鲜感。
 * @returns {string} 随机主题描述文案。
 */
function buildAncientThemeDescription() {
  return pickRandomSingleItem(
    ANCIENT_THEME_DESCRIPTION_POOL,
    "完成 30 道古风场景题，系统将锁定你的终极古代身份。",
  );
}

/**
 * 恋爱脑主题：构建深度分析请求负载。
 * 关键逻辑：将结构化答题摘要一起传给 AI，避免仅基于总分导致文案单薄。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 深度分析负载。
 */
function buildLoveBrainDeepPayload(localResult) {
  return {
    score: localResult.score,
    answeredCount: localResult.answeredCount,
    levelRule: localResult.levelRule,
    stageDistribution: localResult.stageDistribution,
    topRiskScenarios: localResult.topRiskScenarios,
    answerSummary: localResult.answerSummary,
    summaryLines: localResult.summaryLines,
    localNarrative: localResult.localNarrative,
    actionTips: localResult.actionTips,
    posterModel: localResult.posterModel,
  };
}

/**
 * 恋爱脑主题：组装统一结果模型。
 * @param {object} result 分析结果。
 * @param {"deep"|"local"} sourceType 结果来源。
 * @returns {object} 统一结果对象。
 */
function buildLoveBrainUnifiedResult(result, sourceType) {
  const levelRule = result.levelRule ?? {};
  const scoreValue = Number(result.score ?? 0);
  const stageDistribution = Array.isArray(result.stageDistribution)
    ? result.stageDistribution
    : [];
  const topRiskScenarios = Array.isArray(result.topRiskScenarios)
    ? result.topRiskScenarios
    : [];
  const actionTips = Array.isArray(result.actionTips) ? result.actionTips : [];
  const summaryLines = Array.isArray(result.summaryLines) ? result.summaryLines : [];
  const insightText = String(result.localNarrative ?? result.insight ?? "").trim();

  const normalizedHighlightCard =
    result.highlightCard && typeof result.highlightCard === "object"
      ? {
          title: String(result.highlightCard.title ?? "").trim(),
          content: String(result.highlightCard.content ?? "").trim(),
        }
      : null;

  const fallbackTagChips = [
    levelRule.title,
    levelRule.coreTag,
  ].filter(Boolean);
  const normalizedTagChips =
    Array.isArray(result.tagChips) && result.tagChips.length > 0
      ? result.tagChips
          .map((item) => String(item ?? "").trim())
          .filter(Boolean)
      : fallbackTagChips;

  /**
   * 判定卡片补充信息：
   * 1. 不展示题量，改为“情绪主轴 + 高风险场景”。
   * 2. 便于用户快速理解“为什么是这个等级”。
   */
  const dominantStageItem = [...stageDistribution]
    .sort((leftItem, rightItem) => Number(rightItem.score ?? 0) - Number(leftItem.score ?? 0))[0];
  const dominantStageText = dominantStageItem?.name
    ? `${dominantStageItem.name}信号 ${Number(dominantStageItem.score ?? 0)}%`
    : "信号采样中";
  const topRiskScenarioName = String(topRiskScenarios[0]?.name ?? "").trim() || "关系边界波动";

  const defaultDetailSections = [
    {
      title: "扎心分析",
      items: [levelRule.piercingLine ?? "稳定观测中，建议稍后重试。"],
    },
    {
      title: "重点场景复盘",
      items:
        topRiskScenarios.length > 0
          ? topRiskScenarios.map((item) => `${item.name} -> ${item.optionLabel}`)
          : ["你当前在关键触发场景更容易把短期情绪当作长期关系结论。"],
    },
    {
      title: "降温建议",
      items:
        actionTips.length > 0
          ? actionTips
          : ["先暂停情绪化投入，把判断拉回可验证的事实反馈。"],
    },
  ];

  const normalizedDetailSections = Array.isArray(result.detailSections)
    ? result.detailSections
        .map((sectionItem) => ({
          title: String(sectionItem?.title ?? "").trim(),
          items: Array.isArray(sectionItem?.items)
            ? sectionItem.items
                .map((item) => String(item ?? "").trim())
                .filter(Boolean)
            : [],
        }))
        .filter((sectionItem) => sectionItem.title && sectionItem.items.length > 0)
    : [];
  const resolvedDetailSections =
    normalizedDetailSections.length > 0
      ? normalizedDetailSections
      : defaultDetailSections;

  return createUnifiedResult({
    source: sourceType,
    prefixLabel: "你的恋爱脑指数",
    scoreLabel: "指数得分",
    scoreSuffix: "/140",
    main: {
      name: levelRule.levelName ?? "恋爱脑待判定",
      score: scoreValue,
    },
    highlightCard: {
      title: normalizedHighlightCard?.title || "核心标签",
      content:
        normalizedHighlightCard?.content ||
        `${levelRule.title ?? "未命中"} · ${levelRule.coreTag ?? "稳定观测中"}`,
    },
    insight: insightText,
    tagChips: normalizedTagChips,
    distributionChart: {
      title: "状态分布",
      items: stageDistribution,
    },
    typeCard: {
      title: "恋爱脑判定卡片",
      items: [
        { label: "等级名称", value: levelRule.levelName ?? "待判定" },
        { label: "核心称号", value: levelRule.title ?? "待判定" },
        { label: "情绪主轴", value: dominantStageText },
        { label: "高风险场景", value: topRiskScenarioName },
      ],
    },
    topThreeTitle: "最容易上头的场景 Top 3",
    topThree: topRiskScenarios.map((item) => ({
      name: item.name,
      score: Number(item.score ?? 0),
    })),
    detailSections: resolvedDetailSections,
    summaryTitle: String(result.summaryTitle ?? "答卷回放").trim() || "答卷回放",
    summaryLines,
    restartButtonText: "再测一次恋爱脑指数",
    posterModel: {
      ...(result.posterModel ?? {}),
      indexScore: scoreValue,
      levelName: levelRule.levelName ?? "恋爱脑待判定",
      levelTitle: levelRule.title ?? "待判定",
      coreTag: levelRule.coreTag ?? "稳定观测中",
      piercingLine:
        levelRule.piercingLine ?? "稳定观测中，建议稍后重试。",
      narrative:
        String(result.posterModel?.narrative ?? "").trim() ||
        insightText ||
        String(result.localNarrative ?? "").trim(),
      stageDistribution,
      topRiskScenarios,
    },
    commercialCta: {
      enabled: true,
      text: "",
      href: "/mbti",
    },
  });
}

/**
 * 恋爱脑主题：构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果（兜底）。
 * @returns {object} 统一结果对象。
 */
function buildLoveBrainDeepUnifiedResult(deepResult, localResult) {
  const normalizedResult = {
    ...localResult,
    ...deepResult,
  };
  return buildLoveBrainUnifiedResult(normalizedResult, "deep");
}

/**
 * 恋爱脑主题：构建本地兜底展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {object} 统一结果对象。
 */
function buildLoveBrainLocalUnifiedResult(localResult) {
  return buildLoveBrainUnifiedResult(localResult, "local");
}

/**
 * 统一主题配置列表。
 * 新增测试时只需：
 * 1. 加题库和分析器
 * 2. 新增一个配置对象
 * 不再需要复制页面组件与入口文件。
 * survey 字段约定：
 * 1. questions：完整题库数组，或返回题库数组的异步函数（用于按需加载）。
 * 2. questionSelection：抽题数量区间（默认随机抽题）。
 *    可选字段：ensureDimensionCoverage + dimensionKey，用于按维度覆盖抽题。
 *    可选字段：useSequentialQuestionOrder，用于按题库顺序截取固定题量（剧情模式）。
 * 3. runLocalAnalysis(selectedQuestions, answerIds)：本地分析方法，支持同步或异步返回。
 */
export const SURVEY_THEME_CONFIGS = [
  {
    key: "city",
    routePaths: ["/", "/index.html", "/city", "/city.html"],
    pageMeta: {
      title: "城市匹配问卷",
      description: "通过生活习惯答卷，匹配最适合长期居住的城市。",
    },
    theme: {
      className: "theme-city",
      badge: "CITY MATCH",
      title: "通过生活习惯，推断最适合你的居住城市",
      description:
        "回答日常问题，先做结构化匹配，再生成更完整的城市建议。",
      progressColor: "linear-gradient(90deg, #0f8a63, #43b78b)",
      progressTrackColor: "rgba(40, 95, 75, 0.13)",
      checkedColor: "#0f8a63",
      sourceTag: {
        deep: {
          label: "深度匹配结果",
          color: "#e8f7f0",
          textColor: "#1b6a50",
        },
        local: {
          label: "本地规则兜底结果",
          color: "#fff3e3",
          textColor: "#9c5d00",
        },
      },
      loadingMessages: [
        "正在汇总你的生活偏好...",
        "正在比对候选城市画像...",
        "正在生成你的居住建议...",
      ],
      submitButtonText: "汇总并开始匹配",
      nextButtonText: "下一步",
    },
    survey: {
      questions: async () => {
        const { QUESTION_BANK } = await import("../data/questionBank");
        return QUESTION_BANK;
      },
      questionSelection: { minCount: 10, maxCount: 15 },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const [{ analyzeCitiesLocally }, { CITY_PROFILES }] = await Promise.all([
          import("../services/localAnalyzer"),
          import("../data/cityProfiles"),
        ]);
        const localResult = analyzeCitiesLocally({
          questions: selectedQuestions,
          answerIds,
          cities: CITY_PROFILES,
        });
        return {
          ...localResult,
          candidateCities: CITY_PROFILES.map((item) => ({
            name: item.name,
            profile: item.profile,
            traits: item.traits,
          })),
        };
      },
      buildDeepPayload: buildCityDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeCityWithAI } = await import("../services/aiAnalyzer");
        return analyzeCityWithAI(payload, { timeoutMs: 26000 });
      },
      buildDeepUnifiedResult: buildCityDeepUnifiedResult,
      buildLocalUnifiedResult: buildCityLocalUnifiedResult,
      deepFailToast: "深度匹配暂不可用，已切换本地规则结果",
    },
  },
  {
    key: "fortune",
    routePaths: ["/fortune", "/fortune.html", "/fortune-2026", "/fortune-2026.html"],
    pageMeta: {
      title: "测你 2026 年的转运关键词",
      description: "通过日常生活场景答卷，生成你的 2026 关键词提示。",
    },
    theme: {
      className: "theme-fortune",
      badge: "FORTUNE · 2026",
      title: "测你 2026 年的转运关键词",
      description: "通过日常选择识别年度势能结构，生成关键词与行动建议。",
      progressColor: "linear-gradient(90deg, #ff7a3d, #f7b955)",
      progressTrackColor: "rgba(163, 88, 43, 0.15)",
      checkedColor: "#ff7a3d",
      sourceTag: {
        deep: {
          label: "深度解读结果",
          color: "#fff1e7",
          textColor: "#a14f1f",
        },
        local: {
          label: "基础解析结果",
          color: "#fff5de",
          textColor: "#9c6500",
        },
      },
      loadingMessages: [
        "正在测试你的年度势能...",
        "正在校准你的关键词轨迹...",
        "正在匹配你的转运主轴...",
        "正在生成你的 2026 提示...",
      ],
      submitButtonText: "开始 2026 关键词解析",
      nextButtonText: "下一题",
    },
    survey: {
      questions: async () => {
        const { FORTUNE_2026_QUESTION_BANK } = await import(
          "../data/fortune2026QuestionBank"
        );
        return FORTUNE_2026_QUESTION_BANK;
      },
      questionSelection: { minCount: 10, maxCount: 15 },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const { analyzeFortune2026Locally } = await import(
          "../services/fortune2026Analyzer"
        );
        return analyzeFortune2026Locally({
          questions: selectedQuestions,
          answerIds,
        });
      },
      buildDeepPayload: buildFortuneDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeFortune2026WithAI } = await import(
          "../services/fortune2026AiAnalyzer"
        );
        return analyzeFortune2026WithAI(payload, { timeoutMs: 26000 });
      },
      buildDeepUnifiedResult: buildFortuneDeepUnifiedResult,
      buildLocalUnifiedResult: buildFortuneLocalUnifiedResult,
      deepFailToast: "深度解读暂不可用，已切换基础解析",
    },
  },
  {
    key: "ancient",
    routePaths: ["/ancient", "/ancient-identity", "/ancient-identity.html"],
    pageMeta: {
      title: "入梦千年：测测你骨子里流着谁的血液？",
      description: "30 道古风江湖题，锁定你的终极古代身份与爆款判词。",
    },
    theme: {
      className: "theme-ancient",
      badge: "Jianghu Archetype",
      title: "入梦千年：测测你骨子里流着谁的血液？",
      description: () => buildAncientThemeDescription(),
      progressColor: "linear-gradient(90deg, #68412a, #a95f33 54%, #d9a15e)",
      progressTrackColor: "rgba(83, 52, 29, 0.22)",
      checkedColor: "#7d4a2c",
      sourceTag: {
        deep: {
          label: "AI 深度判词",
          color: "#f3e4cf",
          textColor: "#603b25",
        },
        local: {
          label: "规则判定结果",
          color: "#f8efe3",
          textColor: "#7b5536",
        },
      },
      loadingMessages: [
        "正在翻阅命格卷轴...",
        "正在统计四象倾向...",
        "正在锁定江湖身份坐标...",
        "正在落笔你的爆款判词...",
      ],
      submitButtonText: "解锁我的终极身份",
      nextButtonText: "下一题",
    },
    survey: {
      questions: async () => {
        const { ANCIENT_IDENTITY_QUESTION_BANK } = await import(
          "../data/ancientIdentityQuestionBank"
        );
        return ANCIENT_IDENTITY_QUESTION_BANK;
      },
      questionSelection: { minCount: 30, maxCount: 30 },
      autoAdvanceOnSelect: true,
      minimumAnalyzingDurationMs: 1300,
      // 关键逻辑：古代身份测试强制封面页，先完成叙事入场再开始答题。
      cover: {
        enabled: true,
        kicker: "全网首发 · 准到发毛",
        titleEmphasis: "入梦千年",
        titleMain: "测测你在古代到底是谁？",
        promoTag: "高浓度 · 30题沉浸式推演",
        intro:
          "是仗剑天涯的隐士，还是富甲一方的权臣？完成 30 道场景题，系统将锁定你的终极古代身份。",
        points: [
          "你的每次选择，都会在命格卷轴里留下痕迹。",
          "武力、才情、守护、烟火四象并行，拒绝模板化结论。",
          "结果不仅有身份，还会给出古代与现代的双向人格映射。",
        ],
        hookLine: "你以为你是甄嬛，其实你可能是冷宫守门人？",
        startButtonText: "立即开启我的古代人生",
        socialProof: "已有 1w+ 人完成穿越",
        tip: "预计耗时 3-4 分钟",
      },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const { analyzeAncientIdentityLocally } = await import(
          "../services/ancientIdentityAnalyzer"
        );
        return analyzeAncientIdentityLocally({
          questions: selectedQuestions,
          answerIds,
        });
      },
      buildDeepPayload: buildAncientDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeAncientIdentityWithDeepInsight } = await import(
          "../services/ancientIdentityAiAnalyzer"
        );
        return analyzeAncientIdentityWithDeepInsight(payload, { timeoutMs: 26000 });
      },
      buildDeepUnifiedResult: buildAncientDeepUnifiedResult,
      buildLocalUnifiedResult: buildAncientLocalUnifiedResult,
      deepFailToast: "深度判定暂不可用，已切换基础判定",
    },
  },
  {
    key: "talent",
    routePaths: ["/talent", "/hidden-talent", "/hidden-talent.html"],
    pageMeta: {
      title: "凭直觉选看你隐藏的天赋是什么",
      description: "通过直觉式选择，生成你的隐藏天赋原型和行动建议。",
    },
    theme: {
      className: "theme-talent",
      badge: "INTUITION TALENT",
      title: "凭直觉选看你隐藏的天赋是什么",
      description: "通过日常反应与选择偏好，生成你的核心天赋原型与盲点提醒。",
      progressColor: "linear-gradient(90deg, #0c9894, #f4a43d)",
      progressTrackColor: "rgba(24, 103, 110, 0.14)",
      checkedColor: "#0c9894",
      sourceTag: {
        deep: {
          label: "深度生成结果",
          color: "#eafcfb",
          textColor: "#166867",
        },
        local: {
          label: "基础生成结果",
          color: "#fff7e8",
          textColor: "#9f6b16",
        },
      },
      loadingMessages: [
        "正在捕捉你的直觉信号...",
        "正在拼接你的天赋轨迹...",
        "正在匹配你的隐藏能力图谱...",
        "正在生成你的天赋关键词...",
      ],
      submitButtonText: "开始天赋生成",
      nextButtonText: "下一题",
    },
    survey: {
      questions: async () => {
        const { HIDDEN_TALENT_QUESTION_BANK } = await import(
          "../data/hiddenTalentQuestionBank"
        );
        return HIDDEN_TALENT_QUESTION_BANK;
      },
      questionSelection: { minCount: 10, maxCount: 15 },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const { analyzeHiddenTalentLocally } = await import(
          "../services/hiddenTalentAnalyzer"
        );
        return analyzeHiddenTalentLocally({
          questions: selectedQuestions,
          answerIds,
        });
      },
      buildDeepPayload: buildTalentDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeHiddenTalentWithDeepInsight } = await import(
          "../services/hiddenTalentAiAnalyzer"
        );
        return analyzeHiddenTalentWithDeepInsight(payload, { timeoutMs: 26000 });
      },
      buildDeepUnifiedResult: buildTalentDeepUnifiedResult,
      buildLocalUnifiedResult: buildTalentLocalUnifiedResult,
      deepFailToast: "深度生成暂不可用，已切换基础生成",
    },
  },
  {
    key: "benefactor",
    routePaths: [
      "/benefactor",
      "/benefactor.html",
      "/helper-star",
      "/helper",
    ],
    pageMeta: {
      title: "测试2026你的贵人星座",
      description: "通过日常选择匹配你在 2026 年最容易遇到的贵人星座类型。",
    },
    theme: {
      className: "theme-benefactor",
      badge: "BENEFACTOR STAR",
      title: "测试2026你的贵人星座",
      description: "从日常反应里匹配最契合你的贵人星座，并给出可执行的协作提示。",
      progressColor: "linear-gradient(90deg, #5a6bff, #ff8aa0)",
      progressTrackColor: "rgba(75, 87, 149, 0.2)",
      checkedColor: "#5a6bff",
      sourceTag: {
        deep: {
          label: "深度匹配结果",
          color: "#edf0ff",
          textColor: "#3f4ca8",
        },
        local: {
          label: "基础匹配结果",
          color: "#fff0f4",
          textColor: "#a44b66",
        },
      },
      loadingMessages: [
        "正在捕捉你的贵人频率...",
        "正在比对 12 星座支持画像...",
        "正在匹配你的贵人协作轨迹...",
        "正在生成你的 2026 贵人提示...",
      ],
      submitButtonText: "开始贵人星座匹配",
      nextButtonText: "下一题",
    },
    survey: {
      questions: async () => {
        const { BENEFACTOR_2026_QUESTION_BANK } = await import(
          "../data/benefactor2026QuestionBank"
        );
        return BENEFACTOR_2026_QUESTION_BANK;
      },
      questionSelection: { minCount: 10, maxCount: 15 },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const { analyzeBenefactor2026Locally } = await import(
          "../services/benefactor2026Analyzer"
        );
        return analyzeBenefactor2026Locally({
          questions: selectedQuestions,
          answerIds,
        });
      },
      buildDeepPayload: buildBenefactorDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeBenefactor2026WithAI } = await import(
          "../services/benefactor2026AiAnalyzer"
        );
        return analyzeBenefactor2026WithAI(payload, { timeoutMs: 26000 });
      },
      buildDeepUnifiedResult: buildBenefactorDeepUnifiedResult,
      buildLocalUnifiedResult: buildBenefactorLocalUnifiedResult,
      deepFailToast: "深度匹配暂不可用，已切换基础匹配",
    },
  },
  {
    key: "color-2026",
    routePaths: ["/color", "/color2026", "/color-2026", "/theme-color"],
    pageMeta: {
      title: "测试2026年你的主题色",
      description: "通过日常偏好匹配你的 2026 主题色，并给出生活化建议。",
    },
    theme: {
      className: "theme-color-2026",
      badge: "COLOR MOOD · 2026",
      title: "测试2026年你的主题色",
      description:
        "从日常选择中识别你的年度主色调，作答中页面会逐步靠近你的主题色。",
      progressColor: "linear-gradient(90deg, #6a78df, #f090a5)",
      progressTrackColor: "rgba(105, 114, 164, 0.2)",
      checkedColor: "#6a78df",
      sourceTag: {
        deep: {
          label: "深度配色结果",
          color: "#edf1ff",
          textColor: "#3f50aa",
        },
        local: {
          label: "基础配色结果",
          color: "#fff0f5",
          textColor: "#9f4f69",
        },
      },
      loadingMessages: [
        "正在提取你的配色偏好...",
        "正在比对 2026 主题色画像...",
        "正在生成你的年度色卡...",
        "正在整理你的日常色彩建议...",
      ],
      submitButtonText: "生成我的2026主题色",
      nextButtonText: "下一题",
      runtimeDefaultKey: "blue",
      runtimePalette: COLOR_2026_RUNTIME_PALETTE,
    },
    survey: {
      questions: async () => {
        const { COLOR_2026_QUESTION_BANK } = await import(
          "../data/color2026QuestionBank"
        );
        return COLOR_2026_QUESTION_BANK;
      },
      questionSelection: { minCount: 10, maxCount: 15 },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const { analyzeColor2026Locally } = await import(
          "../services/color2026Analyzer"
        );
        return analyzeColor2026Locally({
          questions: selectedQuestions,
          answerIds,
        });
      },
      buildDeepPayload: buildColorThemeDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeColor2026WithAI } = await import(
          "../services/color2026AiAnalyzer"
        );
        return analyzeColor2026WithAI(payload, { timeoutMs: 26000 });
      },
      buildDeepUnifiedResult: buildColorThemeDeepUnifiedResult,
      buildLocalUnifiedResult: buildColorThemeLocalUnifiedResult,
      deepFailToast: "深度配色暂不可用，已切换基础配色结果",
    },
  },
  {
    key: "romance",
    routePaths: ["/romance", "/romance-test", "/romantic", "/1314-love"],
    pageMeta: {
      title: "《你认为最浪漫的事》浪漫指数测试",
      description:
        "通过剧情化心动场景，触发第 13 章守门员判定，生成你的浪漫指数与分享海报。",
    },
    theme: {
      className: "theme-romance",
      badge: "ROMANCE DNA",
      title: "测测你的「浪漫封顶值」",
      description:
        "警告：只有极少数人能触发最终隐藏关卡。",
      participantCountLabel: "已有 12,764 人参与测试",
      progressColor: "linear-gradient(90deg, #d97899, #8b78d9)",
      progressTrackColor: "rgba(133, 101, 160, 0.2)",
      checkedColor: "#d97899",
      sourceTag: {
        deep: {
          label: "AI深度解读",
          color: "#fff0f6",
          textColor: "#954165",
        },
        local: {
          label: "本地稳定结果",
          color: "#f3eeff",
          textColor: "#5e4c96",
        },
      },
      loadingMessages: [
        "正在提取你的浪漫表达线索...",
        "正在计算 4 维浪漫 DNA 权重...",
        "正在生成你的专属浪漫称号...",
        "正在绘制可分享海报...",
      ],
      submitButtonText: "生成我的浪漫指数",
      nextButtonText: "下一题",
    },
    survey: {
      questions: async () => {
        const { ROMANCE_QUESTION_BANK } = await import(
          "../data/romanceQuestionBank"
        );
        return ROMANCE_QUESTION_BANK;
      },
      // 关键逻辑：宿命模式固定先出 13 题，Q13 通过后才动态解锁 Q14。
      questionSelection: { minCount: 13, maxCount: 13 },
      useSequentialQuestionOrder: true,
      autoAdvanceOnSelect: true,
      midwayEncouragement: {
        triggerQuestionNumber: 7,
        message: "哇，你的浪漫直觉很敏锐哦~ 继续！",
        durationMs: 1300,
      },
      destinyGatekeeper: {
        enabled: true,
        gateQuestionNumber: ROMANCE_DESTINY_GATE_DEFAULTS.gateQuestionNumber,
        thresholdPercent: ROMANCE_DESTINY_GATE_DEFAULTS.thresholdPercent,
        // 关键逻辑：遗憾结局遮罩停留时长（毫秒），适当延长情绪落点。
        lockHoldDurationMs: 2100,
        unlockQuestionId: "romance-final-chance",
        processingLines: [
          "检测到过量的浪漫因子...",
          "正在尝试突破宿命...",
        ],
        unlockLine: "你的坚定，为你赢得了第 14 次机会。",
        lockLines: [
          "有时候，遗憾也是一种美。",
          "你的理性保护了你，也让你停在了第 13 章。",
          "—— 故事至此终结。",
        ],
      },
      evaluateGatekeeper: async (selectedQuestions, answerIds, gateConfig) => {
        const { evaluateRomanceDestinyGate } = await import(
          "../services/romanceAnalyzer"
        );
        return evaluateRomanceDestinyGate({
          questions: selectedQuestions,
          answerIds,
          gateQuestionNumber: gateConfig.gateQuestionNumber,
          thresholdPercent: gateConfig.thresholdPercent,
        });
      },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const { analyzeRomanceLocally } = await import(
          "../services/romanceAnalyzer"
        );
        return analyzeRomanceLocally({
          questions: selectedQuestions,
          answerIds,
          gateQuestionNumber: ROMANCE_DESTINY_GATE_DEFAULTS.gateQuestionNumber,
          gateThresholdPercent: ROMANCE_DESTINY_GATE_DEFAULTS.thresholdPercent,
        });
      },
      buildDeepPayload: buildRomanceDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeRomanceWithAI } = await import(
          "../services/romanceInsightAnalyzer"
        );
        return analyzeRomanceWithAI(payload, { timeoutMs: 28000 });
      },
      buildDeepUnifiedResult: buildRomanceDeepUnifiedResult,
      buildLocalUnifiedResult: buildRomanceLocalUnifiedResult,
      deepFailToast: "深度解读暂不可用，已切换本地稳定结果",
    },
  },
  {
    key: "love-brain",
    routePaths: [
      "/love-brain",
      "/love-brain.html",
      "/lovebrain",
      "/love-brain-index",
    ],
    pageMeta: {
      title: "恋爱脑指数测试",
      description:
        "心理学内核 + 互联网梗文化，13-14 题随机判定你的恋爱脑指数。",
    },
    theme: {
      className: "theme-love-brain",
      badge: "LOVE BRAIN · 1314",
      title: "你的脑子里全是水还是野菜？",
      description:
        "13-14 题随机抽取，点击选项即自动下一题，生成你的恋爱脑指数与可保存长图。",
      progressColor: "linear-gradient(90deg, #00b6ff, #ff5e8d)",
      progressTrackColor: "rgba(66, 85, 140, 0.2)",
      checkedColor: "#00a0d9",
      sourceTag: {
        deep: {
          label: "AI深度结果",
          color: "#e7f4ff",
          textColor: "#245a8d",
        },
        local: {
          label: "本地兜底结果",
          color: "#fff1f6",
          textColor: "#9a3f64",
        },
      },
      loadingMessages: [
        "正在启动脑部扫描协议...",
        "正在提取恋爱行为信号...",
        "正在计算恋爱脑指数...",
        "正在合成你的扎心报告...",
      ],
      submitButtonText: "生成我的恋爱脑指数",
      nextButtonText: "下一题",
    },
    survey: {
      questions: async () => {
        const { LOVE_BRAIN_QUESTION_BANK } = await import(
          "../data/loveBrainQuestionBank"
        );
        return LOVE_BRAIN_QUESTION_BANK;
      },
      // 关键逻辑：保持“1314”暗示语义，每轮在 13~14 题间随机抽取。
      questionSelection: { minCount: 13, maxCount: 14 },
      autoAdvanceOnSelect: true,
      // 关键逻辑：保证“脑部扫描”仪式感，分析页最短展示 1.5 秒。
      minimumAnalyzingDurationMs: 1500,
      cover: {
        enabled: true,
        kicker: "恋爱脑指数测试",
        title: "你的脑子里全是水还是野菜？",
        intro:
          "这是一套“心理学内核 + 互联网梗文化”的情感测评。系统将随机抽取 13-14 题，根据你在真实场景中的选择计算恋爱脑指数。",
        // 关键逻辑：封面每轮随机生成 3 条语录，增强重测新鲜感。
        points: () => buildLoveBrainCoverQuotes(),
        startButtonText: "开始扫描我的恋爱脑",
        tip: "预计耗时 2-3 分钟",
      },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const { analyzeLoveBrainLocally } = await import(
          "../services/loveBrainAnalyzer"
        );
        return analyzeLoveBrainLocally({
          questions: selectedQuestions,
          answerIds,
        });
      },
      buildDeepPayload: buildLoveBrainDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeLoveBrainWithAI } = await import(
          "../services/loveBrainAiAnalyzer"
        );
        return analyzeLoveBrainWithAI(payload, { timeoutMs: 28000 });
      },
      buildDeepUnifiedResult: buildLoveBrainDeepUnifiedResult,
      buildLocalUnifiedResult: buildLoveBrainLocalUnifiedResult,
      deepFailToast: "AI深度解读暂不可用，已切换稳定结果",
    },
  },
  {
    key: "love-attachment",
    routePaths: ["/love", "/love-attachment", "/love-psych", "/love-test"],
    pageMeta: {
      title: "恋爱心理测试",
      description:
        "通过日常关系场景识别你的依恋模式，输出类型分布、家庭画像与关系建议。",
    },
    theme: {
      className: "theme-love-attachment",
      badge: "LOVE PSYCHOLOGY",
      title: "恋爱心理测试",
      description:
        "50题题库中每轮随机抽取15题，识别你的依恋类型并生成深度关系画像。",
      progressColor: "linear-gradient(90deg, #f08ca8, #7ea0f4)",
      progressTrackColor: "rgba(142, 111, 157, 0.2)",
      checkedColor: "#f08ca8",
      sourceTag: {
        deep: {
          label: "AI深度分析结果",
          color: "#fff0f6",
          textColor: "#9a3c67",
        },
        local: {
          label: "本地基础结果",
          color: "#eef3ff",
          textColor: "#4458a5",
        },
      },
      loadingMessages: [
        "正在整理你的亲密互动信号...",
        "正在拟合依恋模式分布...",
        "正在生成你的关系心理画像...",
        "正在输出个性化关系建议...",
      ],
      submitButtonText: "生成我的恋爱心理报告",
      nextButtonText: "下一题",
    },
    survey: {
      questions: async () => {
        const { LOVE_ATTACHMENT_QUESTION_BANK } = await import(
          "../data/loveAttachmentQuestionBank"
        );
        return LOVE_ATTACHMENT_QUESTION_BANK;
      },
      questionSelection: { minCount: 15, maxCount: 15 },
      // 关键逻辑：恋爱心理测试启用封面页，进入题目前先建立测试预期，降低“开局即答题”的压迫感。
      cover: {
        enabled: true,
        kicker: "测试简介",
        title: "恋爱心理测试",
        intro:
          "这是一场关于亲密关系与安全感的探索。你将通过 15 道场景题，识别自己的依恋模式，并获得关系建议与行动方向。",
        points: [
          "本轮固定 15 题，点击选项即可作答。",
          "结果包含类型分布、关系画像与改进建议。",
          "完成后可查看摘要，支持再次重测。",
        ],
        startButtonText: "开始恋爱心理测试",
        tip: "预计耗时 3-4 分钟",
      },
      runLocalAnalysis: async (selectedQuestions, answerIds) => {
        const { analyzeLoveAttachmentLocally } = await import(
          "../services/loveAttachmentAnalyzer"
        );
        return analyzeLoveAttachmentLocally({
          questions: selectedQuestions,
          answerIds,
        });
      },
      buildDeepPayload: buildLoveAttachmentDeepPayload,
      runDeepAnalysis: async (payload) => {
        const { analyzeLoveAttachmentWithAI } = await import(
          "../services/loveAttachmentAiAnalyzer"
        );
        return analyzeLoveAttachmentWithAI(payload, { timeoutMs: 30000 });
      },
      buildDeepUnifiedResult: buildLoveAttachmentDeepUnifiedResult,
      buildLocalUnifiedResult: buildLoveAttachmentLocalUnifiedResult,
      deepFailToast: "AI结果暂不可用，已切换本地基础结果",
    },
  },
  {
    key: "mbti",
    routePaths: ["/mbti", "/mbti16", "/mbti.html"],
    pageMeta: {
      title: "类型学卡片中心",
      description:
        "12 类类型学测试中心：支持独立测试、结果卡片、本地缓存与进阶解读。",
    },
    theme: {
      className: "theme-mbti",
      badge: "TYPEOLOGY LAB",
      title: "类型学卡片中心",
      description:
        "统一管理 MBTI、九型人格、DISC 等 12 类测试，形成你的完整类型学卡片。",
      progressColor: "linear-gradient(90deg, #ef5a78, #8f8df5)",
      progressTrackColor: "rgba(76, 78, 122, 0.2)",
      checkedColor: "#ef5a78",
      sourceTag: {
        deep: {
          label: "深度解析结果",
          color: "#ffeaf0",
          textColor: "#9d2242",
        },
        local: {
          label: "基础解析结果",
          color: "#eef0ff",
          textColor: "#3d3f7b",
        },
      },
      loadingMessages: [
        "正在校准你的四维度偏好...",
        "正在比对 16 型人格画像...",
        "正在生成你的类型学卡片...",
        "正在整理你的人格建议...",
      ],
      submitButtonText: "生成类型学卡片",
      nextButtonText: "下一题",
    },
    /**
     * 关键逻辑：
     * `mbti` 主题由独立组件 `TypeologyLab.vue` 渲染，
     * 不走通用 SurveyEngine 的 survey 配置流程。
     */
  },
];

/**
 * 规范化路径：
 * 1. 统一小写。
 * 2. 去除尾部斜杠（根路径除外）。
 * @param {string} path 浏览器路径。
 * @returns {string} 规范化结果。
 */
function normalizePath(path) {
  if (!path || path === "/") {
    return "/";
  }

  const lowerCasePath = String(path).toLowerCase();
  return lowerCasePath.endsWith("/")
    ? lowerCasePath.slice(0, -1) || "/"
    : lowerCasePath;
}

/**
 * 路径到主题配置映射：
 * 复杂度评估：
 * 1. 初始化映射：O(T * P)，T 为主题数量，P 为每个主题的路径别名数量。
 * 2. 运行时查找：O(1)。
 */
const PATH_THEME_MAP = SURVEY_THEME_CONFIGS.reduce((accumulator, config) => {
  config.routePaths.forEach((pathItem) => {
    accumulator.set(normalizePath(pathItem), config);
  });
  return accumulator;
}, new Map());

/**
 * 默认主题配置（城市测试）。
 */
export const DEFAULT_SURVEY_THEME =
  SURVEY_THEME_CONFIGS.find((item) => item.key === "city") ??
  SURVEY_THEME_CONFIGS[0];

/**
 * 根据路径解析主题配置。
 * @param {string} path 浏览器路径。
 * @returns {object} 主题配置对象。
 */
export function resolveSurveyThemeByPath(path) {
  const normalizedPath = normalizePath(path);
  return PATH_THEME_MAP.get(normalizedPath) ?? DEFAULT_SURVEY_THEME;
}

/**
 * 判断路径是否是已注册主题路径。
 * 复杂度评估：Map 查找为 O(1)。
 * @param {string} path 浏览器路径。
 * @returns {boolean} 是否命中主题路径。
 */
export function hasSurveyThemePath(path) {
  const normalizedPath = normalizePath(path);
  return PATH_THEME_MAP.has(normalizedPath);
}
