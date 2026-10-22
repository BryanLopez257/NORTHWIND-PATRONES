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
import { useCustomers } from '@/features/customers/composables/useCustomers';
import type { CustomerDto } from '@/features/customers/types';
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
const searchCriteria = ref<'all' | 'name' | 'id'>('all');
const typeFilter = ref<'Todos' | 'Persona Natural' | 'Empresa'>('Todos');
const blockedWarning = ref<string | null>(null);

const { data: customers, isLoading, error } = useCustomers();
const customerList = computed(() => customers.value ?? []);

const counts = computed(() => {
  const list = customerList.value;
  const todos = list.length;
  const personas = list.filter((c) => c.customerType === 'Persona Natural').length;
  const empresas = list.filter((c) => c.customerType === 'Empresa').length;
  return { todos, personas, empresas };
});


const currentPage = ref(1);
const pageSize = 5;

watch([searchTerm, searchCriteria, typeFilter], () => {
  currentPage.value = 1;
});

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredCustomers.value.slice(start, start + pageSize);
});

const filteredCustomers = computed(() => {
  return customerList.value.filter((c) => {
    if (typeFilter.value !== 'Todos' && c.customerType !== typeFilter.value) {
      return false;
    }

    if (searchTerm.value.trim()) {
      const term = searchTerm.value.trim().toLowerCase();
      if (searchCriteria.value === 'id') {
        return c.id.toLowerCase().includes(term);
      }
      if (searchCriteria.value === 'name') {
        return c.name.toLowerCase().includes(term);
      }
      return c.name.toLowerCase().includes(term) || c.id.toLowerCase().includes(term);
    }

    return true;
  });
});

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
  if (searchCriteria.value === 'id') return 'Buscar específicamente por código (ej: ALFKI)...';
  if (searchCriteria.value === 'name') return 'Buscar específicamente por nombre o razón social...';
  return 'Buscar por código o nombre de cliente...';
};

const handleOpenChange = (val: boolean) => {
  if (!val) blockedWarning.value = null;
  emit('update:open', val);
};
</script>

<template>
  <Dialog
    :open="open"
    @update:open="handleOpenChange"
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

      <!-- Alerta de Advertencia Moroso -->
      <div
        v-if="blockedWarning"
        class="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm flex items-start space-x-2 animate-fade-in"
      >
        <AlertCircle class="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div class="flex-1">
          <span class="font-semibold block">Operación No Permitida:</span>
          <span>{{ blockedWarning }}</span>
        </div>
        <button
          type="button"
          @click="blockedWarning = null"
          class="text-rose-500 hover:text-rose-700"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Tabs de Segmentación -->
      <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          @click="typeFilter = 'Todos'"
          :class="
            cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5',
              typeFilter === 'Todos'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )
          "
        >
          <Users class="h-3.5 w-3.5" />
          <span>Todos ({{ counts.todos }})</span>
        </button>

        <button
          type="button"
          @click="typeFilter = 'Empresa'"
          :class="
            cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5',
              typeFilter === 'Empresa'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )
          "
        >
          <Building2 class="h-3.5 w-3.5" />
          <span>Empresas ({{ counts.empresas }})</span>
        </button>

        <button
          type="button"
          @click="typeFilter = 'Persona Natural'"
          :class="
            cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5',
              typeFilter === 'Persona Natural'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )
          "
        >
          <User class="h-3.5 w-3.5" />
          <span>Personas Naturales ({{ counts.personas }})</span>
        </button>
      </div>

      <!-- Search Box with Criteria -->
      <div class="flex gap-2">
        <select
          v-model="searchCriteria"
          class="text-xs h-9 rounded-lg border border-slate-300 bg-white px-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">🔍 Todos</option>
          <option value="name">🏢 Nombre</option>
          <option value="id">🪪 ID</option>
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
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Customers Table -->
      <div class="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
        <div v-if="isLoading" class="p-8 text-center text-slate-500">
          <Users class="h-8 w-8 mx-auto text-slate-400 animate-spin mb-2" />
          Cargando catálogo de clientes...
        </div>

        <div v-else-if="error" class="p-6 text-center text-rose-600 flex items-center justify-center space-x-2">
          <AlertCircle class="h-5 w-5" />
          <span>Error al obtener clientes. Por favor intente nuevamente.</span>
        </div>

        <div v-else-if="filteredCustomers.length === 0" class="p-8 text-center text-slate-400">
          No se encontraron clientes coincidentes con el criterio de búsqueda.
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-20">ID</TableHead>
              <TableHead>Nombre / Razón Social</TableHead>
              <TableHead>Tipo de Cliente</TableHead>
              <TableHead class="text-right">Saldo Actual</TableHead>
              <TableHead class="text-right w-44">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="customer in paginatedCustomers"
              :key="customer.id"
              :class="
                cn(
                  selectedCustomerId === customer.id && 'bg-sky-50/50',
                  customer.currentBalance > 0 && 'bg-rose-50/20'
                )
              "
            >
              <TableCell class="font-mono font-bold text-xs text-sky-700">
                {{ customer.id }}
              </TableCell>
              <TableCell>
                <div class="font-medium text-slate-900">{{ customer.name }}</div>
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
              <TableCell>
                <Badge
                  v-if="customer.customerType === 'Empresa'"
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
                <Badge v-if="customer.currentBalance <= 0" variant="success" class="font-mono">
                  $0.00
                </Badge>
                <Badge v-else variant="danger" class="font-mono">
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
                  @click="handleSelect(customer)"
                  class="h-8 px-3 text-xs bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1 ml-auto"
                >
                  <Check class="h-3.5 w-3.5" />
                  <span>{{ selectedCustomerId === customer.id ? 'Seleccionado' : 'Seleccionar' }}</span>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Paginación -->
      <Pagination
        v-model:current-page="currentPage"
        :total-items="filteredCustomers.length"
        :page-size="pageSize"
        item-name="clientes"
      />

      <!-- Footer -->
      <div class="flex justify-end pt-1">
        <Button type="button" variant="outline" @click="handleOpenChange(false)">
          Cerrar
        </Button>
      </div>
    </div>
  </Dialog>
</template>
