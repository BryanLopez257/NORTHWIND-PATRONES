import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../../4. Frameworks And Drivers/network/api_client.dart';
import '../../4. Frameworks And Drivers/network/endpoints.dart';

class OrdersRepository implements IOrdersRepository {
  @override
  Future<CreateOrderResultDto> createOrder(CreateOrderDto dto) async {
    final response = await ApiClient.post(
      Endpoints.createOrder,
      dto.toJson(),
    );

    if (response is Map<String, dynamic>) {
      return CreateOrderResultDto.fromJson(response);
    }
    if (response is int) {
      return CreateOrderResultDto(
        orderId: response,
        invoiceNumber: 'FAC-$response',
      );
    }
    return CreateOrderResultDto(orderId: 0, invoiceNumber: '');
  }
}
