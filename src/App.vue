<template>
  <div class="app-root">
    <LinkErrorPage v-if="showIncompleteLinkError" />
    <section
      v-else-if="showClientLicenseChecking"
      class="license-guard-loading-shell"
    >
      <div class="license-guard-loading-card">
        <p class="license-guard-loading-eyebrow">License Check</p>
        <h1 class="license-guard-loading-title">正在校验访问权限</h1>
        <p class="license-guard-loading-text">
          当前页面需要授权，系统正在检查当前浏览器环境是否已拥有
          <strong>{{ activeLicenseGateTargetPath }}</strong>
          的访问权限。
        </p>
      </div>
    </section>
    <LicenseAccessPage
      v-else-if="shouldShowLicenseAccessPage"
      :target-path="activeLicenseGateTargetPath"
      :prefill-code="licenseEntryTicket"
    />
    <ThemeHub
      v-else-if="showPortalHub"
      :theme-configs="themeConfigs"
      :build-theme-href="buildThemeHref"
    />
    <TypeologyLab
      v-else-if="isTypeologyLabTheme"
      :theme-config="activeThemeConfig"
      :portal-mode="portalSession"
      :portal-home-href="portalHubHref"
    />
    <RomanceStandalone
      v-else-if="isRomanceStandaloneTheme"
      :theme-config="activeThemeConfig"
      :portal-mode="portalSession"
      :portal-home-href="portalHubHref"
    />
    <SoulAgeStandalone
      v-else-if="isSoulAgeStandaloneTheme"
      :theme-config="activeThemeConfig"
      :portal-mode="portalSession"
      :portal-home-href="portalHubHref"
    />
    <SurveyEngine
      v-else
      :theme-config="activeThemeConfig"
      :portal-mode="portalSession"
      :portal-home-href="portalHubHref"
    />

    <!-- 底部备案信息：同时展示工信部 ICP 与公安备案，统一保留全站底部入口。 -->
    <footer class="icp-footer">
      <div class="icp-footer-inner">
        <a
          class="icp-footer-link"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          浙ICP备2026013019号
        </a>
        <span class="icp-footer-divider" aria-hidden="true"></span>
        <a
          class="icp-footer-link icp-footer-link-police"
          href="https://beian.mps.gov.cn/#/query/webSearch?code=33010902004517"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            class="icp-footer-icon"
            src="/beian.png"
            alt=""
            aria-hidden="true"
          />
          浙公网安备33010902004517号
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import LinkErrorPage from "./components/LinkErrorPage.vue";
import SurveyEngine from "./components/SurveyEngine.vue";
import ThemeHub from "./components/ThemeHub.vue";
import {
  checkLicenseSession,
  clearLicenseSessionToken,
  persistLicenseSessionToken,
} from "./services/licenseClient";
import {
  DEFAULT_LICENSE_SCOPE_PATH,
  LICENSE_AUTH_ENTRY_PATH,
  resolveLicenseScopePath,
} from "./config/licenseAccess";
import {
  DEFAULT_SURVEY_THEME,
  SURVEY_THEME_CONFIGS,
  hasSurveyThemePath,
  resolveSurveyThemeByPath,
} from "./config/surveyThemes";
import {
  buildPortalHubUrl,
  buildPortalThemeUrl,
  isPortalPath,
  isPortalSession,
  shouldShowPortalHub,
} from "./config/appPortal";

/**
 * 按需加载重组件：
 * 关键逻辑：仅在命中对应主题时加载独立页面代码，减少首屏下载体积。
 */
const TypeologyLab = defineAsyncComponent(
  () => import("./components/TypeologyLab.vue"),
);
const RomanceStandalone = defineAsyncComponent(
  () => import("./components/RomanceStandalone.vue"),
);
const SoulAgeStandalone = defineAsyncComponent(
  () => import("./components/SoulAgeStandalone.vue"),
);
const LicenseAccessPage = defineAsyncComponent(
  () => import("./components/LicenseAccessPage.vue"),
);

/**
 * 当前浏览器路径与查询参数：
 * 关键逻辑：优先读取 hash 路由，兼容无 hash 的旧路径模式。
 */
