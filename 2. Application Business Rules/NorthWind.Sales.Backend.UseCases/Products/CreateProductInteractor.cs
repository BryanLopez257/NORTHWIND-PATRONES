namespace NorthWind.Sales.Backend.UseCases.Products;

internal class CreateProductInteractor(
    ICreateProductOutputPort outputPort,
    ICommandsRepository repository,
    IModelValidatorHub<CreateProductDto> modelValidatorHub,
    IDomainLogger domainLogger,
    IUserService userService) : ICreateProductInputPort
{
    public async Task Handle(CreateProductDto dto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub, dto);

        var createdProduct = await repository.CreateProduct(dto);
        await repository.SaveChanges();

        await domainLogger.LogInformation(
            new DomainLog(
                string.Format(ProductUseCasesMessages.ProductCreatedTemplate, createdProduct.Name, createdProduct.Id),
                userService.UserName));

        await outputPort.Handle(createdProduct);
    }
}
