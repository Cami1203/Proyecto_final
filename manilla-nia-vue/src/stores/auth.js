import { defineStore } from 'pinia'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useCartStore } from './cart'

/*Pinia (una librería de Vue para manejar estados globales). Sirve para:

Guardar y acceder al usuario logueado.

Manejar el token de autenticación (JWT).

Saber si el usuario está autenticado.

Saber si es admin.

Hacer login, registro, logout, etc*/

const API_URL = 'http://localhost:3000/api'

// Configurar interceptor de Axios para incluir el token en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Configurar interceptor de respuesta para manejar errores de token
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token es inválido o expiró, cerrar sesión
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  }
)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    isInitialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.isAdmin || false //En este archivo, lo que permite saber si el usuario es admin o no, es esta línea
  },

  actions: {
    async checkAuth() {
      if (this.isInitialized) {
        return this.isAuthenticated
      }

      try {
        const user = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (user && token) {
          this.user = JSON.parse(user)
          this.token = token
          this.isInitialized = true
          return true
        }
        this.isInitialized = true
        return false
      } catch (error) {
        console.error('Error checking auth:', error)
        this.logout()
        return false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_URL}/login`, credentials)
        const { user, token } = response.data

        if (!user || !token) {
          throw new Error('Respuesta inválida del servidor')
        }

        this.user = user
        this.token = token
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
        this.isInitialized = true

        return { 
          success: true,
          isAdmin: user.isAdmin 
        }
      } catch (error) {
        console.error('Error en login:', error)
        this.error = error.response?.data?.message || 'Error al iniciar sesión'
        return {
          success: false,
          error: this.error
        }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      try {
        const response = await axios.post(`${API_URL}/registro`, userData)
        return { success: true }
      } catch (error) {
        console.error('Error en registro:', error)
        return {
          success: false,
          error: error.response?.data?.message || 'Error al registrar usuario'
        }
      }
    },

    async requestPasswordReset(email) {
      try {
        const response = await axios.post(`${API_URL}/recuperar-password`, { correo: email })
        return {
          success: true,
          codigo: response.data.codigo
        }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Error al solicitar el código de recuperación'
        }
      }
    },

    async resetPassword({ correo, codigo, nueva_password }) {
      try {
        const response = await axios.post(`${API_URL}/verificar-codigo`, {
          correo,
          codigo,
          nueva_password
        })
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Error al cambiar la contraseña'
        }
      }
    },

    logout() {
      // Limpiar el estado del store
      this.user = null
      this.token = null
      this.isInitialized = false
      this.error = null
      this.loading = false

      // Limpiar el localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')

      // Limpiar el carrito si existe
      const cartStore = useCartStore()
      if (cartStore) {
        cartStore.$reset()
      }

      // Forzar una recarga completa de la página antes de redirigir
      window.location.replace('/login')
    },

    initialize() {
      if (this.isInitialized) return

      try {
        const user = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (user && token) {
          this.user = JSON.parse(user)
          this.token = token
        } else {
          this.user = null
          this.token = null
        }
        this.isInitialized = true
      } catch (error) {
        console.error('Error initializing auth store:', error)
        this.user = null
        this.token = null
        this.isInitialized = true
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    },

    async updateProfile(profileData) {
      try {
        const response = await axios.put(
          `${API_URL}/clientes/${this.user.id}`,
          profileData,
          {
            headers: { Authorization: `Bearer ${this.token}` }
          }
        )
        this.user = { ...this.user, ...response.data.cliente }
        localStorage.setItem('user', JSON.stringify(this.user))
        return { success: true }
      } catch (error) {
        console.error('Error al actualizar perfil:', error)
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al actualizar perfil' 
        }
      }
    },

    async changePassword(passwordData) {
      try {
        const response = await axios.put(
          `${API_URL}/cambiar-password`,
          passwordData,
          {
            headers: { Authorization: `Bearer ${this.token}` }
          }
        )
        return { success: true, data: response.data }
      } catch (error) {
        console.error('Error al cambiar contraseña:', error)
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al cambiar contraseña' 
        }
      }
    }
  }
}) 