namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Products;

public interface IGetProductByIdInputPort
{
    Task Handle(int id);
}

public interface IGetProductByIdOutputPort
{
    Task Handle(ProductDto product);
}
