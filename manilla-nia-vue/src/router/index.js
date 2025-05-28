import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Registro from '../views/Registro.vue'
import Productos from '../views/Productos.vue'
import Carrito from '../views/Carrito.vue'
import Pedidos from '../views/Pedidos.vue'
import DetallePedido from '../views/DetallePedido.vue'
import Perfil from '../views/Perfil.vue'
import AcercaDe from '../views/AcercaDe.vue'
import { useAuthStore } from '../stores/auth'
import MensajesClientesView from '../views/admin/MensajesClientes.vue'
import AdministradoresView from '../views/admin/Administradores.vue'
import InventarioView from '../views/admin/Inventario.vue'
import ProductosFabricacion from '../views/admin/ProductosFabricacion.vue'
import Empleados from '../views/admin/Empleados.vue'
import Reseñas from '../views/admin/Reseñas.vue'
import AdminEnvios from '../views/admin/Envios.vue'

// Función para verificar si es el administrador principal
const isMainAdmin = (to, from, next) => {
  const authStore = useAuthStore()
  // Permitimos el acceso a la ruta, la vista se encargará de mostrar el mensaje
  next()
}
// desde aqui se define las rutas para luego hacer uso de ellas
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/registro',
    name: 'registro',
    component: Registro,
    meta: { requiresAuth: false }
  },
  {
    path: '/productos',
    name: 'productos',
    component: Productos
  },
  {
    path: '/carrito',
    name: 'carrito',
    component: Carrito,
    meta: { requiresAuth: true } // solo usuarios logueados por el requiresAuth
  },
  {
    path: '/pedidos',
    name: 'pedidos',
    component: Pedidos,
    meta: { requiresAuth: true }
  },
  {
    path: '/pedidos/:id',
    name: 'detalle-pedido',
    component: DetallePedido,
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: Perfil,
    meta: { requiresAuth: true }
  },
  {
    path: '/acerca-de',
    name: 'acerca-de',
    component: AcercaDe
  },
  {
    path: '/contacto',
    name: 'contacto',
    component: () => import('../views/Contacto.vue')
  },
  {
    path: '/recuperar-password',
    name: 'recuperar-password',
    component: () => import('../views/RecuperarPassword.vue')
  },
  {
    path: '/personalizar',
    name: 'personalizar',
    component: () => import('../views/Personalizar.vue'),
    props: route => ({ 
      id: route.query.id,
      nombre: route.query.nombre,
      precio: route.query.precio,
      descripcion: route.query.descripcion
    })
  },
  // Rutas de administración
  //Área de administración (rutas protegidas por requiresAuth y requiresAdmin)
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'), // layout principal
    meta: { requiresAuth: true, requiresAdmin: true }, // se necesita login y rol admin
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'clientes',
        name: 'AdminClientes',
        component: () => import('../views/admin/Clientes.vue')
      },
      {
        path: 'pedidos',
        name: 'AdminPedidos',
        component: () => import('../views/admin/Pedidos.vue')
      },
      {
        path: 'pedidos-personalizados',
        name: 'AdminPedidosPersonalizados',
        component: () => import('../views/admin/PedidosPersonalizados.vue')
      },
      {
        path: 'mensajes',
        name: 'admin-mensajes',
        component: MensajesClientesView,
        meta: { 
          title: 'Mensajes de Clientes',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'administradores',
        name: 'admin-administradores',
        component: AdministradoresView,
        meta: { 
          title: 'Gestión de Administradores',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'inventario',
        name: 'admin-inventario',
        component: InventarioView,
        meta: { 
          title: 'Gestión de Inventario',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'productos-fabricacion',
        name: 'admin-productos-fabricacion',
        component: ProductosFabricacion,
        meta: { 
          title: 'Productos de Fabricación',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'empleados',
        name: 'admin-empleados',
        component: Empleados,
        meta: { 
          title: 'Empleados',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'reseñas',
        name: 'admin-reseñas',
        component: () => import('../views/admin/Reseñas.vue'),
        meta: { 
          title: 'Reseñas de Clientes',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'envios',
        name: 'admin-envios',
        component: AdminEnvios,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'empleados',
        name: 'admin-empleados',
        component: Empleados,
        meta: { 
          title: 'Empleados',
          requiresAuth: true,
          requiresAdmin: true,
          requiresMainAdmin: true
        }
      },
      {
        path: 'administradores',
        name: 'admin-administradores',
        component: AdministradoresView,
        meta: { 
          title: 'Gestión de Administradores',
          requiresAuth: true,
          requiresAdmin: true,
          requiresMainAdmin: true
        }
      }

    ]
  }
]
//Crear el router con historial limpio
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // utiliza modo historia limpio
  routes,
  scrollBehavior(to, from, savedPosition) {
     // controla el scroll al navegar entre páginas
    if (savedPosition) {
      return savedPosition // vuelve al scroll anterior
    } else {
      return { top: 0 } // va al inicio de la página
    }
  }
})

// Navegación guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Asegurarse de que el estado de autenticación esté actualizado
  await authStore.checkAuth() // actualiza el estado de autenticación (por ejemplo, desde localStorage o sesión)
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const isAuthRoute = to.path === '/login' || to.path === '/registro'
  

   // Si la ruta requiere autenticación y el usuario no ha iniciado sesión
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ // No ha iniciado sesión: lo mandamos al login
      path: '/login',
      query: { redirect: to.fullPath } // guarda a dónde quería ir para redirigir luego
    })
  // Si la ruta requiere ser administrador y el usuario no lo es  
  } else if (requiresAdmin && !authStore.isAdmin) {  // No es admin: no puede entrar al panel admin
    next('/') // Redirigir a la página principal si no es admin

  // Si ya está autenticado e intenta entrar a login o registro  
  } else if (isAuthRoute && authStore.isAuthenticated) {
    // Redirigir según el tipo de usuario
    if (authStore.isAdmin) {
      next('/admin/dashboard') // si es admin, redirige al panel admin
    } else {
      next('/') // si es usuario común, redirige al inicio
    }
  // Si no hay restricciones, permite el acceso  
  } else { // Todo bien: lo dejamos pasar
    next()
  }
})
//Exportar el router para usarlo en la app
export default router 