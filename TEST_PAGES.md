# 多主题问卷维护说明（单入口版）

## 当前访问路径（Hash 模式，推荐线上使用）

- `/#/`：最适合居住城市测试（城市主题）
- `/#/fortune`：2026 转运关键词测试（能量主题）
- `/#/ancient`：测测你在古代会是什么身份（古风身份主题）
- `/#/talent`：凭直觉选看你隐藏的天赋是什么（直觉天赋主题）
- `/#/benefactor`：测试2026你的贵人星座（贵人匹配主题）
- `/#/color`：测试2026年你的主题色（动态配色主题）
- `/#/romance`：《你认为最浪漫的事》浪漫指数测试（14题+雷达图+海报）
- `/#/love`：恋爱心理测试（依恋类型 + AI报告主题）
- `/#/mbti`：类型学卡片中心（12 类类型学测试）
  支持：MBTI（72/32）、九型人格（120/36）、社会人格（64）、理想型（64）、经典荣格（60）、DISC（60）、态度心理（64）、体液气质（60）、大五人格（60）、DnD 阵营（60）、依恋类型（24）、霍兰德（60），每轮题量按模式基础值上下浮动 10 题。

## 兼容访问路径（本地开发或有 rewrite 时）

- `/`：最适合居住城市测试（城市主题）
- `/fortune`：2026 转运关键词测试（能量主题）
- `/ancient`：测测你在古代会是什么身份（古风身份主题）
- `/talent`：凭直觉选看你隐藏的天赋是什么（直觉天赋主题）
- `/benefactor`：测试2026你的贵人星座（贵人匹配主题）
- `/color`：测试2026年你的主题色（动态配色主题）
- `/romance`：《你认为最浪漫的事》浪漫指数测试（14题+雷达图+海报）
- `/love`：恋爱心理测试（依恋类型 + AI报告主题）
- `/mbti`：类型学卡片中心（12 类类型学测试，动态题量）

## 隐藏主题中心（特定方式访问）

- 仅在访问 `/#/app-center?hub=1&token=你的口令` 时显示主题中心页面。
- 默认口令：`asking-hub-2026`。
- 建议在 `.env` 中配置 `VITE_APP_PORTAL_TOKEN=你的口令` 后再访问。
- 主题中心入口示例：`/#/app-center?hub=1&token=asking-hub-2026`

## 兼容别名路径

- 转运关键词：`/fortune.html`、`/fortune-2026`、`/fortune-2026.html`
- 古代身份：`/ancient-identity`、`/ancient-identity.html`
- 隐藏天赋：`/hidden-talent`、`/hidden-talent.html`
- 贵人星座：`/helper-star`、`/helper`、`/benefactor.html`
- 主题色测试：`/color2026`、`/color-2026`、`/theme-color`
- 浪漫指数：`/romance-test`、`/romantic`、`/1314-love`
- 恋爱心理：`/love-attachment`、`/love-psych`、`/love-test`
- 十六型人格：`/mbti16`、`/mbti.html`

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

- 城市/转运/古代/天赋/贵人/主题色/浪漫指数/恋爱心理主题由 `src/components/SurveyEngine.vue` 渲染。
- 类型学卡片中心由 `src/components/TypeologyLab.vue` 渲染。
- 主题中心页面由 `src/components/ThemeHub.vue` 渲染。
- 主题差异（文案、题库、颜色、分析器、结果区字段）全部由 `src/config/surveyThemes.js` 配置驱动。
- 主题中心鉴权与会话参数由 `src/config/appPortal.js` 控制。
- 抽题逻辑由 `src/utils/randomQuestionSelector.js` 负责：每轮按配置随机抽 10~15 题且不重复。
- 类型学测试目录由 `src/data/typeologyCatalog.js` 管理，结果缓存由 `src/services/typeologyStorage.js` 管理。
- 深度分析统一复用 `src/services/bailianClient.js`。
