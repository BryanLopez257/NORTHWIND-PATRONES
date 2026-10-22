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
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { Button } from '@/shared/ui/Button';
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
    { label: 'Nueva Orden', path: '/createorder', icon: ShoppingCart },
    { label: 'Facturas', path: '/invoices', icon: Receipt },
    { label: 'Clientes', path: '/customers', icon: Users },
    { label: 'Productos', path: '/products', icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
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
                        ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs border-r-2 border-sky-600'
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
                  <div className="bg-sky-600 text-white p-1.5 rounded-lg">
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
                            ? 'bg-sky-50 text-sky-700 font-semibold'
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
                  <div className="h-9 w-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium text-slate-800">{user?.name || 'Usuario'}</span>
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
                  className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Modal de Confirmación de Cierre de Sesión */}
      <Dialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Confirmar Salida"
        description="Gestión del ciclo de sesión de usuario"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">¿Está seguro de que desea salir del sistema?</p>
              <p className="text-xs text-amber-700 mt-1">
                Esta acción revocará su token de acceso y lo redirigirá a la pantalla de inicio de sesión.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Volver
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Confirmar Salida
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
