class CartItem {
  final int productId;
  final String productName;
  final double unitPrice;
  final int unitsInStock;
  int quantity;
  double subTotal;

  CartItem({
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.unitsInStock,
    this.quantity = 1,
    double? subTotal,
  }) : subTotal = subTotal ?? (unitPrice * (quantity > 0 ? quantity : 1));

  void updateQuantity(int newQty) {
    quantity = newQty;
    subTotal = double.parse((unitPrice * quantity).toStringAsFixed(2));
  }
}
