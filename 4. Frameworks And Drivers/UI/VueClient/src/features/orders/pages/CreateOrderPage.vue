<script setup lang="ts">
/**
 * ============================================================================
 * VISTA: src/features/orders/pages/CreateOrderPage.vue
 * PROPÓSITO: Caso de uso principal - Creación y Emisión de Órdenes de Venta.
 * ============================================================================
 * Patrones y Buenas Prácticas Aplicadas:
 * 1. Clean Architecture: La vista solo interactúa con los composables/gateways (`useCreateOrder`, `useCustomers`).
 * 2. Validación Defensiva (Guards):
 *    - Validación de crédito: Bloquea clientes con saldo comercial pendiente (> $0.00).
 *    - Validación tributaria: Algoritmo oficial de Cédula (10 dígitos) y RUC (13 dígitos) para Ecuador.
 *      Si el cliente es de tipo "Empresa", exige obligatoriamente RUC de 13 dígitos.
 * 3. Carrito de Compras Reactivo: Control estricto de existencias (stock) por ítem.
 * 4. Patrón Snapshot (Comprobante Post-Emisión):
 *    Al emitir la orden con éxito, despliega el modal oficial `InvoiceVoucher` con datos congelados.
 */

import { ref, computed } from 'vue';
import {
  ShoppingCart,
  Plus,
  Trash2,
  AlertTriangle,
  Building2,
  Send,
  Loader2,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-vue-next';
import { useCustomers } from '@/features/customers/composables/useCustomers';
import type { CustomerDto } from '@/features/customers/types';
import type { ProductDto } from '@/features/products/types';
import { useCreateOrder } from '../composables/useCreateOrder';
import type { CartItem, CreateOrderDto } from '../types';
import ProductSelectorModal from '../components/ProductSelectorModal.vue';
import CustomerSelectorModal from '../components/CustomerSelectorModal.vue';
import InvoiceVoucher from '@/features/invoices/components/InvoiceVoucher.vue';
import type { InvoiceResponseDto } from '@/features/invoices/types';
import { validateEcuadorianId, validateRuc } from '@/core/validators/ecuadorianIdValidator';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
} from '@/shared/ui';
import { getErrorMessage } from '@/core/api/apiClient';
import {
  allowOnlyLettersAndSpaces,
  allowOnlyDigits,
  allowAddressChars,
  sanitizeLettersAndSpaces,
  sanitizeDigits,
  sanitizeAddress,
} from '@/core/utils/inputFilters';

// 1. Carga de clientes desde TanStack Query
const { data: customers } = useCustomers();
const customerList = computed(() => customers.value ?? []);
const createOrderMutation = useCreateOrder();

// 2. Estado del Formulario: inicializados vacíos sin valores quemados (hardcodeados)
const selectedCustomerId = ref<string>('');
const showCustomerModal = ref<boolean>(false);
const customerDocument = ref<string>('');
const shipAddress = ref<string>('');
const shipCity = ref<string>('');
const shipCountry = ref<string>('');
const shipPostalCode = ref<string>('');

// 3. Control de campos tocados (onBlur) para mostrar errores en el momento oportuno
const touched = ref<Record<string, boolean>>({});
const markTouched = (field: string) => {
  touched.value[field] = true;
};

// 4. Estado del Carrito de Compras
const cartItems = ref<CartItem[]>([]);
const isCatalogOpen = ref<boolean>(false);
const itemToDelete = ref<CartItem | null>(null);
const showResetConfirm = ref<boolean>(false);

// 5. Estado del Modal de Comprobante / Factura Emitida
const voucherModalOpen = ref<boolean>(false);
const issuedInvoice = ref<InvoiceResponseDto | null>(null);

// Error general de envío
const formError = ref<string | null>(null);

// 6. Obtener objeto del cliente seleccionado
const selectedCustomer = computed<CustomerDto | undefined>(() => {
  if (!selectedCustomerId.value) return undefined;
  return customerList.value.find(
    (c) => c.id.toUpperCase() === selectedCustomerId.value.toUpperCase()
  );
});

// Regla de Negocio: Condición de Crédito (Saldo pendiente > 0 bloquea la venta)
const hasPendingBalance = computed(() => (selectedCustomer.value?.currentBalance ?? 0) > 0);

