import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { CreateOrderPage } from '@/features/orders/pages/CreateOrderPage';
import { InvoicesPage } from '@/features/invoices/pages/InvoicesPage';
import { CustomersPage } from '@/features/customers/pages/CustomersPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';

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
  // Aliases / Compatibility redirects
  {
    path: '/user/login',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/user/register',
    element: <Navigate to="/register" replace />,
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
        element: <Navigate to="/createorder" replace />,
      },
      {
        path: 'createorder',
        element: <CreateOrderPage />,
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
    ],
  },

  // Fallback route
  {
    path: '*',
    element: <Navigate to="/createorder" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
