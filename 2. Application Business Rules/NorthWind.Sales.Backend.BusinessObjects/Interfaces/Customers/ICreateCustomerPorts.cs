namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Customers;

public interface ICreateCustomerInputPort
{
    Task Handle(CreateCustomerDto dto);
}

public interface ICreateCustomerOutputPort
{
    Task Handle(CustomerDto customer);
}
