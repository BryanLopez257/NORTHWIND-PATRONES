namespace NorthWind.Sales.Backend.UseCases.CreateOrder;

internal class CreateOrderInteractor(
    ICreateOrderOutputPort outputPort,
    ICommandsRepository repository,
    IModelValidatorHub<CreateOrderDto> modelValidatorHub,
    IDomainEventHub<SpecialOrderCreatedEvent> domainEventHub,
    IDomainLogger domainLogger,
    IDomainTransaction domainTransaction,
    IUserService userService,
    BusinessObjects.Interfaces.Invoices.IInvoicePricingService pricingService) : ICreateOrderInputPort
{
    public async Task Handle(CreateOrderDto orderDto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub, orderDto);

        await domainLogger.LogInformation(
            new DomainLog(CreateOrderMessages.StartingPurchaseOrderCreation, userService.UserName));

        OrderAggregate Order = OrderAggregate.From(orderDto);

        try
        {
            domainTransaction.BeginTransaction();
            var invoice = await repository.CreateOrder(Order, userService.UserName, pricingService);
            await repository.SaveChanges();

            await domainLogger.LogInformation(
                new DomainLog(string.Format(CreateOrderMessages.PurchaseOrderCreatedTemplate, Order.Id), userService.UserName));

            if (new SpecialOrderSpecification().IsSatisfiedBy(Order))
            {
                await domainEventHub.Raise(new SpecialOrderCreatedEvent(Order.Id, Order.OrderDetails.Count));
            }

            await outputPort.Handle(Order, invoice);
            domainTransaction.CommitTransaction();
        }
        catch
        {
            domainTransaction.RollbackTransaction();
            string Information = string.Format(CreateOrderMessages.OrderCreationCancelledTemplate, Order.Id);
            await domainLogger.LogInformation(new DomainLog(Information, userService.UserName));
            throw;
        }
    }
}
