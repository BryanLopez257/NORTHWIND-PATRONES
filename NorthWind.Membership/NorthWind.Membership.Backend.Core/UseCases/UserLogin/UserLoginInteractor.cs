namespace NorthWind.Membership.Backend.Core.UseCases.UserLogin;

internal class UserLoginInteractor(
    IMembershipService membershipService,
    IUserLoginOutputPort presenter,
    IModelValidatorHub<UserCredentialsDto> validationService)
    : IUserLoginInputPort
{
    public async Task Handle(UserCredentialsDto userData)
    {
        Result<UserDto, IEnumerable<ValidationError>> Result;
        if (!await validationService.Validate(userData))
        {
            Result = new(validationService.Errors);
        }
        else
        {
            var User = await membershipService.GetUserByCredentials(userData);
            if (User == null)
            {
                Result = new(
                [
                    new ValidationError(
                        nameof(userData.Password),
                        UserLoginMessages.InvalidUserCredentialsErrorMessage)
                ]);
            }
            else
            {
                Result = new(User);
            }
        }
        await presenter.Handle(Result);
    }
}
