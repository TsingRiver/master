import {
  FIVE_ELEMENT_BALANCED_LABEL,
  FIVE_ELEMENT_DISPLAY_CONFIG,
  FIVE_ELEMENT_GENERATE_MAP,
  FIVE_ELEMENT_KEYS,
  getFiveElementColor,
  getFiveElementLabel,
  resolveFiveElementRelation,
} from "../constants/fiveElements";
import { FIVE_ELEMENTS_CITY_PROFILES } from "../data/fiveElementsCityProfiles";

/**
 * 五行核心解读文案。
 */
const FIVE_ELEMENT_CORE_SUMMARY_MAP = Object.freeze({
  metal:
    "你偏向“先厘清边界，再推进执行”的节奏，适合秩序感强、规则清晰的生活环境。",
  wood:
    "你偏向“持续生长、温柔延展”的状态，适合有自然感与成长空间的城市氛围。",
  water:
    "你偏向“灵动通透、弹性应对”的方式，适合包容度高、流动感强的生活场域。",
  fire:
    "你偏向“热忱行动、即时推进”的模式，适合机会密度高、反馈快速的城市节奏。",
  earth:
    "你偏向“稳中求进、长期扎根”的取向，适合承载力强、长期可住的城市结构。",
});

/**
 * 生克关系对应分值：
 * 关键逻辑：优先体现“核心五行与城市核心五行”的匹配影响。
 */
const CORE_RELATION_SCORE_MAP = Object.freeze({
  same: 15,
  generates: 20,
  generatedBy: 9,
  controls: -10,
  controlledBy: -6,
  neutral: 0,
});

/**
 * 生克关系对应文案。
 */
const RELATION_TEXT_MAP = Object.freeze({
  same: "同频共振",
  generates: "相融相生",
  generatedBy: "互补互养",
  controls: "带有克制张力",
  controlledBy: "需要温和磨合",
  neutral: "形成互补平衡",
});

/**
 * 创建五行零分对象。
 * @returns {{ metal: number, wood: number, water: number, fire: number, earth: number }} 零分对象。
 */
function createZeroElementScoreMap() {
  return {
    metal: 0,
    wood: 0,
    water: 0,
    fire: 0,
    earth: 0,
  };
}

/**
 * 将分值限制到 [0, 100]。
 * @param {number} score 原始分值。
 * @returns {number} 合法分值。
 */
function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 标准化百分比映射并保证总和为 100。
 * 复杂度评估：O(E log E)
 * E 为五行维度数量（固定 5）。
 * @param {Record<string, number>} rawScoreMap 原始分值映射。
 * @returns {{ metal: number, wood: number, water: number, fire: number, earth: number }} 百分比映射。
 */
function normalizePercentMap(rawScoreMap) {
  const safeMap = FIVE_ELEMENT_KEYS.reduce((map, elementKey) => {
    const rawValue = Number(rawScoreMap?.[elementKey] ?? 0);
    map[elementKey] = Number.isFinite(rawValue) ? Math.max(0, rawValue) : 0;
    return map;
  }, {});

  const totalValue = FIVE_ELEMENT_KEYS.reduce(
    (sumValue, elementKey) => sumValue + safeMap[elementKey],
    0,
  );

  if (totalValue <= 0) {
    return {
      metal: 20,
      wood: 20,
      water: 20,
      fire: 20,
      earth: 20,
    };
  }

  const percentEntries = FIVE_ELEMENT_KEYS.map((elementKey) => {
    const exactPercent = (safeMap[elementKey] / totalValue) * 100;
    const floorPercent = Math.floor(exactPercent);
    return {
      key: elementKey,
      floorPercent,
      fraction: exactPercent - floorPercent,
    };
  });

  const floorSum = percentEntries.reduce(
    (sumValue, item) => sumValue + item.floorPercent,
    0,
  );
  const remainderCount = 100 - floorSum;

  percentEntries
    .sort((leftItem, rightItem) => rightItem.fraction - leftItem.fraction)
    .forEach((item, index) => {
      if (index < remainderCount) {
        item.floorPercent += 1;
      }
    });

  return percentEntries.reduce((map, item) => {
    map[item.key] = item.floorPercent;
    return map;
  }, {});
}

