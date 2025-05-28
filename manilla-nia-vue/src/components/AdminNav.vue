<!-- Componente de navegación lateral para la sección de administración -->
<template>
  <nav class="admin-nav">
    <!-- Enlace al Dashboard principal del admin -->
    <router-link to="/admin" class="nav-item">
      <i class="fas fa-chart-line"></i> <!-- Icono de gráfica (dashboard) -->
      <span>Dashboard</span> <!-- Etiqueta del enlace -->
    </router-link>

    <!-- Enlace a la sección de reseñas -->
    <router-link to="/admin/reseñas" class="nav-item">
      <i class="fas fa-star"></i> <!-- Icono de estrella (reseñas) -->
      <span>Reseñas</span>
    </router-link>

    <!-- Enlace a la sección de mensajes -->
    <router-link to="/admin/mensajes" class="nav-item">
      <i class="fas fa-envelope"></i> <!-- Icono de sobre (mensajes) -->
      <span>Mensajes</span>
    </router-link>

    <!-- Enlace a la gestión de productos -->
    <router-link to="/admin/productos" class="nav-item">
      <i class="fas fa-box"></i> <!-- Icono de caja (productos) -->
      <span>Productos</span>
    </router-link>

    <!-- Enlace al inventario de productos -->
    <router-link to="/admin/inventario" class="nav-item">
      <i class="fas fa-warehouse"></i> <!-- Icono de bodega (inventario) -->
      <span>Inventario</span>
    </router-link>

    <!-- Enlace a gestión de empleados, visible solo para el administrador principal -->
    <router-link v-if="isMainAdmin" to="/admin/empleados" class="nav-item">
      <i class="fas fa-users"></i> <!-- Icono de grupo de personas (empleados) -->
      <span>Empleados</span>
    </router-link>

    <!-- Enlace a gestión de otros administradores, solo visible para el admin principal -->
    <router-link v-if="isMainAdmin" to="/admin/administradores" class="nav-item">
      <i class="fas fa-user-shield"></i> <!-- Icono de escudo (administradores) -->
      <span>Administradores</span>
    </router-link>
  </nav>
</template>

<script setup>
// Importamos la función `computed` de Vue para crear propiedades computadas
import { computed } from 'vue'

// Importamos el store de autenticación donde se guarda el usuario logueado
import { useAuthStore } from '../stores/auth'

// Obtenemos la instancia del store de autenticación
const authStore = useAuthStore()

// Propiedad computada que determina si el usuario actual es el administrador principal
// Se compara el correo del usuario logueado con uno específico
const isMainAdmin = computed(() => {
  return authStore.user?.correo === 'admin@manillania.com'
})
</script>

<style scoped>
/* Estilo principal del contenedor del menú de navegación */
.admin-nav {
  display: flex; /* Organiza los elementos en columna */
  flex-direction: column;
  gap: 0.5rem; /* Espacio entre cada enlace */
  padding: 1rem; /* Espaciado interno */
}

/* Estilo base de cada enlace del menú */
.nav-item {
  display: flex; /* Coloca el icono y el texto en una fila */
  align-items: center; /* Centra verticalmente el contenido */
  gap: 0.75rem; /* Espacio entre icono y texto */
  padding: 0.75rem 1rem; /* Relleno interno */
  color: #4a5568; /* Color de texto gris */
  text-decoration: none; /* Quita subrayado */
  border-radius: 0.5rem; /* Bordes redondeados */
  transition: all 0.2s; /* Animación suave al pasar el mouse */
}

/* Estilo cuando el usuario pasa el mouse sobre el enlace */
.nav-item:hover {
  background-color: #f7fafc; /* Fondo claro al pasar el mouse */
  color: #2d3748; /* Texto un poco más oscuro */
}

/* Estilo para el enlace activo (el que corresponde a la ruta actual) */
.nav-item.router-link-active {
  background-color: #ebf8ff; /* Fondo celeste claro */
  color: #2b6cb0; /* Color de texto azul */
}

/* Estilo para los íconos dentro del enlace */
.nav-item i {
  width: 1.5rem; /* Tamaño fijo para alinear todos los íconos */
  text-align: center; /* Centra el icono horizontalmente */
}
</style>
