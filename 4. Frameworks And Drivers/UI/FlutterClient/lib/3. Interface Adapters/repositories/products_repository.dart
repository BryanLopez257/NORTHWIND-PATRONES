import '../../1. Enterprise Business Rules/enterprise_business_rules.dart';
import '../../2. Application Business Rules/application_business_rules.dart';
import '../../4. Frameworks And Drivers/network/api_client.dart';
import '../../4. Frameworks And Drivers/network/endpoints.dart';

class ProductsRepository implements IProductsRepository {
  @override
  Future<PagedResult<ProductDto>> getProducts(ProductFilterDto filter) async {
    final response = await ApiClient.get(
      Endpoints.products,
      queryParams: filter.toQueryParams(),
    );

    if (response is Map<String, dynamic>) {
      return PagedResult.fromJson(response, (item) => ProductDto.fromJson(item as Map<String, dynamic>));
    } else if (response is List) {
      final items = response.map((item) => ProductDto.fromJson(item as Map<String, dynamic>)).toList();
      return PagedResult(
        items: items,
        totalCount: items.length,
        pageNumber: filter.pageNumber,
        pageSize: filter.pageSize,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      );
    }
    return PagedResult.empty();
  }

  @override
  Future<ProductDto?> getProductById(int id) async {
    try {
      final response = await ApiClient.get(Endpoints.productById(id));
      if (response != null && response is Map<String, dynamic>) {
        return ProductDto.fromJson(response);
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  @override
  Future<bool> createProduct(CreateProductDto dto) async {
    await ApiClient.post(Endpoints.createProduct, dto.toJson());
    return true;
  }

  @override
  Future<bool> updateProduct(UpdateProductDto dto) async {
    await ApiClient.put(Endpoints.updateProduct, dto.toJson());
    return true;
  }

  @override
  Future<bool> deleteProduct(int id) async {
    await ApiClient.delete('${Endpoints.deleteProduct}/$id');
    return true;
  }
}
