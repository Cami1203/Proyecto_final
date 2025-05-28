<template>
  <div class="pedidos-container">
    <h1>Mis Pedidos</h1>
    
    <div class="pedidos-controls">
      <button 
        @click="toggleMostrarCancelados" 
        class="btn-toggle-cancelados"
        :class="{ 'active': mostrarCancelados }"
      >
        {{ mostrarCancelados ? 'Ocultar Pedidos Cancelados' : 'Mostrar Pedidos Cancelados' }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando pedidos...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="cargarPedidos" class="btn-retry">
        Intentar de nuevo
      </button>
    </div>

    <div v-else-if="pedidosFiltrados.length === 0" class="no-pedidos">
      <p>No tienes pedidos realizados para este usuario.</p>
      <p v-if="!loading">Verifica que hayas realizado pedidos con esta cuenta.</p>
    </div>

    <div v-else class="pedidos-grid">
      <div v-for="pedido in pedidosFiltrados" :key="pedido.id" class="pedido-card">
        <div class="pedido-header">
          <h3>{{ pedido.nombre_producto }}</h3>
          <span :class="['estado', (pedido.estado_pedido || pedido.estado)]">
            {{ pedido.estado_pedido || pedido.estado }}
          </span>
        </div>
        <div class="pedido-info">
          <p><strong>Referencia:</strong> #{{ pedido.id }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(pedido.fecha_pedido) }}</p>
          <p><strong>Cantidad:</strong> {{ pedido.cantidad }}</p>
          <p><strong>Total:</strong> ${{ pedido.total }}</p>
        </div>
        <div class="pedido-actions">
          <button 
            v-if="(pedido.estado_pedido || pedido.estado) !== 'cancelado' && pedido.estado_pago !== 'pagado'"
            @click="procesarPago(pedido.id, pedido.tipo_pedido)" 
            class="btn-pagar"
          >
            Pagar
          </button>
          <button 
            v-if="(pedido.estado_pedido || pedido.estado) === 'pendiente'"
            @click="confirmarCancelacion(pedido.id, pedido.pago_id)"
            class="btn-cancelar"
          >
            Cancelar Pedido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Pedidos',
  setup() {
    const pedidos = ref([])
    const router = useRouter()
    const authStore = useAuthStore()
    const loading = ref(true)
    const error = ref(null)
    const mostrarCancelados = ref(false)

    // Computed property para filtrar pedidos
    const pedidosFiltrados = computed(() => {
      if (mostrarCancelados.value) {
        return pedidos.value
      }
      return pedidos.value.filter(pedido => 
        (pedido.estado_pedido || pedido.estado) !== 'cancelado'
      )
    })

    const toggleMostrarCancelados = () => {
      mostrarCancelados.value = !mostrarCancelados.value
    }

    const cargarPedidos = async () => {
      loading.value = true
      error.value = null
      try {
        console.log('Iniciando carga de pedidos...');
        const response = await axios.get('http://localhost:3000/api/pedidos/mis-pedidos', {
          headers: {
            'Authorization': `Basic ${btoa(`${authStore.user.correo}:${authStore.user.token}`)}`
          }
        })
        console.log('Respuesta completa de pedidos:', response.data)
        
        // Separar y contar los tipos de pedidos
        const pedidosNormales = response.data.filter(p => p.tipo_pedido === 'normal')
        const pedidosPersonalizados = response.data.filter(p => p.tipo_pedido === 'personalizado')
        
        console.log('Pedidos normales:', pedidosNormales.length, pedidosNormales)
        console.log('Pedidos personalizados:', pedidosPersonalizados.length, pedidosPersonalizados)
        
        if (pedidosPersonalizados.length > 0) {
          console.log('Detalles del primer pedido personalizado:', {
            id: pedidosPersonalizados[0].id,
            nombre_producto: pedidosPersonalizados[0].nombre_producto,
            estado_pago: pedidosPersonalizados[0].estado_pago,
            pago_id: pedidosPersonalizados[0].pago_id,
            fecha_pedido: pedidosPersonalizados[0].fecha_pedido
          })
        }
        
        pedidos.value = response.data
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
        if (error.response?.status === 401) {
          authStore.logout()
          router.push('/login')
        } else {
          error.value = 'Error al cargar los pedidos. Por favor, intente de nuevo.'
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

    const viewOrderDetails = (orderId) => {
      router.push(`/pedidos/${orderId}`)
    }

    const procesarPago = async (pedidoId, tipoPedido) => {
      try {
        console.log('Iniciando proceso de pago:', { pedidoId, tipoPedido })
        
        const url = tipoPedido === 'personalizado' 
          ? `http://localhost:3000/api/pedidos/pago/procesar-personalizado/${pedidoId}`
          : `http://localhost:3000/api/pedidos/pago/procesar/${pedidoId}`;

        console.log('URL de pago:', url)
        console.log('Headers:', {
          'Authorization': `Basic ${btoa(`${authStore.user.correo}:${authStore.user.token}`)}`
        })

        const response = await axios.post(url, {}, {
          headers: {
            'Authorization': `Basic ${btoa(`${authStore.user.correo}:${authStore.user.token}`)}`
          }
        });
        
        console.log('Respuesta del servidor:', response.data)
        alert('Su pago fue exitoso');
        await cargarPedidos();
      } catch (error) {
        console.error('Error al procesar el pago:', error)
        console.error('Detalles del error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
        alert(error.response?.data?.message || 'Error al procesar el pago. Por favor, intente de nuevo.');
      }
    }

    const confirmarCancelacion = (orderId, pagoId) => {
      if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
        cancelOrder(orderId, pagoId)
      }
    }

    const cancelOrder = async (orderId, pagoId) => {
      try {
        if (!pagoId) {
          alert('Error: No se pudo obtener el ID del pago');
          return;
        }

        await axios.post('http://localhost:3000/api/pedidos/pago/cancelar', 
          { pago_id: pagoId },
          {
            headers: {
              'Authorization': `Basic ${btoa(`${authStore.user.correo}:${authStore.user.token}`)}`
            }
          }
        );
        await cargarPedidos();
        alert('Pedido cancelado exitosamente');
      } catch (error) {
        console.error('Error al cancelar pedido:', error);
        if (error.response?.status === 401) {
          authStore.logout();
          router.push('/login');
        } else if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert('Error al cancelar el pedido. Por favor, intente nuevamente.');
        }
      }
    }

    onMounted(cargarPedidos)

    return {
      pedidos,
      pedidosFiltrados,
      loading,
      error,
      mostrarCancelados,
      toggleMostrarCancelados,
      formatDate,
      viewOrderDetails,
      procesarPago,
      confirmarCancelacion
    }
  }
}
</script>

<style scoped>
.pedidos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error, .no-pedidos {
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

.pedidos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.pedido-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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

.pedido-info {
  margin-bottom: 15px;
}

.pedido-info p {
  margin: 5px 0;
}

.pedido-actions {
  display: flex;
  gap: 10px;
}

.btn-ver, .btn-cancelar {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-ver {
  background-color: #007bff;
  color: white;
}

.btn-ver:hover {
  background-color: #0056b3;
}

.btn-cancelar {
  background-color: #dc3545;
  color: white;
}

.btn-cancelar:hover {
  background-color: #c82333;
}

.btn-pagar {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-pagar:hover {
  background-color: #218838;
}

.pedidos-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.btn-toggle-cancelados {
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-toggle-cancelados:hover {
  background-color: #e9ecef;
}

.btn-toggle-cancelados.active {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}
</style> 