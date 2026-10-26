import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_orders_repository.dart';

class CreateOrderUseCase {
  final IOrdersRepository _repository;

  CreateOrderUseCase(this._repository);

  Future<CreateOrderResultDto> execute(CreateOrderDto dto) {
    return _repository.createOrder(dto);
  }
}
