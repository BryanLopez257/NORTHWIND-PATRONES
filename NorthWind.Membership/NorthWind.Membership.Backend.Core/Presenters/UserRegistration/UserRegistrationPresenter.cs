namespace NorthWind.Membership.Backend.Core.Presenters.UserRegistration;

internal class UserRegistrationPresenter : IUserRegistrationOutputPort
{
    public IResult Result { get; private set; }

    public Task Handle(Result<IEnumerable<ValidationError>> userRegistrationResult)
    {
        userRegistrationResult.HandleResult(
            errors => Result = Results.Problem(errors.ToProblemDetails(
                UserRegistrationMessages.UserRegistrationErrorTitle,
                UserRegistrationMessages.UserRegistrationErrorDetail,
                nameof(UserRegistrationPresenter))),
            () => Result = Results.Ok());
        return Task.CompletedTask;
    }
}
