namespace NorthWind.Sales.Backend.Repositories.Interfaces;

public interface INorthWindSalesQueriesDataContext
{
    IQueryable<Customer> Customers { get; }
    IQueryable<Product> Products { get; }
    IQueryable<Order> Orders { get; }
    IQueryable<Entities.OrderDetail> OrderDetails { get; }
    IQueryable<Entities.Invoice> Invoices { get; }
    IQueryable<Entities.InvoiceDetail> InvoiceDetails { get; }
    Task<ReturnType> FirstOrDefaultAync<ReturnType>(IQueryable<ReturnType> queryable);
    Task<ReturnType> FirstOrDefaultAsync<ReturnType>(IQueryable<ReturnType> queryable);
    Task<IEnumerable<ReturnType>> ToListAsync<ReturnType>(IQueryable<ReturnType> queryable);
    Task<bool> AnyAsync<ReturnType>(IQueryable<ReturnType> queryable);
    Task<int> CountAsync<ReturnType>(IQueryable<ReturnType> queryable);
}
