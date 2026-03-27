import {
  LICENSE_DEVICE_COOKIE_NAME,
  LICENSE_SESSION_COOKIE_NAME,
  LICENSE_AUTH_ENTRY_PATH,
  resolveLicenseScopePath,
} from "../config/licenseAccess";

/**
 * 浏览器端设备标识存储键。
 */
const LICENSE_DEVICE_STORAGE_KEY = "asking-license-device-id";

/**
 * 授权访问上下文存储键：
 * 关键逻辑：按 scopePath 持久化最近一次授权上下文，供结果缓存命名空间与恢复逻辑复用。
 */
const LICENSE_ACCESS_CONTEXT_STORAGE_KEY = "asking-license-access-context-v1";

/**
 * 浏览器环境标识 Cookie 默认有效期（365 天）。
 * 关键逻辑：deviceId 需要跨 session 持久化，避免同一浏览器环境因为短期 Cookie 失效被误判成新环境。
 */
const DEFAULT_LICENSE_DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Cookie 默认有效期（30 天）。
 * 关键逻辑：需与后端 LICENSE_SESSION_TTL_SECONDS 保持一致，避免前后端会话寿命不一致。
 */
const DEFAULT_LICENSE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * 规范化授权服务地址。
 * @param {unknown} rawBaseUrl 原始环境变量值。
 * @returns {string} 无尾随斜杠的基础地址。
 */
function normalizeApiBaseUrl(rawBaseUrl) {
  return String(rawBaseUrl ?? "").trim().replace(/\/+$/, "");
}

/**
 * 解析授权服务基础地址。
 * @returns {string} 授权服务基础地址。
 */
function resolveLicenseApiBaseUrl() {
  // 允许环境变量留空或未配置，此时将返回空字符串，通过当前域名同源的相对路径调用以配合反向代理
  return normalizeApiBaseUrl(import.meta.env.VITE_LICENSE_API_BASE_URL ?? "");
}

/**
 * 读取 Cookie。
 * @param {string} cookieName Cookie 名称。
 * @returns {string} Cookie 值。
 */
function readCookieValue(cookieName) {
  const cookieSource = String(document.cookie ?? "");
  if (!cookieSource) {
    return "";
  }

  const cookiePairs = cookieSource.split(";");
  for (const cookiePair of cookiePairs) {
    const [rawKey = "", ...restParts] = cookiePair.split("=");
    if (rawKey.trim() !== cookieName) {
      continue;
    }

    return decodeURIComponent(restParts.join("="));
  }

  return "";
}

/**
 * 安全读取 localStorage 中的浏览器环境标识。
 * @returns {string} 已缓存的浏览器环境 ID。
 */
function readStoredLicenseDeviceId() {
  try {
    return String(window.localStorage.getItem(LICENSE_DEVICE_STORAGE_KEY) ?? "").trim();
  } catch {
    return "";
  }
}

/**
 * 安全解析授权上下文映射。
 * @param {string} rawValue 原始 JSON 文本。
 * @returns {Record<string, object>} 解析后的上下文映射。
 */
