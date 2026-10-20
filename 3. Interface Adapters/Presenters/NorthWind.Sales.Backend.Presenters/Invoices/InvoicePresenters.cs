namespace NorthWind.Sales.Backend.Presenters.Invoices;

public class CreateInvoicePresenter : ICreateInvoiceOutputPort
{
    public InvoiceResponseDto Invoice { get; private set; }

    public Task Handle(InvoiceResponseDto invoice)
    {
        Invoice = invoice;
        return Task.CompletedTask;
    }
}

public class GetInvoiceByIdPresenter : IGetInvoiceByIdOutputPort
{
    public InvoiceResponseDto Invoice { get; private set; }

    public Task Handle(InvoiceResponseDto invoice)
    {
        Invoice = invoice;
        return Task.CompletedTask;
    }
}

public class GetInvoicesPresenter : IGetInvoicesOutputPort
{
    public IEnumerable<InvoiceResponseDto> Invoices { get; private set; }

    public Task Handle(IEnumerable<InvoiceResponseDto> invoices)
    {
        Invoices = invoices;
        return Task.CompletedTask;
    }
}
