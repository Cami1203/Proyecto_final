<template>
  <div class="empleados">
    <NoDisponible v-if="!isMainAdmin" />
    <div v-else>
    <h1>Gestión de Empleados</h1>

    <div class="actions-bar">
      <button class="btn-primary" @click="showForm = true">
        <i class="fas fa-plus"></i> Nuevo Empleado
      </button>
    </div>

    <!-- Formulario para nuevo/editar empleado -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ form.id ? 'Editar Empleado' : 'Nuevo Empleado' }}</h2>
          <button class="close-btn" @click="closeForm">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="empleado-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre *</label>
              <input 
                type="text" 
                id="nombre" 
                v-model="form.nombre" 
                required
                placeholder="Nombre del empleado"
              >
            </div>

            <div class="form-group">
              <label for="apellido">Apellido *</label>
              <input 
                type="text" 
                id="apellido" 
                v-model="form.apellido" 
                required
                placeholder="Apellido del empleado"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="correo">Correo Electrónico *</label>
              <input 
                type="email" 
                id="correo" 
                v-model="form.correo" 
                required
                placeholder="correo@ejemplo.com"
              >
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input 
                type="tel" 
                id="telefono" 
                v-model="form.telefono"
                placeholder="Número de teléfono"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="documento_identidad">Documento de Identidad *</label>
            <input 
              type="text" 
              id="documento_identidad" 
              v-model="form.documento_identidad" 
              required
              placeholder="Número de documento"
            >
          </div>

          <div class="form-group">
            <label for="direccion">Dirección *</label>
            <textarea 
              id="direccion" 
              v-model="form.direccion" 
              required
              placeholder="Dirección completa"
              rows="2"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="fecha_inicio">Fecha de Inicio {{ !form.id ? '*' : '' }}</label>
              <input 
                type="date" 
                id="fecha_inicio" 
                v-model="form.fecha_inicio" 
                :required="!form.id"
                :max="form.fecha_fin || undefined"
                :disabled="!!form.id"
              >
            </div>

            <div class="form-group">
              <label for="fecha_fin">Fecha de Finalización</label>
              <input 
                type="date" 
                id="fecha_fin" 
                v-model="form.fecha_fin"
                :min="form.fecha_inicio"
                :disabled="!form.fecha_inicio"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="rol">Rol *</label>
              <select 
                id="rol" 
                v-model="form.rol" 
                required
              >
                <option value="">Seleccione un rol</option>
                <option value="subadministrador">Subadministrador</option>
                <option value="tejedor">Tejedor</option>
                <option value="inspector_calidad">Inspector de Calidad</option>
                <option value="empaquetador">Empaquetador</option>
                <option value="domiciliario">Domiciliario</option>
              </select>
            </div>

            <div class="form-group">
              <label for="estado">Estado *</label>
              <select 
                id="estado" 
                v-model="form.estado" 
                required
              >
                <option value="">Seleccione un estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeForm">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Guardando...' : (form.id ? 'Actualizar Empleado' : 'Guardar Empleado') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla de empleados -->
    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empleado in empleados" :key="empleado.id">
            <td>{{ empleado.id }}</td>
            <td>{{ empleado.nombre }} {{ empleado.apellido }}</td>
            <td>
              <span class="role-badge" :class="empleado.rol">
                {{ formatRol(empleado.rol) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="empleado.estado">
                {{ empleado.estado === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ formatDate(empleado.fecha_inicio) }}</td>
            <td>{{ empleado.fecha_fin ? formatDate(empleado.fecha_fin) : 'N/A' }}</td>
            <td>
              <button class="btn-icon" @click="editarEmpleado(empleado)" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete" @click="eliminarEmpleado(empleado.id)" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import NoDisponible from '../../components/NoDisponible.vue'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'Empleados',
  components: { NoDisponible },
  setup() {
    const authStore = useAuthStore()
    const empleados = ref([])
    const showForm = ref(false)
    const loading = ref(false)
    const form = ref({
      id: null,
      nombre: '',
      apellido: '',
      correo: '',
      direccion: '',
      fecha_inicio: '',
      fecha_fin: null,
      rol: '',
      estado: 'activo',
      telefono: '',
      documento_identidad: ''
    })

    const isMainAdmin = computed(() => {
      return authStore.user?.correo === 'admin@manillania.com'
    })

    // Observar cambios en la fecha de inicio
    watch(() => form.value.fecha_inicio, (newFechaInicio) => {
      if (newFechaInicio && form.value.fecha_fin && newFechaInicio > form.value.fecha_fin) {
        form.value.fecha_fin = null
      }
    })

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatRol = (rol) => {
      const roles = {
        subadministrador: 'Subadministrador',
        tejedor: 'Tejedor',
        inspector_calidad: 'Inspector de Calidad',
        empaquetador: 'Empaquetador',
        domiciliario: 'Domiciliario'
      }
      return roles[rol] || rol
    }

    const fetchEmpleados = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/empleados`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        empleados.value = response.data
      } catch (error) {
        console.error('Error al cargar empleados:', error)
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        // Crear una copia del formulario para enviar
        const formData = {
          ...form.value,
          fecha_fin: form.value.fecha_fin || null // Asegurarse de que sea null si está vacío
        }

        // Si estamos editando, no enviamos la fecha de inicio
        if (form.value.id) {
          const { fecha_inicio, ...updateData } = formData
          await axios.put(`${API_URL}/admin/empleados/${form.value.id}`, updateData, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        } else {
          await axios.post(`${API_URL}/admin/empleados`, formData, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        }
        showForm.value = false
        resetForm()
        await fetchEmpleados()
      } catch (error) {
        console.error('Error al guardar empleado:', error)
        alert(error.response?.data?.error || 'Error al guardar el empleado')
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      form.value = {
        id: null,
        nombre: '',
        apellido: '',
        correo: '',
        direccion: '',
        fecha_inicio: '',
        fecha_fin: null,
        rol: '',
        estado: 'activo',
        telefono: '',
        documento_identidad: ''
      }
    }

    const closeForm = () => {
      showForm.value = false
      resetForm()
    }

    const editarEmpleado = (empleado) => {
      form.value = { ...empleado }
      showForm.value = true
    }

    const eliminarEmpleado = async (id) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) return

      try {
        await axios.delete(`${API_URL}/admin/empleados/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        await fetchEmpleados()
      } catch (error) {
        console.error('Error al eliminar empleado:', error)
      }
    }

    onMounted(fetchEmpleados)

    return {
      empleados,
      showForm,
      loading,
      form,
      formatDate,
      formatRol,
      handleSubmit,
      closeForm,
      editarEmpleado,
      eliminarEmpleado,
      isMainAdmin
    }
  }
}
</script>

<style scoped>
.empleados {
  padding: 1.5rem;
  min-height: calc(100vh - 64px); /* Ajustar según el tamaño de tu header */
  display: flex;
  flex-direction: column;
}

.actions-bar {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
}

.close-btn:hover {
  color: #333;
}

.empleado-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #6a11cb;
  box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(106, 17, 203, 0.2);
}

.btn-secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.table-container {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-badge.subadministrador {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role-badge.tejedor {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.role-badge.inspector_calidad {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.role-badge.empaquetador {
  background-color: #fff3e0;
  color: #f57c00;
}

.role-badge.domiciliario {
  background-color: #e0f7fa;
  color: #0097a7;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.activo {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactivo {
  background-color: #ffebee;
  color: #c62828;
}

.btn-icon {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.btn-icon:hover {
  color: #6a11cb;
}

.btn-icon.delete:hover {
  color: #dc3545;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style> 