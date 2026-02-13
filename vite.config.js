import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

/**
 * Vite 配置：
 * 1. 启用 Vue SFC 编译插件。
 * 2. 配置多页面入口，让每个测试页面都能独立构建与部署。
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        cityTest: resolve(__dirname, "index.html"),
        fortune2026Test: resolve(__dirname, "fortune-2026.html"),
      },
    },
  },
});
