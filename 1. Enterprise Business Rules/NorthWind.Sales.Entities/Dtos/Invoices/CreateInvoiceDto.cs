namespace NorthWind.Sales.Entities.Dtos.Invoices;

public class CreateInvoiceDto
{
    public CreateInvoiceDto() { }

    public CreateInvoiceDto(
        string customerId,
        IEnumerable<CreateInvoiceDetailDto> details,
        string customerAddress = null,
        string customerPhone = null,
        string customerEmail = null,
        string customerDocument = null)
    {
        CustomerId = customerId;
        CustomerDocument = customerDocument;
        Details = details?.ToList() ?? [];
        CustomerAddress = customerAddress;
        CustomerPhone = customerPhone;
        CustomerEmail = customerEmail;
    }

    public string CustomerId { get; set; }
    public string CustomerDocument { get; set; }
    public string CustomerAddress { get; set; }
    public string CustomerPhone { get; set; }
    public string CustomerEmail { get; set; }
    public List<CreateInvoiceDetailDto> Details { get; set; } = [];
}
