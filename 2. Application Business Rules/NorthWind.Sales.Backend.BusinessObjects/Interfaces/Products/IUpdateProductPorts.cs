namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Products;

public interface IUpdateProductInputPort
{
    Task Handle(UpdateProductDto dto);
}

public interface IUpdateProductOutputPort
{
    Task Handle(ProductDto product);
}
