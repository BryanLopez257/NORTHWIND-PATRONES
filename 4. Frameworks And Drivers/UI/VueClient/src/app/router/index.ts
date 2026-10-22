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
  // Public routes
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

  // Aliases / Compatibility redirects con Blazor
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
    redirect: (to) => {
      try {
        const authStore = useAuthStore();
        authStore.logout();
      } catch {
        localStorage.removeItem('tokens');
      }
      return '/login';
    },
  },

  // Protected routes within MainLayout
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

  // Fallback route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/createorder',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards: Equivalent to ProtectedRoute.tsx
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isPublic = to.meta.public === true;
  const isAuthenticated = authStore.isAuthenticated;

  if (!isPublic && !isAuthenticated) {
    next({
      path: '/login',
      query: { from: to.fullPath },
    });
  } else if (isPublic && isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/createorder');
  } else {
    next();
  }
});

export default router;
