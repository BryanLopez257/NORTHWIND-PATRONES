import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../../4. Frameworks And Drivers/network/api_client.dart';
import '../../4. Frameworks And Drivers/network/endpoints.dart';

class InvoicesRepository implements IInvoicesRepository {
  @override
  Future<PagedResult<InvoiceResponseDto>> getInvoices(InvoiceFilterDto filter) async {
    final response = await ApiClient.get(
      Endpoints.invoices,
      queryParams: filter.toQueryParams(),
    );

    if (response is Map<String, dynamic>) {
      return PagedResult.fromJson(
        response,
        (item) => InvoiceResponseDto.fromJson(item as Map<String, dynamic>),
      );
    } else if (response is List) {
      final items = response
          .map((item) => InvoiceResponseDto.fromJson(item as Map<String, dynamic>))
          .toList();
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
  Future<InvoiceResponseDto?> getInvoiceById(int id) async {
    try {
      final response = await ApiClient.get(Endpoints.invoiceById(id));
      if (response != null && response is Map<String, dynamic>) {
        return InvoiceResponseDto.fromJson(response);
      }
    } catch (_) {
      return null;
    }
    return null;
  }
}
