<template>
  <div class="productos-fabricacion">
    <h1>Productos de Fabricación</h1>

    <div class="actions-bar">
      <button class="btn-primary" @click="showForm = true">
        <i class="fas fa-plus"></i> Nuevo Producto
      </button>
    </div>

    <!-- Formulario para nuevo producto -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ form.id ? 'Editar Producto de Fabricación' : 'Nuevo Producto de Fabricación' }}</h2>
          <button class="close-btn" @click="showForm = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="product-form">
          <div class="form-group">
            <label for="nombre">Nombre del Producto *</label>
            <input 
              type="text" 
              id="nombre" 
              v-model="form.nombre" 
              required
              placeholder="Ej: Pulsera de Amistad"
            >
          </div>

          <div class="form-group">
            <label for="cantidad_hilo_cm">Cantidad de Hilo (cm) *</label>
            <input 
              type="number" 
              id="cantidad_hilo_cm" 
              v-model="form.cantidad_hilo_cm" 
              required
              min="0"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="color_principal">Color Principal</label>
              <input 
                type="text" 
                id="color_principal" 
                v-model="form.color_principal"
                placeholder="Ej: Azul"
              >
            </div>

            <div class="form-group">
              <label for="color_secundario">Color Secundario</label>
              <input 
                type="text" 
                id="color_secundario" 
                v-model="form.color_secundario"
                placeholder="Ej: Rojo"
              >
            </div>

            <div class="form-group">
              <label for="color_terciario">Color Terciario</label>
              <input 
                type="text" 
                id="color_terciario" 
                v-model="form.color_terciario"
                placeholder="Ej: Amarillo"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="tipo_nudo">Tipo de Nudo</label>
            <input 
              type="text" 
              id="tipo_nudo" 
              v-model="form.tipo_nudo"
              placeholder="Ej: Nudo Cuadrado"
            >
          </div>

          <div class="form-group">
            <label for="materiales">Materiales</label>
            <textarea 
              id="materiales" 
              v-model="form.materiales"
              placeholder="Lista de materiales separados por comas"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="costo_fabricacion">Costo de Fabricación *</label>
              <input 
                type="number" 
                id="costo_fabricacion" 
                v-model="form.costo_fabricacion" 
                required
                min="0"
                step="0.01"
              >
            </div>

            <div class="form-group">
              <label for="precio_venta">Precio de Venta *</label>
              <input 
                type="number" 
                id="precio_venta" 
                v-model="form.precio_venta" 
                required
                min="0"
                step="0.01"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="observaciones">Observaciones</label>
            <textarea 
              id="observaciones" 
              v-model="form.observaciones"
              placeholder="Notas adicionales sobre el producto"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showForm = false">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla de productos -->
    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Hilo (cm)</th>
            <th>Colores</th>
            <th>Tipo Nudo</th>
            <th>Costo</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.id">
            <td>{{ producto.id }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.cantidad_hilo_cm }}</td>
            <td>
              <div class="color-tags">
                <span v-if="producto.color_principal" class="color-tag">
                  {{ producto.color_principal }}
                </span>
                <span v-if="producto.color_secundario" class="color-tag">
                  {{ producto.color_secundario }}
                </span>
                <span v-if="producto.color_terciario" class="color-tag">
                  {{ producto.color_terciario }}
                </span>
              </div>
            </td>
            <td>{{ producto.tipo_nudo || 'N/A' }}</td>
            <td>${{ formatNumber(producto.costo_fabricacion) }}</td>
            <td>${{ formatNumber(producto.precio_venta) }}</td>
            <td>
              <button class="btn-icon" @click="editarProducto(producto)" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete" @click="eliminarProducto(producto.id)" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'ProductosFabricacion',
  setup() {
    const authStore = useAuthStore()
    const productos = ref([])
    const showForm = ref(false)
    const loading = ref(false)
    const form = ref({
      id: null,
      nombre: '',
      cantidad_hilo_cm: '',
      color_principal: '',
      color_secundario: '',
      color_terciario: '',
      tipo_nudo: '',
      materiales: '',
      costo_fabricacion: '',
      precio_venta: '',
      observaciones: ''
    })

    const formatNumber = (value) => {
      if (value === null || value === undefined) return '0.00'
      const num = parseFloat(value)
      return isNaN(num) ? '0.00' : num.toFixed(2)
    }

    const fetchProductos = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/productos-fabricacion`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        productos.value = response.data
      } catch (error) {
        console.error('Error al cargar productos:', error)
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        if (form.value.id) {
          await axios.put(`${API_URL}/admin/productos-fabricacion/${form.value.id}`, form.value, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        } else {
          await axios.post(`${API_URL}/admin/productos-fabricacion`, form.value, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        }
        showForm.value = false
        resetForm()
        await fetchProductos()
      } catch (error) {
        console.error('Error al guardar producto:', error)
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      form.value = {
        id: null,
        nombre: '',
        cantidad_hilo_cm: '',
        color_principal: '',
        color_secundario: '',
        color_terciario: '',
        tipo_nudo: '',
        materiales: '',
        costo_fabricacion: '',
        precio_venta: '',
        observaciones: ''
      }
    }

    const editarProducto = (producto) => {
      form.value = { ...producto }
      showForm.value = true
    }

    const eliminarProducto = async (id) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return

      try {
        await axios.delete(`${API_URL}/admin/productos-fabricacion/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        await fetchProductos()
      } catch (error) {
        console.error('Error al eliminar producto:', error)
      }
    }

    onMounted(fetchProductos)

    return {
      productos,
      showForm,
      loading,
      form,
      formatNumber,
      handleSubmit,
      editarProducto,
      eliminarProducto
    }
  }
}
</script>

<style scoped>
.productos-fabricacion {
  padding: 1.5rem;
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

.product-form {
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
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
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

.color-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-tag {
  padding: 0.25rem 0.5rem;
  background-color: #f0f0f0;
  border-radius: 15px;
  font-size: 0.875rem;
  color: #666;
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