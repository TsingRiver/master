/**
 * MBTI 维度配置：
 * positive 表示轴分值 >= 0 时对应的字母。
 */
const MBTI_AXIS_CONFIG = {
  ei: {
    label: "能量来源",
    positive: "E",
    negative: "I",
  },
  sn: {
    label: "信息获取",
    positive: "N",
    negative: "S",
  },
  tf: {
    label: "决策偏好",
    positive: "T",
    negative: "F",
  },
  jp: {
    label: "生活方式",
    positive: "J",
    negative: "P",
  },
};

/**
 * 轴字段顺序：
 * 用于计算与输出时保证稳定序列。
 */
const MBTI_AXIS_KEYS = ["ei", "sn", "tf", "jp"];

/**
 * 16 型画像：
 * 向量用于距离评分（-100 / 100）。
 */
const MBTI_TYPE_PROFILES = [
  { type: "INTJ", title: "战略规划者", vector: { ei: -100, sn: 100, tf: 100, jp: 100 } },
  { type: "INTP", title: "逻辑分析者", vector: { ei: -100, sn: 100, tf: 100, jp: -100 } },
  { type: "ENTJ", title: "目标指挥者", vector: { ei: 100, sn: 100, tf: 100, jp: 100 } },
  { type: "ENTP", title: "创意辩证者", vector: { ei: 100, sn: 100, tf: 100, jp: -100 } },
  { type: "INFJ", title: "洞察引导者", vector: { ei: -100, sn: 100, tf: -100, jp: 100 } },
  { type: "INFP", title: "价值探索者", vector: { ei: -100, sn: 100, tf: -100, jp: -100 } },
  { type: "ENFJ", title: "共情领导者", vector: { ei: 100, sn: 100, tf: -100, jp: 100 } },
  { type: "ENFP", title: "灵感激活者", vector: { ei: 100, sn: 100, tf: -100, jp: -100 } },
  { type: "ISTJ", title: "秩序执行者", vector: { ei: -100, sn: -100, tf: 100, jp: 100 } },
  { type: "ISFJ", title: "可靠守护者", vector: { ei: -100, sn: -100, tf: -100, jp: 100 } },
  { type: "ESTJ", title: "组织管理者", vector: { ei: 100, sn: -100, tf: 100, jp: 100 } },
  { type: "ESFJ", title: "关系协调者", vector: { ei: 100, sn: -100, tf: -100, jp: 100 } },
  { type: "ISTP", title: "冷静实干者", vector: { ei: -100, sn: -100, tf: 100, jp: -100 } },
  { type: "ISFP", title: "感知体验者", vector: { ei: -100, sn: -100, tf: -100, jp: -100 } },
  { type: "ESTP", title: "临场行动者", vector: { ei: 100, sn: -100, tf: 100, jp: -100 } },
  { type: "ESFP", title: "现场感染者", vector: { ei: 100, sn: -100, tf: -100, jp: -100 } },
];

/**
 * MBTI 到九型签名映射。
 */
const ENNEAGRAM_SIGNATURE_MAP = {
  INTJ: "5w6 514 SP/SX",
  INTP: "5w4 594 SP/SO",
  ENTJ: "8w7 835 SX/SP",
  ENTP: "7w8 783 SX/SO",
  INFJ: "4w5 495 SO/SP",
  INFP: "4w5 479 SX/SP",
  ENFJ: "2w3 279 SO/SX",
  ENFP: "7w6 749 SX/SO",
  ISTJ: "1w9 163 SP/SO",
  ISFJ: "2w1 269 SO/SP",
  ESTJ: "8w9 863 SP/SO",
  ESFJ: "2w3 279 SO/SP",
  ISTP: "9w8 953 SP/SX",
  ISFP: "9w1 946 SX/SP",
  ESTP: "8w7 873 SX/SP",
  ESFP: "7w8 738 SO/SX",
};

/**
 * MBTI 到霍兰德码映射（两位简码）。
 */
