import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../../../3. Interface Adapters/repositories/customers_repository.dart';
import '../../../../3. Interface Adapters/state_providers/customers_provider.dart';
import '../../../../3. Interface Adapters/state_providers/invoices_provider.dart';
import '../../../../3. Interface Adapters/state_providers/orders_provider.dart';
import '../../../../3. Interface Adapters/state_providers/products_provider.dart';
import '../../../utils/input_filters.dart';
import '../../components/badge_widget.dart';
import '../invoices/invoice_voucher.dart';
import 'customer_selector_modal.dart';
import 'product_selector_modal.dart';

class CreateOrderPage extends StatefulWidget {
  const CreateOrderPage({super.key});

  @override
  State<CreateOrderPage> createState() => _CreateOrderPageState();
}

class _CreateOrderPageState extends State<CreateOrderPage> {
  final CustomersRepository _customersRepository = CustomersRepository();

  // Form Controllers & State
  final TextEditingController _customerCodeController = TextEditingController();
  final TextEditingController _documentController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _cityController = TextEditingController();
  final TextEditingController _countryController = TextEditingController();
  final TextEditingController _postalCodeController = TextEditingController();

  CustomerDto? _selectedCustomer;
  String? _customerLookupError;
  String? _formError;

  // Cart State
  final List<CartItem> _cartItems = [];
  CartItem? _itemToReplace;

  // Validation State
  bool _touchedCustomer = false;
  bool _touchedAddress = false;
  bool _touchedCity = false;
  bool _touchedCountry = false;

  @override
  void dispose() {
    _customerCodeController.dispose();
    _documentController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _countryController.dispose();
    _postalCodeController.dispose();
    super.dispose();
  }

  bool get _hasPendingBalance => (_selectedCustomer?.currentBalance ?? 0) > 0;

  ValidationResult get _documentValidation {
    final doc = _documentController.text.trim();
    if (doc.isEmpty) {
      return const ValidationResult(isValid: false, error: 'Debe ingresar la cédula o RUC del cliente.');
    }

    if (_selectedCustomer != null && _selectedCustomer!.customerType == 2) {
      if (doc.length != 13) {
        return const ValidationResult(
          isValid: false,
          error: 'El cliente está registrado como Empresa y requiere obligatoriamente un RUC de 13 dígitos.',
        );
      }
      return EcuadorianIdValidator.validateRuc(doc);
    }

    return EcuadorianIdValidator.validate(doc);
  }

  double get _subtotal {
    double sum = 0.0;
    for (final item in _cartItems) {
      sum += item.subTotal;
    }
    return double.parse(sum.toStringAsFixed(2));
  }

  double get _tax => double.parse((_subtotal * 0.15).toStringAsFixed(2));

  double get _total => double.parse((_subtotal + _tax).toStringAsFixed(2));

  int get _totalUnits {
    int count = 0;
    for (final item in _cartItems) {
      count += item.quantity;
    }
    return count;
  }

  Future<void> _validateCustomerCode(String code) async {
    final cleanCode = code.trim().toUpperCase();
    if (cleanCode.isEmpty) {
      setState(() {
        _selectedCustomer = null;
        _documentController.clear();
        _customerLookupError = 'Debe ingresar o seleccionar un código de cliente (5 letras).';
      });
      return;
    }

    if (cleanCode.length < 5) {
      setState(() {
        _selectedCustomer = null;
        _documentController.clear();
        _customerLookupError = 'El código de cliente debe contener exactamente 5 letras mayúsculas.';
      });
      return;
    }

    if (_selectedCustomer != null && _selectedCustomer!.id.toUpperCase() == cleanCode) {
      setState(() {
        if (_selectedCustomer!.currentBalance > 0) {
          _customerLookupError =
              'No se puede seleccionar al cliente porque posee un saldo deudor pendiente de \$${_selectedCustomer!.currentBalance.toStringAsFixed(2)}. Clientes con saldo pendiente no están autorizados para emitir órdenes.';
        } else {
          _customerLookupError = null;
        }
      });
      return;
    }

    try {
      final found = await _customersRepository.getCustomerById(cleanCode);
      if (found == null || found.id.isEmpty) {
        setState(() {
          _selectedCustomer = null;
          _documentController.clear();
          _customerLookupError = "El cliente con código '$cleanCode' no existe en la base de datos.";
        });
        return;
      }

      setState(() {
        _selectedCustomer = found;
        _documentController.text = found.identification;
        if (found.currentBalance > 0) {
          _customerLookupError =
              'No se puede seleccionar al cliente porque posee un saldo deudor pendiente de \$${found.currentBalance.toStringAsFixed(2)}. Clientes con saldo pendiente no están autorizados para emitir órdenes.';
        } else {
          _customerLookupError = null;
        }
      });
    } catch (_) {
      setState(() {
        _selectedCustomer = null;
        _documentController.clear();
        _customerLookupError = "El cliente con código '$cleanCode' no existe en la base de datos.";
      });
    }
  }