const currentPath = ref("/");
const currentSearch = ref("");
const hasInvalidHashLink = ref(false);
const hasHashRouteEntry = ref(false);
const clientLicenseGuardReady = ref(false);
const clientLicenseAccessGranted = ref(false);
let clientLicenseGuardRunToken = 0;

/**
 * 主题配置列表：
 * 关键逻辑：主题中心只显示允许在 Hub 暴露的主题集合，避免误展示已下线入口。
 * 复杂度评估：每次计算为 O(T)，T 为主题总数；当前 T 较小（常量级），可忽略性能影响。
 */
/**
 * 主题中心隐藏项：
 * 关键逻辑：仅影响 app-center 展示层，不影响实际主题路由解析。
 */
const HUB_HIDDEN_THEME_KEYS = new Set(["mbti"]);
const themeConfigs = computed(() =>
  SURVEY_THEME_CONFIGS.filter(
    (themeConfig) =>
      // 关键逻辑：仅移除 app-center 卡片入口，不影响该主题的独立路由能力。
      !HUB_HIDDEN_THEME_KEYS.has(themeConfig.key),
  ),
);

/**
 * 当前路径对应的主题配置。
 */
const activeThemeConfig = computed(() =>
  resolveSurveyThemeByPath(currentPath.value),
);

/**
 * 是否显示主题中心页面。
 */
const showPortalHub = computed(() =>
  shouldShowPortalHub(currentPath.value, currentSearch.value),
);

/**
 * 是否展示无效链接错误页：
 * 关键逻辑：当 hash 路径不存在或参数不完整时阻断默认主题渲染。
 * 复杂度评估：每次计算为 O(1)。
 */
const showIncompleteLinkError = computed(
  () => hasInvalidHashLink.value && !showPortalHub.value,
);

/**
 * 是否展示统一授权页。
 */
const isLicenseAuthPath = computed(
  () => currentPath.value === LICENSE_AUTH_ENTRY_PATH,
);

/**
 * 当前授权页对应的目标业务路径。
 * 关键逻辑：只接受已注册的授权范围，避免任意 query 参数被当成合法跳转地址。
 */
const licenseAuthTargetPath = computed(() => {
  if (!isLicenseAuthPath.value) {
    return DEFAULT_LICENSE_SCOPE_PATH;
  }

  const searchParams = new URLSearchParams(currentSearch.value);
  const rawTargetPath = String(searchParams.get("target") ?? "").trim();
  return resolveLicenseScopePath(rawTargetPath) ?? DEFAULT_LICENSE_SCOPE_PATH;
});

/**
 * 当前受保护业务路径对应的授权范围。
 */
const currentProtectedLicenseScopePath = computed(() => {
  if (isLicenseAuthPath.value) {
    return null;
  }

  return resolveLicenseScopePath(currentPath.value);
});

/**
 * 是否需要前端兜底授权守卫。
 * 关键逻辑：
 * 1. 当前项目生产环境已显式关闭 Vercel middleware，受保护路径必须统一走客户端补校验。
 * 2. `#` hash 路由与直达 plain path（例如 `/mbti`）都可能绕过服务端识别，因此只要命中受保护范围就执行守卫。
 * 3. 显式排除授权页与无效链接页，避免守卫对 `/auth` 或错误页造成循环干扰。
 * 复杂度评估：O(1)。
 */
const requiresClientLicenseGuard = computed(
  () =>
    !showIncompleteLinkError.value &&
    !isLicenseAuthPath.value &&
    Boolean(currentProtectedLicenseScopePath.value),
);

/**
 * 当前激活的授权目标。
 * 关键逻辑：授权页与前端兜底守卫共用同一授权组件，统一传递目标范围。
 */
const activeLicenseGateTargetPath = computed(() =>
  isLicenseAuthPath.value
    ? licenseAuthTargetPath.value
    : (currentProtectedLicenseScopePath.value ?? DEFAULT_LICENSE_SCOPE_PATH),
);

/**
 * 当前地址携带的授权码。
 * 关键逻辑：统一从 plain query 与 hash query 解析，供授权页自动填充。
 */
