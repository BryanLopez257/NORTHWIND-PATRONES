import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, AlertCircle, Package } from 'lucide-react';
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
  const { data: products = [], isLoading, error } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.id.toString().includes(term)
    );
  }, [products, searchTerm]);

  const handleSelect = (product: ProductDto) => {
    if (product.unitsInStock <= 0 || selectedProductIds.includes(product.id)) {
      return;
    }
    onSelectProduct(product);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Catálogo de Productos para la Orden"
      description="Seleccione los productos disponibles en inventario para agregar al carrito de compra."
      className="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar producto por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            autoFocus
          />
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
              No se encontraron productos coincidentes.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isAlreadySelected = selectedProductIds.includes(product.id);
                  const isOutOfStock = product.unitsInStock <= 0;

                  return (
                    <TableRow
                      key={product.id}
                      className={isAlreadySelected ? 'bg-slate-50/70' : ''}
                    >
                      <TableCell className="font-mono text-xs text-slate-500">
                        #{product.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-800">{product.name}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-slate-700">
                        ${Number(product.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {isOutOfStock ? (
                          <Badge variant="danger">Agotado</Badge>
                        ) : product.unitsInStock <= 5 ? (
                          <Badge variant="warning">{product.unitsInStock} unid.</Badge>
                        ) : (
                          <Badge variant="success">{product.unitsInStock} unid.</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAlreadySelected ? (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-600 space-x-1">
                            <Check className="h-3.5 w-3.5" />
                            <span>Agregado</span>
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => handleSelect(product)}
                            className="h-8 px-2.5 text-xs flex items-center space-x-1"
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
        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar Catálogo
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
