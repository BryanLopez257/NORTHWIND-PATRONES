namespace NorthWind.Sales.Backend.UseCases.Customers;

internal class GetCustomerByIdInteractor(
    IGetCustomerByIdOutputPort outputPort,
    IQueriesRepository repository) : IGetCustomerByIdInputPort
{
    public async Task Handle(string id)
    {
        var customer = await repository.GetCustomerById(id);
        await outputPort.Handle(customer);
    }
}
