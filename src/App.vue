<template>
  <div class="app-root">
    <LinkErrorPage v-if="showIncompleteLinkError" />
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

    <!-- 工信部 ICP 备案号，所有页面底部居中展示 -->
    <footer class="icp-footer">
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
      >
        浙ICP备2026013019号
      </a>
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

/**
 * 当前浏览器路径与查询参数：
 * 关键逻辑：优先读取 hash 路由，兼容无 hash 的旧路径模式。
 */
const currentPath = ref("/");
const currentSearch = ref("");
const hasInvalidHashLink = ref(false);

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

  // 关键逻辑：命中任一已注册主题路径则视为有效，包含 "#/" 这种默认主题入口。
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

  // 关键逻辑：已注册主题路径（包含 "/" 默认页）直接放行，未知路径才进入错误页。
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
    currentPath.value = parsedHashRoute.path;
    currentSearch.value = parsedHashRoute.search;
    hasInvalidHashLink.value = isInvalidHashRoute(parsedHashRoute);
    return;
  }

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
 * 路径变化时同步页面 Meta 信息。
 */
watch(
  [showIncompleteLinkError, showPortalHub, activeThemeConfig],
  ([isInvalidLinkPage, isHubPage, themeConfig]) => {
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

/* 工信部 ICP 备案号底部栏 */
.icp-footer {
  text-align: center;
  padding: 12px 16px;
  font-size: 12px;
  line-height: 1.5;
  background: transparent;
}

.icp-footer a {
  color: rgba(0, 0, 0, 0.35);
  text-decoration: none;
  transition: color 0.2s ease;
}

.icp-footer a:hover {
  color: rgba(0, 0, 0, 0.6);
  text-decoration: underline;
}
</style>
