import 'invoice_detail.dart';

class InvoiceResponseDto {
  final int id;
  final String invoiceNumber;
  final String customerId;
  final String? customerDocument;
  final String? customerName;
  final String? customerAddress;
  final String? customerPhone;
  final String? customerEmail;
  final String? sellerFullName;
  final double subTotal;
  final double tax;
  final double total;
  final DateTime createdDate;
  final List<InvoiceDetailDto> details;

  const InvoiceResponseDto({
    required this.id,
    required this.invoiceNumber,
    required this.customerId,
    this.customerDocument,
    this.customerName,
    this.customerAddress,
    this.customerPhone,
    this.customerEmail,
    this.sellerFullName,
    required this.subTotal,
    required this.tax,
    required this.total,
    required this.createdDate,
    required this.details,
  });

  factory InvoiceResponseDto.fromJson(Map<String, dynamic> json) {
    var rawDetails = json['details'] ?? json['invoiceDetails'] ?? [];
    List<InvoiceDetailDto> detailsList = [];
    if (rawDetails is List) {
      detailsList = rawDetails
          .map((d) => InvoiceDetailDto.fromJson(d as Map<String, dynamic>))
          .toList();
    }

    DateTime parsedDate;
    try {
      parsedDate = json['createdDate'] != null
          ? DateTime.parse(json['createdDate'] as String)
          : DateTime.now();
    } catch (_) {
      parsedDate = DateTime.now();
    }

    return InvoiceResponseDto(
      id: (json['id'] as num?)?.toInt() ?? 0,
      invoiceNumber: (json['invoiceNumber'] ?? '') as String,
      customerId: (json['customerId'] ?? '') as String,
      customerDocument: json['customerDocument'] as String?,
      customerName: json['customerFullName'] as String? ?? json['customerName'] as String?,
      customerAddress: json['customerAddress'] as String?,
      customerPhone: json['customerPhone'] as String?,
      customerEmail: json['customerEmail'] as String?,
      sellerFullName: json['sellerName'] as String? ?? json['sellerFullName'] as String?,
      subTotal: (json['subTotal'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      createdDate: parsedDate,
      details: detailsList,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'invoiceNumber': invoiceNumber,
        'customerId': customerId,
        'customerDocument': customerDocument,
        'customerName': customerName,
        'customerAddress': customerAddress,
        'customerPhone': customerPhone,
        'customerEmail': customerEmail,
        'sellerFullName': sellerFullName,
        'subTotal': subTotal,
        'tax': tax,
        'total': total,
        'createdDate': createdDate.toIso8601String(),
        'details': details.map((d) => d.toJson()).toList(),
      };
}

class InvoiceFilterDto {
  String? searchTerm;
  String? invoiceNumber;
  String? customerName;
  int pageNumber;
  int pageSize;

  InvoiceFilterDto({
    this.searchTerm,
    this.invoiceNumber,
    this.customerName,
    this.pageNumber = 1,
    this.pageSize = 10,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'pageNumber': pageNumber,
      'pageSize': pageSize,
    };
    if (searchTerm != null && searchTerm!.trim().isNotEmpty) {
      params['searchTerm'] = searchTerm!.trim();
    }
    if (invoiceNumber != null && invoiceNumber!.trim().isNotEmpty) {
      params['invoiceNumber'] = invoiceNumber!.trim();
    }
    if (customerName != null && customerName!.trim().isNotEmpty) {
      params['customerName'] = customerName!.trim();
    }
    return params;
  }
}
