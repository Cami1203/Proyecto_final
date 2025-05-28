<template>
  <div class="recover-container">
    <div class="recover-box">
      <h2>Recuperar Contraseña</h2>

      <!-- Paso 1: Solicitar código -->
      <form v-if="!showResetForm" @submit.prevent="handleRequestCode" class="recover-form">
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

        <button type="submit" class="btn-recover" :disabled="loading">
          {{ loading ? 'Generando código...' : 'Generar Código' }}
        </button>

        <div class="login-link">
          ¿Recordaste tu contraseña? 
          <router-link to="/login">Inicia sesión aquí</router-link>
        </div>
      </form>

      <!-- Paso 2: Cambiar contraseña -->
      <form v-else @submit.prevent="handleResetPassword" class="recover-form">
        <div class="form-group">
          <label for="code">Código de Verificación</label>
          <input 
            type="text" 
            id="code" 
            v-model="code" 
            required
            placeholder="Ingresa el código recibido"
          >
          <div v-if="recoveryCode" class="code-display">
            Tu código de recuperación es: <strong>{{ recoveryCode }}</strong>
          </div>
        </div>

        <div class="form-group">
          <label for="newPassword">Nueva Contraseña</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="newPassword" 
              v-model="newPassword" 
              required
              placeholder="Ingresa tu nueva contraseña"
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

        <div class="form-group">
          <label for="confirmPassword">Confirmar Nueva Contraseña</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required
              placeholder="Confirma tu nueva contraseña"
            >
          </div>
        </div>

        <button type="submit" class="btn-recover" :disabled="loading">
          {{ loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña' }}
        </button>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'RecuperarPasswordView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const email = ref('')
    const code = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    const showResetForm = ref(false)
    const recoveryCode = ref('')

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const validatePassword = () => {
      if (newPassword.value !== confirmPassword.value) {
        error.value = 'Las contraseñas no coinciden'
        return false
      }
      if (newPassword.value.length < 6) {
        error.value = 'La contraseña debe tener al menos 6 caracteres'
        return false
      }
      return true
    }

    const handleRequestCode = async () => {
      loading.value = true
      error.value = ''
      success.value = ''

      try {
        const result = await authStore.requestPasswordReset(email.value)
        if (result.success) {
          recoveryCode.value = result.codigo
          success.value = 'Código generado correctamente. Por favor, úsalo para restablecer tu contraseña.'
          showResetForm.value = true
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = 'Error al generar el código. Por favor, intenta de nuevo.'
      } finally {
        loading.value = false
      }
    }

    const handleResetPassword = async () => {
      if (!validatePassword()) return

      loading.value = true
      error.value = ''
      success.value = ''

      try {
        const result = await authStore.resetPassword({
          correo: email.value,
          codigo: code.value,
          nueva_password: newPassword.value
        })

        if (result.success) {
          success.value = 'Contraseña actualizada exitosamente'
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = 'Error al cambiar la contraseña. Por favor, intenta de nuevo.'
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      code,
      newPassword,
      confirmPassword,
      showPassword,
      loading,
      error,
      success,
      showResetForm,
      recoveryCode,
      togglePassword,
      handleRequestCode,
      handleResetPassword
    }
  }
}
</script>

<style scoped>
.recover-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
}

.recover-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.recover-box h2 {
  text-align: center;
  color: #333;
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

.code-display {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #e8f5e9;
  border-radius: 4px;
  text-align: center;
  color: #2e7d32;
}

.code-display strong {
  font-size: 1.2rem;
  color: #1b5e20;
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

.btn-recover {
  width: 100%;
  padding: 1rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-recover:hover {
  background-color: #ff5252;
}

.btn-recover:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.login-link a {
  color: #ff6b6b;
  text-decoration: none;
}

.login-link a:hover {
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

.success-message {
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  text-align: center;
}
</style> 