/**
 * 构建答卷摘要。
 * @param {Array<object>} questions 当前题库。
 * @param {Array<string|null>} answerIds 答案 ID 列表。
 * @returns {Array<object>} 结构化答卷摘要。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((question, questionIndex) => {
    const selectedOptionId = answerIds[questionIndex];
    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    );

    return {
      questionId: question.id,
      questionTitle: question.title,
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      elementKey: selectedOption?.elementKey ?? "",
      elementLabel: selectedOption?.elementLabel ?? "",
      weight: Number(question.weight ?? 1),
      elementScores:
        selectedOption?.elementScores ?? {
          metal: 1,
          wood: 1,
          water: 1,
          fire: 1,
          earth: 1,
        },
    };
  });
}

/**
 * 生成可读答卷回放文案。
 * @param {Array<object>} answerSummary 答卷摘要。
 * @returns {Array<string>} 可读回放文案。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map((item, index) => {
    const elementLabel = item.elementLabel ? `（${item.elementLabel}）` : "";
    return `${index + 1}. ${item.questionTitle} -> ${item.optionLabel}${elementLabel}`;
  });
}

/**
 * 累计五行总分。
 * @param {Array<object>} answerSummary 答卷摘要。
 * @returns {{ metal: number, wood: number, water: number, fire: number, earth: number }} 五行总分映射。
 */
function calculateElementTotals(answerSummary) {
  const totalMap = createZeroElementScoreMap();

  answerSummary.forEach((item) => {
    const questionWeight = Number(item.weight ?? 1);
    FIVE_ELEMENT_KEYS.forEach((elementKey) => {
      const baseScore = Number(item.elementScores?.[elementKey] ?? 1);
      totalMap[elementKey] += baseScore * questionWeight;
    });
  });

  return totalMap;
}

/**
 * 判定核心五行状态。
 * @param {{ metal: number, wood: number, water: number, fire: number, earth: number }} elementTotals 五行总分。
 * @param {{ metal: number, wood: number, water: number, fire: number, earth: number }} elementPercentages 五行占比。
 * @returns {{
 *  isBalanced: boolean,
 *  coreElements: Array<string>,
 *  displayName: string,
 *  topPercentage: number,
 *  summaryLine: string,
 *  tags: Array<string>
 * }} 核心状态。
 */
function resolveCoreProfile(elementTotals, elementPercentages) {
  const maxTotalScore = Math.max(
    ...FIVE_ELEMENT_KEYS.map((elementKey) => Number(elementTotals[elementKey] ?? 0)),
  );

  const coreElements = FIVE_ELEMENT_KEYS.filter((elementKey) => {
    const currentScore = Number(elementTotals[elementKey] ?? 0);
    return Math.abs(currentScore - maxTotalScore) <= 1e-6;
  });

  const isBalanced = coreElements.length > 1;
  const primaryElementKey = coreElements[0] ?? "";

  if (isBalanced) {
    const topPercentage = Math.max(
      ...coreElements.map((elementKey) => Number(elementPercentages[elementKey] ?? 0)),
    );

    return {
      isBalanced: true,
      coreElements,
      displayName: FIVE_ELEMENT_BALANCED_LABEL,
      topPercentage,
      summaryLine:
        "你的五行能量分布较均衡，既有稳定承载力，也有灵活应变能力，属于“综合五行”型。",
      tags: ["综合五行", "稳中有活", "可进可守"],
    };
  }

  const primaryElementLabel = getFiveElementLabel(primaryElementKey);

  return {
    isBalanced: false,
    coreElements,
    displayName: primaryElementLabel,
    topPercentage: Number(elementPercentages[primaryElementKey] ?? 0),
    summaryLine:
      FIVE_ELEMENT_CORE_SUMMARY_MAP[primaryElementKey] ??
      "你的能量主轴较清晰，适合围绕核心优势长期布局。",
    tags: [primaryElementLabel, "能量核心", "长期主轴"],
  };
}

