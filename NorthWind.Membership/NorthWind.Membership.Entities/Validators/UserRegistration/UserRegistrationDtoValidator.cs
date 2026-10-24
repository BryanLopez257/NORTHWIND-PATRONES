using System.Text.RegularExpressions;

namespace NorthWind.Membership.Entities.Validators.UserRegistration;

internal class UserRegistrationDtoValidator : AbstractModelValidator<UserRegistrationDto>
{
    private static readonly Regex NameRegex = new(
        @"^[\p{L}\s]+$",
        RegexOptions.Compiled);

    // Permite caracteres alfanuméricos, puntos (.), arroba (@), subdireccionamiento (+), guiones (-) y subguiones (_) conforme a RFC 5321/3696
    private static readonly Regex EmailCharsRegex = new(
        @"^[a-zA-Z0-9.@+_\-]+$",
        RegexOptions.Compiled);

    public UserRegistrationDtoValidator(IValidationService<UserRegistrationDto> validator) : base(validator)
    {
        AddRuleFor(u => u.FirstName)
            .StopOnFirstFailure()
            .NotEmpty(UserRegistrationMessages.RequiredFirstNameErrorMessage)
            .MinimumLength(2, UserRegistrationMessages.FirstNameLengthErrorMessage)
            .MaximumLength(50, UserRegistrationMessages.FirstNameLengthErrorMessage)
            .Must(name => !string.IsNullOrWhiteSpace(name) && NameRegex.IsMatch(name.Trim()),
                UserRegistrationMessages.FirstNameInvalidCharactersErrorMessage);

        AddRuleFor(u => u.SecondName)
            .StopOnFirstFailure()
            .Must(sName => string.IsNullOrWhiteSpace(sName) || (sName.Trim().Length >= 2 && sName.Trim().Length <= 50),
                UserRegistrationMessages.SecondNameLengthErrorMessage)
            .Must(sName => string.IsNullOrWhiteSpace(sName) || NameRegex.IsMatch(sName.Trim()),
                UserRegistrationMessages.SecondNameInvalidCharactersErrorMessage);

        AddRuleFor(u => u.LastName)
            .StopOnFirstFailure()
            .NotEmpty(UserRegistrationMessages.RequiredLastNameErrorMessage)
            .MinimumLength(2, UserRegistrationMessages.LastNameLengthErrorMessage)
            .MaximumLength(50, UserRegistrationMessages.LastNameLengthErrorMessage)
            .Must(lastName => !string.IsNullOrWhiteSpace(lastName) && NameRegex.IsMatch(lastName.Trim()),
                UserRegistrationMessages.LastNameInvalidCharactersErrorMessage);

        AddRuleFor(u => u.SecondLastName)
            .StopOnFirstFailure()
            .Must(sLastName => string.IsNullOrWhiteSpace(sLastName) || (sLastName.Trim().Length >= 2 && sLastName.Trim().Length <= 50),
                UserRegistrationMessages.SecondLastNameLengthErrorMessage)
            .Must(sLastName => string.IsNullOrWhiteSpace(sLastName) || NameRegex.IsMatch(sLastName.Trim()),
                UserRegistrationMessages.SecondLastNameInvalidCharactersErrorMessage);

        AddRuleFor(u => u.Email)
            .StopOnFirstFailure()
            .NotEmpty(UserRegistrationMessages.RequiredEmailErrorMessage)
            .MaximumLength(254, UserRegistrationMessages.EmailTooLongErrorMessage)
            .Must(email => !string.IsNullOrWhiteSpace(email)
                        && !email.Any(char.IsWhiteSpace)
                        && !ContainsEmoji(email)
                        && EmailCharsRegex.IsMatch(email),
                UserRegistrationMessages.EmailInvalidCharactersErrorMessage)
            .EmailAddress(UserRegistrationMessages.InvalidEmailErrorMessage);

        AddRuleFor(u => u.Password)
            .StopOnFirstFailure()
            .NotEmpty(UserRegistrationMessages.RequiredPasswordErrorMessage)
            .MinimumLength(6, UserRegistrationMessages.PasswordTooShortErrorMessage)
            .MaximumLength(100, UserRegistrationMessages.PasswordTooLongErrorMessage)
            .Must(pwd => !string.IsNullOrWhiteSpace(pwd) && !pwd.Any(char.IsWhiteSpace) && !ContainsEmoji(pwd),
                UserRegistrationMessages.PasswordInvalidCharactersErrorMessage);
    }

    private static bool ContainsEmoji(string input)
    {
        if (string.IsNullOrEmpty(input)) return false;
        for (int i = 0; i < input.Length; i++)
        {
            int codePoint = char.ConvertToUtf32(input, i);
            if (char.IsSurrogate(input[i]))
            {
                i++;
            }

            if ((codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Emoticons
                (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) || // Misc Symbols and Pictographs
                (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Transport and Map
                (codePoint >= 0x1F700 && codePoint <= 0x1F77F) || // Alchemical Symbols
                (codePoint >= 0x1F780 && codePoint <= 0x1F7FF) || // Geometric Shapes Extended
                (codePoint >= 0x1F800 && codePoint <= 0x1F8FF) || // Supplemental Arrows-C
                (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) || // Supplemental Symbols and Pictographs
                (codePoint >= 0x1FA00 && codePoint <= 0x1FA6F) || // Chess Symbols
                (codePoint >= 0x1FA70 && codePoint <= 0x1FAFF) || // Symbols and Pictographs Extended-A
                (codePoint >= 0x2600 && codePoint <= 0x26FF)   || // Misc symbols
                (codePoint >= 0x2700 && codePoint <= 0x27BF)   || // Dingbats
                (codePoint >= 0xFE00 && codePoint <= 0xFE0F)   || // Variation Selectors
                (codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF))   // Flags
            {
                return true;
            }
        }
        return false;
    }
}
