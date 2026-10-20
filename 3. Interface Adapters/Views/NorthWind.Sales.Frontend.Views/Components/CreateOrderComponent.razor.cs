using Microsoft.JSInterop;

namespace NorthWind.Sales.Frontend.Views.Components;

public partial class CreateOrderComponent : IDisposable
{
    [Parameter]
    public CreateOrderViewModel Order { get; set; }

    [Inject]
    private IJSRuntime JSRuntime { get; set; }

    [Inject]
    private ICustomersGateway CustomersGateway { get; set; }

    [Inject]
    private IProductsGateway ProductsGateway { get; set; }

    private List<CustomerDto> AvailableCustomers { get; set; } = [];
    private List<ProductDto> AvailableProducts { get; set; } = [];
    private List<CustomerDto> AllCatalogCustomers { get; set; } = [];
    private List<ProductDto> AllCatalogProducts { get; set; } = [];

    private string CustomerPickerSearchTerm { get; set; } = "";
    private string CustomerPickerSearchType { get; set; } = "all"; // "all", "code", "name"
    private string CustomerPickerCustomerType { get; set; } = ""; // "", "Persona Natural", "Empresa"
    private string ProductPickerSearchTerm { get; set; } = "";
    private string ProductPickerSearchType { get; set; } = "all"; // "all", "id", "name"
    private string CustomerNameSelected { get; set; } = "";
    private string CustomerTypeSelected { get; set; } = "";
    private string ProductPickerWarning { get; set; } = "";
    private string CustomerPickerWarning { get; set; } = "";
    private string CustomerSelectedError { get; set; } = "";

    private bool ShowCustomerPicker { get; set; }
    private bool ShowProductPicker { get; set; }
    private CreateOrderDetailViewModel CurrentDetailSelectingProduct { get; set; }

    private bool ShowInvoiceVoucherModal { get; set; }
    private InvoiceResponseDto CurrentInvoiceVoucher { get; set; }

    private CancellationTokenSource _customerPickerCts;
    private CancellationTokenSource _productPickerCts;

    protected override async Task OnInitializedAsync()
    {
        await PreloadCatalogAsync();
    }

    private async Task PreloadCatalogAsync()
    {
        try
        {
            var filter = new ProductFilterDto { StockFilter = 1 };
            var list = await ProductsGateway.GetProductsAsync(filter);
            AllCatalogProducts = list?.ToList() ?? [];
            AvailableProducts = AllCatalogProducts.ToList();

            if (Order?.OrderDetails != null)
            {
                foreach (var detail in Order.OrderDetails)
                {
                    if (detail.ProductId > 0 && detail.UnitsInStock == 0)
                    {
                        var prod = AllCatalogProducts.FirstOrDefault(p => p.Id == detail.ProductId);
                        if (prod != null)
                        {
                            detail.UnitsInStock = prod.UnitsInStock;
                            if (string.IsNullOrEmpty(detail.ProductName))
                                detail.ProductName = prod.Name;
                        }
                    }
                }
            }

            var custs = await CustomersGateway.GetCustomersAsync(new CustomerFilterDto());
            AllCatalogCustomers = custs?.ToList() ?? [];
            AvailableCustomers = AllCatalogCustomers.ToList();
        }
        catch {}
    }

    private void HandleProductIdInput(CreateOrderDetailViewModel item, ChangeEventArgs e)
    {
        if (int.TryParse(e.Value?.ToString(), out var id))
        {
            OnProductIdChanged(item, id);
        }
    }

    private void OnProductIdChanged(CreateOrderDetailViewModel item, int newId)
    {
        item.ProductId = newId;
        var p = AvailableProducts.FirstOrDefault(x => x.Id == newId)
            ?? AllCatalogProducts.FirstOrDefault(x => x.Id == newId);
        if (p != null)
        {
            item.ProductName = p.Name;
            item.UnitsInStock = p.UnitsInStock;
            if (item.UnitPrice == 0)
            {
                item.UnitPrice = p.UnitPrice;
            }
        }
        else
        {
            item.ProductName = "";
            item.UnitsInStock = 0;
        }
    }

    private async Task HandleCustomerIdInput(ChangeEventArgs e)
    {
        var raw = e.Value?.ToString() ?? "";
        var lettersOnly = new string(raw.Where(char.IsLetter).Take(5).ToArray()).ToUpperInvariant();
        await OnCustomerIdChanged(lettersOnly);
    }

