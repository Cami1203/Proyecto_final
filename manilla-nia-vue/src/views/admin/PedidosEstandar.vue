<template>
  <div class="admin-pedidos-estandar">
    <h1>Gestión de Pedidos Estándar</h1>
    
    <div class="filters-container">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar pedidos estándar..."
          @input="filterPedidos"
        >
      </div>
      
      <div class="filter-buttons">
        <button 
          class="filter-btn" 
          :class="{ active: filterEstado === 'todos' }"
          @click="setFilterEstado('todos')"
        >
          Todos
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filterEstado === 'pagados' }"
          @click="setFilterEstado('pagados')"
        >
          Pagados
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filterEstado === 'pendientes' }"
          @click="setFilterEstado('pendientes')"
        >
          Pendientes
        </button>
        <label class="hide-canceled">
          <input 
            type="checkbox" 
            v-model="hideCanceled"
            @change="filterPedidos"
          >
          Ocultar Cancelados
        </label>
      </div>
    </div>

    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Correo</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pedido in filteredPedidos" :key="pedido.id">
            <td>{{ pedido.id }}</td>
            <td>{{ `${pedido.cliente_nombre} ${pedido.cliente_apellido}` }}</td>
            <td>{{ pedido.cliente_correo }}</td>
            <td>{{ formatDate(pedido.fecha_pedido) }}</td>
            <td>${{ formatNumber(pedido.total) }}</td>
            <td>
              <span :class="['status-badge', pedido.estado_pedido.toLowerCase()]">
                {{ pedido.estado_pedido }}
              </span>
              <div class="estado-fabricacion">
                <select 
                  v-model="pedido.estado_fabricacion" 
                  @change="actualizarEstadoFabricacion(pedido.id, pedido.estado_fabricacion)"
                  :class="['estado-select', pedido.estado_fabricacion?.toLowerCase()]"
                >
                  <option value="en fabricacion">En Fabricación</option>
                  <option value="en empaquetamiento">En Empaquetamiento</option>
                  <option value="en proceso de entrega">En Proceso de Entrega</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
            </td>
            <td>
              <button 
                class="btn-view"
                @click="verDetalles(pedido.id)"
              >
                Ver Detalles
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="loading">
      Cargando pedidos estándar...
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Modal de detalles -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Detalles del Pedido Estándar #{{ selectedPedido?.id }}</h2>
          <button class="close-button" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedPedido">
          <div class="pedido-info">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> {{ `${selectedPedido.cliente_nombre} ${selectedPedido.cliente_apellido}` }}</p>
            <p><strong>Correo:</strong> {{ selectedPedido.cliente_correo }}</p>
            <p><strong>Fecha del Pedido:</strong> {{ formatDate(selectedPedido.fecha_pedido) }}</p>
            <p><strong>Estado del Pedido:</strong> {{ selectedPedido.estado_pedido }}</p>
            <p><strong>Estado del Pago:</strong> {{ selectedPedido.estado_pago }}</p>
            <p><strong>Monto del Pago:</strong> ${{ formatNumber(selectedPedido.monto_pago) }}</p>
            <p><strong>Fecha del Pago:</strong> {{ formatDate(selectedPedido.fecha_pago) }}</p>
          </div>
          
          <div class="pedido-details">
            <h3>Detalles del Producto</h3>
            <div class="details-grid">
              <div class="detail-item">
                <strong>Nombre del Producto:</strong>
                <p>{{ selectedPedido.nombre_producto }}</p>
              </div>
              <div class="detail-item">
                <strong>Cantidad:</strong>
                <p>{{ selectedPedido.cantidad }}</p>
              </div>
              <div class="detail-item">
                <strong>Color Principal:</strong>
                <p>{{ selectedPedido.color_principal }}</p>
              </div>
              <div class="detail-item">
                <strong>Color Secundario:</strong>
                <p>{{ selectedPedido.color_secundario || 'No especificado' }}</p>
              </div>
              <div class="detail-item">
                <strong>Color Terciario:</strong>
                <p>{{ selectedPedido.color_terciario || 'No especificado' }}</p>
              </div>
              <div class="detail-item">
                <strong>Tipo de Nudo:</strong>
                <p>{{ selectedPedido.tipo_nudo }}</p>
              </div>
              <div class="detail-item">
                <strong>Materiales:</strong>
                <p>{{ selectedPedido.materiales }}</p>
              </div>
              <div class="detail-item">
                <strong>Cantidad de Hilo (cm):</strong>
                <p>{{ selectedPedido.cantidad_hilo_cm }} cm</p>
              </div>
              <div class="detail-item">
                <strong>Costo de Fabricación:</strong>
                <p>${{ formatNumber(selectedPedido.costo_fabricacion) }}</p>
              </div>
              <div class="detail-item">
                <strong>Precio de Venta:</strong>
                <p>${{ formatNumber(selectedPedido.precio_venta) }}</p>
              </div>
              <div class="detail-item">
                <strong>Estado de Fabricación:</strong>
                <p>{{ selectedPedido.estado_fabricacion || 'Pendiente' }}</p>
              </div>
              <div class="detail-item full-width">
                <strong>Observaciones:</strong>
                <p>{{ selectedPedido.observaciones || 'No hay observaciones adicionales' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'AdminPedidosEstandar',
  setup() {
    const authStore = useAuthStore()
    const pedidos = ref([])
    const filteredPedidos = ref([])
    const searchQuery = ref('')
    const loading = ref(false)
    const error = ref(null)
    const showModal = ref(false)
    const selectedPedido = ref(null)
    const filterEstado = ref('todos')
    const hideCanceled = ref(true)

    const formatNumber = (value) => {
      if (value === null || value === undefined) return '0.00'
      const num = parseFloat(value)
      return isNaN(num) ? '0.00' : num.toFixed(2)
    }

    const fetchPedidos = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await axios.get(`${API_URL}/admin/pedidos`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        
        if (!Array.isArray(response.data)) {
          throw new Error('Formato de respuesta inválido')
        }

        pedidos.value = response.data.map(pedido => ({
          ...pedido,
          estado_fabricacion: pedido.estado_fabricacion || 'pendiente'
        }))
        // Aplicar filtros inmediatamente después de cargar los pedidos
        filterPedidos()
      } catch (err) {
        console.error('Error al obtener pedidos estándar:', err)
        error.value = err.response?.data?.message || 'Error al cargar la lista de pedidos estándar'
      } finally {
        loading.value = false
      }
    }

    const setFilterEstado = (estado) => {
      filterEstado.value = estado
      filterPedidos()
    }

    const filterPedidos = () => {
      let filtered = [...pedidos.value]

      // Aplicar filtro de búsqueda
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(pedido => 
          pedido.cliente_nombre.toLowerCase().includes(query) ||
          pedido.cliente_apellido.toLowerCase().includes(query) ||
          pedido.cliente_correo.toLowerCase().includes(query) ||
          pedido.id.toString().includes(query)
        )
      }

      // Aplicar filtro de estado
      if (filterEstado.value !== 'todos') {
        filtered = filtered.filter(pedido => {
          if (filterEstado.value === 'pagados') {
            return pedido.estado_pago === 'pagado'
          } else if (filterEstado.value === 'pendientes') {
            return pedido.estado_pago === 'pendiente'
          }
          return true
        })
      }

      // Aplicar filtro de cancelados
      if (hideCanceled.value) {
        filtered = filtered.filter(pedido => 
          pedido.estado_pedido.toLowerCase() !== 'cancelado'
        )
      }

      filteredPedidos.value = filtered
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const verDetalles = async (pedidoId) => {
      try {
        const response = await axios.get(`${API_URL}/admin/pedidos/${pedidoId}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        selectedPedido.value = response.data
        showModal.value = true
      } catch (err) {
        console.error('Error al obtener detalles del pedido:', err)
        error.value = 'Error al cargar los detalles del pedido estándar'
      }
    }

    const actualizarEstadoFabricacion = async (pedidoId, nuevoEstado) => {
      try {
        const response = await axios.patch(
          `${API_URL}/admin/pedidos/${pedidoId}/estado-fabricacion`,
          { estado_fabricacion: nuevoEstado },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          }
        )
        // Actualizar el pedido en la lista
        const index = pedidos.value.findIndex(p => p.id === pedidoId)
        if (index !== -1) {
          pedidos.value[index] = { ...pedidos.value[index], ...response.data }
        }
      } catch (err) {
        console.error('Error al actualizar estado de fabricación:', err)
        error.value = err.response?.data?.message || 'Error al actualizar el estado de fabricación'
        // Revertir el cambio en el select
        const pedido = pedidos.value.find(p => p.id === pedidoId)
        if (pedido) {
          pedido.estado_fabricacion = pedido.estado_fabricacion_anterior
        }
      }
    }

    onMounted(fetchPedidos)

    return {
      pedidos,
      filteredPedidos,
      searchQuery,
      loading,
      error,
      showModal,
      selectedPedido,
      filterEstado,
      hideCanceled,
      filterPedidos,
      setFilterEstado,
      formatDate,
      verDetalles,
      formatNumber,
      actualizarEstadoFabricacion
    }
  }
}
</script>

<style scoped>
/* Reutilizar los mismos estilos que en PedidosPersonalizados.vue */
.admin-pedidos-estandar {
  padding: 1rem;
}

.filters-container {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.filter-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filter-btn:hover {
  background: #f8f9fa;
  border-color: #6a11cb;
  color: #6a11cb;
}

.filter-btn.active {
  background: #6a11cb;
  color: white;
  border-color: #6a11cb;
}

.hide-canceled {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.hide-canceled input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .filter-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-btn {
    width: 100%;
  }
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

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.procesando {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.enviado {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.entregado {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-badge.cancelado {
  background-color: #f8d7da;
  color: #721c24;
}

.btn-view {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-view:hover {
  background-color: #2980b9;
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

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.pedido-info {
  margin-bottom: 2rem;
}

.pedido-info h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.pedido-info p {
  margin: 0.5rem 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.detail-item {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.detail-item p {
  margin: 0;
  color: #666;
}

.estado-fabricacion {
  margin-top: 0.5rem;
}

.estado-select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 0.875rem;
  cursor: pointer;
  width: 100%;
  max-width: 200px;
}

.estado-select.en-fabricacion {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.estado-select.en-empaquetamiento {
  background-color: #cce5ff;
  color: #004085;
  border-color: #b8daff;
}

.estado-select.en-proceso-de-entrega {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.estado-select.entregado {
  background-color: #d1e7dd;
  color: #0f5132;
  border-color: #badbcc;
}

.estado-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
</style> 