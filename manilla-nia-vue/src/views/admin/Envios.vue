<template>
  <div class="admin-envios">
    <h1>Gestión de Envíos</h1>
    
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Buscar envíos..."
        @input="filterEnvios"
      >
    </div>

    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Correo</th>
            <th>Dirección</th>
            <th>Departamento</th>
            <th>Ciudad</th>
            <th>Tipo de Pedido</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="envio in filteredEnvios" :key="envio.id">
            <td>{{ envio.id }}</td>
            <td>{{ `${envio.cliente_nombre} ${envio.cliente_apellido}` }}</td>
            <td>{{ envio.cliente_correo }}</td>
            <td>{{ envio.cliente_direccion }}</td>
            <td>{{ envio.cliente_departamento }}</td>
            <td>{{ envio.cliente_ciudad }}</td>
            <td>{{ envio.tipo_pedido === 'normal' ? 'Pedido Estándar' : 'Pedido Personalizado' }}</td>
            <td>{{ formatDate(envio.fecha_pedido) }}</td>
            <td>
              <button 
                class="btn-entregado"
                @click="marcarEntregado(envio)"
                :disabled="loading"
              >
                Marcar como Entregado
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="loading">
      Cargando envíos...
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="!loading && filteredEnvios.length === 0" class="no-data">
      No hay envíos en proceso
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'AdminEnvios',
  setup() {
    const authStore = useAuthStore()
    const envios = ref([])
    const filteredEnvios = ref([])
    const searchQuery = ref('')
    const loading = ref(false)
    const error = ref(null)

    const fetchEnvios = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await axios.get(`${API_URL}/admin/envios`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        envios.value = response.data
        filteredEnvios.value = response.data
      } catch (err) {
        console.error('Error fetching envios:', err)
        error.value = 'Error al cargar la lista de envíos'
      } finally {
        loading.value = false
      }
    }

    const filterEnvios = () => {
      if (!searchQuery.value) {
        filteredEnvios.value = envios.value
        return
      }

      const query = searchQuery.value.toLowerCase()
      filteredEnvios.value = envios.value.filter(envio => 
        envio.cliente_nombre.toLowerCase().includes(query) ||
        envio.cliente_apellido.toLowerCase().includes(query) ||
        envio.cliente_correo.toLowerCase().includes(query) ||
        envio.cliente_ciudad.toLowerCase().includes(query)
      )
    }

    const marcarEntregado = async (envio) => {
      try {
        loading.value = true
        const endpoint = envio.tipo_pedido === 'normal' 
          ? `${API_URL}/admin/pedidos/${envio.id}/estado-fabricacion`
          : `${API_URL}/admin/pedidos-personalizados/${envio.id}/estado-fabricacion`

        await axios.patch(
          endpoint,
          { estado_fabricacion: 'entregado' },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          }
        )

        // Actualizar la lista de envíos
        await fetchEnvios()
      } catch (err) {
        console.error('Error al marcar como entregado:', err)
        error.value = 'Error al actualizar el estado del envío'
      } finally {
        loading.value = false
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(fetchEnvios)

    return {
      envios,
      filteredEnvios,
      searchQuery,
      loading,
      error,
      filterEnvios,
      marcarEntregado,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-envios {
  padding: 1rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.search-bar input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.admin-table th,
.admin-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.admin-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.admin-table tr:hover {
  background-color: #f8f9fa;
}

.btn-entregado {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-entregado:hover {
  background-color: #218838;
}

.btn-entregado:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  color: #dc3545;
  padding: 1rem;
  background-color: #f8d7da;
  border-radius: 4px;
  margin-top: 1rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}
</style> 