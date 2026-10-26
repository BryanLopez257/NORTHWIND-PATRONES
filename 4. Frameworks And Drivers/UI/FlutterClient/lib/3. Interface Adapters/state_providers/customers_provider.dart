import 'package:flutter/foundation.dart';
import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../repositories/customers_repository.dart';

class CustomersProvider extends ChangeNotifier {
  final GetCustomersUseCase _getCustomersUseCase;
  final CreateCustomerUseCase _createCustomerUseCase;
  final UpdateCustomerUseCase _updateCustomerUseCase;

  PagedResult<CustomerDto> _pagedResult = PagedResult.empty();
  final CustomerFilterDto _filter = CustomerFilterDto();
  bool _isLoading = false;
  String? _errorMessage;

  CustomersProvider({
    GetCustomersUseCase? getCustomersUseCase,
    CreateCustomerUseCase? createCustomerUseCase,
    UpdateCustomerUseCase? updateCustomerUseCase,
  })  : _getCustomersUseCase = getCustomersUseCase ?? GetCustomersUseCase(CustomersRepository()),
        _createCustomerUseCase = createCustomerUseCase ?? CreateCustomerUseCase(CustomersRepository()),
        _updateCustomerUseCase = updateCustomerUseCase ?? UpdateCustomerUseCase(CustomersRepository());

  List<CustomerDto> get customers => _pagedResult.items;
  PagedResult<CustomerDto> get pagedResult => _pagedResult;
  CustomerFilterDto get filter => _filter;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadCustomers() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _pagedResult = await _getCustomersUseCase.execute(_filter);
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setSearchTerm(String term) {
    _filter.searchTerm = term.trim().isEmpty ? null : term.trim();
    _filter.pageNumber = 1;
    loadCustomers();
  }

  void setCustomerType(int? type) {
    _filter.customerType = type;
    _filter.pageNumber = 1;
    loadCustomers();
  }

  void setBalanceFilter(int? balance) {
    _filter.balanceFilter = balance ?? 0;
    _filter.pageNumber = 1;
    loadCustomers();
  }

  void setPage(int page) {
    if (page < 1 || (page > _pagedResult.totalPages && _pagedResult.totalPages > 0)) return;
    _filter.pageNumber = page;
    loadCustomers();
  }

  void setPageSize(int size) {
    _filter.pageSize = size;
    _filter.pageNumber = 1;
    loadCustomers();
  }

  Future<bool> createCustomer(CreateCustomerDto dto) async {
    try {
      final success = await _createCustomerUseCase.execute(dto);
      if (success) {
        await loadCustomers();
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      rethrow;
    }
  }

  Future<bool> updateCustomer(UpdateCustomerDto dto) async {
    try {
      final success = await _updateCustomerUseCase.execute(dto);
      if (success) {
        await loadCustomers();
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      rethrow;
    }
  }
}
