namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Products;

public interface IDeleteProductInputPort
{
    Task Handle(int id);
}

public interface IDeleteProductOutputPort
{
    Task Handle(bool success);
}
