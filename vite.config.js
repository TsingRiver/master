import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

/**
 * Vite 配置：
 * 1. 启用 Vue SFC 编译插件。
 * 2. 使用单入口 SPA，测试主题通过路径参数驱动。
 */
export default defineConfig({
  plugins: [vue()],
  /**
   * 生产构建配置：
   * 1. outDir 指定打包产物目录为 askingbuild，替代默认 dist。
   * 2. emptyOutDir 保持默认清理行为，避免旧构建文件残留导致部署混淆。
   */
  build: {
    outDir: "askingbuild",
    emptyOutDir: true,
  },
});
