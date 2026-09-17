/**
 * 授权会话 Cookie 名称：
 * 关键逻辑：前端与 middleware 统一使用同一 Cookie 名称，避免会话状态分裂。
 */
export const LICENSE_SESSION_COOKIE_NAME = "asking_license_session";

/**
 * 浏览器环境标识 Cookie 名称：
 * 关键逻辑：与 localStorage 中的 deviceId 保持同值，便于 middleware 在服务端识别当前浏览器环境。
 */
export const LICENSE_DEVICE_COOKIE_NAME = "asking_license_device_id";

/**
 * 统一授权入口路径。
 */
export const LICENSE_AUTH_ENTRY_PATH = "/auth";

/**
 * 默认授权目标：
 * 关键逻辑：当授权页缺少 target 参数时，回退到项目内最核心的 MBTI 入口。
 */
export const DEFAULT_LICENSE_SCOPE_PATH = "/mbti";

/**
 * 授权范围定义：
 * 1. `scopePath` 为统一存储和校验的 canonical path。
 * 2. `aliases` 兼容当前项目已有的多入口别名。
 */
export const LICENSE_SCOPE_DEFINITIONS = Object.freeze([
  {
    scopePath: "/mbti",
    aliases: ["/mbti", "/mbti16", "/mbti.html"],
  },
  // 关键逻辑：`/shmbti` 已从授权范围中移除，无需授权码即可直接访问。
]);

/**
 * 规范化路径。
 * @param {string} rawPath 原始路径。
 * @returns {string} 标准化后的路径。
 */
function normalizePathname(rawPath) {
  const trimmedPath = String(rawPath ?? "").trim();
  if (!trimmedPath) {
    return "/";
  }

  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}

/**
 * 解析授权范围。
 * 复杂度评估：O(S * A)
 * S 为授权范围数量，A 为单个范围别名数量。当前均为小常量，实际可视为 O(1)。
 * @param {string} rawPath 原始路径。
 * @returns {string | null} 命中的 canonical path；未命中时返回 null。
 */
export function resolveLicenseScopePath(rawPath) {
  const normalizedPath = normalizePathname(rawPath);

  for (const scopeDefinition of LICENSE_SCOPE_DEFINITIONS) {
    if (scopeDefinition.aliases.includes(normalizedPath)) {
      return scopeDefinition.scopePath;
    }
  }

  return null;
}

/**
 * 判断当前路径是否为受保护业务路径。
 * @param {string} rawPath 原始路径。
 * @returns {boolean} 是否需要授权。
 */
export function isLicenseProtectedPath(rawPath) {
  return Boolean(resolveLicenseScopePath(rawPath));
}

/**
 * 判断当前路径是否为无需授权的公共路径。
 * 关键逻辑：静态资源和授权页必须直接放行，否则会造成循环跳转。
 * @param {string} rawPath 原始路径。
 * @returns {boolean} 是否为公共路径。
 */
export function isLicensePublicPath(rawPath) {
  const normalizedPath = normalizePathname(rawPath);

  if (normalizedPath === LICENSE_AUTH_ENTRY_PATH) {
    return true;
  }

  if (
    normalizedPath === "/favicon.ico" ||
    normalizedPath === "/robots.txt" ||
    normalizedPath === "/sitemap.xml"
  ) {
    return true;
  }

  if (
    normalizedPath.startsWith("/assets/") ||
    normalizedPath.startsWith("/_vercel/") ||
    normalizedPath.startsWith("/.well-known/")
  ) {
    return true;
  }

  // 关键逻辑：若是业务别名路径（例如 /mbti.html），即使带扩展名也不能当作静态文件放行。
  if (resolveLicenseScopePath(normalizedPath)) {
    return false;
  }

  return /\.[a-z0-9]+$/i.test(normalizedPath);
}