function safeParseLicenseAccessContextMap(rawValue) {
  if (!rawValue || typeof rawValue !== "string") {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

/**
 * 读取全部授权上下文映射。
 * @returns {Record<string, object>} scopePath 到授权上下文的映射对象。
 */
function loadLicenseAccessContextMap() {
  try {
    return safeParseLicenseAccessContextMap(
      window.localStorage.getItem(LICENSE_ACCESS_CONTEXT_STORAGE_KEY),
    );
  } catch {
    return {};
  }
}

/**
 * 保存全部授权上下文映射。
 * @param {Record<string, object>} contextMap scopePath 到授权上下文的映射对象。
 */
function saveLicenseAccessContextMap(contextMap) {
  try {
    window.localStorage.setItem(
      LICENSE_ACCESS_CONTEXT_STORAGE_KEY,
      JSON.stringify(contextMap ?? {}),
    );
  } catch {
    // 关键逻辑：授权上下文缓存失败时不阻断鉴权流程，最多退化为本次会话无法做结果恢复。
  }
}

/**
 * 读取当前 scopePath 的授权上下文。
 * @param {string} targetPath 当前业务路径。
 * @returns {{ licenseId: string, scopePath: string, scopes: Array<string>, typeologyResultSummary?: { hasAnyResult: boolean, testKeys: Array<string>, latestUpdatedAt: string | null }, updatedAt: number } | null} 授权上下文。
 */
export function readLicenseAccessContext(targetPath) {
  const scopePath = resolveLicenseScopePath(targetPath);
  if (!scopePath) {
    return null;
  }

  const contextMap = loadLicenseAccessContextMap();
  const contextPayload = contextMap[scopePath];
  if (!contextPayload || typeof contextPayload !== "object") {
    return null;
  }

  const licenseId = String(contextPayload.licenseId ?? "").trim();
  if (!licenseId) {
    return null;
  }

  return {
    licenseId,
    scopePath,
    scopes: Array.isArray(contextPayload.scopes)
      ? contextPayload.scopes.map((scopeItem) => String(scopeItem ?? "").trim()).filter(Boolean)
      : [],
    typeologyResultSummary:
      contextPayload.typeologyResultSummary &&
      typeof contextPayload.typeologyResultSummary === "object"
        ? {
            hasAnyResult: Boolean(contextPayload.typeologyResultSummary.hasAnyResult),
            testKeys: Array.isArray(contextPayload.typeologyResultSummary.testKeys)
              ? contextPayload.typeologyResultSummary.testKeys
                  .map((testKey) => String(testKey ?? "").trim())
                  .filter(Boolean)
              : [],
            latestUpdatedAt: contextPayload.typeologyResultSummary.latestUpdatedAt ?? null,
          }
        : undefined,
    updatedAt: Number(contextPayload.updatedAt ?? 0) || 0,
  };
}

/**
 * 持久化当前 scopePath 的授权上下文。
 * @param {{ targetPath?: string, scopePath?: string, licenseId?: string, scopes?: Array<string>, typeologyResultSummary?: { hasAnyResult?: boolean, testKeys?: Array<string>, latestUpdatedAt?: string | null } }} payload 授权上下文。
 */
export function persistLicenseAccessContext(payload) {
  const resolvedScopePath =
    resolveLicenseScopePath(payload.scopePath ?? payload.targetPath) ?? "";
  const normalizedLicenseId = String(payload.licenseId ?? "").trim();
  if (!resolvedScopePath || !normalizedLicenseId) {
    return;
  }

  const nextContextMap = loadLicenseAccessContextMap();
  nextContextMap[resolvedScopePath] = {
    licenseId: normalizedLicenseId,
    scopePath: resolvedScopePath,
    scopes: Array.isArray(payload.scopes)
      ? payload.scopes.map((scopeItem) => String(scopeItem ?? "").trim()).filter(Boolean)
      : [],
    typeologyResultSummary: payload.typeologyResultSummary
      ? {
          hasAnyResult: Boolean(payload.typeologyResultSummary.hasAnyResult),
          testKeys: Array.isArray(payload.typeologyResultSummary.testKeys)
            ? payload.typeologyResultSummary.testKeys
                .map((testKey) => String(testKey ?? "").trim())
                .filter(Boolean)
            : [],
          latestUpdatedAt: payload.typeologyResultSummary.latestUpdatedAt ?? null,
        }
      : {
          hasAnyResult: false,
          testKeys: [],
          latestUpdatedAt: null,
        },
    updatedAt: Date.now(),
  };
  saveLicenseAccessContextMap(nextContextMap);
}

/**
 * 根据接口返回刷新授权上下文。
 * @param {object} responseData 授权服务返回 data。
 * @param {string} targetPath 当前业务路径。
 */
function persistLicenseAccessArtifacts(responseData, targetPath) {
  persistLicenseAccessContext({
    targetPath,
    scopePath: String(responseData?.scopePath ?? "").trim(),
    licenseId: String(responseData?.licenseId ?? "").trim(),
    scopes: Array.isArray(responseData?.scopes) ? responseData.scopes : [],
    typeologyResultSummary:
      responseData?.typeologyResultSummary &&
      typeof responseData.typeologyResultSummary === "object"
        ? responseData.typeologyResultSummary
        : undefined,
  });
}

/**
 * 安全写入 localStorage 中的浏览器环境标识。
 * @param {string} deviceId 浏览器环境 ID。
 */
function persistStoredLicenseDeviceId(deviceId) {
  try {
    window.localStorage.setItem(LICENSE_DEVICE_STORAGE_KEY, deviceId);
  } catch {
    // 关键逻辑：localStorage 被禁用时退化为仅 Cookie 持久化，避免直接阻断授权流程。
  }
}

/**
 * 持久化浏览器环境标识 Cookie。
 * @param {string} deviceId 浏览器环境 ID。
 * @param {number} [maxAgeSeconds=DEFAULT_LICENSE_DEVICE_COOKIE_MAX_AGE_SECONDS] Cookie 生命周期。
 */
function persistLicenseDeviceCookie(
  deviceId,
  maxAgeSeconds = DEFAULT_LICENSE_DEVICE_COOKIE_MAX_AGE_SECONDS,
) {
  const normalizedDeviceId = String(deviceId ?? "").trim();
  if (!normalizedDeviceId) {
    return;
  }

  const secureSegment = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${LICENSE_DEVICE_COOKIE_NAME}=${encodeURIComponent(normalizedDeviceId)}; ` +
    `Path=/; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}; SameSite=Lax${secureSegment}`;
}

/**
 * 生成浏览器环境标识。
 * @returns {string} 浏览器环境 ID。
 */
function createBrowserDeviceId() {
  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 获取当前浏览器环境 ID。
 * 关键逻辑：首次生成后持久化到 localStorage，模拟“当前浏览器环境”绑定。
 * @returns {string} 稳定 deviceId。
 */
export function readOrCreateLicenseDeviceId() {
  const cachedStorageDeviceId = readStoredLicenseDeviceId();
  const cachedCookieDeviceId = readCookieValue(LICENSE_DEVICE_COOKIE_NAME);
  const resolvedCachedDeviceId = cachedStorageDeviceId || cachedCookieDeviceId;

  if (resolvedCachedDeviceId) {
    if (!cachedStorageDeviceId) {
      persistStoredLicenseDeviceId(resolvedCachedDeviceId);
    }
    if (cachedCookieDeviceId !== resolvedCachedDeviceId) {
      persistLicenseDeviceCookie(resolvedCachedDeviceId);
    }
    return resolvedCachedDeviceId;
  }

  const nextDeviceId = createBrowserDeviceId();
  persistStoredLicenseDeviceId(nextDeviceId);
  persistLicenseDeviceCookie(nextDeviceId);
  return nextDeviceId;
}

/**
 * 持久化授权会话 Cookie。
 * @param {string} sessionToken 会话 token。
 * @param {number} [maxAgeSeconds=DEFAULT_LICENSE_COOKIE_MAX_AGE_SECONDS] Cookie 生命周期。
 */
export function persistLicenseSessionToken(
  sessionToken,
  maxAgeSeconds = DEFAULT_LICENSE_COOKIE_MAX_AGE_SECONDS,
) {
  const secureSegment = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${LICENSE_SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}; ` +
    `Path=/; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}; SameSite=Lax${secureSegment}`;
}

/**
 * 清除授权会话 Cookie。
 */
export function clearLicenseSessionToken() {
  const secureSegment = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${LICENSE_SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secureSegment}`;
}

/**
 * 读取当前授权会话 token。
 * @returns {string} 会话 token。
 */
export function readLicenseSessionToken() {
  return readCookieValue(LICENSE_SESSION_COOKIE_NAME);
}

/**
 * 发送授权服务请求。
 * 复杂度评估：O(1)
 * 单次仅触发一次固定地址网络请求，业务开销主要由网络往返决定。
 * @param {string} apiPath API 路径。
 * @param {object} payload 请求体。
 * @returns {Promise<any>} 后端返回的 data 字段。
 */
async function requestLicenseApi(apiPath, payload) {
  const response = await fetch(`${resolveLicenseApiBaseUrl()}${apiPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const responseBody = await response.json();

  if (!response.ok || !responseBody.ok) {
    const responseError = new Error(responseBody.code || responseBody.message || "LICENSE_API_ERROR");
    responseError.code = responseBody.code || responseBody.message || "LICENSE_API_ERROR";
    throw responseError;
  }

  return responseBody.data;
}

/**
 * 激活授权范围。
 * @param {{ code: string, targetPath: string }} payload 激活参数。
 * @returns {Promise<{ sessionToken: string, scopes: Array<string>, scopePath: string, licenseId: string }>} 激活结果。
 */
export async function activateLicenseAccess(payload) {
  const activationResult = await requestLicenseApi("/api/license/activate", {
    code: String(payload.code ?? "").trim(),
    targetPath: String(payload.targetPath ?? "").trim(),
    deviceId: readOrCreateLicenseDeviceId(),
  });
  persistLicenseAccessArtifacts(activationResult, payload.targetPath);
  return activationResult;
}

/**
 * 校验现有授权会话。
 * @param {string} targetPath 当前目标路径。
 * @returns {Promise<{ valid: boolean, sessionToken?: string, scopes?: Array<string>, scopePath?: string, reason?: string }>} 校验结果。
 */
export async function checkLicenseSession(targetPath) {
  // --- 老用户静默豁免逻辑 (Grandfathering Exemption) ---
  try {
    const hasOldResultCache = window.localStorage.getItem("asking_typeology_result_cache_v1");
    let hasOldProgress = false;
    
    // 如果没有完整结果，检查是否有进行到一半的答题进度
    if (!hasOldResultCache) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i) || "";
        if (key.startsWith("asking_typeology_progress_v1_")) {
          hasOldProgress = true;
          break;
        }
      }
    }

    // 只要有任何一丝曾经在设备上做过测试的证据，直接认定为合法“开国老用户”，颁发畅行绿卡
    if (hasOldResultCache || hasOldProgress) {
      return {
        valid: true,
        reason: "GRANDFATHERED_EXEMPTION",
        scopes: ["*"] // 赋予最高全局权限
      };
    }
  } catch (e) {
    // 忽略 localStorage 被禁用或拒绝访问等安全异常，正常走强校验流程
  }
  // -----------------------------------------------------

  const sessionToken = readLicenseSessionToken();
  if (!sessionToken) {
    return {
      valid: false,
      reason: "SESSION_MISSING",
    };
  }

  const validationResult = await requestLicenseApi("/api/license/check", {
    sessionToken,
    targetPath,
    deviceId: readOrCreateLicenseDeviceId(),
  });
  persistLicenseAccessArtifacts(validationResult, targetPath);
  return validationResult;
}

