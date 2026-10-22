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
    searchTerm: debouncedSearchTerm.value,
    stockFilter: stockFilter.value > 0 ? stockFilter.value : undefined,
    minPrice: parsedMinPrice,
    maxPrice: parsedMaxPrice,
    orderBy: orderBy.value,
    ascending: ascending.value,
  };
});

const {
  data: products,
  isLoading,
  isError,
  error,
  refetch,
  isFetching,
} = useProducts(filters);

const productItems = computed(() => products.value ?? []);

const currentPage = ref(1);
const pageSize = 10;

watch([searchTermInput, stockFilter, minPriceInput, maxPriceInput, orderBy, ascending], () => {
  currentPage.value = 1;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return productItems.value.slice(start, start + pageSize);
});


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
      'No se pudo eliminar el producto. Compruebe que no forme parte de órdenes registradas en el sistema.'
    );
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
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

    <!-- Filters Card -->
    <Card class="border-slate-200 shadow-xs">
      <CardContent class="p-4 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <!-- Búsqueda por Nombre -->
          <div class="lg:col-span-4">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Búsqueda por Nombre
            </label>
            <div class="relative">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre de producto..."
                v-model="searchTermInput"
                class="pl-9"
              />
            </div>
          </div>

          <!-- Filtro de Stock -->
          <div class="lg:col-span-3">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Estado de Inventario
            </label>
            <select
              v-model.number="stockFilter"
              class="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option :value="0">Todos los Estados</option>
              <option :value="1">En Stock (> 0 uds.)</option>
              <option :value="2">Stock Bajo (<= 10 uds.)</option>
              <option :value="3">Agotado (0 uds.)</option>
            </select>
          </div>

          <!-- Rango Precio Min - Max -->
          <div class="lg:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Precio Mín.
              </label>
              <Input
                type="number"
                placeholder="0.00"
                v-model="minPriceInput"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Precio Máx.
              </label>
              <Input
                type="number"
                placeholder="100.00"
                v-model="maxPriceInput"
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
                <option value="price">Precio</option>
                <option value="stock">Stock</option>
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
            Se encontraron <strong class="text-slate-800">{{ productItems.length }}</strong> producto(s)
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

    <!-- Tabla de Productos -->
    <Card class="border-slate-200 shadow-xs overflow-hidden">
      <CardContent class="p-0">
        <div v-if="isLoading" class="p-12 text-center text-slate-500">
          <RefreshCw class="h-8 w-8 mx-auto text-sky-600 animate-spin mb-3" />
          <p class="font-medium text-sm">Cargando catálogo de productos...</p>
        </div>

        <div v-else-if="isError" class="p-8 text-center text-rose-600 space-y-2">
          <AlertCircle class="h-8 w-8 mx-auto text-rose-500" />
          <p class="font-semibold text-sm">Error al cargar productos</p>
          <p class="text-xs text-slate-500">{{ getErrorMessage(error) }}</p>
          <Button variant="outline" size="sm" @click="() => refetch()" class="mt-2">
            Reintentar
          </Button>
        </div>

        <div v-else-if="productItems.length === 0" class="p-12 text-center text-slate-400 space-y-3">
          <Package class="h-10 w-10 mx-auto text-slate-300" />
          <p class="font-medium text-sm text-slate-600">No se encontraron productos</p>
          <p class="text-xs text-slate-400">Intente modificar los filtros de búsqueda o registre un nuevo producto.</p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-20">ID</TableHead>
              <TableHead>Nombre del Producto</TableHead>
              <TableHead class="text-right">Precio Unitario</TableHead>
              <TableHead class="text-center">Existencias</TableHead>
              <TableHead class="text-center w-36">Estado</TableHead>
              <TableHead class="text-right w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="p in paginatedProducts" :key="p.id">
              <TableCell class="font-mono text-xs font-bold text-slate-500">
                #{{ p.id }}
              </TableCell>
              <TableCell class="font-medium text-slate-900">
                {{ p.name }}
              </TableCell>
              <TableCell class="text-right font-mono font-semibold text-slate-900">
                {{ formatPrice(p.unitPrice) }}
              </TableCell>
              <TableCell class="text-center font-mono font-medium text-slate-700">
                {{ p.unitsInStock }} uds.
              </TableCell>
              <TableCell class="text-center">
                <Badge
                  v-if="p.unitsInStock <= 0"
                  variant="danger"
                  class="inline-flex items-center gap-1"
                >
                  <XCircle class="w-3 h-3" />
                  <span>Agotado</span>
                </Badge>
                <Badge
                  v-else-if="p.unitsInStock <= 10"
                  variant="warning"
                  class="inline-flex items-center gap-1"
                >
                  <AlertCircle class="w-3 h-3" />
                  <span>Stock Bajo</span>
                </Badge>
                <Badge
                  v-else
                  variant="success"
                  class="inline-flex items-center gap-1"
                >
                  <CheckCircle2 class="w-3 h-3" />
                  <span>En Stock</span>
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
        <Pagination v-model:current-page="currentPage" :total-items="productItems.length" :page-size="pageSize" item-name="productos" />
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
