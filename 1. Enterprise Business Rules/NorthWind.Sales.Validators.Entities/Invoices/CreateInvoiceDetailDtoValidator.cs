namespace NorthWind.Sales.Validators.Entities.Invoices;

internal class CreateInvoiceDetailDtoValidator : AbstractModelValidator<CreateInvoiceDetailDto>
{
    public CreateInvoiceDetailDtoValidator(IValidationService<CreateInvoiceDetailDto> validator) : base(validator)
    {
        AddRuleFor(d => d.ProductId)
            .GreaterThan(0, InvoiceMessages.ProductIdRequired);
        AddRuleFor(d => d.Quantity)
            .GreaterThan(0, InvoiceMessages.QuantityRequired);
    }
}
