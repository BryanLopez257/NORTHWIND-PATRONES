class ProductDto {
  final int id;
  final String name;
  final double unitPrice;
  final int unitsInStock;

  const ProductDto({
    required this.id,
    required this.name,
    required this.unitPrice,
    required this.unitsInStock,
  });

  bool get isOutOfStock => unitsInStock <= 0;
  bool get inStock => unitsInStock > 0;

  factory ProductDto.fromJson(Map<String, dynamic> json) {
    return ProductDto(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] ?? json['productName'] ?? '') as String,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      unitsInStock: (json['unitsInStock'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'unitPrice': unitPrice,
        'unitsInStock': unitsInStock,
      };
}

class CreateProductDto {
  final String name;
  final double unitPrice;
  final int unitsInStock;

  const CreateProductDto({
    required this.name,
    required this.unitPrice,
    required this.unitsInStock,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'unitPrice': unitPrice,
        'unitsInStock': unitsInStock,
      };
}

class UpdateProductDto {
  final int id;
  final String name;
  final double unitPrice;
  final int unitsInStock;

  const UpdateProductDto({
    required this.id,
    required this.name,
    required this.unitPrice,
    required this.unitsInStock,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'unitPrice': unitPrice,
        'unitsInStock': unitsInStock,
      };
}

class ProductFilterDto {
  String? searchTerm;
  bool? inStockOnly;
  int? stockFilter;
  double? minPrice;
  double? maxPrice;
  int pageNumber;
  int pageSize;
  String? orderBy;
  bool ascending;

  ProductFilterDto({
    this.searchTerm,
    this.inStockOnly,
    this.stockFilter,
    this.minPrice,
    this.maxPrice,
    this.pageNumber = 1,
    this.pageSize = 10,
    this.orderBy = 'name',
    this.ascending = true,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'pageNumber': pageNumber,
      'pageSize': pageSize,
    };
    if (searchTerm != null && searchTerm!.trim().isNotEmpty) {
      params['searchTerm'] = searchTerm!.trim();
    }
    if (stockFilter != null) {
      params['stockFilter'] = stockFilter;
    } else if (inStockOnly != null) {
      params['inStockOnly'] = inStockOnly;
    }
    if (minPrice != null && minPrice! > 0) {
      params['minPrice'] = minPrice;
    }
    if (maxPrice != null && maxPrice! > 0) {
      params['maxPrice'] = maxPrice;
    }
    if (orderBy != null && orderBy!.isNotEmpty) {
      params['orderBy'] = orderBy;
      params['ascending'] = ascending;
    }
    return params;
  }
}