// Regla de Negocio: Validación de Cédula/RUC con algoritmo oficial de Ecuador
const documentValidation = computed(() => {
  const cleanDoc = customerDocument.value.trim();
  if (!cleanDoc) {
    return { isValid: false, message: 'Debe ingresar la cédula o RUC del cliente.' };
  }

  if (cleanDoc.length !== 10 && cleanDoc.length !== 13) {
    return {
      isValid: false,
      message: 'El documento debe contener 10 dígitos (Cédula) o 13 dígitos (RUC).',
    };
  }

  // Regla especial para Empresas: obligatorio RUC de 13 dígitos
  if (selectedCustomer.value?.customerType === 'Empresa') {
    if (cleanDoc.length === 10) {
      return {
        isValid: false,
        message: 'El cliente está registrado como Empresa y requiere obligatoriamente un RUC de 13 dígitos.',
      };
    }
    const rucResult = validateRuc(cleanDoc);
    return {
      isValid: rucResult.isValid,
      message: rucResult.isValid ? 'RUC de Empresa Válido' : (rucResult.error || 'RUC inválido'),
    };
  }

  const res = validateEcuadorianId(cleanDoc);
  return {
    isValid: res.isValid,
    message: res.isValid
      ? cleanDoc.length === 10
        ? 'Cédula Ecuatoriana Válida'
        : 'RUC Ecuatoriano Válido'
      : (res.error || 'Identificación inválida'),
  };
});

// Mensajes de error por campo
const errors = computed(() => {
  const errs: Record<string, string> = {};

  if (touched.value.customer && !selectedCustomerId.value) {
    errs.customer = 'Debe seleccionar un cliente.';
  } else if (selectedCustomer.value && hasPendingBalance.value) {
    errs.customer = `El cliente tiene un saldo pendiente de $${Number(selectedCustomer.value.currentBalance).toFixed(2)}. No puede emitir órdenes hasta regularizarlo.`;
  }

  if (touched.value.customerDocument) {
    if (!customerDocument.value.trim()) {
      errs.customerDocument = 'La cédula o RUC es requerida.';
    } else if (!documentValidation.value.isValid) {
      errs.customerDocument = documentValidation.value.message;
    }
  }

  if (touched.value.shipAddress) {
    const val = shipAddress.value.trim();
    if (!val) errs.shipAddress = 'La dirección es requerida.';
    else if (val.length < 5) errs.shipAddress = 'La dirección debe tener al menos 5 caracteres.';
  }

  if (touched.value.shipCity) {
    const val = shipCity.value.trim();
    if (!val) errs.shipCity = 'La ciudad es requerida.';
    else if (val.length < 3) errs.shipCity = 'La ciudad debe tener al menos 3 caracteres.';
  }

  if (touched.value.shipCountry) {
    const val = shipCountry.value.trim();
    if (!val) errs.shipCountry = 'El país es requerido.';
    else if (val.length < 3) errs.shipCountry = 'El país debe tener al menos 3 caracteres.';
  }

  return errs;
});

// Cálculos económicos de la orden
const subTotal = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
});

const tax = computed(() => {
  return subTotal.value * 0.15; // IVA 15% vigente
});

const total = computed(() => {
  return subTotal.value + tax.value;
});

// Condición para habilitar el botón de emitir
const isSubmitDisabled = computed(() => {
  return (
    !selectedCustomerId.value ||
    hasPendingBalance.value ||
    !documentValidation.value.isValid ||
    !shipAddress.value.trim() ||
    shipAddress.value.trim().length < 5 ||
    !shipCity.value.trim() ||
    shipCity.value.trim().length < 3 ||
    !shipCountry.value.trim() ||
    shipCountry.value.trim().length < 3 ||
    cartItems.value.length === 0 ||
    createOrderMutation.isPending.value
  );
});

// Manejadores de interacción
const handleSelectCustomer = (customer: CustomerDto) => {
  if (customer.currentBalance > 0) return;
  selectedCustomerId.value = customer.id;
  markTouched('customer');
};

const handleAddProduct = (product: ProductDto) => {
  const existing = cartItems.value.find((i) => i.productId === product.id);
  if (existing) {
    if (existing.quantity < product.unitsInStock) {
      existing.quantity += 1;
      existing.subTotal = existing.quantity * existing.unitPrice;
    }
  } else {
    cartItems.value.push({
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      unitsInStock: product.unitsInStock,
      quantity: 1,
      subTotal: product.unitPrice,
    });
  }
};

const handleUpdateQuantity = (productId: number, newQty: number) => {
  const item = cartItems.value.find((i) => i.productId === productId);
  if (!item) return;

  if (newQty <= 0) {
    itemToDelete.value = item;
    return;
  }

  if (newQty > item.unitsInStock) {
    item.quantity = item.unitsInStock;
  } else {
    item.quantity = newQty;
  }
  item.subTotal = item.quantity * item.unitPrice;
};

