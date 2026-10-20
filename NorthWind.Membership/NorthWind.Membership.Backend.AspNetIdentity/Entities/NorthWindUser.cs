namespace NorthWind.Membership.Backend.AspNetIdentity.Entities;

public class NorthWindUser : IdentityUser
{
    public string FirstName { get; set; }
    public string SecondName { get; set; }
    public string LastName { get; set; }
    public string SecondLastName { get; set; }
}
