namespace NorthWind.Sales.Backend.Repositories.Interfaces;

public interface INorthWindSalesCommandsDataContext
{
    Task AddOrderAsync(Order order);
    Task AddOrderDetailsAsync(IEnumerable<Entities.OrderDetail> orderDetails);
    Task AddProductAsync(Entities.Product product);
    void UpdateProduct(Entities.Product product);
    void RemoveProduct(Entities.Product product);
    Task<Entities.Product> FindProductAsync(int id);
    Task AddCustomerAsync(Entities.Customer customer);
    void UpdateCustomer(Entities.Customer customer);
    void RemoveCustomer(Entities.Customer customer);
    Task<Entities.Customer> FindCustomerAsync(string id);
    Task AddInvoiceAsync(Entities.Invoice invoice);
    Task SaveChangesAsync();
}
