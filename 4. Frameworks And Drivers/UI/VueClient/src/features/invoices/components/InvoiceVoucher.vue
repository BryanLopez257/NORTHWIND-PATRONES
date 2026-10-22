<script setup lang="ts">
import {
  Printer,
  CheckCircle2,
  Building2,
  User,
  Calendar,
  Hash,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
} from 'lucide-vue-next';
import type { InvoiceResponseDto } from '../types';
import { Button } from '@/shared/ui';

interface Props {
  invoice: InvoiceResponseDto;
  showPrintButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showPrintButton: true,
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handlePrint = () => {
  window.print();
};

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('es-EC', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
};
</script>

<template>
  <div class="flex flex-col space-y-4">
    <!-- Action toolbar (Hidden in print) -->
    <div class="no-print flex items-center justify-between pb-3 border-b border-slate-200">
      <div class="flex items-center space-x-2 text-emerald-600 font-medium">
        <CheckCircle2 class="h-5 w-5" />
        <span>Comprobante de Venta (Simulación Didáctica)</span>
      </div>
      <div class="flex items-center space-x-2">
        <Button
          v-if="showPrintButton"
          type="button"
          variant="default"
          size="sm"
          @click="handlePrint"
          class="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Printer class="h-4 w-4" />
          <span>Imprimir Comprobante</span>
        </Button>
        <Button type="button" variant="outline" size="sm" @click="emit('close')">
          Cerrar
        </Button>
      </div>
    </div>

    <!-- Printable Invoice Container -->
    <div
      id="printable-invoice"
      class="bg-white rounded-lg border border-slate-200 p-6 text-slate-800 shadow-sm"
    >
      <!-- Header: Company & Invoice Info -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <div class="bg-sky-600 text-white p-2 rounded font-bold text-base">
              NW
            </div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">
              NORTHWIND <span class="text-sky-600 font-semibold">SALES</span>
            </h1>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            R.U.C.: 1790012345001 &bull; Matriz: Av. Amazonas y República, Quito - Ecuador
          </p>
          <p class="text-xs text-slate-400">
            Ambiente de Simulación Académica &bull; Sin Efectos Tributarios
          </p>
        </div>

        <div class="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded border sm:border-0 border-slate-200 w-full sm:w-auto">
          <span class="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-amber-100 text-amber-900 mb-1">
            Comprobante de Simulación
          </span>
          <div class="flex items-center sm:justify-end space-x-1.5 text-slate-900 font-mono text-base font-bold">
            <Hash class="h-4 w-4 text-slate-400" />
            <span>{{ invoice.invoiceNumber || `FAC-${invoice.id}` }}</span>
          </div>
          <div class="flex items-center sm:justify-end space-x-1.5 text-xs text-slate-500 mt-0.5">
            <Calendar class="h-3.5 w-3.5 text-slate-400" />
            <span>{{ formatDate(invoice.createdDate) }}</span>
          </div>
        </div>
      </div>

      <!-- Customer & Transaction Info (Historical Snapshot) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-sm">
        <div class="space-y-1">
          <div class="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Datos del Cliente (Instantánea Histórica)
          </div>
          <div class="flex items-center space-x-2 text-slate-900 font-semibold">
            <Building2 class="h-4 w-4 text-slate-400 shrink-0" />
            <span>{{ invoice.customerFullName || invoice.customerId }}</span>
          </div>
          <div v-if="invoice.customerId" class="text-xs text-slate-600">
            <span class="font-semibold text-slate-700">Código Interno: </span>
            <span class="font-mono font-bold text-sky-800">{{ invoice.customerId }}</span>
          </div>
          <div class="flex items-center space-x-2 text-slate-600 text-xs">
            <span class="font-semibold text-slate-700">R.U.C. / C.I.:</span>
            <span class="font-mono font-medium">{{ invoice.customerDocument || 'N/A' }}</span>
          </div>
          <div v-if="invoice.customerAddress" class="flex items-center space-x-2 text-slate-600 text-xs">
            <MapPin class="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{{ invoice.customerAddress }}</span>
          </div>
          <div v-if="invoice.customerPhone" class="flex items-center space-x-2 text-slate-600 text-xs">
            <Phone class="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{{ invoice.customerPhone }}</span>
          </div>
          <div v-if="invoice.customerEmail" class="flex items-center space-x-2 text-slate-600 text-xs">
            <Mail class="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{{ invoice.customerEmail }}</span>
          </div>
        </div>

