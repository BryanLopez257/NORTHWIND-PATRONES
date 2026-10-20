namespace NorthWind.Sales.Backend.Repositories.Entities;

public class InvoiceDetail
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int ProductId { get; set; }

    // Snapshot del producto
    public string ProductNameSnapshot { get; set; } = string.Empty;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public virtual Invoice Invoice { get; set; }
    public virtual Product Product { get; set; }
}
