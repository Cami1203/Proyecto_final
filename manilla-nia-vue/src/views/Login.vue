<template>
  <div class="login-container">
    <!-- Notificación -->
    <div v-if="mostrarNotificacion" :class="['notificacion', tipoNotificacion]">
      <i :class="iconoNotificacion"></i>
      <p>{{ mensajeNotificacion }}</p>
      <button @click="mostrarNotificacion = false" class="cerrar-notificacion">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="login-box">
      <h2>Iniciar Sesión</h2>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="Ingresa tu correo electrónico"
          >
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required
              placeholder="Ingresa tu contraseña"
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="togglePassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-links">
          <router-link to="/recuperar-password" class="forgot-password">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>

        <div class="register-link">
          ¿No tienes una cuenta? 
          <router-link to="/registro">Regístrate aquí</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const email = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const loading = ref(false)

    // Variables para la notificación
    const mostrarNotificacion = ref(false)
    const tipoNotificacion = ref('')
    const mensajeNotificacion = ref('')
    const iconoNotificacion = ref('')

    const mostrarMensaje = (mensaje, tipo = 'exito') => {
      tipoNotificacion.value = tipo
      mensajeNotificacion.value = mensaje
      iconoNotificacion.value = tipo === 'exito' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
      mostrarNotificacion.value = true

      // Ocultar la notificación después de 5 segundos
      setTimeout(() => {
        mostrarNotificacion.value = false
      }, 5000)
    }

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const handleLogin = async () => {
      loading.value = true

      try {
        const result = await authStore.login({
          correo: email.value,
          contraseña: password.value
        })

        if (result.success) {
          mostrarMensaje('¡Inicio de sesión exitoso! Bienvenido a ManillaNia', 'exito')
          setTimeout(() => {
            if (result.isAdmin) {
              router.push('/admin/dashboard')
            } else {
              router.push('/')
            }
          }, 1000)
        } else {
          mostrarMensaje('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.', 'error')
        }
      } catch (err) {
        mostrarMensaje('Error al conectar con el servidor. Por favor, intenta de nuevo.', 'error')
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      showPassword,
      loading,
      togglePassword,
      handleLogin,
      mostrarNotificacion,
      tipoNotificacion,
      mensajeNotificacion,
      iconoNotificacion
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
}

.login-box {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(106,17,203,0.10);
  width: 100%;
  max-width: 400px;
}

.login-box h2 {
  text-align: center;
  color: #6a11cb;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.form-links {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-password {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  color: #ff6b6b;
}

.btn-login {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #6a11cb 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  box-shadow: 0 2px 8px rgba(106,17,203,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-login:hover {
  background: linear-gradient(90deg, #ff6b6b 0%, #6a11cb 100%);
  color: #fffbe6;
}

.btn-login:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.register-link a {
  color: #6a11cb;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
}

/* Estilos para las notificaciones */
.notificacion {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 2rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
}

.notificacion.exito {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
}

.notificacion.error {
  background: linear-gradient(45deg, #f44336, #e53935);
  color: white;
}

.notificacion i {
  font-size: 1.5rem;
}

.notificacion p {
  margin: 0;
  font-size: 1rem;
}

.cerrar-notificacion {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: auto;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.cerrar-notificacion:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Mejoras en el botón de login */
.btn-login i {
  font-size: 1.2rem;
}
</style> 