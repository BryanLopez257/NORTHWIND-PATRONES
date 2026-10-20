namespace NorthWind.Sales.Backend.UseCases.Invoices;

internal class CreateInvoiceInteractor(
    ICreateInvoiceOutputPort outputPort,
    ICommandsRepository commandsRepository,
    IQueriesRepository queriesRepository,
    IInvoicePricingService pricingService,
    IModelValidatorHub<CreateInvoiceDto> modelValidatorHub,
    IDomainLogger domainLogger,
    IDomainTransaction domainTransaction,
    IUserService userService) : ICreateInvoiceInputPort
{
    public async Task Handle(CreateInvoiceDto dto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub, dto);

        if (!await queriesRepository.CustomerExists(dto.CustomerId))
        {
            throw new ValidationException(
            [
                new ValidationError(nameof(dto.CustomerId), InvoiceUseCasesMessages.CustomerNotFound)
            ]);
        }

        var productIds = dto.Details.Select(d => d.ProductId).Distinct();
        var inStockList = await queriesRepository.GetProductsUnitsInStock(productIds);
        var inStock = inStockList.ToDictionary(p => p.ProductId, p => p.UnitsInStock);

        foreach (var detail in dto.Details)
        {
            if (!inStock.TryGetValue(detail.ProductId, out var units))
            {
                throw new ValidationException(
                [
                    new ValidationError(nameof(detail.ProductId), string.Format(InvoiceUseCasesMessages.ProductNotFoundTemplate, detail.ProductId))
                ]);
            }

            if (units < detail.Quantity)
            {
                var prod = await queriesRepository.GetProductById(detail.ProductId);
                string prodName = prod?.Name ?? detail.ProductId.ToString();
                throw new ValidationException(
                [
                    new ValidationError(nameof(detail.Quantity), string.Format(InvoiceUseCasesMessages.InsufficientStockTemplate, prodName, detail.Quantity, units))
                ]);
            }
        }

        try
        {
            domainTransaction.BeginTransaction();

            string sellerName = !string.IsNullOrWhiteSpace(userService.UserName) ? userService.UserName : "Administrador";
            var createdInvoice = await commandsRepository.CreateInvoice(dto, sellerName, pricingService);
            await commandsRepository.SaveChanges();

            await domainLogger.LogInformation(
                new DomainLog(string.Format(InvoiceUseCasesMessages.InvoiceCreatedTemplate, createdInvoice.InvoiceNumber, createdInvoice.CustomerFullName), sellerName));

            domainTransaction.CommitTransaction();
            await outputPort.Handle(createdInvoice);
        }
        catch
        {
            domainTransaction.RollbackTransaction();
            await domainLogger.LogInformation(
                new DomainLog(string.Format(InvoiceUseCasesMessages.InvoiceCreationCancelledTemplate, dto.CustomerId), userService.UserName));
            throw;
        }
    }
}