  void _onCustomerSelected(CustomerDto customer) {
    setState(() {
      _selectedCustomer = customer;
      _customerCodeController.text = customer.id.toUpperCase();
      _documentController.text = customer.identification;
      _touchedCustomer = true;
      _formError = null;

      if (customer.currentBalance > 0) {
        _customerLookupError =
            'No se puede seleccionar al cliente porque posee un saldo deudor pendiente de \$${customer.currentBalance.toStringAsFixed(2)}. Clientes con saldo pendiente no están autorizados para emitir órdenes.';
      } else {
        _customerLookupError = null;
      }
    });
  }

  void _onProductSelected(ProductDto product) {
    setState(() {
      if (_itemToReplace != null) {
        final targetId = _itemToReplace!.productId;
        final alreadyInCart = _cartItems.indexWhere((i) => i.productId == product.id);

        if (alreadyInCart != -1) {
          _cartItems.removeWhere((i) => i.productId == targetId);
          final existing = _cartItems.firstWhere((i) => i.productId == product.id);
          final newQty = (existing.quantity + 1).clamp(1, existing.unitsInStock);
          existing.updateQuantity(newQty);
        } else {
          final index = _cartItems.indexWhere((i) => i.productId == targetId);
          if (index != -1) {
            _cartItems[index] = CartItem(
              productId: product.id,
              productName: product.name,
              unitPrice: product.unitPrice,
              unitsInStock: product.unitsInStock,
              quantity: 1,
            );
          }
        }
        _itemToReplace = null;
      } else {
        if (!_cartItems.any((i) => i.productId == product.id)) {
          _cartItems.add(CartItem(
            productId: product.id,
            productName: product.name,
            unitPrice: product.unitPrice,
            unitsInStock: product.unitsInStock,
            quantity: 1,
          ));
        }
      }
    });
  }

  void _updateQuantity(CartItem item, int newQty) {
    setState(() {
      final clamped = newQty.clamp(1, item.unitsInStock > 0 ? item.unitsInStock : 1);
      item.updateQuantity(clamped);
    });
  }

