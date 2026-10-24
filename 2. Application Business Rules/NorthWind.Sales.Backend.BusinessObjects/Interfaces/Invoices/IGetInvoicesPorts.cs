namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Invoices;

public interface IGetInvoicesInputPort
{
    Task Handle(InvoiceFilterDto filter);
}

public interface IGetInvoicesOutputPort
{
    Task Handle(PagedResultDto<InvoiceResponseDto> invoices);
}