/**
 * 构建五行分布列表。
 * @param {{ metal: number, wood: number, water: number, fire: number, earth: number }} elementPercentages 五行占比。
 * @returns {Array<{ key: string, name: string, score: number, color: string }>} 分布列表（按占比降序）。
 */
function buildElementDistribution(elementPercentages) {
  return FIVE_ELEMENT_KEYS.map((elementKey) => ({
    key: elementKey,
    name: getFiveElementLabel(elementKey),
    score: Number(elementPercentages[elementKey] ?? 0),
    color: getFiveElementColor(elementKey),
  })).sort((leftItem, rightItem) => rightItem.score - leftItem.score);
}

/**
 * 计算“用户五行分布 vs 城市五行分布”的相似度。
 * @param {object} userPercentages 用户五行占比。
 * @param {object} cityPercentages 城市五行占比。
 * @returns {number} 相似度（0~100）。
 */
function calculateDistributionSimilarity(userPercentages, cityPercentages) {
  const distanceValue = FIVE_ELEMENT_KEYS.reduce((distanceSum, elementKey) => {
    const userValue = Number(userPercentages[elementKey] ?? 0);
    const cityValue = Number(cityPercentages[elementKey] ?? 0);
    return distanceSum + Math.abs(userValue - cityValue);
  }, 0);

  // 关键逻辑：L1 距离上限为 200，除以 2 后映射到 0~100。
  const normalizedDistance = distanceValue / 2;
  return Math.max(0, 100 - normalizedDistance);
}

/**
 * 从核心五行关系中提取最优关系与分值。
 * @param {Array<string>} userCoreElements 用户核心五行列表。
 * @param {Array<string>} cityCoreElements 城市核心五行列表。
 * @returns {{ relationType: string, score: number, userElementKey: string, cityElementKey: string }} 最优关系结果。
 */
function resolveBestCoreRelation(userCoreElements, cityCoreElements) {
  let bestRelationResult = {
    relationType: "neutral",
    score: 0,
    userElementKey: userCoreElements[0] ?? "",
    cityElementKey: cityCoreElements[0] ?? "",
  };

  userCoreElements.forEach((userElementKey) => {
    cityCoreElements.forEach((cityElementKey) => {
      const relationType = resolveFiveElementRelation(userElementKey, cityElementKey);
      const relationScore = Number(CORE_RELATION_SCORE_MAP[relationType] ?? 0);

      if (relationScore > bestRelationResult.score) {
        bestRelationResult = {
          relationType,
          score: relationScore,
          userElementKey,
          cityElementKey,
        };
      }
    });
  });

  return bestRelationResult;
}

/**
 * 计算辅助加减分。
 * @param {object} userPercentages 用户五行占比。
 * @param {Array<string>} cityCoreElements 城市核心五行。
 * @returns {number} 辅助分值。
 */
function calculateAuxiliaryAdjustment(userPercentages, cityCoreElements) {
  const topUserElements = FIVE_ELEMENT_KEYS.map((elementKey) => ({
    key: elementKey,
    score: Number(userPercentages[elementKey] ?? 0),
  }))
    .sort((leftItem, rightItem) => rightItem.score - leftItem.score)
    .slice(0, 3);

  const rankWeightList = [1, 0.76, 0.55];
  const relationBaseMap = {
    same: 10,
    generates: 10,
    generatedBy: 6,
    controls: -8,
    controlledBy: -4,
    neutral: 0,
  };

  let adjustmentScore = 0;

  topUserElements.forEach((userItem, rankIndex) => {
    const rankWeight = rankWeightList[rankIndex] ?? 0.5;
    const percentageWeight = userItem.score / 100;

    cityCoreElements.forEach((cityCoreElementKey) => {
      const relationType = resolveFiveElementRelation(userItem.key, cityCoreElementKey);
      const relationBase = Number(relationBaseMap[relationType] ?? 0);
      adjustmentScore +=
        (relationBase * percentageWeight * rankWeight) /
        Math.max(1, cityCoreElements.length);
    });
  });

  return adjustmentScore;
}

