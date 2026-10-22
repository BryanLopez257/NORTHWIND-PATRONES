<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import {
  Receipt,
  Search,
  Calendar,
  Eye,
  Printer,
  RefreshCw,
  Building2,
  Hash,
  AlertCircle,
  ShoppingCart,
  User,
} from 'lucide-vue-next';
import { useInvoices } from '../composables/useInvoices';
import type { InvoiceResponseDto } from '../types';
import InvoiceVoucher from '../components/InvoiceVoucher.vue';
import { useDebounce } from '@/shared/utils/useDebounce';
import {
  Card,
  CardContent,
  Button,
  Input,
  Dialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/ui';

const invoiceNumberQuery = ref('');
const customerNameQuery = ref('');

const debouncedInvoiceNumber = useDebounce(invoiceNumberQuery, 350);
const debouncedCustomerName = useDebounce(customerNameQuery, 350);

const filters = computed(() => ({
  invoiceNumber: debouncedInvoiceNumber.value,
  customerName: debouncedCustomerName.value,
}));

const {
  data: invoices,
  isLoading,
  isFetching,
  error,
  refetch,
} = useInvoices(filters);

const invoiceItems = computed(() => invoices.value ?? []);

const filteredInvoices = computed(() => {
  const list = invoiceItems.value;
  if (!customerNameQuery.value.trim()) return list;
  const term = customerNameQuery.value.trim().toLowerCase();
  return list.filter(
    (inv) =>
      (inv.customerFullName && inv.customerFullName.toLowerCase().includes(term)) ||
      (inv.customerId && inv.customerId.toLowerCase().includes(term))
  );
});

const selectedInvoice = ref<InvoiceResponseDto | null>(null);
const isVoucherModalOpen = ref(false);

const handleOpenVoucher = (invoice: InvoiceResponseDto) => {
  selectedInvoice.value = invoice;
  isVoucherModalOpen.value = true;
};

const handleClearFilters = () => {
  invoiceNumberQuery.value = '';
  customerNameQuery.value = '';
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

const hasActiveFilters = computed(
  () => invoiceNumberQuery.value.trim() !== '' || customerNameQuery.value.trim() !== ''
);
</script>

<template>
  <div class="space-y-6 w-full pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
          <Receipt class="h-6 w-6 text-sky-600" />
          <span>Historial de Facturas y Comprobantes</span>
        </h1>
        <p class="text-sm text-slate-500 mt-0.5">
          Consulta, auditoría contable y reimpresión de comprobantes electrónicos oficiales emitidos.
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <RouterLink to="/createorder">
          <Button size="sm" class="bg-sky-600 hover:bg-sky-700 text-white shadow-xs">
            <ShoppingCart class="h-4 w-4 mr-1.5" />
            <span>Nueva Orden</span>
          </Button>
        </RouterLink>

        <Button
          type="button"
          variant="outline"
          size="sm"
          @click="() => refetch()"
          :disabled="isFetching"
          class="flex items-center space-x-1.5 text-slate-600"
        >
          <RefreshCw :class="`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`" />
          <span>Actualizar</span>
        </Button>
      </div>
    </div>

    <!-- Filter and Search Bar -->
    <Card class="border-slate-200 shadow-xs">
      <CardContent class="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Número de Factura
            </label>
            <div class="relative">
              <Hash class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Ej. FAC-0001..."
                v-model="invoiceNumberQuery"
                class="pl-9"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Cliente (Nombre / Razón Social / ID)
            </label>
            <div class="relative">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar cliente..."
                v-model="customerNameQuery"
                class="pl-9"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button
              v-if="hasActiveFilters"
              type="button"
              variant="outline"
              size="sm"
              @click="handleClearFilters"
              class="h-10 text-xs text-slate-500"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Invoices Table -->
    <Card class="border-slate-200 shadow-xs overflow-hidden">
      <CardContent class="p-0">
        <div v-if="isLoading" class="p-12 text-center text-slate-500">
          <RefreshCw class="h-8 w-8 mx-auto text-sky-600 animate-spin mb-3" />
          <p class="font-medium text-sm">Cargando facturas y comprobantes...</p>
        </div>

        <div v-else-if="error" class="p-8 text-center text-rose-600 space-y-2">
          <AlertCircle class="h-8 w-8 mx-auto text-rose-500" />
          <p class="font-semibold text-sm">Error al cargar comprobantes</p>
          <Button variant="outline" size="sm" @click="() => refetch()" class="mt-2">
            Reintentar
          </Button>
        </div>

        <div v-else-if="filteredInvoices.length === 0" class="p-12 text-center text-slate-400 space-y-3">
          <Receipt class="h-10 w-10 mx-auto text-slate-300" />
          <p class="font-medium text-sm text-slate-600">No se encontraron facturas</p>
          <p class="text-xs text-slate-400">Genere nuevas órdenes de venta para poblar el registro histórico.</p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-32">Comprobante</TableHead>
              <TableHead class="w-44 whitespace-nowrap">Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead class="w-36">Identificación</TableHead>
              <TableHead class="w-48 whitespace-nowrap">Vendedor</TableHead>
              <TableHead class="text-right w-24">Subtotal</TableHead>
              <TableHead class="text-right w-20">IVA (15%)</TableHead>
              <TableHead class="text-right w-24">Total</TableHead>
              <TableHead class="text-center w-28">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="inv in filteredInvoices" :key="inv.id">
              <TableCell class="font-mono text-xs font-bold text-sky-700">
                {{ inv.invoiceNumber || `FAC-${inv.id}` }}
              </TableCell>
              <TableCell class="text-xs text-slate-600 whitespace-nowrap">
                <div class="flex items-center space-x-1.5">
                  <Calendar class="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span class="font-mono text-xs font-medium">{{ formatDate(inv.createdDate) }}</span>
                </div>
              </TableCell>
              <TableCell class="font-medium text-slate-800">
                <div class="flex items-center space-x-1.5">
                  <Building2 class="h-4 w-4 text-slate-400 shrink-0" />
                  <span class="truncate max-w-[240px]" :title="inv.customerFullName || inv.customerId">
                    {{ inv.customerFullName || inv.customerId }}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col space-y-0.5">
                  <span class="font-mono text-xs text-slate-700 font-medium">
                    {{ inv.customerDocument || 'S/D' }}
                  </span>
                  <span
                    v-if="inv.customerId"
                    class="font-mono text-[11px] text-sky-700 font-semibold bg-sky-50 px-1.5 py-0.5 rounded w-fit"
                  >
                    ID: {{ inv.customerId }}
                  </span>
                </div>
              </TableCell>
              <TableCell class="whitespace-nowrap">
                <div class="flex items-center space-x-1.5 text-xs text-slate-700">
                  <User class="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span class="truncate max-w-[220px]" :title="inv.sellerName || 'Ventas NW'">{{ inv.sellerName || 'Ventas NW' }}</span>
                </div>
              </TableCell>
              <TableCell class="text-right font-mono text-xs text-slate-700">
                {{ formatCurrency(inv.subTotal) }}
              </TableCell>
              <TableCell class="text-right font-mono text-xs text-slate-700">
                {{ formatCurrency(inv.tax) }}
              </TableCell>
              <TableCell class="text-right font-mono text-sm font-bold text-emerald-700">
                {{ formatCurrency(inv.total) }}
              </TableCell>
              <TableCell class="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="handleOpenVoucher(inv)"
                  class="h-8 px-2.5 text-xs text-sky-700 border-sky-200 hover:bg-sky-50 flex items-center space-x-1.5 mx-auto"
                  title="Ver comprobante e imprimir"
                >
                  <Eye class="h-3.5 w-3.5" />
                  <span>Ver</span>
                  <Printer class="h-3.5 w-3.5 ml-0.5 text-slate-400" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Official Voucher Preview & Print Modal -->
    <Dialog
      :open="isVoucherModalOpen"
      @update:open="isVoucherModalOpen = $event"
      title="Comprobante de Factura Electrónica"
      description="Vista oficial y opción de impresión limpia del comprobante emitido."
      class="max-w-4xl"
    >
      <InvoiceVoucher
        v-if="selectedInvoice"
        :invoice="selectedInvoice"
        @close="isVoucherModalOpen = false"
        :show-print-button="true"
      />
    </Dialog>
  </div>
</template>
