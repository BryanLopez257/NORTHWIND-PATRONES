import 'package:flutter/foundation.dart';
import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../repositories/orders_repository.dart';

class OrdersProvider extends ChangeNotifier {
  final CreateOrderUseCase _createOrderUseCase;

  bool _isSubmitting = false;
  String? _errorMessage;
  InvoiceResponseDto? _issuedInvoice;

  // Cart & Form State
  CustomerDto? _selectedCustomer;
  String? _customerLookupError;
  final List<CartItem> _cartItems = [];

  OrdersProvider({CreateOrderUseCase? createOrderUseCase})
      : _createOrderUseCase = createOrderUseCase ?? CreateOrderUseCase(OrdersRepository());

  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;
  InvoiceResponseDto? get issuedInvoice => _issuedInvoice;

  CustomerDto? get selectedCustomer => _selectedCustomer;
  String? get customerLookupError => _customerLookupError;
  List<CartItem> get cartItems => _cartItems;

  bool get hasPendingBalance => (_selectedCustomer?.currentBalance ?? 0) > 0;
  bool get isSpecialOrder => _cartItems.length > 3;

  double get subtotal {
    final sum = _cartItems.fold(0.0, (acc, item) => acc + item.subTotal);
    return double.parse(sum.toStringAsFixed(2));
  }

  double get tax {
    return double.parse((subtotal * 0.15).toStringAsFixed(2));
  }

  double get total {
    return double.parse((subtotal + tax).toStringAsFixed(2));
  }

  int get totalUnits {
    return _cartItems.fold(0, (acc, item) => acc + item.quantity);
  }

  void selectCustomer(CustomerDto customer) {
    _selectedCustomer = customer;
    final blockingReason = CustomerCreditPolicy.getOrderBlockingReason(customer);
    _customerLookupError = blockingReason;
    notifyListeners();
  }

  void clearCustomer() {
    _selectedCustomer = null;
    _customerLookupError = null;
    notifyListeners();
  }

  void addProduct(ProductDto product) {
    if (_cartItems.any((i) => i.productId == product.id)) return;
    _cartItems.add(CartItem(
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      unitsInStock: product.unitsInStock,
      quantity: 1,
    ));
    notifyListeners();
  }

  void updateQuantity(int productId, int quantity) {
    final item = _cartItems.firstWhere(
      (i) => i.productId == productId,
      orElse: () => CartItem(productId: 0, productName: '', unitPrice: 0, unitsInStock: 0),
    );
    if (item.productId == 0) return;
    final clamped = quantity.clamp(1, item.unitsInStock > 0 ? item.unitsInStock : 1);
    item.updateQuantity(clamped);
    notifyListeners();
  }

  void removeProduct(int productId) {
    _cartItems.removeWhere((i) => i.productId == productId);
    notifyListeners();
  }

  void clearCart() {
    _cartItems.clear();
    notifyListeners();
  }

  EcuadorianIdResult validateDocument(String doc) {
    final clean = doc.trim();
    if (clean.isEmpty) {
      return const EcuadorianIdResult(isValid: false, error: 'Debe ingresar la cédula o RUC del cliente.');
    }
    if (clean.length != 10 && clean.length != 13) {
      return const EcuadorianIdResult(isValid: false, error: 'El documento debe contener 10 dígitos (Cédula) o 13 dígitos (RUC).');
    }
    if (_selectedCustomer?.customerType == 2) {
      if (clean.length == 10) {
        return const EcuadorianIdResult(
          isValid: false,
          error: 'El cliente está registrado como Empresa y requiere obligatoriamente un RUC de 13 dígitos.',
        );
      }
      return EcuadorianIdValidator.validateRuc(clean);
    }
    return EcuadorianIdValidator.validate(clean);
  }

  Future<CreateOrderResultDto> createOrder(CreateOrderDto dto) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _createOrderUseCase.execute(dto);
      _issuedInvoice = result.invoice;
      return result;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      rethrow;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
