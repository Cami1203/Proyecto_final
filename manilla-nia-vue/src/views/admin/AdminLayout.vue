<template>
  <div class="admin-layout">
    <nav class="admin-sidebar">
      <div class="admin-header">
        <h2>Panel de Administración</h2>
      </div>
      <ul class="admin-menu">
        <li>
          <router-link to="/admin/dashboard" class="admin-menu-item">
            <i class="fas fa-tachometer-alt"></i>
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/admin/clientes" class="admin-menu-item">
            <i class="fas fa-users"></i>
            Clientes
          </router-link>
        </li>
        <li>
          <router-link to="/admin/pedidos" class="admin-menu-item">
            <i class="fas fa-shopping-cart"></i>
            Pedidos Estándar
          </router-link>
        </li>
        <li>
          <router-link to="/admin/pedidos-personalizados" class="admin-menu-item">
            <i class="fas fa-paint-brush"></i>
            Pedidos Personalizados
          </router-link>
        </li>
        <li>
          <router-link to="/admin/mensajes" class="admin-menu-item">
            <i class="fas fa-envelope"></i>
            Mensajes de Clientes
          </router-link>
        </li>
        <li>
          <router-link to="/admin/reseñas" class="admin-menu-item">
            <i class="fas fa-star"></i>
            Reseñas
          </router-link>
        </li>
        <li>
          <router-link to="/admin/inventario" class="admin-menu-item">
            <i class="fas fa-boxes"></i>
            Inventario
          </router-link>
        </li>
        <li>
          <router-link to="/admin/productos-fabricacion" class="admin-menu-item">
            <i class="fas fa-box"></i>
            Productos de Fabricación
          </router-link>
        </li>
        <li>
          <router-link to="/admin/empleados" class="admin-menu-item">
            <i class="fas fa-users"></i>
            Empleados
          </router-link>
        </li>
        <li>
          <router-link to="/admin/administradores" class="admin-menu-item">
            <i class="fas fa-user-shield"></i>
            Administradores
          </router-link>
        </li>
        <li>
          <router-link to="/admin/envios" class="admin-menu-item">
            <i class="fas fa-truck"></i>
            Envíos
          </router-link>
        </li>
        <li>
          <a href="#" @click.prevent="logout" class="admin-menu-item">
            <i class="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </a>
        </li>
      </ul>
    </nav>
    <main class="admin-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminLayout',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      logout
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
}

.admin-header {
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.admin-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
}

.admin-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s;
}

.admin-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.admin-menu-item i {
  margin-right: 0.75rem;
  width: 20px;
  text-align: center;
}

.admin-menu-item.router-link-active {
  background-color: #3498db;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
}
</style> 