const HOLLAND_CODE_MAP = {
  INTJ: "IR",
  INTP: "IA",
  ENTJ: "ER",
  ENTP: "AE",
  INFJ: "SI",
  INFP: "AI",
  ENFJ: "ES",
  ENFP: "AS",
  ISTJ: "CR",
  ISFJ: "SC",
  ESTJ: "EC",
  ESFJ: "ES",
  ISTP: "RI",
  ISFP: "AR",
  ESTP: "ER",
  ESFP: "AE",
};

/**
 * MBTI 到 DnD 阵营映射（中文）。
 */
const DND_ALIGNMENT_MAP = {
  INTJ: "守序中立",
  INTP: "绝对中立",
  ENTJ: "守序中立",
  ENTP: "混乱中立",
  INFJ: "中立善良",
  INFP: "混乱善良",
  ENFJ: "守序善良",
  ENFP: "混乱善良",
  ISTJ: "守序中立",
  ISFJ: "守序善良",
  ESTJ: "守序中立",
  ESFJ: "守序善良",
  ISTP: "绝对中立",
  ISFP: "中立善良",
  ESTP: "混乱中立",
  ESFP: "混乱善良",
};

/**
 * 轴零向量。
 * @returns {{ ei: number, sn: number, tf: number, jp: number }} 轴零向量。
 */
function createZeroAxisVector() {
  return {
    ei: 0,
    sn: 0,
    tf: 0,
    jp: 0,
  };
}

/**
 * 分值限制到 [0, 100]。
 * @param {number} value 原始值。
 * @returns {number} 限制后的值。
 */
