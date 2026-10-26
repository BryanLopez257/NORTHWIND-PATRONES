import 'package:northwind/1. Enterprise Business Rules/enterprise_business_rules.dart';

abstract class IProductsRepository {
  Future<PagedResult<ProductDto>> getProducts(ProductFilterDto filter);
  Future<ProductDto?> getProductById(int id);
  Future<bool> createProduct(CreateProductDto dto);
  Future<bool> updateProduct(UpdateProductDto dto);
  Future<bool> deleteProduct(int id);
}
