namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Customers;

public interface IGetCustomersInputPort
{
    Task Handle(CustomerFilterDto filter);
}

public interface IGetCustomersOutputPort
{
    Task Handle(PagedResultDto<CustomerDto> customers);
}
