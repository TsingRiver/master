import { getTypeologyTestConfig } from "../data/typeologyCatalog";
import {
  extractMbtiTypeCodesFromText,
  normalizeMbtiTypeCode,
  sanitizeTypeologyResult,
} from "./mbtiResultIntegrity";
import { resolveTypeologyStorageNamespace } from "./typeologyStorage";
import {
  buildMbtiPersonalitySummary,
  buildTypeologyPersonalitySummary,
} from "./typeologyCopyUtils";

/**
 * 开发环境本地覆盖缓存键前缀。
 * 关键逻辑：与正式结果缓存完全隔离，避免误写正式结果或触发云端同步。
 */
const TYPEOLOGY_DEV_RESULT_OVERRIDE_KEY_PREFIX =
  "asking_typeology_dev_result_override_v1";

/**
 * 开发覆盖统一来源标记。
 */
const TYPEOLOGY_DEV_RESULT_OVERRIDE_SOURCE = "local";

/**
 * 覆盖结果默认匹配度。
 * 关键逻辑：未复用历史结果时提供一个更接近日常测试观感的分值，避免固定 100% 过于生硬。
 */
const TYPEOLOGY_DEV_RESULT_OVERRIDE_DEFAULT_SCORE = 86;

/**
 * 开发覆盖通用行动建议。
 */
const TYPEOLOGY_DEV_RESULT_OVERRIDE_ACTION_LIST = Object.freeze([
  "回看近期真实场景，确认这个结果是否稳定出现。",
  "把这个结果放回关系与任务场景里观察，看它是否能解释你的惯性选择。",
  "如果想继续细化，可以切换更完整的版本补充验证。",
]);

/**
 * 开发覆盖通用标签。
 */
const TYPEOLOGY_DEV_RESULT_OVERRIDE_TAG_LIST = Object.freeze([
  "当前主结果",
  "稳定倾向",
  "可继续观察",
]);

/**
 * MBTI 维度说明映射。
 * 关键逻辑：开发覆盖场景没有真实答卷，也要给结果页提供可阅读的维度标签。
 */
const MBTI_DEV_OVERRIDE_TAG_MAP = Object.freeze({
  E: "能量：外向 E",
  I: "能量：内向 I",
  S: "感知：实感 S",
  N: "感知：直觉 N",
  T: "决策：思考 T",
  F: "决策：情感 F",
  J: "节奏：判断 J",
  P: "节奏：知觉 P",
});

/**
 * 判断开发覆盖功能是否启用。
 * 关键逻辑：只在 Vite 开发环境开放，生产构建默认关闭。
 * @returns {boolean} 是否启用。
 */
export function isTypeologyDevResultOverrideEnabled() {
  return Boolean(import.meta.env.DEV);
}

/**
 * 安全解析 JSON 对象。
 * @param {string} rawString 原始字符串。
 * @returns {Record<string, any>} 解析后的普通对象。
 */
