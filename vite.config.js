import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

/**
 * 主题分包规则：
 * 1. 按“数据 + 分析服务 + 重组件”绑定到同一业务 chunk，降低主入口体积。
 * 2. keyword 使用模块路径关键字匹配，避免和具体文件名强耦合。
 */
const THEME_CHUNK_RULES = [
  {
    chunkName: "theme-city",
    keywords: ["questionBank", "cityProfiles", "localAnalyzer", "aiAnalyzer"],
  },
  {
    chunkName: "theme-fortune",
    keywords: ["fortune2026QuestionBank", "fortune2026Analyzer", "fortune2026AiAnalyzer"],
  },
  {
    chunkName: "theme-ancient",
    keywords: ["ancientIdentityQuestionBank", "ancientIdentityAnalyzer", "ancientIdentityAiAnalyzer"],
  },
  {
    chunkName: "theme-talent",
    keywords: ["hiddenTalentQuestionBank", "hiddenTalentAnalyzer", "hiddenTalentAiAnalyzer"],
  },
  {
    chunkName: "theme-benefactor",
    keywords: ["benefactor2026QuestionBank", "benefactor2026Analyzer", "benefactor2026AiAnalyzer"],
  },
  {
    chunkName: "theme-color",
    keywords: ["color2026QuestionBank", "color2026Analyzer", "color2026AiAnalyzer"],
  },
  {
    chunkName: "theme-romance",
    keywords: ["romanceQuestionBank", "romanceAnalyzer", "romanceInsightAnalyzer", "RomanceStandalone"],
  },
  {
    chunkName: "theme-love-attachment",
    keywords: ["loveAttachmentQuestionBank", "loveAttachmentAnalyzer", "loveAttachmentAiAnalyzer"],
  },
  {
    chunkName: "theme-love-brain",
    keywords: ["loveBrainQuestionBank", "loveBrainAnalyzer", "loveBrainAiAnalyzer"],
  },
  {
    chunkName: "theme-mbti",
    keywords: ["mbtiQuestionBank", "mbtiAnalyzer", "mbtiAiAnalyzer", "typeology", "TypeologyLab", "MbtiStandalone"],
  },
];

/**
 * 标准化模块路径：
 * 1. 统一斜杠，保证 macOS/Windows 路径匹配一致。
 * @param {string} moduleId Rollup 传入的模块 ID。
 * @returns {string} 归一化后的路径。
 */
function normalizeModuleId(moduleId) {
  return String(moduleId ?? "").replaceAll("\\", "/");
}

/**
 * 根据模块路径解析 manual chunk 名称。
 * 复杂度评估：O(R * K)
 * R 为规则数量，K 为每条规则关键字数量；当前均为常量级，构建期开销可忽略。
 * @param {string} moduleId Rollup 模块 ID。
 * @returns {string|undefined} chunk 名称，undefined 表示交给 Rollup 默认策略。
 */
function resolveManualChunkName(moduleId) {
  const normalizedModuleId = normalizeModuleId(moduleId);
  if (!normalizedModuleId) {
    return undefined;
  }

  if (normalizedModuleId.includes("/node_modules/")) {
    if (
      normalizedModuleId.includes("/node_modules/vue/") ||
      normalizedModuleId.includes("/node_modules/@vue/")
    ) {
      return "vendor-vue";
    }

    if (normalizedModuleId.includes("/node_modules/vant/")) {
      return "vendor-vant";
    }

    return "vendor";
  }

  if (normalizedModuleId.includes("/src/config/surveyThemes.js")) {
    return "theme-registry";
  }

  if (
    normalizedModuleId.includes("/src/App.vue") ||
    normalizedModuleId.includes("/src/main.js") ||
    normalizedModuleId.includes("/src/unified-survey.css")
  ) {
    return "app-shell";
  }

  const matchedThemeRule = THEME_CHUNK_RULES.find((ruleItem) =>
    ruleItem.keywords.some((keywordItem) =>
      normalizedModuleId.includes(keywordItem),
    ),
  );
  if (matchedThemeRule) {
    return matchedThemeRule.chunkName;
  }

  return undefined;
}

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
    rollupOptions: {
      output: {
        /**
         * 手动分包策略：
         * 1. 拆分第三方依赖，避免单 chunk 过大。
         * 2. 按主题域拆分题库与分析逻辑，提升缓存命中率。
         * @param {string} moduleId Rollup 模块 ID。
         * @returns {string|undefined} chunk 名称。
         */
        manualChunks(moduleId) {
          return resolveManualChunkName(moduleId);
        },
      },
    },
  },
});
