<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, Plus, Check, AlertCircle, Package, X, CheckCircle2, ArrowLeftRight } from 'lucide-vue-next';
import { useProducts } from '@/features/products/composables/useProducts';
import type { ProductDto, ProductFilters } from '@/features/products/types';
import { useDebounce } from '@/shared/utils/useDebounce';
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

interface Props {
  open: boolean;
  selectedProductIds: number[];
  title?: string;
  description?: string;
  actionLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  selectedProductIds: () => [],
  title: 'Catálogo de Productos para la Orden',
  description: 'Seleccione los productos disponibles en inventario para agregar al carrito de compra.',
  actionLabel: 'Agregar',
});

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'select-product', product: ProductDto): void;
}>();

const searchTerm = ref('');
const debouncedSearchTerm = useDebounce(searchTerm, 350);
const searchCriteria = ref<'all' | 'name' | 'id'>('all');
const onlyInStock = ref(true);

const currentPage = ref(1);
const pageSize = 5;

const filters = computed<ProductFilters>(() => {
  return {
    searchTerm: debouncedSearchTerm.value.trim() || undefined,
    stockFilter: onlyInStock.value ? 1 : undefined,
    pageNumber: currentPage.value,
    pageSize,
  };
});

watch([debouncedSearchTerm, onlyInStock], () => {
  currentPage.value = 1;
});

const { data: pagedData, isLoading, error } = useProducts(filters);
const productList = computed(() => pagedData.value?.items ?? []);
const totalCount = computed(() => pagedData.value?.totalCount ?? 0);
const totalPages = computed(() => pagedData.value?.totalPages ?? 1);

const handleSelect = (product: ProductDto) => {
  if (product.unitsInStock <= 0 || props.selectedProductIds.includes(product.id)) {
    return;
  }
  emit('select-product', product);
};

const getPlaceholder = () => {
  if (searchCriteria.value === 'id') return 'Buscar específicamente por ID (ej: 1, 2)...';
  if (searchCriteria.value === 'name') return 'Buscar específicamente por nombre de producto...';
  return 'Buscar por nombre o ID de producto...';
};
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
    :title="title"
    :description="description"
    class="max-w-4xl"
  >
    <div class="space-y-4 pt-1">
      <!-- Controles de Búsqueda y Filtro de Stock -->
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div class="flex items-center gap-2 flex-1 sm:max-w-md">
          <select
            v-model="searchCriteria"
            class="text-xs h-9 rounded-lg border border-slate-300 bg-white px-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">🔍 Todos</option>
            <option value="name">📦 Nombre</option>
            <option value="id">#️⃣ ID</option>
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

        <label class="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            v-model="onlyInStock"
            class="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
          />
          <span>Solo productos con existencias disponibles</span>
        </label>
      </div>

      <!-- Product Catalog Table -->
      <div class="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
        <div v-if="isLoading" class="p-8 text-center text-slate-500">
          <Package class="h-8 w-8 mx-auto text-slate-400 animate-spin mb-2" />
          Cargando catálogo de productos...
        </div>

        <div v-else-if="error" class="p-6 text-center text-rose-600 flex items-center justify-center space-x-2">
          <AlertCircle class="h-5 w-5" />
          <span>Error al obtener productos. Por favor intente nuevamente.</span>
        </div>

        <div v-else-if="productList.length === 0" class="p-8 text-center text-slate-400">
          No se encontraron productos coincidentes con los filtros aplicados.
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-16">ID</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead class="text-right">Precio Unitario</TableHead>
              <TableHead class="text-center">Stock Disp.</TableHead>
              <TableHead class="text-right w-36">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="product in productList"
              :key="product.id"
              :class="selectedProductIds.includes(product.id) ? 'bg-amber-50/30' : ''"
            >
              <TableCell class="font-mono font-bold text-xs text-slate-500">
                #{{ product.id }}
              </TableCell>
              <TableCell>
                <div class="font-medium text-slate-800">{{ product.name }}</div>
                <div
                  v-if="selectedProductIds.includes(product.id)"
                  class="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5"
                >
                  <CheckCircle2 class="w-3 h-3 text-amber-600" />
                  Ya incluido en la orden
                </div>
              </TableCell>
              <TableCell class="text-right font-mono font-semibold text-sky-700">
                ${{ Number(product.unitPrice).toFixed(2) }}
              </TableCell>
              <TableCell class="text-center">
                <Badge v-if="product.unitsInStock <= 0" variant="danger">Agotado</Badge>
                <Badge v-else-if="product.unitsInStock <= 5" variant="warning">
                  {{ product.unitsInStock }} uds.
                </Badge>
                <Badge v-else variant="success">
                  {{ product.unitsInStock }} uds.
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <span
                  v-if="selectedProductIds.includes(product.id)"
                  class="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md space-x-1"
                >
                  <Check class="h-3.5 w-3.5 text-amber-600" />
                  <span>Agregado</span>
                </span>
                <Button
                  v-else
                  type="button"
                  size="sm"
                  :disabled="product.unitsInStock <= 0"
                  @click="handleSelect(product)"
                  class="h-8 px-2.5 text-xs flex items-center space-x-1 ml-auto"
                >
                  <Plus v-if="actionLabel === 'Agregar'" class="h-3.5 w-3.5" />
                  <ArrowLeftRight v-else class="h-3.5 w-3.5" />
                  <span>{{ actionLabel }}</span>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Paginación -->
      <Pagination
        v-model:current-page="currentPage"
        :total-count="totalCount"
        :total-pages="totalPages"
        :page-size="pageSize"
        item-name="productos"
      />

      <!-- Footer -->
      <div class="flex justify-between items-center pt-1">
        <span class="text-xs text-slate-500">
          Mostrando {{ productList.length }} de {{ totalCount }} productos
        </span>
        <Button type="button" variant="outline" @click="emit('update:open', false)">
          Cerrar Catálogo
        </Button>
      </div>
    </div>
  </Dialog>
</template>
