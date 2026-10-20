namespace NorthWind.Membership.Frontend.RazorViews.ViewModels.UserLogin;

internal class UserLoginViewModelDtoValidator(
    IModelValidatorHub<UserCredentialsDto> validator) :
    AbstractViewModelValidator<UserCredentialsDto, UserLoginViewModel>(validator, ValidationConstraint.AlwaysValidate)
{
}