/**
 * 读取授权码绑定的类型学结果。
 * @param {string} targetPath 当前业务路径。
 * @returns {Promise<{ licenseId: string, sessionToken?: string, scopePath?: string | null, scopes?: Array<string>, typeologyResultSummary?: { hasAnyResult: boolean, testKeys: Array<string>, latestUpdatedAt: string | null }, resultMap: Record<string, object> }>} 结果集。
 */
export async function readLicenseTypeologyResults(targetPath) {
  const resultData = await requestLicenseApi("/api/license/typeology/read", {
    sessionToken: readLicenseSessionToken(),
    targetPath: String(targetPath ?? "").trim(),
    deviceId: readOrCreateLicenseDeviceId(),
  });

  if (resultData?.sessionToken) {
    persistLicenseSessionToken(resultData.sessionToken);
  }
  persistLicenseAccessArtifacts(resultData, targetPath);
  return resultData;
}

/**
 * 增量写入授权码绑定的单条类型学结果。
 * @param {{ targetPath: string, testKey: string, resultPayload: object }} payload 写入参数。
 * @returns {Promise<{ licenseId: string, sessionToken?: string, scopePath?: string | null, scopes?: Array<string>, typeologyResultSummary?: { hasAnyResult: boolean, testKeys: Array<string>, latestUpdatedAt: string | null } }>} 写入结果。
 */
