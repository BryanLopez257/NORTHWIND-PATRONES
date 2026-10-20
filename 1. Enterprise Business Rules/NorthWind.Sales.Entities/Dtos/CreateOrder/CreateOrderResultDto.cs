using NorthWind.Sales.Entities.Dtos.Invoices;

namespace NorthWind.Sales.Entities.Dtos.CreateOrder;

public class CreateOrderResultDto
{
    public int OrderId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public InvoiceResponseDto Invoice { get; set; }

    public CreateOrderResultDto() { }

    public CreateOrderResultDto(int orderId, string invoiceNumber, InvoiceResponseDto invoice)
    {
        OrderId = orderId;
        InvoiceNumber = invoiceNumber;
        Invoice = invoice;
    }

    public static implicit operator int(CreateOrderResultDto result) => result?.OrderId ?? 0;
}
