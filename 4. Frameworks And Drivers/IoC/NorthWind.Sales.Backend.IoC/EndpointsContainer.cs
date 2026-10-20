namespace Microsoft.AspNetCore.Builder;

public static class EndpointsContainer
{
    public static WebApplication UseNorthWindSalesEndpoints(this WebApplication app)
    {
        app.UseMembershipEndpoints();
        app.UseCreateOrderController();
        app.UseProductsController();
        app.UseCustomersController();
        app.UseInvoicesController();
        return app;
    }
}
