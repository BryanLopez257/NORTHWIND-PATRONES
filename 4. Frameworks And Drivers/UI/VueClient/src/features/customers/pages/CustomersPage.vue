<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Users,
  UserPlus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  User,
  Building2,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-vue-next';
import {
  Button,
  Input,
  Badge,
  Dialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Pagination,
} from '@/shared/ui';
import { useDebounce } from '@/shared/utils/useDebounce';
import { useCustomers, useDeleteCustomer } from '../composables/useCustomers';
import type { CustomerDto, CustomerFilters } from '../types';
import CustomerModal from '../components/CustomerModal.vue';
import { getErrorMessage } from '@/core/api/apiClient';
import { cn } from '@/shared/utils/cn';

const searchTermInput = ref('');
const debouncedSearchTerm = useDebounce(searchTermInput, 350);

const customerTypeFilter = ref('Todos');
const balanceFilter = ref<number>(0);
const minBalanceInput = ref<string>('');
const maxBalanceInput = ref<string>('');
const orderBy = ref<'name' | 'id' | 'balance'>('name');
const ascending = ref<boolean>(true);

// Modal states
const modalOpen = ref(false);
const selectedCustomer = ref<CustomerDto | null>(null);

// Delete modal state
const customerToDelete = ref<CustomerDto | null>(null);
const deleteError = ref<string | null>(null);

const deleteCustomerMutation = useDeleteCustomer();

const filters = computed<CustomerFilters>(() => {
  const parsedMinBalance =
    minBalanceInput.value !== '' && !isNaN(Number(minBalanceInput.value))
      ? Number(minBalanceInput.value)
      : undefined;
  const parsedMaxBalance =
    maxBalanceInput.value !== '' && !isNaN(Number(maxBalanceInput.value))
      ? Number(maxBalanceInput.value)
      : undefined;

  return {
    searchTerm: debouncedSearchTerm.value,
    customerType: customerTypeFilter.value !== 'Todos' ? customerTypeFilter.value : undefined,
    balanceFilter: balanceFilter.value > 0 ? balanceFilter.value : undefined,
    minBalance: parsedMinBalance,
    maxBalance: parsedMaxBalance,
    orderBy: orderBy.value,
    ascending: ascending.value,
  };
});

const {
  data: customers,
  isLoading,
  isError,
  error,
  refetch,
  isFetching,
} = useCustomers(filters);

const customerItems = computed(() => customers.value ?? []);

const currentPage = ref(1);
const pageSize = 10;

watch([searchTermInput, customerTypeFilter, balanceFilter, minBalanceInput, maxBalanceInput, orderBy, ascending], () => {
  currentPage.value = 1;
});

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return customerItems.value.slice(start, start + pageSize);
});


const handleOpenCreate = () => {
  selectedCustomer.value = null;
  modalOpen.value = true;
};

const handleOpenEdit = (customer: CustomerDto) => {
  selectedCustomer.value = customer;
  modalOpen.value = true;
};

const handleResetFilters = () => {
  searchTermInput.value = '';
  customerTypeFilter.value = 'Todos';
  balanceFilter.value = 0;
  minBalanceInput.value = '';
  maxBalanceInput.value = '';
  orderBy.value = 'name';
  ascending.value = true;
};

