import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';

abstract class IOrdersRepository {
  Future<CreateOrderResultDto> createOrder(CreateOrderDto dto);
}
