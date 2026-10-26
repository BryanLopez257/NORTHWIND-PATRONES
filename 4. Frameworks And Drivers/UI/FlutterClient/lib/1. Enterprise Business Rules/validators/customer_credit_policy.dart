import '../entities/customer.dart';

class CustomerCreditPolicy {
  /// Regla de Crédito Estricta NorthWind:
  /// Clientes con saldo deudor > $0.00 están bloqueados para la emisión de nuevas órdenes.
  static bool isEligibleForNewOrder(CustomerDto customer) {
    return customer.currentBalance <= 0.0;
  }

  static String? getOrderBlockingReason(CustomerDto customer) {
    if (!isEligibleForNewOrder(customer)) {
      return "No se puede seleccionar al cliente '${customer.name}' (${customer.id}) porque posee un saldo deudor pendiente de \$${customer.currentBalance.toStringAsFixed(2)}. Clientes con saldo pendiente no están autorizados para emitir órdenes.";
    }
    return null;
  }
}
