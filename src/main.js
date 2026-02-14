import { createApp } from "vue";
import Vant from "vant";
import "vant/lib/index.css";
import App from "./App.vue";
import "./unified-survey.css";

/**
 * 通用问卷入口：
 * 1. 注册 Vant 组件库，统一移动端组件行为。
 * 2. 挂载单一宿主应用，通过路径解析不同测试主题。
 */
createApp(App).use(Vant).mount("#app");
