namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddViewsServices(this IServiceCollection services)
    {
        services.AddScoped<CreateOrderViewModel>();
        services.AddModelValidator<CreateOrderViewModel, CreateOrderViewModelValidator>();

        services.AddScoped<ProductsViewModel>();
        services.AddScoped<CustomersViewModel>();
        services.AddScoped<InvoicesViewModel>();

        return services;
    }
}
