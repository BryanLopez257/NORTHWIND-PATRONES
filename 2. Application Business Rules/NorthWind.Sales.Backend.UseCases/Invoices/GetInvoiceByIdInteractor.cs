namespace NorthWind.Sales.Backend.UseCases.Invoices;

internal class GetInvoiceByIdInteractor(
    IGetInvoiceByIdOutputPort outputPort,
    IQueriesRepository queriesRepository,
    IUserService userService) : IGetInvoiceByIdInputPort
{
    public async Task Handle(int id)
    {
        GuardUser.AgainstUnauthenticated(userService);
        var invoice = await queriesRepository.GetInvoiceById(id);
        await outputPort.Handle(invoice);
    }
}
