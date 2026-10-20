namespace NorthWind.Sales.Backend.UseCases.Services;

public class InvoicePricingService : IInvoicePricingService
{
    private const decimal TaxRate = 0.15m;

    public decimal CalculateTax(decimal subTotal)
    {
        return Math.Round(subTotal * TaxRate, 2);
    }

    public string GenerateInvoiceNumber(int lastId)
    {
        return $"FAC-{(lastId + 1):D6}";
    }
}
