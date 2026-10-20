namespace NorthWind.Sales.Backend.UseCases.Customers;

internal class DeleteCustomerInteractor(
    IDeleteCustomerOutputPort outputPort,
    ICommandsRepository repository,
    IQueriesRepository queriesRepository,
    IDomainLogger domainLogger,
    IUserService userService) : IDeleteCustomerInputPort
{
    public async Task Handle(string id)
    {
        GuardUser.AgainstUnauthenticated(userService);

        if (!await queriesRepository.CustomerExists(id))
        {
            throw new ValidationException(new[] { new ValidationError("Id", CustomerUseCasesMessages.CustomerNotFound) });
        }

        if (await queriesRepository.CustomerHasOrders(id))
        {
            throw new ValidationException(new[] { new ValidationError("Id", CustomerUseCasesMessages.CustomerHasOrdersCannotDelete) });
        }

        await repository.DeleteCustomer(id);
        await repository.SaveChanges();

        await domainLogger.LogInformation(
            new DomainLog(
                string.Format(CustomerUseCasesMessages.CustomerDeletedTemplate, id),
                userService.UserName));

        await outputPort.Handle(true);
    }
}
