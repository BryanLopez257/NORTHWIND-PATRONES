namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface ICreateOrderGateway
{
    Task<CreateOrderResultDto> CreateOrderAsync(CreateOrderDto order);
}
