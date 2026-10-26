import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_customers_repository.dart';

class UpdateCustomerUseCase {
  final ICustomersRepository _repository;

  UpdateCustomerUseCase(this._repository);

  Future<bool> execute(UpdateCustomerDto dto) {
    return _repository.updateCustomer(dto);
  }
}