const confirmRemoveItem = () => {
  if (itemToDelete.value) {
    cartItems.value = cartItems.value.filter(
      (item) => item.productId !== itemToDelete.value?.productId
    );
    itemToDelete.value = null;
  }
};

const handleResetForm = () => {
  selectedCustomerId.value = '';
  customerDocument.value = '';
  shipAddress.value = '';
  shipCity.value = '';
  shipCountry.value = '';
  shipPostalCode.value = '';
  cartItems.value = [];
  touched.value = {};
  formError.value = null;
};

// Envío de la orden a la Web API
const onSubmit = async () => {
  formError.value = null;

  markTouched('customer');
  markTouched('customerDocument');
  markTouched('shipAddress');
  markTouched('shipCity');
  markTouched('shipCountry');

  if (isSubmitDisabled.value) {
    if (cartItems.value.length === 0) {
      formError.value = 'Debe agregar al menos un producto al pedido antes de emitir la orden.';
    } else {
      formError.value = 'Por favor complete todos los campos requeridos correctamente.';
    }
    return;
  }

  const payload: CreateOrderDto = {
    customerId: selectedCustomerId.value,
    customerDocument: customerDocument.value.trim(),
    shipAddress: shipAddress.value.trim(),
    shipCity: shipCity.value.trim(),
    shipCountry: shipCountry.value.trim(),
    shipPostalCode: shipPostalCode.value.trim() || undefined,
    orderDetails: cartItems.value.map((item) => ({
      productId: item.productId,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
  };

  try {
    const result = await createOrderMutation.mutateAsync(payload);
    issuedInvoice.value = result.invoice;
    voucherModalOpen.value = true;
    handleResetForm();
  } catch (err: unknown) {
    formError.value = getErrorMessage(err, 'No fue posible emitir la orden de venta.');
  }
};
</script>

<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-12">
    <!-- Encabezado de la Página -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
          <ShoppingCart class="h-6 w-6 text-sky-600" />
          <span>Nueva Orden de Venta</span>
        </h1>
        <p class="text-sm text-slate-500 mt-0.5">
          Complete los datos del cliente, dirección de entrega y productos para procesar la orden.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="showResetConfirm = true"
        class="flex items-center space-x-1.5 text-slate-600 self-start sm:self-auto"
      >
        <RefreshCw class="h-4 w-4" />
        <span>Limpiar Formulario</span>
      </Button>
    </div>

    <!-- Banner de Error si falla la creación -->
    <div
      v-if="formError"
      class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3 shadow-xs"
    >
      <AlertTriangle class="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      <div class="flex-1 whitespace-pre-line">{{ formError }}</div>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-6" novalidate>
      <!-- Paso 1: Datos del Cliente y Facturación -->
      <Card class="border-slate-200 shadow-xs">
        <CardHeader class="pb-3">
          <CardTitle class="text-base flex items-center space-x-2 text-slate-800">
            <span class="flex items-center justify-center h-6 w-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
              1
            </span>
            <span>Datos del Cliente y Facturación</span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Selector de Cliente con Modal -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Cliente Comercial *
              </label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <Input
                    :model-value="selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.id})` : ''"
                    placeholder="Seleccione un cliente..."
                    readonly
                    @click="showCustomerModal = true"
                    class="cursor-pointer bg-slate-50 focus:bg-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  @click="showCustomerModal = true"
                  class="shrink-0"
                >
                  <Users class="h-4 w-4 mr-1 text-sky-600" />
                  <span>Buscar</span>
                </Button>
              </div>

              <p v-if="errors.customer" class="mt-1 text-xs text-red-600 font-medium">
                {{ errors.customer }}
              </p>

              <!-- Insignias informativas del cliente seleccionado -->
              <div v-if="selectedCustomer" class="mt-2 flex items-center gap-2">
                <Badge
                  :variant="selectedCustomer.customerType === 'Empresa' ? 'info' : 'default'"
                  class="text-[11px]"
                >
                  <Building2 class="h-3 w-3 mr-1" />
                  {{ selectedCustomer.customerType }}
                </Badge>
                <Badge
                  :variant="selectedCustomer.currentBalance <= 0 ? 'success' : 'danger'"
                  class="font-mono text-[11px]"
                >
                  Saldo: ${{ Number(selectedCustomer.currentBalance).toFixed(2) }}
                </Badge>
              </div>
            </div>

            <!-- Identificación Tributaria (Cédula o RUC con validación en tiempo real) -->
            <div>
              <Input
                id="order-doc"
                label="Cédula / RUC *"
                placeholder="1790012345001"
                :max-length="13"
                :error="errors.customerDocument"
                :model-value="customerDocument"
                @update:model-value="customerDocument = sanitizeDigits($event).slice(0, 13)"
                @blur="markTouched('customerDocument')"
                @keydown="allowOnlyDigits"
              />
              <p v-if="customerDocument && documentValidation.isValid" class="text-xs text-emerald-600 mt-1 font-medium">
                ✓ {{ documentValidation.message }}
              </p>
              <p v-else class="text-[11px] text-slate-500 mt-1">
                10 dígitos (Cédula) o 13 dígitos (RUC).
              </p>
            </div>
          </div>

          <!-- Dirección de Entrega -->
          <div class="border-t border-slate-100 pt-4">
            <h4 class="text-xs font-semibold uppercase text-slate-500 mb-3 flex items-center space-x-1">
              <MapPin class="h-3.5 w-3.5 text-sky-600" />
              <span>Dirección de Destino / Envío</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div class="sm:col-span-2">
                <Input
                  id="ship-address"
                  label="Dirección *"
                  placeholder="Av. Principal 123 y Secundaria"
                  :max-length="60"
                  :error="errors.shipAddress"
                  :model-value="shipAddress"
                  @update:model-value="shipAddress = sanitizeAddress($event).slice(0, 60)"
                  @blur="markTouched('shipAddress')"
                  @keydown="allowAddressChars"
                />
              </div>

              <div>
                <Input
                  id="ship-city"
                  label="Ciudad *"
                  placeholder="Quito"
                  :max-length="30"
                  :error="errors.shipCity"
                  :model-value="shipCity"
                  @update:model-value="shipCity = sanitizeLettersAndSpaces($event).slice(0, 30)"
                  @blur="markTouched('shipCity')"
                  @keydown="allowOnlyLettersAndSpaces"
                />
              </div>

              <div>
                <Input
                  id="ship-country"
                  label="País *"
                  placeholder="Ecuador"
                  :max-length="30"
                  :error="errors.shipCountry"
                  :model-value="shipCountry"
                  @update:model-value="shipCountry = sanitizeLettersAndSpaces($event).slice(0, 30)"
                  @blur="markTouched('shipCountry')"
                  @keydown="allowOnlyLettersAndSpaces"
                />
              </div>

              <div class="sm:col-span-2 md:col-span-1">
                <Input
                  id="ship-postal"
                  label="Código Postal"
                  placeholder="170150"
                  :max-length="10"
                  :model-value="shipPostalCode"
                  @update:model-value="shipPostalCode = sanitizeDigits($event).slice(0, 10)"
                  @keydown="allowOnlyDigits"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Paso 2: Líneas de la Orden (Carrito de Compras) -->
      <Card class="border-slate-200 shadow-xs">
        <CardHeader class="pb-3 flex flex-row items-center justify-between">
          <CardTitle class="text-base flex items-center space-x-2 text-slate-800">
            <span class="flex items-center justify-center h-6 w-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
              2
            </span>
            <span>Líneas de la Orden (Carrito de Compras)</span>
          </CardTitle>
          <Button
            type="button"
            size="sm"
            @click="isCatalogOpen = true"
            class="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Plus class="h-4 w-4 mr-1.5" />
            <span>Agregar Productos</span>
          </Button>
        </CardHeader>
        <CardContent class="p-0">
          <div v-if="cartItems.length === 0" class="p-12 text-center text-slate-400 space-y-2">
            <ShoppingCart class="h-10 w-10 mx-auto text-slate-300" />
            <p class="font-medium text-sm text-slate-600">No hay productos agregados</p>
            <p class="text-xs text-slate-400">
              Haga clic en &quot;Agregar Productos&quot; para abrir el catálogo y seleccionar ítems.
            </p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead class="w-16">ID</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead class="text-right w-28">Precio Unit.</TableHead>
                <TableHead class="text-center w-36">Cantidad</TableHead>
                <TableHead class="text-right w-32">Subtotal</TableHead>
                <TableHead class="text-center w-16">Quitar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in cartItems" :key="item.productId">
                <TableCell class="font-mono text-xs font-bold text-slate-500">
                  #{{ item.productId }}
                </TableCell>
                <TableCell class="font-medium text-slate-900">
                  {{ item.productName }}
                </TableCell>
                <TableCell class="text-right font-mono text-xs">
                  ${{ Number(item.unitPrice).toFixed(2) }}
                </TableCell>
                <TableCell class="text-center">
                  <div class="flex items-center justify-center space-x-1">
                    <button
                      type="button"
                      @click="handleUpdateQuantity(item.productId, item.quantity - 1)"
                      class="h-7 w-7 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      :max="item.unitsInStock"
                      :value="item.quantity"
                      @change="(e) => handleUpdateQuantity(item.productId, parseInt((e.target as HTMLInputElement).value) || 1)"
                      class="h-7 w-12 text-center font-mono text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      @click="handleUpdateQuantity(item.productId, item.quantity + 1)"
                      :disabled="item.quantity >= item.unitsInStock"
                      class="h-7 w-7 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </TableCell>
                <TableCell class="text-right font-mono font-semibold text-slate-900">
                  ${{ Number(item.subTotal).toFixed(2) }}
                </TableCell>
                <TableCell class="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    @click="itemToDelete = item"
                    class="h-8 w-8 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <!-- Paso 3: Resumen y Emisión de Orden -->
      <Card class="border-slate-200 shadow-xs">
        <CardContent class="p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div class="text-xs text-slate-500 space-y-1">
              <p>Tarifa de impuesto calculada con IVA 15% (Ecuador vigente).</p>
              <p>El cliente debe tener saldo comercial al día ($0.00) para emitir la orden.</p>
            </div>

            <div class="w-full sm:w-80 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span class="font-mono font-semibold">${{ Number(subTotal).toFixed(2) }} USD</span>
              </div>
              <div class="flex justify-between text-xs text-slate-600">
                <span>IVA (15%):</span>
                <span class="font-mono font-semibold">${{ Number(tax).toFixed(2) }} USD</span>
              </div>
              <div class="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>TOTAL:</span>
                <span class="font-mono text-emerald-700">${{ Number(total).toFixed(2) }} USD</span>
              </div>

              <div class="pt-3">
                <Button
                  type="submit"
                  :disabled="isSubmitDisabled"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Loader2 v-if="createOrderMutation.isPending.value" class="h-4 w-4 animate-spin" />
                  <Send v-else class="h-4 w-4" />
                  <span>{{ createOrderMutation.isPending.value ? 'Procesando Orden...' : 'Emitir Orden de Venta' }}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>

    <!-- Modal para Seleccionar Producto del Catálogo -->
    <ProductSelectorModal
      :open="isCatalogOpen"
      @update:open="isCatalogOpen = $event"
      :selected-product-ids="cartItems.map((i) => i.productId)"
      @select-product="handleAddProduct"
    />

    <!-- Modal para Seleccionar Cliente Comercial -->
    <CustomerSelectorModal
      :open="showCustomerModal"
      @update:open="showCustomerModal = $event"
      @select-customer="handleSelectCustomer"
      :selected-customer-id="selectedCustomerId"
    />

    <!-- Modal de Confirmación para Quitar un Producto del Carrito -->
    <Dialog
      :open="itemToDelete !== null"
      @update:open="
        (open) => {
          if (!open) itemToDelete = null;
        }
      "
      title="Confirmar Eliminación"
      description="Gestión de líneas de detalle de la orden"
    >
      <div class="space-y-4">
        <p class="text-sm text-slate-700">
          ¿Está seguro de que desea eliminar el producto
          <strong class="text-slate-900">&quot;{{ itemToDelete?.productName }}&quot;</strong> (ID #{{
            itemToDelete?.productId
          }}) del pedido?
        </p>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            @click="itemToDelete = null"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            @click="confirmRemoveItem"
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 class="h-4 w-4 mr-1.5" />
            Eliminar Producto
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- Modal de Confirmación para Limpiar Todo el Formulario -->
    <Dialog
      :open="showResetConfirm"
      @update:open="showResetConfirm = $event"
      title="Confirmar Reinicio del Formulario"
      description="Gestión de datos de la orden en curso"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
          <AlertTriangle class="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p class="font-semibold">¿Está seguro de que desea limpiar el formulario?</p>
            <p class="text-xs text-amber-700 mt-1">
              Se descartarán los datos del cliente seleccionado, los campos de destino y todos los productos agregados al carrito de compra.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            @click="showResetConfirm = false"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            @click="
              () => {
                showResetConfirm = false;
                handleResetForm();
              }
            "
            class="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw class="h-4 w-4 mr-1.5" />
            Limpiar Formulario
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- Modal de Comprobante / Factura Oficial (Patrón Snapshot) -->
    <Dialog
      :open="voucherModalOpen"
      @update:open="voucherModalOpen = $event"
      title="Factura Emitida con Éxito"
      description="Se ha registrado la orden de venta y generado el comprobante electrónico correspondiente."
      class="max-w-4xl"
    >
      <InvoiceVoucher
        v-if="issuedInvoice"
        :invoice="issuedInvoice"
        @close="voucherModalOpen = false"
        :show-print-button="true"
      />
    </Dialog>
  </div>
</template>
