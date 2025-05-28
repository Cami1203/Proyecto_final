<template>
  <div class="reseñas-container">
    <h1>Reseñas de Clientes</h1>

    <!-- Filtros -->
    <div class="filtros">
      <div class="filtro-grupo">
        <label>Filtrar por:</label>
        <select v-model="filtroTipo">
          <option value="todos">Todos</option>
          <option value="diseno">Diseño</option>
          <option value="usabilidad">Usabilidad</option>
          <option value="contenido">Contenido</option>
          <option value="velocidad">Velocidad</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label>Puntaje mínimo:</label>
        <select v-model="puntajeMinimo">
          <option value="0">Todos</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5</option>
        </select>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-container">
      <div class="stat-card">
        <h3>Total de Reseñas</h3>
        <p>{{ estadisticas.total_reseñas || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>Promedio Diseño</h3>
        <p>{{ estadisticas.promedio_diseno || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>Promedio Usabilidad</h3>
        <p>{{ estadisticas.promedio_usabilidad || 0 }}</p>
    </div>
      <div class="stat-card">
        <h3>Promedio Contenido</h3>
        <p>{{ estadisticas.promedio_contenido || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>Promedio Velocidad</h3>
        <p>{{ estadisticas.promedio_velocidad || 0 }}</p>
      </div>
    </div>

    <!-- Lista de Reseñas -->
    <div class="reseñas-list">
      <div v-if="reseñasFiltradas.length === 0" class="no-reseñas">
        No hay reseñas disponibles
      </div>
      <div v-else v-for="reseña in reseñasFiltradas" :key="reseña.id" class="reseña-card">
        <div class="reseña-header">
          <div class="calificaciones">
            <div class="calificacion">
            <span>Diseño:</span>
            <div class="stars">
                <span v-for="n in 5" :key="n" :class="['star', { active: n <= reseña.calificacion_diseno }]">★</span>
              </div>
            </div>
            <div class="calificacion">
            <span>Usabilidad:</span>
            <div class="stars">
                <span v-for="n in 5" :key="n" :class="['star', { active: n <= reseña.calificacion_usabilidad }]">★</span>
              </div>
            </div>
            <div class="calificacion">
            <span>Contenido:</span>
            <div class="stars">
                <span v-for="n in 5" :key="n" :class="['star', { active: n <= reseña.calificacion_contenido }]">★</span>
              </div>
            </div>
            <div class="calificacion">
            <span>Velocidad:</span>
            <div class="stars">
                <span v-for="n in 5" :key="n" :class="['star', { active: n <= reseña.calificacion_velocidad }]">★</span>
              </div>
            </div>
          </div>
          <div class="fecha">
            {{ new Date(reseña.fecha_creacion).toLocaleDateString() }}
          </div>
        </div>
        <div v-if="reseña.comentario" class="comentario">
          {{ reseña.comentario }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const reseñas = ref([])
const estadisticas = ref({})
const filtroTipo = ref('todos')
const puntajeMinimo = ref('0')

const reseñasFiltradas = computed(() => {
  return reseñas.value.filter(reseña => {
    // Filtrar por tipo
    if (filtroTipo.value !== 'todos') {
      const calificacion = reseña[`calificacion_${filtroTipo.value}`]
      if (calificacion < parseInt(puntajeMinimo.value)) {
        return false
      }
    } else {
      // Si no hay tipo específico, verificar que al menos una calificación cumpla
      const calificaciones = [
        reseña.calificacion_diseno,
        reseña.calificacion_usabilidad,
        reseña.calificacion_contenido,
        reseña.calificacion_velocidad
      ]
      if (!calificaciones.some(cal => cal >= parseInt(puntajeMinimo.value))) {
        return false
      }
    }
    return true
  })
})

const cargarDatos = async () => {
  try {
    const [reseñasRes, statsRes] = await Promise.all([
      axios.get('http://localhost:3000/api/reviews'),
      axios.get('http://localhost:3000/api/reviews/estadisticas')
    ])

    reseñas.value = reseñasRes.data
    estadisticas.value = statsRes.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.reseñas-container {
  padding: 2rem;
}

.filtros {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filtro-grupo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filtro-grupo label {
  color: #666;
  font-size: 0.9rem;
}

.filtro-grupo select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.stat-card p {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #6a11cb;
}

.reseña-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.reseña-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.calificaciones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.calificacion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calificacion span {
  color: #666;
  font-size: 0.9rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 1.2rem;
}

.star.active {
  color: #ffd700;
}

.fecha {
  color: #666;
  font-size: 0.9rem;
}

.comentario {
  color: #333;
  font-style: italic;
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;
}

.no-reseñas {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  color: #666;
}
</style> 