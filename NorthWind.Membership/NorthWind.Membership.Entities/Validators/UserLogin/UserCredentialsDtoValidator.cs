namespace NorthWind.Membership.Entities.Validators.UserLogin;

internal class UserCredentialsDtoValidator : AbstractModelValidator<UserCredentialsDto>
{
    public UserCredentialsDtoValidator(IValidationService<UserCredentialsDto> validator) : base(validator)
    {
        AddRuleFor(u => u.Email)
            .NotEmpty(UserLoginMessages.RequiredEmailErrorMessage)
            .MaximumLength(254, UserLoginMessages.EmailTooLongErrorMessage)
            .EmailAddress(UserLoginMessages.InvalidEmailErrorMessage);
        AddRuleFor(u => u.Password)
            .NotEmpty(UserLoginMessages.RequiredPasswordErrorMessage);
    }
}
