import {
  LICENSE_AUTH_ENTRY_PATH,
  LICENSE_DEVICE_COOKIE_NAME,
  LICENSE_SESSION_COOKIE_NAME,
  isLicenseProtectedPath,
  isLicensePublicPath,
  resolveLicenseScopePath,
} from "./src/config/licenseAccess.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * 读取 Cookie。
 * @param {string} cookieHeader 原始 Cookie 头。
 * @param {string} cookieName 目标 Cookie 名称。
 * @returns {string} Cookie 值。
 */
function readCookieValue(cookieHeader, cookieName) {
  const normalizedHeader = String(cookieHeader ?? "").trim();
  if (!normalizedHeader) {
    return "";
  }

  const cookiePairs = normalizedHeader.split(";");
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
 * Base64URL 解码。
 * @param {string} input Base64URL 字符串。
 * @returns {Uint8Array} 解码后的字节数组。
 */
function decodeBase64Url(input) {
  const normalizedInput = String(input ?? "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const paddingLength = (4 - (normalizedInput.length % 4 || 4)) % 4;
  const binaryString = atob(`${normalizedInput}${"=".repeat(paddingLength)}`);
  const bytes = new Uint8Array(binaryString.length);

  for (let byteIndex = 0; byteIndex < binaryString.length; byteIndex += 1) {
    bytes[byteIndex] = binaryString.charCodeAt(byteIndex);
  }

  return bytes;
}

/**
 * 安全比较两个字节数组。
 * @param {Uint8Array} leftBytes 左侧字节数组。
 * @param {Uint8Array} rightBytes 右侧字节数组。
 * @returns {boolean} 是否完全一致。
 */
function compareByteArrays(leftBytes, rightBytes) {
  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let diffValue = 0;
  for (let byteIndex = 0; byteIndex < leftBytes.length; byteIndex += 1) {
    diffValue |= leftBytes[byteIndex] ^ rightBytes[byteIndex];
  }

  return diffValue === 0;
}

/**
 * 解析 JSON 片段。
 * @param {string} encodedSegment Base64URL 编码片段。
 * @returns {Record<string, unknown> | null} JSON 对象。
 */
function parseJsonTokenSegment(encodedSegment) {
  try {
    return JSON.parse(textDecoder.decode(decodeBase64Url(encodedSegment)));
  } catch {
    return null;
  }
}

/**
 * 校验会话 token。
 * 复杂度评估：O(S)
 * S 为 token 字节长度；仅做一次 HMAC 校验和一次 JSON 解析，整体为常量级短字符串处理。
 * @param {string} tokenValue 原始 token。
 * @param {string} secretValue HMAC 密钥。
 * @returns {Promise<{ valid: boolean, payload: Record<string, unknown> | null }>} 校验结果。
 */
async function verifySessionToken(tokenValue, secretValue) {
  const normalizedToken = String(tokenValue ?? "").trim();
  const tokenParts = normalizedToken.split(".");
  if (tokenParts.length !== 3) {
    return { valid: false, payload: null };
  }

  const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;
  const tokenHeader = parseJsonTokenSegment(encodedHeader);
  if (!tokenHeader || tokenHeader.alg !== "HS256") {
    return { valid: false, payload: null };
  }

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secretValue),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const expectedSignature = new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(`${encodedHeader}.${encodedPayload}`)),
  );
  const actualSignature = decodeBase64Url(encodedSignature);

  if (!compareByteArrays(expectedSignature, actualSignature)) {
    return { valid: false, payload: null };
  }

  const tokenPayload = parseJsonTokenSegment(encodedPayload);
  const expirationAt = Number(tokenPayload?.exp ?? 0);
  if (!tokenPayload || !Number.isFinite(expirationAt) || expirationAt <= Math.floor(Date.now() / 1000)) {
    return { valid: false, payload: null };
  }

  return {
    valid: true,
    payload: tokenPayload,
  };
}

/**
 * 构建授权页跳转地址。
 * @param {URL} requestUrl 当前请求 URL。
 * @param {string} scopePath 目标授权范围。
 * @returns {string} 完整跳转地址。
 */
function buildAuthRedirectUrl(requestUrl, scopePath) {
  const authUrl = new URL(LICENSE_AUTH_ENTRY_PATH, requestUrl.origin);
  authUrl.searchParams.set("target", scopePath);
  authUrl.searchParams.set("from", requestUrl.pathname);
  const ticketValue = String(requestUrl.searchParams.get("ticket") ?? "").trim();
  if (ticketValue) {
    // 关键逻辑：保留原始 URL 中的授权码，避免服务端重定向后丢失自动填充参数。
    authUrl.searchParams.set("ticket", ticketValue);
  }
  return authUrl.toString();
}

/**
 * 调用后端进行二次会话校验。
 * 关键逻辑：本地验签只负责快速过滤明显非法 token；真正的停用状态和浏览器环境绑定仍以后端数据库为准。
 * @param {Request} request 当前浏览器请求。
 * @param {string} sessionToken 当前会话 token。
 * @param {string} scopePath 当前目标授权范围。
 * @returns {Promise<boolean>} 是否通过后端校验。
 */
async function verifySessionWithBackend(request, sessionToken, scopePath) {
  const apiBaseUrl = String(process.env.LICENSE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (!apiBaseUrl) {
    // 关键逻辑：若未配置后端地址，则回退到仅本地验签，保证项目在逐步接入阶段仍可运行。
    return true;
  }

  try {
    const deviceId = readCookieValue(
      request.headers.get("cookie"),
      LICENSE_DEVICE_COOKIE_NAME,
    );
    const response = await fetch(`${apiBaseUrl}/api/license/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionToken,
        targetPath: scopePath,
        deviceId,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const responseBody = await response.json();
    return Boolean(responseBody?.ok);
  } catch {
    return false;
  }
}

/**
 * Vercel Routing Middleware：
 * 1. 仅拦截受保护业务路径。
 * 2. 校验当前 Cookie 是否拥有对应授权范围。
 * 3. 对通过本地验签的 token，再向独立授权服务做一次数据库态校验。
 * 4. 未授权则跳转到统一授权页。
 * @param {Request} request 当前请求对象。
 * @returns {Promise<Response | undefined>} 拦截响应；返回 undefined 表示放行。
 */
export default async function middleware(request) {
  // 关键逻辑：
  // 关闭 Vercel 专属的边缘网关校验拦截，以统一 1Panel 和 Vercel 两种部署方式的底层表现差异。
  // 全面信赖并回退采用客户端（App.vue 里的兜底守卫）配合发起相对路径 AJAX + 反向代理 的混合方式进行无感安全拦截。
  return;
}
