namespace NorthWind.UserServices;

internal class UserService(IHttpContextAccessor contextAccessor) : IUserService
{
    public bool IsAuthenticated =>
        contextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public string UserName =>
        contextAccessor.HttpContext?.User?.Identity?.Name;

    public string FullName =>
        contextAccessor.HttpContext?.User?.Claims
            .Where(c => c.Type == "FullName")
            .Select(c => c.Value)
            .FirstOrDefault();
}
