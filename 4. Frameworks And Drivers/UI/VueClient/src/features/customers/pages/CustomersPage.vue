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
const searchCriteria = ref<'all' | 'id' | 'identification' | 'name' | 'lastname' | 'businessname' | 'tradename'>('all');
const debouncedSearchTerm = useDebounce(searchTermInput, 350);

const customerTypeFilter = ref('Todos');
const balanceFilter = ref<number>(0);
const minBalanceInput = ref<string>('');
const maxBalanceInput = ref<string>('');
const orderBy = ref<'name' | 'id' | 'balance'>('name');
const ascending = ref<boolean>(true);

const currentPage = ref(1);
const pageSize = 10;

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
    searchTerm: debouncedSearchTerm.value.trim() || undefined,
    criteria: searchCriteria.value !== 'all' ? searchCriteria.value : undefined,
    customerType: customerTypeFilter.value !== 'Todos' ? customerTypeFilter.value : undefined,
    balanceFilter: balanceFilter.value > 0 ? balanceFilter.value : undefined,
    minBalance: parsedMinBalance,
    maxBalance: parsedMaxBalance,
    orderBy: orderBy.value,
    ascending: ascending.value,
    pageNumber: currentPage.value,
    pageSize,
  };
});

watch(
  [searchTermInput, searchCriteria, customerTypeFilter, balanceFilter, minBalanceInput, maxBalanceInput, orderBy, ascending],
  () => {
    currentPage.value = 1;
  }
);

const {
  data: pagedData,
  isLoading,
  isError,
  error,
  refetch,
  isFetching,
} = useCustomers(filters);

const customerItems = computed(() => pagedData.value?.items ?? []);
const totalCount = computed(() => pagedData.value?.totalCount ?? 0);
const totalPages = computed(() => pagedData.value?.totalPages ?? 1);

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
  searchCriteria.value = 'all';
  customerTypeFilter.value = 'Todos';
  balanceFilter.value = 0;
  minBalanceInput.value = '';
  maxBalanceInput.value = '';
  orderBy.value = 'name';
  ascending.value = true;
  currentPage.value = 1;
};

