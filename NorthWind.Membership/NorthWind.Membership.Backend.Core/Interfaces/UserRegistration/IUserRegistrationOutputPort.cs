namespace NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;

public interface IUserRegistrationOutputPort
{
    IResult Result { get; }
    Task Handle(Result<IEnumerable<ValidationError>> userRegistrationResult);
}
