import { SOUL_CAT_ARTWORK_LIBRARY } from "./soulCatArtwork";

/**
 * 灵魂猫咪兼容性标签库：
 * 1. personalityTags 表示“测试得到的猫格标签”。
 * 2. breedTags 表示“目标饲养品种标签”。
 * 关键逻辑：统一以 key 对齐，确保算法与素材资源一一对应。
 */
const SOUL_CAT_COMPATIBILITY_TAGS = Object.freeze({
  ragdoll: {
    name: "布偶猫",
    personalityTags: ["粘人", "敏感", "温柔"],
    breedTags: ["粘人", "爱撒娇", "怕孤单"],
  },
  "british-shorthair": {
    name: "英短猫",
    personalityTags: ["佛系", "安稳", "独立"],
    breedTags: ["独立", "稳重", "安静"],
  },
  "american-shorthair": {
    name: "美短猫",
    personalityTags: ["活泼", "好奇", "乐天"],
    breedTags: ["活泼", "亲人", "适应力强"],
  },
  siamese: {
    name: "暹罗猫",
    personalityTags: ["忠诚", "粘人", "专一"],
    breedTags: ["话痨", "粘人", "聪明"],
  },
  persian: {
    name: "波斯猫",
    personalityTags: ["优雅", "慢热", "高冷"],
    breedTags: ["怕生", "娇气", "高颜值"],
  },
  "maine-coon": {
    name: "缅因猫",
    personalityTags: ["守护", "温柔", "稳重"],
    breedTags: ["温和", "体型大", "亲人"],
  },
  "devon-rex": {
    name: "德文卷毛猫",
    personalityTags: ["古怪", "调皮", "好奇"],
    breedTags: ["好动", "爱互动", "黏人"],
  },
  "orange-cat": {
    name: "橘猫",
    personalityTags: ["佛系", "干饭", "豁达"],
    breedTags: ["贪吃", "独立", "乐天"],
  },
  "native-cat": {
    name: "狸花猫",
    personalityTags: ["独立", "自由", "警觉"],
    breedTags: ["皮实", "警觉", "独立"],
  },
});

/**
 * 默契度分层阈值：
 * 关键逻辑：严格按照产品规则判定高/中/低匹配区间。
 */
const SOUL_CAT_COMPATIBILITY_LEVEL_RULES = Object.freeze([
  { key: "high", minScore: 60, label: "高匹配" },
  { key: "medium", minScore: 30, label: "中匹配" },
  { key: "low", minScore: 0, label: "低匹配" },
]);

/**
 * 标签语义归一映射：
 * 关键逻辑：把近义词映射到统一语义标签，避免“同类表达不同词”导致误判低匹配。
 */
const SOUL_CAT_TAG_CANONICAL_MAP = Object.freeze({
  黏人: "粘人",
  亲人: "粘人",
  爱互动: "粘人",
  怕孤单: "敏感",
  怕生: "敏感",
  爱撒娇: "温柔",
  温和: "温柔",
  乐天: "豁达",
  安静: "佛系",
  稳重: "安稳",
  聪明: "好奇",
  好动: "活泼",
  调皮: "活泼",
  贪吃: "干饭",
  皮实: "独立",
  警觉: "独立",
});

/**
 * 归一化用于匹配的语义标签。
 * @param {string} tagLabel 原始标签。
 * @returns {string} 归一化标签。
 */
function normalizeMatchTag(tagLabel) {
  const normalizedLabel = String(tagLabel ?? "").trim();
  if (!normalizedLabel) {
    return "";
  }

  return SOUL_CAT_TAG_CANONICAL_MAP[normalizedLabel] ?? normalizedLabel;
}

/**
 * 规范化标签数组。
 * 复杂度评估：O(T)
 * T 为标签数量（当前固定 3），属于常量级开销。
 * @param {Array<string>} tags 标签列表。
 * @returns {Array<string>} 去重后的标签列表。
 */
function normalizeTagList(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  const normalizedTags = tags
    .map((tagItem) => String(tagItem ?? "").trim())
    .filter(Boolean);
  return [...new Set(normalizedTags)];
}

/**
 * 构建品种选项列表（按测试素材顺序）。
 * 复杂度评估：O(B)
 * B 为品种数量（固定 9），线性遍历一次素材表。
 * @returns {Array<{ key: string, name: string, artworkUrl: string, artworkAlt: string, personalityTags: Array<string>, breedTags: Array<string> }>} 标准化选项。
 */
function createSoulCatBreedOptions() {
  return SOUL_CAT_ARTWORK_LIBRARY.map((artworkItem) => {
    const normalizedKey = String(artworkItem?.key ?? "").trim();
    const tagMeta = SOUL_CAT_COMPATIBILITY_TAGS[normalizedKey];
    if (!normalizedKey || !tagMeta) {
      return null;
    }

    return {
      key: normalizedKey,
      name: String(tagMeta.name ?? "").trim() || "待补充品种",
      artworkUrl: String(artworkItem?.url ?? "").trim(),
      artworkAlt: String(artworkItem?.alt ?? "").trim(),
      personalityTags: normalizeTagList(tagMeta.personalityTags),
      breedTags: normalizeTagList(tagMeta.breedTags),
    };
  }).filter(Boolean);
}

/**
 * 品种选项常量：
 * 关键逻辑：模块初始化时只构建一次，避免每次计算重复创建对象。
 */
const SOUL_CAT_BREED_OPTIONS = Object.freeze(createSoulCatBreedOptions());

/**
 * 品种查询索引：
 * 复杂度评估：初始化 O(B)，查询 O(1)。
 */
