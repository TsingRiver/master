/**
 * 主题中心路由配置：
 * 只有命中特定路径 + 参数校验通过时，才进入主题中心页面。
 */
const APP_PORTAL_PATHS = ["/app-center", "/app"];
const APP_PORTAL_FLAG_PARAM = "hub";
const APP_PORTAL_FLAG_VALUE = "1";
const APP_PORTAL_TOKEN_PARAM = "token";
const APP_PORTAL_TOKEN =
  import.meta.env.VITE_APP_PORTAL_TOKEN ?? "asking-hub-2026";

/**
 * 规范化路径。
 * @param {string} path 浏览器路径。
 * @returns {string} 规范化后的路径。
 */
function normalizePath(path) {
  if (!path || path === "/") {
    return "/";
  }

  const lowerCasePath = String(path).toLowerCase();
  return lowerCasePath.endsWith("/")
    ? lowerCasePath.slice(0, -1) || "/"
    : lowerCasePath;
}

/**
 * 构建 hash 链接。
 * @param {string} path 目标路径。
 * @param {string} [queryString=""] 查询参数字符串（不含 ?）。
 * @returns {string} hash 模式 URL，例如 "#/fortune?hub=1"。
 */
function buildHashUrl(path, queryString = "") {
  const normalizedPath = normalizePath(path);
  const normalizedQueryString = String(queryString ?? "")
    .trim()
    .replace(/^\?/, "");

  return normalizedQueryString
    ? `#${normalizedPath}?${normalizedQueryString}`
    : `#${normalizedPath}`;
}

/**
 * 判断是否是主题中心路径。
 * @param {string} path 浏览器路径。
 * @returns {boolean} 是否为主题中心路径。
 */
export function isPortalPath(path) {
  const normalizedPath = normalizePath(path);
  return APP_PORTAL_PATHS.includes(normalizedPath);
}

/**
 * 解析查询参数对象。
 * @param {string} search location.search。
 * @returns {URLSearchParams} 查询参数对象。
 */
function parseSearch(search) {
  const rawSearch = search?.startsWith("?") ? search.slice(1) : search ?? "";
  return new URLSearchParams(rawSearch);
}

/**
 * 校验主题中心访问令牌。
 * @param {string} search location.search。
 * @returns {boolean} 是否通过参数校验。
 */
export function isPortalTokenValid(search) {
  const searchParams = parseSearch(search);
  const modeFlag = searchParams.get(APP_PORTAL_FLAG_PARAM);
  const token = searchParams.get(APP_PORTAL_TOKEN_PARAM);

  return modeFlag === APP_PORTAL_FLAG_VALUE && token === APP_PORTAL_TOKEN;
}

/**
 * 判断是否展示主题中心页面。
 * @param {string} path location.pathname。
 * @param {string} search location.search。
 * @returns {boolean} 是否进入主题中心页。
 */
export function shouldShowPortalHub(path, search) {
  return isPortalPath(path) && isPortalTokenValid(search);
}

/**
 * 判断是否为主题中心会话。
 * 关键逻辑：只要 token 参数有效，就允许在主题页显示“返回主题中心”入口。
 * @param {string} search location.search。
 * @returns {boolean} 是否为主题中心会话。
 */
export function isPortalSession(search) {
  return isPortalTokenValid(search);
}

/**
 * 构建主题中心查询参数字符串。
 * @returns {string} 例如 "hub=1&token=xxxx"。
 */
export function buildPortalQueryString() {
  const searchParams = new URLSearchParams();
  searchParams.set(APP_PORTAL_FLAG_PARAM, APP_PORTAL_FLAG_VALUE);
  searchParams.set(APP_PORTAL_TOKEN_PARAM, APP_PORTAL_TOKEN);
  return searchParams.toString();
}

/**
 * 构建主题中心 URL。
 * @returns {string} 主题中心链接。
 */
export function buildPortalHubUrl() {
  return buildHashUrl("/app-center", buildPortalQueryString());
}

/**
 * 构建主题页（带主题中心会话参数）URL。
 * @param {string} path 主题路径。
 * @returns {string} 带会话参数的主题页链接。
 */
export function buildPortalThemeUrl(path) {
  return buildHashUrl(path, buildPortalQueryString());
}

/**
 * 返回当前主题中心令牌（用于展示接入方式）。
 * @returns {string} 主题中心令牌。
 */
export function getPortalToken() {
  return APP_PORTAL_TOKEN;
}
