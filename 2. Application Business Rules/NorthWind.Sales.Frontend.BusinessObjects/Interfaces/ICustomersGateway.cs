namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface ICustomersGateway
{
    Task<IEnumerable<CustomerDto>> GetCustomersAsync(CustomerFilterDto filter);
    Task<CustomerDto> GetCustomerByIdAsync(string id);
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto customer);
    Task<CustomerDto> UpdateCustomerAsync(UpdateCustomerDto customer);
    Task<bool> DeleteCustomerAsync(string id);
}
