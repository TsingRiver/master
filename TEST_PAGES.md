# 多测试页面维护说明

## 当前独立测试入口
- `index.html`：最适合居住城市测试（城市主题）
- `fortune-2026.html`：2026 转运关键词测试（能量主题）

## 新增测试页面标准流程
1. 新建一个独立 HTML 入口（例如 `your-test.html`）。
2. 新建对应入口文件（例如 `src/main-your-test.js`）。
3. 新建独立根组件和样式（建议 `src/YourTestApp.vue` + `src/your-test-style.css`）。
4. 在 `vite.config.js` 的 `build.rollupOptions.input` 增加新的 HTML 入口。
5. 运行 `npm run build` 验证多页面打包是否成功。

## 设计约束
- 不同测试不做互相跳转，保持独立部署与独立访问。
- 每个测试必须有独立视觉主题，不复用同一套配色与背景语义。
- AI 分析场景统一复用 `src/services/bailianClient.js`，避免重复实现请求逻辑。
