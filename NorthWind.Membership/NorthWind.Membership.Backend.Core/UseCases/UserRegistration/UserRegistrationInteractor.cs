namespace NorthWind.Membership.Backend.Core.UseCases.UserRegistration;

internal class UserRegistrationInteractor(
    IMembershipService membershipService,
    IUserRegistrationOutputPort presenter,
    IModelValidatorHub<UserRegistrationDto> validationService)
    : IUserRegistrationInputPort
{
    public async Task Handle(UserRegistrationDto userData)
    {
        Result<IEnumerable<ValidationError>> Result;
        if (!await validationService.Validate(userData))
        {
            Result = new Result<IEnumerable<ValidationError>>(validationService.Errors);
        }
        else
        {
            Result = await membershipService.Register(userData);
        }
        await presenter.Handle(Result);
    }
}
