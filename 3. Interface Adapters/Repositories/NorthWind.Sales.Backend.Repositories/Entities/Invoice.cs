namespace NorthWind.Sales.Backend.Repositories.Entities;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;

    // Snapshots de Auditoría Pro (Inmutables)
    public string CustomerDocumentSnapshot { get; set; } = string.Empty;
    public string CustomerFullNameSnapshot { get; set; } = string.Empty;
    public string CustomerAddressSnapshot { get; set; } = string.Empty;
    public string CustomerPhoneSnapshot { get; set; } = string.Empty;
    public string CustomerEmailSnapshot { get; set; } = string.Empty;
    public string SellerFullNameSnapshot { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public virtual Customer Customer { get; set; }
    public virtual ICollection<InvoiceDetail> Details { get; set; } = new List<InvoiceDetail>();
}
