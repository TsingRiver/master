import { sanitizeTypeologyResult } from "./mbtiResultIntegrity";

/**
 * 类型学结果缓存键：
 * 统一存储 12 个测试的最近一次结果与进阶解读内容。
 */
const TYPEOLOGY_RESULT_CACHE_KEY = "asking_typeology_result_cache_v1";

/**
 * 类型学进度缓存键前缀：
 * 关键逻辑：按测试键拆分缓存，避免每次答题都重写整份大对象。
 */
const TYPEOLOGY_PROGRESS_CACHE_KEY_PREFIX = "asking_typeology_progress_v1_";

/**
 * 安全解析 JSON 字符串。
 * @param {string} rawString 原始字符串。
 * @returns {Record<string, object>} 解析结果对象；异常时返回空对象。
 */
function safeParseObject(rawString) {
  if (!rawString || typeof rawString !== "string") {
    return {};
  }

  try {
    const parsedObject = JSON.parse(rawString);
    return parsedObject && typeof parsedObject === "object" ? parsedObject : {};
  } catch {
    return {};
  }
}

/**
 * 规范化结果缓存对象。
 * 关键逻辑：
 * 1. 统一在存取缓存两端做兜底，兼容历史脏数据；
 * 2. MBTI 与通用类型学测试分别走对应的一致性修复规则。
 * 复杂度评估：O(K)，K 为缓存中的测试结果数量。
 * @param {Record<string, object>} cacheObject 原始缓存对象。
 * @returns {Record<string, object>} 规范化后的缓存对象。
 */
function normalizeTypeologyResultCache(cacheObject) {
  const normalizedCacheObject = {};

  Object.entries(cacheObject ?? {}).forEach(([testKey, resultPayload]) => {
    // 关键逻辑：所有类型学结果统一经过一致性校验，MBTI/通用测试分别走各自规则。
    normalizedCacheObject[testKey] = sanitizeTypeologyResult(resultPayload);
  });

  return normalizedCacheObject;
}

/**
 * 读取本地结果缓存。
 * @returns {Record<string, object>} 以 testKey 为键的结果对象。
 */
export function loadTypeologyResultCache() {
  try {
    const rawCacheValue = window.localStorage.getItem(TYPEOLOGY_RESULT_CACHE_KEY);
    return normalizeTypeologyResultCache(safeParseObject(rawCacheValue));
  } catch {
    // 关键逻辑：隐私模式或禁用 localStorage 时返回空对象，保证主流程可用。
    return {};
  }
}

/**
 * 写入本地结果缓存。
 * @param {Record<string, object>} cacheObject 缓存对象。
 */
export function saveTypeologyResultCache(cacheObject) {
  try {
    const normalizedCacheObject = normalizeTypeologyResultCache(cacheObject ?? {});
    window.localStorage.setItem(
      TYPEOLOGY_RESULT_CACHE_KEY,
      JSON.stringify(normalizedCacheObject),
    );
  } catch {
    // 关键逻辑：写入失败不抛异常，避免阻断答题流程。
  }
}

/**
 * 获取单个测试缓存。
 * @param {string} testKey 测试键。
 * @returns {object|null} 单个测试结果缓存。
 */
export function getTypeologyCachedResult(testKey) {
  const cacheObject = loadTypeologyResultCache();
  return cacheObject[testKey] ?? null;
}

/**
 * 清空全部类型学结果缓存。
 */
export function clearTypeologyResultCache() {
  try {
    window.localStorage.removeItem(TYPEOLOGY_RESULT_CACHE_KEY);
  } catch {
    // 关键逻辑：删除失败时静默降级，避免清空按钮反向阻断页面主流程。
  }
}

/**
 * 更新单个测试缓存并持久化。
 * @param {string} testKey 测试键。
 * @param {object} resultPayload 结果对象。
 * @returns {Record<string, object>} 更新后的完整缓存对象。
 */
export function upsertTypeologyCachedResult(testKey, resultPayload) {
  const currentCacheObject = loadTypeologyResultCache();
  const nextCacheObject = {
    ...currentCacheObject,
    [testKey]: resultPayload,
  };

  const normalizedNextCacheObject = normalizeTypeologyResultCache(nextCacheObject);
  saveTypeologyResultCache(normalizedNextCacheObject);
  return normalizedNextCacheObject;
}

/**
 * 构建单个测试的进度缓存键。
 * @param {string} testKey 测试键。
 * @returns {string} 进度缓存键。
 */
function buildTypeologyProgressCacheKey(testKey) {
  return `${TYPEOLOGY_PROGRESS_CACHE_KEY_PREFIX}${String(testKey ?? "").trim()}`;
}

/**
 * 读取单个测试进度缓存。
 * @param {string} testKey 测试键。
 * @returns {object|null} 进度对象；异常或无缓存时返回 null。
 */
export function loadTypeologyProgressCache(testKey) {
  const normalizedTestKey = String(testKey ?? "").trim();
  if (!normalizedTestKey) {
    return null;
  }

  try {
    const rawProgressValue = window.localStorage.getItem(
      buildTypeologyProgressCacheKey(normalizedTestKey),
    );
    const parsedProgressObject = safeParseObject(rawProgressValue);
    return Object.keys(parsedProgressObject).length > 0 ? parsedProgressObject : null;
  } catch {
    // 关键逻辑：隐私模式/禁用存储时不抛异常，主流程降级为“仅本次会话内进度”。
    return null;
  }
}

/**
 * 更新单个测试进度缓存。
 * @param {string} testKey 测试键。
 * @param {object} progressPayload 进度对象。
 */
export function saveTypeologyProgressCache(testKey, progressPayload) {
  const normalizedTestKey = String(testKey ?? "").trim();
  if (!normalizedTestKey) {
    return;
  }

  try {
    window.localStorage.setItem(
      buildTypeologyProgressCacheKey(normalizedTestKey),
      JSON.stringify(progressPayload ?? {}),
    );
  } catch {
    // 关键逻辑：写入失败不阻断答题流程。
  }
}

/**
 * 删除单个测试进度缓存。
 * @param {string} testKey 测试键。
 */
export function removeTypeologyProgressCache(testKey) {
  const normalizedTestKey = String(testKey ?? "").trim();
  if (!normalizedTestKey) {
    return;
  }

  try {
    window.localStorage.removeItem(buildTypeologyProgressCacheKey(normalizedTestKey));
  } catch {
    // 关键逻辑：删除失败不影响业务流程。
  }
}

/**
 * 清空全部类型学进度缓存。
 * 复杂度评估：O(K)
 * K 为 localStorage 键数量；当前仅遍历浏览器本地键集合，实际开销较小。
 */
export function clearAllTypeologyProgressCache() {
  try {
    const removableKeyList = [];

    for (let keyIndex = 0; keyIndex < window.localStorage.length; keyIndex += 1) {
      const storageKey = String(window.localStorage.key(keyIndex) ?? "");
      if (!storageKey.startsWith(TYPEOLOGY_PROGRESS_CACHE_KEY_PREFIX)) {
        continue;
      }

      removableKeyList.push(storageKey);
    }

    removableKeyList.forEach((storageKey) => {
      window.localStorage.removeItem(storageKey);
    });
  } catch {
    // 关键逻辑：浏览器禁用存储或删除失败时静默降级，避免影响主流程。
  }
}
