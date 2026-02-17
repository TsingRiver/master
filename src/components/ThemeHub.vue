<template>
  <div class="hub-page">
    <div class="hub-aura aura-left" aria-hidden="true"></div>
    <div class="hub-aura aura-right" aria-hidden="true"></div>

    <main class="hub-shell">
      <header class="hub-header">
        <p class="hub-badge">THEME HUB</p>
        <h1>问卷主题中心</h1>
        <p class="hub-desc">选择任一主题开始测试，填写中可随时返回主题中心切换。</p>
      </header>

      <section class="hub-grid">
        <article
          v-for="theme in themeConfigs"
          :key="theme.key"
          class="hub-card"
          :class="theme.theme.className"
        >
          <p class="hub-card-badge">{{ theme.theme.badge }}</p>
          <h2>{{ theme.theme.title }}</h2>
          <p class="hub-card-desc">{{ resolvedThemeDescriptionMap[theme.key] }}</p>
          <a class="hub-open-link" :href="buildThemeHref(theme)">进入测试</a>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";

/**
 * 组件参数：
 * 1. themeConfigs：所有主题配置列表。
 * 2. buildThemeHref：由宿主传入链接生成函数。
 */
const props = defineProps({
  themeConfigs: {
    type: Array,
    required: true,
  },
  buildThemeHref: {
    type: Function,
    required: true,
  },
});

/**
 * 解析主题卡片描述文案：
 * 1. 兼容字符串与函数工厂两种配置形态。
 * 2. 函数执行失败时回退空串，保证主题中心稳定渲染。
 * @param {string | (() => string) | unknown} rawDescription 原始描述配置。
 * @returns {string} 可展示的描述文本。
 */
function resolveThemeDescription(rawDescription) {
  if (typeof rawDescription === "function") {
    try {
      return String(rawDescription() ?? "").trim();
    } catch {
      // 关键逻辑：单卡文案生成失败不影响其他主题入口渲染。
      return "";
    }
  }

  return String(rawDescription ?? "").trim();
}

/**
 * 主题卡片描述快照映射：
 * 关键逻辑：每个主题仅解析一次函数型文案，避免重渲染期间随机抖动。
 */
const resolvedThemeDescriptionMap = computed(() => {
  return props.themeConfigs.reduce((descriptionMap, themeConfig, themeIndex) => {
    const themeKey = String(themeConfig?.key ?? themeIndex);
    descriptionMap[themeKey] = resolveThemeDescription(
      themeConfig?.theme?.description,
    );
    return descriptionMap;
  }, {});
});
</script>

<style scoped>
.hub-page {
  min-height: 100vh;
  padding: 22px 14px 34px;
  background:
    radial-gradient(circle at 14% 16%, rgba(255, 255, 255, 0.86), transparent 34%),
    linear-gradient(130deg, #f4f6ff, #eef7f9 50%, #fff4ea);
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰动画仅使用 transform，降低移动端重绘成本。 */
.hub-aura {
  position: fixed;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(4px);
  opacity: 0.44;
  animation: hubFloat 8.6s ease-in-out infinite alternate;
}

.aura-left {
  width: 220px;
  height: 220px;
  left: -70px;
  top: -72px;
  background: radial-gradient(circle at 30% 30%, #b7c9ff, #88a5ef);
}

.aura-right {
  width: 238px;
  height: 238px;
  right: -88px;
  bottom: 12%;
  background: radial-gradient(circle at 30% 30%, #ffd8ab, #f6ae60);
  animation-delay: 1.2s;
}

.hub-shell {
  width: min(100%, 760px);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hub-header {
  margin: 8px 4px 18px;
  animation: hubFadeUp 520ms ease both;
}

.hub-badge {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #304f8a;
  text-transform: uppercase;
}

.hub-header h1 {
  margin: 10px 0 8px;
  font-size: clamp(28px, 7.6vw, 40px);
  line-height: 1.22;
  font-family: "Noto Serif SC", serif;
  color: #223552;
}

.hub-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.62;
  color: #5a6a83;
}

.hub-grid {
  display: grid;
  gap: 12px;
}

.hub-card {
  border-radius: 16px;
  border: 1px solid rgba(205, 222, 255, 0.85);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 34px rgba(33, 69, 106, 0.12);
  padding: 14px 14px 13px;
  animation: hubFadeUp 450ms ease both;
}

.hub-card:nth-child(2) {
  animation-delay: 70ms;
}

.hub-card:nth-child(3) {
  animation-delay: 140ms;
}

.hub-card:nth-child(4) {
  animation-delay: 210ms;
}

.hub-card-badge {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #3f5779;
}

.hub-card h2 {
  margin: 8px 0 6px;
  font-size: 20px;
  line-height: 1.32;
  color: #1f3555;
  font-family: "Noto Serif SC", serif;
}

.hub-card-desc {
  margin: 0;
  color: #5e6d83;
  font-size: 13px;
  line-height: 1.6;
}

.hub-open-link {
  margin-top: 12px;
  display: inline-block;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(135deg, #2d7de2, #4d4cc5);
  font-size: 13px;
  font-weight: 700;
}

@keyframes hubFloat {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-16px);
  }
}

@keyframes hubFadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 760px) {
  .hub-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
