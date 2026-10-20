namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddMembershipValidators(this IServiceCollection services)
    {
        services.AddModelValidator<UserRegistrationDto, UserRegistrationDtoValidator>();
        services.AddModelValidator<UserCredentialsDto, UserCredentialsDtoValidator>();
        return services;
    }
}
