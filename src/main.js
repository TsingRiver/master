import { createApp } from "vue";
import Vant from "vant";
import "vant/lib/index.css";
import { injectSpeedInsights } from "@vercel/speed-insights";
import App from "./App.vue";
import "./unified-survey.css";

const TRUTHY_FLAG_VALUES = Object.freeze(["true", "1", "on", "yes"]);
const FALSY_FLAG_VALUES = Object.freeze(["false", "0", "off", "no"]);

/**
 * 解析 Speed Insights 开关模式：
 * 1. 返回 true/false 表示强制开关。
 * 2. 返回 null 表示自动识别部署环境。
 * @param {unknown} rawValue 原始环境变量值。
 * @returns {boolean | null} 开关模式。
 */
function resolveSpeedInsightsEnableMode(rawValue) {
  const normalizedValue = String(rawValue ?? "").trim().toLowerCase();
  if (!normalizedValue || normalizedValue === "auto") {
    return null;
  }

  if (TRUTHY_FLAG_VALUES.includes(normalizedValue)) {
    return true;
  }

  if (FALSY_FLAG_VALUES.includes(normalizedValue)) {
    return false;
  }

  return null;
}

/**
 * 解析 Speed Insights 采样率：
 * 关键逻辑：仅接受 0~1 的数字，非法值统一回退到 null（使用 SDK 默认值）。
 * @param {unknown} rawValue 原始采样率配置。
 * @returns {number | null} 采样率。
 */
function resolveSpeedInsightsSampleRate(rawValue) {
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  if (parsedValue < 0 || parsedValue > 1) {
    return null;
  }

  return parsedValue;
}

/**
 * 自动检测当前部署是否支持 Speed Insights。
 * 关键逻辑：
 * 1. `*.vercel.app` 域名直接判定为支持。
 * 2. 其他域名探测 `/_vercel/speed-insights/script.js`。
 * 3. 若返回 Vercel 标识头或 JavaScript 资源，则视为支持。
 * 复杂度评估：O(1)，仅一次固定路径网络探测。
 * @returns {Promise<boolean>} 是否支持。
 */
async function detectSpeedInsightsSupport() {
  const currentHostname = String(window.location.hostname ?? "")
    .trim()
    .toLowerCase();
  if (currentHostname.endsWith(".vercel.app")) {
    return true;
  }

  try {
    const probeResponse = await fetch("/_vercel/speed-insights/script.js?probe=1", {
      method: "HEAD",
      cache: "no-store",
    });
    const vercelIdHeader = String(probeResponse.headers.get("x-vercel-id") ?? "").trim();
    if (vercelIdHeader) {
      return true;
    }

    const contentType = String(probeResponse.headers.get("content-type") ?? "").toLowerCase();
    const isJavaScriptContent = contentType.includes("javascript");
    const isHtmlContent = contentType.includes("text/html");
    return probeResponse.ok && isJavaScriptContent && !isHtmlContent;
  } catch {
    return false;
  }
}

/**
 * 解析是否启用 Speed Insights。
 * 关键逻辑：
 * 1. 环境变量可强制开/关。
 * 2. 未强制时自动检测部署支持能力。
 * 3. 自定义 endpoint 存在时，默认视为启用意图。
 * @param {string} endpoint Speed Insights 自定义上报端点。
 * @returns {Promise<boolean>} 是否启用。
 */
async function shouldEnableSpeedInsights(endpoint) {
  const explicitEnableMode = resolveSpeedInsightsEnableMode(
    import.meta.env.VITE_ENABLE_SPEED_INSIGHTS,
  );
  if (explicitEnableMode !== null) {
    return explicitEnableMode;
  }

  if (endpoint) {
    return true;
  }

  return detectSpeedInsightsSupport();
}

/**
 * 注入 Speed Insights（可选）：
 * 关键逻辑：
 * 1. 支持自动识别部署环境（同一套代码跨平台部署）。
 * 2. 支持通过环境变量强制开/关。
 * 3. 支持通过环境变量覆盖采样率与上报端点。
 */
async function setupSpeedInsights() {
  const endpoint = String(import.meta.env.VITE_SPEED_INSIGHTS_ENDPOINT ?? "").trim();
  const shouldEnable = await shouldEnableSpeedInsights(endpoint);
  if (!shouldEnable) {
    return;
  }

  const sampleRate = resolveSpeedInsightsSampleRate(
    import.meta.env.VITE_SPEED_INSIGHTS_SAMPLE_RATE,
  );
  /**
   * 获取当前页面路由：
   * 关键逻辑：包含 hash 片段，兼容当前项目的 hash 访问场景。
   * @returns {string} 当前路由字符串。
   */
  const resolveCurrentRoute = () => {
    const hashSegment = String(window.location.hash ?? "");
    return `${window.location.pathname}${window.location.search}${hashSegment}`;
  };

  const speedInsightsController = injectSpeedInsights({
    route: resolveCurrentRoute(),
    ...(sampleRate !== null ? { sampleRate } : {}),
    ...(endpoint ? { endpoint } : {}),
  });

  if (!speedInsightsController?.setRoute) {
    return;
  }

  /**
   * 同步 Speed Insights 路由：
   * 关键逻辑：在 hashchange / popstate 时更新 route，保证 SPA 场景数据准确。
   */
  const syncSpeedInsightsRoute = () => {
    speedInsightsController.setRoute(resolveCurrentRoute());
  };
  window.addEventListener("hashchange", syncSpeedInsightsRoute);
  window.addEventListener("popstate", syncSpeedInsightsRoute);
}

/**
 * 通用问卷入口：
 * 1. 注册 Vant 组件库，统一移动端组件行为。
 * 2. 挂载单一宿主应用，通过路径解析不同测试主题。
 */
createApp(App).use(Vant).mount("#app");
// 关键逻辑：Speed Insights 为可选增强能力，不阻塞主应用挂载。
void setupSpeedInsights();
