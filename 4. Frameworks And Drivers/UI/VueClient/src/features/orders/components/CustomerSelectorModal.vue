<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Search,
  Check,
  AlertCircle,
  Users,
  ShieldAlert,
  Lock,
  Building2,
  User,
  X,
} from 'lucide-vue-next';
import { useDebounce } from '@/shared/utils/useDebounce';
import { useCustomers } from '@/features/customers/composables/useCustomers';
import type { CustomerDto, CustomerFilters } from '@/features/customers/types';
import {
  Dialog,
  Input,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '@/shared/ui';
import { cn } from '@/shared/utils/cn';

interface Props {
  open: boolean;
  selectedCustomerId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  selectedCustomerId: '',
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'select-customer', customer: CustomerDto): void;
}>();

const searchTerm = ref('');
const debouncedSearchTerm = useDebounce(searchTerm, 350);
const searchCriteria = ref<'all' | 'identification' | 'name' | 'lastname' | 'businessname' | 'tradename' | 'id'>('all');
const typeFilter = ref<'Todos' | 'Persona Natural' | 'Empresa'>('Todos');
const blockedWarning = ref<string | null>(null);

const currentPage = ref(1);
const pageSize = 10;

const serverFilters = computed<CustomerFilters>(() => {
  return {
    searchTerm: debouncedSearchTerm.value.trim() || undefined,
    criteria: searchCriteria.value !== 'all' ? searchCriteria.value : undefined,
    customerType: typeFilter.value !== 'Todos' ? typeFilter.value : undefined,
    pageNumber: currentPage.value,
    pageSize,
  };
});

watch([debouncedSearchTerm, searchCriteria, typeFilter], () => {
  currentPage.value = 1;
});

const { data: pagedData, isLoading, error } = useCustomers(serverFilters);
const customerList = computed(() => pagedData.value?.items ?? []);
const totalCount = computed(() => pagedData.value?.totalCount ?? 0);
const totalPages = computed(() => pagedData.value?.totalPages ?? 1);

const handleSelect = (customer: CustomerDto) => {
  if (customer.currentBalance > 0) {
    blockedWarning.value = `No se puede seleccionar al cliente '${customer.name}' (${customer.id}) porque posee un saldo deudor pendiente de $${Number(customer.currentBalance).toFixed(2)}. Los clientes con saldo pendiente no están autorizados para emitir nuevas órdenes.`;
    return;
  }
  blockedWarning.value = null;
  emit('select-customer', customer);
  emit('update:open', false);
};

const getPlaceholder = () => {
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
      return 'Buscar por nombre comercial (ej. Taquería El Paso)...';
    case 'all':
    default:
      return 'Buscar cliente por ID, nombres, razón social o identificación...';
  }
};
</script>

