namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface IInvoicesGateway
{
    Task<InvoiceResponseDto> CreateInvoiceAsync(CreateInvoiceDto invoiceDto);
    Task<InvoiceResponseDto> GetInvoiceByIdAsync(int id);
    Task<IEnumerable<InvoiceResponseDto>> GetInvoicesAsync(InvoiceFilterDto filter);
}
