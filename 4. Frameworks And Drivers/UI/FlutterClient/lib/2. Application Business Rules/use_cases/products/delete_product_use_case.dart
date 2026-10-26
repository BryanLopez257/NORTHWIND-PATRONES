import 'package:northwind/2. Application Business Rules/ports/i_products_repository.dart';

class DeleteProductUseCase {
  final IProductsRepository _repository;

  DeleteProductUseCase(this._repository);

  Future<bool> execute(int id) {
    return _repository.deleteProduct(id);
  }
}
