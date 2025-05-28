<template>
  <div class="admin-panel">
    <nav class="admin-nav">
      <router-link to="/admin/pedidos" class="nav-item">
        <i class="fas fa-shopping-cart"></i>
        Pedidos
      </router-link>
      <router-link to="/admin/pedidos-personalizados" class="nav-item">
        <i class="fas fa-pencil-ruler"></i>
        Pedidos Personalizados
      </router-link>
      <router-link to="/admin/clientes" class="nav-item">
        <i class="fas fa-users"></i>
        Clientes
      </router-link>
      <router-link to="/admin/envios" class="nav-item">
        <i class="fas fa-truck"></i>
        Envíos
      </router-link>
    </nav>

    <div class="admin-content">
      <router-view></router-view>
    </div>
  </div>
</template> 