function safeParseObject(rawString) {
  if (!rawString || typeof rawString !== "string") {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawString);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

/**
 * 规范化普通字符串。
 * @param {unknown} rawValue 原始值。
 * @returns {string} 去空白后的字符串。
 */
function normalizeText(rawValue) {
  return String(rawValue ?? "").trim();
}

/**
 * 规范化文本数组。
 * @param {unknown} rawList 原始数组。
 * @param {number} [limit=3] 输出上限。
 * @returns {Array<string>} 清洗后的文本列表。
 */
function normalizeTextList(rawList, limit = 3) {
  const safeLimit = Math.max(1, Math.floor(limit));
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList
    .map((item) => normalizeText(item).replace(/[。！？!?]+$/g, ""))
    .filter(Boolean)
    .slice(0, safeLimit);
}

/**
 * 构建当前命名空间下的开发覆盖缓存键。
 * 关键逻辑：沿用正式结果缓存的授权命名空间，避免不同授权上下文相互串用本地覆盖值。
 * @param {{ targetPath?: string }} [storageOptions={}] 存储参数。
 * @returns {string} 缓存键。
 */
function buildTypeologyDevResultOverrideStorageKey(storageOptions = {}) {
  const { namespaceId } = resolveTypeologyStorageNamespace(storageOptions);
  return namespaceId
    ? `${TYPEOLOGY_DEV_RESULT_OVERRIDE_KEY_PREFIX}_${namespaceId}`
    : TYPEOLOGY_DEV_RESULT_OVERRIDE_KEY_PREFIX;
}

/**
 * 规范化单条开发覆盖记录。
 * @param {unknown} overrideEntry 原始覆盖记录。
 * @returns {{ overrideValue: string, updatedAt: number, resultPayload?: object } | null} 规范化后的记录。
 */
function normalizeTypeologyDevResultOverrideEntry(overrideEntry) {
  const normalizedOverrideValue = normalizeText(
    overrideEntry?.overrideValue ?? overrideEntry,
  );
  if (!normalizedOverrideValue) {
    return null;
  }

  const rawUpdatedAt = Number(overrideEntry?.updatedAt ?? Date.now());
  return {
    overrideValue: normalizedOverrideValue,
    updatedAt: Number.isFinite(rawUpdatedAt) ? rawUpdatedAt : Date.now(),
    resultPayload:
      overrideEntry?.resultPayload &&
      typeof overrideEntry.resultPayload === "object"
        ? sanitizeTypeologyResult(overrideEntry.resultPayload)
        : undefined,
  };
}

/**
 * 规范化开发覆盖映射。
 * 复杂度评估：O(K)，K 为已设置覆盖的测试数量；当前上限为固定 12。
 * @param {Record<string, any>} overrideMap 原始覆盖映射。
 * @returns {Record<string, { overrideValue: string, updatedAt: number, resultPayload?: object }>} 规范化后的覆盖映射。
 */
function normalizeTypeologyDevResultOverrideMap(overrideMap) {
  const normalizedOverrideMap = {};

  Object.entries(overrideMap ?? {}).forEach(([testKey, overrideEntry]) => {
    const normalizedTestKey = normalizeText(testKey);
    const normalizedEntry =
      normalizeTypeologyDevResultOverrideEntry(overrideEntry);
    if (!normalizedTestKey || !normalizedEntry) {
      return;
    }

    normalizedOverrideMap[normalizedTestKey] = normalizedEntry;
  });

  return normalizedOverrideMap;
}

/**
 * 读取当前命名空间下的开发覆盖映射。
 * @param {{ targetPath?: string }} [storageOptions={}] 存储参数。
 * @returns {Record<string, { overrideValue: string, updatedAt: number, resultPayload?: object }>} 覆盖映射。
 */
export function loadTypeologyDevResultOverrideMap(storageOptions = {}) {
  if (!isTypeologyDevResultOverrideEnabled()) {
    return {};
  }

  try {
    return normalizeTypeologyDevResultOverrideMap(
      safeParseObject(
        window.localStorage.getItem(
          buildTypeologyDevResultOverrideStorageKey(storageOptions),
        ),
      ),
    );
  } catch {
    return {};
  }
}

/**
 * 写入当前命名空间下的开发覆盖映射。
 * @param {Record<string, any>} overrideMap 覆盖映射。
 * @param {{ targetPath?: string }} [storageOptions={}] 存储参数。
 */
export function saveTypeologyDevResultOverrideMap(
  overrideMap,
  storageOptions = {},
) {
  if (!isTypeologyDevResultOverrideEnabled()) {
    return;
  }

  try {
    window.localStorage.setItem(
      buildTypeologyDevResultOverrideStorageKey(storageOptions),
      JSON.stringify(normalizeTypeologyDevResultOverrideMap(overrideMap)),
    );
  } catch {
    // 关键逻辑：开发辅助能力写入失败时静默降级，避免影响主测试流程。
  }
}

/**
 * 清空当前命名空间下的开发覆盖映射。
 * @param {{ targetPath?: string }} [storageOptions={}] 存储参数。
 */
export function clearTypeologyDevResultOverrideMap(storageOptions = {}) {
  if (!isTypeologyDevResultOverrideEnabled()) {
    return;
  }

  try {
    window.localStorage.removeItem(
      buildTypeologyDevResultOverrideStorageKey(storageOptions),
    );
  } catch {
    // 关键逻辑：开发覆盖清理失败不应阻塞正式结果清理流程。
  }
}

/**
 * 规范化九型人格覆盖输入。
 * @param {unknown} rawValue 原始输入值。
 * @returns {string} 标准化后的输入值。
 */
function normalizeEnneagramOverrideInput(rawValue) {
  const normalizedInput = normalizeText(rawValue).replace(/\s+/g, " ");
  if (!normalizedInput) {
    return "";
  }

  const enneagramMatch = normalizedInput.match(
    /^([1-9])(?:\s*[wW]\s*([1-9]))?(?:\s+(\d{3}))?(?:\s+([a-z]{2})\s*\/\s*([a-z]{2}))?$/i,
  );
  if (!enneagramMatch) {
    return normalizedInput;
  }

  const [, coreNumber, wingNumber, tritypeCode, instinctLeft, instinctRight] =
    enneagramMatch;
  return [
    wingNumber ? `${coreNumber}w${wingNumber}` : coreNumber,
    tritypeCode ?? "",
    instinctLeft && instinctRight
      ? `${instinctLeft.toUpperCase()}/${instinctRight.toUpperCase()}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * 规范化单条开发覆盖输入。
 * 关键逻辑：MBTI 只接受合法 16 型；其他测试保留用户输入文本，便于自由联调。
 * @param {object} params 参数对象。
 * @param {string} params.testKey 测试键。
 * @param {unknown} params.overrideValue 原始覆盖值。
 * @returns {string} 规范化后的覆盖值；非法时返回空字符串。
 */
export function normalizeTypeologyDevResultOverrideInput({
  testKey,
  overrideValue,
}) {
  const normalizedTestKey = normalizeText(testKey);
  const normalizedOverrideValue = normalizeText(overrideValue);
  if (!normalizedTestKey || !normalizedOverrideValue) {
    return "";
  }

  if (normalizedTestKey === "mbti") {
    const extractedTypeCode =
      extractMbtiTypeCodesFromText(normalizedOverrideValue)[0] ?? "";
    return normalizeMbtiTypeCode(extractedTypeCode);
  }

  if (normalizedTestKey === "enneagram") {
    return normalizeEnneagramOverrideInput(normalizedOverrideValue);
  }

  return normalizedOverrideValue;
}

/**
 * 构建输入校验失败提示。
 * @param {string} testKey 测试键。
 * @returns {string} 提示文案。
 */
export function buildTypeologyDevResultOverrideValidationMessage(testKey) {
  const normalizedTestKey = normalizeText(testKey);
  if (normalizedTestKey === "mbti") {
    return "MBTI 请输入合法 16 型，例如 INFJ";
  }

  if (normalizedTestKey === "enneagram") {
    return "九型人格请输入结果值，例如 5w4 或 5w4 514 SP/SO";
  }

  return "请输入想展示的覆盖结果";
}

/**
 * 读取当前测试的覆盖值。
 * @param {string} testKey 测试键。
 * @param {Record<string, any>} overrideMap 覆盖映射。
 * @returns {string} 覆盖值；不存在时返回空字符串。
 */
export function resolveTypeologyDevResultOverrideValue(testKey, overrideMap) {
  const normalizedTestKey = normalizeText(testKey);
  if (!normalizedTestKey) {
    return "";
  }

  return normalizeText(
    normalizeTypeologyDevResultOverrideMap(overrideMap)[normalizedTestKey]
      ?.overrideValue,
  );
}

/**
 * 增量写入单条开发覆盖。
 * @param {object} params 参数对象。
 * @param {string} params.testKey 测试键。
 * @param {unknown} params.overrideValue 原始覆盖值。
 * @param {{ targetPath?: string }} [storageOptions={}] 存储参数。
 * @returns {Record<string, { overrideValue: string, updatedAt: number, resultPayload?: object }>} 更新后的覆盖映射。
 */
export function upsertTypeologyDevResultOverride(
  { testKey, overrideValue },
  storageOptions = {},
) {
  const normalizedTestKey = normalizeText(testKey);
  const normalizedOverrideValue = normalizeTypeologyDevResultOverrideInput({
    testKey: normalizedTestKey,
    overrideValue,
  });
  const currentOverrideMap =
    loadTypeologyDevResultOverrideMap(storageOptions);

  if (!normalizedTestKey || !normalizedOverrideValue) {
    return currentOverrideMap;
  }

  const nextOverrideMap = {
    ...currentOverrideMap,
    [normalizedTestKey]: {
      overrideValue: normalizedOverrideValue,
      updatedAt: Date.now(),
      resultPayload: undefined,
    },
  };
  saveTypeologyDevResultOverrideMap(nextOverrideMap, storageOptions);
  return nextOverrideMap;
}

/**
 * 删除单条开发覆盖。
 * @param {string} testKey 测试键。
 * @param {{ targetPath?: string }} [storageOptions={}] 存储参数。
 * @returns {Record<string, { overrideValue: string, updatedAt: number, resultPayload?: object }>} 删除后的覆盖映射。
 */
export function removeTypeologyDevResultOverride(
  testKey,
  storageOptions = {},
) {
  const normalizedTestKey = normalizeText(testKey);
  const currentOverrideMap =
    loadTypeologyDevResultOverrideMap(storageOptions);
  if (!normalizedTestKey || !currentOverrideMap[normalizedTestKey]) {
    return currentOverrideMap;
  }

  const nextOverrideMap = {
    ...currentOverrideMap,
  };
  delete nextOverrideMap[normalizedTestKey];
  saveTypeologyDevResultOverrideMap(nextOverrideMap, storageOptions);
  return nextOverrideMap;
}

/**
 * 构建覆盖输入占位文案。
 * @param {string} testKey 测试键。
 * @returns {string} 占位文案。
 */
export function buildTypeologyDevResultOverridePlaceholder(testKey) {
  const normalizedTestKey = normalizeText(testKey);

  if (normalizedTestKey === "mbti") {
    return "例如：INFJ";
  }

  if (normalizedTestKey === "enneagram") {
    return "例如：5w4 或 5w4 514 SP/SO";
  }

  return "输入希望直接展示的结果名称";
}

/**
 * 构建覆盖输入提示文案。
 * @param {string} testKey 测试键。
 * @returns {string} 提示文案。
 */
export function buildTypeologyDevResultOverrideHint(testKey) {
  const normalizedTestKey = normalizeText(testKey);
  if (normalizedTestKey === "mbti") {
    return "MBTI 会自动规范成合法 16 型。";
  }

  if (normalizedTestKey === "enneagram") {
    return "九型人格支持 5w4、5w4 514 SP/SO 这类格式。";
  }

  return "其他测试支持直接输入结果名；若命中内置结果，会自动回退到标准标签与摘要。";
}

/**
 * 解析覆盖结果沿用的模式元信息。
 * 关键逻辑：优先复用历史真实结果的模式与题量，其次回退到测试的首个模式，尽量保持正常测试观感。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {object|null} [params.baseResult=null] 历史真实结果。
 * @returns {{ modeKey: string, modeLabel: string, questionCount: number, scoreLabel: string, source: string }} 模式元信息。
 */
function resolveTypeologyDevOverrideModeMeta({
  testConfig,
  baseResult = null,
}) {
  const fallbackMode = Array.isArray(testConfig?.modes) ? testConfig.modes[0] : null;
  return {
    modeKey:
      normalizeText(baseResult?.modeKey) ||
      normalizeText(fallbackMode?.key) ||
      "custom",
    modeLabel:
      normalizeText(baseResult?.modeLabel) ||
      normalizeText(fallbackMode?.label) ||
      "测试结果",
    questionCount:
      Number(baseResult?.questionCount) > 0
        ? Number(baseResult.questionCount)
        : Number(fallbackMode?.baseCount) > 0
          ? Number(fallbackMode.baseCount)
          : 0,
    scoreLabel: normalizeText(baseResult?.scoreLabel),
    source: normalizeText(baseResult?.source) || TYPEOLOGY_DEV_RESULT_OVERRIDE_SOURCE,
  };
}

/**
 * 解析覆盖结果使用的主分值。
 * 关键逻辑：优先复用历史真实结果分值，没有历史结果时回退到较自然的默认分值。
 * @param {object|null} baseResult 历史真实结果。
 * @returns {number} 主分值。
 */
function resolveTypeologyDevOverrideScore(baseResult) {
  const rawScore = Number(baseResult?.mainResult?.score ?? 0);
  if (Number.isFinite(rawScore) && rawScore > 0) {
    return Math.max(0, Math.min(100, rawScore));
  }

  return TYPEOLOGY_DEV_RESULT_OVERRIDE_DEFAULT_SCORE;
}

/**
 * 规范化结果匹配 token。
 * 关键逻辑：忽略空格、分隔点和大小写，降低手工输入时的格式敏感度。
 * @param {unknown} rawText 原始文本。
 * @returns {string} 规范化匹配 token。
 */
function normalizeOutcomeMatchToken(rawText) {
  return normalizeText(rawText)
    .toLowerCase()
    .replace(/[·•・\s/_-]+/g, "");
}

/**
 * 解析输入是否命中测试内置结果项。
 * 复杂度评估：O(O)，O 为当前测试 outcome 数量；所有测试均为固定小常量。
 * @param {object} testConfig 测试配置。
 * @param {string} overrideValue 规范化后的覆盖值。
 * @returns {object|null} 命中的结果项。
 */
function resolveMatchedOutcome(testConfig, overrideValue) {
  const normalizedOverrideToken = normalizeOutcomeMatchToken(overrideValue);
  if (!normalizedOverrideToken) {
    return null;
  }

  const outcomeList = Array.isArray(testConfig?.outcomes)
    ? testConfig.outcomes
    : [];

  return (
    outcomeList.find((outcomeItem) => {
      const outcomeLabel = normalizeText(outcomeItem?.label);
      const [outcomeLabelLead = "", outcomeLabelTail = ""] =
        outcomeLabel.split("·");
      const candidateTokenList = [
        outcomeItem?.key,
        outcomeLabel,
        outcomeLabelLead,
        outcomeLabelTail,
      ];

      return candidateTokenList.some(
        (candidateText) =>
          normalizeOutcomeMatchToken(candidateText) === normalizedOverrideToken,
      );
    }) ?? null
  );
}

/**
 * 构建开发覆盖通用摘要兜底。
 * @param {object} params 参数对象。
 * @param {string} params.testName 测试名称。
 * @param {string} params.overrideValue 覆盖值。
 * @returns {string} 摘要文案。
 */
function buildTypeologyDevOverrideFallbackSummary({
  testName,
  overrideValue,
}) {
  return `你在「${normalizeText(testName) || "当前测试"}」中的整体倾向更接近「${normalizeText(overrideValue)}」这一路径，这种风格会更容易在近期选择、关系互动和任务推进中反复出现。`;
}

/**
 * 构建 MBTI 开发覆盖结果。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {string} params.overrideValue 规范化后的覆盖值。
 * @param {number} params.updatedAt 更新时间戳。
 * @returns {object} MBTI 覆盖结果。
 */
function buildMbtiDevOverrideResult({
  testConfig,
  overrideValue,
  updatedAt,
  baseResult = null,
  persistedResultPayload = null,
}) {
  const normalizedTypeCode = normalizeMbtiTypeCode(overrideValue);
  if (!normalizedTypeCode) {
    return null;
  }
  const modeMeta = resolveTypeologyDevOverrideModeMeta({
    testConfig,
    baseResult,
  });
  const resolvedScore = resolveTypeologyDevOverrideScore(baseResult);

  const mainResult = {
    key: normalizedTypeCode,
    label: normalizedTypeCode,
    score: resolvedScore,
    summary: buildMbtiPersonalitySummary({
      typeCode: normalizedTypeCode,
      typeTitle: normalizedTypeCode,
    }),
    tags: normalizedTypeCode
      .split("")
      .map((letterItem) => MBTI_DEV_OVERRIDE_TAG_MAP[letterItem] ?? "")
      .filter(Boolean)
      .slice(0, 3),
    actions: TYPEOLOGY_DEV_RESULT_OVERRIDE_ACTION_LIST,
  };

  const baseSyntheticResult = {
    testKey: testConfig.key,
    testName: testConfig.name,
    modeKey: modeMeta.modeKey,
    modeLabel: modeMeta.modeLabel,
    scoreLabel: modeMeta.scoreLabel,
    questionCount: modeMeta.questionCount,
    completedAt: updatedAt,
    source: modeMeta.source,
    displayValue: normalizedTypeCode,
    mainResult,
    topThree: [
      {
        key: normalizedTypeCode,
        label: normalizedTypeCode,
        score: resolvedScore,
      },
    ],
    scoreBoard: [
      {
        key: normalizedTypeCode,
        label: normalizedTypeCode,
        rawScore: resolvedScore,
        score: resolvedScore,
        summary: mainResult.summary,
        tags: mainResult.tags,
        actions: mainResult.actions,
      },
    ],
    summaryLines: [],
    insight: mainResult.summary,
    summaryText: mainResult.summary,
    detailTags: mainResult.tags,
    detailActions: mainResult.actions,
    aiInsight: null,
    devOverrideMeta: {
      applied: true,
      overrideValue: normalizedTypeCode,
      updatedAt,
    },
  };

  return sanitizeTypeologyResult({
    ...baseSyntheticResult,
    ...(persistedResultPayload && typeof persistedResultPayload === "object"
      ? persistedResultPayload
      : {}),
    testKey: baseSyntheticResult.testKey,
    testName: baseSyntheticResult.testName,
    modeKey: baseSyntheticResult.modeKey,
    modeLabel: baseSyntheticResult.modeLabel,
    scoreLabel: baseSyntheticResult.scoreLabel,
    questionCount: baseSyntheticResult.questionCount,
    source: baseSyntheticResult.source,
    displayValue: baseSyntheticResult.displayValue,
    mainResult:
      persistedResultPayload?.mainResult &&
      typeof persistedResultPayload.mainResult === "object"
        ? persistedResultPayload.mainResult
        : baseSyntheticResult.mainResult,
    devOverrideMeta: baseSyntheticResult.devOverrideMeta,
  });
}

/**
 * 构建九型人格开发覆盖结果。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {string} params.overrideValue 规范化后的覆盖值。
 * @param {number} params.updatedAt 更新时间戳。
 * @returns {object} 九型人格覆盖结果。
 */
function buildEnneagramDevOverrideResult({
  testConfig,
  overrideValue,
  updatedAt,
  baseResult = null,
  persistedResultPayload = null,
}) {
  const enneagramMatch = normalizeText(overrideValue).match(
    /^([1-9])(?:w([1-9]))?(?:\s+(\d{3}))?(?:\s+([A-Z]{2})\/([A-Z]{2}))?$/i,
  );
  const matchedOutcome = resolveMatchedOutcome(testConfig, overrideValue);

  const coreNumber = enneagramMatch?.[1] ?? normalizeText(matchedOutcome?.key).replace(/^e/i, "");
  const coreKey = coreNumber ? `e${coreNumber}` : normalizeText(matchedOutcome?.key);
  const wingNumber = enneagramMatch?.[2] ?? "";
  const tritypeCode = enneagramMatch?.[3] ?? "";
  const instinctStack =
    enneagramMatch?.[4] && enneagramMatch?.[5]
      ? `${enneagramMatch[4].toUpperCase()}/${enneagramMatch[5].toUpperCase()}`
      : "";
  const mainLabel =
    normalizeText(overrideValue) ||
    normalizeText(matchedOutcome?.label) ||
    normalizeText(coreNumber);
  const detailTagList = [
    matchedOutcome?.label
      ? `主型：${normalizeText(matchedOutcome.label)}`
      : coreNumber
        ? `主型：${coreNumber}号`
        : "",
    wingNumber ? `侧翼：${coreNumber}w${wingNumber}` : "",
    tritypeCode ? `三型：${tritypeCode}` : "",
    instinctStack ? `本能：${instinctStack}` : "",
  ].filter(Boolean);
  const modeMeta = resolveTypeologyDevOverrideModeMeta({
    testConfig,
    baseResult,
  });
  const resolvedScore = resolveTypeologyDevOverrideScore(baseResult);
  const mainResult = {
    key: coreKey || normalizeText(matchedOutcome?.key) || "enneagram-dev-override",
    label: mainLabel,
    score: resolvedScore,
    summary:
      normalizeText(matchedOutcome?.summary) ||
      buildTypeologyDevOverrideFallbackSummary({
        testName: testConfig.name,
        overrideValue: mainLabel,
      }),
    tags:
      detailTagList.length > 0
        ? detailTagList
        : TYPEOLOGY_DEV_RESULT_OVERRIDE_TAG_LIST,
    actions:
      normalizeTextList(matchedOutcome?.actions, 3).length > 0
        ? normalizeTextList(matchedOutcome?.actions, 3)
        : TYPEOLOGY_DEV_RESULT_OVERRIDE_ACTION_LIST,
  };
  const summaryText =
    detailTagList.length > 0
      ? buildTypeologyPersonalitySummary({
          mainResult,
          outcomeMetaMap: testConfig?.outcomeMap ?? null,
        })
      : buildTypeologyDevOverrideFallbackSummary({
          testName: testConfig.name,
          overrideValue: mainLabel,
        });

  const baseSyntheticResult = {
    testKey: testConfig.key,
    testName: testConfig.name,
    modeKey: modeMeta.modeKey,
    modeLabel: modeMeta.modeLabel,
    scoreLabel: modeMeta.scoreLabel,
    questionCount: modeMeta.questionCount,
    completedAt: updatedAt,
    source: modeMeta.source,
    displayValue: wingNumber ? `${coreNumber}w${wingNumber}` : mainLabel,
    mainResult,
    topThree: [
      {
        key: mainResult.key,
        label: mainLabel,
        score: resolvedScore,
      },
    ],
    scoreBoard: [
      {
        key: mainResult.key,
        label: mainLabel,
        rawScore: resolvedScore,
        score: resolvedScore,
        summary: mainResult.summary,
        tags: mainResult.tags,
        actions: mainResult.actions,
      },
    ],
    summaryLines: [],
    insight: summaryText,
    summaryText,
    detailTags: mainResult.tags,
    detailActions: mainResult.actions,
    aiInsight: null,
    enneagramProfile:
      coreKey && coreNumber
        ? {
            code: mainLabel,
            coreKey,
            coreNumber,
            wingKey: wingNumber ? `e${wingNumber}` : "",
            wingNumber,
            tritype: tritypeCode,
            instinctStack,
          }
        : null,
    devOverrideMeta: {
      applied: true,
      overrideValue: mainLabel,
      updatedAt,
    },
  };

  return sanitizeTypeologyResult({
    ...baseSyntheticResult,
    ...(persistedResultPayload && typeof persistedResultPayload === "object"
      ? persistedResultPayload
      : {}),
    testKey: baseSyntheticResult.testKey,
    testName: baseSyntheticResult.testName,
    modeKey: baseSyntheticResult.modeKey,
    modeLabel: baseSyntheticResult.modeLabel,
    scoreLabel: baseSyntheticResult.scoreLabel,
    questionCount: baseSyntheticResult.questionCount,
    source: baseSyntheticResult.source,
    displayValue: baseSyntheticResult.displayValue,
    mainResult:
      persistedResultPayload?.mainResult &&
      typeof persistedResultPayload.mainResult === "object"
        ? persistedResultPayload.mainResult
        : baseSyntheticResult.mainResult,
    devOverrideMeta: baseSyntheticResult.devOverrideMeta,
  });
}

/**
 * 构建通用测试开发覆盖结果。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {string} params.overrideValue 规范化后的覆盖值。
 * @param {number} params.updatedAt 更新时间戳。
 * @returns {object} 通用覆盖结果。
 */
function buildGenericTypeologyDevOverrideResult({
  testConfig,
  overrideValue,
  updatedAt,
  baseResult = null,
  persistedResultPayload = null,
}) {
  const matchedOutcome = resolveMatchedOutcome(testConfig, overrideValue);
  const matchedLabel = normalizeText(matchedOutcome?.label);
  const displayValue = matchedLabel
    ? normalizeText(matchedLabel.split("·")[0] ?? matchedLabel)
    : normalizeText(overrideValue);
  const modeMeta = resolveTypeologyDevOverrideModeMeta({
    testConfig,
    baseResult,
  });
  const resolvedScore = resolveTypeologyDevOverrideScore(baseResult);
  const mainResult = {
    key: normalizeText(matchedOutcome?.key) || `${testConfig.key}-dev-override`,
    label: matchedLabel || normalizeText(overrideValue),
    score: resolvedScore,
    summary:
      normalizeText(matchedOutcome?.summary) ||
      buildTypeologyDevOverrideFallbackSummary({
        testName: testConfig.name,
        overrideValue,
      }),
    tags:
      normalizeTextList(matchedOutcome?.tags, 3).length > 0
        ? normalizeTextList(matchedOutcome?.tags, 3)
        : TYPEOLOGY_DEV_RESULT_OVERRIDE_TAG_LIST,
    actions:
      normalizeTextList(matchedOutcome?.actions, 3).length > 0
        ? normalizeTextList(matchedOutcome?.actions, 3)
        : TYPEOLOGY_DEV_RESULT_OVERRIDE_ACTION_LIST,
  };
  const summaryText = matchedOutcome
    ? buildTypeologyPersonalitySummary({
        mainResult,
        outcomeMetaMap: testConfig?.outcomeMap ?? null,
      })
    : buildTypeologyDevOverrideFallbackSummary({
        testName: testConfig.name,
        overrideValue,
      });

  const baseSyntheticResult = {
    testKey: testConfig.key,
    testName: testConfig.name,
    modeKey: modeMeta.modeKey,
    modeLabel: modeMeta.modeLabel,
    scoreLabel: modeMeta.scoreLabel,
    questionCount: modeMeta.questionCount,
    completedAt: updatedAt,
    source: modeMeta.source,
    displayValue,
    mainResult,
    topThree: [
      {
        key: mainResult.key,
        label: mainResult.label,
        score: resolvedScore,
      },
    ],
    scoreBoard: [
      {
        key: mainResult.key,
        label: mainResult.label,
        rawScore: resolvedScore,
        score: resolvedScore,
        summary: mainResult.summary,
        tags: mainResult.tags,
        actions: mainResult.actions,
      },
    ],
    summaryLines: [],
    insight: summaryText,
    summaryText,
    detailTags: mainResult.tags,
    detailActions: mainResult.actions,
    aiInsight: null,
    devOverrideMeta: {
      applied: true,
      overrideValue: normalizeText(overrideValue),
      updatedAt,
    },
  };

  return sanitizeTypeologyResult({
    ...baseSyntheticResult,
    ...(persistedResultPayload && typeof persistedResultPayload === "object"
      ? persistedResultPayload
      : {}),
    testKey: baseSyntheticResult.testKey,
    testName: baseSyntheticResult.testName,
    modeKey: baseSyntheticResult.modeKey,
    modeLabel: baseSyntheticResult.modeLabel,
    scoreLabel: baseSyntheticResult.scoreLabel,
    questionCount: baseSyntheticResult.questionCount,
    source: baseSyntheticResult.source,
    displayValue: baseSyntheticResult.displayValue,
    mainResult:
      persistedResultPayload?.mainResult &&
      typeof persistedResultPayload.mainResult === "object"
        ? persistedResultPayload.mainResult
        : baseSyntheticResult.mainResult,
    devOverrideMeta: baseSyntheticResult.devOverrideMeta,
  });
}

/**
 * 根据测试类型构建开发覆盖结果。
 * @param {string} testKey 测试键。
 * @param {{ overrideValue: string, updatedAt: number, resultPayload?: object }} overrideEntry 覆盖记录。
 * @param {object|null} baseResult 历史真实结果。
 * @returns {object|null} 开发覆盖结果。
 */
function buildTypeologyDevOverrideResult(testKey, overrideEntry, baseResult = null) {
  const normalizedTestKey = normalizeText(testKey);
  const testConfig = getTypeologyTestConfig(normalizedTestKey);
  const normalizedOverrideEntry =
    normalizeTypeologyDevResultOverrideEntry(overrideEntry);
  if (!normalizedTestKey || !testConfig || !normalizedOverrideEntry) {
    return null;
  }

  if (normalizedTestKey === "mbti") {
    return buildMbtiDevOverrideResult({
      testConfig,
      overrideValue: normalizedOverrideEntry.overrideValue,
      updatedAt: normalizedOverrideEntry.updatedAt,
      baseResult,
      persistedResultPayload: normalizedOverrideEntry.resultPayload ?? null,
    });
  }

  if (normalizedTestKey === "enneagram") {
    return buildEnneagramDevOverrideResult({
      testConfig,
      overrideValue: normalizedOverrideEntry.overrideValue,
      updatedAt: normalizedOverrideEntry.updatedAt,
      baseResult,
      persistedResultPayload: normalizedOverrideEntry.resultPayload ?? null,
    });
  }

  return buildGenericTypeologyDevOverrideResult({
    testConfig,
    overrideValue: normalizedOverrideEntry.overrideValue,
    updatedAt: normalizedOverrideEntry.updatedAt,
    baseResult,
    persistedResultPayload: normalizedOverrideEntry.resultPayload ?? null,
  });
}

/**
 * 合并真实结果缓存与开发覆盖结果。
 * 关键逻辑：开发覆盖只作用于展示层，真实缓存对象保持原样，避免污染正式结果链路。
 * 复杂度评估：O(K + D)，K 为正式结果数量，D 为开发覆盖数量；两者均为固定小常量。
 * @param {Record<string, object>} resultCache 真实结果缓存。
 * @param {Record<string, any>} overrideMap 开发覆盖映射。
 * @returns {Record<string, object>} 合并后的展示结果缓存。
 */
export function mergeTypeologyResultCacheWithDevOverrides(
  resultCache,
  overrideMap,
) {
  const mergedResultCache = {
    ...(resultCache ?? {}),
  };

  if (!isTypeologyDevResultOverrideEnabled()) {
    return mergedResultCache;
  }

  const normalizedOverrideMap =
    normalizeTypeologyDevResultOverrideMap(overrideMap);
  Object.entries(normalizedOverrideMap).forEach(([testKey, overrideEntry]) => {
    const devOverrideResult = buildTypeologyDevOverrideResult(
      testKey,
      overrideEntry,
      resultCache?.[testKey] ?? null,
    );
    if (!devOverrideResult) {
      return;
    }

    mergedResultCache[testKey] = devOverrideResult;
  });

  return mergedResultCache;
}
