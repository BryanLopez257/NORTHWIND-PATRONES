namespace NorthWind.Sales.Validators.Entities.CreateOrder;

internal class CreateOrderDtoValidator : AbstractModelValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator(
        IValidationService<CreateOrderDto> validationService,
        IModelValidator<CreateOrderDetailDto> detailValidator) : base(validationService)
    {
        AddRuleFor(c => c.CustomerId)
            .NotEmpty(CreateOrderMessages.CustomerIdRequired)
            .Length(5, CreateOrderMessages.CustomerIdRequiredLength)
            .Must(id => string.IsNullOrEmpty(id) || id.All(char.IsLetter), CreateOrderMessages.CustomerIdOnlyLetters);

        AddRuleFor(c => c.CustomerDocument)
            .NotEmpty(CreateOrderMessages.CustomerDocumentRequired)
            .Must(doc => string.IsNullOrEmpty(doc) || doc.All(char.IsDigit), CreateOrderMessages.CustomerDocumentOnlyNumbers)
            .Must(IsValidCedulaOrRuc, CreateOrderMessages.CustomerDocumentInvalidFormat);

        AddRuleFor(c => c.ShipAddress)
            .NotEmpty(CreateOrderMessages.ShipAddressRequired)
            .MaximumLength(60, CreateOrderMessages.ShipAddressMaximumLength)
            .Must(addr => string.IsNullOrEmpty(addr) || System.Text.RegularExpressions.Regex.IsMatch(addr, @"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,#\-\/°]+$"),
                CreateOrderMessages.ShipAddressSpecialCharactersNotAllowed);

        AddRuleFor(c => c.ShipCity)
            .NotEmpty(CreateOrderMessages.ShipCityRequired)
            .MinimumLength(3, CreateOrderMessages.ShipCityMinimumLength)
            .MaximumLength(15, CreateOrderMessages.ShipCityMaximumLength)
            .Must(city => string.IsNullOrEmpty(city) || (!city.Any(char.IsDigit) && city.All(c => char.IsLetter(c) || char.IsWhiteSpace(c))),
                CreateOrderMessages.ShipCityOnlyLetters);

        AddRuleFor(c => c.ShipCountry)
            .NotEmpty(CreateOrderMessages.ShipCountryRequired)
            .MinimumLength(3, CreateOrderMessages.ShipCountryMinimumLength)
            .MaximumLength(15, CreateOrderMessages.ShipCountryMaximumLength)
            .Must(country => string.IsNullOrEmpty(country) || (!country.Any(char.IsDigit) && country.All(c => char.IsLetter(c) || char.IsWhiteSpace(c))),
                CreateOrderMessages.ShipCountryOnlyLetters);

        AddRuleFor(c => c.ShipPostalCode)
            .MaximumLength(10, CreateOrderMessages.ShipPostalCodeMaximumLength);

        AddRuleFor(c => c.OrderDetails)
            .NotNull(CreateOrderMessages.OrderDetailsRequired)
            .NotEmpty(CreateOrderMessages.OrderDetailsNotEmpty)
            .Must(details => details == null || details.Where(d => d.ProductId > 0).Select(d => d.ProductId).Distinct().Count() == details.Count(d => d.ProductId > 0),
                CreateOrderMessages.DuplicateProductsNotAllowed);

        AddRuleForEach(c => c.OrderDetails)
            .SetValidator(detailValidator);
    }

    private static bool IsValidCedulaOrRuc(string doc)
    {
        if (string.IsNullOrWhiteSpace(doc) || !doc.All(char.IsDigit)) return false;

        if (doc.Length == 10)
        {
            return IsValidEcuadorianCedula(doc);
        }

        if (doc.Length == 13)
        {
            return IsValidEcuadorianRuc(doc);
        }

        return false;
    }

    private static bool IsValidEcuadorianCedula(string cedula)
    {
        if (string.IsNullOrWhiteSpace(cedula) || cedula.Length != 10 || !cedula.All(char.IsDigit))
            return false;

        // Código de provincia: 01 a 24, o 30
        int province = int.Parse(cedula.AsSpan(0, 2));
        if ((province < 1 || province > 24) && province != 30)
            return false;

        // Tercer dígito de persona natural debe ser menor a 6
        int thirdDigit = cedula[2] - '0';
        if (thirdDigit >= 6)
            return false;

        // Algoritmo Módulo 10 con coeficientes alternados [2, 1, 2, 1, 2, 1, 2, 1, 2]
        int[] coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        int sum = 0;
        for (int i = 0; i < 9; i++)
        {
            int val = (cedula[i] - '0') * coefficients[i];
            if (val >= 10) val -= 9;
            sum += val;
        }

        int remainder = sum % 10;
        int expectedVerifier = remainder == 0 ? 0 : 10 - remainder;

        return expectedVerifier == (cedula[9] - '0');
    }

    private static bool IsValidEcuadorianRuc(string ruc)
    {
        if (string.IsNullOrWhiteSpace(ruc) || ruc.Length != 13 || !ruc.All(char.IsDigit))
            return false;

        int province = int.Parse(ruc.AsSpan(0, 2));
        if ((province < 1 || province > 24) && province != 30)
            return false;

        int thirdDigit = ruc[2] - '0';

        // 1. RUC Persona Natural (3er dígito < 6): los primeros 10 dígitos son cédula ecuatoriana válida
        if (thirdDigit < 6)
        {
            if (!IsValidEcuadorianCedula(ruc[..10]))
                return false;

            string establishment = ruc.Substring(10, 3);
            return establishment != "000";
        }

        // 2. RUC Sociedades Privadas y Extranjeros (3er dígito = 9, Módulo 11)
        if (thirdDigit == 9)
        {
            int[] coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
            int sum = 0;
            for (int i = 0; i < 9; i++)
            {
                sum += (ruc[i] - '0') * coefficients[i];
            }
            int remainder = sum % 11;
            int verifier = remainder == 0 ? 0 : 11 - remainder;
            if (verifier == 10) return false;
            if (verifier != (ruc[9] - '0'))
                return false;

            string establishment = ruc.Substring(10, 3);
            return establishment != "000";
        }

        // 3. RUC Entidades Públicas (3er dígito = 6, Módulo 11)
        if (thirdDigit == 6)
        {
            int[] coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
            int sum = 0;
            for (int i = 0; i < 8; i++)
            {
                sum += (ruc[i] - '0') * coefficients[i];
            }
            int remainder = sum % 11;
            int verifier = remainder == 0 ? 0 : 11 - remainder;
            if (verifier == 10) return false;
            if (verifier != (ruc[8] - '0'))
                return false;

            string establishment = ruc.Substring(9, 4);
            return establishment != "0000";
        }

        return false;
    }
}
