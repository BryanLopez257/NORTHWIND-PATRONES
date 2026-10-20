namespace NorthWind.Sales.Backend.UseCases.Products;

internal class UpdateProductInteractor(
    IUpdateProductOutputPort outputPort,
    ICommandsRepository repository,
    IQueriesRepository queriesRepository,
    IModelValidatorHub<UpdateProductDto> modelValidatorHub,
    IDomainLogger domainLogger,
    IUserService userService) : IUpdateProductInputPort
{
    public async Task Handle(UpdateProductDto dto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub, dto);

        var existing = await queriesRepository.GetProductById(dto.Id);
        if (existing == null)
        {
            throw new ValidationException(new[] { new ValidationError("Id", ProductUseCasesMessages.ProductNotFound) });
        }

        var updatedProduct = await repository.UpdateProduct(dto);
        await repository.SaveChanges();

        await domainLogger.LogInformation(
            new DomainLog(
                string.Format(ProductUseCasesMessages.ProductUpdatedTemplate, updatedProduct.Name, updatedProduct.Id),
                userService.UserName));

        await outputPort.Handle(updatedProduct);
    }
}
