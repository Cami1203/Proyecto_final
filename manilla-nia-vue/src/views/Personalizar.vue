<template>
  <div class="customize-container">
    <div v-if="!isLoggedIn" class="auth-required">
      <div class="auth-message">
        <i class="fas fa-lock"></i>
        <h2>Autenticación Requerida</h2>
        <p>Debes iniciar sesión para personalizar tu producto</p>
        <button class="btn-login" @click="redirectToLogin">
          Iniciar Sesión
        </button>
      </div>
    </div>
    <div v-else class="customize-box">
      <div class="header-section">
        <h2>Personaliza tu Manilla</h2>
        <div class="header-image">
          <img src="/img/manilla-header.png" alt="Manilla personalizada" />
        </div>
        <p class="header-description">Crea tu manilla única con nuestras opciones de personalización</p>
      </div>

      <div class="product-info">
        <h3>{{ productInfo.nombre }}</h3>
        <p class="base-price">Precio base: ${{ formatPrice(6000) }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="customize-form">
        <!-- COLORES -->
        <div class="form-section colors-section">
          <h3>Colores <i class="fas fa-palette"></i></h3>
          <div class="color-pickers">
            <div class="color-picker">
              <label>Principal:</label>
              <select v-model="formData.color_principal">
                <option value="">Selecciona un color</option>
                <option v-for="color in colores" :key="color" :value="color">{{ color }}</option>
              </select>
            </div>
            <div class="color-picker">
              <label>Secundario:</label>
              <select v-model="formData.color_secundario">
                <option value="">Selecciona un color</option>
                <option v-for="color in colores" :key="color" :value="color">{{ color }}</option>
              </select>
            </div>
            <div class="color-picker">
              <label>Terciario:</label>
              <select v-model="formData.color_terciario">
                <option value="">Selecciona un color</option>
                <option v-for="color in colores" :key="color" :value="color">{{ color }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ESTILO DE COLORES -->
        <div class="form-section">
          <h3>Estilo de Colores <i class="fas fa-tools"></i></h3>
          <div class="style-cards">
            <button v-for="estilo in estilosColor" :key="estilo.value" type="button"
              :class="['style-card', { selected: formData.estilo_color === estilo.value }]"
              @click="formData.estilo_color = estilo.value">
              <i :class="estilo.icon"></i> {{ estilo.label }}
            </button>
          </div>
        </div>

        <!-- TIPO DE TEJIDO -->
        <div class="form-section">
          <h3>Tipo de Tejido <i class="fas fa-grip-horizontal"></i></h3>
          <div class="tejido-cards">
            <button v-for="tejido in tiposTejido" :key="tejido.value" type="button"
              :class="['tejido-card', { selected: formData.tipo_tejido === tejido.value }]"
              @click="formData.tipo_tejido = tejido.value">
              <img :src="tejido.img" :alt="tejido.label" class="tejido-img" />
              <span>{{ tejido.label }}</span>
            </button>
          </div>
        </div>

        <!-- TAMAÑO -->
        <div class="form-section">
          <h3>Tamaño <i class="fas fa-pencil-alt"></i></h3>
          <div class="size-cards">
            <button v-for="tam in tamanios" :key="tam.value" type="button"
              :class="['size-card', { selected: formData.tamanio === tam.value }]"
              @click="formData.tamanio = tam.value">
              <span>{{ tam.label }}</span>
              <span v-if="tam.cm" class="size-cm">{{ tam.cm }}</span>
            </button>
            <div v-if="formData.tamanio === 'personalizado'" class="size-custom-input">
              <input type="number" v-model="formData.tamanio_personalizado" min="1" max="100" placeholder="cm" />
            </div>
          </div>
        </div>

        <!-- Características -->
        <div class="form-section">
          <h3>Características</h3>
          <div class="form-group">
            <label for="tipo_cierre">Tipo de Cierre</label>
            <select id="tipo_cierre" v-model="formData.tipo_cierre">
              <option value="">Selecciona un tipo</option>
              <option value="nudo">Nudo</option>
              <option value="broche">Broche</option>
              <option value="gancho">Gancho</option>
            </select>
          </div>
        </div>

        <!-- Mensaje Personalizado -->
        <div class="form-section">
          <h3>Mensaje Personalizado</h3>
          <div class="form-group">
            <label for="tipo_mensaje">Tipo de Mensaje</label>
            <select id="tipo_mensaje" v-model="formData.tipo_mensaje">
              <option value="">Selecciona un tipo</option>
              <option value="nombre">Nombre</option>
              <option value="iniciales">Iniciales</option>
              <option value="frase">Frase</option>
            </select>
          </div>

          <div class="form-group" v-if="formData.tipo_mensaje === 'nombre'">
            <label for="mensaje_nombre">Nombre</label>
            <input 
              type="text" 
              id="mensaje_nombre" 
              v-model="formData.mensaje_nombre"
              maxlength="20"
            >
          </div>

          <div class="form-group" v-if="formData.tipo_mensaje === 'iniciales'">
            <label for="mensaje_iniciales">Iniciales</label>
            <input 
              type="text" 
              id="mensaje_iniciales" 
              v-model="formData.mensaje_iniciales"
              maxlength="3"
            >
          </div>

          <div class="form-group" v-if="formData.tipo_mensaje === 'frase'">
            <label for="mensaje_frase">Frase</label>
            <input 
              type="text" 
              id="mensaje_frase" 
              v-model="formData.mensaje_frase"
              maxlength="30"
            >
          </div>
        </div>

        <!-- Accesorios -->
        <div class="form-section">
          <h3>Accesorios</h3>
          <div class="accessories-grid">
            <label class="accessory-item">
              <input 
                type="checkbox" 
                v-model="formData.accesorios" 
                value="campanita"
              >
              <span>Campanita (+$2.000)</span>
            </label>
            <label class="accessory-item">
              <input 
                type="checkbox" 
                v-model="formData.accesorios" 
                value="mostacilla"
              >
              <span>Mostacilla (+$1.500)</span>
            </label>
            <label class="accessory-item">
              <input 
                type="checkbox" 
                v-model="formData.accesorios" 
                value="abalon"
              >
              <span>Abalón (+$3.000)</span>
            </label>
            <label class="accessory-item">
              <input 
                type="checkbox" 
                v-model="formData.accesorios" 
                value="pulsera"
              >
              <span>Pulsera (+$5.000)</span>
            </label>
            <label class="accessory-item">
              <input 
                type="checkbox" 
                v-model="formData.accesorios" 
                value="tassel"
              >
              <span>Tassel (+$2.500)</span>
            </label>
            <label class="accessory-item">
              <input 
                type="checkbox" 
                v-model="formData.accesorios" 
                value="pompon"
              >
              <span>Pompón (+$1.800)</span>
            </label>
          </div>
        </div>

        <!-- OCASIÓN ESPECIAL -->
        <div class="form-section">
          <h3>Ocasión Especial <i class="fas fa-gift"></i></h3>
          <div class="ocasion-cards">
            <button v-for="ocasion in ocasiones" :key="ocasion.value" type="button"
              :class="['ocasion-card', { selected: formData.ocasion_especial === ocasion.value }]"
              @click="formData.ocasion_especial = ocasion.value">
              <i :class="ocasion.icon"></i>
              <span>{{ ocasion.label }}</span>
            </button>
          </div>
        </div>

        <!-- DIJE -->
        <div class="form-section">
          <h3>Dije <i class="fas fa-gem"></i></h3>
          <div class="dije-cards">
            <button v-for="dije in dijes" :key="dije.value" type="button"
              :class="['dije-card', { selected: formData.dije === dije.value }]"
              @click="formData.dije = dije.value">
              <i :class="dije.icon"></i>
              <span>{{ dije.label }}</span>
            </button>
          </div>
        </div>

        <!-- Notas Adicionales -->
        <div class="form-section">
          <h3>Notas Adicionales</h3>
          <div class="form-group">
            <label for="notas">¿Algún detalle especial que quieras agregar?</label>
            <textarea 
              id="notas" 
              v-model="formData.notas"
              rows="3"
              placeholder="Escribe aquí tus notas o instrucciones especiales..."
            ></textarea>
          </div>
        </div>

        <!-- Resumen y Precio -->
        <div class="price-summary">
          <div class="price-details">
            <div class="price-row">
              <span>Precio base:</span>
              <span>${{ formatPrice(6000) }}</span>
            </div>
            <div class="price-row" v-if="accesoriosTotal > 0">
              <span>Accesorios:</span>
              <span>${{ formatPrice(accesoriosTotal) }}</span>
            </div>
            <div class="price-row total">
              <span>Total:</span>
              <span>${{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Procesando...' : 'Agregar al Carrito' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'PersonalizarView',
  props: {
    id: {
      type: [String, Number],
      default: null
    },
    nombre: {
      type: String,
      default: 'Manilla Personalizada'
    },
    precio: {
      type: Number,
      default: 6000
    },
    descripcion: {
      type: String,
      default: 'Personaliza tu manilla a tu gusto'
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const cartStore = useCartStore()
    const authStore = useAuthStore()

    const loading = ref(false)
    const productInfo = ref({
      id: props.id || 'custom',
      nombre: props.nombre,
      precio: props.precio || 6000,
      descripcion: props.descripcion
    })

    const colores = [
      'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja',
      'Morado', 'Rosa', 'Negro', 'Blanco', 'Gris',
      'Marrón', 'Turquesa', 'Fucsia', 'Dorado', 'Plateado'
    ]

    const formData = ref({
      color_principal: '',
      color_secundario: '',
      color_terciario: '',
      estilo_color: '',
      tipo_tejido: '',
      tamanio: '',
      tamanio_personalizado: '',
      tipo_cierre: '',
      tipo_mensaje: '',
      mensaje_nombre: '',
      mensaje_iniciales: '',
      mensaje_frase: '',
      accesorios: [],
      notas: '',
      ocasion_especial: '',
      dije: ''
    })

    const accesoriosTotal = computed(() => {
      return formData.value.accesorios.reduce((total, accesorio) => {
        switch(accesorio) {
          case 'campanita': return total + 2000
          case 'mostacilla': return total + 1500
          case 'abalon': return total + 3000
          case 'pulsera': return total + 5000
          case 'tassel': return total + 2500
          case 'pompon': return total + 1800
          default: return total
        }
      }, 0)
    })

    const totalPrice = computed(() => {
      return 6000 + accesoriosTotal.value
    })

    const formatPrice = (price) => {
      return price.toLocaleString('es-CO')
    }

    const handleSubmit = async () => {
      if (!authStore.isAuthenticated) {
        router.push({ 
          name: 'login', 
          query: { redirect: route.fullPath } 
        })
        return
      }

      // Validar campos requeridos
      if (!formData.value.color_principal || !formData.value.tipo_tejido || !formData.value.tamanio) {
        alert('Por favor, complete todos los campos requeridos')
        return
      }

      loading.value = true
      try {
        const personalizacion = {
          color_principal: formData.value.color_principal,
          color_secundario: formData.value.color_secundario || null,
          color_terciario: formData.value.color_terciario || null,
          estilo_color: formData.value.estilo_color || 'mate',
          tipo_tejido: formData.value.tipo_tejido,
          tamanio: formData.value.tamanio,
          tamanio_personalizado: formData.value.tamanio === 'personalizado' ? formData.value.tamanio_personalizado : null,
          tipo_cierre: formData.value.tipo_cierre || 'nudo',
          dije: formData.value.dije || null,
          tipo_mensaje: formData.value.tipo_mensaje || null,
          mensaje_nombre: formData.value.tipo_mensaje === 'nombre' ? formData.value.mensaje_nombre : null,
          mensaje_iniciales: formData.value.tipo_mensaje === 'iniciales' ? formData.value.mensaje_iniciales : null,
          mensaje_frase: formData.value.tipo_mensaje === 'frase' ? formData.value.mensaje_frase : null,
          accesorios: formData.value.accesorios || [],
          ocasion_especial: formData.value.ocasion_especial || null,
          producto_base_id: 1,
          precio_base: 6000,
          precio_final: totalPrice.value,
          notas: formData.value.notas || null
        }

        await cartStore.addItem({
          id: Date.now(),
          nombre: productInfo.value.nombre,
          precio: totalPrice.value,
          es_personalizado: true,
          personalizacion
        })

        router.push('/carrito')
      } catch (error) {
        console.error('Error al agregar al carrito:', error)
        alert('Error al agregar al carrito. Por favor, intenta de nuevo.')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      console.log('Componente Personalizar montado:', productInfo.value)
    })

    const estilosColor = [
      { value: 'mate', label: 'Mate', icon: 'fas fa-circle' },
      { value: 'brillante', label: 'Brillante', icon: 'fas fa-star' },
      { value: 'neon', label: 'Neón', icon: 'fas fa-bolt' },
      { value: 'pastel', label: 'Pastel', icon: 'fas fa-tint' },
      { value: 'degradado', label: 'Degradado', icon: 'fas fa-fill-drip' }
    ]
    const tiposTejido = [
      { value: 'espiga', label: 'Espiga', img: '/img/nudo_espiga.png' },
      { value: 'plano_invertido', label: 'Plano Invertido', img: '/img/nudo_planoinvertido.png' },
      { value: 'espiral', label: 'Espiral', img: '/img/nudo_espiral.png' },
      { value: '7_nudos', label: '7 Nudos', img: '/img/7_nudos.png' },
      { value: 'macrame', label: 'Nudo Macramé', img: '/img/nudo_macrame.png' },
      { value: 'ondas', label: 'Ondas', img: '/img/nudo_ondas.png' },
      { value: 'floral', label: 'Floral', img: '/img/nudo_floral.png' }
    ]
    const tamanios = [
      { value: 'infantil', label: 'Infantil', cm: '12 cm' },
      { value: 'juvenil', label: 'Juvenil', cm: '16 cm' },
      { value: 'adulto', label: 'Adulto', cm: '20 cm' },
      { value: 'personalizado', label: 'Personalizado', cm: '' }
    ]
    const ocasiones = [
      { value: 'cumpleanos', label: 'Cumpleaños', icon: 'fas fa-birthday-cake' },
      { value: 'san_valentin', label: 'San Valentín', icon: 'fas fa-heart' },
      { value: 'aniversario', label: 'Aniversario', icon: 'fas fa-ring' },
      { value: 'amistad', label: 'Amistad', icon: 'fas fa-user-friends' },
      { value: 'navidad', label: 'Navidad', icon: 'fas fa-tree' },
      { value: 'otro', label: 'Otro', icon: 'fas fa-ellipsis-h' }
    ]
    const dijes = [
      { value: 'corazon', label: 'Corazón', icon: 'fas fa-heart' },
      { value: 'estrella', label: 'Estrella', icon: 'fas fa-star' },
      { value: 'luna', label: 'Luna', icon: 'fas fa-moon' },
      { value: 'infinito', label: 'Infinito', icon: 'fas fa-infinity' }
    ]

    const isLoggedIn = computed(() => authStore.isAuthenticated)

    const redirectToLogin = () => {
      router.push({
        path: '/login',
        query: { redirect: '/personalizar' }
      })
    }

    return {
      productInfo,
      formData,
      loading,
      accesoriosTotal,
      totalPrice,
      formatPrice,
      handleSubmit,
      estilosColor,
      tiposTejido,
      tamanios,
      ocasiones,
      dijes,
      colores,
      isLoggedIn,
      redirectToLogin
    }
  }
}
</script>

<style scoped>
/* Importar fuentes de Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Dancing+Script:wght@700&display=swap');

.customize-container {
  padding: 2rem;
  background: linear-gradient(135deg,rgb(62, 7, 214) 0%,rgb(16, 121, 207) 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  border-radius: 25px;
  margin: 1rem;
  font-family: 'Poppins', sans-serif;
}

.customize-box {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  width: 100%;
  max-width: 800px;
  margin-top: 2rem;
}

.customize-box h2 {
  text-align: center;
  color: #6a11cb;
  margin-bottom: 2rem;
}

.product-info h3 {
  color: #ff6b6b;
  margin-bottom: 0.5rem;
}

.base-price {
  color: #6a11cb;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.customize-form {
  background: transparent;
  padding: 0;
}

.form-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(106, 17, 203, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.form-section h3 {
  color: #6a11cb;
  margin-bottom: 1.2rem;
  font-weight: 700;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  color: #6a11cb;
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: block;
}

input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  background: #fff;
  border: 1px solid rgba(106, 17, 203, 0.2);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus,
textarea:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  outline: none;
  transform: translateY(-1px);
  transition: all 0.3s ease;
}

.color-pickers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.style-cards, 
.tejido-cards, 
.size-cards, 
.ocasion-cards, 
.dije-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.8rem;
}

.style-card, 
.tejido-card, 
.size-card, 
.ocasion-card, 
.dije-card {
  background: #fff;
  border: 1px solid rgba(106, 17, 203, 0.2);
  border-radius: 10px;
  padding: 0.8rem 1.2rem;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  color: #6a11cb;
  position: relative;
  overflow: hidden;
}

.style-card:hover, 
.tejido-card:hover, 
.size-card:hover, 
.ocasion-card:hover, 
.dije-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(106, 17, 203, 0.2);
  animation: pulse 1s infinite;
}

.style-card.selected, 
.tejido-card.selected, 
.size-card.selected, 
.ocasion-card.selected, 
.dije-card.selected {
  background: rgba(106, 17, 203, 0.05);
  border-color: #6a11cb;
  color: #6a11cb;
  animation: none;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.15);
}

.tejido-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #ddd;
}

.size-custom-input input {
  width: 80px;
  padding: 0.7rem;
  border-radius: 8px;
  border: 2px solid #6a11cb;
  margin-left: 1rem;
}

.accessories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.8rem;
}

.accessory-item {
  background: #fff;
  border: 1px solid rgba(106, 17, 203, 0.2);
  border-radius: 10px;
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #6a11cb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.accessory-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.1);
}

.accessory-item input:checked + span {
  color: #ff6b6b;
  font-weight: 600;
  transform: scale(1.02);
  transition: all 0.3s ease;
}

.price-summary {
  background: linear-gradient(145deg, rgba(106, 17, 203, 0.05), rgba(255, 107, 107, 0.05));
  padding: 1.8rem;
  border-radius: 15px;
  margin: 2rem 0;
  border: 1px solid rgba(106, 17, 203, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 1.1rem;
}

.price-row.total {
  font-size: 1.3rem;
  font-weight: 600;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px dashed rgba(106, 17, 203, 0.1);
  color: #ff6b6b;
}

.form-actions {
  text-align: center;
}

.btn-submit {
  padding: 1rem 2.5rem;
  background: linear-gradient(90deg, #6a11cb 0%, #ff6b6b 100%);
  background-size: 200% 100%;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.15);
  position: relative;
  overflow: hidden;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(106, 17, 203, 0.2);
  animation: shine 1.5s infinite;
}

.btn-submit:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(106, 17, 203, 0.1);
}

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .customize-container {
    padding: 1rem;
  }
  
  .customize-box {
    margin-top: 1rem;
    padding: 1.5rem;
  }
  
  .form-section {
    padding: 1.2rem;
  }
  
  .color-pickers,
  .style-cards,
  .tejido-cards,
  .size-cards,
  .ocasion-cards,
  .dije-cards,
  .accessories-grid {
    grid-template-columns: 1fr;
  }
}

.auth-required {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.auth-message {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 90%;
}

.auth-message i {
  font-size: 4rem;
  color: #6a11cb;
  margin-bottom: 1.5rem;
}

.auth-message h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.auth-message p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.btn-login {
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(106,17,203,0.4);
}

/* Animaciones para los botones */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes shine {
  0% { background-position: -100% 50%; }
  100% { background-position: 200% 50%; }
}

/* Nuevas animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes floatAnimation {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}

/* Mejoras visuales adicionales */
.form-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(106, 17, 203, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeIn 0.5s ease-out;
}

.form-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(106, 17, 203, 0.1);
}

.form-section h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.3rem;
  color: #6a11cb;
  margin-bottom: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-section h3 i {
  animation: floatAnimation 2s ease-in-out infinite;
}

input[type="text"],
input[type="number"],
select,
textarea {
  font-family: 'Poppins', sans-serif;
  width: 100%;
  background: #fff;
  border: 1px solid rgba(106, 17, 203, 0.2);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.price-summary {
  background: linear-gradient(145deg, rgba(106, 17, 203, 0.05), rgba(255, 107, 107, 0.05));
  padding: 1.8rem;
  border-radius: 15px;
  margin: 2rem 0;
  border: 1px solid rgba(106, 17, 203, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 1.1rem;
}

.price-row.total {
  font-size: 1.3rem;
  font-weight: 600;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px dashed rgba(106, 17, 203, 0.1);
  color: #ff6b6b;
}

/* Mejora en los botones de selección */
.style-card, 
.tejido-card, 
.size-card, 
.ocasion-card, 
.dije-card {
  background: #fff;
  border: 1px solid rgba(106, 17, 203, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  color: #6a11cb;
  font-weight: 500;
}

.style-card i, 
.ocasion-card i, 
.dije-card i {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.style-card:hover i, 
.ocasion-card:hover i, 
.dije-card:hover i {
  transform: rotate(15deg);
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeIn 1s ease-out;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.header-section h2 {
  font-family: 'Dancing Script', cursive;
  font-size: 2.5rem;
  color: #6a11cb;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.8s ease-out;
}

.header-image {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.header-image:hover img {
  transform: scale(1.1);
}

.header-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  font-weight: 500;
  animation: fadeIn 1s ease-out 0.5s both;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
</style> 