/**
 * 计算城市匹配度。
 * @param {{ coreElements: Array<string>, elementProfile: object }} cityProfile 城市画像。
 * @param {{ coreElements: Array<string>, isBalanced: boolean }} coreProfile 用户核心状态。
 * @param {object} userPercentages 用户五行占比。
 * @returns {{
 *  score: number,
 *  similarityScore: number,
 *  coreAdjustment: number,
 *  auxiliaryAdjustment: number,
 *  bestCoreRelation: object
 * }} 匹配结果。
 */
function calculateCityMatchScore(cityProfile, coreProfile, userPercentages) {
  const cityPercentages = normalizePercentMap(cityProfile?.elementProfile ?? {});
  const similarityScore = calculateDistributionSimilarity(userPercentages, cityPercentages);
  const bestCoreRelation = resolveBestCoreRelation(
    coreProfile.coreElements,
    cityProfile.coreElements,
  );

  const coreAdjustment = coreProfile.isBalanced
    ? Math.round(bestCoreRelation.score * 0.65)
    : bestCoreRelation.score;
  const auxiliaryAdjustment = calculateAuxiliaryAdjustment(
    userPercentages,
    cityProfile.coreElements,
  );

  // 关键逻辑：先以分布相似度提供稳定底盘，再叠加核心生克与辅助匹配差异。
  const baseScore = 28 + similarityScore * 0.62;
  const totalScore = baseScore + coreAdjustment + auxiliaryAdjustment;

  return {
    // 关键逻辑：保留原始分用于后续“全城市统一校准”，避免高分段全部挤在 100。
    rawScore: Number(totalScore.toFixed(2)),
    similarityScore: clampScore(similarityScore),
    coreAdjustment,
    auxiliaryAdjustment,
    bestCoreRelation,
  };
}

/**
 * 对城市原始分做统一校准，避免高分段大量拥挤在 100。
 * 复杂度评估：O(C)
 * C 为城市数量；仅单次线性遍历。
 * @param {Array<object>} sortedCities 已按原始分降序排序的城市列表。
 * @returns {Array<object>} 写回校准分后的城市列表。
 */
function calibrateCityScores(sortedCities) {
  const safeCities = Array.isArray(sortedCities) ? sortedCities : [];
  if (safeCities.length === 0) {
    return [];
  }

  const rawScoreList = safeCities
    .map((cityItem) => Number(cityItem?.rawScore ?? cityItem?.score ?? 0))
    .filter((scoreValue) => Number.isFinite(scoreValue));

  if (rawScoreList.length === 0) {
    return safeCities.map((cityItem, cityIndex) => ({
      ...cityItem,
      score: Math.max(60, 95 - cityIndex),
    }));
  }

  const maxRawScore = Math.max(...rawScoreList);
  const minRawScore = Math.min(...rawScoreList);
  const rawSpread = maxRawScore - minRawScore;

  return safeCities.map((cityItem, cityIndex) => {
    const currentRawScore = Number(cityItem?.rawScore ?? cityItem?.score ?? 0);
    let calibratedScore = 60;

    if (!Number.isFinite(currentRawScore)) {
      // 关键逻辑：异常数据按排名做递减兜底，确保 UI 分数可读且有区分度。
      calibratedScore = Math.max(60, 90 - cityIndex);
    } else if (rawSpread < 2) {
      // 关键逻辑：当全体原始分过于集中时，采用“按名次递减”避免 Top3 同分。
      calibratedScore = Math.max(60, 95 - cityIndex);
    } else {
      const linearRatio = (currentRawScore - minRawScore) / rawSpread;
      const normalizedRatio = Math.max(0, Math.min(1, linearRatio));
      // 关键逻辑：使用轻微缓动曲线拉开头部差异，避免前几名过度贴近。
      const easedRatio = Math.pow(normalizedRatio, 0.88);
      const scaledScore = 55 + easedRatio * 42;
      calibratedScore = scaledScore - cityIndex * 0.08;
    }

    return {
      ...cityItem,
      rawScore: Number.isFinite(currentRawScore)
        ? Number(currentRawScore.toFixed(2))
        : 0,
      score: clampScore(calibratedScore),
    };
  });
}

