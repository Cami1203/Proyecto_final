<template>
  <div class="detalle-pedido-container">
    <div v-if="loading" class="loading">
      <p>Cargando detalles del pedido...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="cargarDetalles" class="btn-retry">
        Intentar de nuevo
      </button>
    </div>
    <div v-else-if="pedido" class="pedido-detalle">
      <div class="header">
        <h1>Detalles del Pedido #{{ pedido.id }}</h1>
        <div class="estado-container">
          <span :class="['estado', pedido.estado_pedido]">
            {{ getEstadoPedido(pedido) }}
          </span>
          <span :class="['estado-pago', pedido.estado_pago]">
            {{ getEstadoPago(pedido) }}
          </span>
        </div>
      </div>

      <div v-if="pedido.estado_pedido === 'cancelado'" class="mensaje-cancelado">
        <i class="fas fa-times-circle"></i>
        <p>Cancelaste este pedido</p>
      </div>

      <div class="info-section">
        <h2>Información del Pedido</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Fecha del Pedido:</label>
            <span>{{ formatDate(pedido.fecha_pedido) }}</span>
          </div>
          <div class="info-item">
            <label>Total:</label>
            <span>${{ pedido.total }}</span>
          </div>
          <div class="info-item">
            <label>Cantidad:</label>
            <span>{{ pedido.cantidad }}</span>
          </div>
        </div>
      </div>

      <div class="producto-section">
        <h2>Detalles del Producto</h2>
        <div class="producto-info">
          <h3>{{ pedido.nombre_producto }}</h3>
          <div class="detalles-grid">
            <div class="detalle-item">
              <label>Color Principal:</label>
              <span>{{ pedido.color_principal }}</span>
            </div>
            <div class="detalle-item">
              <label>Color Secundario:</label>
              <span>{{ pedido.color_secundario }}</span>
            </div>
            <div class="detalle-item">
              <label>Color Terciario:</label>
              <span>{{ pedido.color_terciario }}</span>
            </div>
            <div class="detalle-item">
              <label>Tipo de Tejido:</label>
              <span>{{ pedido.tipo_tejido }}</span>
            </div>
            <div class="detalle-item">
              <label>Tamaño:</label>
              <span>{{ pedido.tamanio }}</span>
            </div>
            <div class="detalle-item" v-if="pedido.accesorios">
              <label>Accesorios:</label>
              <span>{{ pedido.accesorios }}</span>
            </div>
            <div class="detalle-item" v-if="pedido.notas">
              <label>Notas:</label>
              <span>{{ pedido.notas }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cliente-section">
        <h2>Información del Cliente</h2>
        <div class="cliente-info">
          <div class="info-item">
            <label>Nombre:</label>
            <span>{{ pedido.nombre_cliente }}</span>
          </div>
          <div class="info-item">
            <label>Correo:</label>
            <span>{{ pedido.correo_cliente }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="volver" class="btn-volver">
          Volver a Pedidos
        </button>
        <button 
          v-if="pedido.estado_pedido === 'pendiente' && pedido.pago_id"
          @click="confirmarCancelacion"
          class="btn-cancelar"
        >
          Cancelar Pedido
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'DetallePedido',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const pedido = ref(null)
    const loading = ref(true)
    const error = ref(null)

    const cargarDetalles = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get(`http://localhost:3000/api/pedidos/${route.params.id}`)
        pedido.value = response.data
      } catch (err) {
        console.error('Error:', err)
        if (err.response?.status === 401) {
          authStore.logout()
          router.push('/login')
        } else if (err.response?.status === 404) {
          error.value = 'Pedido no encontrado'
        } else {
          error.value = 'Error al cargar los detalles del pedido. Por favor, intente de nuevo.'
        }
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    }

    const volver = () => {
      router.push('/pedidos')
    }

    const confirmarCancelacion = () => {
      if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
        cancelarPedido()
      }
    }

    const cancelarPedido = async () => {
      try {
        await axios.post('http://localhost:3000/api/pedidos/pago/cancelar', 
          { pago_id: pedido.value.pago_id },
          {
            headers: {
              'Authorization': `Basic ${btoa(`${authStore.user.correo}:${authStore.user.token}`)}`
            }
          }
        );
        await cargarDetalles();
        alert('Pedido cancelado exitosamente');
      } catch (error) {
        console.error('Error al cancelar pedido:', error);
        if (error.response?.status === 401) {
          authStore.logout();
          router.push('/login');
        } else {
          alert('Error al cancelar el pedido. Por favor, intente nuevamente.');
        }
      }
    }

    const getEstadoPedido = (pedido) => {
      switch (pedido.estado_pedido) {
        case 'pendiente':
          return 'Pendiente'
        case 'en_proceso':
          return 'En Proceso'
        case 'enviado':
          return 'Enviado'
        case 'entregado':
          return 'Entregado'
        case 'cancelado':
          return 'Cancelado'
        default:
          return pedido.estado_pedido
      }
    }

    const getEstadoPago = (pedido) => {
      return pedido.estado_pago === 'pagado' ? 'Pedido Pagado' : 'Pago Pendiente'
    }

    onMounted(cargarDetalles)

    return {
      pedido,
      loading,
      error,
      cargarDetalles,
      formatDate,
      volver,
      confirmarCancelacion,
      getEstadoPedido,
      getEstadoPago
    }
  }
}
</script>

<style scoped>
.detalle-pedido-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error {
  color: #dc3545;
}

.btn-retry {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pedido-detalle {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.estado {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.estado.pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.estado.en_proceso {
  background-color: #cce5ff;
  color: #004085;
}

.estado.completado {
  background-color: #d4edda;
  color: #155724;
}

.estado.cancelado {
  background-color: #f8d7da;
  color: #721c24;
}

.estado-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
}

.estado-pago {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
}

.estado-pago.pagado {
  background-color: #d1e7dd;
  color: #0f5132;
}

.estado-pago.pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.mensaje-cancelado {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mensaje-cancelado i {
  font-size: 1.5rem;
}

.mensaje-cancelado p {
  margin: 0;
  font-weight: 500;
}

.info-section, .producto-section, .cliente-section {
  margin-bottom: 30px;
}

h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.info-grid, .detalles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item, .detalle-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  color: #666;
  font-size: 0.9em;
}

span {
  color: #333;
  font-weight: 500;
}

.producto-info h3 {
  margin-bottom: 15px;
  color: #333;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-volver, .btn-cancelar {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-volver {
  background-color: #6c757d;
  color: white;
}

.btn-volver:hover {
  background-color: #5a6268;
}

.btn-cancelar {
  background-color: #dc3545;
  color: white;
}

.btn-cancelar:hover {
  background-color: #c82333;
}
</style> 