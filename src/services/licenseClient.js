import {
  LICENSE_SESSION_COOKIE_NAME,
  LICENSE_AUTH_ENTRY_PATH,
} from "../config/licenseAccess";

/**
 * 浏览器端设备标识存储键。
 */
const LICENSE_DEVICE_STORAGE_KEY = "asking-license-device-id";

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
  const cachedDeviceId = String(
    window.localStorage.getItem(LICENSE_DEVICE_STORAGE_KEY) ?? "",
  ).trim();
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  const nextDeviceId = createBrowserDeviceId();
  window.localStorage.setItem(LICENSE_DEVICE_STORAGE_KEY, nextDeviceId);
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
  return requestLicenseApi("/api/license/activate", {
    code: String(payload.code ?? "").trim(),
    targetPath: String(payload.targetPath ?? "").trim(),
    deviceId: readOrCreateLicenseDeviceId(),
  });
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

  return requestLicenseApi("/api/license/check", {
    sessionToken,
    targetPath,
  });
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
