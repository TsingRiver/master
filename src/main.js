import { createApp } from "vue";
import Vant from "vant";
import "vant/lib/index.css";
import App from "./App.vue";
import "./style.css";

/**
 * 城市匹配测试入口：
 * 1. 注册 Vant 组件库，提升移动端组件一致性。
 * 2. 挂载根组件，启动“最适合居住城市”测试。
 */
createApp(App).use(Vant).mount("#app");
