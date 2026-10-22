<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
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
} from 'lucide-vue-next';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { Button, Dialog } from '@/shared/ui';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const mobileMenuOpen = ref(false);
const showLogoutConfirm = ref(false);

const handleConfirmLogout = () => {
  showLogoutConfirm.value = false;
  authStore.logout();
  router.replace('/login');
};

const navItems = [
  { label: 'Nueva Orden', path: '/createorder', icon: ShoppingCart },
  { label: 'Facturas', path: '/invoices', icon: Receipt },
  { label: 'Clientes', path: '/customers', icon: Users },
  { label: 'Productos', path: '/products', icon: Package },
];

const isActive = (path: string) => {
  return route.path.toLowerCase() === path.toLowerCase();
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <!-- Top Navbar -->
    <header class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-3">
            <button
              type="button"
              class="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              @click="mobileMenuOpen = !mobileMenuOpen"
              aria-label="Abrir menú"
            >
              <X v-if="mobileMenuOpen" class="h-6 w-6" />
              <Menu v-else class="h-6 w-6" />
            </button>
            <div class="flex items-center space-x-2">
              <div class="bg-sky-600 text-white p-2 rounded-lg shadow-sm">
                <Store class="h-5 w-5" />
              </div>
              <span class="font-bold text-lg text-slate-900 tracking-tight">
                NorthWind <span class="text-sky-600 font-medium text-sm">Sales</span>
              </span>
            </div>
          </div>

          <!-- User profile & Logout -->
          <div class="flex items-center space-x-4">
            <div class="hidden sm:flex items-center space-x-2 text-right">
              <div class="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-xs border border-sky-200">
                <UserIcon class="h-4 w-4" />
              </div>
              <div class="flex flex-col text-left">
                <span class="text-sm font-medium text-slate-800 leading-tight">
                  {{ authStore.user?.name || 'Usuario' }}
                </span>
                <span class="text-xs text-slate-500 leading-tight truncate max-w-[150px]">
                  {{ authStore.user?.email || 'usuario@northwind.com' }}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              @click="showLogoutConfirm = true"
              class="flex items-center space-x-1.5 text-slate-600 hover:text-red-600 hover:border-red-200"
            >
              <LogOut class="h-4 w-4" />
              <span class="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Desktop Sidebar -->
      <aside class="hidden md:block w-56 pr-5 shrink-0">
        <nav class="space-y-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive(item.path)
                ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs border-r-2 border-sky-600'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Mobile Navigation Drawer -->
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 md:hidden flex">
        <div
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          @click="mobileMenuOpen = false"
        />
        <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white pt-5 pb-4 shadow-xl">
          <div class="flex items-center justify-between px-4 pb-4 border-b border-slate-100">
            <div class="flex items-center space-x-2">
              <div class="bg-sky-600 text-white p-1.5 rounded-lg">
                <Store class="h-5 w-5" />
              </div>
              <span class="font-bold text-slate-900">NorthWind Sales</span>
            </div>
            <button
              type="button"
              class="p-1 rounded-md text-slate-400 hover:text-slate-600"
              @click="mobileMenuOpen = false"
            >
              <X class="h-6 w-6" />
            </button>
          </div>

          <div class="mt-4 px-2 space-y-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              @click="mobileMenuOpen = false"
              :class="[
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium',
                isActive(item.path)
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              ]"
            >
              <component :is="item.icon" class="h-5 w-5 shrink-0" />
              <span>{{ item.label }}</span>
            </RouterLink>
          </div>

          <!-- Mobile User Footnote -->
          <div class="mt-auto px-4 pt-4 border-t border-slate-100">
            <div class="flex items-center space-x-3 mb-3">
              <div class="h-9 w-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm">
                <UserIcon class="h-5 w-5" />
              </div>
              <div class="flex flex-col truncate">
                <span class="text-sm font-medium text-slate-800">{{ authStore.user?.name || 'Usuario' }}</span>
                <span class="text-xs text-slate-500 truncate">{{ authStore.user?.email || 'usuario@northwind.com' }}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="
                () => {
                  mobileMenuOpen = false;
                  showLogoutConfirm = true;
                }
              "
              class="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut class="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <main class="flex-1 w-full overflow-hidden">
        <RouterView />
      </main>
    </div>

    <!-- Confirm Logout Modal -->
    <Dialog
      :open="showLogoutConfirm"
      @update:open="showLogoutConfirm = $event"
      title="Confirmar Salida"
      description="Gestión del ciclo de sesión de usuario"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
          <AlertTriangle class="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p class="font-semibold">¿Está seguro de que desea salir del sistema?</p>
            <p class="text-xs text-amber-700 mt-1">
              Esta acción revocará su token de acceso y lo redirigirá a la pantalla de inicio de sesión.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            @click="showLogoutConfirm = false"
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="destructive"
            @click="handleConfirmLogout"
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut class="h-4 w-4 mr-1.5" />
            Confirmar Salida
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
