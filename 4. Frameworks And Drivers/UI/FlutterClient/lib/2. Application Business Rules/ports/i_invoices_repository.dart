import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';

abstract class IInvoicesRepository {
  Future<PagedResult<InvoiceResponseDto>> getInvoices(InvoiceFilterDto filter);
  Future<InvoiceResponseDto?> getInvoiceById(int id);
}
