namespace NorthWind.Membership.Frontend.RazorViews.ViewModels.UserRegistration;

internal class UserRegistrationViewModelDtoValidator(
    IModelValidatorHub<UserRegistrationDto> validator) :
    AbstractViewModelValidator<UserRegistrationDto, UserRegistrationViewModel>(validator, ValidationConstraint.AlwaysValidate)
{
}

internal class UserRegistrationViewModelValidator : AbstractModelValidator<UserRegistrationViewModel>
{
    public UserRegistrationViewModelValidator(IValidationService<UserRegistrationViewModel> validator) : base(validator)
    {
        AddRuleFor(m => m.PasswordConfirmation)
            .Equal(m => m.Password, UserRegistrationMessages.ConfirmPasswordErrorMessage);
    }
}
