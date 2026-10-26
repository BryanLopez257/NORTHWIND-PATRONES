import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_products_repository.dart';

class CreateProductUseCase {
  final IProductsRepository _repository;

  CreateProductUseCase(this._repository);

  Future<bool> execute(CreateProductDto dto) {
    return _repository.createProduct(dto);
  }
}
