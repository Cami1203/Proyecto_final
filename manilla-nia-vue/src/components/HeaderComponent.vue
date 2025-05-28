<template>
  <header class="header-gradient">
    <nav class="nav-container">
      <router-link to="/" class="logo-text">
        <span class="brand brand-main">Manilla</span><span class="brand brand-highlight">Nia</span>
      </router-link>
      <div class="nav-content">
        <div class="nav-links" v-if="!isAdminRoute">
          <router-link to="/" class="nav-btn" exact>Inicio</router-link>
          <router-link to="/productos" class="nav-btn">Productos</router-link>
          <router-link to="/personalizar" class="nav-btn">Personalizar</router-link>
          <router-link to="/contacto" class="nav-btn">Contacto</router-link>
          <router-link to="/acerca-de" class="nav-btn">Acerca de</router-link>
          <router-link to="/carrito" class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
            <span v-if="cartItemsCount" class="cart-count">{{ cartItemsCount }}</span>
          </router-link>
        </div>
        <div class="auth-buttons">
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="nav-btn btn-login">Iniciar Sesión</router-link>
            <router-link to="/registro" class="nav-btn btn-register">Registrarse</router-link>
          </template>
          <template v-else>
            <div class="profile-menu-wrapper">
              <button 
                class="profile-trigger" 
                :class="{ 'admin-profile': isAdmin }"
                @click="toggleMenu"
                @mouseenter="showMenu = true"
              >
                <svg class="user-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" :fill="isAdmin ? '#38ef7d' : '#6a11cb'"/>
                  <ellipse cx="12" cy="17" rx="7" ry="5" fill="#e0e7ef"/>
                </svg>
                <span class="profile-name">{{ userName }}</span>
                <i class="fas fa-chevron-down"></i>
              </button>
              <div 
                v-if="showMenu" 
                class="profile-dropdown"
                @mouseenter="showMenu = true"
                @mouseleave="showMenu = false"
              >
                <router-link v-if="!isAdmin" to="/perfil" class="dropdown-item" @click="showMenu = false">Mi Perfil</router-link>
                <router-link v-if="isAdmin" to="/admin/dashboard" class="dropdown-item" @click="showMenu = false">
                  <i class="fas fa-user-shield"></i> Panel de Administrador
                </router-link>
                <button class="dropdown-item" @click="logout">Cerrar Sesión</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

export default {
  name: 'HeaderComponent',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const cartStore = useCartStore()

    const isLoggedIn = computed(() => authStore.isAuthenticated)
    const isAdmin = computed(() => authStore.isAdmin)
    const isAdminRoute = computed(() => route.path.startsWith('/admin'))
    const cartItemsCount = computed(() => cartStore.itemCount)
    const showMenu = ref(false)
    const userName = computed(() => authStore.user?.nombre || 'Usuario')
    
    const toggleMenu = () => { 
      showMenu.value = !showMenu.value 
    }

    const logout = async () => {
      await authStore.logout()
      showMenu.value = false
    }

    // Cerrar el menú cuando cambia la ruta
    watch(() => route.path, () => {
      showMenu.value = false
    })

    onMounted(() => {
      authStore.checkAuth()
    })

    return {
      isLoggedIn,
      isAdmin,
      isAdminRoute,
      cartItemsCount,
      logout,
      showMenu,
      toggleMenu,
      userName
    }
  }
}
</script>

<style scoped>
.header-gradient {
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 2px 10px rgba(106,17,203,0.2);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.7rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-text {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-decoration: none;
  font-family: 'Montserrat', 'Poppins', Arial, sans-serif;
}

.brand-main {
  color: #fff;
}

.brand-highlight {
  color: #FFD600;
  font-weight: 900;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-links {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.nav-btn {
  background: rgba(255,255,255,0.08);
  color: #fff;
  border: none;
  border-radius: 2rem;
  padding: 0.35rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(106,17,203,0.04);
  outline: none;
  position: relative;
  overflow: hidden;
  min-width: 90px;
  text-align: center;
  transform-origin: center;
}

.btn-login {
  background: linear-gradient(45deg, #FF416C, #FF4B2B);
  box-shadow: 0 2px 8px rgba(255,65,108,0.2);
}

.btn-login:hover {
  background: linear-gradient(45deg, #FF4B2B, #FF416C);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(255,65,108,0.3);
}

.btn-register {
  background: linear-gradient(45deg, #11998e, #38ef7d);
  box-shadow: 0 2px 8px rgba(17,153,142,0.2);
}

.btn-register:hover {
  background: linear-gradient(45deg, #38ef7d, #11998e);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(17,153,142,0.3);
}

.nav-btn:not(.btn-login):not(.btn-register):hover {
  background: #FFD600;
  color: #333;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(106,17,203,0.15);
}

.nav-btn:not(.btn-login):not(.btn-register).router-link-exact-active,
.nav-btn:not(.btn-login):not(.btn-register).router-link-active {
  background: #fff;
  color: #2575fc;
  font-weight: 700;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(37,117,252,0.15);
}

.profile-menu-wrapper {
  position: relative;
  display: inline-block;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(106,17,203,0.2);
}

.profile-trigger:hover {
  background: linear-gradient(45deg, #2575fc, #6a11cb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(106,17,203,0.3);
}

.user-icon {
  margin-right: 0.5rem;
}

.profile-name {
  font-weight: 600;
  margin-right: 0.5rem;
  color: #fff;
  transition: color 0.3s ease;
}

.profile-trigger:hover .profile-name {
  color: #FFD600;
}

/* Estilos específicos para administrador */
.profile-trigger.admin-profile {
  background: linear-gradient(45deg, #11998e, #38ef7d);
  box-shadow: 0 2px 8px rgba(17,153,142,0.2);
}

.profile-trigger.admin-profile:hover {
  background: linear-gradient(45deg, #38ef7d, #11998e);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,153,142,0.3);
}

.profile-trigger.admin-profile .profile-name {
  color: #fff;
}

.profile-trigger.admin-profile:hover .profile-name {
  color: #fff;
}

.dropdown-item i.fa-user-shield {
  color: #38ef7d;
}

.dropdown-item:hover i.fa-user-shield {
  color: #11998e;
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-width: 200px;
  z-index: 1000;
  margin-top: 5px;
  padding: 8px 0;
  animation: fadeIn 0.2s ease-out;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 1rem;
}

.dropdown-item i {
  width: 20px;
  text-align: center;
  color: #6a11cb;
  transition: color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item:hover i {
  color: #2575fc;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-icon {
  position: relative;
  font-size: 1.7rem;
  color: #2575fc;
  text-decoration: none;
  margin: 0 0.5rem;
  transition: color 0.2s;
  background: #fff;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(37,117,252,0.10);
  border: 2px solid #e0e7ef;
}

.cart-icon:hover {
  background: #FFD600;
  color: #333;
}

.cart-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ff5252;
  color: white;
  border-radius: 50%;
  padding: 0.2rem 0.6rem;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255,82,82,0.15);
  border: 2px solid #fff;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

@media (max-width: 900px) {
  .nav-container {
    flex-direction: column;
    gap: 0.7rem;
    padding: 0.7rem 0.5rem;
  }
  .nav-content {
    flex-direction: column;
    width: 100%;
  }
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
  }
  .auth-buttons {
    width: 100%;
    justify-content: center;
  }
  .nav-btn {
    min-width: auto;
    padding: 0.35rem 0.8rem;
  }
}
</style> 