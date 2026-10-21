import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Building2,
  UserCheck,
  Send,
  Loader2,
  Mail,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { CustomerDto } from '@/features/customers/types';
import { ProductDto } from '@/features/products/types';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { CartItem, CreateOrderDto } from '../types';
import { ProductSelectorModal } from '../components/ProductSelectorModal';
import { CustomerSelectorModal } from '../components/CustomerSelectorModal';
import { InvoiceVoucher } from '@/features/invoices/components/InvoiceVoucher';
import { InvoiceResponseDto } from '@/features/invoices/types';
import { validateEcuadorianId, validateRuc } from '@/core/validators/ecuadorianIdValidator';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Badge } from '@/shared/ui/Badge';
import { Dialog } from '@/shared/ui/Dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/Table';
import { getErrorMessage } from '@/core/api/apiClient';
import {
  allowOnlyLettersAndSpaces,
  allowOnlyAlpha,
  allowOnlyDigits,
  allowAddressChars,
  sanitizeLettersAndSpaces,
  sanitizeAlpha,
  sanitizeDigits,
  sanitizeAddress,
} from '@/core/utils/inputFilters';

export const CreateOrderPage: React.FC = () => {
  // Query customers
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const createOrderMutation = useCreateOrder();

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [customerDocument, setCustomerDocument] = useState<string>('');
  const [shipAddress, setShipAddress] = useState<string>('');
  const [shipCity, setShipCity] = useState<string>('Quito');
  const [shipCountry, setShipCountry] = useState<string>('Ecuador');
  const [shipPostalCode, setShipPostalCode] = useState<string>('170150');

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);

  // Success Voucher Modal State
  const [voucherModalOpen, setVoucherModalOpen] = useState<boolean>(false);
  const [issuedInvoice, setIssuedInvoice] = useState<InvoiceResponseDto | null>(null);

  // Submission error
  const [formError, setFormError] = useState<string | null>(null);

  // Selected customer object
  const selectedCustomer: CustomerDto | undefined = useMemo(() => {
    if (!selectedCustomerId) return undefined;
    return customers.find((c) => c.id.toUpperCase() === selectedCustomerId.toUpperCase());
  }, [customers, selectedCustomerId]);

  // Credit policy validation
  const hasPendingBalance = (selectedCustomer?.currentBalance ?? 0) > 0;

  // Document validation with ecuadorianIdValidator
  const documentValidation = useMemo(() => {
    const cleanDoc = customerDocument.trim();
    if (!cleanDoc) {
      return { isValid: false, message: 'Ingrese la cédula o RUC del cliente.' };
    }

    if (cleanDoc.length !== 10 && cleanDoc.length !== 13) {
      return {
        isValid: false,
        message: 'El documento debe contener 10 dígitos (Cédula) o 13 dígitos (RUC).',
      };
    }

    // Special company rule: Empresa requires 13-digit RUC
    if (selectedCustomer?.customerType === 'Empresa') {
      if (cleanDoc.length === 10) {
        return {
          isValid: false,
          message: 'El cliente está registrado como Empresa y requiere obligatoriamente un RUC de 13 dígitos.',
        };
      }
      const rucResult = validateRuc(cleanDoc);
      return {
        isValid: rucResult.isValid,
        message: rucResult.isValid ? 'RUC de Empresa Válido' : (rucResult.error || 'RUC inválido'),
      };
    }

    const res = validateEcuadorianId(cleanDoc);
    return {
      isValid: res.isValid,
      message: res.isValid
        ? cleanDoc.length === 10
          ? 'Cédula Ecuatoriana Válida'
          : 'RUC Ecuatoriano Válido'
        : (res.error || 'Identificación inválida'),
    };
  }, [customerDocument, selectedCustomer]);

  // Financial calculations (Subtotal, 15% IVA, Total)
  const financialTotals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.subTotal, 0);
    const subtotalRounded = Math.round(subtotal * 100) / 100;
    const tax = Math.round(subtotalRounded * 0.15 * 100) / 100;
    const total = Math.round((subtotalRounded + tax) * 100) / 100;

    return {
      subtotal: subtotalRounded,
      tax,
      total,
    };
  }, [cartItems]);

  // Handler for customer selection
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value.toUpperCase();
    setSelectedCustomerId(id);
    setFormError(null);
  };

  // Handler for customer ID input (letters only, uppercase forced, max 5)
  const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const alphaOnly = sanitizeAlpha(e.target.value).slice(0, 5).toUpperCase();
    setSelectedCustomerId(alphaOnly);
    setFormError(null);
  };

  // Handler for selecting customer from CustomerSelectorModal
  const handleSelectCustomer = (customer: CustomerDto) => {
    setSelectedCustomerId(customer.id.toUpperCase());
    setFormError(null);
  };

  // Sanitized document change (digits only, max 13)
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = sanitizeDigits(e.target.value).slice(0, 13);
    setCustomerDocument(digitsOnly);
    setFormError(null);
  };

  // Cart operations
  const handleAddProduct = (product: ProductDto) => {
    if (cartItems.some((item) => item.productId === product.id)) {
      return;
    }

    const newItem: CartItem = {
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      unitsInStock: product.unitsInStock,
      quantity: 1,
      subTotal: product.unitPrice,
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  const handleUpdateQuantity = (productId: number, rawValue: string) => {
    // Only whole numbers
    const cleanValue = rawValue.replace(/\D/g, '');
    let qty = parseInt(cleanValue, 10);

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (isNaN(qty) || qty < 1) qty = 1;
          if (qty > item.unitsInStock) qty = item.unitsInStock;

          return {
            ...item,
            quantity: qty,
            subTotal: Math.round(item.unitPrice * qty * 100) / 100,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Reset form
  const handleResetForm = () => {
    setSelectedCustomerId('');
    setCustomerDocument('');
    setShipAddress('');
    setShipCity('Quito');
    setShipCountry('Ecuador');
    setShipPostalCode('170150');
    setCartItems([]);
    setFormError(null);
  };

  // Form submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError('Por favor seleccione o ingrese un cliente de la lista.');
      return;
    }

    if (!selectedCustomer) {
      setFormError(`El cliente con ID "${selectedCustomerId}" no existe en la lista de clientes registrados.`);
      return;
    }

    if (hasPendingBalance) {
      setFormError('No se puede emitir la orden: el cliente mantiene saldo pendiente de pago.');
      return;
    }

    if (!documentValidation.isValid) {
      setFormError(`Documento tributario inválido: ${documentValidation.message}`);
      return;
    }

    if (!shipAddress.trim()) {
      setFormError('La dirección de envío es obligatoria (máximo 60 caracteres).');
      return;
    }

    if (shipAddress.trim().length > 60) {
      setFormError('La dirección de envío no puede exceder 60 caracteres.');
      return;
    }

    if (!shipCity.trim() || shipCity.trim().length < 3 || shipCity.trim().length > 15) {
      setFormError('La ciudad de destino debe tener entre 3 y 15 caracteres.');
      return;
    }

    if (!shipCountry.trim() || shipCountry.trim().length < 3 || shipCountry.trim().length > 15) {
      setFormError('El país de destino debe tener entre 3 y 15 caracteres.');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('La orden debe contener al menos un producto en el carrito.');
      return;
    }

    // Verify stock constraints on all items
    for (const item of cartItems) {
      if (item.quantity <= 0) {
        setFormError(`La cantidad para ${item.productName} debe ser mayor a cero.`);
        return;
      }
      if (item.quantity > item.unitsInStock) {
        setFormError(`La cantidad solicitada para ${item.productName} (${item.quantity}) excede el stock disponible (${item.unitsInStock}).`);
        return;
      }
    }

    const payload: CreateOrderDto = {
      customerId: selectedCustomerId,
      customerDocument: customerDocument.trim(),
      shipAddress: shipAddress.trim(),
      shipCity: shipCity.trim(),
      shipCountry: shipCountry.trim(),
      shipPostalCode: shipPostalCode.trim() || undefined,
      orderDetails: cartItems.map((item) => ({
        productId: item.productId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
    };

    try {
      const result = await createOrderMutation.mutateAsync(payload);
      // Clean form on success
      handleResetForm();

      // Show official voucher modal immediately
      if (result.invoice) {
        setIssuedInvoice(result.invoice);
      } else {
        // Fallback reconstructed invoice if backend returned minimal invoice
        setIssuedInvoice({
          id: result.orderId,
          invoiceNumber: result.invoiceNumber || `FAC-${result.orderId}`,
          customerId: selectedCustomerId,
          customerFullName: selectedCustomer?.name || selectedCustomerId,
          customerDocument: payload.customerDocument,
          customerAddress: payload.shipAddress,
          customerPhone: '',
          customerEmail: '',
          sellerName: 'Ventas NorthWind',
          subTotal: financialTotals.subtotal,
          tax: financialTotals.tax,
          total: financialTotals.total,
          createdDate: new Date().toISOString(),
          details: cartItems.map((c) => ({
            productId: c.productId,
            productName: c.productName,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            subTotal: c.subTotal,
          })),
        });
      }

      setVoucherModalOpen(true);
    } catch (err) {
      setFormError(getErrorMessage(err, 'No fue posible registrar la orden de venta.'));
    }
  };

  const isSubmitDisabled =
    createOrderMutation.isPending ||
    !selectedCustomerId ||
    hasPendingBalance ||
    !documentValidation.isValid ||
    cartItems.length === 0 ||
    !shipAddress.trim();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-sky-600" />
            <span>Nueva Orden de Venta</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro de pedido con facturación electrónica y verificación automática de políticas de crédito.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetForm}
          className="self-start sm:self-auto text-slate-600 flex items-center space-x-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Limpiar Formulario</span>
        </Button>
      </div>

      {/* Global Form Error Message */}
      {formError && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 text-sm animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium whitespace-pre-line">{formError}</div>
        </div>
      )}

      {/* Strict Credit Policy Alert Banner */}
      {selectedCustomer && hasPendingBalance && (
        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-400 text-red-900 shadow-sm flex items-start space-x-3.5 animate-in fade-in">
          <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-800 text-base">
              Bloqueo por Política de Crédito Estricta
            </h4>
            <p className="text-sm font-medium text-red-700 leading-relaxed">
              Cliente con saldo pendiente (<span className="font-bold font-mono text-red-900">${selectedCustomer.currentBalance.toFixed(2)}</span>).
              Las políticas de crédito exigen saldo <span className="font-bold font-mono">$0.00</span> para autorizar una nueva orden de venta.
            </p>
            <p className="text-xs text-red-600">
              El botón de emisión de la orden permanece inhabilitado hasta que el cliente regularice sus obligaciones financieras.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-6">
        {/* Section 1: Customer Selection & Fiscal Identification */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-sky-600" />
              <span>1. Datos del Cliente e Identificación Fiscal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer ID input (ALFKI) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  ID Cliente <span className="text-rose-500">*</span> (5 letras)
                </label>
                <div className="flex gap-2">
                  <Input
                    id="customerId"
                    type="text"
                    placeholder="Ej. ALFKI"
                    value={selectedCustomerId}
                    onChange={handleCustomerIdChange}
                    onKeyDown={allowOnlyAlpha}
                    maxLength={5}
                    className="font-mono uppercase tracking-wider"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomerModal(true)}
                    className="whitespace-nowrap flex items-center shrink-0 border-slate-300 hover:bg-slate-50"
                  >
                    <Users className="w-4 h-4 mr-1.5 text-sky-600" />
                    Buscar Cliente
                  </Button>
                </div>
              </div>

              {/* Customer Selector Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Seleccionar Cliente <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={handleCustomerChange}
                  disabled={isLoadingCustomers}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 h-10"
                >
                  <option value="">-- Seleccione un cliente --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - {c.customerType} [Saldo: ${Number(c.currentBalance).toFixed(2)}]
                    </option>
                  ))}
                </select>
                {isLoadingCustomers && (
                  <p className="text-xs text-slate-500 mt-1">Cargando lista de clientes...</p>
                )}
              </div>

              {/* Customer Document (Cedula / RUC) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Cédula / RUC (Ecuador) <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="customerDocument"
                  type="text"
                  placeholder="Ej. 1790012345001 o 1710000000"
                  value={customerDocument}
                  onChange={handleDocumentChange}
                  onKeyDown={allowOnlyDigits}
                  maxLength={13}
                  className={`font-mono ${
                    customerDocument
                      ? documentValidation.isValid
                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
                        : 'border-rose-400 focus:border-rose-400 focus:ring-rose-400'
                      : ''
                  }`}
                  required
                />
                {customerDocument && (
                  <div className="mt-1 flex items-center space-x-1.5 text-xs">
                    {documentValidation.isValid ? (
                      <span className="text-emerald-700 font-medium flex items-center space-x-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{documentValidation.message}</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{documentValidation.message}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Customer Information Badge Box */}
            {selectedCustomer && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Razón Social / Nombre:</span>
                  <span className="font-semibold text-slate-800 text-sm">{selectedCustomer.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Tipo de Cliente:</span>
                  <div className="mt-0.5">
                    {selectedCustomer.customerType === 'Empresa' ? (
                      <Badge variant="info" className="flex items-center w-fit space-x-1">
                        <Building2 className="h-3 w-3" />
                        <span>Empresa (RUC Obligatorio)</span>
                      </Badge>
                    ) : (
                      <Badge variant="default" className="w-fit">Persona Natural</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Saldo en Cuenta:</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      hasPendingBalance ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    ${Number(selectedCustomer.currentBalance).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Shipping Destination */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-sky-600" />
              <span>2. Datos de Envío y Destino</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Dirección de Entrega <span className="text-rose-500">*</span> (máx 60 caracteres)
                </label>
                <Input
                  id="shipAddress"
                  type="text"
                  placeholder="Ej. Av. 10 de Agosto N24-123 y Colón"
                  value={shipAddress}
                  onChange={(e) => setShipAddress(sanitizeAddress(e.target.value).slice(0, 60))}
                  onKeyDown={allowAddressChars}
                  maxLength={60}
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {shipAddress.length}/60 caracteres
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Ciudad <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="shipCity"
                  type="text"
                  placeholder="Ej. Quito"
                  value={shipCity}
                  onChange={(e) => setShipCity(sanitizeLettersAndSpaces(e.target.value).slice(0, 15))}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  maxLength={15}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  País <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="shipCountry"
                  type="text"
                  placeholder="Ecuador"
                  value={shipCountry}
                  onChange={(e) => setShipCountry(sanitizeLettersAndSpaces(e.target.value).slice(0, 15))}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  maxLength={15}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Código Postal
                </label>
                <Input
                  id="shipPostalCode"
                  type="text"
                  placeholder="Ej. 170150"
                  value={shipPostalCode}
                  onChange={(e) => setShipPostalCode(sanitizeDigits(e.target.value).slice(0, 10))}
                  onKeyDown={allowOnlyDigits}
                  maxLength={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Cart / Order Details */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-sky-600" />
              <span>3. Detalle de Productos (Carrito de Compra)</span>
            </CardTitle>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsCatalogOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Producto</span>
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Mailtrap Notification Badge Alert if cartItems.length > 3 */}
            {cartItems.length > 3 && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-3 text-xs sm:text-sm animate-in fade-in">
                <Mail className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold">📧 Orden Especial:</span> Al contener más de 3 productos,
                  el servidor despachará una notificación automática al administrador vía{' '}
                  <span className="font-semibold text-amber-800">Mailtrap</span> tras registrarse.
                </div>
              </div>
            )}

            {/* Cart Table */}
            {cartItems.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                <ShoppingCart className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-600">El carrito de productos está vacío</p>
                <p className="text-xs text-slate-400 mt-1">
                  Haga clic en &quot;Agregar Producto&quot; para seleccionar artículos disponibles del catálogo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Precio Unitario ($)</TableHead>
                      <TableHead className="text-center">Stock Disp.</TableHead>
                      <TableHead className="text-center w-28">Cantidad</TableHead>
                      <TableHead className="text-right">Subtotal ($)</TableHead>
                      <TableHead className="text-center w-16">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div className="font-medium text-slate-800">{item.productName}</div>
                          <div className="text-xs font-mono text-slate-400">ID #{item.productId}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-700">
                          ${Number(item.unitPrice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.unitsInStock <= 5 ? 'warning' : 'default'}>
                            {item.unitsInStock} unid.
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="number"
                            min="1"
                            max={item.unitsInStock}
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.productId, e.target.value)}
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-center font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-slate-900">
                          ${Number(item.subTotal).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Eliminar de la orden"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Financial Summary & Emit Button */}
            <div className="flex flex-col sm:flex-row justify-between items-end pt-4 border-t border-slate-200 gap-6">
              <div className="text-xs text-slate-500 space-y-1">
                <p>&bull; El IVA aplicado corresponde a la tarifa vigente en Ecuador (15%).</p>
                <p>&bull; Al emitirse, se actualizará automáticamente el inventario de existencias.</p>
              </div>

              <div className="w-full sm:w-72 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal Estimado:</span>
                  <span className="font-mono font-medium">${financialTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>IVA Estimado (15%):</span>
                  <span className="font-mono font-medium">${financialTotals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Estimado:</span>
                  <span className="font-mono text-sky-700 text-base">
                    ${financialTotals.total.toFixed(2)} USD
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Procesando Orden...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Emitir Orden de Venta</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Catalog Selection Modal */}
      <ProductSelectorModal
        open={isCatalogOpen}
        onOpenChange={setIsCatalogOpen}
        selectedProductIds={cartItems.map((item) => item.productId)}
        onSelectProduct={handleAddProduct}
      />

      {/* Customer Selection Modal */}
      <CustomerSelectorModal
        open={showCustomerModal}
        onOpenChange={setShowCustomerModal}
        onSelectCustomer={handleSelectCustomer}
        selectedCustomerId={selectedCustomerId}
      />

      {/* Post-Issuance Official Invoice Voucher Modal */}
      <Dialog
        open={voucherModalOpen}
        onOpenChange={setVoucherModalOpen}
        title="Factura Emitida con Éxito"
        description="Se ha registrado la orden de venta y generado el comprobante electrónico correspondiente."
        className="max-w-4xl"
      >
        {issuedInvoice && (
          <InvoiceVoucher
            invoice={issuedInvoice}
            onClose={() => setVoucherModalOpen(false)}
            showPrintButton={true}
          />
        )}
      </Dialog>
    </div>
  );
};
