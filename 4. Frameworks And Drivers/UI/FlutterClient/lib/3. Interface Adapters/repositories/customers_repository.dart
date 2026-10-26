import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../../4. Frameworks And Drivers/network/api_client.dart';
import '../../4. Frameworks And Drivers/network/endpoints.dart';

class CustomersRepository implements ICustomersRepository {
  @override
  Future<PagedResult<CustomerDto>> getCustomers(CustomerFilterDto filter) async {
    final response = await ApiClient.get(
      Endpoints.customers,
      queryParams: filter.toQueryParams(),
    );

    if (response is Map<String, dynamic>) {
      return PagedResult.fromJson(response, (item) => CustomerDto.fromJson(item as Map<String, dynamic>));
    } else if (response is List) {
      final items = response.map((item) => CustomerDto.fromJson(item as Map<String, dynamic>)).toList();
      return PagedResult(
        items: items,
        totalCount: items.length,
        pageNumber: filter.pageNumber,
        pageSize: filter.pageSize,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      );
    }
    return PagedResult.empty();
  }

  @override
  Future<CustomerDto?> getCustomerById(String id) async {
    try {
      final response = await ApiClient.get(Endpoints.customerById(id));
      if (response != null && response is Map<String, dynamic>) {
        return CustomerDto.fromJson(response);
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  @override
  Future<bool> createCustomer(CreateCustomerDto dto) async {
    await ApiClient.post(Endpoints.createCustomer, dto.toJson());
    return true;
  }

  @override
  Future<bool> updateCustomer(UpdateCustomerDto dto) async {
    await ApiClient.put(Endpoints.updateCustomer, dto.toJson());
    return true;
  }

  @override
  Future<bool> deleteCustomer(String id) async {
    await ApiClient.delete('${Endpoints.deleteCustomer}/$id');
    return true;
  }
}