        <div class="space-y-1 md:text-right">
          <div class="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Emisión y Venta
          </div>
          <div class="flex items-center md:justify-end space-x-2 text-slate-700 text-xs">
            <User class="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Vendedor Responsable: <strong class="text-slate-900">{{ invoice.sellerName || 'Sistema Automático' }}</strong></span>
          </div>
          <div class="flex items-center md:justify-end space-x-2 text-slate-700 text-xs">
            <span class="font-semibold text-slate-700">Condición de Pago:</span>
            <span>Contado / Transferencia Inmediata</span>
          </div>
          <div class="flex items-center md:justify-end space-x-2 text-slate-700 text-xs">
            <span class="font-semibold text-slate-700">Moneda:</span>
            <span>Dólares de los Estados Unidos de América (USD)</span>
          </div>
        </div>
      </div>

      <!-- Invoice Items Table with Snapshot Legend -->
      <div class="py-4">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="border-b-2 border-slate-300 bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                <th class="py-2 px-3">#</th>
                <th class="py-2 px-3">Descripción (Snapshot Congelado)</th>
                <th class="py-2 px-3 text-center">Cant.</th>
                <th class="py-2 px-3 text-right">Precio Unitario</th>
                <th class="py-2 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-if="invoice.details && invoice.details.length > 0">
                <tr
                  v-for="(item, index) in invoice.details"
                  :key="`${item.productId}-${index}`"
                  class="print-break-inside-avoid"
                >
                  <td class="py-1.5 px-3 text-slate-400 text-xs font-mono">{{ index + 1 }}</td>
                  <td class="py-1.5 px-3 font-medium text-slate-800">
                    {{ item.productName || `Producto #${item.productId}` }}
                  </td>
                  <td class="py-1.5 px-3 text-center font-mono">{{ item.quantity }}</td>
                  <td class="py-1.5 px-3 text-right font-mono">
                    ${{ Number(item.unitPrice).toFixed(2) }}
                  </td>
                  <td class="py-1.5 px-3 text-right font-mono font-semibold text-slate-900">
                    ${{ Number(item.subTotal).toFixed(2) }}
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="5" class="py-4 text-center text-slate-400">
                  No se encontraron detalles para este comprobante.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals Summary -->
      <div class="flex flex-col sm:flex-row justify-between items-start pt-3 border-t-2 border-slate-200 gap-4 print-break-inside-avoid">
        <!-- Legal Historical Snapshot Pattern Alert -->
        <div class="max-w-md space-y-1.5">
          <div class="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-slate-700 flex items-start space-x-2.5">
            <ShieldCheck class="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
            <div class="leading-relaxed">
              <strong class="text-sky-900 block font-semibold">Registro de Integridad Histórica (Patrón Snapshot):</strong>
              <span>
                Este comprobante utiliza datos congelados en el momento exacto de su emisión. Cualquier modificación futura en los catálogos maestros de clientes o productos no alterará el contenido histórico de este documento.
              </span>
            </div>
          </div>
          <p class="text-[11px] text-slate-400 italic">
            * Documento generado exclusivamente con fines académicos para la asignatura de Patrones de Diseño de Software (PDS). No tiene validez fiscal ni tributaria.
          </p>
        </div>

        <div class="w-full sm:w-60 space-y-1.5 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div class="flex justify-between text-slate-600 text-xs">
            <span>Subtotal:</span>
            <span class="font-mono font-medium">${{ Number(invoice.subTotal).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-slate-600 text-xs">
            <span>IVA (Tarifa 15%):</span>
            <span class="font-mono font-medium">${{ Number(invoice.tax).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-300">
            <span>TOTAL USD:</span>
            <span class="font-mono text-emerald-700">${{ Number(invoice.total).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="mt-6 pt-3 border-t border-dashed border-slate-200 text-center text-xs text-slate-400">
        *** Documento de Simulación Académica - NorthWind Sales (Sin Validez Tributaria) ***
      </div>
    </div>
  </div>
</template>
