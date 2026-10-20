namespace NorthWind.Sales.Backend.UseCases.Products;

internal class DeleteProductInteractor(
    IDeleteProductOutputPort outputPort,
    ICommandsRepository repository,
    IQueriesRepository queriesRepository,
    IDomainLogger domainLogger,
    IUserService userService) : IDeleteProductInputPort
{
    public async Task Handle(int id)
    {
        GuardUser.AgainstUnauthenticated(userService);

        var existing = await queriesRepository.GetProductById(id);
        if (existing == null)
        {
            throw new ValidationException(new[] { new ValidationError("Id", ProductUseCasesMessages.ProductNotFound) });
        }

        if (await queriesRepository.ProductHasOrders(id))
        {
            throw new ValidationException(new[] { new ValidationError("Id", ProductUseCasesMessages.ProductHasOrdersCannotDelete) });
        }

        await repository.DeleteProduct(id);
        await repository.SaveChanges();

        await domainLogger.LogInformation(
            new DomainLog(
                string.Format(ProductUseCasesMessages.ProductDeletedTemplate, id),
                userService.UserName));

        await outputPort.Handle(true);
    }
}