/**
 * 构建城市匹配原因文案。
 * @param {{ isBalanced: boolean, coreElements: Array<string> }} coreProfile 用户核心状态。
 * @param {object} cityItem 城市对象。
 * @param {object} bestCoreRelation 最优核心关系。
 * @returns {string} 匹配原因文案。
 */
function buildCityReasonText(coreProfile, cityItem, bestCoreRelation) {
  if (coreProfile.isBalanced) {
    const cityCoreText = cityItem.coreElementLabels.join(" / ");
    return `你的能量结构较均衡，与${cityItem.name}的「${cityCoreText}」组合更容易形成长期稳定感。`;
  }

  const userCoreLabel = getFiveElementLabel(bestCoreRelation.userElementKey);
  const cityCoreLabel = getFiveElementLabel(bestCoreRelation.cityElementKey);
  const relationText = RELATION_TEXT_MAP[bestCoreRelation.relationType] ?? "形成互补";

  return `你的「${userCoreLabel}」能量，与${cityItem.name}的「${cityCoreLabel}」气韵${relationText}。`;
}

/**
 * 构建结果页核心洞察文案。
 * @param {{ displayName: string }} coreProfile 核心状态。
 * @param {{ name: string, score: number }} topCity 第一推荐城市。
 * @returns {string} 洞察文案。
 */
function buildInsight(coreProfile, topCity) {
  return `你的能量主轴是「${coreProfile.displayName}」，与${topCity.name}匹配度 ${topCity.score}%：建议优先围绕通勤半径、日常消费和社交场景做 1-3 个月试居验证。`;
}

/**
 * 五行城市本地分析。
 * 复杂度评估：
 * 1. 答卷累计：O(Q * E)
 * 2. 城市评分：O(C * E)
 * 3. 城市排序：O(C log C)
 * 总体复杂度：O(Q * E + C * E + C log C)
 * 其中 Q 为题目数量，C 为城市数量，E=5 为五行常量维度。
 * @param {{
 *  questions: Array<object>,
 *  answerIds: Array<string|null>,
 *  cities?: Array<object>
 * }} params 分析参数。
 * @returns {{
 *  answerSummary: Array<object>,
 *  summaryLines: Array<string>,
 *  elementTotals: object,
 *  elementPercentages: object,
 *  elementDistribution: Array<object>,
 *  coreProfile: object,
 *  topCity: object,
 *  topThree: Array<object>,
 *  scoredCities: Array<object>,
 *  energyInterpretationLines: Array<string>,
 *  cityReasonLines: Array<string>,
 *  typeCardItems: Array<object>,
 *  insight: string
 * }} 分析结果。
 */
