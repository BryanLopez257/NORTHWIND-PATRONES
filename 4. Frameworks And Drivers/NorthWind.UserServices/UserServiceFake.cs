namespace NorthWind.UserServices;

internal class UserServiceFake : IUserService
{
    public bool IsAuthenticated => true;
    public string UserName => "fake.user@northwind.com";
    public string FullName => "Fake User";
}
