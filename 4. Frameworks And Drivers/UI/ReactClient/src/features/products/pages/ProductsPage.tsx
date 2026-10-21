import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Badge } from '@/shared/ui/Badge';
import { Dialog } from '@/shared/ui/Dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/ui/Table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/Card';
import { useDebounce } from '@/shared/utils/useDebounce';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { ProductDto, ProductFilters } from '../types';
import { ProductModal } from '../components/ProductModal';
import { getErrorMessage } from '@/core/api/apiClient';

export const ProductsPage: React.FC = () => {
  const [searchTermInput, setSearchTermInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchTermInput, 350);

  const [stockFilter, setStockFilter] = useState<number>(0);
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [orderBy, setOrderBy] = useState<'name' | 'price' | 'stock'>('name');
  const [ascending, setAscending] = useState<boolean>(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<ProductDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteProductMutation = useDeleteProduct();

  const parsedMinPrice = minPriceInput !== '' && !isNaN(Number(minPriceInput)) ? Number(minPriceInput) : undefined;
  const parsedMaxPrice = maxPriceInput !== '' && !isNaN(Number(maxPriceInput)) ? Number(maxPriceInput) : undefined;

  const filters: ProductFilters = {
    searchTerm: debouncedSearchTerm,
    stockFilter: stockFilter > 0 ? stockFilter : undefined,
    minPrice: parsedMinPrice,
    maxPrice: parsedMaxPrice,
    orderBy,
    ascending,
  };

  const { data: products = [], isLoading, isError, error, refetch, isFetching } = useProducts(filters);

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: ProductDto) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteError(null);
    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      setProductToDelete(null);
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, 'No se pudo eliminar el producto. Compruebe que no forme parte de órdenes registradas.'));
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return <Badge variant="danger">0 (Agotado)</Badge>;
    }
    if (stock <= 10) {
      return <Badge variant="warning">{stock} un. (Stock Bajo)</Badge>;
    }
    return <Badge variant="success">{stock} un. (En Stock)</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-7 w-7 text-sky-600" />
            Catálogo de Productos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Control de inventario, existencias en almacén y fijación de precios unitarios
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="shadow-sm shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="lg:col-span-4">
              <label htmlFor="search-products" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search-products"
                  placeholder="Buscar producto por nombre..."
                  value={searchTermInput}
                  onChange={(e) => setSearchTermInput(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="lg:col-span-3">
              <label htmlFor="filter-stock" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Nivel de Stock
              </label>
              <select
                id="filter-stock"
                value={stockFilter}
                onChange={(e) => setStockFilter(Number(e.target.value))}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value={0}>Todos los Estados</option>
                <option value={1}>En Stock (&gt; 0)</option>
                <option value={2}>Stock Bajo (≤ 10)</option>
                <option value={3}>Agotados (0)</option>
              </select>
            </div>

            {/* Price Ranges */}
            <div className="lg:col-span-2 flex gap-2">
              <div className="w-1/2">
                <label htmlFor="min-price" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Mín ($)
                </label>
                <Input
                  id="min-price"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="max-price" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Máx ($)
                </label>
                <Input
                  id="max-price"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="100"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                />
              </div>
            </div>

            {/* Order By Filter */}
            <div className="lg:col-span-3 flex gap-2 items-center">
              <div className="flex-1">
                <label htmlFor="product-order-by" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Ordenar
                </label>
                <select
                  id="product-order-by"
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value as 'name' | 'price' | 'stock')}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="name">Nombre</option>
                  <option value="price">Precio</option>
                  <option value="stock">Stock</option>
                </select>
              </div>

              <div className="pt-5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAscending(!ascending)}
                  title={ascending ? 'Ascendente (A-Z, Menor a Mayor)' : 'Descendente (Z-A, Mayor a Menor)'}
                  aria-label="Alternar orden"
                  className={ascending ? 'text-sky-600' : 'text-slate-600'}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{getErrorMessage(error, 'Error al consultar el catálogo de productos.')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-red-300 hover:bg-red-100">
            Reintentar
          </Button>
        </div>
      )}

      {/* Table Section */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Inventario de Productos ({products.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Artículos disponibles para venta y facturación
            </CardDescription>
          </div>
          {isFetching && (
            <div className="flex items-center gap-1.5 text-xs text-sky-600 font-medium">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Actualizando...</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nombre del Producto</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Unidades en Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-sky-600" />
                      <span>Cargando catálogo de productos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-slate-300" />
                      <p className="font-medium text-slate-700">No se encontraron productos</p>
                      <p className="text-xs text-slate-400">
                        Ajuste los criterios de filtrado o agregue un nuevo producto al catálogo
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-slate-500 font-medium">
                      #{p.id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {p.name}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      {formatPrice(p.unitPrice)}
                    </TableCell>
                    <TableCell>
                      {getStockBadge(p.unitsInStock)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(p)}
                          title="Editar producto"
                          aria-label={`Editar producto ${p.name}`}
                          className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteError(null);
                            setProductToDelete(p);
                          }}
                          title="Eliminar producto"
                          aria-label={`Eliminar producto ${p.name}`}
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        productToEdit={selectedProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
            setDeleteError(null);
          }
        }}
        title="Eliminar Producto"
        description="Esta acción eliminará el producto del catálogo permanentemente."
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 whitespace-pre-line">{deleteError}</div>
            </div>
          )}

          <p className="text-sm text-slate-600">
            ¿Está seguro de que desea eliminar el producto{' '}
            <strong className="text-slate-900">{productToDelete?.name}</strong> (ID: #{productToDelete?.id})?
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProductToDelete(null);
                setDeleteError(null);
              }}
              disabled={deleteProductMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              isLoading={deleteProductMutation.isPending}
            >
              Confirmar Eliminación
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
