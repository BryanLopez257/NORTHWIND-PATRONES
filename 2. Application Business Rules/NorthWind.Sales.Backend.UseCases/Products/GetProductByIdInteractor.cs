namespace NorthWind.Sales.Backend.UseCases.Products;

internal class GetProductByIdInteractor(
    IGetProductByIdOutputPort outputPort,
    IQueriesRepository repository) : IGetProductByIdInputPort
{
    public async Task Handle(int id)
    {
        var product = await repository.GetProductById(id);
        await outputPort.Handle(product);
    }
}
