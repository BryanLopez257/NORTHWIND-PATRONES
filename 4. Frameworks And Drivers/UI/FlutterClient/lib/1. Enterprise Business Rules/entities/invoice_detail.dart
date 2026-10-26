class InvoiceDetailDto {
  final int id;
  final int invoiceId;
  final int productId;
  final String productName;
  final int quantity;
  final double unitPrice;

  const InvoiceDetailDto({
    required this.id,
    required this.invoiceId,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
  });

  double get subtotal => quantity * unitPrice;

  factory InvoiceDetailDto.fromJson(Map<String, dynamic> json) {
    return InvoiceDetailDto(
      id: (json['id'] as num?)?.toInt() ?? 0,
      invoiceId: (json['invoiceId'] as num?)?.toInt() ?? 0,
      productId: (json['productId'] as num?)?.toInt() ?? 0,
      productName: json['productNameSnapshot'] as String? ??
          json['productName'] as String? ??
          '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'invoiceId': invoiceId,
        'productId': productId,
        'productNameSnapshot': productName,
        'quantity': quantity,
        'unitPrice': unitPrice,
      };
}
