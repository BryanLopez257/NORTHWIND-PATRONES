import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_customers_repository.dart';

class CreateCustomerUseCase {
  final ICustomersRepository _repository;

  CreateCustomerUseCase(this._repository);

  Future<bool> execute(CreateCustomerDto dto) {
    return _repository.createCustomer(dto);
  }
}
