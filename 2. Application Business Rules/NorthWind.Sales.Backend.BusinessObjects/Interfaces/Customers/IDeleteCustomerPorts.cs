namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Customers;

public interface IDeleteCustomerInputPort
{
    Task Handle(string id);
}

public interface IDeleteCustomerOutputPort
{
    Task Handle(bool success);
}
