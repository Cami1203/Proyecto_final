import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/auth'
import axios from 'axios'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// Configurar el interceptor de axios
axios.interceptors.request.use(
  config => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (user && token) {
      const userData = JSON.parse(user)
      // Si es una ruta de admin, usar JWT
      if (config.url.includes('/api/admin')) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        // Para otras rutas, usar autenticación básica
        const correo = userData.correo
        const basic = btoa(`${correo}:${token}`)
        config.headers.Authorization = `Basic ${basic}`
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Inicializar el store de autenticación
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
