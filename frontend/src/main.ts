import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.provide('apiBaseUrl', 'http://192.168.0.107:60001/api/v1')
app.use(createPinia())
app.use(router)

app.mount('#app')