    private void HandleCustomerDocumentInput(ChangeEventArgs e)
    {
        var raw = e.Value?.ToString() ?? "";
        var digitsOnly = new string(raw.Where(char.IsDigit).Take(13).ToArray());
        Order.CustomerDocument = digitsOnly;
    }

    private static bool IsValidEcuadorianCedula(string cedula)
    {
        if (string.IsNullOrWhiteSpace(cedula) || cedula.Length != 10 || !cedula.All(char.IsDigit))
            return false;

        int province = int.Parse(cedula.AsSpan(0, 2));
        if ((province < 1 || province > 24) && province != 30)
            return false;

        int thirdDigit = cedula[2] - '0';
        if (thirdDigit >= 6)
            return false;

        int[] coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        int sum = 0;
        for (int i = 0; i < 9; i++)
        {
            int val = (cedula[i] - '0') * coefficients[i];
            if (val >= 10) val -= 9;
            sum += val;
        }

        int remainder = sum % 10;
        int expectedVerifier = remainder == 0 ? 0 : 10 - remainder;

        return expectedVerifier == (cedula[9] - '0');
    }

    private static bool IsValidEcuadorianRuc(string ruc)
    {
        if (string.IsNullOrWhiteSpace(ruc) || ruc.Length != 13 || !ruc.All(char.IsDigit))
            return false;

        int province = int.Parse(ruc.AsSpan(0, 2));
        if ((province < 1 || province > 24) && province != 30)
            return false;

        int thirdDigit = ruc[2] - '0';

        if (thirdDigit < 6)
        {
            if (!IsValidEcuadorianCedula(ruc[..10]))
                return false;

            string establishment = ruc.Substring(10, 3);
            return establishment != "000";
        }

        if (thirdDigit == 9)
        {
            int[] coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
            int sum = 0;
            for (int i = 0; i < 9; i++)
            {
                sum += (ruc[i] - '0') * coefficients[i];
            }
            int remainder = sum % 11;
            int verifier = remainder == 0 ? 0 : 11 - remainder;
            if (verifier == 10) return false;
            if (verifier != (ruc[9] - '0'))
                return false;

            string establishment = ruc.Substring(10, 3);
            return establishment != "000";
        }

        if (thirdDigit == 6)
        {
            int[] coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
            int sum = 0;
            for (int i = 0; i < 8; i++)
            {
                sum += (ruc[i] - '0') * coefficients[i];
            }
            int remainder = sum % 11;
            int verifier = remainder == 0 ? 0 : 11 - remainder;
            if (verifier == 10) return false;
            if (verifier != (ruc[8] - '0'))
                return false;

            string establishment = ruc.Substring(9, 4);
            return establishment != "0000";
        }

        return false;
    }

    private async Task OnCustomerIdChanged(string newId)
    {
        Order.CustomerId = newId?.Trim().ToUpper() ?? "";
        CustomerSelectedError = "";
        CustomerPickerWarning = "";

        if (!string.IsNullOrWhiteSpace(Order.CustomerId))
        {
            var cust = AvailableCustomers.FirstOrDefault(c => c.Id.Equals(Order.CustomerId, StringComparison.OrdinalIgnoreCase));
            if (cust == null && Order.CustomerId.Length == 5)
            {
                var list = await CustomersGateway.GetCustomersAsync(new CustomerFilterDto { SearchTerm = Order.CustomerId });
                cust = list?.FirstOrDefault(c => c.Id.Equals(Order.CustomerId, StringComparison.OrdinalIgnoreCase));
            }

            if (cust != null)
            {
                CustomerNameSelected = cust.Name;
                CustomerTypeSelected = cust.CustomerType ?? "Persona Natural";
                if (cust.CurrentBalance > 0)
                {
                    CustomerSelectedError = $"El cliente '{cust.Name}' ({cust.Id}) tiene un saldo deudor de ${cust.CurrentBalance:N2}. No se puede registrar la orden.";
                }
            }
            else
            {
                CustomerNameSelected = "";
                CustomerTypeSelected = "";
            }
        }
        else
        {
            CustomerNameSelected = "";
            CustomerTypeSelected = "";
        }
    }

    private async Task HandleValidSubmit()
    {
        if (!string.IsNullOrEmpty(CustomerSelectedError))
        {
            return;
        }

        await Order.Send();
        if (Order.GeneratedInvoice != null)
        {
            CustomerNameSelected = "";
            CustomerTypeSelected = "";
            CustomerSelectedError = "";
            ViewInvoiceVoucher(Order.GeneratedInvoice);
        }
    }

    private void ViewInvoiceVoucher(InvoiceResponseDto invoice)
    {
        CurrentInvoiceVoucher = invoice;
        ShowInvoiceVoucherModal = true;
    }

