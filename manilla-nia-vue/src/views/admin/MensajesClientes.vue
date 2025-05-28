<template>
  <div class="mensajes-container">
    <!-- Notificación Toast -->
    <div v-if="mostrarNotificacion" :class="['toast', tipoNotificacion]">
      <i :class="iconoNotificacion"></i>
      <span>{{ mensajeNotificacion }}</span>
      <button @click="mostrarNotificacion = false" class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <h1>Mensajes de Clientes</h1>

    <!-- Filtros -->
    <div class="filtros-container">
      <div class="filtro-grupo">
        <label for="filtroMotivo">Filtrar por Motivo:</label>
        <select 
          id="filtroMotivo" 
          v-model="filtros.motivo"
          @change="cargarMensajes"
        >
          <option value="">Todos los motivos</option>
          <option value="quejas">Quejas</option>
          <option value="reclamos_servicio">Reclamos del Servicio</option>
          <option value="sugerencias">Sugerencias</option>
          <option value="felicitaciones">Felicitaciones</option>
          <option value="no_llego">Pedido no llegó</option>
          <option value="defectuoso">Pedido defectuoso</option>
          <option value="incorrecto">Pedido incorrecto</option>
          <option value="garantia">Solicitud de garantía</option>
          <option value="otra_situacion">Otra situación</option>
        </select>
      </div>

      <div class="filtro-grupo">
        <label for="filtroEstado">Filtrar por Estado:</label>
        <select 
          id="filtroEstado" 
          v-model="filtros.estado"
          @change="cargarMensajes"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
          <option value="resuelto">Resuelto</option>
          <option value="cerrado">Cerrado</option>
        </select>
      </div>
    </div>

    <!-- Tabla de Mensajes -->
    <div class="tabla-container">
      <table v-if="mensajes.length > 0">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Asunto</th>
            <th>Motivo</th>
            <th>Pedido Referenciado</th>
            <th>Mensaje</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mensaje in mensajes" :key="mensaje.id">
            <td>{{ formatearFecha(mensaje.fecha_envio) }}</td>
            <td>{{ mensaje.nombre }}</td>
            <td>{{ mensaje.email }}</td>
            <td>{{ mensaje.asunto }}</td>
            <td>{{ mensaje.motivo }}</td>
            <td>
              <template v-if="mensaje.tipo_pedido_referencia">
                <router-link 
                  :to="mensaje.tipo_pedido_referencia === 'normal' 
                    ? `/admin/pedidos/${mensaje.pedido_normal_id}`
                    : `/admin/pedidos-personalizados/${mensaje.pedido_personalizado_id}`"
                  class="link-pedido"
                >
                  <span :class="['badge', mensaje.tipo_pedido_referencia === 'normal' ? 'badge-normal' : 'badge-personalizado']">
                    {{ mensaje.tipo_pedido_referencia === 'normal' ? 'Normal' : 'Personalizado' }}
                  </span>
                  #{{ mensaje.tipo_pedido_referencia === 'normal' 
                    ? mensaje.pedido_normal_id 
                    : mensaje.pedido_personalizado_id }}
                </router-link>
              </template>
              <span v-else>-</span>
            </td>
            <td>
              <div class="mensaje-preview" @click="mostrarMensajeCompleto(mensaje)">
                {{ mensaje.mensaje.substring(0, 50) }}...
              </div>
            </td>
            <td>
              <select 
                v-model="mensaje.estado"
                @change="actualizarEstado(mensaje)"
                :class="getEstadoClass(mensaje.estado)"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </td>
            <td>
              <button 
                class="btn-accion"
                @click="mostrarMensajeCompleto(mensaje)"
                title="Ver detalles"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button 
                class="btn-accion"
                @click="responderMensaje(mensaje)"
                title="Responder"
              >
                <i class="fas fa-reply"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-mensajes">
        No hay mensajes que coincidan con los filtros seleccionados
      </div>
    </div>

    <!-- Modal para ver mensaje completo -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>Detalles del Mensaje</h2>
          <button @click="mostrarModal = false" class="btn-cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" v-if="mensajeSeleccionado">
          <div class="detalle-grupo">
            <label>Fecha:</label>
            <span>{{ formatearFecha(mensajeSeleccionado.fecha_envio) }}</span>
          </div>
          <div class="detalle-grupo">
            <label>Nombre:</label>
            <span>{{ mensajeSeleccionado.nombre }}</span>
          </div>
          <div class="detalle-grupo">
            <label>Email:</label>
            <span>{{ mensajeSeleccionado.email }}</span>
          </div>
          <div class="detalle-grupo">
            <label>Asunto:</label>
            <span>{{ mensajeSeleccionado.asunto }}</span>
          </div>
          <div class="detalle-grupo">
            <label>Motivo:</label>
            <span>{{ mensajeSeleccionado.motivo }}</span>
          </div>
          <div class="detalle-grupo">
            <label>Mensaje:</label>
            <div class="mensaje-completo">{{ mensajeSeleccionado.mensaje }}</div>
          </div>
          <div class="detalle-grupo" v-if="mensajeSeleccionado.pedido_referencia_id">
            <label>ID del Pedido:</label>
            <span>{{ mensajeSeleccionado.pedido_referencia_id }}</span>
          </div>
          <div class="detalle-grupo">
            <label>Estado:</label>
            <select 
              v-model="mensajeSeleccionado.estado"
              @change="actualizarEstado(mensajeSeleccionado)"
              :class="getEstadoClass(mensajeSeleccionado.estado)"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export default {
  name: 'MensajesClientesView',
  setup() {
    const mensajes = ref([])
    const mostrarModal = ref(false)
    const mensajeSeleccionado = ref(null)
    const filtros = reactive({
      motivo: '',
      estado: ''
    })
    
    // Variables para notificaciones
    const mostrarNotificacion = ref(false)
    const tipoNotificacion = ref('')
    const mensajeNotificacion = ref('')
    const iconoNotificacion = ref('')

    const mostrarToast = (mensaje, tipo = 'exito') => {
      tipoNotificacion.value = tipo
      mensajeNotificacion.value = mensaje
      iconoNotificacion.value = tipo === 'exito' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
      mostrarNotificacion.value = true

      // Ocultar la notificación después de 5 segundos
      setTimeout(() => {
        mostrarNotificacion.value = false
      }, 5000)
    }

    const cargarMensajes = async () => {
      try {
        const params = new URLSearchParams()
        if (filtros.motivo) params.append('motivo', filtros.motivo)
        if (filtros.estado) params.append('estado', filtros.estado)

        const response = await axios.get(`${API_URL}/contacto?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        mensajes.value = response.data
      } catch (error) {
        console.error('Error al cargar mensajes:', error)
        mostrarToast('Error al cargar los mensajes. Por favor, intenta de nuevo.', 'error')
      }
    }

    const actualizarEstado = async (mensaje) => {
      try {
        await axios.patch(
          `${API_URL}/contacto/${mensaje.id}`,
          { estado: mensaje.estado },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        mostrarToast('Estado actualizado correctamente', 'exito')
      } catch (error) {
        console.error('Error al actualizar estado:', error)
        mostrarToast('Error al actualizar el estado. Por favor, intenta de nuevo.', 'error')
        // Revertir el cambio en caso de error
        await cargarMensajes()
      }
    }

    const eliminarMensaje = async (id) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este mensaje?')) return
      
      try {
        await axios.delete(`${API_URL}/contacto/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        mensajes.value = mensajes.value.filter(m => m.id !== id)
        mostrarToast('Mensaje eliminado correctamente', 'exito')
      } catch (error) {
        console.error('Error al eliminar mensaje:', error)
        mostrarToast('Error al eliminar el mensaje. Por favor, intenta de nuevo.', 'error')
      }
    }

    const mostrarMensajeCompleto = (mensaje) => {
      mensajeSeleccionado.value = mensaje
      mostrarModal.value = true
    }

    const responderMensaje = (mensaje) => {
      // Aquí podrías implementar la lógica para responder al mensaje
      // Por ejemplo, abrir el cliente de correo con el email del cliente
      window.location.href = `mailto:${mensaje.email}?subject=Re: ${mensaje.asunto}`
    }

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getEstadoClass = (estado) => {
      const clases = {
        pendiente: 'estado-pendiente',
        en_proceso: 'estado-proceso',
        resuelto: 'estado-resuelto',
        cerrado: 'estado-cerrado'
      }
      return clases[estado] || ''
    }

    onMounted(() => {
      cargarMensajes()
    })

    return {
      mensajes,
      filtros,
      mostrarModal,
      mensajeSeleccionado,
      cargarMensajes,
      actualizarEstado,
      mostrarMensajeCompleto,
      responderMensaje,
      formatearFecha,
      getEstadoClass,
      mostrarNotificacion,
      tipoNotificacion,
      mensajeNotificacion,
      iconoNotificacion,
      eliminarMensaje
    }
  }
}
</script>

<style scoped>
.mensajes-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.filtros-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filtro-grupo label {
  font-weight: bold;
  color: #555;
}

.filtro-grupo select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.tabla-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.mensaje-preview {
  cursor: pointer;
  color: #0066cc;
}

.mensaje-preview:hover {
  text-decoration: underline;
}

.btn-accion {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  margin: 0 2px;
}

.btn-accion:hover {
  color: #0066cc;
}

select[class^="estado-"] {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.estado-pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.estado-proceso {
  background-color: #cce5ff;
  color: #004085;
}

.estado-resuelto {
  background-color: #d4edda;
  color: #155724;
}

.estado-cerrado {
  background-color: #f8f9fa;
  color: #6c757d;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.detalle-grupo {
  margin-bottom: 15px;
}

.detalle-grupo label {
  font-weight: bold;
  color: #555;
  display: block;
  margin-bottom: 5px;
}

.mensaje-completo {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
}

.no-mensajes {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

@media (max-width: 768px) {
  .filtros-container {
    flex-direction: column;
  }

  .filtro-grupo select {
    width: 100%;
  }

  th, td {
    padding: 8px;
  }
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: bold;
  margin-right: 8px;
}

.badge-normal {
  background-color: #e3f2fd;
  color: #1976d2;
}

.badge-personalizado {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.link-pedido {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.link-pedido:hover {
  text-decoration: underline;
}

/* Estilos para el Toast */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
}

.toast.exito {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
}

.toast.error {
  background: linear-gradient(45deg, #f44336, #e53935);
  color: white;
}

.toast i {
  font-size: 1.2rem;
}

.toast span {
  flex-grow: 1;
  font-size: 0.95rem;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Mejoras en la tabla */
.tabla-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  padding: 16px;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

td {
  padding: 16px;
  border-bottom: 1px solid #eee;
  color: #555;
}

tr:hover {
  background-color: #f8f9fa;
}

/* Mejoras en los botones de acción */
.btn-accion {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  margin: 0 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-accion:hover {
  background-color: #f0f0f0;
  color: #0066cc;
  transform: translateY(-1px);
}

/* Mejoras en el modal */
.modal-contenido {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.modal-body {
  padding: 24px;
}

.detalle-grupo {
  margin-bottom: 20px;
}

.detalle-grupo label {
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mensaje-completo {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #444;
}

/* Mejoras en los filtros */
.filtros-container {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.filtro-grupo select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 200px;
  background-color: white;
  transition: border-color 0.2s;
}

.filtro-grupo select:focus {
  border-color: #0066cc;
  outline: none;
}

/* Mejoras en los estados */
select[class^="estado-"] {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-weight: 500;
  transition: all 0.2s;
}

.estado-pendiente {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.estado-proceso {
  background-color: #cce5ff;
  color: #004085;
  border-color: #b8daff;
}

.estado-resuelto {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.estado-cerrado {
  background-color: #f8f9fa;
  color: #6c757d;
  border-color: #e9ecef;
}

/* Responsive */
@media (max-width: 768px) {
  .filtros-container {
    flex-direction: column;
    padding: 15px;
  }

  .filtro-grupo select {
    width: 100%;
  }

  .toast {
    min-width: auto;
    width: calc(100% - 40px);
  }

  th, td {
    padding: 12px;
  }
}
</style> 