namespace NorthWind.Sales.Frontend.WebApiGateways;

internal class CreateOrderGateway(HttpClient client) : ICreateOrderGateway
{
    public async Task<CreateOrderResultDto> CreateOrderAsync(CreateOrderDto order)
    {
        var Response = await client.PostAsJsonAsync(Endpoints.CreateOrder, order);
        return await Response.Content.ReadFromJsonAsync<CreateOrderResultDto>();
    }
}
