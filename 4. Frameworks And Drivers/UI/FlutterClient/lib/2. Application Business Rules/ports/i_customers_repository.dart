import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';

abstract class ICustomersRepository {
  Future<PagedResult<CustomerDto>> getCustomers(CustomerFilterDto filter);
  Future<CustomerDto?> getCustomerById(String id);
  Future<bool> createCustomer(CreateCustomerDto dto);
  Future<bool> updateCustomer(UpdateCustomerDto dto);
  Future<bool> deleteCustomer(String id);
}
