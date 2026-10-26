import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_invoices_repository.dart';

class GetInvoiceByIdUseCase {
  final IInvoicesRepository _repository;

  GetInvoiceByIdUseCase(this._repository);

  Future<InvoiceResponseDto?> execute(int id) {
    return _repository.getInvoiceById(id);
  }
}
