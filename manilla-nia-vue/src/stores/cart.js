import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  // Inicializar el carrito desde localStorage
  const initializeCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      items.value = JSON.parse(savedCart)
    }
  }

  // Guardar el carrito en localStorage
  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.cantidad, 0)
  })

  const totalAmount = computed(() => {
    return items.value.reduce((total, item) => {
      const price = item.es_personalizado 
        ? item.personalizacion.precio_final 
        : item.precio
      return total + (price * item.cantidad)
    }, 0)
  })

  // Actions
  const addItem = (item) => {
    // Si es personalizado, nunca se agrupa (cada uno es único)
    if (item.es_personalizado) {
      items.value.push({ 
        ...item, 
        cantidad: item.cantidad || 1,
        id: Date.now() // Asegurar que cada pedido personalizado tenga un ID único
      })
    } else {
      // Si es normal, agrupar por id
      const existingItem = items.value.find(i => i.id === item.id && !i.es_personalizado)
      if (existingItem) {
        existingItem.cantidad++
      } else {
        items.value.push({ ...item, cantidad: item.cantidad || 1 })
      }
    }
    saveCart()
  }

  const removeItem = (itemId) => {
    items.value = items.value.filter(item => item.id !== itemId)
    saveCart()
  }

  const updateQuantity = (itemId, quantity) => {
    const item = items.value.find(i => i.id === itemId)
    if (item && quantity > 0) {
      item.cantidad = parseInt(quantity)
      saveCart()
    }
  }

  const clearCart = () => {
    items.value = []
    saveCart()
  }

  const processOrder = async () => {
    if (items.value.length === 0) {
      throw new Error('El carrito está vacío')
    }

    loading.value = true
    try {
      // Obtener datos de autenticación
      const user = JSON.parse(localStorage.getItem('user'))
      const token = localStorage.getItem('token')
      if (!user || !token) throw new Error('No autenticado')

      // 1. Primero crear el pago
      const pagoResponse = await axios.post(`${API_URL}/pedidos/pago`, {
        total: totalAmount.value
      })

      const pago_id = pagoResponse.data.id

      // 2. Procesar cada item del carrito usando el pago_id
      for (const item of items.value) {
        if (item.es_personalizado) {
          // Asegurar que todos los campos requeridos estén presentes
          const pedidoPersonalizado = {
            color_principal: item.personalizacion.color_principal,
            color_secundario: item.personalizacion.color_secundario || null,
            color_terciario: item.personalizacion.color_terciario || null,
            estilo_color: item.personalizacion.estilo_color || 'mate',
            tipo_tejido: item.personalizacion.tipo_tejido,
            tamanio: item.personalizacion.tamanio,
            tamanio_personalizado: item.personalizacion.tamanio_personalizado || null,
            tipo_cierre: item.personalizacion.tipo_cierre || 'nudo',
            dije: item.personalizacion.dije || null,
            tipo_mensaje: item.personalizacion.tipo_mensaje || null,
            mensaje_nombre: item.personalizacion.mensaje_nombre || null,
            mensaje_iniciales: item.personalizacion.mensaje_iniciales || null,
            mensaje_frase: item.personalizacion.mensaje_frase || null,
            accesorios: item.personalizacion.accesorios || [],
            ocasion_especial: item.personalizacion.ocasion_especial || null,
            producto_base_id: item.personalizacion.producto_base_id || 1,
            precio_base: item.personalizacion.precio_base || item.precio,
            precio_final: item.personalizacion.precio_final || item.precio,
            notas: item.personalizacion.notas || null,
            pago_id: pago_id,
            cantidad: item.cantidad
          }

          // Crear pedido personalizado
          await axios.post(`${API_URL}/pedidos/personalizados`, pedidoPersonalizado)
        } else {
          // Crear pedido normal con el pago_id
          await axios.post(`${API_URL}/pedidos/normal`, {
            producto_fabricacion_id: item.id,
            cantidad: item.cantidad,
            total: item.precio * item.cantidad,
            pago_id: pago_id
          })
        }
      }

      // Limpiar el carrito
      clearCart()
      return true
    } catch (error) {
      console.error('Error procesando orden:', error)
      throw new Error(error.response?.data?.message || 'Error al procesar el pedido')
    } finally {
      loading.value = false
    }
  }

  // Inicializar el carrito al crear el store
  initializeCart()

  return {
    items,
    loading,
    itemCount,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    processOrder
  }
}) 