const licenseEntryTicket = computed(() => {
  const searchParams = new URLSearchParams(currentSearch.value);
  return String(searchParams.get("ticket") ?? "").trim().toUpperCase();
});

/**
 * 是否展示前端授权校验中的加载态。
 */
const showClientLicenseChecking = computed(
  () => requiresClientLicenseGuard.value && !clientLicenseGuardReady.value,
);

/**
 * 是否展示授权页。
 * 关键逻辑：显式 `/auth` 页面和“前端兜底守卫判定未授权”共用同一入口。
 */
const shouldShowLicenseAccessPage = computed(
  () =>
    isLicenseAuthPath.value ||
    (requiresClientLicenseGuard.value &&
      clientLicenseGuardReady.value &&
      !clientLicenseAccessGranted.value),
);

/**
 * 是否走类型学卡片中心组件：
 * 关键逻辑：`mbti` 主题已升级为 12 类类型学测试中心。
 */
const isTypeologyLabTheme = computed(
  () => activeThemeConfig.value?.key === "mbti",
);

/**
 * 是否走浪漫主题独立组件：
 * 关键逻辑：`romance` 主题使用独立 UI，不复用通用 SurveyEngine。
 */
const isRomanceStandaloneTheme = computed(
  () => activeThemeConfig.value?.key === "romance",
);

/**
 * 是否走灵魂年龄独立组件：
 * 关键逻辑：`soul-age` 主题采用独立视觉与交互，不复用通用 SurveyEngine。
 */
const isSoulAgeStandaloneTheme = computed(
  () => activeThemeConfig.value?.key === "soul-age",
);

/**
 * 是否处于主题中心会话：
 * 仅用于在主题页显示“返回主题中心”入口。
 */
const portalSession = computed(() => isPortalSession(currentSearch.value));

/**
 * 主题中心链接。
 */
const portalHubHref = computed(() => buildPortalHubUrl());

/**
 * 构建主题入口链接（包含主题中心会话参数）。
 * @param {object} themeConfig 单个主题配置对象。
 * @returns {string} 主题入口链接。
 */
function buildThemeHref(themeConfig) {
  const mainRoute = themeConfig.routePaths[0] ?? "/";
  return buildPortalThemeUrl(mainRoute);
}

/**
 * 解析 hash 路由。
 * @param {string} hashValue location.hash 原始值。
 * @returns {{ hasHashRoute: boolean, path: string, search: string }} 解析结果。
 */
function parseHashRoute(hashValue) {
  const rawHash = String(hashValue ?? "");
  if (!rawHash.startsWith("#")) {
    return { hasHashRoute: false, path: "/", search: "" };
  }

  const hashBody = rawHash.slice(1).trim();
  if (!hashBody) {
    // 关键逻辑："#" 视为根 hash 路径，后续由不完整链接判定统一拦截。
    return { hasHashRoute: true, path: "/", search: "" };
  }

  // 关键逻辑：把 "#/fortune?hub=1" 解析为 path="/fortune"、search="?hub=1"。
  const [rawPath = "/", rawQuery = ""] = hashBody.split("?");
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const normalizedSearch = rawQuery ? `?${rawQuery}` : "";

  return {
    hasHashRoute: true,
    path: normalizedPath,
    search: normalizedSearch,
  };
}

/**
 * 判断 hash 地址是否无效。
 * @param {{ hasHashRoute: boolean, path: string, search: string }} parsedHashRoute hash 解析结果。
 * @returns {boolean} 是否需要进入错误页。
 */
function isInvalidHashRoute(parsedHashRoute) {
  if (!parsedHashRoute.hasHashRoute) {
    return false;
  }

  if (parsedHashRoute.path === LICENSE_AUTH_ENTRY_PATH) {
    return false;
  }

  // 关键逻辑：仅命中已注册主题路径时视为有效，例如 "#/mbti"。
  if (hasSurveyThemePath(parsedHashRoute.path)) {
    return false;
  }

  if (isPortalPath(parsedHashRoute.path)) {
    // 关键逻辑：主题中心路径必须携带完整校验参数，否则按不完整链接处理。
    return !shouldShowPortalHub(parsedHashRoute.path, parsedHashRoute.search);
  }

  // 关键逻辑：未知 hash 路径（例如 "#/love2"）统一进入错误页，避免兜底到城市主题。
  return true;
}

