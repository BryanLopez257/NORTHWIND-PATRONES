namespace NorthWind.Sales.Backend.UseCases.Customers;

internal class UpdateCustomerInteractor(
    IUpdateCustomerOutputPort outputPort,
    ICommandsRepository repository,
    IQueriesRepository queriesRepository,
    IModelValidatorHub<UpdateCustomerDto> modelValidatorHub,
    IDomainLogger domainLogger,
    IUserService userService) : IUpdateCustomerInputPort
{
    public async Task Handle(UpdateCustomerDto dto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub, dto);

        if (!await queriesRepository.CustomerExists(dto.Id))
        {
            throw new ValidationException(new[] { new ValidationError("Id", CustomerUseCasesMessages.CustomerNotFound) });
        }

        var updatedCustomer = await repository.UpdateCustomer(dto);
        await repository.SaveChanges();

        await domainLogger.LogInformation(
            new DomainLog(
                string.Format(CustomerUseCasesMessages.CustomerUpdatedTemplate, updatedCustomer.Name, updatedCustomer.Id),
                userService.UserName));

        await outputPort.Handle(updatedCustomer);
    }
}
