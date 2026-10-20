namespace NorthWind.Membership.Backend.AspNetIdentity.Extensions;

internal static class IdentityErrorExtensions
{
    public static IEnumerable<ValidationError> ToValidationErrors(this IEnumerable<IdentityError> errors)
    {
        List<ValidationError> Result = [];
        foreach (var Error in errors)
        {
            switch (Error.Code)
            {
                case nameof(IdentityErrorDescriber.DuplicateUserName):
                case nameof(IdentityErrorDescriber.DuplicateEmail):
                    Result.Add(new ValidationError(nameof(UserRegistrationDto.Email), Messages.DuplicateUserNameErrorMessage));
                    break;
                default:
                    if (Error.Code.StartsWith("Password", StringComparison.OrdinalIgnoreCase))
                    {
                        Result.Add(new ValidationError(nameof(UserRegistrationDto.Password), Error.Description));
                    }
                    else
                    {
                        Result.Add(new ValidationError(Error.Code, Error.Description));
                    }
                    break;
            }
        }
        return Result;
    }
}
