namespace NorthWind.Sales.Entities.Dtos.Invoices;

public class CreateInvoiceDetailDto
{
    public CreateInvoiceDetailDto() { }

    public CreateInvoiceDetailDto(int productId, int quantity)
    {
        ProductId = productId;
        Quantity = quantity;
    }

    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
