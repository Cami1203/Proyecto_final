<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Crear Cuenta</h2>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input 
            type="text" 
            id="nombre" 
            v-model="formData.nombre" 
            required
            :class="{ 'error': errors.nombre }"
            placeholder="Ingresa tu nombre"
          >
          <span class="error-message" v-if="errors.nombre">{{ errors.nombre }}</span>
        </div>

        <div class="form-group">
          <label for="apellido">Apellido</label>
          <input 
            type="text" 
            id="apellido" 
            v-model="formData.apellido" 
            required
            :class="{ 'error': errors.apellido }"
            placeholder="Ingresa tu apellido"
          >
          <span class="error-message" v-if="errors.apellido">{{ errors.apellido }}</span>
        </div>

        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.correo" 
            required
            :class="{ 'error': errors.correo }"
            placeholder="Ingresa tu correo electrónico"
          >
          <span class="error-message" v-if="errors.correo">{{ errors.correo }}</span>
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono</label>
          <input 
            type="tel" 
            id="telefono" 
            v-model="formData.telefono" 
            required
            :class="{ 'error': errors.telefono }"
            placeholder="Ingresa tu número de teléfono"
          >
          <span class="error-message" v-if="errors.telefono">{{ errors.telefono }}</span>
        </div>

        <div class="form-group">
          <label for="fecha_nacimiento">Fecha de Nacimiento</label>
          <input 
            type="date" 
            id="fecha_nacimiento" 
            v-model="formData.fecha_nacimiento" 
            required
            :class="{ 'error': errors.fecha_nacimiento }"
          >
          <span class="error-message" v-if="errors.fecha_nacimiento">{{ errors.fecha_nacimiento }}</span>
        </div>

        <div class="form-group">
          <label for="direccion">Dirección</label>
          <input 
            type="text" 
            id="direccion" 
            v-model="formData.direccion" 
            required
            :class="{ 'error': errors.direccion }"
            placeholder="Ingresa tu dirección"
          >
          <span class="error-message" v-if="errors.direccion">{{ errors.direccion }}</span>
        </div>

        <div class="form-group">
          <label for="departamento">Departamento</label>
          <input 
            type="text" 
            id="departamento" 
            v-model="formData.departamento" 
            required
            :class="{ 'error': errors.departamento }"
            placeholder="Ingresa tu departamento"
          >
          <span class="error-message" v-if="errors.departamento">{{ errors.departamento }}</span>
        </div>

        <div class="form-group">
          <label for="ciudad">Ciudad</label>
          <input 
            type="text" 
            id="ciudad" 
            v-model="formData.ciudad" 
            required
            :class="{ 'error': errors.ciudad }"
            placeholder="Ingresa tu ciudad"
          >
          <span class="error-message" v-if="errors.ciudad">{{ errors.ciudad }}</span>
        </div>

        <div class="form-group">
          <label for="codigo_postal">Código Postal</label>
          <input 
            type="text" 
            id="codigo_postal" 
            v-model="formData.codigo_postal" 
            required
            :class="{ 'error': errors.codigo_postal }"
            placeholder="Ingresa tu código postal"
          >
          <span class="error-message" v-if="errors.codigo_postal">{{ errors.codigo_postal }}</span>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="formData.contraseña" 
              required
              :class="{ 'error': errors.contraseña }"
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
          <span class="error-message" v-if="errors.contraseña">{{ errors.contraseña }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required
              :class="{ 'error': errors.confirmPassword }"
              placeholder="Confirma tu contraseña"
            >
          </div>
          <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>

        <div class="terms">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              v-model="acceptTerms" 
              required
            >
            <span class="checkmark"></span>
            Acepto los <a href="/terminos" target="_blank">términos y condiciones</a>
          </label>
        </div>

        <button type="submit" class="btn-register" :disabled="loading || !acceptTerms">
          {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
        </button>

        <div class="login-link">
          ¿Ya tienes una cuenta? 
          <router-link to="/login">Inicia sesión aquí</router-link>
        </div>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const formData = reactive({
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      fecha_nacimiento: '',
      direccion: '',
      departamento: '',
      ciudad: '',
      codigo_postal: '',
      contraseña: ''
    })

    const errors = reactive({
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      fecha_nacimiento: '',
      direccion: '',
      departamento: '',
      ciudad: '',
      codigo_postal: '',
      contraseña: '',
      confirmPassword: ''
    })

    const confirmPassword = ref('')
    const showPassword = ref(false)
    const acceptTerms = ref(false)
    const loading = ref(false)
    const error = ref('')

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const validateForm = () => {
      let isValid = true
      errors.nombre = ''
      errors.apellido = ''
      errors.correo = ''
      errors.telefono = ''
      errors.fecha_nacimiento = ''
      errors.direccion = ''
      errors.departamento = ''
      errors.ciudad = ''
      errors.codigo_postal = ''
      errors.contraseña = ''
      errors.confirmPassword = ''

      // Validar nombre
      if (formData.nombre.length < 2) {
        errors.nombre = 'El nombre debe tener al menos 2 caracteres'
        isValid = false
      }

      // Validar apellido
      if (formData.apellido.length < 2) {
        errors.apellido = 'El apellido debe tener al menos 2 caracteres'
        isValid = false
      }

      // Validar correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.correo)) {
        errors.correo = 'Ingresa un correo electrónico válido'
        isValid = false
      }

      // Validar teléfono
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(formData.telefono)) {
        errors.telefono = 'Ingresa un número de teléfono válido (10 dígitos)'
        isValid = false
      }

      // Validar fecha de nacimiento
      if (!formData.fecha_nacimiento) {
        errors.fecha_nacimiento = 'La fecha de nacimiento es requerida'
        isValid = false
      }

      // Validar dirección
      if (formData.direccion.length < 5) {
        errors.direccion = 'La dirección debe tener al menos 5 caracteres'
        isValid = false
      }

      // Validar departamento
      if (formData.departamento.length < 2) {
        errors.departamento = 'El departamento debe tener al menos 2 caracteres'
        isValid = false
      }

      // Validar ciudad
      if (formData.ciudad.length < 2) {
        errors.ciudad = 'La ciudad debe tener al menos 2 caracteres'
        isValid = false
      }

      // Validar código postal
      const postalRegex = /^[0-9]{6}$/
      if (!postalRegex.test(formData.codigo_postal)) {
        errors.codigo_postal = 'Ingresa un código postal válido (6 dígitos)'
        isValid = false
      }

      // Validar contraseña
      if (formData.contraseña.length < 6) {
        errors.contraseña = 'La contraseña debe tener al menos 6 caracteres'
        isValid = false
      }

      // Validar confirmación de contraseña
      if (formData.contraseña !== confirmPassword.value) {
        errors.confirmPassword = 'Las contraseñas no coinciden'
        isValid = false
      }

      return isValid
    }

    const handleRegister = async () => {
      if (!validateForm()) return

      loading.value = true
      error.value = ''

      try {
        const result = await authStore.register(formData)

        if (result.success) {
          router.push('/login')
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = 'Error al crear la cuenta. Por favor, intenta de nuevo.'
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      errors,
      confirmPassword,
      showPassword,
      acceptTerms,
      loading,
      error,
      togglePassword,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
}

.register-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
}

.register-box h2 {
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

.form-group input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
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

.terms {
  margin-bottom: 1.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 0.5rem;
}

.checkbox-container a {
  color: #ff6b6b;
  text-decoration: none;
}

.checkbox-container a:hover {
  text-decoration: underline;
}

.btn-register {
  width: auto;
  min-width: 200px;
  padding: 1rem 2rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-register:hover {
  background-color: #ff5252;
}

.btn-register:disabled {
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
</style> 