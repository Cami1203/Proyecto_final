<template>
  <div class="acerca-de">
    <!-- Notificación -->
    <div v-if="mostrarNotificacion" :class="['notificacion', tipoNotificacion]">
      <i :class="iconoNotificacion"></i>
      <p>{{ mensajeNotificacion }}</p>
      <button @click="mostrarNotificacion = false" class="cerrar-notificacion">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <section class="evaluacion">
      <div class="container">
        <h2 class="section-title">¿Qué te parece nuestra página?</h2>
        <p class="evaluacion-intro">Tu opinión es muy importante para nosotros. Ayúdanos a mejorar calificando diferentes aspectos de nuestra página.</p>
        
        <form @submit.prevent="enviarEvaluacion" class="evaluacion-form">
          <div class="evaluacion-grid">
            <div class="evaluacion-item">
              <label>Diseño y Estética</label>
              <div class="rating">
                <button 
                  v-for="n in 5" 
                  :key="n"
                  type="button"
                  :class="{ active: calificacion_diseno >= n }"
                  @click="calificacion_diseno = n"
                >
                  <i class="fas fa-star"></i>
                </button>
              </div>
            </div>

            <div class="evaluacion-item">
              <label>Facilidad de Uso</label>
              <div class="rating">
                <button 
                  v-for="n in 5" 
                  :key="n"
                  type="button"
                  :class="{ active: calificacion_usabilidad >= n }"
                  @click="calificacion_usabilidad = n"
                >
                  <i class="fas fa-star"></i>
                </button>
              </div>
            </div>

            <div class="evaluacion-item">
              <label>Contenido</label>
              <div class="rating">
                <button 
                  v-for="n in 5" 
                  :key="n"
                  type="button"
                  :class="{ active: calificacion_contenido >= n }"
                  @click="calificacion_contenido = n"
                >
                  <i class="fas fa-star"></i>
                </button>
              </div>
            </div>

            <div class="evaluacion-item">
              <label>Velocidad de Carga</label>
              <div class="rating">
                <button 
                  v-for="n in 5" 
                  :key="n"
                  type="button"
                  :class="{ active: calificacion_velocidad >= n }"
                  @click="calificacion_velocidad = n"
                >
                  <i class="fas fa-star"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="comentarios-section">
            <label>Comentarios Adicionales</label>
            <textarea 
              v-model="comentario"
              placeholder="Cuéntanos qué te gustó o qué podríamos mejorar..."
              rows="3"
            ></textarea>
          </div>

          <button type="submit" class="btn-evaluar" :disabled="!formValido">
            <i class="fas fa-paper-plane"></i>
            Enviar Evaluación
          </button>
        </form>
      </div>
    </section>

    <section class="hero">
      <div class="hero-content">
        <h1 class="animate-title">ManillaNia</h1>
        <p class="animate-text">Artesanía con alma, diseño con propósito</p>
      </div>
    </section>

    <section class="historia">
      <div class="container">
        <h2 class="section-title">Nuestra Historia</h2>
        <div class="historia-content">
          <div class="texto">
            <p>En ManillaNia, cada nudo cuenta una historia. Somos una marca colombiana que nace del amor por la artesanía y el detalle, dedicada a crear manillas tejidas a mano con el alma.</p>
            <p>Cada pieza es única, creada con paciencia y dedicación por artesanos que entrelazan hilos, colores y tradiciones para dar forma a accesorios que conectan con lo auténtico.</p>
          </div>
          <div class="imagen">
            <img src="/img/inicio.png" alt="Artesano tejiendo manillas" class="animate-image">
          </div>
        </div>
      </div>
    </section>

    <section class="valores">
      <div class="container">
        <h2 class="section-title">Nuestros Valores</h2>
        <div class="valores-grid">
          <div class="valor-card animate-card">
            <i class="fas fa-hands"></i>
            <h3>Artesanía</h3>
            <p>Cada pieza es única, hecha a mano con dedicación y amor.</p>
          </div>
          <div class="valor-card animate-card">
            <i class="fas fa-leaf"></i>
            <h3>Sostenibilidad</h3>
            <p>Utilizamos materiales eco-amigables y procesos sustentables.</p>
          </div>
          <div class="valor-card animate-card">
            <i class="fas fa-handshake"></i>
            <h3>Comercio Justo</h3>
            <p>Apoyamos a artesanos locales con precios justos y condiciones dignas.</p>
          </div>
          <div class="valor-card animate-card">
            <i class="fas fa-star"></i>
            <h3>Calidad</h3>
            <p>Nos comprometemos con la excelencia en cada detalle.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="proceso">
      <div class="container">
        <h2 class="section-title">Nuestro Proceso</h2>
        <div class="proceso-timeline">
          <div class="paso animate-step">
            <div class="numero">1</div>
            <h3>Selección de Materiales</h3>
            <p>Elegimos cuidadosamente los mejores hilos y accesorios.</p>
          </div>
          <div class="paso animate-step">
            <div class="numero">2</div>
            <h3>Diseño</h3>
            <p>Creamos patrones únicos que combinan tradición y modernidad.</p>
          </div>
          <div class="paso animate-step">
            <div class="numero">3</div>
            <h3>Tejido</h3>
            <p>Nuestros artesanos tejen cada pieza con precisión y cuidado.</p>
          </div>
          <div class="paso animate-step">
            <div class="numero">4</div>
            <h3>Control de Calidad</h3>
            <p>Verificamos cada detalle para garantizar la perfección.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="equipo">
      <div class="container">
        <h2>Nuestro Equipo</h2>
        <div class="equipo-grid">
          <div class="miembro">
            <img src="https://via.placeholder.com/200x200" alt="Miembro del equipo">
            <h3>Ana Martínez</h3>
            <p>Fundadora & Diseñadora</p>
          </div>
          <div class="miembro">
            <img src="https://via.placeholder.com/200x200" alt="Miembro del equipo">
            <h3>Carlos Rodríguez</h3>
            <p>Director de Producción</p>
          </div>
          <div class="miembro">
            <img src="https://via.placeholder.com/200x200" alt="Miembro del equipo">
            <h3>Laura Sánchez</h3>
            <p>Coordinadora de Artesanos</p>
          </div>
        </div>
      </div>
    </section>

    <section class="impacto">
      <div class="container">
        <h2>Nuestro Impacto</h2>
        <div class="impacto-stats">
          <div class="stat">
            <h3>50+</h3>
            <p>Artesanos Apoyados</p>
          </div>
          <div class="stat">
            <h3>1000+</h3>
            <p>Piezas Creadas</p>
          </div>
          <div class="stat">
            <h3>98%</h3>
            <p>Clientes Satisfechos</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <h2>¿Listo para descubrir nuestra colección?</h2>
        <router-link to="/productos" class="btn-primary">Ver Colección</router-link>
      </div>
    </section>

    <section class="documentos">
      <div class="container">
        <h2 class="section-title">Documentación Legal</h2>
        <div class="documentos-grid">
          <a href="/Doc/Politica de Tratamiento de Datos - ManilaNia.pdf" target="_blank" class="documento-card animate-card">
            <i class="fas fa-shield-alt"></i>
            <h3>Política de Tratamiento de Datos</h3>
            <p>Conoce cómo protegemos tu información</p>
          </a>
          <a href="/Doc/Politica de Terminos y Condiciones - ManillaNia.pdf" target="_blank" class="documento-card animate-card">
            <i class="fas fa-file-contract"></i>
            <h3>Términos y Condiciones</h3>
            <p>Información sobre nuestros servicios</p>
          </a>
          <a href="/Doc/Politicas de Envio y Devoluciones - Manillania.pdf" target="_blank" class="documento-card animate-card">
            <i class="fas fa-truck"></i>
            <h3>Políticas de Envío y Devoluciones</h3>
            <p>Detalles sobre envíos y devoluciones</p>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()

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

