import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Receipt,
  Users,
  Package,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Store,
} from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { Button } from '@/shared/ui/Button';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Nueva Orden', path: '/createorder', icon: ShoppingCart },
    { label: 'Facturas', path: '/invoices', icon: Receipt },
    { label: 'Clientes', path: '/customers', icon: Users },
    { label: 'Productos', path: '/products', icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-sky-600 text-white p-2 rounded-lg shadow-sm">
                  <Store className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  NorthWind <span className="text-sky-600 font-medium text-sm">Sales</span>
                </span>
              </div>
            </div>

            {/* User profile & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-right">
                <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-xs border border-sky-200">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-slate-800 leading-tight">
                    {user?.name || 'Usuario'}
                  </span>
                  <span className="text-xs text-slate-500 leading-tight truncate max-w-[150px]">
                    {user?.email || 'usuario@northwind.com'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 pr-6 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex">
            <div className="w-64 bg-white p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Menú de Navegación</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="mt-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                            isActive
                              ? 'bg-sky-50 text-sky-700 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`
                        }
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
