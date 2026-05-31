import { createApp } from 'vue'
import App from './App.vue'
import { installApiTokenFetchInterceptor } from './utils/api-utils.js'

installApiTokenFetchInterceptor()
createApp(App).mount('#app')
