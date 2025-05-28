<template>
  <div class="admin-sidebar">
    <nav>
      <router-link to="/admin/dashboard" class="nav-item">
        <i class="fas fa-chart-line"></i>
        <span>Panel de Control</span>
      </router-link>
      <router-link to="/admin/pedidos" class="nav-item">
        <i class="fas fa-shopping-cart"></i>
        <span>Pedidos Estándar</span>
      </router-link>
      <router-link to="/admin/pedidos-personalizados" class="nav-item">
        <i class="fas fa-paint-brush"></i>
        <span>Pedidos Personalizados</span>
      </router-link>
      <router-link to="/admin/clientes" class="nav-item">
        <i class="fas fa-users"></i>
        <span>Clientes</span>
      </router-link>
      <router-link to="/admin/productos-fabricacion" class="nav-item">
        <i class="fas fa-box"></i>
        <span>Productos de Fabricación</span>
      </router-link>
      <router-link to="/admin/empleados" class="nav-item">
        <i class="fas fa-users"></i>
        <span>Empleados</span>
      </router-link>
      <router-link to="/admin/administradores" class="nav-item">
        <i class="fas fa-user-shield"></i>
        <span>Administradores</span>
      </router-link>
      <router-link to="/admin/reseñas" class="nav-item">
        <i class="fas fa-star"></i>
        <span>Reseñas</span>
      </router-link>
    </nav>
  </div>
</template> 