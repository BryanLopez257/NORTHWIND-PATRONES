namespace NorthWind.Sales.Frontend.Views.ViewModels.CreateOrder;

public class CreateOrderViewModel(
    ICreateOrderGateway gateway,
    IModelValidatorHub<CreateOrderViewModel> validator)
{
    public IModelValidatorHub<CreateOrderViewModel> Validator => validator;

    public string CustomerId { get; set; }
    public string CustomerDocument { get; set; }

    private string _shipAddress;
    public string ShipAddress
    {
        get => _shipAddress;
        set
        {
            if (value == null)
            {
                _shipAddress = null;
                return;
            }
            var clean = System.Text.RegularExpressions.Regex.Replace(value, @"[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\.,#\-\/°]", "");
            _shipAddress = clean.Length > 60 ? clean[..60] : clean;
        }
    }

    private string _shipCity;
    public string ShipCity
    {
        get => _shipCity;
        set => _shipCity = value != null && value.Length > 15 ? value[..15] : value;
    }

    private string _shipCountry;
    public string ShipCountry
    {
        get => _shipCountry;
        set => _shipCountry = value != null && value.Length > 15 ? value[..15] : value;
    }

    private string _shipPostalCode;
    public string ShipPostalCode
    {
        get => _shipPostalCode;
        set => _shipPostalCode = value != null && value.Length > 10 ? value[..10] : value;
    }
    public List<CreateOrderDetailViewModel> OrderDetails { get; set; } = [];

    public ModelValidator<CreateOrderViewModel> ModelValidatorComponentReference { get; set; }

    public string InformationMessage { get; private set; }
    public string ErrorMessage { get; private set; }
    public CreateOrderResultDto OrderResult { get; private set; }
    public InvoiceResponseDto GeneratedInvoice => OrderResult?.Invoice;

    public decimal SubTotal => OrderDetails.Sum(d => d.UnitPrice * d.Quantity);
    public decimal Tax => Math.Round(SubTotal * 0.15m, 2);
    public decimal Total => SubTotal + Tax;
    public int TotalUnits => OrderDetails.Sum(d => d.Quantity);

    public void AddNewOrderDetailItem()
    {
        OrderDetails.Add(new CreateOrderDetailViewModel());
    }

    public void RemoveOrderDetailItem(CreateOrderDetailViewModel item)
    {
        OrderDetails.Remove(item);
    }

    public void Reset()
    {
        CustomerId = null;
        CustomerDocument = null;
        ShipAddress = null;
        ShipCity = null;
        ShipCountry = null;
        ShipPostalCode = null;
        OrderDetails.Clear();
        ModelValidatorComponentReference?.ClearErrors();
    }

    public async Task Send()
    {
        InformationMessage = "";
        ErrorMessage = "";
        OrderResult = null;
        try
        {
            OrderResult = await gateway.CreateOrderAsync((CreateOrderDto)this);
            var invNumber = !string.IsNullOrEmpty(OrderResult?.InvoiceNumber)
                ? OrderResult.InvoiceNumber
                : (OrderResult?.Invoice?.InvoiceNumber ?? "");

            InformationMessage = $"Orden #{OrderResult.OrderId} creada exitosamente. Se ha generado la Factura {invNumber}.";
            Reset();
        }
        catch (HttpRequestException ex)
        {
            if (ex.Data.Contains("Errors"))
            {
                IEnumerable<ValidationError> Errors = ex.Data["Errors"] as IEnumerable<ValidationError>;
                ModelValidatorComponentReference?.AddErrors(Errors);
            }
            else
            {
                ErrorMessage = string.IsNullOrWhiteSpace(ex.Message)
                    ? "Error inesperado en el servidor. Ocurrió un error inesperado al procesar la solicitud. Contactese con el Administrador."
                    : ex.Message;
                ModelValidatorComponentReference?.ClearErrors();
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = string.IsNullOrWhiteSpace(ex.Message)
                ? "Error inesperado en el servidor. Ocurrió un error inesperado al procesar la solicitud. Contactese con el Administrador."
                : ex.Message;
            ModelValidatorComponentReference?.ClearErrors();
        }
    }

    public static explicit operator CreateOrderDto(CreateOrderViewModel model) =>
        new CreateOrderDto(
            model.CustomerId,
            model.CustomerDocument,
            model.ShipAddress,
            model.ShipCity,
            model.ShipCountry,
            model.ShipPostalCode,
            model.OrderDetails.Select(d => new CreateOrderDetailDto(d.ProductId, d.UnitPrice, d.Quantity)));
}
