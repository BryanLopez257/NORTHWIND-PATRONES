import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Receipt,
  Users,
  Package,
  Settings,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Store,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Dialog } from '@/shared/ui/Dialog';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Nueva Orden', path: '/create-order', icon: ShoppingCart },
    { label: 'Facturas', path: '/invoices', icon: Receipt },
    { label: 'Clientes', path: '/customers', icon: Users },
    { label: 'Productos', path: '/products', icon: Package },
    { label: 'Configuración', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-xs">
                  <Store className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  NorthWind <span className="text-blue-600 font-semibold text-sm">Enterprise</span>
                </span>
              </div>
            </div>

            {/* User profile with Role Badge & Logout */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2.5 text-right">
                <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-semibold text-slate-900 leading-tight">
                      {user?.name || 'Usuario'}
                    </span>
                    <Badge variant="info" className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider">
                      {user?.role || 'Vendedor'}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 leading-tight truncate max-w-[170px]">
                    {user?.email || 'usuario@northwind.com'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 pr-5 shrink-0">
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
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border-r-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white pt-5 pb-4 shadow-xl">
              <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <Store className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-slate-900">NorthWind Sales</span>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 px-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Mobile User Footnote */}
              <div className="mt-auto px-4 pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col truncate">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-medium text-slate-800">{user?.name || 'Usuario'}</span>
                      <Badge variant="info" className="text-[9px] py-0 px-1">
                        {user?.role || 'Vendedor'}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500 truncate">{user?.email || 'usuario@northwind.com'}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Routed Page Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="¿Desea cerrar la sesión activa?"
        description="Se revocará el acceso local en este dispositivo y se requerirá autenticación nuevamente."
      >
        <div className="flex items-start space-x-3 py-2 text-slate-600 text-sm">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            Cualquier cambio sin guardar en órdenes o formularios en progreso podría perderse.
          </p>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
            Permanecer Conectado
          </Button>
          <Button variant="destructive" onClick={handleConfirmLogout}>
            Confirmar Cierre de Sesión
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
