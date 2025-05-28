<script>
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import NotificationComponent from './components/NotificationComponent.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
    NotificationComponent
  },
  setup() {
    const authStore = useAuthStore()
    
    onMounted(() => {
      // Inicializar el store al montar la aplicación
      authStore.initialize()
    })

    return {}
  }
}
</script>

<template>
  <div id="app">
    <NotificationComponent />
    <header-component />
    <main>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
    <footer-component />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #FFE4D6; /* Color tipo piel suave */
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  margin-top: 80px; /* Ajustar según la altura del header */
  padding: 20px;
  background-color: #FFE4D6; /* Color tipo piel suave */
}

/* Asegurar que los enlaces de navegación sean clickeables */
.nav-btn {
  pointer-events: auto !important;
  cursor: pointer !important;
}

.router-link-active {
  pointer-events: auto !important;
  cursor: pointer !important;
}

/* Prevenir comportamiento no deseado en la navegación */
.nav-links a {
  pointer-events: auto !important;
}
</style>
