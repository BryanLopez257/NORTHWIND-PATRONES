namespace NorthWind.Sales.Validators.Entities.Products;

internal class UpdateProductDtoValidator : AbstractModelValidator<UpdateProductDto>
{
    public UpdateProductDtoValidator(IValidationService<UpdateProductDto> validationService)
        : base(validationService)
    {
        AddRuleFor(p => p.Id)
            .GreaterThan(0, ProductMessages.IdGreaterThanZero);

        AddRuleFor(p => p.Name)
            .NotEmpty(ProductMessages.NameRequired)
            .MaximumLength(40, ProductMessages.NameMaxLength);

        AddRuleFor(p => p.UnitPrice)
            .GreaterThan(0m, ProductMessages.UnitPriceGreaterThanZero);

        AddRuleFor(p => p.UnitsInStock)
            .Must(s => s >= 0, ProductMessages.UnitsInStockPositive);
    }
}
