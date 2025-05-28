<template>
  <div class="product-detail">
    <!-- ... existing code ... -->
    <div class="product-actions">
      <button 
        class="btn-customize" 
        @click="goToCustomize"
      >
        Personalizar
      </button>
      <button 
        class="btn-add-cart" 
        @click="addToCart"
        :disabled="loading"
      >
        {{ loading ? 'Agregando...' : 'Agregar al Carrito' }}
      </button>
    </div>
    <!-- ... existing code ... -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'DetalleProducto',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const cartStore = useCartStore()
    const authStore = useAuthStore()
    const loading = ref(false)
    const product = ref(null)

    const goToCustomize = () => {
      if (!authStore.isAuthenticated) {
        router.push({ 
          name: 'login', 
          query: { redirect: route.fullPath } 
        })
        return
      }

      router.push({
        name: 'personalizar',
        query: {
          id: product.value.id,
          nombre: product.value.nombre,
          precio: product.value.precio,
          descripcion: product.value.descripcion
        }
      })
    }

    const addToCart = () => {
      if (!product.value) return;
      cartStore.addItem({
        id: product.value.id,
        nombre: product.value.nombre,
        precio: product.value.precio,
        imagen: product.value.imagen,
        es_personalizado: false,
      });
      loading.value = false;
      router.push('/carrito');
    };

    return {
      product,
      loading,
      goToCustomize,
      addToCart,
    }
  }
}
</script>

<style scoped>
/* ... existing styles ... */

.product-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-customize,
.btn-add-cart {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-customize {
  background-color: #ff6b6b;
  color: white;
}

.btn-customize:hover {
  background-color: #ff5252;
}

.btn-add-cart {
  background-color: #4CAF50;
  color: white;
}

.btn-add-cart:hover {
  background-color: #45a049;
}

.btn-add-cart:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style> 