/**
 * 判断非 hash 地址是否无效。
 * @param {string} pathname 浏览器 pathname。
 * @returns {boolean} 是否需要进入错误页。
 */
function isInvalidPlainEntry(pathname) {
  const normalizedPathname = String(pathname ?? "").toLowerCase();

  if (normalizedPathname === LICENSE_AUTH_ENTRY_PATH) {
    return false;
  }

  // 关键逻辑：仅放行已注册主题路径，例如 "/mbti"；裸域名 "/" 与未知路径均进入错误页。
  return !hasSurveyThemePath(normalizedPathname);
}

/**
 * 同步地址状态：
 * 1. 优先采用 hash 路径（适配无 Nginx rewrite 场景）。
 * 2. hash 不存在时回退到 pathname（兼容本地旧访问方式）。
 */
function syncLocationFromBrowser() {
  const parsedHashRoute = parseHashRoute(window.location.hash);

  if (parsedHashRoute.hasHashRoute) {
    hasHashRouteEntry.value = true;
    currentPath.value = parsedHashRoute.path;
    currentSearch.value = parsedHashRoute.search;
    hasInvalidHashLink.value = isInvalidHashRoute(parsedHashRoute);
    return;
  }

  hasHashRouteEntry.value = false;
  currentPath.value = window.location.pathname;
  currentSearch.value = window.location.search;
  hasInvalidHashLink.value = isInvalidPlainEntry(currentPath.value);
}

/**
 * 首次同步地址状态。
 */
syncLocationFromBrowser();

/**
 * 监听地址变化：
 * 1. hashchange：覆盖 hash 模式跳转。
 * 2. popstate：兼容历史记录回退场景。
 */
window.addEventListener("hashchange", syncLocationFromBrowser);
window.addEventListener("popstate", syncLocationFromBrowser);

/**
 * 前端兜底授权守卫：
 * 关键逻辑：
 * 1. 本地开发与 hash 路由时，服务端 middleware 无法可靠拦截，需在客户端补一次授权校验。
 * 2. 若已有有效 Cookie，则直接放行并刷新本地 Cookie 生命周期。
 * 3. 若无效或缺失，则切到统一授权页组件。
 * 复杂度评估：O(1)
 * 单次仅发起一次固定接口校验请求（或在无 Cookie 时常量级返回）。
 */
watch(
  [requiresClientLicenseGuard, currentProtectedLicenseScopePath],
  async ([shouldGuard, scopePath]) => {
    const currentRunToken = clientLicenseGuardRunToken + 1;
    clientLicenseGuardRunToken = currentRunToken;

    if (!shouldGuard || !scopePath) {
      clientLicenseGuardReady.value = true;
      clientLicenseAccessGranted.value = true;
      return;
    }

    clientLicenseGuardReady.value = false;

    try {
      const validationResult = await checkLicenseSession(scopePath);
      if (currentRunToken !== clientLicenseGuardRunToken) {
        return;
      }

      if (validationResult.valid) {
        if (validationResult.sessionToken) {
          persistLicenseSessionToken(validationResult.sessionToken);
        }
        clientLicenseAccessGranted.value = true;
      } else {
        clearLicenseSessionToken();
        clientLicenseAccessGranted.value = false;
      }
    } catch {
      if (currentRunToken !== clientLicenseGuardRunToken) {
        return;
      }

      clearLicenseSessionToken();
      clientLicenseAccessGranted.value = false;
    } finally {
      if (currentRunToken === clientLicenseGuardRunToken) {
        clientLicenseGuardReady.value = true;
      }
    }
  },
  { immediate: true },
);

/**
 * 路径变化时同步页面 Meta 信息。
 */
