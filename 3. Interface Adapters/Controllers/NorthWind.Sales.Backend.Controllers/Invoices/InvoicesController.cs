#nullable enable
namespace Microsoft.AspNetCore.Builder;

public static class InvoicesController
{
    public static WebApplication UseInvoicesController(this WebApplication app)
    {
        app.MapGet(Endpoints.Invoices, GetInvoices)
           .RequireAuthorization();

        app.MapGet($"{Endpoints.Invoices}/{{id:int}}", GetInvoiceById)
           .RequireAuthorization();

        app.MapPost(Endpoints.Invoices, CreateInvoice)
           .RequireAuthorization();

        return app;
    }

    private static async Task<IResult> GetInvoices(
        string? searchTerm,
        string? invoiceNumber,
        string? customerName,
        IGetInvoicesInputPort inputPort,
        GetInvoicesPresenter presenter)
    {
        var filter = new InvoiceFilterDto
        {
            SearchTerm = searchTerm,
            InvoiceNumber = invoiceNumber,
            CustomerName = customerName
        };

        await inputPort.Handle(filter);
        return Results.Ok(presenter.Invoices);
    }

    private static async Task<IResult> GetInvoiceById(
        int id,
        IGetInvoiceByIdInputPort inputPort,
        GetInvoiceByIdPresenter presenter)
    {
        await inputPort.Handle(id);
        return presenter.Invoice is not null ? Results.Ok(presenter.Invoice) : Results.NotFound();
    }

    private static async Task<IResult> CreateInvoice(
        CreateInvoiceDto dto,
        ICreateInvoiceInputPort inputPort,
        CreateInvoicePresenter presenter)
    {
        await inputPort.Handle(dto);
        return Results.Ok(presenter.Invoice);
    }
}