const SOUL_CAT_BREED_OPTION_INDEX = Object.freeze(
  SOUL_CAT_BREED_OPTIONS.reduce((indexMap, breedOption) => {
    indexMap[breedOption.key] = breedOption;
    return indexMap;
  }, {}),
);

/**
 * 根据得分命中默契等级规则。
 * @param {number} score 匹配得分（0~100）。
 * @returns {{ key: string, minScore: number, label: string }} 等级规则。
 */
function resolveCompatibilityLevelRule(score) {
  const safeScore = Number.isFinite(Number(score)) ? Number(score) : 0;
  return (
    SOUL_CAT_COMPATIBILITY_LEVEL_RULES.find(
      (levelRule) => safeScore >= levelRule.minScore,
    ) ?? SOUL_CAT_COMPATIBILITY_LEVEL_RULES[SOUL_CAT_COMPATIBILITY_LEVEL_RULES.length - 1]
  );
}

/**
 * 计算集合重合分。
 * 复杂度评估：O(S)
 * S 为 sourceSet 的元素数（当前固定 3），常量级。
 * @param {Set<string>} sourceSet 参考集合。
 * @param {Set<string>} targetSet 目标集合。
 * @returns {number} 重合分（0~100）。
 */
function calculateSetOverlapScore(sourceSet, targetSet) {
  if (!(sourceSet instanceof Set) || sourceSet.size === 0) {
    return 0;
  }

  let overlapCount = 0;
  sourceSet.forEach((tagItem) => {
    if (targetSet.has(tagItem)) {
      overlapCount += 1;
    }
  });

  return Math.round((overlapCount / sourceSet.size) * 100);
}

/**
 * 返回测试内可选猫咪品种列表。
 * @returns {Array<{ key: string, name: string, artworkUrl: string, artworkAlt: string, personalityTags: Array<string>, breedTags: Array<string> }>} 品种选项。
 */
export function buildSoulCatBreedOptionList() {
  return SOUL_CAT_BREED_OPTIONS.map((breedOption) => ({
    ...breedOption,
    personalityTags: [...breedOption.personalityTags],
    breedTags: [...breedOption.breedTags],
  }));
}

/**
 * 计算猫格与品种的默契度。
 * 复杂度评估：O(Tp + Tb)
 * Tp 为猫格标签数，Tb 为品种标签数（当前均为 3），整体常量级。
 * @param {string} profileKey 测试得到的猫格 key。
 * @param {string} breedKey 下拉框选择的品种 key。
 * @returns {{
 *   score: number,
 *   levelKey: string,
 *   levelLabel: string,
 *   overlapTags: Array<string>,
 *   profile: { key: string, name: string, personalityTags: Array<string>, breedTags: Array<string>, artworkUrl: string, artworkAlt: string },
 *   breed: { key: string, name: string, personalityTags: Array<string>, breedTags: Array<string>, artworkUrl: string, artworkAlt: string }
 * } | null} 默契度结果。
 */
export function resolveSoulCatCompatibilityByKeys(profileKey, breedKey) {
  const normalizedProfileKey = String(profileKey ?? "").trim();
  const normalizedBreedKey = String(breedKey ?? "").trim();
  const profileOption = SOUL_CAT_BREED_OPTION_INDEX[normalizedProfileKey];
  const breedOption = SOUL_CAT_BREED_OPTION_INDEX[normalizedBreedKey];
  if (!profileOption || !breedOption) {
    return null;
  }

  const profileTagSet = new Set(
    profileOption.personalityTags.map((tagItem) => normalizeMatchTag(tagItem)).filter(Boolean),
  );
  const breedTagSet = new Set(
    breedOption.breedTags.map((tagItem) => normalizeMatchTag(tagItem)).filter(Boolean),
  );
  const breedCompositeTagSet = new Set([
    ...breedOption.breedTags.map((tagItem) => normalizeMatchTag(tagItem)).filter(Boolean),
    ...breedOption.personalityTags.map((tagItem) => normalizeMatchTag(tagItem)).filter(Boolean),
  ]);
  const overlapTags = [];
  profileOption.personalityTags.forEach((tagItem) => {
    const canonicalTag = normalizeMatchTag(tagItem);
    if (canonicalTag && breedCompositeTagSet.has(canonicalTag)) {
      overlapTags.push(tagItem);
    }
  });

  /**
   * 关键逻辑：
   * 1. strictScore 仅看“猫格标签 vs 品种标签”硬重合，体现品种特性匹配。
   * 2. semanticScore 加上“目标品种人格标签”做语义补偿，避免同款被低估。
   * 3. 最终以语义补偿为主（90%），让“同款/近似款”更符合用户体感。
   */
  const strictScore = calculateSetOverlapScore(profileTagSet, breedTagSet);
  const semanticScore = calculateSetOverlapScore(profileTagSet, breedCompositeTagSet);
  const rawOverlapScore = Math.round(strictScore * 0.1 + semanticScore * 0.9);
  /**
   * 关键逻辑：
   * 1. 展示分数统一归一到 20~100，避免用户看到“0 分”挫败反馈。
   * 2. 采用线性映射，保持不同品种之间的相对高低关系。
   */
  const overlapScore = Math.max(
    20,
    Math.min(100, 20 + Math.round(rawOverlapScore * 0.8)),
  );
  const matchedLevelRule = resolveCompatibilityLevelRule(overlapScore);

  return {
    score: overlapScore,
    levelKey: matchedLevelRule.key,
    levelLabel: matchedLevelRule.label,
    overlapTags,
    profile: profileOption,
    breed: breedOption,
  };
}