const calificacion_diseno = ref(0)
const calificacion_usabilidad = ref(0)
const calificacion_contenido = ref(0)
const calificacion_velocidad = ref(0)
const comentario = ref('')

const formValido = computed(() => {
  return calificacion_diseno.value > 0 &&
         calificacion_usabilidad.value > 0 &&
         calificacion_contenido.value > 0 &&
         calificacion_velocidad.value > 0
})

const enviarEvaluacion = async () => {
  if (!formValido.value) {
    console.log('Formulario no válido:', {
      calificacion_diseno: calificacion_diseno.value,
      calificacion_usabilidad: calificacion_usabilidad.value,
      calificacion_contenido: calificacion_contenido.value,
      calificacion_velocidad: calificacion_velocidad.value
    });
    return;
  }

  try {
    console.log('Enviando evaluación:', {
      calificacion_diseno: calificacion_diseno.value,
      calificacion_usabilidad: calificacion_usabilidad.value,
      calificacion_contenido: calificacion_contenido.value,
      calificacion_velocidad: calificacion_velocidad.value,
      comentario: comentario.value
    });

    const response = await axios.post('http://localhost:3000/api/reviews', {
      calificacion_diseno: calificacion_diseno.value,
      calificacion_usabilidad: calificacion_usabilidad.value,
      calificacion_contenido: calificacion_contenido.value,
      calificacion_velocidad: calificacion_velocidad.value,
      comentario: comentario.value
    });

    console.log('Respuesta del servidor:', response.data);

    if (response.data.success) {
      // Limpiar el formulario
      calificacion_diseno.value = 0;
      calificacion_usabilidad.value = 0;
      calificacion_contenido.value = 0;
      calificacion_velocidad.value = 0;
      comentario.value = '';

      // Mostrar mensaje de éxito
      mostrarMensaje('¡Gracias por tu evaluación! Tu opinión es muy valiosa para nosotros.', 'exito');
    } else {
      throw new Error(response.data.message || 'Error al enviar la evaluación');
    }
  } catch (error) {
    console.error('Error completo:', error);
    console.error('Detalles del error:', error.response?.data);
    mostrarMensaje(error.response?.data?.message || 'Hubo un error al enviar tu evaluación. Por favor, intenta de nuevo.', 'error');
  }
}

