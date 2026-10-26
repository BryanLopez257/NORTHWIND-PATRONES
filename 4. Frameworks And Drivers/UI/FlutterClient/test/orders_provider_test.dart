import 'package:flutter_test/flutter_test.dart';
import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/3. Interface Adapters/state_providers/orders_provider.dart';

void main() {
  group('OrdersProvider Calculation Tests', () {
    late OrdersProvider orders;

    setUp(() {
      orders = OrdersProvider();
    });

    test('Initial totals should be zero', () {
      expect(orders.subtotal, 0.0);
      expect(orders.tax, 0.0);
      expect(orders.total, 0.0);
      expect(orders.isSpecialOrder, isFalse);
    });

    test('Adding products computes SubTotal, 15% IVA Tax, and Total correctly', () {
      orders.addProduct(ProductDto(id: 1, name: 'Chai', unitsInStock: 20, unitPrice: 10.0));
      orders.updateQuantity(1, 2);
      expect(orders.subtotal, 20.0);
      expect(orders.tax, 3.0); // 15% of 20 = 3.0
      expect(orders.total, 23.0);
      expect(orders.totalUnits, 2);
      expect(orders.isSpecialOrder, isFalse);
    });

    test('Adding more than 3 products marks order as special', () {
      orders.addProduct(ProductDto(id: 1, name: 'Chai', unitsInStock: 10, unitPrice: 10.0));
      orders.addProduct(ProductDto(id: 2, name: 'Chang', unitsInStock: 10, unitPrice: 15.0));
      orders.addProduct(ProductDto(id: 3, name: 'Aniseed Syrup', unitsInStock: 10, unitPrice: 20.0));
      expect(orders.isSpecialOrder, isFalse);

      orders.addProduct(ProductDto(id: 4, name: 'Chef Anton', unitsInStock: 10, unitPrice: 25.0));
      expect(orders.isSpecialOrder, isTrue); // > 3 products -> Special Order (Mailtrap)
    });

    test('Customer with debt is flagged and blocks order creation', () {
      final debtor = CustomerDto(
        id: 'DEBTR',
        name: 'Debtor Customer',
        customerType: 1,
        currentBalance: 150.0,
        identification: '1710034065',
      );
      orders.selectCustomer(debtor);
      expect(orders.hasPendingBalance, isTrue);
      expect(orders.customerLookupError, isNotNull);
      expect(orders.customerLookupError, contains('saldo deudor'));
    });
  });
}
