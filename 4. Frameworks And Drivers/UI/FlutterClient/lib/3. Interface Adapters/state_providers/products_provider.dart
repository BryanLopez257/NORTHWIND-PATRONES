import 'package:flutter/foundation.dart';
import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../repositories/products_repository.dart';

class ProductsProvider extends ChangeNotifier {
  final GetProductsUseCase _getProductsUseCase;
  final CreateProductUseCase _createProductUseCase;
  final UpdateProductUseCase _updateProductUseCase;
  final DeleteProductUseCase _deleteProductUseCase;

  PagedResult<ProductDto> _pagedResult = PagedResult.empty();
  final ProductFilterDto _filter = ProductFilterDto();
  bool _isLoading = false;
  String? _errorMessage;

  ProductsProvider({
    GetProductsUseCase? getProductsUseCase,
    CreateProductUseCase? createProductUseCase,
    UpdateProductUseCase? updateProductUseCase,
    DeleteProductUseCase? deleteProductUseCase,
  })  : _getProductsUseCase = getProductsUseCase ?? GetProductsUseCase(ProductsRepository()),
        _createProductUseCase = createProductUseCase ?? CreateProductUseCase(ProductsRepository()),
        _updateProductUseCase = updateProductUseCase ?? UpdateProductUseCase(ProductsRepository()),
        _deleteProductUseCase = deleteProductUseCase ?? DeleteProductUseCase(ProductsRepository());

  List<ProductDto> get products => _pagedResult.items;
  PagedResult<ProductDto> get pagedResult => _pagedResult;
  ProductFilterDto get filter => _filter;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadProducts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _pagedResult = await _getProductsUseCase.execute(_filter);
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
    loadProducts();
  }

  void setInStockOnly(bool? inStock) {
    _filter.inStockOnly = inStock;
    _filter.pageNumber = 1;
    loadProducts();
  }

  void setStockFilter(bool? inStock) {
    setInStockOnly(inStock);
  }

  void setPage(int page) {
    if (page < 1 || (page > _pagedResult.totalPages && _pagedResult.totalPages > 0)) return;
    _filter.pageNumber = page;
    loadProducts();
  }

  void setPageSize(int size) {
    _filter.pageSize = size;
    _filter.pageNumber = 1;
    loadProducts();
  }

  Future<bool> createProduct(CreateProductDto dto) async {
    try {
      final success = await _createProductUseCase.execute(dto);
      if (success) {
        await loadProducts();
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      rethrow;
    }
  }

  Future<bool> updateProduct(UpdateProductDto dto) async {
    try {
      final success = await _updateProductUseCase.execute(dto);
      if (success) {
        await loadProducts();
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      rethrow;
    }
  }

  Future<bool> deleteProduct(int id) async {
    try {
      final success = await _deleteProductUseCase.execute(id);
      if (success) {
        await loadProducts();
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