<template>
  <Dialog
    :open="open"
    @update:open="
      (val) => {
        if (!val) blockedWarning = null;
        emit('update:open', val);
      }
    "
    title="Seleccionar Cliente para la Orden"
    description="Seleccione un cliente con saldo al día para autorizar la emisión del pedido."
    class="max-w-4xl"
  >
    <div class="space-y-4 pt-1">
      <!-- Banner de Condición de Crédito -->
      <div class="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start space-x-3 shadow-xs">
        <ShieldAlert class="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div class="leading-snug">
          <span class="font-bold text-amber-900 block sm:inline mr-1">
            Condición de Crédito:
          </span>
          <span>
            Solo se permite crear órdenes a clientes con saldo $0.00. Clientes con saldo pendiente están bloqueados.
          </span>
        </div>
      </div>

      <!-- Alerta Reactiva de Advertencia si se intenta interactuar con un cliente moroso -->
      <div
        v-if="blockedWarning"
        class="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm flex items-start space-x-2 animate-fade-in"
      >
        <Lock class="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
        <div class="flex-1 font-medium leading-relaxed">{{ blockedWarning }}</div>
        <button
          type="button"
          @click="blockedWarning = null"
          class="text-rose-500 hover:text-rose-700 ml-2 font-bold"
        >
          &times;
        </button>
      </div>

      <!-- Filtros de Tipo de Cliente -->
      <div class="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
        <button
          type="button"
          @click="typeFilter = 'Todos'"
          :class="
            cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5',
              typeFilter === 'Todos'
                ? 'bg-white text-sky-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            )
          "
        >
          <Users class="h-3.5 w-3.5" />
          <span>Todos</span>
        </button>

        <button
          type="button"
          @click="typeFilter = 'Persona Natural'"
          :class="
            cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5',
              typeFilter === 'Persona Natural'
                ? 'bg-white text-sky-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            )
          "
        >
          <User class="h-3.5 w-3.5" />
          <span>Personas Naturales</span>
        </button>

        <button
          type="button"
          @click="typeFilter = 'Empresa'"
          :class="
            cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5',
              typeFilter === 'Empresa'
                ? 'bg-white text-sky-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            )
          "
        >
          <Building2 class="h-3.5 w-3.5" />
          <span>Empresas</span>
        </button>
      </div>

      <!-- Barra de Búsqueda y Selector de Criterio -->
      <div class="flex flex-col sm:flex-row gap-2">
        <select
          v-model="searchCriteria"
          class="text-xs h-9 rounded-lg border border-slate-300 bg-white px-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 sm:w-56"
        >
          <option value="all">🔍 Todos los campos</option>
          <option value="tradename">🏪 Nombre Comercial</option>
          <option value="identification">🪪 Cédula / RUC</option>
          <option value="id">#️⃣ Código ID</option>
          <option value="name">👤 Nombres y Apellidos</option>
          <option value="lastname">👤 Solo Primer Apellido</option>
          <option value="businessname">🏢 Razón Social</option>
        </select>

        <div class="relative flex-1">
          <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            :placeholder="getPlaceholder()"
            v-model="searchTerm"
            class="pl-9 pr-8 text-xs sm:text-sm h-9"
          />
          <button
            v-if="searchTerm"
            type="button"
            @click="searchTerm = ''"
            class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            title="Limpiar búsqueda"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Tabla de Clientes -->
      <div class="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
        <div v-if="isLoading" class="p-8 text-center text-slate-500">
          <Users class="h-8 w-8 mx-auto text-slate-400 animate-spin mb-2" />
          Cargando clientes...
        </div>

        <div v-else-if="error" class="p-6 text-center text-rose-600 flex items-center justify-center space-x-2">
          <AlertCircle class="h-5 w-5" />
          <span>Error al obtener clientes del catálogo.</span>
        </div>

        <div v-else-if="customerList.length === 0" class="p-8 text-center text-slate-400">
          No se encontraron clientes coincidentes con la búsqueda.
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-20">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead class="w-36">Cédula / RUC</TableHead>
              <TableHead class="w-36">Tipo</TableHead>
              <TableHead class="text-right w-28">Saldo</TableHead>
              <TableHead class="text-right w-36">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="customer in customerList"
              :key="customer.id"
              :class="cn(
                selectedCustomerId === customer.id && 'bg-sky-50/50',
                customer.currentBalance > 0 && 'bg-rose-50/20'
              )"
            >
              <TableCell class="font-mono font-bold text-xs text-sky-700">
                {{ customer.id }}
              </TableCell>
              <TableCell>
                <div class="font-medium text-slate-900">{{ customer.name }}</div>
                <div v-if="customer.tradeName" class="text-[11px] text-slate-500">
                  🏪 Comercial: {{ customer.tradeName }}
                </div>
                <span
                  v-if="customer.currentBalance > 0"
                  class="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5"
                >
                  <AlertCircle class="w-3 h-3 shrink-0" />
                  Bloqueado por saldo pendiente
                </span>
                <span
                  v-else
                  class="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5"
                >
                  <Check class="w-3 h-3 shrink-0" />
                  Habilitado para compra
                </span>
              </TableCell>
              <TableCell class="font-mono text-xs text-slate-600">
                {{ customer.identification || '—' }}
              </TableCell>
              <TableCell>
                <Badge
                  v-if="customer.customerType === 'Empresa' || customer.customerType === 2"
                  variant="info"
                  class="flex items-center w-fit space-x-1"
                >
                  <Building2 class="h-3 w-3" />
                  <span>Empresa</span>
                </Badge>
                <Badge
                  v-else
                  variant="default"
                  class="flex items-center w-fit space-x-1"
                >
                  <User class="h-3 w-3" />
                  <span>Persona Natural</span>
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <Badge
                  v-if="customer.currentBalance <= 0"
                  variant="success"
                  class="font-mono"
                >
                  $0.00
                </Badge>
                <Badge
                  v-else
                  variant="danger"
                  class="font-mono"
                >
                  ${{ Number(customer.currentBalance).toFixed(2) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  v-if="customer.currentBalance > 0"
                  type="button"
                  size="sm"
                  @click="handleSelect(customer)"
                  class="h-8 px-2 text-xs bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100"
                  title="Haga clic para ver el motivo de bloqueo"
                >
                  <Lock class="h-3.5 w-3.5 mr-1 text-rose-600 shrink-0" />
                  <span>Moroso / Bloqueado</span>
                </Button>
                <Button
                  v-else
                  type="button"
                  size="sm"
                  :variant="selectedCustomerId === customer.id ? 'secondary' : 'default'"
                  @click="handleSelect(customer)"
                  class="h-8 px-3 text-xs"
                >
                  <Check class="h-3.5 w-3.5 mr-1" />
                  <span>{{ selectedCustomerId === customer.id ? 'Seleccionado' : 'Seleccionar' }}</span>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Paginación de Servidor -->
      <Pagination
        v-model:current-page="currentPage"
        :total-count="totalCount"
        :total-pages="totalPages"
        :page-size="pageSize"
        item-name="clientes"
      />
    </div>
  </Dialog>
</template>
