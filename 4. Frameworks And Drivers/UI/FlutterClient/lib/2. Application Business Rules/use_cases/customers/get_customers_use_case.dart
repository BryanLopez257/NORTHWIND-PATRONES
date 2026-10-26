import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_customers_repository.dart';

class GetCustomersUseCase {
  final ICustomersRepository _repository;

  GetCustomersUseCase(this._repository);

  Future<PagedResult<CustomerDto>> execute(CustomerFilterDto filter) {
    return _repository.getCustomers(filter);
  }
}
