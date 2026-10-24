namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Products;

public interface IGetProductsInputPort
{
    Task Handle(ProductFilterDto filter);
}

public interface IGetProductsOutputPort
{
    Task Handle(PagedResultDto<ProductDto> products);
}
