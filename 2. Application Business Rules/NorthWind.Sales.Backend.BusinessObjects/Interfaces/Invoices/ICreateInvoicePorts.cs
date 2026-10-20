namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Invoices;

public interface ICreateInvoiceInputPort
{
    Task Handle(CreateInvoiceDto dto);
}

public interface ICreateInvoiceOutputPort
{
    Task Handle(InvoiceResponseDto invoice);
}
