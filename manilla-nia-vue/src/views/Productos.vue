<template>
  <div class="products-page">
    <h1 class="products-title">Nuestras Manillas</h1>
    <div class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card-modern">
        <div class="product-card-header">
          <span v-if="product.badge" :class="['badge', product.badgeClass]">{{ product.badge }}</span>
          <button class="fav-btn"><i class="fas fa-heart"></i></button>
        </div>
        <div class="product-img-wrap">
          <img :src="product.imagen" :alt="product.nombre" />
        </div>
        <div class="product-card-body">
          <h3 class="product-name">{{ product.nombre }}</h3>
          <div class="product-rating">
            <i class="fas fa-star" v-for="n in 4" :key="n"></i>
            <i class="fas fa-star-half-alt"></i>
            <span class="reviews">({{ product.reviews }})</span>
          </div>
          <div class="product-colors">
            <span v-for="color in product.colors" :key="color" :style="{background: color}" class="color-dot"></span>
          </div>
          <div class="product-price">
            <span class="current-price">${{ product.precio.toLocaleString('es-CO') }}</span>
            <span class="old-price" v-if="product.oldPrice">${{ product.oldPrice.toLocaleString('es-CO') }}</span>
          </div>
          <div class="product-card-actions">
            <button class="btn-buy" @click="comprar(product)">Comprar</button>
            <button class="btn-cart" @click="addToCart(product)"><i class="fas fa-shopping-cart"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  name: 'ProductosView',
  data() {
    return {
      products: [
        {
          id: 1,
          nombre: 'Manilla Arcoíris',
          imagen: '/img/arcoiris.png',
          precio: 15000,
          oldPrice: null,
          reviews: 128,
          badge: 'NUEVO',
          badgeClass: 'badge-new',
          colors: ['#ffb347', '#ff6961', '#77dd77', '#779ecb']
        },
        {
          id: 2,
          nombre: 'Manilla Pastel',
          imagen: '/img/pastel.png',
          precio: 18000,
          oldPrice: 22000,
          reviews: 95,
          badge: 'OFERTA',
          badgeClass: 'badge-sale',
          colors: ['#f7cac9', '#92a8d1', '#fff2b2']
        },
        {
          id: 3,
          nombre: 'Manilla Neón',
          imagen: '/img/neon.png',
          precio: 20000,
          oldPrice: null,
          reviews: 156,
          badge: 'POPULAR',
          badgeClass: 'badge-popular',
          colors: ['#ff1493', '#00ff00', '#ff4500']
        },
        {
          id: 4,
          nombre: 'Manilla Clásica',
          imagen: '/img/clasica.png',
          precio: 25000,
          oldPrice: null,
          reviews: 82,
          badge: 'LIMITADO',
          badgeClass: 'badge-limited',
          colors: ['#000000', '#ffffff', '#808080']
        },
        {
          id: 5,
          nombre: 'Manilla de Lujo',
          imagen: '/img/lujo.png',
          precio: 30000,
          oldPrice: 35000,
          reviews: 67,
          badge: 'OFERTA',
          badgeClass: 'badge-sale',
          colors: ['#ffd700', '#c0c0c0', '#b87333']
        },
        {
          id: 6,
          nombre: 'Manilla Dogris',
          imagen: '/img/pareja.png',
          precio: 35000,
          oldPrice: null,
          reviews: 104,
          badge: 'NUEVO',
          badgeClass: 'badge-new',
          colors: ['#ff69b4', '#4b0082', '#00ced1']
        },
        {
          id: 7,
          nombre: 'Manilla Arcoíris Delgada',
          imagen: '/img/espiral.png',
          precio: 12000,
          oldPrice: null,
          reviews: 89,
          badge: '',
          badgeClass: '',
          colors: ['#ffb347', '#ff6961', '#77dd77', '#779ecb']
        },
        {
          id: 8,
          nombre: 'Manilla Pastel Suave',
          imagen: '/img/pastel_suave.png',
          precio: 16000,
          oldPrice: 20000,
          reviews: 112,
          badge: 'LIMITADO',
          badgeClass: 'badge-limited',
          colors: ['#f7cac9', '#92a8d1', '#fff2b2', '#b5e7a0']
        }
      ]
    }
  },
  methods: {
    comprar(product) {
      this.addToCart(product);
      this.$router.push('/carrito');
    },
    addToCart(product) {
      const cartStore = useCartStore();
      cartStore.addItem({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        imagen: product.imagen,
        es_personalizado: false
      });
    }
  }
}
</script>

<style scoped>
.products-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
.products-title {
  font-size: 2.5rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 800;
  letter-spacing: 1px;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
}
.product-card-modern {
  background: #fff;
  border-radius: 1.2rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}
.product-card-modern:hover {
  transform: translateY(-7px) scale(1.03);
  box-shadow: 0 8px 32px rgba(37,117,252,0.13);
}
.product-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1rem 0 1rem;
}
.badge {
  padding: 0.3rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.badge-new { background: #4CAF50; }
.badge-sale { background: #ff6b6b; }
.badge-popular { background: #FFD600; color: #333; }
.badge-limited { background: #2575fc; }
.fav-btn {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b6b;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(255,107,107,0.08);
  cursor: pointer;
  transition: background 0.2s;
}
.fav-btn:hover { background: #ffebee; }
.product-img-wrap {
  width: 100%;
  aspect-ratio: 1/1;
  background: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem 0.5rem 0.5rem 0.5rem;
}
.product-img-wrap img {
  max-width: 90%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(37,117,252,0.07);
}
.product-card-body {
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.product-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
}
.product-rating {
  color: #FFD700;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}
.product-rating .reviews {
  color: #666;
  margin-left: 0.5rem;
  font-size: 0.95rem;
}
.product-colors {
  margin-bottom: 0.7rem;
}
.color-dot {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 0.3rem;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.product-price {
  margin-bottom: 1rem;
}
.current-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2575fc;
}
.old-price {
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
  margin-left: 0.5rem;
}
.product-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.btn-buy {
  flex: 1;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 0.5rem;
  font-weight: 700;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.btn-buy:hover {
  background: #388e3c;
}
.btn-cart {
  background: #fff;
  color: #2575fc;
  border: 2px solid #2575fc;
  border-radius: 0.5rem;
  padding: 0.7rem 1rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-cart:hover {
  background: #2575fc;
  color: #fff;
}
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }
  .products-title {
    font-size: 2rem;
  }
}
</style>