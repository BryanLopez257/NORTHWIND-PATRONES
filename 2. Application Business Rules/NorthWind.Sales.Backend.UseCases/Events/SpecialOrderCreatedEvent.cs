namespace NorthWind.Sales.Backend.UseCases.Events;

public class SpecialOrderCreatedEvent(int orderId, int productsCount) : IDomainEvent
{
    public int OrderId => orderId;
    public int ProductsCount => productsCount;
}
