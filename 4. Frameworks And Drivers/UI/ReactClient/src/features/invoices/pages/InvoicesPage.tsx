import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  FileText,
  Eye,
  Printer,
  RefreshCw,
  Building2,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { InvoiceResponseDto } from '../types';
import { InvoiceVoucher } from '../components/InvoiceVoucher';
import { useDebounce } from '@/shared/utils/useDebounce';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Dialog } from '@/shared/ui/Dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/Table';

export const InvoicesPage: React.FC = () => {
  const [invoiceNumberQuery, setInvoiceNumberQuery] = useState('');
  const [customerNameQuery, setCustomerNameQuery] = useState('');

  const debouncedInvoiceNumber = useDebounce(invoiceNumberQuery, 350);
  const debouncedCustomerName = useDebounce(customerNameQuery, 350);

  const {
    data: invoices = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useInvoices({
    invoiceNumber: debouncedInvoiceNumber,
    customerName: debouncedCustomerName,
  });

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponseDto | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const handleOpenVoucher = (invoice: InvoiceResponseDto) => {
    setSelectedInvoice(invoice);
    setIsVoucherModalOpen(true);
  };

  const handleClearFilters = () => {
    setInvoiceNumberQuery('');
    setCustomerNameQuery('');
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

  const hasActiveFilters = invoiceNumberQuery.trim() !== '' || customerNameQuery.trim() !== '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <Receipt className="h-6 w-6 text-sky-600" />
            <span>Historial de Facturas y Comprobantes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Consulta, auditoría y reimpresión de comprobantes electrónicos oficiales emitidos.
          </p>
        </div>

        <div className="flex items-center space-x-2">
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

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Número de Factura
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ej. FAC-0001..."
                  value={invoiceNumberQuery}
                  onChange={(e) => setInvoiceNumberQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Nombre del Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ej. Alfreds Futterkiste..."
                  value={customerNameQuery}
                  onChange={(e) => setCustomerNameQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
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
            <FileText className="h-5 w-5 text-sky-600" />
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
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Receipt className="h-10 w-10 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No se encontraron facturas registradas</p>
              <p className="text-xs text-slate-400">
                {hasActiveFilters
                  ? 'No hay comprobantes que coincidan con los criterios de búsqueda aplicados.'
                  : 'Las órdenes de venta confirmadas se reflejarán automáticamente en esta vista.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">N° Factura</TableHead>
                    <TableHead className="w-48">Fecha de Emisión</TableHead>
                    <TableHead>Cliente / Razón Social</TableHead>
                    <TableHead className="w-40">RUC / Cédula</TableHead>
                    <TableHead className="text-right w-36">Total ($)</TableHead>
                    <TableHead className="text-center w-36">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-bold text-sky-700">
                        {inv.invoiceNumber || `FAC-${inv.id}`}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(inv.createdDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{inv.customerFullName || inv.customerId}</span>
                        </div>
                        {inv.sellerName && (
                          <div className="text-[11px] text-slate-400">
                            Vendedor: {inv.sellerName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {inv.customerDocument || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-900">
                        ${Number(inv.total).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenVoucher(inv)}
                          className="h-8 px-2.5 text-xs text-sky-700 border-sky-200 hover:bg-sky-50 flex items-center space-x-1.5 mx-auto"
                          title="Ver detalle de factura e imprimir"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Comprobante</span>
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
            onClose={() => setIsVoucherModalOpen(false)}
            showPrintButton={true}
          />
        )}
      </Dialog>
    </div>
  );
};
