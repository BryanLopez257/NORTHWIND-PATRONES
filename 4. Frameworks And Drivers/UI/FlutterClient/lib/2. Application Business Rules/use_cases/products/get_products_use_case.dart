import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_products_repository.dart';

class GetProductsUseCase {
  final IProductsRepository _repository;

  GetProductsUseCase(this._repository);

  Future<PagedResult<ProductDto>> execute(ProductFilterDto filter) {
    return _repository.getProducts(filter);
  }
}
