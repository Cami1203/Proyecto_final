<template>
  <div class="admin-administradores">
    <NoDisponible v-if="!isMainAdmin" />
    <div v-else>
    <div class="header-actions">
      <h1>Gestión de Administradores</h1>
      <button class="btn-primary" @click="mostrarModalAgregar">
        <i class="fas fa-plus"></i> Nuevo Administrador
      </button>
    </div>

    <!-- Tabla de Administradores -->
    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Fecha de Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in administradores" :key="admin.id">
            <td>{{ admin.id }}</td>
            <td>{{ admin.nombre }}</td>
            <td>{{ admin.correo }}</td>
            <td>{{ formatDate(admin.fecha_creacion) }}</td>
            <td class="acciones">
              <button class="btn-accion" @click="editarAdmin(admin)" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-accion" @click="cambiarPassword(admin)" title="Cambiar Contraseña">
                <i class="fas fa-key"></i>
              </button>
              <button 
                class="btn-accion btn-danger" 
                @click="confirmarEliminar(admin)"
                :disabled="admin.id === adminActual.id"
                :title="admin.id === adminActual.id ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Agregar/Editar Administrador -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>{{ esEdicion ? 'Editar Administrador' : 'Nuevo Administrador' }}</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarAdmin" class="admin-form">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input 
                type="text" 
                id="nombre" 
                v-model="formData.nombre" 
                required
                :class="{ 'error': errores.nombre }"
              >
              <span class="error-message" v-if="errores.nombre">{{ errores.nombre }}</span>
            </div>

            <div class="form-group">
              <label for="correo">Correo Electrónico</label>
              <input 
                type="email" 
                id="correo" 
                v-model="formData.correo" 
                required
                :class="{ 'error': errores.correo }"
                :disabled="esEdicion"
              >
              <span class="error-message" v-if="errores.correo">{{ errores.correo }}</span>
            </div>

            <div class="form-group" v-if="!esEdicion">
              <label for="password">Contraseña</label>
              <div class="password-input">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="formData.password" 
                  required
                  :class="{ 'error': errores.password }"
                >
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="togglePassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span class="error-message" v-if="errores.password">{{ errores.password }}</span>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal para Cambiar Contraseña -->
    <div v-if="mostrarModalPassword" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>Cambiar Contraseña</h2>
          <button @click="cerrarModalPassword" class="btn-cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="actualizarPassword" class="admin-form">
            <div class="form-group">
              <label for="nuevaPassword">Nueva Contraseña</label>
              <div class="password-input">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="nuevaPassword" 
                  v-model="passwordData.nueva" 
                  required
                  :class="{ 'error': erroresPassword.nueva }"
                >
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="togglePassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span class="error-message" v-if="erroresPassword.nueva">{{ erroresPassword.nueva }}</span>
            </div>

            <div class="form-group">
              <label for="confirmarPassword">Confirmar Contraseña</label>
              <div class="password-input">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="confirmarPassword" 
                  v-model="passwordData.confirmar" 
                  required
                  :class="{ 'error': erroresPassword.confirmar }"
                >
              </div>
              <span class="error-message" v-if="erroresPassword.confirmar">{{ erroresPassword.confirmar }}</span>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="cerrarModalPassword">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Actualizando...' : 'Actualizar Contraseña' }}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import NoDisponible from '../../components/NoDisponible.vue'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'AdminAdministradores',
  components: {
    NoDisponible
  },
  setup() {
    const authStore = useAuthStore()
    const administradores = ref([])
    const loading = ref(false)
    const mostrarModal = ref(false)
    const mostrarModalPassword = ref(false)
    const esEdicion = ref(false)
    const showPassword = ref(false)
    const adminSeleccionado = ref(null)
    const adminActual = ref(authStore.user)

    const formData = reactive({
      nombre: '',
      correo: '',
      password: ''
    })

    const passwordData = reactive({
      nueva: '',
      confirmar: ''
    })

    const errores = reactive({
      nombre: '',
      correo: '',
      password: ''
    })

    const erroresPassword = reactive({
      nueva: '',
      confirmar: ''
    })

    const isMainAdmin = computed(() => {
      return authStore.user?.correo === 'admin@manillania.com'
    })

    const cargarAdministradores = async () => {
      loading.value = true
      try {
        const response = await axios.get(`${API_URL}/admin/administradores`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        administradores.value = response.data
      } catch (error) {
        console.error('Error al cargar administradores:', error)
        alert('Error al cargar la lista de administradores')
      } finally {
        loading.value = false
      }
    }

    const mostrarModalAgregar = () => {
      esEdicion.value = false
      resetForm()
      mostrarModal.value = true
    }

    const editarAdmin = (admin) => {
      esEdicion.value = true
      adminSeleccionado.value = admin
      Object.assign(formData, {
        nombre: admin.nombre,
        correo: admin.correo
      })
      mostrarModal.value = true
    }

    const cambiarPassword = (admin) => {
      adminSeleccionado.value = admin
      resetPasswordForm()
      mostrarModalPassword.value = true
    }

    const confirmarEliminar = (admin) => {
      if (admin.id === adminActual.value.id) {
        alert('No puedes eliminar tu propia cuenta')
        return
      }
      if (confirm(`¿Estás seguro de que deseas eliminar al administrador ${admin.nombre}?`)) {
        eliminarAdmin(admin.id)
      }
    }

    const eliminarAdmin = async (id) => {
      loading.value = true
      try {
        await axios.delete(`${API_URL}/admin/administradores/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        alert('Administrador eliminado correctamente')
        await cargarAdministradores()
      } catch (error) {
        console.error('Error al eliminar administrador:', error)
        alert('Error al eliminar el administrador')
      } finally {
        loading.value = false
      }
    }

    const guardarAdmin = async () => {
      if (!validarFormulario()) return

      loading.value = true
      try {
        const adminData = {
          nombre: formData.nombre,
          correo: formData.correo,
          contraseña: formData.password
        }

        if (esEdicion.value) {
          await axios.put(`${API_URL}/admin/administradores/${adminSeleccionado.value.id}`, adminData, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        } else {
          await axios.post(`${API_URL}/admin/administradores`, adminData, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        }

        await cargarAdministradores()
        cerrarModal()
      } catch (error) {
        console.error('Error al guardar administrador:', error)
        if (error.response?.data?.message) {
          errores.correo = error.response.data.message
        }
      } finally {
        loading.value = false
      }
    }

    const actualizarPassword = async () => {
      if (!validarPassword()) return

      loading.value = true
      try {
        await axios.put(
          `${API_URL}/admin/administradores/${adminSeleccionado.value.id}/password`,
          { password: passwordData.nueva },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          }
        )
        alert('Contraseña actualizada correctamente')
        cerrarModalPassword()
      } catch (error) {
        console.error('Error al actualizar contraseña:', error)
        alert('Error al actualizar la contraseña')
      } finally {
        loading.value = false
      }
    }

    const validarFormulario = () => {
      errores.nombre = ''
      errores.correo = ''
      errores.password = ''

      if (!formData.nombre.trim()) {
        errores.nombre = 'El nombre es requerido'
      }

      if (!formData.correo.trim()) {
        errores.correo = 'El correo es requerido'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
        errores.correo = 'El correo no es válido'
      }

      if (!esEdicion.value && !formData.password) {
        errores.password = 'La contraseña es requerida'
      }

      return !errores.nombre && !errores.correo && !errores.password
    }

    const validarPassword = () => {
      let isValid = true
      erroresPassword.nueva = ''
      erroresPassword.confirmar = ''

      if (!passwordData.nueva) {
        erroresPassword.nueva = 'La nueva contraseña es requerida'
        isValid = false
      } else if (passwordData.nueva.length < 6) {
        erroresPassword.nueva = 'La contraseña debe tener al menos 6 caracteres'
        isValid = false
      }

      if (!passwordData.confirmar) {
        erroresPassword.confirmar = 'Confirma la contraseña'
        isValid = false
      } else if (passwordData.nueva !== passwordData.confirmar) {
        erroresPassword.confirmar = 'Las contraseñas no coinciden'
        isValid = false
      }

      return isValid
    }

    const resetForm = () => {
      Object.assign(formData, {
        nombre: '',
        correo: '',
        password: ''
      })
      Object.keys(errores).forEach(key => {
        errores[key] = ''
      })
    }

    const resetPasswordForm = () => {
      Object.assign(passwordData, {
        nueva: '',
        confirmar: ''
      })
      Object.keys(erroresPassword).forEach(key => {
        erroresPassword[key] = ''
      })
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      resetForm()
    }

    const cerrarModalPassword = () => {
      mostrarModalPassword.value = false
      resetPasswordForm()
    }

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(cargarAdministradores)

    return {
      administradores,
      loading,
      mostrarModal,
      mostrarModalPassword,
      esEdicion,
      showPassword,
      formData,
      passwordData,
      errores,
      erroresPassword,
      adminActual,
      mostrarModalAgregar,
      editarAdmin,
      cambiarPassword,
      confirmarEliminar,
      guardarAdmin,
      actualizarPassword,
      cerrarModal,
      cerrarModalPassword,
      togglePassword,
      formatDate,
      isMainAdmin
    }
  }
}
</script>

<style scoped>
.admin-administradores {
  padding: 1rem;
  min-height: calc(100vh - 64px); /* Ajustar según el tamaño de tu header */
  display: flex;
  flex-direction: column;
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

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-danger:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.btn-accion.btn-danger:hover {
  color: #e74c3c;
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

.admin-form {
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

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .btn-primary {
    justify-content: center;
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