namespace NorthWind.Sales.Entities.Dtos.CreateOrder;

public class CreateOrderDto
{
    public CreateOrderDto() { }

    public CreateOrderDto(
        string customerId,
        string customerDocument,
        string shipAddress,
        string shipCity,
        string shipCountry,
        string shipPostalCode,
        IEnumerable<CreateOrderDetailDto> orderDetails)
    {
        CustomerId = customerId;
        CustomerDocument = customerDocument;
        ShipAddress = shipAddress;
        ShipCity = shipCity;
        ShipCountry = shipCountry;
        ShipPostalCode = shipPostalCode;
        OrderDetails = orderDetails;
    }

    public CreateOrderDto(
        string customerId,
        string shipAddress,
        string shipCity,
        string shipCountry,
        string shipPostalCode,
        IEnumerable<CreateOrderDetailDto> orderDetails)
        : this(customerId, null, shipAddress, shipCity, shipCountry, shipPostalCode, orderDetails)
    {
    }

    public string CustomerId { get; init; }
    public string CustomerDocument { get; init; }
    public string ShipAddress { get; init; }
    public string ShipCity { get; init; }
    public string ShipCountry { get; init; }
    public string ShipPostalCode { get; init; }
    public IEnumerable<CreateOrderDetailDto> OrderDetails { get; init; }
}
