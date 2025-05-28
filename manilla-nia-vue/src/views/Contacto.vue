<template>
  <div class="contact-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Contáctanos</h1>
        <p class="tagline">Estamos aquí para ayudarte</p>
      </div>
    </section>

    <div class="contact-content">
      <div class="contact-info">
        <div class="info-card animate__animated animate__fadeIn">
          <i class="fas fa-map-marker-alt"></i>
          <h3>Ubicación</h3>
          <p>Zipaquirá, Cajicá y Tocancipá, Colombia</p>
        </div>

        <div class="info-card animate__animated animate__fadeIn animate__delay-1s">
          <i class="fas fa-phone"></i>
          <h3>Teléfono</h3>
          <p>+57 300 123 4567</p>
          <p>Lunes a Viernes: 8:00 AM - 9:00 PM</p>
          <p>Sábados: 10:00 AM - 5:00 PM</p>
        </div>

        <div class="info-card animate__animated animate__fadeIn animate__delay-2s">
          <i class="fas fa-envelope"></i>
          <h3>Correo Electrónico</h3>
          <p>manillaniaaem@gmail.com</p>
        </div>

        <div class="info-card">
          <i class="fas fa-share-alt"></i>
          <h3>Síguenos</h3>
          <div class="social-links">
            <a href="#" class="social-link">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="contact-form-container animate__animated animate__fadeIn animate__delay-3s">
        <h2>Envíanos un Mensaje</h2>
        <form @submit.prevent="submitForm" class="contact-form">
          <div class="form-group">
            <label for="nombre">Nombre Completo</label>
            <input 
              type="text" 
              id="nombre" 
              v-model="formData.nombre" 
              required
              :class="{ 'error': errors.nombre }"
              @input="validateField('nombre')"
            >
            <span class="error-message" v-if="errors.nombre">{{ errors.nombre }}</span>
          </div>

          <div class="form-group">
            <label for="asunto">Asunto</label>
            <select 
              id="asunto" 
              v-model="formData.asunto" 
              required
              :class="{ 'error': errors.asunto }"
              @change="validateField('asunto')"
            >
              <option value="">Selecciona un asunto</option>
              <option value="quejas">Quejas</option>
              <option value="reclamos_servicio">Reclamos del Servicio</option>
              <option value="sugerencias">Sugerencias</option>
              <option value="felicitaciones">Felicitaciones</option>
              <option value="pedidos">Pedidos</option>
            </select>
            <span class="error-message" v-if="errors.asunto">{{ errors.asunto }}</span>
          </div>

          <div class="form-group animate__animated animate__fadeIn" v-if="formData.asunto === 'pedidos'">
            <label for="tipo_pedido">Motivo</label>
            <select 
              id="tipo_pedido" 
              v-model="formData.tipo_pedido" 
              required
              :class="{ 'error': errors.tipo_pedido }"
              @change="validateField('tipo_pedido')"
            >
              <option value="">Selecciona un motivo</option>
              <option value="no_llego">Mi pedido no ha llegado</option>
              <option value="defectuoso">Mi pedido llegó defectuoso de fábrica</option>
              <option value="incorrecto">No me llegó lo que pedí</option>
              <option value="garantia">Solicitar garantía</option>
              <option value="otra_situacion">Otra situación</option>
            </select>
            <span class="error-message" v-if="errors.tipo_pedido">{{ errors.tipo_pedido }}</span>
          </div>

          <div class="form-group animate__animated animate__fadeIn" v-if="formData.asunto === 'pedidos'">
            <label for="pedido_id">ID del Pedido</label>
            <input 
              type="text" 
              id="pedido_id" 
              v-model="formData.pedido_id" 
              required
              :class="{ 'error': errors.pedido_id }"
              placeholder="Ingresa el ID de tu pedido"
              @input="validateField('pedido_id')"
            >
            <span class="error-message" v-if="errors.pedido_id">{{ errors.pedido_id }}</span>
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              required
              :class="{ 'error': errors.email }"
              @input="validateField('email')"
            >
            <small class="form-text">Por este correo electrónico recibirás la respuesta a tu mensaje.</small>
            <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="mensaje">Mensaje</label>
            <textarea 
              id="mensaje" 
              v-model="formData.mensaje" 
              rows="5" 
              required
              :class="{ 'error': errors.mensaje }"
              maxlength="1000"
              @input="validateField('mensaje')"
            ></textarea>
            <div class="word-count" :class="{ 'error': wordCount > 100 }">
              {{ wordCount }}/100 palabras
            </div>
            <span class="error-message" v-if="errors.mensaje">{{ errors.mensaje }}</span>
          </div>

          <button 
            type="submit" 
            class="btn-submit"
            :disabled="loading || !isFormValid"
            :class="{ 'animate__animated animate__pulse': !isFormValid }"
          >
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin"></i> Enviando...
            </span>
            <span v-else>Enviar Mensaje</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import 'animate.css/animate.min.css'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'ContactoView',
  setup() {
    const formData = reactive({
      nombre: '',
      email: '',
      asunto: '',
      tipo_pedido: '',
      pedido_id: '',
      mensaje: ''
    })

    const errors = reactive({
      nombre: '',
      email: '',
      asunto: '',
      tipo_pedido: '',
      pedido_id: '',
      mensaje: ''
    })

    const loading = ref(false)

    const wordCount = computed(() => {
      return formData.mensaje.trim().split(/\s+/).filter(word => word.length > 0).length
    })

    const isFormValid = computed(() => {
      return !Object.values(errors).some(error => error !== '') &&
             formData.nombre &&
             formData.email &&
             formData.asunto &&
             formData.mensaje &&
             wordCount.value <= 100 &&
             (formData.asunto !== 'pedidos' || (formData.tipo_pedido && formData.pedido_id))
    })

    const validateField = (field) => {
      errors[field] = ''

      switch (field) {
        case 'nombre':
      if (formData.nombre.length < 3) {
        errors.nombre = 'El nombre debe tener al menos 3 caracteres'
      }
          break

        case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Ingresa un correo electrónico válido'
      }
          break

        case 'asunto':
      if (!formData.asunto) {
        errors.asunto = 'Por favor selecciona un asunto'
          }
          break

        case 'tipo_pedido':
          if (formData.asunto === 'pedidos' && !formData.tipo_pedido) {
            errors.tipo_pedido = 'Por favor selecciona un motivo'
          }
          break

        case 'pedido_id':
          if (formData.asunto === 'pedidos' && !formData.pedido_id) {
            errors.pedido_id = 'Por favor ingresa el ID de tu pedido'
          }
          break

        case 'mensaje':
          if (wordCount.value > 100) {
            errors.mensaje = 'El mensaje no puede exceder las 100 palabras'
          } else if (formData.mensaje.length < 10) {
        errors.mensaje = 'El mensaje debe tener al menos 10 caracteres'
          }
          break
      }
    }

    const submitForm = async () => {
      if (!isFormValid.value) return

      loading.value = true
      try {
        const response = await axios.post(`${API_URL}/contacto`, formData)
        window.$notify({
          title: '¡Mensaje Enviado!',
          message: 'Nos pondremos en contacto contigo pronto.',
          type: 'success',
          duration: 5000
        })
        // Limpiar el formulario
        Object.keys(formData).forEach(key => {
          formData[key] = ''
        })
      } catch (error) {
        console.error('Error al enviar el mensaje:', error)
        window.$notify({
          title: 'Error',
          message: 'Hubo un error al enviar el mensaje. Por favor, intenta de nuevo.',
          type: 'error',
          duration: 5000
        })
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      errors,
      loading,
      wordCount,
      isFormValid,
      validateField,
      submitForm
    }
  }
}
</script>

<style scoped>
.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-section {
  height: 40vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
              url('@/assets/contact-bg.jpg') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: 4rem;
  animation: fadeIn 1s ease-in;
}

.hero-content h1 {
  font-size: 3rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: slideDown 1s ease-out;
}

.tagline {
  font-size: 1.5rem;
  margin-top: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  animation: slideUp 1s ease-out;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.info-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.info-card i {
  font-size: 2rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.info-card h3 {
  color: #333;
  margin-bottom: 1rem;
}

.info-card p {
  color: #666;
  margin: 0.5rem 0;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  color: #666;
  font-size: 1.5rem;
  transition: color 0.3s;
}

.social-link:hover {
  color: #ff6b6b;
}

.contact-form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.contact-form-container h2 {
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.contact-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  animation: shake 0.5s ease-in-out;
}

.word-count {
  font-size: 0.8rem;
  color: #666;
  text-align: right;
  margin-top: 0.25rem;
}

.word-count.error {
  color: #dc3545;
}

.btn-submit {
  padding: 1rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff5252 0%, #ff6b6b 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-submit:disabled {
  background: #e9ecef;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }
}
</style> 