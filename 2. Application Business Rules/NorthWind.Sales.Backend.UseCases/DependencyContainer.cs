namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddUseCasesServices(this IServiceCollection services)
    {
        services.AddScoped<ICreateOrderInputPort, CreateOrderInteractor>();
        services.AddModelValidator<CreateOrderDto, CreateOrderCustomerValidator>();
        services.AddModelValidator<CreateOrderDto, CreateOrderProductValidator>();
        services.AddScoped<IDomainEventHandler<SpecialOrderCreatedEvent>, SendEMailWhenSpecialOrderCreatedEventHandler>();

        // Products Use Cases
        services.AddScoped<IGetProductsInputPort, GetProductsInteractor>();
        services.AddScoped<IGetProductByIdInputPort, GetProductByIdInteractor>();
        services.AddScoped<ICreateProductInputPort, CreateProductInteractor>();
        services.AddScoped<IUpdateProductInputPort, UpdateProductInteractor>();
        services.AddScoped<IDeleteProductInputPort, DeleteProductInteractor>();

        // Customers Use Cases
        services.AddScoped<IGetCustomersInputPort, GetCustomersInteractor>();
        services.AddScoped<IGetCustomerByIdInputPort, GetCustomerByIdInteractor>();
        services.AddScoped<ICreateCustomerInputPort, CreateCustomerInteractor>();
        services.AddScoped<IUpdateCustomerInputPort, UpdateCustomerInteractor>();
        services.AddScoped<IDeleteCustomerInputPort, DeleteCustomerInteractor>();

        // Invoices Use Cases
        services.AddSingleton<IInvoicePricingService, InvoicePricingService>();
        services.AddScoped<ICreateInvoiceInputPort, CreateInvoiceInteractor>();
        services.AddScoped<IGetInvoiceByIdInputPort, GetInvoiceByIdInteractor>();
        services.AddScoped<IGetInvoicesInputPort, GetInvoicesInteractor>();

        return services;
    }
}
