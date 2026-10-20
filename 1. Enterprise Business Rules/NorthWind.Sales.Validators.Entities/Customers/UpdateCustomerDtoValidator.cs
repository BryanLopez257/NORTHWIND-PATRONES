namespace NorthWind.Sales.Validators.Entities.Customers;

internal class UpdateCustomerDtoValidator : AbstractModelValidator<UpdateCustomerDto>
{
    public UpdateCustomerDtoValidator(IValidationService<UpdateCustomerDto> validationService)
        : base(validationService)
    {
        AddRuleFor(c => c.Id)
            .NotEmpty(CustomerMessages.IdRequired)
            .Length(5, CustomerMessages.IdLength)
            .Must(id => string.IsNullOrEmpty(id) || id.All(char.IsLetter), CustomerMessages.IdOnlyLetters);

        AddRuleFor(c => c.Name)
            .NotEmpty(CustomerMessages.NameRequired)
            .MaximumLength(40, CustomerMessages.NameMaxLength)
            .Must(name => string.IsNullOrEmpty(name) || (!name.Any(char.IsDigit) && name.All(c => char.IsLetter(c) || char.IsWhiteSpace(c))), CustomerMessages.NameOnlyLetters);

        AddRuleFor(c => c.CurrentBalance)
            .Must(b => b >= 0m, CustomerMessages.CurrentBalancePositive);

        AddRuleFor(c => c.CustomerType)
            .NotEmpty("El tipo de cliente es obligatorio.");
    }
}