function clampPercentage(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * 分值限制到 [0, 100]，并保留指定小数位。
 * 关键逻辑：MBTI Top3 需要保留更高精度，避免边界结果在整数取整后出现大量“同分并列”。
 * @param {number} value 原始值。
 * @param {number} [digits=1] 小数位数。
 * @returns {number} 限制并保留精度后的值。
 */
function clampPercentageWithPrecision(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const safeDigits = Math.max(0, Math.floor(digits));
  const precisionBase = 10 ** safeDigits;
  const clampedValue = Math.max(0, Math.min(100, value));
  return Math.round(clampedValue * precisionBase) / precisionBase;
}

/**
 * 分值限制到 [-100, 100]。
 * @param {number} value 原始值。
 * @returns {number} 限制后的值。
 */
function clampAxisScore(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(-100, Math.min(100, Math.round(value)));
}

/**
 * 构建结构化答卷摘要。
 * @param {Array<object>} questions 题目列表。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {Array<object>} 摘要对象。
 */
function buildAnswerSummary(questions, answerIds) {
  return questions.map((question, questionIndex) => {
    const selectedOption = question.options.find(
      (option) => option.id === answerIds[questionIndex],
    );

    return {
      questionId: question.id,
      questionTitle: question.title,
      optionId: selectedOption?.id ?? null,
      optionLabel: selectedOption?.label ?? "未作答",
      weight: question.weight,
      vector: selectedOption?.vector ?? {},
      dimensionTag: question.dimensionTag,
    };
  });
}

/**
 * 生成可读摘要。
 * @param {Array<object>} answerSummary 摘要对象数组。
 * @returns {Array<string>} 文本摘要。
 */
function buildSummaryLines(answerSummary) {
  return answerSummary.map(
    (item, index) => `${index + 1}. ${item.questionTitle} -> ${item.optionLabel}`,
  );
}

/**
 * 聚合轴分值。
 * 关键逻辑：
 * 1. 按题目权重累加用户选项向量。
 * 2. 按题目可选最大绝对值估算 maxAbs，用于标准化到 [-100,100]。
 * @param {Array<object>} questions 题目列表。
 * @param {Array<string|null>} answerIds 用户答案。
 * @returns {{ axisScores: object, axisStrength: object, weightedSum: object, maxAbsSum: object }} 轴分值结果。
 */
function buildAxisScores(questions, answerIds) {
  const weightedSum = createZeroAxisVector();
  const maxAbsSum = createZeroAxisVector();

  questions.forEach((question, questionIndex) => {
    const selectedOption = question.options.find(
      (option) => option.id === answerIds[questionIndex],
    );

    if (!selectedOption) {
      return;
    }

    MBTI_AXIS_KEYS.forEach((axisKey) => {
      const selectedAxisValue = Number(selectedOption.vector?.[axisKey] ?? 0);
      if (selectedAxisValue !== 0) {
        weightedSum[axisKey] += selectedAxisValue * question.weight;
      }

      const maxOptionAbs = question.options.reduce((currentMax, option) => {
        const axisValue = Number(option.vector?.[axisKey] ?? 0);
        return Math.max(currentMax, Math.abs(axisValue));
      }, 0);

      if (maxOptionAbs > 0) {
        maxAbsSum[axisKey] += maxOptionAbs * question.weight;
      }
    });
  });

  const axisScores = createZeroAxisVector();
  const axisStrength = createZeroAxisVector();

  MBTI_AXIS_KEYS.forEach((axisKey) => {
    const denominator = maxAbsSum[axisKey];
    if (denominator <= 0) {
      axisScores[axisKey] = 0;
      axisStrength[axisKey] = 0;
      return;
    }

    const normalized = (weightedSum[axisKey] / denominator) * 100;
    axisScores[axisKey] = clampAxisScore(normalized);
    axisStrength[axisKey] = clampPercentage(Math.abs(normalized));
  });

  return {
    axisScores,
    axisStrength,
    weightedSum,
    maxAbsSum,
  };
}

/**
 * 根据轴分值推导 MBTI 字母。
 * @param {{ ei: number, sn: number, tf: number, jp: number }} axisScores 轴分值。
 * @returns {{ typeCode: string, letters: object }} 类型码与字母明细。
 */
function resolveMbtiCode(axisScores) {
  const letters = {
    ei: axisScores.ei >= 0 ? MBTI_AXIS_CONFIG.ei.positive : MBTI_AXIS_CONFIG.ei.negative,
    sn: axisScores.sn >= 0 ? MBTI_AXIS_CONFIG.sn.positive : MBTI_AXIS_CONFIG.sn.negative,
    tf: axisScores.tf >= 0 ? MBTI_AXIS_CONFIG.tf.positive : MBTI_AXIS_CONFIG.tf.negative,
    jp: axisScores.jp >= 0 ? MBTI_AXIS_CONFIG.jp.positive : MBTI_AXIS_CONFIG.jp.negative,
  };

  return {
    typeCode: `${letters.ei}${letters.sn}${letters.tf}${letters.jp}`,
    letters,
  };
}

/**
 * 从类型码解析各轴字母。
 * @param {string} typeCode MBTI 类型码。
 * @returns {{ ei: string, sn: string, tf: string, jp: string }} 轴字母映射。
 */
function resolveTypeLettersFromCode(typeCode) {
  const normalizedTypeCode = String(typeCode ?? "").trim().toUpperCase();
  return {
    ei: normalizedTypeCode[0] ?? "",
    sn: normalizedTypeCode[1] ?? "",
    tf: normalizedTypeCode[2] ?? "",
    jp: normalizedTypeCode[3] ?? "",
  };
}

/**
 * 计算单类型基础匹配分（未做主类型一致性偏置）。
 * @param {object} profile 类型画像。
 * @param {object} axisScores 用户轴分值。
 * @returns {number} 基础匹配度（0~100，保留 4 位小数）。
 */
function calculateTypeBaseScore(profile, axisScores) {
  const distanceSquare = MBTI_AXIS_KEYS.reduce((accumulator, axisKey) => {
    const gap = profile.vector[axisKey] - axisScores[axisKey];
    return accumulator + gap * gap;
  }, 0);

  const distance = Math.sqrt(distanceSquare);
  const maxDistance = 400;
  const normalized = 1 - distance / maxDistance;
  return clampPercentageWithPrecision(normalized * 100, 4);
}

/**
 * 计算候选类型与主结果的“字母冲突惩罚”。
 * 关键逻辑：
 * 1. 主结果由四轴正负号直接定型，必须永远排在 Top1；
 * 2. 近邻候选应优先来自“弱轴翻转”，而不是把主结果挤到后面。
 * 复杂度评估：O(D)，D 为轴数量，固定为 4。
 * @param {object} profile 类型画像。
 * @param {{ ei: string, sn: string, tf: string, jp: string }} resolvedLetters 主结果轴字母。
 * @param {{ ei: number, sn: number, tf: number, jp: number }} axisStrength 轴强度。
 * @returns {{ mismatchCount: number, mismatchPenalty: number }} 冲突统计。
 */
function calculateTypeMismatchMeta(profile, resolvedLetters, axisStrength) {
  const profileLetters = resolveTypeLettersFromCode(profile?.type);

  return MBTI_AXIS_KEYS.reduce(
    (accumulator, axisKey) => {
      if (profileLetters[axisKey] === resolvedLetters[axisKey]) {
        return accumulator;
      }

      const currentAxisStrength = clampPercentage(axisStrength?.[axisKey] ?? 0);
      return {
        mismatchCount: accumulator.mismatchCount + 1,
        // 关键逻辑：每个冲突轴给固定罚分，并按轴强度追加罚分，确保主结果和弱轴近邻排序稳定。
        mismatchPenalty: accumulator.mismatchPenalty + 1.25 + currentAxisStrength * 0.03,
      };
    },
    { mismatchCount: 0, mismatchPenalty: 0 },
  );
}

/**
 * 构建 Top3。
 * 关键逻辑：
 * 1. 先保证主结果（四轴定型结果）稳定排在第一位；
 * 2. 再按“弱轴近邻优先”的原则排候选类型；
 * 3. 显示分值保留 1 位小数，减少边界样本被整数取整压成完全同分。
 * 复杂度评估：O(T * D + T log T)，T=16，D=4。
 * @param {object} axisScores 用户轴分值。
 * @param {object} axisStrength 轴强度。
 * @param {string} resolvedTypeCode 主结果类型码。
 * @returns {Array<{ type: string, title: string, score: number }>} 排序结果。
 */
function buildTypeRanking(axisScores, axisStrength, resolvedTypeCode) {
  const resolvedLetters = resolveTypeLettersFromCode(resolvedTypeCode);

  return MBTI_TYPE_PROFILES.map((profile) => {
    const baseScore = calculateTypeBaseScore(profile, axisScores);
    const mismatchMeta = calculateTypeMismatchMeta(profile, resolvedLetters, axisStrength);
    const adjustedRawScore = clampPercentageWithPrecision(
      baseScore - mismatchMeta.mismatchPenalty,
      4,
    );

    return {
      type: profile.type,
      title: profile.title,
      rawScore: adjustedRawScore,
      score: clampPercentageWithPrecision(adjustedRawScore, 1),
      baseScore,
      mismatchCount: mismatchMeta.mismatchCount,
      mismatchPenalty: clampPercentageWithPrecision(mismatchMeta.mismatchPenalty, 4),
    };
  }).sort((left, right) => {
    if (right.rawScore !== left.rawScore) {
      return right.rawScore - left.rawScore;
    }

    if (left.mismatchCount !== right.mismatchCount) {
      return left.mismatchCount - right.mismatchCount;
    }

    if (left.mismatchPenalty !== right.mismatchPenalty) {
      return left.mismatchPenalty - right.mismatchPenalty;
    }

    if (right.baseScore !== left.baseScore) {
      return right.baseScore - left.baseScore;
    }

    return 0;
  });
}

/**
 * 推导依恋类型。
 * @param {object} axisScores 用户轴分值。
 * @returns {string} 依恋类型。
 */
function resolveAttachmentType(axisScores) {
  if (axisScores.ei >= 20 && axisScores.tf <= -10 && axisScores.jp >= -10) {
    return "安全型";
  }

  if (axisScores.ei < 20 && axisScores.tf >= 15) {
    return "回避型";
  }

  if (axisScores.ei >= 20 && axisScores.tf >= 20) {
    return "焦虑型";
  }

  return "恐惧型";
}

/**
 * 计算大五粗粒度分值。
 * @param {object} axisScores 用户轴分值。
 * @returns {{ sociability: number, conscientiousness: number, openness: number, agreeableness: number, stability: number }} 大五分值。
 */
function buildBigFiveScores(axisScores) {
  const sociability = clampPercentage(50 + axisScores.ei * 0.5);
  const conscientiousness = clampPercentage(50 + axisScores.jp * 0.5);
  const openness = clampPercentage(50 + axisScores.sn * 0.5);
  const agreeableness = clampPercentage(50 - axisScores.tf * 0.5);
  const stability = clampPercentage(58 + axisScores.jp * 0.25 - Math.abs(axisScores.tf) * 0.22);

  return {
    sociability,
    conscientiousness,
    openness,
    agreeableness,
    stability,
  };
}

/**
 * 生成大五简码（SCOEI）：
 * 高于阈值显示字母，低于阈值显示 -。
 * @param {object} bigFiveScores 大五分值。
 * @returns {string} 大五简码。
 */
function resolveBigFiveCode(bigFiveScores) {
  const threshold = 55;

  return [
    bigFiveScores.sociability >= threshold ? "S" : "-",
    bigFiveScores.conscientiousness >= threshold ? "C" : "-",
    bigFiveScores.openness >= threshold ? "O" : "-",
    bigFiveScores.agreeableness >= threshold ? "E" : "-",
    bigFiveScores.stability >= threshold ? "I" : "-",
  ].join("");
}

/**
 * 推导体液气质。
 * @param {object} bigFiveScores 大五分值。
 * @returns {string} 体液气质。
 */
function resolveTemperament(bigFiveScores) {
  const isExtraverted = bigFiveScores.sociability >= 50;
  const isStable = bigFiveScores.stability >= 50;

  if (isExtraverted && isStable) {
    return "多血质";
  }

  if (isExtraverted && !isStable) {
    return "胆汁质";
  }

  if (!isExtraverted && isStable) {
    return "粘液质";
  }

  return "抑郁质";
}

/**
 * 将轴分值转换为“正向/反向占比”。
 * 计算规则：
 * 1. axisScore 取值范围 [-100, 100]，其中 0 表示完全平衡。
 * 2. 通过线性映射转换为 [0, 100] 占比，便于用户理解。
 * 复杂度评估：O(1)。
 * @param {number} axisScore 轴分值。
 * @returns {{ positiveRatio: number, negativeRatio: number }} 占比对象。
 */
function resolveAxisRatios(axisScore) {
  const normalizedAxisScore = Number.isFinite(axisScore) ? axisScore : 0;
  const positiveRatio = clampPercentage((normalizedAxisScore + 100) / 2);
  const negativeRatio = clampPercentage(100 - positiveRatio);

  return {
    positiveRatio,
    negativeRatio,
  };
}

/**
 * 将维度强度映射为可读等级。
 * 复杂度评估：O(1)。
 * @param {number} axisStrength 轴强度（0~100）。
 * @returns {string} 强度等级。
 */
function resolveAxisStrengthLevel(axisStrength) {
  const normalizedStrength = clampPercentage(axisStrength);

  if (normalizedStrength >= 60) {
    return "强";
  }

  if (normalizedStrength >= 30) {
    return "中";
  }

  return "弱";
}

/**
 * 构建维度平衡提示。
 * 关键逻辑：占比接近 50/50 时明确提示“边界维度”，降低用户误解概率。
 * 复杂度评估：O(1)。
 * @param {number} positiveRatio 正向字母占比。
 * @param {number} negativeRatio 反向字母占比。
 * @returns {string} 提示文本。
 */
function resolveAxisBalanceHint(positiveRatio, negativeRatio) {
  const ratioGap = Math.abs(positiveRatio - negativeRatio);

  if (ratioGap <= 10) {
    return "（接近平衡，可能随场景波动）";
  }

  return "";
}

/**
 * 构建维度占比展示顺序：
 * 关键逻辑：默认将占比更高的字母放在前面；同分时保持原始字母顺序稳定展示。
 * 复杂度评估：O(1)。
 * @param {{ positive: string, negative: string }} axisConfig 维度字母配置。
 * @param {number} positiveRatio 正向字母占比。
 * @param {number} negativeRatio 反向字母占比。
 * @returns {{ firstLabel: string, firstRatio: number, secondLabel: string, secondRatio: number }} 展示顺序对象。
 */
function resolveAxisRatioDisplayOrder(axisConfig, positiveRatio, negativeRatio) {
  if (positiveRatio >= negativeRatio) {
    return {
      firstLabel: axisConfig.positive,
      firstRatio: positiveRatio,
      secondLabel: axisConfig.negative,
      secondRatio: negativeRatio,
    };
  }

  return {
    firstLabel: axisConfig.negative,
    firstRatio: negativeRatio,
    secondLabel: axisConfig.positive,
    secondRatio: positiveRatio,
  };
}

/**
 * 生成维度倾向摘要。
 * @param {object} axisScores 轴分值。
 * @returns {Array<string>} 维度摘要。
 */
function buildAxisSummaryLines(axisScores) {
  return MBTI_AXIS_KEYS.map((axisKey) => {
    const axisConfig = MBTI_AXIS_CONFIG[axisKey];
    const axisScore = Number(axisScores[axisKey] ?? 0);
    const { positiveRatio, negativeRatio } = resolveAxisRatios(axisScore);
    const ratioDisplayOrder = resolveAxisRatioDisplayOrder(
      axisConfig,
      positiveRatio,
      negativeRatio,
    );
    const axisStrength = clampPercentage(Math.abs(axisScore));
    const strengthLevel = resolveAxisStrengthLevel(axisStrength);
    const balanceHint = resolveAxisBalanceHint(positiveRatio, negativeRatio);

    return `${axisConfig.label}：${ratioDisplayOrder.firstLabel} ${ratioDisplayOrder.firstRatio}% / ${ratioDisplayOrder.secondLabel} ${ratioDisplayOrder.secondRatio}% · 倾向强度 ${axisStrength}%（${strengthLevel}）${balanceHint}`;
  });
}

/**
 * 生成类型学卡片。
 * @param {object} params 参数对象。
 * @param {string} params.typeCode MBTI 类型码。
 * @param {object} params.axisScores 轴分值。
 * @param {object} params.bigFiveScores 大五分值。
 * @returns {{ title: string, items: Array<{ label: string, value: string }> }} 类型卡片。
 */
function buildTypeCard({ typeCode, axisScores, bigFiveScores }) {
  return {
    title: "我的类型学卡片",
    items: [
      { label: "MBTI", value: typeCode },
      { label: "九型人格", value: ENNEAGRAM_SIGNATURE_MAP[typeCode] ?? "5w6 593 SP/SO" },
      { label: "霍兰德", value: HOLLAND_CODE_MAP[typeCode] ?? "IR" },
      { label: "依恋类型", value: resolveAttachmentType(axisScores) },
      { label: "DnD阵营", value: DND_ALIGNMENT_MAP[typeCode] ?? "绝对中立" },
      { label: "大五人格", value: resolveBigFiveCode(bigFiveScores) },
      { label: "体液气质", value: resolveTemperament(bigFiveScores) },
    ],
  };
}

/**
 * 构建本地叙事。
 * @param {object} params 参数对象。
 * @param {string} params.typeCode MBTI 类型码。
 * @param {string} params.typeTitle 类型标题。
 * @param {object} params.axisScores 轴分值。
 * @returns {string} 本地叙事。
 */
function buildLocalNarrative({ typeCode, typeTitle, axisScores }) {
  const eiRatios = resolveAxisRatios(axisScores.ei);
  const snRatios = resolveAxisRatios(axisScores.sn);
  const tfRatios = resolveAxisRatios(axisScores.tf);
  const jpRatios = resolveAxisRatios(axisScores.jp);
  const eiDisplayOrder = resolveAxisRatioDisplayOrder(
    MBTI_AXIS_CONFIG.ei,
    eiRatios.positiveRatio,
    eiRatios.negativeRatio,
  );
  const snDisplayOrder = resolveAxisRatioDisplayOrder(
    MBTI_AXIS_CONFIG.sn,
    snRatios.positiveRatio,
    snRatios.negativeRatio,
  );
  const tfDisplayOrder = resolveAxisRatioDisplayOrder(
    MBTI_AXIS_CONFIG.tf,
    tfRatios.positiveRatio,
    tfRatios.negativeRatio,
  );
  const jpDisplayOrder = resolveAxisRatioDisplayOrder(
    MBTI_AXIS_CONFIG.jp,
    jpRatios.positiveRatio,
    jpRatios.negativeRatio,
  );

  return [
    `你的主类型更接近 ${typeCode}（${typeTitle}）。`,
    `四条维度占比约为 ${MBTI_AXIS_CONFIG.ei.label}（${eiDisplayOrder.firstLabel} ${eiDisplayOrder.firstRatio}% / ${eiDisplayOrder.secondLabel} ${eiDisplayOrder.secondRatio}%）、${MBTI_AXIS_CONFIG.sn.label}（${snDisplayOrder.firstLabel} ${snDisplayOrder.firstRatio}% / ${snDisplayOrder.secondLabel} ${snDisplayOrder.secondRatio}%）、${MBTI_AXIS_CONFIG.tf.label}（${tfDisplayOrder.firstLabel} ${tfDisplayOrder.firstRatio}% / ${tfDisplayOrder.secondLabel} ${tfDisplayOrder.secondRatio}%）、${MBTI_AXIS_CONFIG.jp.label}（${jpDisplayOrder.firstLabel} ${jpDisplayOrder.firstRatio}% / ${jpDisplayOrder.secondLabel} ${jpDisplayOrder.secondRatio}%）。`,
    "这说明你在决策时兼顾思路清晰与场景适配，适合把优势放在高反馈的长期赛道。",
  ].join("");
}

/**
 * 十六型人格本地分析。
 * 复杂度评估：
 * 1. 轴分值聚合：O(Q * O * D)，Q 为题量，O 为每题选项数（固定 4），D 为轴数（固定 4）。
 * 2. 类型评分：O(T * D)，T=16。
 * 3. 排序：O(T log T)。
 * 总体复杂度：O(Q * O * D + T * D + T log T)。
 * @param {object} params 参数对象。
 * @param {Array<object>} params.questions 本轮题目。
 * @param {Array<string|null>} params.answerIds 用户答案。
 * @returns {{ topType: object, topThree: Array<object>, scoredTypes: Array<object>, axisScores: object, axisStrength: object, answerSummary: Array<object>, summaryLines: Array<string>, axisSummaryLines: Array<string>, bigFiveScores: object, typeCard: object, localNarrative: string }} 本地分析结果。
 */
export function analyzeMbtiLocally({ questions, answerIds }) {
  const answerSummary = buildAnswerSummary(questions, answerIds);
  const summaryLines = buildSummaryLines(answerSummary);
  const { axisScores, axisStrength } = buildAxisScores(questions, answerIds);
  const axisSummaryLines = buildAxisSummaryLines(axisScores);

  const { typeCode } = resolveMbtiCode(axisScores);
  const scoredTypes = buildTypeRanking(axisScores, axisStrength, typeCode);

  const topTypeFromRank =
    scoredTypes.find((item) => item.type === typeCode) ?? scoredTypes[0];

  const resolvedTopType = {
    type: topTypeFromRank?.type ?? typeCode,
    title: topTypeFromRank?.title ?? "策略规划者",
    score: topTypeFromRank?.score ?? 0,
  };

  const topThree = scoredTypes.slice(0, 3);
  const bigFiveScores = buildBigFiveScores(axisScores);
  const typeCard = buildTypeCard({
    typeCode: resolvedTopType.type,
    axisScores,
    bigFiveScores,
  });

  return {
    topType: resolvedTopType,
    topThree,
    scoredTypes,
    axisScores,
    axisStrength,
    answerSummary,
    summaryLines,
    axisSummaryLines,
    bigFiveScores,
    typeCard,
    localNarrative: buildLocalNarrative({
      typeCode: resolvedTopType.type,
      typeTitle: resolvedTopType.title,
      axisScores,
    }),
  };
}
