import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Building2,
  UserCheck,
  Send,
  Mail,
  ShieldAlert,
  MapPin,
  RefreshCw,
  UserPlus,
  ArrowLeftRight,
} from 'lucide-react';
import { customersService } from '@/features/customers/customersService';
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
  allowOnlyAlpha,
  allowOnlyLettersAndSpaces,
  allowOnlyDigits,
  allowAddressChars,
  sanitizeAlpha,
  sanitizeLettersAndSpaces,
  sanitizeDigits,
  sanitizeAddress,
} from '@/core/utils/inputFilters';

export const CreateOrderPage: React.FC = () => {
  const createOrderMutation = useCreateOrder();

  // Form State
  const [customerInput, setCustomerInput] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [customerLookupError, setCustomerLookupError] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);

  const [customerDocument, setCustomerDocument] = useState<string>('');
  const [shipAddress, setShipAddress] = useState<string>('');
  const [shipCity, setShipCity] = useState<string>('');
  const [shipCountry, setShipCountry] = useState<string>('');
  const [shipPostalCode, setShipPostalCode] = useState<string>('');

  // Touched state para emular onBlur
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [itemToReplace, setItemToReplace] = useState<CartItem | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Success Voucher Modal State
  const [voucherModalOpen, setVoucherModalOpen] = useState<boolean>(false);
  const [issuedInvoice, setIssuedInvoice] = useState<InvoiceResponseDto | null>(null);

  // Submission error
  const [formError, setFormError] = useState<string | null>(null);

  // Sincronización automática de Cédula/RUC desde la ficha del cliente seleccionado (ReadOnly por integridad fiscal)
  React.useEffect(() => {
    if (selectedCustomer) {
      setCustomerDocument(selectedCustomer.identification || '');
      markTouched('document');
    } else if (!customerInput.trim()) {
      setCustomerDocument('');
    }
  }, [selectedCustomer, customerInput]);

  // Credit policy validation
  const hasPendingBalance = (selectedCustomer?.currentBalance ?? 0) > 0;

  // Validación activa del cliente al tipear o en blur
  const validateCustomerCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setSelectedCustomerId('');
      setSelectedCustomer(null);
      setCustomerDocument('');
      setCustomerLookupError('Debe ingresar o seleccionar un código de cliente (5 letras).');
      return;
    }

    if (cleanCode.length < 5) {
      setSelectedCustomerId('');
      setSelectedCustomer(null);
      setCustomerDocument('');
      setCustomerLookupError('El código de cliente debe contener exactamente 5 letras mayúsculas.');
      return;
    }

    if (selectedCustomer && selectedCustomer.id.toUpperCase() === cleanCode) {
      if (selectedCustomer.currentBalance > 0) {
        setCustomerLookupError(
          `No se puede seleccionar al cliente porque posee un saldo deudor pendiente de $${selectedCustomer.currentBalance.toFixed(
            2
          )}. Clientes con saldo pendiente no están autorizados para emitir órdenes.`
        );
      } else {
        setCustomerLookupError(null);
      }
      return;
    }

    try {
      const found = await customersService.getCustomerById(cleanCode);
      if (!found || !found.id) {
        setSelectedCustomerId('');
        setSelectedCustomer(null);
        setCustomerDocument('');
        setCustomerLookupError(`El cliente con código '${cleanCode}' no existe en la base de datos.`);
        return;
      }

      setSelectedCustomer(found);
      setSelectedCustomerId(found.id);
      setCustomerDocument(found.identification || '');
      markTouched('document');

      if (found.currentBalance > 0) {
        setCustomerLookupError(
          `No se puede seleccionar al cliente porque posee un saldo deudor pendiente de $${found.currentBalance.toFixed(
            2
          )}. Clientes con saldo pendiente no están autorizados para emitir órdenes.`
        );
      } else {
        setCustomerLookupError(null);
      }
    } catch {
      setSelectedCustomerId('');
      setSelectedCustomer(null);
      setCustomerDocument('');
      setCustomerLookupError(`El cliente con código '${cleanCode}' no existe en la base de datos.`);
    }
  };

  // Document validation with EcuadorianValidator
  const documentValidation = useMemo(() => {
    const cleanDoc = customerDocument.trim();
    if (!cleanDoc) {
      return { isValid: false, message: 'Debe ingresar la cédula o RUC del cliente.' };
    }

    if (cleanDoc.length !== 10 && cleanDoc.length !== 13) {
      return {
        isValid: false,
        message: 'El documento debe contener 10 dígitos (Cédula) o 13 dígitos (RUC).',
      };
    }

    // Regla especial: Empresa exige obligatoriamente RUC de 13 dígitos
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

  // Inline validations onBlur
  const errors = useMemo(() => {
    const errs: Record<string, string | null> = {};

    if (touched.customer && !selectedCustomerId && !customerInput.trim()) {
      errs.customer = 'Debe especificar o seleccionar un cliente.';
    }

    if (touched.document && !documentValidation.isValid) {
      errs.document = documentValidation.message;
    }

    if (touched.address) {
      if (!shipAddress.trim()) {
        errs.address = 'Debe proporcionar la dirección de envío.';
      } else if (shipAddress.trim().length > 60) {
        errs.address = 'La longitud máxima de la dirección es 60.';
      }
    }

    if (touched.city) {
      if (!shipCity.trim()) {
        errs.city = 'Debe proporcionar la ciudad de envío.';
      } else if (shipCity.trim().length < 3) {
        errs.city = 'Debe especificar al menos 3 caracteres del nombre de la ciudad.';
      } else if (shipCity.trim().length > 15) {
        errs.city = 'La longitud máxima de la ciudad es 15.';
      }
    }

    if (touched.country) {
      if (!shipCountry.trim()) {
        errs.country = 'Debe proporcionar el país de envío.';
      } else if (shipCountry.trim().length < 3) {
        errs.country = 'Debe especificar al menos 3 caracteres del nombre del país.';
      } else if (shipCountry.trim().length > 15) {
        errs.country = 'La longitud máxima del país es 15.';
      }
    }

    return errs;
  }, [touched, selectedCustomerId, customerInput, documentValidation, shipAddress, shipCity, shipCountry]);

  // Financial calculations
  const financialTotals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.subTotal, 0);
    const totalUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotalRounded = Math.round(subtotal * 100) / 100;
    const tax = Math.round(subtotalRounded * 0.15 * 100) / 100;
    const total = Math.round((subtotalRounded + tax) * 100) / 100;

    return {
      subtotal: subtotalRounded,
      tax,
      total,
      totalUnits,
    };
  }, [cartItems]);

  // Handler for selecting customer from CustomerSelectorModal
  const handleSelectCustomerFromModal = (customer: CustomerDto) => {
    setSelectedCustomer(customer);
    setCustomerInput(customer.id.toUpperCase());
    setSelectedCustomerId(customer.id.toUpperCase());
    setCustomerDocument(customer.identification || '');
    if (customer.currentBalance > 0) {
      setCustomerLookupError(
        `No se puede seleccionar al cliente porque posee un saldo deudor pendiente de $${customer.currentBalance.toFixed(
          2
        )}. Clientes con saldo pendiente no están autorizados para emitir órdenes.`
      );
    } else {
      setCustomerLookupError(null);
    }
    markTouched('customer');
    markTouched('document');
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

  const handleStartReplace = (item: CartItem) => {
    setItemToReplace(item);
    setIsCatalogOpen(true);
  };

  const handleSelectOrReplaceProduct = (product: ProductDto) => {
    if (itemToReplace) {
      const targetId = itemToReplace.productId;
      const newProductId = product.id;

      // Si selecciona un producto que YA estaba en la lista de la orden
      const alreadyInCart = cartItems.find((i) => i.productId === newProductId);

      if (alreadyInCart) {
        // Remueve el producto anterior y simplemente aumenta en 1 la cantidad del existente
        setCartItems((prev) =>
          prev
            .filter((i) => i.productId !== targetId)
            .map((i) => {
              if (i.productId === newProductId) {
                const newQty = i.quantity + 1;
                return {
                  ...i,
                  quantity: newQty,
                  subTotal: Math.round(i.unitPrice * newQty * 100) / 100,
                };
              }
              return i;
            })
        );
      } else {
        // Reemplaza el ítem en la lista por el nuevo producto
        setCartItems((prev) =>
          prev.map((i) => {
            if (i.productId === targetId) {
              return {
                productId: product.id,
                productName: product.name,
                unitPrice: product.unitPrice,
                unitsInStock: product.unitsInStock,
                quantity: 1,
                subTotal: product.unitPrice,
              };
            }
            return i;
          })
        );
      }

      setItemToReplace(null);
      setIsCatalogOpen(false);
      return;
    }

    // Modo normal: agregar
    handleAddProduct(product);
  };

  const handleUpdateQuantity = (productId: number, newQtyNumber: number) => {
    let qty = isNaN(newQtyNumber) ? 1 : newQtyNumber;
    if (qty < 1) qty = 1;

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
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

  const handleIncrementQuantity = (productId: number) => {
    const current = cartItems.find((i) => i.productId === productId);
    if (!current) return;
    handleUpdateQuantity(productId, current.quantity + 1);
  };

  const handleDecrementQuantity = (productId: number) => {
    const current = cartItems.find((i) => i.productId === productId);
    if (!current || current.quantity <= 1) return;
    handleUpdateQuantity(productId, current.quantity - 1);
  };

  const confirmRemoveItem = () => {
    if (itemToDelete) {
      setCartItems((prev) => prev.filter((item) => item.productId !== itemToDelete.productId));
      setItemToDelete(null);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setSelectedCustomer(null);
    setCustomerInput('');
    setSelectedCustomerId('');
    setCustomerLookupError(null);
    setCustomerDocument('');
    setShipAddress('');
    setShipCity('');
    setShipCountry('');
    setShipPostalCode('');
    setCartItems([]);
    setItemToReplace(null);
    setTouched({});
    setFormError(null);
  };

  // Form submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    setTouched({
      customer: true,
      document: true,
      address: true,
      city: true,
      country: true,
    });

    await validateCustomerCode(customerInput);

    if (!selectedCustomerId) {
      setFormError('Por favor seleccione o ingrese un código de cliente válido (5 letras).');
      return;
    }

    if (!selectedCustomer) {
      setFormError(`El cliente seleccionado ("${selectedCustomerId}") no existe en la base de datos.`);
      return;
    }

    if (hasPendingBalance || customerLookupError) {
      setFormError(
        customerLookupError ||
          'No se puede emitir la orden: el cliente seleccionado mantiene saldo pendiente de pago.'
      );
      return;
    }

    if (!documentValidation.isValid) {
      setFormError(`Documento tributario inválido: ${documentValidation.message}`);
      return;
    }

    if (!shipAddress.trim() || shipAddress.trim().length > 60) {
      setFormError('La dirección de envío es obligatoria (máximo 60 caracteres).');
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
        setFormError(
          `La cantidad solicitada para ${item.productName} (${item.quantity}) excede el stock disponible (${item.unitsInStock}).`
        );
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
      handleResetForm();

      if (result.invoice) {
        setIssuedInvoice(result.invoice);
      } else {
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

  const hasAnyStockExcess = cartItems.some((item) => item.quantity > item.unitsInStock);

  const isSubmitDisabled =
    createOrderMutation.isPending ||
    !selectedCustomerId ||
    hasPendingBalance ||
    Boolean(customerLookupError) ||
    !documentValidation.isValid ||
    cartItems.length === 0 ||
    hasAnyStockExcess ||
    !shipAddress.trim() ||
    !shipCity.trim() ||
    !shipCountry.trim();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <span>Crear Orden de Compra</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro comercial de órdenes y facturación electrónica con validación ecuatoriana en tiempo real.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
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
        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-400 text-red-900 shadow-xs flex items-start space-x-3.5 animate-in fade-in">
          <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-800 text-base">
              Bloqueo por Política de Crédito
            </h4>
            <p className="text-sm font-medium text-red-700 leading-relaxed">
              No se puede seleccionar al cliente porque posee un saldo deudor pendiente de{' '}
              <span className="font-bold font-mono text-red-900">
                ${selectedCustomer.currentBalance.toFixed(2)}
              </span>
              . Clientes con saldo pendiente no están autorizados para emitir órdenes.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-6" noValidate>
        {/* Section 1: Customer Selection & Fiscal Identification */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <span>1. Información del Cliente y Envío</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Selector: Editable 5 letters with validation + Search Button */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Cliente (5 letras mayúsculas) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    id="customerId"
                    type="text"
                    placeholder="Ej. ALFKI"
                    maxLength={5}
                    value={customerInput}
                    onKeyDown={allowOnlyAlpha}
                    onChange={(e) => {
                      const clean = sanitizeAlpha(e.target.value, true).slice(0, 5);
                      setCustomerInput(clean);
                      if (clean.length === 5) {
                        validateCustomerCode(clean);
                      } else {
                        setSelectedCustomerId('');
                        setSelectedCustomer(null);
                        setCustomerDocument('');
                        setCustomerLookupError(null);
                      }
                      setFormError(null);
                    }}
                    onBlur={() => {
                      markTouched('customer');
                      validateCustomerCode(customerInput);
                    }}
                    className="font-mono uppercase tracking-wider font-semibold"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomerModal(true)}
                    className="whitespace-nowrap flex items-center shrink-0 border-slate-300 hover:bg-slate-50"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5 text-blue-600" />
                    Agregar cliente
                  </Button>
                </div>

                {customerLookupError && (
                  <p className="text-xs text-rose-600 mt-1 flex items-start gap-1 leading-snug">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{customerLookupError}</span>
                  </p>
                )}
                {!customerLookupError && errors.customer && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.customer}
                  </p>
                )}
              </div>

              {/* Customer Document (Cedula / RUC) - ReadOnly vinculado a la ficha del cliente */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Cédula / RUC (Ecuador) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Solo lectura (Ficha cliente)</span>
                </div>
                <Input
                  id="customerDocument"
                  type="text"
                  placeholder={
                    selectedCustomer
                      ? 'Sin identificación registrada'
                      : 'Se cargará automáticamente al seleccionar cliente'
                  }
                  value={customerDocument}
                  readOnly
                  tabIndex={-1}
                  className={`font-mono bg-slate-100 text-slate-700 cursor-not-allowed border-slate-300 select-none ${
                    selectedCustomer && !customerDocument
                      ? 'border-rose-400'
                      : customerDocument && documentValidation.isValid
                      ? 'border-emerald-500 text-slate-800 font-bold'
                      : ''
                  }`}
                  required
                />
                {customerDocument ? (
                  <div className="mt-1 flex items-center space-x-1.5 text-xs">
                    {documentValidation.isValid ? (
                      <span className="text-emerald-700 font-medium flex items-center space-x-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{documentValidation.message} (Verificada en BD)</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{documentValidation.message}</span>
                      </span>
                    )}
                  </div>
                ) : selectedCustomer ? (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    El cliente seleccionado no posee cédula o RUC registrado en la base de datos.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">
                    La identificación fiscal se vinculará automáticamente al seleccionar el cliente.
                  </p>
                )}
              </div>
            </div>

            {/* Selected Customer Information Box */}
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
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Datos de Envío y Destino</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Dirección de Envío <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {shipAddress.length}/60
                  </span>
                </div>
                <Input
                  id="shipAddress"
                  type="text"
                  placeholder="Ej. Av. 10 de Agosto N24-123 y Colón"
                  value={shipAddress}
                  onChange={(e) => setShipAddress(sanitizeAddress(e.target.value).slice(0, 60))}
                  onBlur={() => markTouched('address')}
                  onKeyDown={allowAddressChars}
                  maxLength={60}
                  className={errors.address ? 'border-rose-400 focus:border-rose-400' : ''}
                  required
                />
                {errors.address && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.address}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Ciudad <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {shipCity.length}/15
                  </span>
                </div>
                <Input
                  id="shipCity"
                  type="text"
                  placeholder="Ej. Quito"
                  value={shipCity}
                  onChange={(e) => setShipCity(sanitizeLettersAndSpaces(e.target.value).slice(0, 15))}
                  onBlur={() => markTouched('city')}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  maxLength={15}
                  className={errors.city ? 'border-rose-400 focus:border-rose-400' : ''}
                  required
                />
                {errors.city && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    País <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {shipCountry.length}/15
                  </span>
                </div>
                <Input
                  id="shipCountry"
                  type="text"
                  placeholder="Ej. Ecuador"
                  value={shipCountry}
                  onChange={(e) => setShipCountry(sanitizeLettersAndSpaces(e.target.value).slice(0, 15))}
                  onBlur={() => markTouched('country')}
                  onKeyDown={allowOnlyLettersAndSpaces}
                  maxLength={15}
                  className={errors.country ? 'border-rose-400 focus:border-rose-400' : ''}
                  required
                />
                {errors.country && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.country}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Código Postal
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {shipPostalCode.length}/6
                  </span>
                </div>
                <Input
                  id="shipPostalCode"
                  type="text"
                  placeholder="Ej. 170150"
                  value={shipPostalCode}
                  onChange={(e) =>
                    setShipPostalCode(sanitizeDigits(e.target.value).slice(0, 6))
                  }
                  onKeyDown={allowOnlyDigits}
                  maxLength={6}
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Cart / Lines of Products */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <span>2. Líneas de Productos</span>
            </CardTitle>

            <div className="flex items-center space-x-2">
              {(!selectedCustomer || Boolean(customerLookupError) || hasPendingBalance) && (
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md hidden sm:inline-block">
                  Seleccione un cliente válido para agregar productos
                </span>
              )}
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  setItemToReplace(null);
                  setIsCatalogOpen(true);
                }}
                disabled={!selectedCustomer || Boolean(customerLookupError) || hasPendingBalance}
                title={
                  !selectedCustomer || Boolean(customerLookupError) || hasPendingBalance
                    ? 'Debe seleccionar un cliente antes de agregar productos'
                    : 'Agregar producto al carrito'
                }
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Producto</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Mailtrap Notification Badge Alert if cartItems.length > 3 */}
            {cartItems.length > 3 && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-3 text-xs sm:text-sm animate-in fade-in">
                <Mail className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold">⚠️ Orden Especial (&gt; 3 productos):</span> Se notificará vía{' '}
                  <span className="font-bold underline decoration-amber-500">Mailtrap</span> al registrarse.
                </div>
              </div>
            )}

            {/* Cart Table */}
            {cartItems.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                <ShoppingCart className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-600">El carrito de productos está vacío</p>
                <p className="text-xs text-slate-400 mt-1">
                  {!selectedCustomer || Boolean(customerLookupError) || hasPendingBalance
                    ? 'Debe seleccionar primero un cliente autorizado en el paso 1 para habilitar la adición de productos.'
                    : 'Haga clic en "Agregar Producto" para abrir el catálogo e incorporar ítems a la orden.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Precio Unitario ($)</TableHead>
                      <TableHead className="text-center">Stock Disp.</TableHead>
                      <TableHead className="text-center w-40">Cantidad</TableHead>
                      <TableHead className="text-right">Subtotal ($)</TableHead>
                      <TableHead className="text-center w-24">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item, index) => {
                      const exceedsStock = item.quantity > item.unitsInStock;

                      return (
                        <TableRow key={item.productId} className={exceedsStock ? 'bg-rose-50/50' : ''}>
                          <TableCell className="text-center font-mono text-xs text-slate-400">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-slate-800">{item.productName}</div>
                            <div className="text-xs font-mono text-slate-400">ID #{item.productId}</div>
                            {exceedsStock && (
                              <p className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Excede stock disponible ({item.unitsInStock} disp.)
                              </p>
                            )}
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
                            <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleDecrementQuantity(item.productId)}
                                disabled={item.quantity <= 1}
                                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(item.productId, parseInt(e.target.value, 10))
                                }
                                className="w-14 text-center font-mono text-sm py-1 border-x border-slate-200 focus:outline-none focus:bg-blue-50/30"
                              />
                              <button
                                type="button"
                                onClick={() => handleIncrementQuantity(item.productId)}
                                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold text-slate-900">
                            ${Number(item.subTotal).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStartReplace(item)}
                                className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                title="Reemplazar producto"
                              >
                                <ArrowLeftRight className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setItemToDelete(item)}
                                className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Eliminar de la orden"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Section 3: Financial Summary & Emit Order Button */}
            <div className="flex flex-col sm:flex-row justify-between items-end pt-4 border-t border-slate-200 gap-6">
              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  &bull; Total de Unidades: <strong className="text-slate-800 font-mono">{financialTotals.totalUnits}</strong>
                </p>
                <p>&bull; IVA (Tarifa 15% Ecuador): Calculado conforme a la ley tributaria vigente.</p>
                <p>&bull; La emisión registrará la orden y generará el comprobante electrónico correspondiente.</p>
              </div>

              <div className="w-full sm:w-80 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal Base Imponible:</span>
                  <span className="font-mono font-medium">${financialTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>IVA (Tarifa 15% Ecuador):</span>
                  <span className="font-mono font-medium">${financialTotals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total a Liquidar:</span>
                  <span className="font-mono text-blue-600">${financialTotals.total.toFixed(2)}</span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitDisabled}
                  isLoading={createOrderMutation.isPending}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar Orden y Emitir Factura</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Customer Picker Dialog */}
      <CustomerSelectorModal
        open={showCustomerModal}
        onOpenChange={setShowCustomerModal}
        onSelectCustomer={handleSelectCustomerFromModal}
        selectedCustomerId={selectedCustomerId}
      />

      {/* Product Catalog Picker Dialog */}
      <ProductSelectorModal
        open={isCatalogOpen}
        onOpenChange={(open) => {
          setIsCatalogOpen(open);
          if (!open) {
            setItemToReplace(null);
          }
        }}
        selectedProductIds={cartItems.map((i) => i.productId)}
        onSelectProduct={handleSelectOrReplaceProduct}
        replacingProductId={itemToReplace?.productId}
        replacingProductName={itemToReplace?.productName}
      />

      {/* Confirmation Dialog: Delete Cart Item */}
      <Dialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Quitar producto de la orden"
        description={`¿Está seguro de remover "${itemToDelete?.productName}" del carrito de compra?`}
      >
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setItemToDelete(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmRemoveItem}>
            Quitar Producto
          </Button>
        </div>
      </Dialog>

      {/* Confirmation Dialog: Reset Form */}
      <Dialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="¿Limpiar todo el formulario?"
        description="Esta acción vaciará los datos del cliente, los destinos de entrega y todos los productos agregados al carrito."
      >
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
            Continuar editando
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              handleResetForm();
              setShowResetConfirm(false);
            }}
          >
            Limpiar Formulario
          </Button>
        </div>
      </Dialog>

      {/* Official Printable Voucher Dialog */}
      <Dialog
        open={voucherModalOpen}
        onOpenChange={setVoucherModalOpen}
        title="Comprobante de Venta Electrónico"
        description="Orden registrada exitosamente en el servidor. A continuación se detalla la liquidación tributaria emitida."
        className="max-w-4xl"
      >
        {issuedInvoice && (
          <InvoiceVoucher
            invoice={issuedInvoice}
            showPrintButton={true}
          />
        )}
      </Dialog>
    </div>
  );
};
