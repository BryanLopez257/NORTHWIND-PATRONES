import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  Calendar,
  FileText,
  Eye,
  Printer,
  RefreshCw,
  Building2,
  AlertCircle,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { InvoiceFilters, InvoiceResponseDto } from '../types';
import { InvoiceVoucher } from '../components/InvoiceVoucher';
import { useDebounce } from '@/shared/utils/useDebounce';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Dialog } from '@/shared/ui/Dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/Table';

export const InvoicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<'all' | 'invoiceNumber' | 'customer'>('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  // Mapeo de filtros al backend según el criterio seleccionado.
  // El filtrado se ejecuta íntegramente en SQL Server (sin filtrado secundario en cliente).
  const serverFilters = useMemo<InvoiceFilters>(() => {
    const clean = debouncedSearchTerm.trim();
    if (!clean) return {};
    if (searchCriteria === 'invoiceNumber') {
      return { invoiceNumber: clean };
    }
    if (searchCriteria === 'customer') {
      return { customerName: clean };
    }
    // 'all': búsqueda global delegada al backend
    return { searchTerm: clean };
  }, [debouncedSearchTerm, searchCriteria]);

  const {
    data: invoices = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useInvoices(serverFilters);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponseDto | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const handleOpenVoucher = (invoice: InvoiceResponseDto) => {
    setSelectedInvoice(invoice);
    setIsVoucherModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('es-EC', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
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

  const getPlaceholder = () => {
    if (searchCriteria === 'invoiceNumber') {
      return 'Buscar específicamente por N° de factura (ej: FAC-0001)...';
    }
    if (searchCriteria === 'customer') {
      return 'Buscar específicamente por cliente (ej: ALFKI o Alfreds)...';
    }
    return 'Buscar por N° factura, código o nombre de cliente...';
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <Receipt className="h-6 w-6 text-blue-600" />
            <span>Historial de Facturas y Comprobantes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Consulta, auditoría contable y reimpresión de comprobantes electrónicos oficiales emitidos.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/create-order">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              <span>Nueva Orden</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center space-x-1.5 text-slate-600"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Centralized Search Bar with Category Combobox */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-2xl">
              <select
                value={searchCriteria}
                onChange={(e) => setSearchCriteria(e.target.value as 'all' | 'invoiceNumber' | 'customer')}
                className="text-xs h-10 rounded-lg border border-slate-300 bg-white px-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
              >
                <option value="all">🔍 Todos</option>
                <option value="invoiceNumber">🧾 N° Factura</option>
                <option value="customer">👤 Cliente</option>
              </select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={getPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8 h-10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-500 hover:text-slate-800 self-start sm:self-center"
              >
                Limpiar Búsqueda
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>Error al consultar el historial de facturas. Por favor intente nuevamente.</span>
        </div>
      )}

      {/* Invoices List Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Comprobantes Emitidos ({invoices.length})</span>
          </CardTitle>
          {isFetching && (
            <span className="text-xs text-slate-400 font-medium animate-pulse">
              Sincronizando...
            </span>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <RefreshCw className="h-8 w-8 mx-auto text-slate-400 animate-spin" />
              <p>Cargando facturas...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Receipt className="h-10 w-10 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No se encontraron facturas registradas</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchTerm
                  ? 'No hay comprobantes que coincidan con los criterios de búsqueda aplicados.'
                  : 'Las órdenes de venta confirmadas se reflejarán automáticamente en esta vista.'}
              </p>
              <Link to="/create-order">
                <Button size="sm" variant="outline" className="mt-2 text-blue-700 border-blue-200">
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  <span>Emitir Primera Orden</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 whitespace-nowrap">N° Factura</TableHead>
                    <TableHead className="w-32 whitespace-nowrap">Fecha Emisión</TableHead>
                    <TableHead className="min-w-[180px]">Cliente / Razón Social</TableHead>
                    <TableHead className="w-36 whitespace-nowrap">Doc. Tributario / ID</TableHead>
                    <TableHead className="w-32 whitespace-nowrap">Vendedor</TableHead>
                    <TableHead className="text-right w-20 whitespace-nowrap">Subtotal</TableHead>
                    <TableHead className="text-right w-20 whitespace-nowrap">IVA (15%)</TableHead>
                    <TableHead className="text-right w-24 whitespace-nowrap">Total</TableHead>
                    <TableHead className="text-center w-28 whitespace-nowrap">Comprobante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-bold text-blue-700">
                        {inv.invoiceNumber || `FAC-${inv.id}`}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(inv.createdDate)}</span>
                        </div>
                      </TableCell>
                      {/* Columna 1: Nombre / Razón Social con ancho amplio */}
                      <TableCell className="font-medium text-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[240px]" title={inv.customerFullName || inv.customerId}>
                            {inv.customerFullName || inv.customerId}
                          </span>
                        </div>
                      </TableCell>
                      {/* Columna 2: Identificación Tributaria y Código ID */}
                      <TableCell>
                        <div className="flex flex-col space-y-0.5">
                          <span className="font-mono text-xs text-slate-700 font-medium">
                            {inv.customerDocument || 'S/D'}
                          </span>
                          {inv.customerId && (
                            <span className="font-mono text-[11px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                              ID: {inv.customerId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {/* Vendedor */}
                      <TableCell>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]">{inv.sellerName || 'Ventas NW'}</span>
                        </div>
                      </TableCell>
                      {/* Subtotal */}
                      <TableCell className="text-right font-mono text-xs text-slate-700">
                        {formatCurrency(inv.subTotal)}
                      </TableCell>
                      {/* IVA */}
                      <TableCell className="text-right font-mono text-xs text-slate-700">
                        {formatCurrency(inv.tax)}
                      </TableCell>
                      {/* Total */}
                      <TableCell className="text-right font-mono text-sm font-bold text-emerald-700">
                        {formatCurrency(inv.total)}
                      </TableCell>
                      {/* Acción */}
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenVoucher(inv)}
                          className="h-8 px-2.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center space-x-1.5 mx-auto"
                          title="Ver comprobante e imprimir"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ver</span>
                          <Printer className="h-3.5 w-3.5 ml-0.5 text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Official Voucher Preview & Print Modal */}
      <Dialog
        open={isVoucherModalOpen}
        onOpenChange={setIsVoucherModalOpen}
        title="Comprobante de Factura Electrónica"
        description="Vista oficial y opción de impresión limpia del comprobante emitido."
        className="max-w-4xl"
      >
        {selectedInvoice && (
          <InvoiceVoucher
            invoice={selectedInvoice}
            showPrintButton={true}
          />
        )}
      </Dialog>
    </div>
  );
};
