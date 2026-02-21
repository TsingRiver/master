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
