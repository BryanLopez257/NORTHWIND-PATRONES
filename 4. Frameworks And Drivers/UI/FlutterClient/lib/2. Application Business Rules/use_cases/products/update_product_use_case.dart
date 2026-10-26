import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';
import 'package:northwind/2. Application Business Rules/ports/i_products_repository.dart';

class UpdateProductUseCase {
  final IProductsRepository _repository;

  UpdateProductUseCase(this._repository);

  Future<bool> execute(UpdateProductDto dto) {
    return _repository.updateProduct(dto);
  }
}