watch(
  [
    showIncompleteLinkError,
    isLicenseAuthPath,
    showPortalHub,
    activeThemeConfig,
  ],
  ([isInvalidLinkPage, isAuthPage, isHubPage, themeConfig]) => {
    if (isInvalidLinkPage) {
      document.title = "链接错误";
      const invalidLinkDescriptionMeta = document.querySelector(
        'meta[name="description"]',
      );
      if (invalidLinkDescriptionMeta) {
        invalidLinkDescriptionMeta.setAttribute(
          "content",
          "当前访问链接不完整，请完整复制整个链接后重新访问。",
        );
      }
      return;
    }

    if (isAuthPage) {
      document.title = "授权验证";
      const authDescriptionMeta = document.querySelector(
        'meta[name="description"]',
      );
      if (authDescriptionMeta) {
        authDescriptionMeta.setAttribute(
          "content",
          "请输入授权码以访问当前问卷页面。",
        );
      }
      return;
    }

    if (isHubPage) {
      document.title = "问卷主题中心";
      const hubDescriptionMeta = document.querySelector(
        'meta[name="description"]',
      );
      if (hubDescriptionMeta) {
        hubDescriptionMeta.setAttribute(
          "content",
          "隐藏入口主题中心：选择问卷主题并随时切换。",
        );
      }
      return;
    }

    const resolvedThemeConfig = themeConfig ?? DEFAULT_SURVEY_THEME;
    document.title = resolvedThemeConfig.pageMeta.title;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute(
        "content",
        resolvedThemeConfig.pageMeta.description,
      );
    }
  },
  { immediate: true },
);

/**
 * 组件卸载时清理事件监听。
 */
onBeforeUnmount(() => {
  window.removeEventListener("hashchange", syncLocationFromBrowser);
  window.removeEventListener("popstate", syncLocationFromBrowser);
});
</script>

<style scoped>
/* 根容器：确保子组件不受包裹影响 */
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 全站备案信息底栏：
 * 关键逻辑：使用半透明胶囊容器统一承载双备案链接，兼容深浅背景并提升移动端可读性。
 */
.icp-footer {
  display: flex;
  justify-content: center;
  padding: 14px 16px 22px;
}

.icp-footer-inner {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 14px;
  max-width: min(92vw, 720px);
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(12, 18, 28, 0.76),
    rgba(28, 38, 54, 0.58)
  );
  box-shadow:
    0 10px 30px rgba(6, 10, 18, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px) saturate(135%);
}

.icp-footer-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: rgba(248, 250, 252, 0.86);
  text-decoration: none;
  font-size: 12px;
  line-height: 1.6;
  letter-spacing: 0.02em;
  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

.icp-footer-link:hover {
  color: #ffffff;
  opacity: 1;
}

.icp-footer-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  object-fit: contain;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.18));
}

.icp-footer-divider {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
}

@media (max-width: 640px) {
  .icp-footer {
    padding: 12px 12px 18px;
  }

  .icp-footer-inner {
    width: 100%;
    border-radius: 22px;
    padding: 10px 14px;
    gap: 6px 10px;
  }

  .icp-footer-link {
    width: 100%;
    text-align: center;
    font-size: 11px;
  }

  .icp-footer-icon {
    width: 15px;
    height: 15px;
    flex-basis: 15px;
  }

  .icp-footer-divider {
    display: none;
  }
}
</style>

<style scoped>
.license-guard-loading-shell {
  min-height: 100vh;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(
      circle at top left,
      rgba(128, 90, 213, 0.2),
      transparent 42%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(94, 85, 116, 0.24),
      transparent 40%
    ),
    linear-gradient(180deg, #f7f5fb 0%, #ede9f7 100%);
}

.license-guard-loading-card {
  width: min(100%, 460px);
  padding: 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(94, 85, 116, 0.14);
  box-shadow: 0 28px 60px rgba(94, 85, 116, 0.14);
  display: grid;
  gap: 12px;
}

.license-guard-loading-eyebrow {
  margin: 0;
  color: #7c6f99;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.license-guard-loading-title {
  margin: 0;
  color: #2f2a3b;
  font-size: 28px;
  line-height: 1.3;
}

.license-guard-loading-text {
  margin: 0;
  color: #615a73;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .license-guard-loading-shell {
    padding: 16px;
  }

  .license-guard-loading-card {
    padding: 22px;
    border-radius: 20px;
  }

  .license-guard-loading-title {
    font-size: 24px;
  }
}
</style>
