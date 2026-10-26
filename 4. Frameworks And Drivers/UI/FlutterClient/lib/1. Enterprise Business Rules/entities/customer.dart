class CustomerDto {
  final String id;
  final String name;
  final double currentBalance;
  final String identification;
  final int customerType; // 1: Persona Natural, 2: Empresa
  final String? firstName;
  final String? secondName;
  final String? lastName;
  final String? secondLastName;
  final String? businessName;
  final String? tradeName;

  const CustomerDto({
    required this.id,
    required this.name,
    required this.currentBalance,
    required this.identification,
    required this.customerType,
    this.firstName,
    this.secondName,
    this.lastName,
    this.secondLastName,
    this.businessName,
    this.tradeName,
  });

  bool get isLegalEntity => customerType == 2;
  bool get hasDebt => currentBalance > 0;

  factory CustomerDto.fromJson(Map<String, dynamic> json) {
    int parsedType = 1;
    final rawType = json['customerType'];
    if (rawType is int) {
      parsedType = rawType;
    } else if (rawType is String) {
      if (rawType == 'Empresa' || rawType == '2') {
        parsedType = 2;
      }
    }

    return CustomerDto(
      id: (json['id'] ?? json['customerId'] ?? '') as String,
      name: (json['name'] ?? json['businessName'] ?? json['tradeName'] ?? '') as String,
      currentBalance: (json['currentBalance'] as num?)?.toDouble() ?? 0.0,
      identification: (json['identification'] ?? json['customerDocument'] ?? '') as String,
      customerType: parsedType,
      firstName: json['firstName'] as String?,
      secondName: json['secondName'] as String?,
      lastName: json['lastName'] as String?,
      secondLastName: json['secondLastName'] as String?,
      businessName: json['businessName'] as String?,
      tradeName: json['tradeName'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'currentBalance': currentBalance,
        'identification': identification,
        'customerType': customerType,
        'firstName': firstName,
        'secondName': secondName,
        'lastName': lastName,
        'secondLastName': secondLastName,
        'businessName': businessName,
        'tradeName': tradeName,
      };
}

class CreateCustomerDto {
  final String id;
  final String identification;
  final int customerType;
  final String? firstName;
  final String? secondName;
  final String? lastName;
  final String? secondLastName;
  final String? businessName;
  final String? tradeName;

  const CreateCustomerDto({
    required this.id,
    required this.identification,
    required this.customerType,
    this.firstName,
    this.secondName,
    this.lastName,
    this.secondLastName,
    this.businessName,
    this.tradeName,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'identification': identification,
        'customerType': customerType,
        'firstName': firstName,
        'secondName': secondName,
        'lastName': lastName,
        'secondLastName': secondLastName,
        'businessName': businessName,
        'tradeName': tradeName,
      };
}

class UpdateCustomerDto {
  final String id;
  final String identification;
  final int customerType;
  final String? firstName;
  final String? secondName;
  final String? lastName;
  final String? secondLastName;
  final String? businessName;
  final String? tradeName;

  const UpdateCustomerDto({
    required this.id,
    required this.identification,
    required this.customerType,
    this.firstName,
    this.secondName,
    this.lastName,
    this.secondLastName,
    this.businessName,
    this.tradeName,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'identification': identification,
        'customerType': customerType,
        'firstName': firstName,
        'secondName': secondName,
        'lastName': lastName,
        'secondLastName': secondLastName,
        'businessName': businessName,
        'tradeName': tradeName,
      };
}

class CustomerFilterDto {
  String? searchTerm;
  String? criteria;
  int? customerType;
  int? balanceFilter; // 0 = all, 1 = no debt, 2 = with debt
  int pageNumber;
  int pageSize;
  String? orderBy;
  bool ascending;

  CustomerFilterDto({
    this.searchTerm,
    this.criteria,
    this.customerType,
    this.balanceFilter = 0,
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
    if (criteria != null && criteria!.isNotEmpty && criteria != 'all') {
      params['criteria'] = criteria;
    }
    if (customerType != null && customerType! > 0) {
      params['customerType'] = customerType;
    }
    if (balanceFilter != null && balanceFilter! > 0) {
      params['balanceFilter'] = balanceFilter;
    }
    if (orderBy != null && orderBy!.isNotEmpty) {
      params['orderBy'] = orderBy;
      params['ascending'] = ascending;
    }
    return params;
  }
}
