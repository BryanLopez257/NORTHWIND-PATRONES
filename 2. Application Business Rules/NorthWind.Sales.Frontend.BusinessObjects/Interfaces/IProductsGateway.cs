namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface IProductsGateway
{
    Task<IEnumerable<ProductDto>> GetProductsAsync(ProductFilterDto filter);
    Task<ProductDto> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(CreateProductDto product);
    Task<ProductDto> UpdateProductAsync(UpdateProductDto product);
    Task<bool> DeleteProductAsync(int id);
}
