import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, AlertCircle, Package, X, CheckCircle2 } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ProductDto } from '@/features/products/types';
import { Dialog } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/Table';

export interface ProductSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProductIds: number[];
  onSelectProduct: (product: ProductDto) => void;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  open,
  onOpenChange,
  selectedProductIds,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<'all' | 'name' | 'id'>('all');
  const [onlyInStock, setOnlyInStock] = useState(true);

  const { data: products = [], isLoading, error } = useProducts();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filtro de existencias
      if (onlyInStock && p.unitsInStock <= 0) {
        return false;
      }

      // Filtro de texto por criterio
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        if (searchCriteria === 'id') {
          return p.id.toString().includes(term);
        }
        if (searchCriteria === 'name') {
          return p.name.toLowerCase().includes(term);
        }
        return p.name.toLowerCase().includes(term) || p.id.toString().includes(term);
      }

      return true;
    });
  }, [products, onlyInStock, searchTerm, searchCriteria]);

  const handleSelect = (product: ProductDto) => {
    if (product.unitsInStock <= 0 || selectedProductIds.includes(product.id)) {
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
      title="Catálogo de Productos para la Orden"
      description="Seleccione los productos disponibles en inventario para agregar al carrito de compra."
      className="max-w-4xl"
    >
      <div className="space-y-4 pt-1">
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
                  <TableHead className="text-right w-36">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isAlreadySelected = selectedProductIds.includes(product.id);
                  const isOutOfStock = product.unitsInStock <= 0;

                  return (
                    <TableRow
                      key={product.id}
                      className={isAlreadySelected ? 'bg-amber-50/30' : ''}
                    >
                      <TableCell className="font-mono font-bold text-xs text-slate-500">
                        #{product.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-800">{product.name}</div>
                        {isAlreadySelected && (
                          <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-amber-600" />
                            Ya incluido en la orden
                          </div>
                        )}
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
                        {isAlreadySelected ? (
                          <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md space-x-1">
                            <Check className="h-3.5 w-3.5 text-amber-600" />
                            <span>Agregado</span>
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => handleSelect(product)}
                            className="h-8 px-2.5 text-xs flex items-center space-x-1 ml-auto"
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
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar Catálogo
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
