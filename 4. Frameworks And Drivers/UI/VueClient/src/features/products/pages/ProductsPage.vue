<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Package,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
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
import { useProducts, useDeleteProduct } from '../composables/useProducts';
import type { ProductDto, ProductFilters } from '../types';
import ProductModal from '../components/ProductModal.vue';
import { getErrorMessage } from '@/core/api/apiClient';
import { cn } from '@/shared/utils/cn';

const searchTermInput = ref('');
const debouncedSearchTerm = useDebounce(searchTermInput, 350);

const stockFilter = ref<number>(0);
const minPriceInput = ref<string>('');
const maxPriceInput = ref<string>('');
const orderBy = ref<'name' | 'price' | 'stock'>('name');
const ascending = ref<boolean>(true);

const currentPage = ref(1);
const pageSize = 10;

// Modal states
const modalOpen = ref(false);
const selectedProduct = ref<ProductDto | null>(null);

// Delete modal state
const productToDelete = ref<ProductDto | null>(null);
const deleteError = ref<string | null>(null);

const deleteProductMutation = useDeleteProduct();

const filters = computed<ProductFilters>(() => {
  const parsedMinPrice =
    minPriceInput.value !== '' && !isNaN(Number(minPriceInput.value))
      ? Number(minPriceInput.value)
      : undefined;
  const parsedMaxPrice =
    maxPriceInput.value !== '' && !isNaN(Number(maxPriceInput.value))
      ? Number(maxPriceInput.value)
      : undefined;

  return {
    searchTerm: debouncedSearchTerm.value.trim() || undefined,
    stockFilter: stockFilter.value > 0 ? stockFilter.value : undefined,
    minPrice: parsedMinPrice,
    maxPrice: parsedMaxPrice,
    orderBy: orderBy.value,
    ascending: ascending.value,
    pageNumber: currentPage.value,
    pageSize,
  };
});

watch([searchTermInput, stockFilter, minPriceInput, maxPriceInput, orderBy, ascending], () => {
  currentPage.value = 1;
});

const {
  data: pagedData,
  isLoading,
  isError,
  error,
  refetch,
  isFetching,
} = useProducts(filters);

const productItems = computed(() => pagedData.value?.items ?? []);
const totalCount = computed(() => pagedData.value?.totalCount ?? 0);
const totalPages = computed(() => pagedData.value?.totalPages ?? 1);

const handleOpenCreate = () => {
  selectedProduct.value = null;
  modalOpen.value = true;
};

const handleOpenEdit = (product: ProductDto) => {
  selectedProduct.value = product;
  modalOpen.value = true;
};

const handleResetFilters = () => {
  searchTermInput.value = '';
  stockFilter.value = 0;
  minPriceInput.value = '';
  maxPriceInput.value = '';
  orderBy.value = 'name';
  ascending.value = true;
  currentPage.value = 1;
};

