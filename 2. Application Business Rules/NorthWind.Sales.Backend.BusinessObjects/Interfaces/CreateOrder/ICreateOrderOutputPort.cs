namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.CreateOrder;

public interface ICreateOrderOutputPort
{
    int OrderId { get; }
    InvoiceResponseDto Invoice { get; }
    Task Handle(OrderAggregate addedOrder, InvoiceResponseDto invoice);
    Task Handle(OrderAggregate addedOrder);
}