const getSearchPlaceholder = () => {
  switch (searchCriteria.value) {
    case 'id':
      return 'Buscar por código (ej: ALFKI)...';
    case 'identification':
      return 'Buscar por cédula (10 dígitos) o RUC (13 dígitos)...';
    case 'name':
      return 'Buscar por nombres y apellidos...';
    case 'lastname':
      return 'Buscar por primer apellido...';
    case 'businessname':
      return 'Buscar por razón social de la empresa...';
    case 'tradename':
      return 'Buscar por nombre comercial...';
    case 'all':
    default:
      return 'Buscar por código, nombres o identificación...';
  }
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
    searchCriteria.value !== 'all' ||
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
        <User class="h-3.5 w-3.5" />
        <span>Personas Naturales</span>
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
        <Building2 class="h-3.5 w-3.5" />
        <span>Empresas / Jurídicas</span>
      </button>
    </div>

    <!-- Filtros y Búsqueda -->
    <Card>
      <CardContent class="pt-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <!-- Criterio de Búsqueda -->
          <div class="md:col-span-3">
            <label for="filter-criteria" class="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Criterio de Búsqueda
            </label>
            <select
              id="filter-criteria"
              v-model="searchCriteria"
              class="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
            >
              <optgroup label="Búsqueda General">
                <option value="all">🔍 Todos los campos</option>
                <option value="tradename">🏪 Nombre Comercial</option>
                <option value="identification">🪪 Cédula / RUC</option>
                <option value="id">🏷️ Código ID</option>
              </optgroup>
              <optgroup label="Personas Naturales">
                <option value="name">👤 Nombres y Apellidos</option>
                <option value="lastname">👤 Solo Primer Apellido</option>
              </optgroup>
              <optgroup label="Empresas / Jurídicas">
                <option value="businessname">🏢 Razón Social</option>
              </optgroup>
            </select>
          </div>

          <!-- Input de Búsqueda -->
          <div class="md:col-span-3">
            <label for="search-customers" class="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Término a Buscar
            </label>
            <div class="relative">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="search-customers"
                :placeholder="getSearchPlaceholder()"
                v-model="searchTermInput"
                class="pl-9"
              />
            </div>
          </div>

          <!-- Estado de Saldo -->
          <div class="md:col-span-2">
            <label for="filter-balance" class="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Estado de Saldo
            </label>
            <select
              id="filter-balance"
              v-model="balanceFilter"
              class="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
            >
              <option :value="0">Todos los Estados</option>
              <option :value="1">Al Día ($0.00)</option>
              <option :value="2">Con Saldo Pendiente (&gt; $0)</option>
              <option :value="3">Saldo Crítico (&gt;= $100)</option>
            </select>
          </div>

          <!-- Rango de Saldo -->
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Rango de Saldo ($)
            </label>
            <div class="flex items-center gap-1">
              <Input
                type="number"
                placeholder="Mín"
                v-model="minBalanceInput"
                class="h-10 text-xs px-2"
                min="0"
                step="0.01"
              />
              <span class="text-slate-400 text-xs">-</span>
              <Input
                type="number"
                placeholder="Máx"
                v-model="maxBalanceInput"
                class="h-10 text-xs px-2"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <!-- Ordenación y Botón Limpiar -->
          <div class="md:col-span-2 flex gap-2 items-center">
            <div class="flex-1">
              <label for="filter-order" class="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Ordenar
              </label>
              <select
                id="filter-order"
                v-model="orderBy"
                class="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
              >
                <option value="name">Nombre</option>
                <option value="id">Código ID</option>
                <option value="balance">Saldo</option>
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              @click="ascending = !ascending"
              :title="ascending ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'"
              class="h-10 w-10 shrink-0 self-end"
            >
              <ArrowUpDown class="h-4 w-4" />
            </Button>

            <Button
              v-if="hasActiveFilters"
              type="button"
              variant="ghost"
              size="icon"
              @click="handleResetFilters"
              title="Restablecer todos los filtros"
              class="h-10 w-10 shrink-0 self-end text-slate-500 hover:text-slate-800"
            >
              <RotateCcw class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tabla de Clientes -->
    <Card>
      <CardHeader class="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle class="text-base font-semibold text-slate-800">
            Listado de Clientes ({{ totalCount }} registros)
          </CardTitle>
          <CardDescription class="text-xs">
            Directorio comercial clasificado con control de crédito
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="() => refetch()"
          :disabled="isFetching"
          class="h-8 text-xs"
        >
          <RefreshCw :class="cn('h-3.5 w-3.5 mr-1.5', isFetching && 'animate-spin')" />
          Actualizar
        </Button>
      </CardHeader>

      <CardContent class="p-0">
        <div v-if="isLoading" class="p-12 text-center text-slate-500">
          <RefreshCw class="h-6 w-6 animate-spin mx-auto text-sky-600 mb-2" />
          <p class="text-sm">Cargando directorio de clientes...</p>
        </div>

        <div v-else-if="isError" class="p-12 text-center text-red-600">
          <AlertCircle class="h-8 w-8 mx-auto text-red-500 mb-2" />
          <p class="font-semibold text-sm">Error al cargar clientes</p>
          <p class="text-xs text-slate-500 mt-1">{{ (error as any)?.message }}</p>
          <Button variant="outline" size="sm" @click="() => refetch()" class="mt-4">
            Reintentar
          </Button>
        </div>

        <div v-else-if="customerItems.length === 0" class="p-12 text-center text-slate-400">
          <Users class="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p class="font-medium text-slate-600 text-sm">No se encontraron clientes</p>
          <p class="text-xs text-slate-400 mt-1">
            Intente ajustar los filtros de búsqueda o registre un nuevo cliente.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-24">Código ID</TableHead>
              <TableHead>Nombre o Razón Social</TableHead>
              <TableHead class="w-36">Tipo</TableHead>
              <TableHead class="text-right w-36">Saldo Comercial</TableHead>
              <TableHead class="text-center w-36">Estado</TableHead>
              <TableHead class="text-right w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="c in customerItems" :key="c.id">
              <TableCell class="font-mono font-bold text-xs text-sky-700">
                {{ c.id }}
              </TableCell>
              <TableCell class="font-medium text-slate-900">
                <div>{{ c.name }}</div>
                <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5 font-normal">
                  <span v-if="c.identification" class="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    🪪 {{ c.identification }}
                  </span>
                  <span v-if="c.tradeName" class="text-sky-600 font-medium">
                    🏪 {{ c.tradeName }}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  v-if="c.customerType === 'Empresa' || c.customerType === 2"
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

        <!-- Paginación de Servidor -->
        <Pagination
          v-model:current-page="currentPage"
          :total-count="totalCount"
          :total-pages="totalPages"
          :page-size="pageSize"
          item-name="clientes"
        />
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
