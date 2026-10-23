import React, { useEffect } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { CreateOrderPage } from '@/features/orders/pages/CreateOrderPage';
import { InvoicesPage } from '@/features/invoices/pages/InvoicesPage';
import { CustomersPage } from '@/features/customers/pages/CustomersPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { useAuthStore } from '@/core/auth/useAuthStore';

// Componente para manejar la ruta histórica /user/logout de Blazor
const LogoutRedirect: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  // Aliases / Compatibility redirects con Blazor
  {
    path: '/user/login',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/user/register',
    element: <Navigate to="/register" replace />,
  },
  {
    path: '/user/logout',
    element: <LogoutRedirect />,
  },

  // Protected routes within MainLayout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/create-order" replace />,
      },
      {
        path: 'create-order',
        element: <CreateOrderPage />,
      },
      // Compatibilidad con la ruta anterior
      {
        path: 'createorder',
        element: <Navigate to="/create-order" replace />,
      },
      {
        path: 'invoices',
        element: <InvoicesPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Fallback route
  {
    path: '*',
    element: <Navigate to="/create-order" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
