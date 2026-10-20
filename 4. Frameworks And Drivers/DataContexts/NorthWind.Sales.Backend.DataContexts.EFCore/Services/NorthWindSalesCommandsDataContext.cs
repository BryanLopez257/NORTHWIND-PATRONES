namespace NorthWind.Sales.Backend.DataContexts.EFCore.Services;

internal class NorthWindSalesCommandsDataContext(IOptions<DBOptions> dbOptions) :
    NorthWindSalesContext(dbOptions),
    INorthWindSalesCommandsDataContext
{
    public async Task AddOrderAsync(Order order)
    {
        await AddAsync(order);
    }

    public async Task AddOrderDetailsAsync(IEnumerable<Repositories.Entities.OrderDetail> orderDetails)
    {
        await AddRangeAsync(orderDetails);
    }

    public async Task AddProductAsync(Product product)
    {
        await AddAsync(product);
    }

    public void UpdateProduct(Product product)
    {
        Update(product);
    }

    public void RemoveProduct(Product product)
    {
        Remove(product);
    }

    public async Task<Product> FindProductAsync(int id)
    {
        return await Products.FindAsync(id);
    }

    public async Task AddCustomerAsync(Customer customer)
    {
        await AddAsync(customer);
    }

    public void UpdateCustomer(Customer customer)
    {
        Update(customer);
    }

    public void RemoveCustomer(Customer customer)
    {
        Remove(customer);
    }

    public async Task<Customer> FindCustomerAsync(string id)
    {
        return await Customers.FindAsync(id);
    }

    public async Task AddInvoiceAsync(Invoice invoice)
    {
        await AddAsync(invoice);
    }

    public async Task SaveChangesAsync()
    {
        await GuardDBContext.AgainstSaveChangesErrorAsync(this);
    }
}
