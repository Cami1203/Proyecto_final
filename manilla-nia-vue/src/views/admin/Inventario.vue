<template>
  <div class="admin-inventario">
    <div class="header-actions">
      <h1>Gestión de Inventario</h1>
      <div class="notifications-badge" v-if="notificacionesNoLeidas.length > 0">
        <i class="fas fa-bell"></i>
        <span class="badge">{{ notificacionesNoLeidas.length }}</span>
      </div>
    </div>

    <!-- Notificaciones de Stock Bajo -->
    <div v-if="notificacionesNoLeidas.length > 0" class="notifications-container">
      <div class="notification-header">
        <h2>Alertas de Stock</h2>
        <button class="btn-secondary" @click="marcarTodasLeidas">
          Marcar todas como leídas
        </button>
      </div>
      <div class="notifications-list">
        <div v-for="notif in notificacionesNoLeidas" :key="notif.id" class="notification-item">
          <div class="notification-content">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="notification-text">
              <p>{{ notif.mensaje }}</p>
              <small>Fecha: {{ formatDate(notif.fecha_creacion) }}</small>
            </div>
          </div>
          <button class="btn-accion" @click="marcarComoLeida(notif.id)" title="Marcar como leída">
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Inventario -->
    <div class="table-container">
      <div class="table-header">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar productos..."
            @input="filterProductos"
          >
        </div>
      </div>

      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in filteredProductos" :key="producto.id">
            <td>{{ producto.id }}</td>
            <td>{{ producto.nombre_producto }}</td>
            <td>{{ producto.cantidad_actual }}</td>
            <td>
              <div class="stock-minimo">
                <input 
                  type="number" 
                  v-model="producto.cantidad_minima" 
                  min="0"
                  @change="actualizarStockMinimo(producto.id, producto.cantidad_minima)"
                  class="stock-input"
                >
              </div>
            </td>
            <td>
              <span :class="['status-badge', getStockStatus(producto)]">
                {{ getStockStatusText(producto) }}
              </span>
            </td>
            <td class="acciones">
              <button 
                class="btn-accion" 
                @click="mostrarModalActualizarStock(producto)"
                title="Actualizar Stock"
              >
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Actualizar Stock -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>Actualizar Stock</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="actualizarStock" class="stock-form">
            <div class="form-group">
              <label>Producto</label>
              <p class="producto-nombre">{{ productoSeleccionado?.nombre_producto }}</p>
            </div>
            <div class="form-group">
              <label for="nuevaCantidad">Nueva Cantidad</label>
              <input 
                type="number" 
                id="nuevaCantidad"
                v-model="nuevaCantidad"
                min="0"
                required
                class="stock-input"
              >
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Actualizando...' : 'Actualizar Stock' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Cargando inventario...
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'AdminInventario',
  setup() {
    const authStore = useAuthStore()
    const productos = ref([])
    const filteredProductos = ref([])
    const searchQuery = ref('')
    const loading = ref(false)
    const error = ref(null)
    const mostrarModal = ref(false)
    const productoSeleccionado = ref(null)
    const nuevaCantidad = ref(0)
    const notificacionesNoLeidas = ref([])

    const cargarInventario = async () => {
      loading.value = true
      error.value = null

      try {
        const [inventarioResponse, notificacionesResponse] = await Promise.all([
          axios.get(`${API_URL}/inventario`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          }),
          axios.get(`${API_URL}/inventario/notificaciones`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        ])

        productos.value = inventarioResponse.data
        filteredProductos.value = inventarioResponse.data
        notificacionesNoLeidas.value = notificacionesResponse.data
      } catch (err) {
        console.error('Error al cargar inventario:', err)
        error.value = 'Error al cargar el inventario'
      } finally {
        loading.value = false
      }
    }

    const filterProductos = () => {
      if (!searchQuery.value) {
        filteredProductos.value = productos.value
        return
      }

      const query = searchQuery.value.toLowerCase()
      filteredProductos.value = productos.value.filter(producto => 
        producto.nombre_producto.toLowerCase().includes(query) ||
        producto.id.toString().includes(query)
      )
    }

    const getStockStatus = (producto) => {
      if (producto.cantidad_actual <= 0) return 'agotado'
      if (producto.cantidad_actual <= producto.cantidad_minima) return 'bajo'
      return 'normal'
    }

    const getStockStatusText = (producto) => {
      const status = getStockStatus(producto)
      switch (status) {
        case 'agotado': return 'Agotado'
        case 'bajo': return 'Stock Bajo'
        default: return 'Normal'
      }
    }

    const mostrarModalActualizarStock = (producto) => {
      productoSeleccionado.value = producto
      nuevaCantidad.value = producto.cantidad_actual
      mostrarModal.value = true
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      productoSeleccionado.value = null
      nuevaCantidad.value = 0
    }

    const actualizarStock = async () => {
      if (!productoSeleccionado.value) return

      loading.value = true
      error.value = null

      try {
        await axios.put(
          `${API_URL}/inventario/${productoSeleccionado.value.id}/stock`,
          { cantidad_nueva: nuevaCantidad.value },
          { headers: { Authorization: `Bearer ${authStore.token}` } }
        )

        // Actualizar el producto en la lista local
        const index = productos.value.findIndex(p => p.id === productoSeleccionado.value.id)
        if (index !== -1) {
          productos.value[index].cantidad_actual = nuevaCantidad.value
        }

        // Mostrar notificación de éxito
        window.$notify({
          title: 'Stock Actualizado',
          message: 'El stock del producto ha sido actualizado correctamente',
          type: 'success'
        })

        cerrarModal()
        await cargarInventario() // Recargar datos para actualizar notificaciones
      } catch (err) {
        console.error('Error al actualizar stock:', err)
        error.value = 'Error al actualizar el stock del producto'
      } finally {
        loading.value = false
      }
    }

    const actualizarStockMinimo = async (productoId, nuevaCantidadMinima) => {
      loading.value = true
      error.value = null

      try {
        await axios.put(
          `${API_URL}/inventario/${productoId}/cantidad-minima`,
          { cantidad_minima: nuevaCantidadMinima },
          { headers: { Authorization: `Bearer ${authStore.token}` } }
        )

        // Actualizar el producto en la lista local
        const index = productos.value.findIndex(p => p.id === productoId)
        if (index !== -1) {
          productos.value[index].cantidad_minima = nuevaCantidadMinima
        }

        window.$notify({
          title: 'Stock Mínimo Actualizado',
          message: 'El stock mínimo del producto ha sido actualizado correctamente',
          type: 'success'
        })
      } catch (err) {
        console.error('Error al actualizar stock mínimo:', err)
        error.value = 'Error al actualizar el stock mínimo del producto'
      } finally {
        loading.value = false
      }
    }

    const marcarComoLeida = async (notificacionId) => {
      try {
        await axios.patch(
          `${API_URL}/inventario/notificaciones/${notificacionId}/leer`,
          {},
          { headers: { Authorization: `Bearer ${authStore.token}` } }
        )
        notificacionesNoLeidas.value = notificacionesNoLeidas.value.filter(
          n => n.id !== notificacionId
        )
      } catch (err) {
        console.error('Error al marcar notificación como leída:', err)
        error.value = 'Error al marcar la notificación como leída'
      }
    }

    const marcarTodasLeidas = async () => {
      try {
        await Promise.all(
          notificacionesNoLeidas.value.map(notif =>
            axios.patch(
              `${API_URL}/inventario/notificaciones/${notif.id}/leer`,
              {},
              { headers: { Authorization: `Bearer ${authStore.token}` } }
            )
          )
        )
        notificacionesNoLeidas.value = []
      } catch (err) {
        console.error('Error al marcar todas las notificaciones como leídas:', err)
        error.value = 'Error al marcar las notificaciones como leídas'
      }
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

    onMounted(cargarInventario)

    return {
      productos,
      filteredProductos,
      searchQuery,
      loading,
      error,
      mostrarModal,
      productoSeleccionado,
      nuevaCantidad,
      notificacionesNoLeidas,
      filterProductos,
      getStockStatus,
      getStockStatusText,
      mostrarModalActualizarStock,
      cerrarModal,
      actualizarStock,
      actualizarStockMinimo,
      marcarComoLeida,
      marcarTodasLeidas,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-inventario {
  padding: 1rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions h1 {
  margin: 0;
  color: #2c3e50;
}

.notifications-badge {
  position: relative;
  cursor: pointer;
}

.notifications-badge i {
  font-size: 1.5rem;
  color: #e74c3c;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.notifications-container {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notification-header h2 {
  margin: 0;
  color: #856404;
  font-size: 1.25rem;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #ffeeba;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.notification-content i {
  color: #e74c3c;
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.notification-text {
  flex: 1;
}

.notification-text p {
  margin: 0;
  color: #2c3e50;
}

.notification-text small {
  color: #666;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.table-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.search-bar {
  max-width: 400px;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
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

.stock-minimo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.normal {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.bajo {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.agotado {
  background-color: #f8d7da;
  color: #721c24;
}

.acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-accion {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-accion:hover {
  background-color: #f8f9fa;
  color: #3498db;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-contenido {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
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
  color: #2c3e50;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.stock-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
}

.producto-nombre {
  margin: 0;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #2c3e50;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .notification-content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.75rem;
  }

  .acciones {
    flex-direction: column;
  }
}
</style> 