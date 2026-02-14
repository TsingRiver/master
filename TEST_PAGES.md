# 多主题问卷维护说明（单入口版）

## 当前访问路径（Hash 模式，推荐线上使用）

- `/#/`：最适合居住城市测试（城市主题）
- `/#/fortune`：2026 转运关键词测试（能量主题）
- `/#/ancient`：测测你在古代会是什么身份（古风身份主题）
- `/#/talent`：凭直觉选看你隐藏的天赋是什么（直觉天赋主题）

## 兼容访问路径（本地开发或有 rewrite 时）

- `/`：最适合居住城市测试（城市主题）
- `/fortune`：2026 转运关键词测试（能量主题）
- `/ancient`：测测你在古代会是什么身份（古风身份主题）
- `/talent`：凭直觉选看你隐藏的天赋是什么（直觉天赋主题）

## 隐藏主题中心（特定方式访问）

- 仅在访问 `/#/app-center?hub=1&token=你的口令` 时显示主题中心页面。
- 默认口令：`asking-hub-2026`。
- 建议在 `.env` 中配置 `VITE_APP_PORTAL_TOKEN=你的口令` 后再访问。
- 主题中心入口示例：`/#/app-center?hub=1&token=asking-hub-2026`

## 兼容别名路径

- 转运关键词：`/fortune.html`、`/fortune-2026`、`/fortune-2026.html`
- 古代身份：`/ancient-identity`、`/ancient-identity.html`
- 隐藏天赋：`/hidden-talent`、`/hidden-talent.html`

## 新增主题标准流程

1. 新增题库文件（`src/data/xxxQuestionBank.js`）。
2. 新增本地分析器与深度分析器（`src/services/xxxAnalyzer.js` + `src/services/xxxAiAnalyzer.js`）。
3. 在 `src/config/surveyThemes.js` 新增一个主题配置对象：
   - `routePaths`
   - `pageMeta`
   - `theme`
   - `survey`（本地分析、深度分析、兜底映射）
4. 运行 `npm run build` 验证。

## 架构说明

- 页面结构统一由 `src/components/SurveyEngine.vue` 渲染。
- 主题中心页面由 `src/components/ThemeHub.vue` 渲染。
- 主题差异（文案、题库、颜色、分析器、结果区字段）全部由 `src/config/surveyThemes.js` 配置驱动。
- 主题中心鉴权与会话参数由 `src/config/appPortal.js` 控制。
- 抽题逻辑由 `src/utils/randomQuestionSelector.js` 负责：每轮按配置随机抽 8~15 题且不重复。
- 深度分析统一复用 `src/services/bailianClient.js`。
