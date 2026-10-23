namespace NorthWind.Membership.Backend.AspNetIdentity.Services;

internal class MembershipService(UserManager<NorthWindUser> manager) : IMembershipService
{
    public async Task<Result<IEnumerable<ValidationError>>> Register(UserRegistrationDto userData)
    {
        Result<IEnumerable<ValidationError>> Result;
        var normalizedEmail = userData.Email?.Trim().ToLowerInvariant();
        var User = new NorthWindUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            FirstName = userData.FirstName,
            SecondName = userData.SecondName,
            LastName = userData.LastName,
            SecondLastName = userData.SecondLastName
        };
        var CreateResult = await manager.CreateAsync(User, userData.Password);
        if (CreateResult.Succeeded)
        {
            Result = new Result<IEnumerable<ValidationError>>();
        }
        else
        {
            Result = new Result<IEnumerable<ValidationError>>(CreateResult.Errors.ToValidationErrors());
        }
        return Result;
    }

    public async Task<UserDto> GetUserByCredentials(UserCredentialsDto userData)
    {
        UserDto FoundUser = null;
        var normalizedEmail = userData.Email?.Trim().ToLowerInvariant();
        var User = await manager.FindByNameAsync(normalizedEmail) ?? await manager.FindByEmailAsync(normalizedEmail);
        if (User != null && await manager.CheckPasswordAsync(User, userData.Password))
        {
            FoundUser = new UserDto(User.UserName, User.FirstName, User.LastName);
        }
        return FoundUser;
    }
}
