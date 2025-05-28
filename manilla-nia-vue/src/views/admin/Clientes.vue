<template>
  <div class="admin-clientes">
    <h1>Gestión de Clientes</h1>
    
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Buscar clientes..."
        @input="filterClientes"
      >
    </div>

    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Departamento</th>
            <th>Ciudad</th>
            <th>Fecha de Registro</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in filteredClientes" :key="cliente.id">
            <td>{{ cliente.id }}</td>
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.apellido }}</td>
            <td>{{ cliente.correo }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.direccion }}</td>
            <td>{{ cliente.departamento }}</td>
            <td>{{ cliente.ciudad }}</td>
            <td>{{ formatDate(cliente.fecha_creacion) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="loading">
      Cargando clientes...
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'AdminClientes',
  setup() {
    const authStore = useAuthStore()
    const clientes = ref([])
    const filteredClientes = ref([])
    const searchQuery = ref('')
    const loading = ref(false)
    const error = ref(null)

    const fetchClientes = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await axios.get(`${API_URL}/admin/clientes`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        clientes.value = response.data
        filteredClientes.value = response.data
      } catch (err) {
        console.error('Error fetching clientes:', err)
        error.value = 'Error al cargar la lista de clientes'
      } finally {
        loading.value = false
      }
    }

    const filterClientes = () => {
      if (!searchQuery.value) {
        filteredClientes.value = clientes.value
        return
      }

      const query = searchQuery.value.toLowerCase()
      filteredClientes.value = clientes.value.filter(cliente => 
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.apellido.toLowerCase().includes(query) ||
        cliente.correo.toLowerCase().includes(query) ||
        cliente.telefono.includes(query) ||
        cliente.ciudad.toLowerCase().includes(query)
      )
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(fetchClientes)

    return {
      clientes,
      filteredClientes,
      searchQuery,
      loading,
      error,
      filterClientes,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-clientes {
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
</style> 