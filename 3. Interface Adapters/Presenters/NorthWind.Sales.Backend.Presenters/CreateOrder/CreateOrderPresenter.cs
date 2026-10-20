namespace NorthWind.Sales.Backend.Presenters.CreateOrder;

public class CreateOrderPresenter : ICreateOrderOutputPort
{
    public int OrderId { get; private set; }
    public InvoiceResponseDto Invoice { get; private set; }

    public Task Handle(OrderAggregate addedOrder, InvoiceResponseDto invoice)
    {
        OrderId = addedOrder.Id;
        Invoice = invoice;
        return Task.CompletedTask;
    }

    public Task Handle(OrderAggregate addedOrder) => Handle(addedOrder, null);
}
