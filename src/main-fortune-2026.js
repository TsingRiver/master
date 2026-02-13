import { createApp } from "vue";
import Vant from "vant";
import "vant/lib/index.css";
import Fortune2026App from "./Fortune2026App.vue";
import "./fortune-2026-style.css";

/**
 * 2026 转运关键词测试入口：
 * 1. 注册 Vant，复用统一移动端组件能力。
 * 2. 挂载独立测试应用，保证不同测试之间互不耦合。
 */
createApp(Fortune2026App).use(Vant).mount("#app");