export function analyzeFiveElementsCityLocally({
  questions,
  answerIds,
  cities = FIVE_ELEMENTS_CITY_PROFILES,
}) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const normalizedAnswerIds = Array.isArray(answerIds) ? answerIds : [];
  const normalizedCities = Array.isArray(cities) && cities.length > 0
    ? cities
    : FIVE_ELEMENTS_CITY_PROFILES;

  const answerSummary = buildAnswerSummary(normalizedQuestions, normalizedAnswerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const elementTotals = calculateElementTotals(answerSummary);
  const elementPercentages = normalizePercentMap(elementTotals);
  const coreProfile = resolveCoreProfile(elementTotals, elementPercentages);
  const elementDistribution = buildElementDistribution(elementPercentages);

  const rawScoredCities = normalizedCities
    .map((cityItem) => {
      const cityCoreElements = Array.isArray(cityItem.coreElements)
        ? cityItem.coreElements.filter((elementKey) => FIVE_ELEMENT_KEYS.includes(elementKey))
        : [];
      const safeCoreElements = cityCoreElements.length > 0 ? cityCoreElements : ["earth"];

      const scoreMeta = calculateCityMatchScore(
        {
          coreElements: safeCoreElements,
          elementProfile: cityItem.elementProfile,
        },
        coreProfile,
        elementPercentages,
      );

      const normalizedCityItem = {
        ...cityItem,
        coreElements: safeCoreElements,
        coreElementLabels: safeCoreElements.map((elementKey) => getFiveElementLabel(elementKey)),
        rawScore: scoreMeta.rawScore,
        score: scoreMeta.rawScore,
        similarityScore: scoreMeta.similarityScore,
        coreAdjustment: scoreMeta.coreAdjustment,
        auxiliaryAdjustment: Number(scoreMeta.auxiliaryAdjustment.toFixed(2)),
        bestCoreRelation: scoreMeta.bestCoreRelation,
      };

      return {
        ...normalizedCityItem,
        reasonText: buildCityReasonText(
          coreProfile,
          normalizedCityItem,
          scoreMeta.bestCoreRelation,
        ),
      };
    })
    .sort((leftCity, rightCity) => {
      if (rightCity.rawScore !== leftCity.rawScore) {
        return rightCity.rawScore - leftCity.rawScore;
      }

      // 关键逻辑：同分时优先高关注度城市，避免结果排序随机波动。
      if (leftCity.popularityRank !== rightCity.popularityRank) {
        return leftCity.popularityRank - rightCity.popularityRank;
      }

      return String(leftCity.name).localeCompare(String(rightCity.name), "zh-Hans-CN");
    });
  const scoredCities = calibrateCityScores(rawScoredCities);

  const topCity =
    scoredCities[0] ??
    {
      name: "待匹配城市",
      score: 0,
      coreElementLabels: ["五行待校准"],
      tags: ["数据待补全"],
      highlights: ["请补充题库与城市画像后重试"],
      reasonText: "当前结果数据不完整，暂无法生成可靠匹配。",
    };
  const topThree = scoredCities.slice(0, 3);

  const energyInterpretationLines = FIVE_ELEMENT_KEYS.map(
    (elementKey) => FIVE_ELEMENT_DISPLAY_CONFIG[elementKey].energyReading,
  );
  const cityReasonLines = [
    topCity.reasonText,
    ...(Array.isArray(topCity.highlights) ? topCity.highlights.slice(0, 2) : []),
  ];

  const primaryCoreElementKey = coreProfile.coreElements[0] ?? "";
  const generateDirectionElementKey = primaryCoreElementKey
    ? FIVE_ELEMENT_GENERATE_MAP[primaryCoreElementKey]
    : "";

  return {
    answerSummary,
    summaryLines,
    elementTotals,
    elementPercentages,
    elementDistribution,
    coreProfile,
    topCity,
    topThree,
    scoredCities,
    energyInterpretationLines,
    cityReasonLines,
    typeCardItems: [
      {
        label: "核心状态",
        value: coreProfile.displayName,
      },
      {
        label: "相生方向",
        value: coreProfile.isBalanced
          ? "五行互济"
          : getFiveElementLabel(generateDirectionElementKey),
      },
      {
        label: "城市锚点",
        value: `${topCity.name} · ${topCity.score}%`,
      },
    ],
    insight: buildInsight(coreProfile, topCity),
  };
}
