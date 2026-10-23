/**
 * AppRouter.ts
 * ============================================================================
 * Configuración oficial de rutas y guardias de seguridad en Vue Router 4.
 * ============================================================================
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
import SettingsPage from '@/features/settings/pages/SettingsPage.vue';

export const routes: RouteRecordRaw[] = [
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
        path: 'create-order',
        redirect: '/createorder',
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
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsPage,
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
 * Navigation Guard Global: Equivalente exacto a ProtectedRoute.tsx
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
