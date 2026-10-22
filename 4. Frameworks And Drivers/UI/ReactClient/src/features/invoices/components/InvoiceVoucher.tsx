import React from 'react';
import {
  Printer,
  CheckCircle2,
  Building2,
  User,
  Calendar,
  Hash,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { InvoiceResponseDto } from '../types';
import { Button } from '@/shared/ui/Button';

export interface InvoiceVoucherProps {
  invoice: InvoiceResponseDto;
  onClose?: () => void;
  showPrintButton?: boolean;
}

export const InvoiceVoucher: React.FC<InvoiceVoucherProps> = ({
  invoice,
  onClose,
  showPrintButton = true,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat('es-EC', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Action toolbar (Hidden in print) */}
      <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-emerald-600 font-medium">
          <CheckCircle2 className="h-5 w-5" />
          <span>Comprobante de Venta (Simulación Didáctica)</span>
        </div>
        <div className="flex items-center space-x-2">
          {showPrintButton && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir Comprobante</span>
            </Button>
          )}
          {onClose && (
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        className="bg-white rounded-lg border border-slate-200 p-6 text-slate-800 shadow-sm"
      >
        {/* Header: Company & Invoice Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="bg-sky-600 text-white p-2 rounded font-bold text-base">
                NW
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                NORTHWIND <span className="text-sky-600 font-semibold">SALES</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              R.U.C.: 1790012345001 &bull; Matriz: Av. Amazonas y República, Quito - Ecuador
            </p>
            <p className="text-xs text-slate-400">
              Ambiente de Simulación Académica &bull; Sin Efectos Tributarios
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded border sm:border-0 border-slate-200 w-full sm:w-auto">
            <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-amber-100 text-amber-900 mb-1">
              Comprobante de Simulación
            </span>
            <div className="flex items-center sm:justify-end space-x-1.5 text-slate-900 font-mono text-base font-bold">
              <Hash className="h-4 w-4 text-slate-400" />
              <span>{invoice.invoiceNumber || `FAC-${invoice.id}`}</span>
            </div>
            <div className="flex items-center sm:justify-end space-x-1.5 text-xs text-slate-500 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDate(invoice.createdDate)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Transaction Info (Historical Snapshot) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-sm">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Datos del Cliente (Instantánea Histórica)
            </div>
            <div className="flex items-center space-x-2 text-slate-900 font-semibold">
              <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{invoice.customerFullName || invoice.customerId}</span>
            </div>
            {invoice.customerId && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Código Interno: </span>
                <span className="font-mono font-bold text-sky-800">{invoice.customerId}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-slate-600 text-xs">
              <span className="font-semibold text-slate-700">RUC/Cédula:</span>
              <span className="font-mono">{invoice.customerDocument || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600 text-xs">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{invoice.customerAddress || 'Dirección no especificada'}</span>
            </div>
            {invoice.customerEmail && (
              <div className="flex items-center space-x-2 text-slate-600 text-xs">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{invoice.customerEmail}</span>
              </div>
            )}
            {invoice.customerPhone && (
              <div className="flex items-center space-x-2 text-slate-600 text-xs">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{invoice.customerPhone}</span>
              </div>
            )}
          </div>

          <div className="space-y-1 md:pl-6 md:border-l md:border-slate-200">
            <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Detalles de la Operación
            </div>
            <div className="flex items-center space-x-2 text-slate-700 text-xs">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Vendedor:</span>
              <span>{invoice.sellerName || 'Ventas NorthWind'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 text-xs">
              <span className="font-semibold text-slate-700">Forma de Pago:</span>
              <span>Contado / Transferencia Inmediata</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 text-xs">
              <span className="font-semibold text-slate-700">Moneda:</span>
              <span>Dólares de los Estados Unidos de América (USD)</span>
            </div>
          </div>
        </div>

        {/* Invoice Items Table with Snapshot Legend */}
        <div className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Descripción (Snapshot Congelado)</th>
                  <th className="py-2 px-3 text-center">Cant.</th>
                  <th className="py-2 px-3 text-right">Precio Unitario</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.details && invoice.details.length > 0 ? (
                  invoice.details.map((item, index) => (
                    <tr key={`${item.productId}-${index}`} className="print-break-inside-avoid">
                      <td className="py-1.5 px-3 text-slate-400 text-xs font-mono">{index + 1}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-800">
                        {item.productName || `Producto #${item.productId}`}
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-1.5 px-3 text-right font-mono">
                        ${Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold text-slate-900">
                        ${Number(item.subTotal).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No se encontraron detalles para este comprobante.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-3 border-t-2 border-slate-200 gap-4 print-break-inside-avoid">
          {/* Legal Historical Snapshot Pattern Alert */}
          <div className="max-w-md space-y-1.5">
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-slate-700 flex items-start space-x-2.5">
              <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-sky-900 block font-semibold">Registro de Integridad Histórica (Patrón Snapshot):</strong>
                <span>
                  Este comprobante utiliza datos congelados en el momento exacto de su emisión. Cualquier modificación futura en los catálogos maestros de clientes o productos no alterará el contenido histórico de este documento.
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Documento generado exclusivamente con fines académicos para la asignatura de Patrones de Diseño de Software (PDS). No tiene validez fiscal ni tributaria.
            </p>
          </div>

          <div className="w-full sm:w-60 space-y-1.5 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">${Number(invoice.subTotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-xs">
              <span>IVA (Tarifa 15%):</span>
              <span className="font-mono font-medium">${Number(invoice.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-300">
              <span>TOTAL USD:</span>
              <span className="font-mono text-emerald-700">${Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note: Sin alusiones de validez fiscal */}
        <div className="mt-6 pt-3 border-t border-dashed border-slate-200 text-center text-xs text-slate-400">
          *** Documento de Simulación Académica - NorthWind Sales (Sin Validez Tributaria) ***
        </div>
      </div>
    </div>
  );
};
