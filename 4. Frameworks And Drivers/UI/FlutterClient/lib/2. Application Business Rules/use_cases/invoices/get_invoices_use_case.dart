import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_invoices_repository.dart';

class GetInvoicesUseCase {
  final IInvoicesRepository _repository;

  GetInvoicesUseCase(this._repository);

  Future<PagedResult<InvoiceResponseDto>> execute(InvoiceFilterDto filter) {
    return _repository.getInvoices(filter);
  }
}
