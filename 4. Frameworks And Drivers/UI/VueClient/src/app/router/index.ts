/**
 * ============================================================================
 * ARCHIVO: src/app/router/index.ts
 * PROPÓSITO: Configuración de Rutas y Guardias de Navegación (Clean Architecture).
 * ============================================================================
 * Implementa:
 * 1. Rutas Públicas: /login, /register (accesibles sin token).
 * 2. Rutas Protegidas: /createorder, /invoices, /customers, /products (dentro de MainLayout).
 * 3. Redirecciones de Compatibilidad con Blazor: /user/login, /user/register, /user/logout.
 * 4. Guardia Global (beforeEach): Equivalente exacto a ProtectedRoute de React.
 *    - Si no está autenticado e intenta entrar a una ruta protegida -> redirige a /login guardando la ruta intentada.
 *    - Si ya está autenticado e intenta ir a /login -> redirige automáticamente a /createorder.
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/core/auth/useAuthStore';
import MainLayout from '@/shared/layouts/MainLayout.vue';
import LoginPage from '@/features/auth/pages/LoginPage.vue';
import RegisterPage from '@/features/auth/pages/RegisterPage.vue';
import CreateOrderPage from '@/features/orders/pages/CreateOrderPage.vue';
import InvoicesPage from '@/features/invoices/pages/InvoicesPage.vue';
import CustomersPage from '@/features/customers/pages/CustomersPage.vue';
import ProductsPage from '@/features/products/pages/ProductsPage.vue';

const routes: RouteRecordRaw[] = [
  // --- Rutas Públicas (Autenticación) ---
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { public: true },
  },

  // --- Rutas de Compatibilidad Histórica (Vistas heredadas de Blazor) ---
  {
    path: '/user/login',
    redirect: '/login',
  },
  {
    path: '/user/register',
    redirect: '/register',
  },
  {
    path: '/user/logout',
    redirect: () => {
      try {
        const authStore = useAuthStore();
        authStore.logout();
      } catch {
        localStorage.removeItem('tokens');
      }
      return '/login';
    },
  },

  // --- Rutas Protegidas (Envueltas en el diseño principal MainLayout) ---
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/createorder',
      },
      {
        path: 'createorder',
        name: 'CreateOrder',
        component: CreateOrderPage,
      },
      {
        path: 'invoices',
        name: 'Invoices',
        component: InvoicesPage,
      },
      {
        path: 'customers',
        name: 'Customers',
        component: CustomersPage,
      },
      {
        path: 'products',
        name: 'Products',
        component: ProductsPage,
      },
    ],
  },

  // --- Ruta de Captura / Fallback 404 ---
  {
    path: '/:pathMatch(.*)*',
    redirect: '/createorder',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Guardia de navegación global (Navigation Guard):
 * Evalúa en cada cambio de ruta el estado de autenticación en Pinia.
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isPublic = to.meta.public === true;
  const isAuthenticated = authStore.isAuthenticated;

  // Caso 1: Ruta privada sin autenticación -> Ir a Login
  if (!isPublic && !isAuthenticated) {
    next({
      path: '/login',
      query: { from: to.fullPath },
    });
  } 
  // Caso 2: Ya autenticado intentando entrar a Login o Register -> Redirigir a módulo principal
  else if (isPublic && isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/createorder');
  } 
  // Caso 3: Acceso permitido
  else {
    next();
  }
});

export default router;
