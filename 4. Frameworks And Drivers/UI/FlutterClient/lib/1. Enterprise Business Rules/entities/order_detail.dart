class CreateOrderDetailDto {
  final int productId;
  final double unitPrice;
  final int quantity;

  CreateOrderDetailDto({
    required this.productId,
    required this.unitPrice,
    required this.quantity,
  });

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'unitPrice': unitPrice,
        'quantity': quantity,
      };

  factory CreateOrderDetailDto.fromJson(Map<String, dynamic> json) {
    return CreateOrderDetailDto(
      productId: (json['productId'] as num).toInt(),
      unitPrice: (json['unitPrice'] as num).toDouble(),
      quantity: (json['quantity'] as num).toInt(),
    );
  }
}
