namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddMembershipCoreServices(
        this IServiceCollection services,
        Action<JwtOptions> configureJwtOptions)
    {
        services.AddMembershipValidators();
        services.AddDefaultModelValidatorHub();
        services.AddScoped<IUserRegistrationInputPort, UserRegistrationInteractor>();
        services.AddScoped<IUserLoginInputPort, UserLoginInteractor>();
        services.AddScoped<IUserRegistrationOutputPort, UserRegistrationPresenter>();
        services.AddScoped<IUserLoginOutputPort, UserLoginPresenter>();
        services.AddSingleton<JwtService>();
        services.Configure(configureJwtOptions);
        return services;
    }
}
