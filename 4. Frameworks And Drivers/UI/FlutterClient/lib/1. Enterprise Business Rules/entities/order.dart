import 'invoice.dart';
import 'order_detail.dart';

class CreateOrderDto {
  final String customerId;
  final String customerDocument;
  final String shipAddress;
  final String shipCity;
  final String shipCountry;
  final String? shipPostalCode;
  final List<CreateOrderDetailDto> orderDetails;

  CreateOrderDto({
    required this.customerId,
    required this.customerDocument,
    required this.shipAddress,
    required this.shipCity,
    required this.shipCountry,
    this.shipPostalCode,
    required this.orderDetails,
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{
      'customerId': customerId,
      'customerDocument': customerDocument,
      'shipAddress': shipAddress,
      'shipCity': shipCity,
      'shipCountry': shipCountry,
      'orderDetails': orderDetails.map((d) => d.toJson()).toList(),
    };
    if (shipPostalCode != null && shipPostalCode!.isNotEmpty) {
      map['shipPostalCode'] = shipPostalCode;
    }
    return map;
  }
}

class CreateOrderResultDto {
  final int orderId;
  final String invoiceNumber;
  final InvoiceResponseDto? invoice;

  CreateOrderResultDto({
    required this.orderId,
    required this.invoiceNumber,
    this.invoice,
  });

  factory CreateOrderResultDto.fromJson(Map<String, dynamic> json) {
    return CreateOrderResultDto(
      orderId: (json['orderId'] ?? json['id'] ?? 0) as int,
      invoiceNumber: (json['invoiceNumber'] ?? '') as String,
      invoice: json['invoice'] != null
          ? InvoiceResponseDto.fromJson(json['invoice'] as Map<String, dynamic>)
          : null,
    );
  }
}