export async function upsertLicenseTypeologyResult(payload) {
  const resultData = await requestLicenseApi("/api/license/typeology/upsert", {
    sessionToken: readLicenseSessionToken(),
    targetPath: String(payload.targetPath ?? "").trim(),
    deviceId: readOrCreateLicenseDeviceId(),
    testKey: String(payload.testKey ?? "").trim(),
    resultPayload: payload.resultPayload,
  });

  if (resultData?.sessionToken) {
    persistLicenseSessionToken(resultData.sessionToken);
  }
  persistLicenseAccessArtifacts(resultData, payload.targetPath);
  return resultData;
}

/**
 * 清空授权码绑定的全部类型学结果。
 * @param {string} targetPath 当前业务路径。
 * @returns {Promise<{ licenseId: string, sessionToken?: string, scopePath?: string | null, scopes?: Array<string>, typeologyResultSummary?: { hasAnyResult: boolean, testKeys: Array<string>, latestUpdatedAt: string | null } }>} 清空结果。
 */
export async function clearLicenseTypeologyResults(targetPath) {
  const resultData = await requestLicenseApi("/api/license/typeology/clear", {
    sessionToken: readLicenseSessionToken(),
    targetPath: String(targetPath ?? "").trim(),
    deviceId: readOrCreateLicenseDeviceId(),
  });

  if (resultData?.sessionToken) {
    persistLicenseSessionToken(resultData.sessionToken);
  }
  persistLicenseAccessArtifacts(resultData, targetPath);
  return resultData;
}

/**
 * 跳转到授权页。
 * @param {string} targetPath 目标业务路径。
 */
export function redirectToLicenseAuth(targetPath) {
  const authUrl = new URL(LICENSE_AUTH_ENTRY_PATH, window.location.origin);
  authUrl.searchParams.set("target", String(targetPath ?? "").trim());
  window.location.replace(authUrl.toString());
}
