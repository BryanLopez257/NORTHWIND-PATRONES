namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Customers;

public interface IGetCustomerByIdInputPort
{
    Task Handle(string id);
}

public interface IGetCustomerByIdOutputPort
{
    Task Handle(CustomerDto customer);
}