onMounted(() => {
  // Añadir animaciones cuando los elementos sean visibles
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, {
    threshold: 0.1
  })

  document.querySelectorAll('.animate-title, .animate-text, .animate-image, .animate-card, .animate-step').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<style scoped>
.acerca-de {
  min-height: 100vh;
  background-color: #FFE4D6;
}

.hero {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/img/inicio.png');
  background-size: cover;
  background-position: center;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(106, 17, 203, 0.7), rgba(37, 117, 252, 0.7));
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1s ease forwards;
}

.hero p {
  font-size: 1.5rem;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1s ease 0.3s forwards;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.section-title {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #6a11cb;
  position: relative;
  padding-bottom: 1rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
}

.historia-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.texto p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: #555;
  font-size: 1.1rem;
}

.imagen img {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.imagen img:hover {
  transform: scale(1.05);
}

.valores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.valor-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
}

.valor-card.visible {
  animation: fadeInUp 0.6s ease forwards;
}

.valor-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.valor-card i {
  font-size: 2.5rem;
  color: #6a11cb;
  margin-bottom: 1rem;
}

.valor-card h3 {
  color: #333;
  margin-bottom: 1rem;
}

.proceso-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.paso {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(30px);
}

.paso.visible {
  animation: fadeInUp 0.6s ease forwards;
}

.numero {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.equipo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.miembro {
  text-align: center;
}

.miembro img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
}

.impacto-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat h3 {
  font-size: 2.5rem;
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.documentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.documento-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  opacity: 0;
  transform: translateY(30px);
}

.documento-card.visible {
  animation: fadeInUp 0.6s ease forwards;
}

.documento-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  color: white;
}

.documento-card:hover i {
  color: white;
}

.documento-card i {
  font-size: 2.5rem;
  color: #6a11cb;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.cta {
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  color: white;
  text-align: center;
  padding: 4rem 0;
}

.btn-primary {
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: #6a11cb;
  text-decoration: none;
  border-radius: 30px;
  font-weight: bold;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 2rem;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
}
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .historia-content {
    grid-template-columns: 1fr;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .container {
    padding: 2rem 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

.evaluacion {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 3rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.evaluacion-intro {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.evaluacion-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.evaluacion-form:hover {
  transform: translateY(-5px);
}

.evaluacion-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.evaluacion-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.evaluacion-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.evaluacion-item label {
  display: block;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

.rating {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.rating button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s ease;
  transform-origin: center;
}

.rating button:hover {
  transform: scale(1.2) rotate(5deg);
}

.rating button i {
  font-size: 1.8rem;
  color: #ddd;
  transition: all 0.3s ease;
}

.rating button.active i {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.comentarios-section {
  margin-bottom: 2rem;
}

.comentarios-section label {
  display: block;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

textarea:focus {
  outline: none;
  border-color: #6a11cb;
  box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
  background: white;
}

.btn-evaluar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-evaluar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(106, 17, 203, 0.3);
}

.btn-evaluar:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-evaluar i {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .evaluacion-grid {
    grid-template-columns: 1fr;
  }
  
  .evaluacion-form {
    padding: 1.5rem;
  }
  
  .rating button i {
    font-size: 1.5rem;
  }
}

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
</style> 