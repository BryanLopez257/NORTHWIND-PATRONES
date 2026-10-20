namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Products;

public interface ICreateProductInputPort
{
    Task Handle(CreateProductDto dto);
}

public interface ICreateProductOutputPort
{
    Task Handle(ProductDto product);
}
