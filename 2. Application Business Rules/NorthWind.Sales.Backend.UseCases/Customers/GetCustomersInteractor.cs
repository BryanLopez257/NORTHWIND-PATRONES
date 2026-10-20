namespace NorthWind.Sales.Backend.UseCases.Customers;

internal class GetCustomersInteractor(
    IGetCustomersOutputPort outputPort,
    IQueriesRepository repository) : IGetCustomersInputPort
{
    public async Task Handle(CustomerFilterDto filter)
    {
        var customers = await repository.GetCustomers(filter);
        await outputPort.Handle(customers);
    }
}
