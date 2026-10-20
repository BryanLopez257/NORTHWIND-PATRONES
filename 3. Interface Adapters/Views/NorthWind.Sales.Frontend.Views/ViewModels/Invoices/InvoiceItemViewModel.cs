namespace NorthWind.Sales.Frontend.Views.ViewModels.Invoices;

public class InvoiceItemViewModel
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; } = 1;
    public short AvailableStock { get; set; }
    public decimal SubTotal => Quantity * UnitPrice;
}
