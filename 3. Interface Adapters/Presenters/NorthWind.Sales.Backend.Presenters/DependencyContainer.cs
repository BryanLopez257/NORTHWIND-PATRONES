namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddPresenters(this IServiceCollection services)
    {
        services.AddScoped<CreateOrderPresenter>();
        services.AddScoped<ICreateOrderOutputPort>(sp => sp.GetRequiredService<CreateOrderPresenter>());

        // Product Presenters
        services.AddScoped<GetProductsPresenter>();
        services.AddScoped<IGetProductsOutputPort>(sp => sp.GetRequiredService<GetProductsPresenter>());

        services.AddScoped<GetProductByIdPresenter>();
        services.AddScoped<IGetProductByIdOutputPort>(sp => sp.GetRequiredService<GetProductByIdPresenter>());

        services.AddScoped<CreateProductPresenter>();
        services.AddScoped<ICreateProductOutputPort>(sp => sp.GetRequiredService<CreateProductPresenter>());

        services.AddScoped<UpdateProductPresenter>();
        services.AddScoped<IUpdateProductOutputPort>(sp => sp.GetRequiredService<UpdateProductPresenter>());

        services.AddScoped<DeleteProductPresenter>();
        services.AddScoped<IDeleteProductOutputPort>(sp => sp.GetRequiredService<DeleteProductPresenter>());

        // Customer Presenters
        services.AddScoped<GetCustomersPresenter>();
        services.AddScoped<IGetCustomersOutputPort>(sp => sp.GetRequiredService<GetCustomersPresenter>());

        services.AddScoped<GetCustomerByIdPresenter>();
        services.AddScoped<IGetCustomerByIdOutputPort>(sp => sp.GetRequiredService<GetCustomerByIdPresenter>());

        services.AddScoped<CreateCustomerPresenter>();
        services.AddScoped<ICreateCustomerOutputPort>(sp => sp.GetRequiredService<CreateCustomerPresenter>());

        services.AddScoped<UpdateCustomerPresenter>();
        services.AddScoped<IUpdateCustomerOutputPort>(sp => sp.GetRequiredService<UpdateCustomerPresenter>());

        services.AddScoped<DeleteCustomerPresenter>();
        services.AddScoped<IDeleteCustomerOutputPort>(sp => sp.GetRequiredService<DeleteCustomerPresenter>());

        // Invoice Presenters
        services.AddScoped<CreateInvoicePresenter>();
        services.AddScoped<ICreateInvoiceOutputPort>(sp => sp.GetRequiredService<CreateInvoicePresenter>());

        services.AddScoped<GetInvoiceByIdPresenter>();
        services.AddScoped<IGetInvoiceByIdOutputPort>(sp => sp.GetRequiredService<GetInvoiceByIdPresenter>());

        services.AddScoped<GetInvoicesPresenter>();
        services.AddScoped<IGetInvoicesOutputPort>(sp => sp.GetRequiredService<GetInvoicesPresenter>());

        return services;
    }
}
