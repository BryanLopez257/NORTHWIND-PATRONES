namespace NorthWind.Membership.Entities.Dtos.UserRegistration;

public class UserRegistrationDto(
    string email,
    string password,
    string firstName,
    string lastName,
    string secondName = null,
    string secondLastName = null)
{
    public string Email => email;
    public string Password => password;
    public string FirstName => firstName;
    public string SecondName => secondName;
    public string LastName => lastName;
    public string SecondLastName => secondLastName;
}
