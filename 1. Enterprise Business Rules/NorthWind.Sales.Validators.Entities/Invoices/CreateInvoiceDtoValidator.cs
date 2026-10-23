namespace NorthWind.Sales.Validators.Entities.Invoices;

internal class CreateInvoiceDtoValidator : AbstractModelValidator<CreateInvoiceDto>
{
    public CreateInvoiceDtoValidator(
        IValidationService<CreateInvoiceDto> validationService,
        IModelValidator<CreateInvoiceDetailDto> detailValidator) : base(validationService)
    {
        AddRuleFor(c => c.CustomerId)
            .NotEmpty(InvoiceMessages.CustomerIdRequired)
            .Length(5, InvoiceMessages.CustomerIdRequiredLength);

        AddRuleFor(c => c.Details)
            .NotNull(InvoiceMessages.InvoiceDetailsRequired)
            .NotEmpty(InvoiceMessages.InvoiceDetailsNotEmpty)
            .Must(details => details == null || details.Where(d => d.ProductId > 0).Select(d => d.ProductId).Distinct().Count() == details.Count(d => d.ProductId > 0),
                InvoiceMessages.DuplicateProductsNotAllowed);

        AddRuleForEach(c => c.Details)
            .SetValidator(detailValidator);

        AddRuleFor(c => c.CustomerEmail)
            .MaximumLength(254, InvoiceMessages.CustomerEmailTooLong)
            .Must(email => string.IsNullOrWhiteSpace(email) || new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email.Trim()),
                InvoiceMessages.CustomerEmailInvalid);
    }
}
