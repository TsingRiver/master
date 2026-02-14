/**
 * 类型学结果缓存键：
 * 统一存储 12 个测试的最近一次结果与进阶解读内容。
 */
const TYPEOLOGY_RESULT_CACHE_KEY = "asking_typeology_result_cache_v1";

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
 * 读取本地结果缓存。
 * @returns {Record<string, object>} 以 testKey 为键的结果对象。
 */
export function loadTypeologyResultCache() {
  try {
    const rawCacheValue = window.localStorage.getItem(TYPEOLOGY_RESULT_CACHE_KEY);
    return safeParseObject(rawCacheValue);
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
    window.localStorage.setItem(
      TYPEOLOGY_RESULT_CACHE_KEY,
      JSON.stringify(cacheObject ?? {}),
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

  saveTypeologyResultCache(nextCacheObject);
  return nextCacheObject;
}