const handleConfirmDelete = async () => {
  if (!productToDelete.value) return;
  deleteError.value = null;
  try {
    await deleteProductMutation.mutateAsync(productToDelete.value.id);
    productToDelete.value = null;
  } catch (err: unknown) {
    deleteError.value = getErrorMessage(
      err,
      'No se pudo eliminar el producto. Verifique que no esté asociado a órdenes de compra existentes.'
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
    stockFilter.value !== 0 ||
    minPriceInput.value !== '' ||
    maxPriceInput.value !== '' ||
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
          <Package class="h-7 w-7 text-sky-600" />
          Gestión de Productos
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Administra el inventario de productos, precios y niveles de existencias con búsqueda segmentada.
        </p>
      </div>
      <Button @click="handleOpenCreate" class="shadow-sm shrink-0">
        <Plus class="h-4 w-4 mr-2" />
        Nuevo Producto
      </Button>
    </div>

    <!-- Segmentación Superior de Niveles de Stock -->
    <div class="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-fit border border-slate-200">
      <button
        type="button"
        @click="stockFilter = 0"
        :class="
          cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            stockFilter === 0
              ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          )
        "
      >
        <Package class="h-3.5 w-3.5" />
        <span>Todos los Productos</span>
      </button>

      <button
        type="button"
        @click="stockFilter = 1"
        :class="
          cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            stockFilter === 1
              ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          )
        "
      >
        <CheckCircle2 class="h-3.5 w-3.5 text-emerald-600" />
        <span>En Stock (&gt; 0)</span>
      </button>

      <button
        type="button"
        @click="stockFilter = 2"
        :class="
          cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            stockFilter === 2
              ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          )
        "
      >
        <AlertCircle class="h-3.5 w-3.5 text-amber-500" />
        <span>Stock Crítico (&le; 10)</span>
      </button>

      <button
        type="button"
        @click="stockFilter = 3"
        :class="
          cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2',
            stockFilter === 3
              ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          )
        "
      >
        <XCircle class="h-3.5 w-3.5 text-rose-500" />
        <span>Agotados (0)</span>
      </button>
    </div>

    <!-- Filtros y Búsqueda -->
    <Card>
      <CardContent class="pt-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <!-- Search Input -->
          <div class="md:col-span-5">
            <label for="search-products" class="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Búsqueda por Nombre
            </label>
            <div class="relative">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="search-products"
                placeholder="Buscar por nombre de producto..."
                v-model="searchTermInput"
                class="pl-9"
              />
            </div>
          </div>

          <!-- Rango de Precios -->
          <div class="md:col-span-4">
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Rango de Precio Unitario ($)
            </label>
            <div class="flex items-center gap-1">
              <Input
                type="number"
                placeholder="Mín"
                v-model="minPriceInput"
                class="h-10 text-xs px-2"
                min="0"
                step="0.5"
              />
              <span class="text-slate-400 text-xs">-</span>
              <Input
                type="number"
                placeholder="Máx"
                v-model="maxPriceInput"
                class="h-10 text-xs px-2"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <!-- Ordenación y Botón Limpiar -->
          <div class="md:col-span-3 flex gap-2 items-center">
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
                <option value="price">Precio</option>
                <option value="stock">Existencias</option>
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              @click="ascending = !ascending"
              :title="ascending ? 'Ascendente (A-Z, Menor a Mayor)' : 'Descendente (Z-A, Mayor a Menor)'"
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

    <!-- Tabla de Productos -->
    <Card>
      <CardHeader class="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle class="text-base font-semibold text-slate-800">
            Catálogo de Productos ({{ totalCount }} registros)
          </CardTitle>
          <CardDescription class="text-xs">
            Inventario en tiempo real con control de existencias
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
          <p class="text-sm">Cargando catálogo de productos...</p>
        </div>

        <div v-else-if="isError" class="p-12 text-center text-red-600">
          <AlertCircle class="h-8 w-8 mx-auto text-red-500 mb-2" />
          <p class="font-semibold text-sm">Error al cargar productos</p>
          <p class="text-xs text-slate-500 mt-1">{{ (error as any)?.message }}</p>
          <Button variant="outline" size="sm" @click="() => refetch()" class="mt-4">
            Reintentar
          </Button>
        </div>

        <div v-else-if="productItems.length === 0" class="p-12 text-center text-slate-400">
          <Package class="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p class="font-medium text-slate-600 text-sm">No se encontraron productos</p>
          <p class="text-xs text-slate-400 mt-1">
            Intente ajustar los filtros de búsqueda o registre un nuevo producto.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-20">ID</TableHead>
              <TableHead>Nombre del Producto</TableHead>
              <TableHead class="text-right w-36">Precio Unitario</TableHead>
              <TableHead class="text-center w-36">Existencias</TableHead>
              <TableHead class="text-center w-36">Estado</TableHead>
              <TableHead class="text-right w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="p in productItems" :key="p.id">
              <TableCell class="font-mono font-bold text-xs text-slate-500">
                #{{ p.id }}
              </TableCell>
              <TableCell class="font-medium text-slate-900">
                {{ p.name }}
              </TableCell>
              <TableCell class="text-right font-mono font-semibold text-slate-800">
                {{ formatCurrency(p.unitPrice) }}
              </TableCell>
              <TableCell class="text-center font-mono">
                <span :class="p.unitsInStock === 0 ? 'text-rose-600 font-bold' : 'text-slate-700'">
                  {{ p.unitsInStock }}
                </span>
              </TableCell>
              <TableCell class="text-center">
                <Badge
                  v-if="p.unitsInStock > 10"
                  variant="success"
                  class="inline-flex items-center gap-1"
                >
                  <CheckCircle2 class="w-3 h-3" />
                  <span>Disponible</span>
                </Badge>
                <Badge
                  v-else-if="p.unitsInStock > 0"
                  variant="warning"
                  class="inline-flex items-center gap-1"
                >
                  <AlertCircle class="w-3 h-3" />
                  <span>Stock Crítico</span>
                </Badge>
                <Badge
                  v-else
                  variant="danger"
                  class="inline-flex items-center gap-1"
                >
                  <XCircle class="w-3 h-3" />
                  <span>Agotado</span>
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="handleOpenEdit(p)"
                    title="Editar producto"
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
                        productToDelete = p;
                      }
                    "
                    title="Eliminar producto"
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
          item-name="productos"
        />
      </CardContent>
    </Card>

    <!-- Create / Edit Modal -->
    <ProductModal
      :open="modalOpen"
      @update:open="modalOpen = $event"
      :product-to-edit="selectedProduct"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog
      :open="Boolean(productToDelete)"
      @update:open="
        (open) => {
          if (!open) {
            productToDelete = null;
            deleteError = null;
          }
        }
      "
      title="Eliminar Producto"
      description="Esta acción eliminará el producto del catálogo permanentemente."
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
          ¿Está seguro de eliminar el producto
          <strong class="text-slate-900">&quot;{{ productToDelete?.name }}&quot;</strong> (ID #{{
            productToDelete?.id
          }})? Esta acción no se puede deshacer.
        </p>

        <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            @click="
              () => {
                productToDelete = null;
                deleteError = null;
              }
            "
            :disabled="deleteProductMutation.isPending.value"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            @click="handleConfirmDelete"
            :is-loading="deleteProductMutation.isPending.value"
          >
            Eliminar Producto
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