    private void CloseInvoiceVoucher()
    {
        ShowInvoiceVoucherModal = false;
        CurrentInvoiceVoucher = null;
    }

    private async Task PrintInvoiceAsync()
    {
        try
        {
            await JSRuntime.InvokeVoidAsync("window.print");
        }
        catch {}
    }

    private async Task RemoveOrderDetailItem(CreateOrderDetailViewModel item)
    {
        bool confirmed = await JSRuntime.InvokeAsync<bool>("confirm", CreateOrderMessages.ConfirmDeleteDetailMessage);
        if (confirmed)
        {
            Order.RemoveOrderDetailItem(item);
        }
    }

    private async Task OpenCustomerPicker()
    {
        CustomerPickerSearchTerm = "";
        CustomerPickerSearchType = "all";
        CustomerPickerCustomerType = "";
        CustomerPickerWarning = "";
        ShowCustomerPicker = true;
        await FilterCustomers();
    }

    private async Task SetCustomerPickerType(string type)
    {
        CustomerPickerCustomerType = type ?? "";
        await FilterCustomers();
    }

    private async Task OnCustomerPickerSearchTypeChanged(ChangeEventArgs e)
    {
        CustomerPickerSearchType = e.Value?.ToString() ?? "all";
        await FilterCustomers();
    }

    private async Task ClearCustomerPickerSearch()
    {
        CustomerPickerSearchTerm = "";
        await FilterCustomers();
    }

    private string GetCustomerSearchPlaceholder() => CustomerPickerSearchType switch
    {
        "code" => "Buscar específicamente por código (ej: ALFKI)...",
        "name" => "Buscar específicamente por nombre...",
        _ => "Buscar por código o nombre..."
    };

    private async Task OnCustomerPickerInput(ChangeEventArgs e)
    {
        CustomerPickerSearchTerm = e.Value?.ToString() ?? "";
        CustomerPickerWarning = "";
        _customerPickerCts?.Cancel();
        _customerPickerCts = new CancellationTokenSource();
        var token = _customerPickerCts.Token;

        try
        {
            await Task.Delay(200, token);
            if (!token.IsCancellationRequested)
            {
                await FilterCustomers();
            }
        }
        catch (TaskCanceledException)
        {
        }
    }

