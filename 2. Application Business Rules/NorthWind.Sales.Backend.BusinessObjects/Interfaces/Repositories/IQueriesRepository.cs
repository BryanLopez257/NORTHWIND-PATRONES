namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;

public interface IQueriesRepository
{
    Task<decimal?> GetCustomerCurrentBalance(string customerId);
    Task<IEnumerable<ProductUnitsInStock>> GetProductsUnitsInStock(IEnumerable<int> productIds);
    Task<IEnumerable<ProductDto>> GetProducts(ProductFilterDto filter);
    Task<ProductDto> GetProductById(int id);
    Task<bool> ProductHasOrders(int productId);
    Task<IEnumerable<CustomerDto>> GetCustomers(CustomerFilterDto filter);
    Task<CustomerDto> GetCustomerById(string id);
    Task<bool> CustomerExists(string customerId);
    Task<bool> CustomerHasOrders(string customerId);
    Task<InvoiceResponseDto> GetInvoiceById(int id);
    Task<IEnumerable<InvoiceResponseDto>> GetInvoices(InvoiceFilterDto filter);
    Task<int> GetLastInvoiceId();
}
