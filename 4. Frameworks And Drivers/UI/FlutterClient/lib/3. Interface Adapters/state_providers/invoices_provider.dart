import 'package:flutter/foundation.dart';
import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../repositories/invoices_repository.dart';

class InvoicesProvider extends ChangeNotifier {
  final GetInvoicesUseCase _getInvoicesUseCase;
  final GetInvoiceByIdUseCase _getInvoiceByIdUseCase;

  PagedResult<InvoiceResponseDto> _pagedResult = PagedResult.empty();
  final InvoiceFilterDto _filter = InvoiceFilterDto();
  String _criteria = 'all'; // 'all', 'invoiceNumber', 'customer'
  bool _isLoading = false;
  String? _errorMessage;

  InvoicesProvider({
    GetInvoicesUseCase? getInvoicesUseCase,
    GetInvoiceByIdUseCase? getInvoiceByIdUseCase,
  })  : _getInvoicesUseCase = getInvoicesUseCase ?? GetInvoicesUseCase(InvoicesRepository()),
        _getInvoiceByIdUseCase = getInvoiceByIdUseCase ?? GetInvoiceByIdUseCase(InvoicesRepository());

  List<InvoiceResponseDto> get invoices => _pagedResult.items;
  PagedResult<InvoiceResponseDto> get pagedResult => _pagedResult;
  InvoiceFilterDto get filter => _filter;
  String get criteria => _criteria;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadInvoices() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _pagedResult = await _getInvoicesUseCase.execute(_filter);
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCriteria(String criteria) {
    _criteria = criteria;
    final term = _filter.searchTerm ?? _filter.invoiceNumber ?? _filter.customerName;
    _filter.searchTerm = null;
    _filter.invoiceNumber = null;
    _filter.customerName = null;

    if (term != null && term.trim().isNotEmpty) {
      if (criteria == 'invoiceNumber') {
        _filter.invoiceNumber = term;
      } else if (criteria == 'customer') {
        _filter.customerName = term;
      } else {
        _filter.searchTerm = term;
      }
    }
    _filter.pageNumber = 1;
    loadInvoices();
  }

  void setSearchTerm(String term) {
    final clean = term.trim();
    _filter.searchTerm = null;
    _filter.invoiceNumber = null;
    _filter.customerName = null;

    if (clean.isNotEmpty) {
      if (_criteria == 'invoiceNumber') {
        _filter.invoiceNumber = clean;
      } else if (_criteria == 'customer') {
        _filter.customerName = clean;
      } else {
        _filter.searchTerm = clean;
      }
    }
    _filter.pageNumber = 1;
    loadInvoices();
  }

  void setPage(int page) {
    if (page < 1 || (page > _pagedResult.totalPages && _pagedResult.totalPages > 0)) return;
    _filter.pageNumber = page;
    loadInvoices();
  }

  void setPageSize(int size) {
    _filter.pageSize = size;
    _filter.pageNumber = 1;
    loadInvoices();
  }

  Future<InvoiceResponseDto?> getInvoiceById(int id) async {
    return _getInvoiceByIdUseCase.execute(id);
  }
}
