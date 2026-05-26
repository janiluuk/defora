import { createApp } from 'vue'
import App from './App.vue'
import { installApiTokenFetchInterceptor } from './api-utils.js'

installApiTokenFetchInterceptor()
createApp(App).mount('#app')
