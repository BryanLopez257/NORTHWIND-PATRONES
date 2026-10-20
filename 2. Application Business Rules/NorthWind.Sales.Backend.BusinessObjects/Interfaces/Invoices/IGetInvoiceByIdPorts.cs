namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Invoices;

public interface IGetInvoiceByIdInputPort
{
    Task Handle(int id);
}

public interface IGetInvoiceByIdOutputPort
{
    Task Handle(InvoiceResponseDto invoice);
}
