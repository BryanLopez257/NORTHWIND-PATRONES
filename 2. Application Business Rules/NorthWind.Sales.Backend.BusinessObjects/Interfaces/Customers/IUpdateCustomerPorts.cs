namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Customers;

public interface IUpdateCustomerInputPort
{
    Task Handle(UpdateCustomerDto dto);
}

public interface IUpdateCustomerOutputPort
{
    Task Handle(CustomerDto customer);
}
