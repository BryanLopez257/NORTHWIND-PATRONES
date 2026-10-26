import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_customers_repository.dart';

class GetCustomerByIdUseCase {
  final ICustomersRepository _repository;

  GetCustomerByIdUseCase(this._repository);

  Future<CustomerDto?> execute(String id) {
    return _repository.getCustomerById(id);
  }
}
