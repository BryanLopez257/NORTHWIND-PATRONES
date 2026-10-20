namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Invoices;

public interface IInvoicePricingService
{
    decimal CalculateTax(decimal subTotal);
    string GenerateInvoiceNumber(int lastId);
}
