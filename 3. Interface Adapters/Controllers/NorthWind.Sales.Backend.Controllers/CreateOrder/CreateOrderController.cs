namespace Microsoft.AspNetCore.Builder;

public static class CreateOrderController
{
    public static WebApplication UseCreateOrderController(this WebApplication app)
    {
        app.MapPost(Endpoints.CreateOrder, CreateOrder)
           .RequireAuthorization();
        return app;
    }

    private static async Task<IResult> CreateOrder(
        CreateOrderDto orderDto,
        ICreateOrderInputPort inputPort,
        CreateOrderPresenter presenter)
    {
        await inputPort.Handle(orderDto);
        return Results.Ok(new CreateOrderResultDto(
            presenter.OrderId,
            presenter.Invoice?.InvoiceNumber ?? string.Empty,
            presenter.Invoice));
    }
}