const handleConfirmDelete = async () => {
  if (!customerToDelete.value) return;
  deleteError.value = null;
  try {
    await deleteCustomerMutation.mutateAsync(customerToDelete.value.id);
    customerToDelete.value = null;
  } catch (err: unknown) {
    deleteError.value = getErrorMessage(
      err,
      'No se pudo eliminar el cliente. Verifique que no posea órdenes activas en el sistema.'
    );
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

const hasActiveFilters = computed(() => {
  return (
    searchTermInput.value.trim() !== '' ||
    customerTypeFilter.value !== 'Todos' ||
    balanceFilter.value !== 0 ||
    minBalanceInput.value !== '' ||
    maxBalanceInput.value !== '' ||
    orderBy.value !== 'name' ||
    !ascending.value
  );
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users class="h-7 w-7 text-sky-600" />
          Gestión de Clientes
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Administra los clientes comerciales, sus límites y balances de cuenta con segmentación de saldos.
        </p>
      </div>
      <Button @click="handleOpenCreate" class="shadow-sm shrink-0">
        <UserPlus class="h-4 w-4 mr-2" />
        Nuevo Cliente
      </Button>
    </div>

    <!-- Segmentación Superior de Tipo de Cliente -->
    <div class="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-fit border border-slate-200">
      <button
        type="button"
        @click="customerTypeFilter = 'Todos'"
        :class="
          cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            customerTypeFilter === 'Todos'
              ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          )
        "
      >
        <Users class="h-3.5 w-3.5" />
        <span>Todos los Clientes</span>
      </button>

      <button
        type="button"
        @click="customerTypeFilter = 'Empresa'"
        :class="
          cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            customerTypeFilter === 'Empresa'
              ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          )
        "
      >
        <Building2 class="h-3.5 w-3.5 text-sky-600" />
        <span>Empresas</span>
      </button>

      <button
        type="button"
        @click="customerTypeFilter = 'Persona Natural'"
        :class="
          cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            customerTypeFilter === 'Persona Natural'
              ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          )
        "
      >
        <User class="h-3.5 w-3.5 text-indigo-600" />
        <span>Personas Naturales</span>
      </button>
    </div>

    <!-- Filtros de Búsqueda y Segmentación -->
    <Card class="border-slate-200 shadow-xs">
      <CardContent class="p-4 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <!-- Búsqueda por texto -->
          <div class="lg:col-span-4">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Búsqueda por Nombre o ID
            </label>
            <div class="relative">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por ALFKI o Alfreds..."
                v-model="searchTermInput"
                class="pl-9"
              />
            </div>
          </div>

          <!-- Filtro de saldo -->
          <div class="lg:col-span-3">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Estado de Cuenta (Saldo)
            </label>
            <select
              v-model.number="balanceFilter"
              class="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option :value="0">Todos los Saldos</option>
              <option :value="1">Al Día (Saldo $0.00)</option>
              <option :value="2">Con Saldo Pendiente (> $0.00)</option>
              <option :value="3">Saldo Alto (>= $100.00)</option>
            </select>
          </div>

          <!-- Rango Min - Max -->
          <div class="lg:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Saldo Mín.
              </label>
              <Input
                type="number"
                placeholder="0.00"
                v-model="minBalanceInput"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Saldo Máx.
              </label>
              <Input
                type="number"
                placeholder="500.00"
                v-model="maxBalanceInput"
              />
            </div>
          </div>

          <!-- Ordenación -->
          <div class="lg:col-span-2 flex gap-1 items-center">
            <div class="flex-1">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Ordenar
              </label>
              <select
                v-model="orderBy"
                class="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="name">Nombre</option>
                <option value="id">ID</option>
                <option value="balance">Saldo</option>
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              @click="ascending = !ascending"
              class="h-10 w-10 mt-5 shrink-0"
              :title="ascending ? 'Ascendente (clic para descendente)' : 'Descendente (clic para ascendente)'"
            >
              <ArrowUpDown class="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </div>

        <!-- Botones de Acción de Filtros -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span class="text-slate-500 font-medium">
            Se encontraron <strong class="text-slate-800">{{ customerItems.length }}</strong> cliente(s)
          </span>

          <div class="flex items-center gap-2">
            <Button
              v-if="hasActiveFilters"
              type="button"
              variant="ghost"
              size="sm"
              @click="handleResetFilters"
              class="h-8 text-xs text-slate-500 hover:text-slate-700"
            >
              <RotateCcw class="h-3 w-3 mr-1" />
              Restablecer Filtros
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="() => refetch()"
              :disabled="isFetching"
              class="h-8 text-xs text-slate-600"
            >
              <RefreshCw :class="cn('h-3 w-3 mr-1', isFetching && 'animate-spin')" />
              Actualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tabla de Clientes -->
    <Card class="border-slate-200 shadow-xs overflow-hidden">
      <CardContent class="p-0">
        <div v-if="isLoading" class="p-12 text-center text-slate-500">
          <RefreshCw class="h-8 w-8 mx-auto text-sky-600 animate-spin mb-3" />
          <p class="font-medium text-sm">Cargando catálogo de clientes...</p>
        </div>

        <div v-else-if="isError" class="p-8 text-center text-rose-600 space-y-2">
          <AlertCircle class="h-8 w-8 mx-auto text-rose-500" />
          <p class="font-semibold text-sm">Error al cargar clientes</p>
          <p class="text-xs text-slate-500">{{ getErrorMessage(error) }}</p>
          <Button variant="outline" size="sm" @click="() => refetch()" class="mt-2">
            Reintentar
          </Button>
        </div>

        <div v-else-if="customerItems.length === 0" class="p-12 text-center text-slate-400 space-y-3">
          <Users class="h-10 w-10 mx-auto text-slate-300" />
          <p class="font-medium text-sm text-slate-600">No se encontraron clientes</p>
          <p class="text-xs text-slate-400">Intente modificar los filtros de búsqueda o registre un nuevo cliente.</p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-24">ID</TableHead>
              <TableHead>Nombre o Razón Social</TableHead>
              <TableHead>Tipo de Cliente</TableHead>
              <TableHead class="text-right">Saldo Comercial</TableHead>
              <TableHead class="text-center w-32">Estado</TableHead>
              <TableHead class="text-right w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="c in paginatedCustomers" :key="c.id">
              <TableCell class="font-mono text-xs font-bold text-sky-700">
                {{ c.id }}
              </TableCell>
              <TableCell class="font-medium text-slate-900">
                {{ c.name }}
              </TableCell>
              <TableCell>
                <Badge
                  v-if="c.customerType === 'Empresa'"
                  variant="info"
                  class="inline-flex items-center gap-1"
                >
                  <Building2 class="w-3 h-3 text-sky-600" />
                  <span>Empresa</span>
                </Badge>
                <Badge
                  v-else
                  variant="default"
                  class="inline-flex items-center gap-1"
                >
                  <User class="w-3 h-3 text-indigo-600" />
                  <span>Persona Natural</span>
                </Badge>
              </TableCell>
              <TableCell class="text-right font-mono font-semibold">
                <span :class="c.currentBalance === 0 ? 'text-emerald-700' : 'text-rose-600'">
                  {{ formatCurrency(c.currentBalance) }}
                </span>
              </TableCell>
              <TableCell class="text-center">
                <Badge
                  v-if="c.currentBalance === 0"
                  variant="success"
                  class="inline-flex items-center gap-1"
                >
                  <CheckCircle2 class="w-3 h-3" />
                  <span>Al Día</span>
                </Badge>
                <Badge
                  v-else-if="c.currentBalance >= 100"
                  variant="danger"
                  class="inline-flex items-center gap-1"
                >
                  <AlertCircle class="w-3 h-3" />
                  <span>Saldo Alto</span>
                </Badge>
                <Badge
                  v-else
                  variant="warning"
                  class="inline-flex items-center gap-1"
                >
                  <Clock class="w-3 h-3" />
                  <span>Con Saldo</span>
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="handleOpenEdit(c)"
                    title="Editar cliente"
                    class="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                  >
                    <Edit2 class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="
                      () => {
                        deleteError = null;
                        customerToDelete = c;
                      }
                    "
                    title="Eliminar cliente"
                    class="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Pagination v-model:current-page="currentPage" :total-items="customerItems.length" :page-size="pageSize" item-name="clientes" />
      </CardContent>
    </Card>

    <!-- Create / Edit Modal -->
    <CustomerModal
      :open="modalOpen"
      @update:open="modalOpen = $event"
      :customer-to-edit="selectedCustomer"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog
      :open="Boolean(customerToDelete)"
      @update:open="
        (open) => {
          if (!open) {
            customerToDelete = null;
            deleteError = null;
          }
        }
      "
      title="Eliminar Cliente"
      description="Esta acción eliminará el cliente del sistema de forma permanente."
    >
      <div class="space-y-4">
        <div
          v-if="deleteError"
          class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
        >
          <AlertCircle class="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <div class="flex-1 whitespace-pre-line">{{ deleteError }}</div>
        </div>

        <p class="text-sm text-slate-600">
          ¿Está seguro de eliminar al cliente
          <strong class="text-slate-900">{{ customerToDelete?.name }}</strong> con ID
          <span class="font-mono text-sky-700 font-semibold">{{ customerToDelete?.id }}</span
          >? Esta acción no se puede deshacer.
        </p>

        <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            @click="
              () => {
                customerToDelete = null;
                deleteError = null;
              }
            "
            :disabled="deleteCustomerMutation.isPending.value"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            @click="handleConfirmDelete"
            :is-loading="deleteCustomerMutation.isPending.value"
          >
            Eliminar Cliente
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
