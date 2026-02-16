<template>
  <main class="link-error-page">
    <section class="link-error-card" role="alert" aria-live="polite">
      <p class="link-error-badge">LINK ERROR</p>
      <h1>链接不完整</h1>
      <p class="link-error-message">请完整复制整个链接</p>
      <p class="link-error-hint">请返回来源页面，重新复制完整地址后再打开。</p>
    </section>
  </main>
</template>

<script setup>
/**
 * 不完整链接错误页：
 * 关键逻辑：当用户通过根 hash 地址访问时，提供明确纠错提示，避免误进入默认测试。
 */
</script>

<style scoped>
.link-error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background:
    radial-gradient(circle at 12% 14%, rgba(255, 230, 206, 0.9), transparent 35%),
    linear-gradient(140deg, #fff7ef 0%, #fff4fb 48%, #f2f6ff 100%);
}

.link-error-card {
  width: min(100%, 560px);
  border-radius: 18px;
  padding: 26px 20px 24px;
  border: 1px solid rgba(236, 193, 162, 0.7);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 20px 40px rgba(133, 80, 54, 0.12);
  text-align: center;
}

.link-error-badge {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #8e4b2f;
}

.link-error-card h1 {
  margin: 10px 0 6px;
  color: #45271a;
  line-height: 1.32;
  font-size: clamp(26px, 7vw, 36px);
  font-family: "Noto Serif SC", serif;
}

.link-error-message {
  margin: 0;
  color: #8a3722;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
}

.link-error-hint {
  margin: 10px 0 0;
  color: #6f5e57;
  font-size: 14px;
  line-height: 1.65;
}
</style>
