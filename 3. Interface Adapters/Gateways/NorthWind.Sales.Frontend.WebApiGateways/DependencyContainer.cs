namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddWebApiGateways(
        this IServiceCollection services,
        Action<HttpClient> configureHttpClient,
        Action<IHttpClientBuilder> configureHttpClientBuilder)
    {
        services.AddExceptionDelegatingHandler();

        var createOrderBuilder = services
            .AddHttpClient<ICreateOrderGateway, CreateOrderGateway>(configureHttpClient)
            .AddHttpMessageHandler<ExceptionDelegatingHandler>();
        configureHttpClientBuilder(createOrderBuilder);

        var productsBuilder = services
            .AddHttpClient<IProductsGateway, ProductsGateway>(configureHttpClient)
            .AddHttpMessageHandler<ExceptionDelegatingHandler>();
        configureHttpClientBuilder(productsBuilder);

        var customersBuilder = services
            .AddHttpClient<ICustomersGateway, CustomersGateway>(configureHttpClient)
            .AddHttpMessageHandler<ExceptionDelegatingHandler>();
        configureHttpClientBuilder(customersBuilder);

        var invoicesBuilder = services
            .AddHttpClient<IInvoicesGateway, InvoicesGateway>(configureHttpClient)
            .AddHttpMessageHandler<ExceptionDelegatingHandler>();
        configureHttpClientBuilder(invoicesBuilder);

        return services;
    }
}