    private async Task FilterCustomers()
    {
        if (AllCatalogCustomers == null || AllCatalogCustomers.Count == 0)
        {
            var list = await CustomersGateway.GetCustomersAsync(new CustomerFilterDto());
            AllCatalogCustomers = list?.ToList() ?? [];
        }

        var query = AllCatalogCustomers.AsEnumerable();

        if (!string.IsNullOrEmpty(CustomerPickerCustomerType))
        {
            query = query.Where(c => string.Equals(c.CustomerType, CustomerPickerCustomerType, StringComparison.OrdinalIgnoreCase));
        }

        var term = CustomerPickerSearchTerm?.Trim() ?? "";
        if (!string.IsNullOrEmpty(term))
        {
            query = CustomerPickerSearchType switch
            {
                "code" => query.Where(c => c.Id != null && c.Id.Contains(term, StringComparison.OrdinalIgnoreCase)),
                "name" => query.Where(c => c.Name != null && c.Name.Contains(term, StringComparison.OrdinalIgnoreCase)),
                _ => query.Where(c => (c.Id != null && c.Id.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                                      (c.Name != null && c.Name.Contains(term, StringComparison.OrdinalIgnoreCase)))
            };
        }

        AvailableCustomers = query.ToList();
    }

    private void SelectCustomer(CustomerDto customer)
    {
        if (customer.CurrentBalance > 0)
        {
            CustomerPickerWarning = $"No se puede seleccionar al cliente '{customer.Name}' ({customer.Id}) porque posee un saldo deudor pendiente de ${customer.CurrentBalance:N2}. Los clientes con saldo pendiente no están autorizados para emitir nuevas órdenes de compra.";
            return;
        }

        Order.CustomerId = customer.Id;
        CustomerNameSelected = customer.Name;
        CustomerTypeSelected = customer.CustomerType ?? "Persona Natural";
        CustomerSelectedError = "";
        CustomerPickerWarning = "";
        ShowCustomerPicker = false;
    }

    private bool IsProductAlreadySelected(int productId)
    {
        return Order.OrderDetails.Any(d => d != CurrentDetailSelectingProduct && d.ProductId == productId);
    }

    private bool HasDuplicateProduct(CreateOrderDetailViewModel item)
    {
        return item.ProductId > 0 && Order.OrderDetails.Count(d => d.ProductId == item.ProductId) > 1;
    }

    private async Task OpenProductPicker(CreateOrderDetailViewModel item)
    {
        CurrentDetailSelectingProduct = item;
        ProductPickerSearchTerm = "";
        ProductPickerSearchType = "all";
        ProductPickerWarning = "";
        ShowProductPicker = true;
        await FilterProducts();
    }

    private async Task OnProductPickerSearchTypeChanged(ChangeEventArgs e)
    {
        ProductPickerSearchType = e.Value?.ToString() ?? "all";
        await FilterProducts();
    }

    private async Task ClearProductPickerSearch()
    {
        ProductPickerSearchTerm = "";
        await FilterProducts();
    }

    private string GetProductSearchPlaceholder() => ProductPickerSearchType switch
    {
        "id" => "Buscar específicamente por ID (ej: 1, 2)...",
        "name" => "Buscar específicamente por nombre...",
        _ => "Buscar por nombre o ID de producto..."
    };

    private async Task OpenProductPickerForNewItem()
    {
        var newItem = new CreateOrderDetailViewModel();
        Order.OrderDetails.Add(newItem);
        await OpenProductPicker(newItem);
    }

    private async Task OnProductPickerInput(ChangeEventArgs e)
    {
        ProductPickerSearchTerm = e.Value?.ToString() ?? "";
        ProductPickerWarning = "";
        _productPickerCts?.Cancel();
        _productPickerCts = new CancellationTokenSource();
        var token = _productPickerCts.Token;

        try
        {
            await Task.Delay(200, token);
            if (!token.IsCancellationRequested)
            {
                await FilterProducts();
            }
        }
        catch (TaskCanceledException)
        {
        }
    }

    private async Task FilterProducts()
    {
        if (AllCatalogProducts == null || AllCatalogProducts.Count == 0)
        {
            var list = await ProductsGateway.GetProductsAsync(new ProductFilterDto { StockFilter = 1 });
            AllCatalogProducts = list?.ToList() ?? [];
        }

        var term = ProductPickerSearchTerm?.Trim() ?? "";
        if (string.IsNullOrEmpty(term))
        {
            AvailableProducts = AllCatalogProducts.ToList();
            return;
        }

        AvailableProducts = ProductPickerSearchType switch
        {
            "id" => AllCatalogProducts
                .Where(p => p.Id.ToString().Contains(term, StringComparison.OrdinalIgnoreCase))
                .ToList(),
            "name" => AllCatalogProducts
                .Where(p => p.Name != null && p.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
                .ToList(),
            _ => AllCatalogProducts
                .Where(p => p.Id.ToString().Contains(term, StringComparison.OrdinalIgnoreCase) ||
                            (p.Name != null && p.Name.Contains(term, StringComparison.OrdinalIgnoreCase)))
                .ToList()
        };
    }

    private void SelectProduct(ProductDto product)
    {
        if (IsProductAlreadySelected(product.Id))
        {
            ProductPickerWarning = $"El producto '{product.Name}' ya está incluido en la orden. Modifica la cantidad en su fila o elimínala antes de volver a seleccionarlo.";
            return;
        }

        if (CurrentDetailSelectingProduct != null)
        {
            CurrentDetailSelectingProduct.ProductId = product.Id;
            CurrentDetailSelectingProduct.ProductName = product.Name;
            CurrentDetailSelectingProduct.UnitPrice = product.UnitPrice;
            CurrentDetailSelectingProduct.UnitsInStock = product.UnitsInStock;
            if (CurrentDetailSelectingProduct.Quantity <= 0)
            {
                CurrentDetailSelectingProduct.Quantity = 1;
            }
        }
        ShowProductPicker = false;
        CurrentDetailSelectingProduct = null;
        ProductPickerWarning = "";
    }

    private void ClosePickers()
    {
        if (CurrentDetailSelectingProduct != null && CurrentDetailSelectingProduct.ProductId == 0 && string.IsNullOrEmpty(CurrentDetailSelectingProduct.ProductName))
        {
            Order.OrderDetails.Remove(CurrentDetailSelectingProduct);
        }
        ShowCustomerPicker = false;
        ShowProductPicker = false;
        CurrentDetailSelectingProduct = null;
        ProductPickerWarning = "";
        CustomerPickerWarning = "";
    }

    public void Dispose()
    {
        _customerPickerCts?.Cancel();
        _customerPickerCts?.Dispose();
        _productPickerCts?.Cancel();
        _productPickerCts?.Dispose();
    }
}
