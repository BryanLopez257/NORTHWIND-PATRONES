namespace NorthWind.Sales.Entities.ValueObjects;

public class Endpoints
{
    public const string CreateOrder = $"/{nameof(CreateOrder)}";
    public const string Products = "/products";
    public const string Customers = "/customers";
    public const string Invoices = "/invoices";
}
