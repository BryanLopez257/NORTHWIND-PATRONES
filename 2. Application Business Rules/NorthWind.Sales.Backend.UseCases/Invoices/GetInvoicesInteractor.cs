namespace NorthWind.Sales.Backend.UseCases.Invoices;

internal class GetInvoicesInteractor(
    IGetInvoicesOutputPort outputPort,
    IQueriesRepository queriesRepository,
    IUserService userService) : IGetInvoicesInputPort
{
    public async Task Handle(InvoiceFilterDto filter)
    {
        GuardUser.AgainstUnauthenticated(userService);
        var invoices = await queriesRepository.GetInvoices(filter);
        await outputPort.Handle(invoices);
    }
}
