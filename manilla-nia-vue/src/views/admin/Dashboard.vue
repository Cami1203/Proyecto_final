<template>
  <div class="admin-dashboard">
    <h1>Panel de Control</h1>

    <div v-if="loading" class="loading">
      Cargando información...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>Total Clientes</h3>
            <p class="stat-number">{{ stats.totalClientes || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-content">
            <h3>Pedidos Estándar</h3>
            <p class="stat-number">{{ stats.totalPedidos || 0 }}</p>
            <p class="stat-subtitle">{{ stats.pedidosPendientes || 0 }} pendientes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-paint-brush"></i>
          </div>
          <div class="stat-content">
            <h3>Pedidos Personalizados</h3>
            <p class="stat-number">{{ stats.totalPedidosPersonalizados || 0 }}</p>
            <p class="stat-subtitle">{{ stats.pedidosPersonalizadosPendientes || 0 }} pendientes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h3>Ingresos Totales</h3>
            <p class="stat-number">${{ formatNumber(stats.ingresosTotales) }}</p>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h2>Últimos Pedidos</h2>
          <div v-if="ultimosPedidos.length === 0" class="no-data">
            No hay pedidos recientes
          </div>
          <div v-else class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pedido in ultimosPedidos" :key="pedido.id">
                  <td>{{ pedido.id }}</td>
                  <td>{{ pedido.cliente_nombre || 'N/A' }}</td>
                  <td>{{ pedido.tipo || 'N/A' }}</td>
                  <td>${{ formatNumber(pedido.total) }}</td>
                  <td>
                    <span :class="['status-badge', (pedido.estado || '').toLowerCase()]">
                      {{ pedido.estado || 'N/A' }}
                    </span>
                  </td>
                  <td>{{ formatDate(pedido.fecha_pedido) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-card">
          <h2>Clientes Recientes</h2>
          <div v-if="clientesRecientes.length === 0" class="no-data">
            No hay clientes recientes
          </div>
          <div v-else class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cliente in clientesRecientes" :key="cliente.id">
                  <td>{{ `${cliente.nombre || ''} ${cliente.apellido || ''}` }}</td>
                  <td>{{ cliente.correo || 'N/A' }}</td>
                  <td>{{ formatDate(cliente.fecha_creacion) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'AdminDashboard',
  setup() {
    const authStore = useAuthStore()
    const stats = ref({
      totalClientes: 0,
      totalPedidos: 0,
      pedidosPendientes: 0,
      totalPedidosPersonalizados: 0,
      pedidosPersonalizadosPendientes: 0,
      ingresosTotales: 0
    })
    const ultimosPedidos = ref([])
    const clientesRecientes = ref([])
    const loading = ref(false)
    const error = ref(null)

    const formatNumber = (value) => {
      if (value === null || value === undefined) return '0.00'
      const num = parseFloat(value)
      return isNaN(num) ? '0.00' : num.toFixed(2)
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      try {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (e) {
        console.error('Error formatting date:', e)
        return 'Fecha inválida'
      }
    }

    const fetchDashboardData = async () => {
      loading.value = true
      error.value = null

      try {
        const [statsResponse, pedidosResponse, clientesResponse] = await Promise.all([
          axios.get(`${API_URL}/admin/dashboard/stats`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          }),
          axios.get(`${API_URL}/admin/dashboard/ultimos-pedidos`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          }),
          axios.get(`${API_URL}/admin/dashboard/clientes-recientes`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        ])

        stats.value = statsResponse.data
        ultimosPedidos.value = pedidosResponse.data
        clientesRecientes.value = clientesResponse.data
      } catch (err) {
        console.error('Error al cargar dashboard:', err)
        error.value = 'Error al cargar la información del panel de control'
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchDashboardData)

    return {
      stats,
      ultimosPedidos,
      clientesRecientes,
      loading,
      error,
      formatDate,
      formatNumber
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.admin-dashboard h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 0.5rem;
}

.admin-dashboard h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 3px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  box-shadow: 0 4px 8px rgba(106, 17, 203, 0.2);
}

.stat-icon i {
  font-size: 1.8rem;
  color: white;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
}

.stat-number {
  margin: 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.dashboard-card h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.table-container {
  overflow-x: auto;
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

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
  text-align: center;
  min-width: 100px;
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

.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    margin-right: 1rem;
  }

  .stat-icon i {
    font-size: 1.5rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}
</style> 