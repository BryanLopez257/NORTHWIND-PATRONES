namespace NorthWind.Membership.Backend.Core.Interfaces.UserLogin;

public interface IUserLoginInputPort
{
    Task Handle(UserCredentialsDto userData);
}