  void _confirmDeleteItem(CartItem item) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Quitar producto de la orden'),
        content: Text('¿Está seguro de remover "${item.productName}" del carrito de compra?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE11D48)),
            onPressed: () {
              setState(() {
                _cartItems.removeWhere((i) => i.productId == item.productId);
              });
              Navigator.of(ctx).pop();
            },
            child: const Text('Quitar Producto', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _confirmResetForm() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('¿Limpiar todo el formulario?'),
        content: const Text(
          'Esta acción vaciará los datos del cliente, los destinos de entrega y todos los productos agregados al carrito.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Continuar editando'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE11D48)),
            onPressed: () {
              _resetForm();
              Navigator.of(ctx).pop();
            },
            child: const Text('Limpiar Formulario', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _resetForm() {
    setState(() {
      _selectedCustomer = null;
      _customerCodeController.clear();
      _documentController.clear();
      _addressController.clear();
      _cityController.clear();
      _countryController.clear();
      _postalCodeController.clear();
      _cartItems.clear();
      _itemToReplace = null;
      _customerLookupError = null;
      _formError = null;
      _touchedCustomer = false;
      _touchedAddress = false;
      _touchedCity = false;
      _touchedCountry = false;
    });
  }

  Future<void> _submitOrder() async {
    setState(() {
      _formError = null;
      _touchedCustomer = true;
      _touchedAddress = true;
      _touchedCity = true;
      _touchedCountry = true;
    });

    await _validateCustomerCode(_customerCodeController.text);

    if (_selectedCustomer == null) {
      setState(() => _formError = 'Por favor seleccione o ingrese un código de cliente válido (5 letras).');
      return;
    }

    if (_hasPendingBalance || _customerLookupError != null) {
      setState(() => _formError = _customerLookupError ??
          'No se puede emitir la orden: el cliente seleccionado mantiene saldo pendiente de pago.');
      return;
    }

    if (!_documentValidation.isValid) {
      setState(() => _formError = 'Documento tributario inválido: ${_documentValidation.error}');
      return;
    }

    if (_addressController.text.trim().isEmpty || _addressController.text.trim().length > 60) {
      setState(() => _formError = 'La dirección de envío es obligatoria (máximo 60 caracteres).');
      return;
    }

    final city = _cityController.text.trim();
    if (city.isEmpty || city.length < 3 || city.length > 15) {
      setState(() => _formError = 'La ciudad de destino debe tener entre 3 y 15 caracteres.');
      return;
    }

    final country = _countryController.text.trim();
    if (country.isEmpty || country.length < 3 || country.length > 15) {
      setState(() => _formError = 'El país de destino debe tener entre 3 y 15 caracteres.');
      return;
    }

    if (_cartItems.isEmpty) {
      setState(() => _formError = 'La orden debe contener al menos un producto en el carrito.');
      return;
    }

    for (final item in _cartItems) {
      if (item.quantity <= 0) {
        setState(() => _formError = 'La cantidad para ${item.productName} debe ser mayor a cero.');
        return;
      }
      if (item.quantity > item.unitsInStock) {
        setState(() => _formError =
            'La cantidad solicitada para ${item.productName} (${item.quantity}) excede el stock disponible (${item.unitsInStock}).');
        return;
      }
    }

    final dto = CreateOrderDto(
      customerId: _selectedCustomer!.id,
      customerDocument: _documentController.text.trim(),
      shipAddress: _addressController.text.trim(),
      shipCity: city,
      shipCountry: country,
      shipPostalCode: _postalCodeController.text.trim().isNotEmpty
          ? _postalCodeController.text.trim()
          : null,
      orderDetails: _cartItems
          .map((i) => CreateOrderDetailDto(
                productId: i.productId,
                unitPrice: i.unitPrice,
                quantity: i.quantity,
              ))
          .toList(),
    );

    if (!mounted) return;
    final ordersProvider = context.read<OrdersProvider>();

    try {
      final result = await ordersProvider.createOrder(dto);

      // Invalidate / refresh other features
      if (mounted) {
        context.read<ProductsProvider>().loadProducts();
        context.read<InvoicesProvider>().loadInvoices();
        context.read<CustomersProvider>().loadCustomers();
      }

      // Build invoice to display
      final invoice = result.invoice ??
          InvoiceResponseDto(
            id: result.orderId,
            invoiceNumber: result.invoiceNumber.isNotEmpty ? result.invoiceNumber : 'FAC-${result.orderId}',
            customerId: dto.customerId,
            customerName: _selectedCustomer?.name ?? dto.customerId,
            customerDocument: dto.customerDocument,
            customerAddress: dto.shipAddress,
            sellerFullName: 'Ventas NorthWind',
            subTotal: _subtotal,
            tax: _tax,
            total: _total,
            createdDate: DateTime.now(),
            details: _cartItems
                .map((c) => InvoiceDetailDto(
                      id: 0,
                      invoiceId: result.orderId,
                      productId: c.productId,
                      productName: c.productName,
                      quantity: c.quantity,
                      unitPrice: c.unitPrice,
                    ))
                .toList(),
          );

      _resetForm();

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => InvoiceVoucher(invoice: invoice),
        );
      }
    } catch (e) {
      setState(() {
        _formError = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  bool get _isSubmitDisabled {
    return _selectedCustomer == null ||
        _hasPendingBalance ||
        _customerLookupError != null ||
        !_documentValidation.isValid ||
        _cartItems.isEmpty ||
        _cartItems.any((i) => i.quantity > i.unitsInStock) ||
        _addressController.text.trim().isEmpty ||
        _cityController.text.trim().length < 3 ||
        _countryController.text.trim().length < 3;
  }

  @override
  Widget build(BuildContext context) {
    final ordersProvider = context.watch<OrdersProvider>();
    final isSubmitting = ordersProvider.isSubmitting;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Row(
                            children: [
                              Icon(Icons.shopping_cart_outlined, color: Color(0xFF2563EB), size: 26),
                              SizedBox(width: 8),
                              Text(
                                'Crear Orden de Compra',
                                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                            ],
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Registro comercial de órdenes y facturación electrónica con validación ecuatoriana en tiempo real.',
                            style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: _confirmResetForm,
                      icon: const Icon(Icons.refresh, size: 16),
                      label: const Text('Limpiar Formulario'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF475569),
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Form Global Error
                if (_formError != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF1F2),
                      border: Border.all(color: const Color(0xFFFECDD3)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.error_outline, color: Color(0xFFE11D48), size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _formError!,
                            style: const TextStyle(color: Color(0xFF9F1239), fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Debt Policy Alert Banner
                if (_selectedCustomer != null && _hasPendingBalance) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      border: Border.all(color: const Color(0xFFF87171), width: 1.5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.shield_outlined, color: Color(0xFFDC2626), size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Bloqueo por Política de Crédito',
                                style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF991B1B), fontSize: 14),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                "No se puede seleccionar al cliente porque posee un saldo deudor pendiente de \$${_selectedCustomer!.currentBalance.toStringAsFixed(2)}. Clientes con saldo pendiente no están autorizados para emitir órdenes.",
                                style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Section 1: Customer Information
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.person_pin_outlined, color: Color(0xFF2563EB), size: 20),
                            SizedBox(width: 8),
                            Text(
                              '1. Información del Cliente y Envío',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                          ],
                        ),
                        const Divider(height: 24, color: Color(0xFFF1F5F9)),

                        Wrap(
                          spacing: 16,
                          runSpacing: 16,
                          children: [
                            // Customer ID input + Search Modal Button
                            SizedBox(
                              width: 320,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: const [
                                      Text('CLIENTE (5 LETRAS)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                      Text(' *', style: TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: TextField(
                                          controller: _customerCodeController,
                                          maxLength: 5,
                                          textCapitalization: TextCapitalization.characters,
                                          inputFormatters: [
                                            FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z]')),
                                            InputFilters.upperCase,
                                          ],
                                          decoration: InputDecoration(
                                            counterText: '',
                                            hintText: 'Ej. ALFKI',
                                            hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                                            isDense: true,
                                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                          style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold),
                                          onChanged: (val) {
                                            final clean = InputFilters.sanitizeAlpha(val, true);
                                            if (clean.length == 5) {
                                              _validateCustomerCode(clean);
                                            } else {
                                              setState(() {
                                                _selectedCustomer = null;
                                                _documentController.clear();
                                                _customerLookupError = null;
                                              });
                                            }
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      OutlinedButton.icon(
                                        onPressed: () {
                                          showDialog(
                                            context: context,
                                            barrierDismissible: false,
                                            builder: (_) => CustomerSelectorModal(
                                              selectedCustomerId: _selectedCustomer?.id,
                                              onSelectCustomer: _onCustomerSelected,
                                            ),
                                          );
                                        },
                                        icon: const Icon(Icons.person_add_outlined, size: 16),
                                        label: const Text('Buscar'),
                                        style: OutlinedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                          foregroundColor: const Color(0xFF2563EB),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (_customerLookupError != null)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 4.0),
                                      child: Text(
                                        _customerLookupError!,
                                        style: const TextStyle(fontSize: 11, color: Color(0xFFE11D48)),
                                      ),
                                    )
                                  else if (_touchedCustomer && _selectedCustomer == null)
                                    const Padding(
                                      padding: EdgeInsets.only(top: 4.0),
                                      child: Text(
                                        'Debe ingresar o seleccionar un cliente válido.',
                                        style: TextStyle(fontSize: 11, color: Color(0xFFE11D48)),
                                      ),
                                    ),
                                ],
                              ),
                            ),

                            // Document (Cédula/RUC) ReadOnly
                            SizedBox(
                              width: 320,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: const [
                                      Text('CÉDULA / RUC (ECUADOR)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                      Text('Solo lectura', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  TextField(
                                    controller: _documentController,
                                    readOnly: true,
                                    decoration: InputDecoration(
                                      isDense: true,
                                      hintText: 'Se cargará automáticamente',
                                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                      fillColor: const Color(0xFFF1F5F9),
                                      filled: true,
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                                      ),
                                    ),
                                    style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(height: 4),
                                  if (_documentController.text.isNotEmpty)
                                    Row(
                                      children: [
                                        Icon(
                                          _documentValidation.isValid ? Icons.check_circle : Icons.error_outline,
                                          size: 14,
                                          color: _documentValidation.isValid ? const Color(0xFF059669) : const Color(0xFFE11D48),
                                        ),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            _documentValidation.isValid
                                                ? (_documentController.text.length == 10
                                                    ? 'Cédula Ecuatoriana Válida'
                                                    : 'RUC Ecuatoriano Válido')
                                                : (_documentValidation.error ?? 'Identificación inválida'),
                                            style: TextStyle(
                                              fontSize: 11,
                                              color: _documentValidation.isValid ? const Color(0xFF059669) : const Color(0xFFE11D48),
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        // Selected Customer Details Banner
                        if (_selectedCustomer != null) ...[
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Razón Social / Nombre:', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                      Text(
                                        _selectedCustomer!.name,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Tipo:', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                    const SizedBox(height: 2),
                                    BadgeWidget(
                                      label: _selectedCustomer!.customerType == 2 ? 'Empresa' : 'Persona Natural',
                                      variant: _selectedCustomer!.customerType == 2 ? BadgeVariant.info : BadgeVariant.defaultVariant,
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 24),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text('Saldo en Cuenta:', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                    Text(
                                      '\$${_selectedCustomer!.currentBalance.toStringAsFixed(2)}',
                                      style: TextStyle(
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: _hasPendingBalance ? const Color(0xFFE11D48) : const Color(0xFF059669),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Section 2: Shipping Destination
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.location_on_outlined, color: Color(0xFF2563EB), size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Datos de Envío y Destino',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                          ],
                        ),
                        const Divider(height: 24, color: Color(0xFFF1F5F9)),

                        Wrap(
                          spacing: 16,
                          runSpacing: 16,
                          children: [
                            // Address
                            SizedBox(
                              width: 380,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: const [
                                          Text('DIRECCIÓN DE ENVÍO', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                          Text(' *', style: TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                      Text('${_addressController.text.length}/60', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  TextField(
                                    controller: _addressController,
                                    maxLength: 60,
                                    inputFormatters: [
                                      InputFilters.shipAddress,
                                    ],
                                    decoration: InputDecoration(
                                      counterText: '',
                                      isDense: true,
                                      hintText: 'Ej. Av. 10 de Agosto N24-123 y Colón',
                                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onChanged: (val) {
                                      setState(() {});
                                    },
                                  ),
                                  if (_touchedAddress && _addressController.text.trim().isEmpty)
                                    const Padding(
                                      padding: EdgeInsets.only(top: 4.0),
                                      child: Text('Debe proporcionar la dirección de envío.', style: TextStyle(fontSize: 11, color: Color(0xFFE11D48))),
                                    ),
                                ],
                              ),
                            ),

                            // City
                            SizedBox(
                              width: 200,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: const [
                                          Text('CIUDAD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                          Text(' *', style: TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                      Text('${_cityController.text.length}/15', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  TextField(
                                    controller: _cityController,
                                    maxLength: 15,
                                    inputFormatters: [
                                      InputFilters.lettersAndSpaces,
                                    ],
                                    decoration: InputDecoration(
                                      counterText: '',
                                      isDense: true,
                                      hintText: 'Ej. Quito',
                                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onChanged: (val) {
                                      setState(() {});
                                    },
                                  ),
                                  if (_touchedCity && (_cityController.text.trim().length < 3))
                                    const Padding(
                                      padding: EdgeInsets.only(top: 4.0),
                                      child: Text('Debe tener al menos 3 caracteres.', style: TextStyle(fontSize: 11, color: Color(0xFFE11D48))),
                                    ),
                                ],
                              ),
                            ),

                            // Country
                            SizedBox(
                              width: 200,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: const [
                                          Text('PAÍS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                          Text(' *', style: TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                      Text('${_countryController.text.length}/15', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  TextField(
                                    controller: _countryController,
                                    maxLength: 15,
                                    inputFormatters: [
                                      InputFilters.lettersAndSpaces,
                                    ],
                                    decoration: InputDecoration(
                                      counterText: '',
                                      isDense: true,
                                      hintText: 'Ej. Ecuador',
                                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onChanged: (val) {
                                      setState(() {});
                                    },
                                  ),
                                  if (_touchedCountry && (_countryController.text.trim().length < 3))
                                    const Padding(
                                      padding: EdgeInsets.only(top: 4.0),
                                      child: Text('Debe tener al menos 3 caracteres.', style: TextStyle(fontSize: 11, color: Color(0xFFE11D48))),
                                    ),
                                ],
                              ),
                            ),

                            // Postal Code
                            SizedBox(
                              width: 140,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('CÓDIGO POSTAL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                  const SizedBox(height: 6),
                                  TextField(
                                    controller: _postalCodeController,
                                    maxLength: 6,
                                    keyboardType: TextInputType.number,
                                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                                    decoration: InputDecoration(
                                      counterText: '',
                                      isDense: true,
                                      hintText: 'Ej. 170150',
                                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    style: const TextStyle(fontFamily: 'monospace'),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Section 3: Product Lines (Cart)
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: const [
                                Icon(Icons.list_alt, color: Color(0xFF2563EB), size: 20),
                                SizedBox(width: 8),
                                Text(
                                  '2. Líneas de Productos',
                                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                ),
                              ],
                            ),
                            ElevatedButton.icon(
                              onPressed: (_selectedCustomer == null || _hasPendingBalance || _customerLookupError != null)
                                  ? null
                                  : () {
                                      _itemToReplace = null;
                                      showDialog(
                                        context: context,
                                        barrierDismissible: false,
                                        builder: (_) => ProductSelectorModal(
                                          selectedProductIds: _cartItems.map((i) => i.productId).toList(),
                                          onSelectProduct: _onProductSelected,
                                        ),
                                      );
                                    },
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Agregar Producto'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2563EB),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 24, color: Color(0xFFF1F5F9)),

                        // Mailtrap notification banner (>3 items)
                        if (_cartItems.length > 3) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFBEB),
                              border: Border.all(color: const Color(0xFFFCD34D)),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: const [
                                Icon(Icons.mail_outline, color: Color(0xFFD97706), size: 18),
                                SizedBox(width: 8),
                                Expanded(
                                  child: Text.rich(
                                    TextSpan(
                                      children: [
                                        TextSpan(
                                          text: '⚠️ Orden Especial (> 3 productos): ',
                                          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF78350F), fontSize: 12),
                                        ),
                                        TextSpan(
                                          text: 'Se notificará vía Mailtrap al registrarse.',
                                          style: TextStyle(color: Color(0xFF92400E), fontSize: 12),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),
                        ],

                        // Cart Table
                        if (_cartItems.isEmpty)
                          Container(
                            padding: const EdgeInsets.all(36),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Center(
                              child: Column(
                                children: const [
                                  Icon(Icons.shopping_cart_outlined, size: 40, color: Color(0xFFCBD5E1)),
                                  SizedBox(height: 8),
                                  Text(
                                    'El carrito de productos está vacío',
                                    style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Seleccione un cliente y haga clic en "Agregar Producto" para seleccionar ítems.',
                                    style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
                              headingTextStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                              columns: const [
                                DataColumn(label: Text('#')),
                                DataColumn(label: Text('Producto')),
                                DataColumn(label: Text('Precio Unitario'), numeric: true),
                                DataColumn(label: Center(child: Text('Stock Disp.'))),
                                DataColumn(label: Center(child: Text('Cantidad'))),
                                DataColumn(label: Text('Subtotal'), numeric: true),
                                DataColumn(label: Center(child: Text('Acción'))),
                              ],
                              rows: _cartItems.asMap().entries.map((entry) {
                                final index = entry.key;
                                final item = entry.value;

                                return DataRow(
                                  cells: [
                                    DataCell(Text('${index + 1}', style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)))),
                                    DataCell(
                                      Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(item.productName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF0F172A))),
                                          Text('ID #${item.productId}', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontFamily: 'monospace')),
                                        ],
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        '\$${item.unitPrice.toStringAsFixed(2)}',
                                        style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: Color(0xFF334155)),
                                      ),
                                    ),
                                    DataCell(
                                      Center(
                                        child: BadgeWidget(
                                          label: '${item.unitsInStock} uds.',
                                          variant: item.unitsInStock <= 5 ? BadgeVariant.warning : BadgeVariant.defaultVariant,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.remove, size: 16),
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                            onPressed: item.quantity > 1 ? () => _updateQuantity(item, item.quantity - 1) : null,
                                          ),
                                          Container(
                                            width: 40,
                                            padding: const EdgeInsets.symmetric(vertical: 4),
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              border: Border.all(color: const Color(0xFFCBD5E1)),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              '${item.quantity}',
                                              style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 12),
                                            ),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.add, size: 16),
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                            onPressed: item.quantity < item.unitsInStock ? () => _updateQuantity(item, item.quantity + 1) : null,
                                          ),
                                        ],
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        '\$${item.subTotal.toStringAsFixed(2)}',
                                        style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                      ),
                                    ),
                                    DataCell(
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.swap_horiz, size: 18, color: Color(0xFF2563EB)),
                                            tooltip: 'Reemplazar producto',
                                            onPressed: () {
                                              _itemToReplace = item;
                                              showDialog(
                                                context: context,
                                                barrierDismissible: false,
                                                builder: (_) => ProductSelectorModal(
                                                  selectedProductIds: _cartItems.map((i) => i.productId).toList(),
                                                  onSelectProduct: _onProductSelected,
                                                  replacingProductId: item.productId,
                                                  replacingProductName: item.productName,
                                                ),
                                              );
                                            },
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFE11D48)),
                                            tooltip: 'Eliminar producto',
                                            onPressed: () => _confirmDeleteItem(item),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                );
                              }).toList(),
                            ),
                          ),

                        const SizedBox(height: 20),

                        // Financial Totals & Submit
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('• Total de Unidades: $_totalUnits', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                  const SizedBox(height: 2),
                                  const Text('• IVA (Tarifa 15% Ecuador): Calculado conforme a la ley tributaria.', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                  const SizedBox(height: 2),
                                  const Text('• Se emitirá comprobante electrónico oficial al registrar la orden.', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            Container(
                              width: 320,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Subtotal Base Imponible:', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                      Text('\$${_subtotal.toStringAsFixed(2)}', style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('IVA (Tarifa 15% Ecuador):', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                      Text('\$${_tax.toStringAsFixed(2)}', style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                  const Divider(height: 16, color: Color(0xFFE2E8F0)),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Total a Liquidar:', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                      Text(
                                        '\$${_total.toStringAsFixed(2)}',
                                        style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF2563EB)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  ElevatedButton.icon(
                                    onPressed: _isSubmitDisabled || isSubmitting ? null : _submitOrder,
                                    icon: isSubmitting
                                        ? const SizedBox(
                                            width: 16,
                                            height: 16,
                                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                          )
                                        : const Icon(Icons.send, size: 16),
                                    label: Text(isSubmitting ? 'Registrando Orden...' : 'Enviar Orden y Emitir Factura'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF2563EB),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
