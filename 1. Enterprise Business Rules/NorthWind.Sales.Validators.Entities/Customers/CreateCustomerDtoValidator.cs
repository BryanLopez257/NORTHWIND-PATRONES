using NorthWind.Sales.Entities.Dtos.Customers;
using NorthWind.Sales.Entities.Enums;
using NorthWind.Sales.Validators.Entities.Common;
using NorthWind.Sales.Validators.Entities.Resources;

namespace NorthWind.Sales.Validators.Entities.Customers;

internal class CreateCustomerDtoValidator : AbstractModelValidator<CreateCustomerDto>
{
    public CreateCustomerDtoValidator(IValidationService<CreateCustomerDto> validationService)
        : base(validationService)
    {
        AddRuleFor(c => c.Id)
            .NotEmpty(CustomerMessages.IdRequired)
            .Length(5, CustomerMessages.IdLength)
            .Must(id => string.IsNullOrEmpty(id) || id.All(char.IsLetter), CustomerMessages.IdOnlyLetters);

        AddRuleFor(c => c.CurrentBalance)
            .Must(b => b >= 0m, CustomerMessages.CurrentBalancePositive);

        AddRuleFor(c => c.Identification)
            .NotEmpty("La identificación (Cédula o RUC) es obligatoria.")
            .Must(id => !string.IsNullOrEmpty(id) && (id.Length == 10 || id.Length == 13), "La identificación debe tener 10 dígitos (Cédula) o 13 dígitos (RUC).")
            .Must(id => EcuadorianIdentificationValidator.IsValid(id), "La identificación ingresada no es válida según el SRI.");

        // Reglas condicionales según CustomerType
        AddRuleFor(c => c)
            .Must(c =>
            {
                if (c.CustomerType == CustomerType.Natural)
                {
                    if (string.IsNullOrWhiteSpace(c.FirstName) || string.IsNullOrWhiteSpace(c.LastName))
                        return false;

                    if (!string.IsNullOrWhiteSpace(c.BusinessName))
                        return false;

                    return EcuadorianIdentificationValidator.IsValidNatural(c.Identification);
                }
                else // Legal
                {
                    if (string.IsNullOrWhiteSpace(c.BusinessName))
                        return false;

                    if (!string.IsNullOrWhiteSpace(c.FirstName) || !string.IsNullOrWhiteSpace(c.LastName))
                        return false;

                    return EcuadorianIdentificationValidator.IsValidLegal(c.Identification);
                }
            }, "Los campos de nombres/razón social o identificación no coinciden con las reglas para el tipo de cliente seleccionado.");
    }
}
