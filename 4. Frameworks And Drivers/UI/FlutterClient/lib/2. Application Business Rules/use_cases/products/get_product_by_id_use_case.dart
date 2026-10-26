import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_products_repository.dart';

class GetProductByIdUseCase {
  final IProductsRepository _repository;

  GetProductByIdUseCase(this._repository);

  Future<ProductDto?> execute(int id) {
    return _repository.getProductById(id);
  }
}
