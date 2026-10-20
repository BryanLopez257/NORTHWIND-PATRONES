namespace NorthWind.Sales.Backend.UseCases.Products;

internal class GetProductsInteractor(
    IGetProductsOutputPort outputPort,
    IQueriesRepository repository) : IGetProductsInputPort
{
    public async Task Handle(ProductFilterDto filter)
    {
        var products = await repository.GetProducts(filter);
        await outputPort.Handle(products);
    }
}
