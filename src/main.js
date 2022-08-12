import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import './font/iconfont.css'
import './font/iconfont.js'
import * as echarts from 'echarts'
const app = createApp(App)
app.config.globalProperties.$echarts = echarts // 全局挂载echarts
app.use(store).use(ElementPlus).use(router).mount('#app')
