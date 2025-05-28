<template>
  <div class="cart-container">
    <h1>Carrito de Compras</h1>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <i class="fas fa-shopping-cart"></i>
      <p>Tu carrito está vacío</p>
      <router-link to="/productos" class="btn-continue">
        Continuar Comprando
      </router-link>
    </div>

    <div v-else class="cart-content">
      <!-- Lista de Productos -->
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id + (item.es_personalizado ? Math.random() : '')" class="cart-item">
          <div class="item-image">
            <img :src="item.imagen || '/img/personaliza2.png'" :alt="item.nombre">
          </div>

          <div class="item-details">
            <h3>{{ item.nombre }}</h3>
            <span v-if="item.es_personalizado" class="badge-custom">Personalizado</span>
            <span v-else class="badge-normal">Normal</span>
            <!-- Detalles de personalización si existe -->
            <div v-if="item.es_personalizado" class="customization-details">
              <p><strong>Color:</strong> {{ item.personalizacion.color_principal }}</p>
              <p><strong>Tipo de Tejido:</strong> {{ item.personalizacion.tipo_tejido }}</p>
              <p><strong>Tamaño:</strong> {{ item.personalizacion.tamanio }}</p>
              <p v-if="item.personalizacion.accesorios.length > 0">
                <strong>Accesorios:</strong> {{ item.personalizacion.accesorios.join(', ') }}
              </p>
              <p v-if="item.personalizacion.ocasion_especial">
                <strong>Ocasión:</strong> {{ item.personalizacion.ocasion_especial }}
              </p>
              <p v-if="item.personalizacion.dije">
                <strong>Dije:</strong> {{ item.personalizacion.dije }}
              </p>
              <p v-if="item.personalizacion.notas">
                <strong>Notas:</strong> {{ item.personalizacion.notas }}
              </p>
            </div>

            <div class="item-price">
              <p class="price">${{ formatPrice(item.es_personalizado ? item.personalizacion.precio_final : item.precio) }}</p>
              <div class="quantity-controls">
                <button 
                  @click="updateQuantity(item, -1)"
                  :disabled="item.cantidad <= 1"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <span>{{ item.cantidad }}</span>
                <button @click="updateQuantity(item, 1)">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <p class="subtotal">Subtotal: ${{ formatPrice((item.es_personalizado ? item.personalizacion.precio_final : item.precio) * item.cantidad) }}</p>
            </div>
          </div>

          <button class="btn-remove" @click="removeItem(item)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Resumen del Carrito -->
      <div class="cart-summary">
        <h2>Resumen del Pedido</h2>
        <div class="summary-details">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${{ formatPrice(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Envío</span>
            <span>{{ shippingCost === 0 ? 'Gratis' : `$${formatPrice(shippingCost)}` }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ formatPrice(total) }}</span>
          </div>
        </div>
        <div class="shipping-info">
          <h3>Información de Envío</h3>
          <p v-if="subtotal >= 50000">
            <i class="fas fa-check-circle"></i>
            ¡Felicidades! Tu pedido califica para envío gratis
          </p>
          <p v-else>
            Agrega ${{ formatPrice(50000 - subtotal) }} más para obtener envío gratis
          </p>
        </div>
        <button 
          class="btn-checkout"
          @click="proceedToCheckout"
          :disabled="loading"
        >
          {{ loading ? 'Procesando...' : 'Proceder al Pago' }}
        </button>
        <button class="btn-clear" @click="clearCart" :disabled="loading">
          Vaciar Carrito
        </button>
        <router-link to="/productos" class="btn-continue">
          Continuar Comprando
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'CarritoView',
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const authStore = useAuthStore()

    const cartItems = computed(() => cartStore.items)
    const loading = computed(() => cartStore.loading)

    const subtotal = computed(() => {
      return cartItems.value.reduce((total, item) => {
        const price = item.es_personalizado 
          ? item.personalizacion.precio_final 
          : item.precio
        return total + (price * item.cantidad)
      }, 0)
    })

    const shippingCost = computed(() => {
      return subtotal.value >= 50000 ? 0 : 5000
    })

    const total = computed(() => subtotal.value + shippingCost.value)

    const formatPrice = (price) => {
      return price.toLocaleString('es-CO')
    }

    const updateQuantity = (item, change) => {
      const newQuantity = item.cantidad + change
      if (newQuantity > 0) {
        cartStore.updateQuantity(item.id, newQuantity)
      }
    }

    const removeItem = (item) => {
      cartStore.removeItem(item.id)
    }

    const clearCart = () => {
      cartStore.clearCart()
    }

    const proceedToCheckout = async () => {
      if (!authStore.isAuthenticated) {
        router.push({ 
          name: 'login', 
          query: { redirect: '/carrito' } 
        })
        return
      }
      try {
        await cartStore.processOrder()
        router.push('/pedidos')
      } catch (error) {
        alert(error.message || 'Error al procesar el pedido')
      }
    }

    return {
      cartItems,
      loading,
      subtotal,
      shippingCost,
      total,
      formatPrice,
      updateQuantity,
      removeItem,
      clearCart,
      proceedToCheckout
    }
  }
}
</script>

<style scoped>
.cart-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-container h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.empty-cart {
  text-align: center;
  color: #888;
  margin-top: 4rem;
}
.empty-cart i {
  font-size: 4rem;
  margin-bottom: 1rem;
}
.btn-continue {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.8rem 2rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  text-decoration: none;
  transition: background 0.3s;
}
.btn-continue:hover {
  background: #ff5252;
}
.cart-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}
.cart-items {
  flex: 2;
}
.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.07);
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  position: relative;
}
.item-image img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
}
.item-details {
  flex: 1;
}
.badge-custom {
  background: #ff6b6b;
  color: white;
  border-radius: 12px;
  padding: 0.2rem 0.8rem;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}
.badge-normal {
  background: #4CAF50;
  color: white;
  border-radius: 12px;
  padding: 0.2rem 0.8rem;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}
.customization-details {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #555;
}
.item-price {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.price {
  font-size: 1.1rem;
  color: #ff6b6b;
  font-weight: bold;
}
.subtotal {
  font-size: 0.95rem;
  color: #333;
}
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.quantity-controls button {
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}
.quantity-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.btn-remove {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.3rem;
  cursor: pointer;
  transition: color 0.2s;
}
.btn-remove:hover {
  color: #d32f2f;
}
.cart-summary {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.07);
  padding: 2rem 1.5rem;
  min-width: 320px;
}
.cart-summary h2 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}
.summary-details {
  margin-bottom: 1.5rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.7rem;
  font-size: 1rem;
}
.summary-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ff6b6b;
  border-top: 1px solid #eee;
  padding-top: 0.7rem;
}
.shipping-info {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.98rem;
  color: #555;
}
.btn-checkout {
  width: 100%;
  padding: 1rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-checkout:hover {
  background: #ff5252;
}
.btn-checkout:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.btn-clear {
  width: 100%;
  padding: 0.8rem;
  background: #eee;
  color: #333;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-clear:hover {
  background: #ffd6d6;
}
@media (max-width: 900px) {
  .cart-content {
    flex-direction: column;
  }
  .cart-summary {
    min-width: unset;
    margin-top: 2rem;
  }
}
</style> 