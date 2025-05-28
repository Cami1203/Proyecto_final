<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>Mi Perfil</h1>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Cargando información...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchUserData" class="btn-retry">
        Intentar de nuevo
      </button>
    </div>

    <div v-else class="profile-content">
      <div class="profile-section">
        <div class="section-header">
          <h2><i class="fas fa-user-circle"></i> Información Personal</h2>
          <div class="header-actions">
            <button 
              @click="toggleEditMode" 
              class="btn-edit"
              :class="{ 'editing': isEditing }"
            >
              <i :class="isEditing ? 'fas fa-times' : 'fas fa-edit'"></i>
              {{ isEditing ? 'Cancelar' : 'Editar' }}
            </button>
            <button @click="logout" class="btn-logout">
              <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
        </div>

        <form v-if="isEditing" @submit.prevent="updateProfile" class="profile-form">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input 
              type="text" 
              id="nombre" 
              v-model="formData.nombre" 
              required
            >
          </div>

          <div class="form-group">
            <label for="apellido">Apellido</label>
            <input 
              type="text" 
              id="apellido" 
              v-model="formData.apellido" 
              required
            >
          </div>

          <div class="form-group">
            <label for="correo">Correo Electrónico</label>
            <input 
              type="email" 
              id="correo" 
              v-model="formData.correo" 
              required
              disabled
            >
          </div>

          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input 
              type="tel" 
              id="telefono" 
              v-model="formData.telefono" 
              required
            >
          </div>

          <div class="form-group">
            <label for="direccion">Dirección</label>
            <input 
              type="text" 
              id="direccion" 
              v-model="formData.direccion" 
              required
            >
          </div>

          <div class="form-group">
            <label for="departamento">Departamento</label>
            <input 
              type="text" 
              id="departamento" 
              v-model="formData.departamento" 
              required
            >
          </div>

          <div class="form-group">
            <label for="ciudad">Ciudad</label>
            <input 
              type="text" 
              id="ciudad" 
              v-model="formData.ciudad" 
              required
            >
          </div>

          <div class="form-group">
            <label for="codigo_postal">Código Postal</label>
            <input 
              type="text" 
              id="codigo_postal" 
              v-model="formData.codigo_postal" 
              required
            >
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>

        <div v-else class="profile-info">
          <div class="info-card">
            <div class="info-header">
              <i class="fas fa-user"></i>
              <h3>Datos Personales</h3>
            </div>
            <div class="info-content">
          <div class="info-group">
                <label><i class="fas fa-user-tag"></i> Nombre</label>
                <p>{{ userData?.nombre || 'No disponible' }}</p>
          </div>
          <div class="info-group">
                <label><i class="fas fa-user-tag"></i> Apellido</label>
                <p>{{ userData?.apellido || 'No disponible' }}</p>
          </div>
          <div class="info-group">
                <label><i class="fas fa-envelope"></i> Correo Electrónico</label>
                <p>{{ userData?.correo || 'No disponible' }}</p>
          </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <i class="fas fa-map-marker-alt"></i>
              <h3>Información de Contacto</h3>
            </div>
            <div class="info-content">
          <div class="info-group">
                <label><i class="fas fa-phone"></i> Teléfono</label>
                <p>{{ userData?.telefono || 'No disponible' }}</p>
          </div>
          <div class="info-group">
                <label><i class="fas fa-home"></i> Dirección</label>
                <p>{{ userData?.direccion || 'No disponible' }}</p>
          </div>
          <div class="info-group">
                <label><i class="fas fa-map"></i> Departamento</label>
                <p>{{ userData?.departamento || 'No disponible' }}</p>
          </div>
          <div class="info-group">
                <label><i class="fas fa-city"></i> Ciudad</label>
                <p>{{ userData?.ciudad || 'No disponible' }}</p>
          </div>
          <div class="info-group">
                <label><i class="fas fa-mail-bulk"></i> Código Postal</label>
                <p>{{ userData?.codigo_postal || 'No disponible' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <div class="section-header">
          <h2><i class="fas fa-lock"></i> Seguridad</h2>
          <button 
            @click="togglePasswordForm" 
            class="btn-password"
            :class="{ 'active': showPasswordForm }"
          >
            <i class="fas fa-key"></i>
            {{ showPasswordForm ? 'Ocultar' : 'Cambiar Contraseña' }}
          </button>
        </div>

        <transition name="slide-fade">
          <form v-if="showPasswordForm" @submit.prevent="changePassword" class="password-form">
          <div class="form-group">
            <label for="currentPassword">Contraseña Actual</label>
            <div class="password-input">
              <input 
                :type="showCurrentPassword ? 'text' : 'password'" 
                id="currentPassword" 
                v-model="passwordData.currentPassword" 
                required
              >
              <button 
                type="button" 
                class="btn-toggle-password"
                @click="togglePassword('current')"
              >
                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">Nueva Contraseña</label>
            <div class="password-input">
              <input 
                :type="showNewPassword ? 'text' : 'password'" 
                id="newPassword" 
                v-model="passwordData.newPassword" 
                required
              >
              <button 
                type="button" 
                class="btn-toggle-password"
                @click="togglePassword('new')"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar Nueva Contraseña</label>
            <div class="password-input">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                v-model="passwordData.confirmPassword" 
                required
              >
              <button 
                type="button" 
                class="btn-toggle-password"
                @click="togglePassword('confirm')"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" :disabled="changingPassword">
              {{ changingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </div>
        </form>
        </transition>
      </div>

      <div class="profile-section">
        <div class="section-header">
          <h2><i class="fas fa-shopping-bag"></i> Historial de Compras</h2>
          <router-link to="/pedidos" class="btn-view-all">
            <i class="fas fa-list"></i> Ver Todos los Pedidos
          </router-link>
        </div>
        <div class="recent-orders">
          <div v-if="recentOrders.length === 0" class="no-orders">
            <p>Aún no has realizado ningún pedido</p>
            <router-link to="/productos" class="btn-shop">
              Comenzar a Comprar
            </router-link>
          </div>
          <div v-else class="orders-list">
            <div v-for="order in recentOrders" :key="order.id" class="order-card">
              <div class="order-header">
                <h3>Pedido #{{ order.id }}</h3>
                <span class="order-date">{{ formatDate(order.fecha_pedido) }}</span>
              </div>
              <div class="order-details">
                <p class="product-name">{{ order.nombre_producto }}</p>
                <p class="order-total">Total: ${{ formatPrice(order.total) }}</p>
                <span class="order-status" :class="order.estado_pedido">
                  {{ formatStatus(order.estado_pedido) }}
                </span>
              </div>
              <router-link 
                :to="{ name: 'detalle-pedido', params: { id: order.id }}" 
                class="btn-details"
              >
                Ver Detalles
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <div class="section-header">
          <h2><i class="fas fa-search"></i> Buscar Pedido</h2>
        </div>
        <div class="buscar-pedido">
          <div class="input-group">
            <input 
              type="number" 
              v-model="pedidoId" 
              placeholder="Ingrese el ID del pedido"
              class="form-control"
            >
            <button 
              @click="buscarPedido" 
              class="btn-buscar"
              :disabled="!pedidoId"
            >
              Buscar
            </button>
          </div>

          <div v-if="loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Buscando pedido...
          </div>

          <div v-else-if="error" class="error">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
          </div>

          <div v-else-if="pedidoEncontrado" class="pedido-info">
            <div v-if="pedidoEncontrado.estado_pedido === 'cancelado'" class="pedido-cancelado">
              <i class="fas fa-times-circle"></i>
              <h3>Pedido Cancelado</h3>
              <p>El pedido #{{ pedidoEncontrado.id }} fue cancelado.</p>
              <p class="fecha-cancelacion">Fecha de cancelación: {{ formatDate(pedidoEncontrado.fecha_pedido) }}</p>
            </div>
            <div v-else>
              <h3>Información del Pedido</h3>
              <div class="info-row">
                <span class="label">ID:</span>
                <span class="value">#{{ pedidoEncontrado.id }}</span>
              </div>
              <div class="info-row">
                <span class="label">Fecha:</span>
                <span class="value">{{ formatDate(pedidoEncontrado.fecha_pedido) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Valor:</span>
                <span class="value">${{ formatNumber(pedidoEncontrado.total) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Etapa:</span>
                <span class="value">{{ pedidoEncontrado.estado_fabricacion }}</span>
              </div>
              <div class="info-row">
                <span class="label">Tipo:</span>
                <span class="value">{{ pedidoEncontrado.tipo_pedido === 'normal' ? 'Pedido Normal' : 'Pedido Personalizado' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'PerfilView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const userData = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const isEditing = ref(false)
    const saving = ref(false)
    const changingPassword = ref(false)
    const recentOrders = ref([])
    const pedidoId = ref('')
    const pedidoEncontrado = ref(null)
    const showPasswordForm = ref(false)

    const formData = ref({
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      direccion: '',
      departamento: '',
      ciudad: '',
      codigo_postal: ''
    })

    const passwordData = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const showCurrentPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const fetchUserData = async () => {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          error.value = 'No se encontró token de autenticación. Por favor, inicia sesión de nuevo.'
          router.push('/login')
          return
        }

        const response = await axios.get(`${API_URL}/clientes/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        userData.value = response.data
        formData.value = { ...response.data }
      } catch (err) {
        console.error('Error fetching user data:', err)
        if (err.response?.status === 401) {
          error.value = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
          localStorage.clear()
          router.push('/login')
        } else {
          error.value = 'Error al cargar la información del usuario. Por favor, intenta de nuevo.'
        }
      } finally {
        loading.value = false
      }
    }

    const fetchRecentOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const response = await axios.get(`${API_URL}/pedidos/mis-pedidos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        recentOrders.value = response.data.slice(0, 3) // Mostrar solo los 3 pedidos más recientes
      } catch (err) {
        console.error('Error fetching recent orders:', err)
      }
    }

    const updateProfile = async () => {
      saving.value = true
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        await axios.put(`${API_URL}/clientes/${userData.value.id}`, formData.value, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        await fetchUserData()
        isEditing.value = false
        alert('Perfil actualizado correctamente')
      } catch (err) {
        console.error('Error updating profile:', err)
        alert('Error al actualizar el perfil. Por favor, intenta de nuevo.')
      } finally {
        saving.value = false
      }
    }

    const changePassword = async () => {
      if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        alert('Las contraseñas no coinciden')
        return
      }

      changingPassword.value = true
      try {
        await axios.put(`${API_URL}/cambiar-password`, {
          correo: userData.value.correo,
          contraseña_actual: passwordData.value.currentPassword,
          nueva_contraseña: passwordData.value.newPassword
        })
        passwordData.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        alert('Contraseña actualizada correctamente')
      } catch (err) {
        console.error('Error changing password:', err)
        alert('Error al cambiar la contraseña. Por favor, verifica tu contraseña actual.')
      } finally {
        changingPassword.value = false
      }
    }

    const toggleEditMode = () => {
      isEditing.value = !isEditing.value
      if (!isEditing.value) {
        formData.value = { ...userData.value }
      }
    }

    const togglePassword = (type) => {
      switch (type) {
        case 'current':
          showCurrentPassword.value = !showCurrentPassword.value
          break
        case 'new':
          showNewPassword.value = !showNewPassword.value
          break
        case 'confirm':
          showConfirmPassword.value = !showConfirmPassword.value
          break
      }
    }

    const togglePasswordForm = () => {
      showPasswordForm.value = !showPasswordForm.value
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatPrice = (price) => {
      return price.toLocaleString('es-CO')
    }

    const formatNumber = (value) => {
      if (value === null || value === undefined) return '0.00'
      const num = parseFloat(value)
      return isNaN(num) ? '0.00' : num.toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const formatStatus = (status) => {
      const statusMap = {
        'pendiente': 'Pendiente',
        'en_proceso': 'En Proceso',
        'enviado': 'Enviado',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
      }
      return statusMap[status] || status
    }

    const logout = () => {
      const authStore = useAuthStore()
      authStore.logout()
    }

    const buscarPedido = async () => {
      if (!pedidoId.value) return

      loading.value = true
      error.value = null
      pedidoEncontrado.value = null

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          error.value = 'No se encontró token de autenticación. Por favor, inicia sesión de nuevo.'
          router.push('/login')
          return
        }

        const response = await axios.get(`${API_URL}/pedidos/buscar/${pedidoId.value}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        pedidoEncontrado.value = response.data
      } catch (error) {
        console.error('Error al buscar pedido:', error)
        if (error.response?.status === 404) {
          error.value = 'No se encontró ningún pedido con ese ID'
        } else {
          error.value = 'Error al buscar el pedido. Por favor, intente de nuevo.'
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUserData()
      fetchRecentOrders()
    })

    return {
      userData,
      loading,
      error,
      isEditing,
      saving,
      changingPassword,
      formData,
      passwordData,
      recentOrders,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      showPasswordForm,
      fetchUserData,
      updateProfile,
      changePassword,
      toggleEditMode,
      togglePassword,
      togglePasswordForm,
      formatDate,
      formatPrice,
      formatNumber,
      formatStatus,
      logout,
      pedidoId,
      pedidoEncontrado,
      buscarPedido
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

.profile-header {
  margin-bottom: 2rem;
  text-align: center;
  animation: fadeInDown 0.5s ease-out;
}

.profile-header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.profile-content {
  display: grid;
  gap: 2rem;
}

.profile-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  transition: transform 0.3s ease;
  animation: fadeIn 0.5s ease-out;
}

.profile-section:hover {
  transform: translateY(-5px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-header h2 i {
  color: #ff6b6b;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.info-header {
  background: #f8f9fa;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #eee;
}

.info-header i {
  color: #ff6b6b;
  font-size: 1.2rem;
}

.info-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.info-content {
  padding: 1.5rem;
}

.info-group {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.info-group:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-group label {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-group label i {
  color: #ff6b6b;
}

.info-group p {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
}

.btn-password {
  padding: 0.75rem 1.5rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-password:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.btn-password.active {
  background: #dc3545;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading i, .error i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading i {
  color: #ff6b6b;
}

.error i {
  color: #dc3545;
}

.btn-retry {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-retry:hover {
  background-color: #ff5252;
}

.profile-form, .password-form {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #666;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.btn-toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.form-actions {
  margin-top: 1rem;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-save:hover {
  background-color: #ff5252;
}

.btn-save:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.recent-orders {
  margin-top: 1rem;
}

.no-orders {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.btn-shop {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ff6b6b;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.btn-shop:hover {
  background-color: #ff5252;
}

.orders-list {
  display: grid;
  gap: 1rem;
}

.order-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.order-header h3 {
  margin: 0;
  color: #333;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.order-details {
  margin-bottom: 1rem;
}

.product-name {
  margin: 0.5rem 0;
  color: #333;
}

.order-total {
  margin: 0.5rem 0;
  color: #ff6b6b;
  font-weight: bold;
}

.order-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.order-status.pendiente {
  background: #fff3cd;
  color: #856404;
}

.order-status.en_proceso {
  background: #cce5ff;
  color: #004085;
}

.order-status.enviado {
  background: #d4edda;
  color: #155724;
}

.order-status.entregado {
  background: #d1e7dd;
  color: #0f5132;
}

.order-status.cancelado {
  background: #f8d7da;
  color: #721c24;
}

.btn-details {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #6c757d;
  color: #6c757d;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-details:hover {
  background: #6c757d;
  color: white;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background: #d32f2f;
}

.buscar-pedido {
  margin-top: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.form-control {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn-buscar {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-buscar:hover {
  background-color: #0056b3;
}

.btn-buscar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
  margin-top: 10px;
}

.pedido-info {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 20px;
  margin-top: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.label {
  font-weight: bold;
  width: 100px;
  color: #666;
}

.value {
  flex: 1;
  color: #333;
}

.pedido-cancelado {
  text-align: center;
  padding: 2rem;
  background: #fff3f3;
  border-radius: 12px;
  border: 1px solid #ffcdd2;
  margin-top: 1rem;
}

.pedido-cancelado i {
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 1rem;
}

.pedido-cancelado h3 {
  color: #d32f2f;
  margin: 0.5rem 0;
  font-size: 1.5rem;
}

.pedido-cancelado p {
  color: #666;
  margin: 0.5rem 0;
}

.fecha-cancelacion {
  font-size: 0.9rem;
  color: #888;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-section {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .btn-view-all {
    width: 100%;
    text-align: center;
  }
}
</style> 