namespace NorthWind.Sales.Backend.UseCases.Customers;

internal class CreateCustomerInteractor(
    ICreateCustomerOutputPort outputPort,
    ICommandsRepository repository,
    IQueriesRepository queriesRepository,
    IModelValidatorHub<CreateCustomerDto> modelValidatorHub,
    IDomainLogger domainLogger,
    IUserService userService) : ICreateCustomerInputPort
{
    public async Task Handle(CreateCustomerDto dto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub, dto);

        if (await queriesRepository.CustomerExists(dto.Id))
        {
            throw new ValidationException(new[]
            {
                new ValidationError("Id", string.Format(CustomerUseCasesMessages.CustomerIdAlreadyExists, dto.Id))
            });
        }

        var createdCustomer = await repository.CreateCustomer(dto);
        await repository.SaveChanges();

        await domainLogger.LogInformation(
            new DomainLog(
                string.Format(CustomerUseCasesMessages.CustomerCreatedTemplate, createdCustomer.Name, createdCustomer.Id),
                userService.UserName));

        await outputPort.Handle(createdCustomer);
    }
}
