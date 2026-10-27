import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, AlertCircle, Package, X, CheckCircle2, ArrowLeftRight } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ProductDto, ProductFilters } from '@/features/products/types';
import { Dialog } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/Table';
import { Pagination } from '@/shared/ui';
import { useDebounce } from '@/shared/utils/useDebounce';

export interface ProductSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProductIds: number[];
  onSelectProduct: (product: ProductDto) => void;
  replacingProductId?: number | null;
  replacingProductName?: string;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  open,
  onOpenChange,
  selectedProductIds,
  onSelectProduct,
  replacingProductId,
  replacingProductName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<'all' | 'name' | 'id'>('all');
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const pageSize = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  const serverFilters: ProductFilters = useMemo(() => {
    return {
      searchTerm: debouncedSearchTerm.trim() || undefined,
      stockFilter: onlyInStock ? 1 : undefined,
      pageNumber,
      pageSize,
    };
  }, [debouncedSearchTerm, onlyInStock, pageNumber, pageSize]);

  React.useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchTerm, onlyInStock, searchCriteria]);

  const { data: pagedData, isLoading, error } = useProducts(serverFilters);
  const products = pagedData?.items ?? [];
  const totalCount = pagedData?.totalCount ?? 0;
  const totalPages = pagedData?.totalPages ?? 1;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (onlyInStock && p.unitsInStock <= 0) {
        return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const idStr = p.id.toString();
        const nameStr = (p.name ?? '').toLowerCase();

        if (searchCriteria === 'id') {
          return idStr.startsWith(term) || idStr === term;
        }
        if (searchCriteria === 'name') {
          return nameStr.includes(term);
        }
        return nameStr.includes(term) || idStr.startsWith(term) || idStr === term;
      }

      return true;
    });
  }, [products, onlyInStock, searchTerm, searchCriteria]);

  const isReplaceMode = Boolean(replacingProductId);

  const handleSelect = (product: ProductDto) => {
    if (product.unitsInStock <= 0) {
      return;
    }

    // En modo normal no se permite seleccionar un producto ya incluido
    if (!isReplaceMode && selectedProductIds.includes(product.id)) {
      return;
    }

    // En modo reemplazo no se permite seleccionar el mismo producto que se está reemplazando
    if (isReplaceMode && product.id === replacingProductId) {
      return;
    }

    onSelectProduct(product);
  };

  const getPlaceholder = () => {
    if (searchCriteria === 'id') return 'Buscar específicamente por ID (ej: 1, 2)...';
    if (searchCriteria === 'name') return 'Buscar específicamente por nombre de producto...';
    return 'Buscar por nombre o ID de producto...';
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        isReplaceMode
          ? `Reemplazar Producto: ${replacingProductName || `#${replacingProductId}`}`
          : 'Catálogo de Productos para la Orden'
      }
      description={
        isReplaceMode
          ? 'Seleccione el producto por el cual desea reemplazar este ítem. Si selecciona un producto ya existente en la orden, se incrementará su cantidad en 1.'
          : 'Seleccione los productos disponibles en inventario para agregar al carrito de compra.'
      }
      className="max-w-4xl"
    >
      <div className="space-y-4 pt-1">
        {/* Banner de Modo Reemplazo */}
        {isReplaceMode && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start space-x-2.5">
            <ArrowLeftRight className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Modo Reemplazo:</span> El producto actual a reemplazar está deshabilitado. Puede elegir cualquier otro producto del catálogo o uno ya incluido en la orden (se le sumará +1 unidad).
            </div>
          </div>
        )}

        {/* Controles de Búsqueda y Filtro de Stock */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <select
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value as 'all' | 'name' | 'id')}
              className="text-xs h-9 rounded-lg border border-slate-300 bg-white px-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">🔍 Todos</option>
              <option value="name">📦 Nombre</option>
              <option value="id">#️⃣ ID</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={getPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 text-xs sm:text-sm h-9"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  title="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Solo productos con existencias disponibles</span>
          </label>
        </div>

        {/* Product Catalog Table */}
        <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              <Package className="h-8 w-8 mx-auto text-slate-400 animate-spin mb-2" />
              Cargando catálogo de productos...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-600 flex items-center justify-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Error al obtener productos. Por favor intente nuevamente.</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No se encontraron productos coincidentes con los filtros aplicados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Precio Unitario</TableHead>
                  <TableHead className="text-center">Stock Disp.</TableHead>
                  <TableHead className="text-right w-44">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isCurrentReplacingProduct = isReplaceMode && product.id === replacingProductId;
                  const isAlreadyInCart = selectedProductIds.includes(product.id);
                  const isOutOfStock = product.unitsInStock <= 0;

                  return (
                    <TableRow
                      key={product.id}
                      className={
                        isCurrentReplacingProduct
                          ? 'bg-slate-100/70 opacity-75'
                          : isAlreadyInCart
                          ? 'bg-amber-50/40'
                          : ''
                      }
                    >
                      <TableCell className="font-mono font-bold text-xs text-slate-500">
                        #{product.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-800">{product.name}</div>
                        {isCurrentReplacingProduct ? (
                          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>
                            Producto seleccionado para reemplazo
                          </div>
                        ) : isAlreadyInCart && isReplaceMode ? (
                          <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Ya en la orden (al seleccionar se sumará +1)
                          </div>
                        ) : isAlreadyInCart ? (
                          <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-amber-600" />
                            Ya incluido en la orden
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-blue-700">
                        ${Number(product.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {isOutOfStock ? (
                          <Badge variant="danger">Agotado</Badge>
                        ) : product.unitsInStock <= 5 ? (
                          <Badge variant="warning">{product.unitsInStock} uds.</Badge>
                        ) : (
                          <Badge variant="success">{product.unitsInStock} uds.</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* 1. Si es el producto sobre el cual se dio clic en reemplazar: deshabilitado con cursor-not-allowed */}
                        {isCurrentReplacingProduct ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={true}
                            className="h-8 px-3 text-xs bg-slate-200 text-slate-500 border border-slate-300 opacity-60 cursor-not-allowed hover:bg-slate-200 ml-auto select-none"
                            title="No se puede reemplazar por el mismo producto"
                          >
                            <span>Producto actual</span>
                          </Button>
                        ) : isReplaceMode && isAlreadyInCart ? (
                          /* 2. Si es modo reemplazo y ya estaba en la lista: botón habilitado para sumar +1 */
                          <Button
                            type="button"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => handleSelect(product)}
                            className="h-8 px-2.5 text-xs flex items-center space-x-1 ml-auto bg-amber-600 hover:bg-amber-700 text-white"
                            title="Reemplaza el producto anterior e incrementa en 1 la cantidad de este ítem"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Sumar +1</span>
                          </Button>
                        ) : isReplaceMode ? (
                          /* 3. Si es modo reemplazo y no estaba en la lista: botón reemplazar */
                          <Button
                            type="button"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => handleSelect(product)}
                            className="h-8 px-2.5 text-xs flex items-center space-x-1 ml-auto bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                            <span>Reemplazar</span>
                          </Button>
                        ) : isAlreadyInCart ? (
                          /* 4. Modo agregar normal y ya agregado */
                          <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md space-x-1">
                            <Check className="h-3.5 w-3.5 text-amber-600" />
                            <span>Agregado</span>
                          </span>
                        ) : (
                          /* 5. Modo agregar normal */
                          <Button
                            type="button"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => handleSelect(product)}
                            className="h-8 px-2.5 text-xs flex items-center space-x-1 ml-auto bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Agregar</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPageNumber}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500">
            Mostrando {filteredProducts.length} de {totalCount} productos
          </span>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar Catálogo
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
