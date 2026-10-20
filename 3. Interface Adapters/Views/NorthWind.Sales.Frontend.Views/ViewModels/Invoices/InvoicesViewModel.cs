using Microsoft.AspNetCore.Components;

namespace NorthWind.Sales.Frontend.Views.ViewModels.Invoices;

public class InvoicesViewModel(
    IInvoicesGateway invoicesGateway,
    ICustomersGateway customersGateway,
    IProductsGateway productsGateway)
{
    // Navegación de Pestañas
    public int ActiveTab { get; set; } = 1; // 1 = Nueva Factura, 2 = Historial

    // Estado de Facturación (Nueva Factura)
    public CustomerDto SelectedCustomer { get; private set; }
    public string CustomerId { get; set; }
    public string CustomerAddress { get; set; }
    public string CustomerPhone { get; set; }
    public string CustomerEmail { get; set; }
    public List<InvoiceItemViewModel> Items { get; set; } = [];

    public decimal SubTotal => Items.Sum(i => i.SubTotal);
    public decimal Tax => Math.Round(SubTotal * 0.15m, 2);
    public decimal Total => SubTotal + Tax;

    // Selector de Clientes Modal
    public bool ShowCustomerPickerModal { get; set; }
    public string CustomerPickerSearchTerm { get; set; }
    public List<CustomerDto> AvailableCustomers { get; private set; } = [];

    // Selector de Productos Modal
    public bool ShowProductPickerModal { get; set; }
    public string ProductPickerSearchTerm { get; set; }
    public List<ProductDto> AvailableProducts { get; private set; } = [];

    // Estado del Historial y Búsqueda Segmentada
    public List<InvoiceResponseDto> Invoices { get; private set; } = [];
    public InvoiceFilterDto Filter { get; set; } = new();
    public string SearchType { get; set; } = "all"; // all, invoice, customer_name, customer_id
    public string SearchTerm { get; set; } = "";
    private List<InvoiceResponseDto> _allInvoices = [];

    // Estado del Voucher / Comprobante Modal
    public InvoiceResponseDto CurrentInvoiceVoucher { get; private set; }
    public bool ShowVoucherModal { get; set; }

    // Control de Estado UI
    public bool IsLoading { get; private set; }
    public string SuccessMessage { get; set; }
    public string ErrorMessage { get; set; }

    public async Task InitializeAsync()
    {
        await LoadInvoicesAsync();
        await PreloadCatalogDataAsync();
    }

    public async Task PreloadCatalogDataAsync()
    {
        try
        {
            var customers = await customersGateway.GetCustomersAsync(new CustomerFilterDto());
            AvailableCustomers = customers?.ToList() ?? [];

            var products = await productsGateway.GetProductsAsync(new ProductFilterDto());
            AvailableProducts = products?.Where(p => p.UnitsInStock > 0).ToList() ?? [];
        }
        catch {}
    }

    public async Task LoadInvoicesAsync()
    {
        IsLoading = true;
        ErrorMessage = null;
        try
        {
            var list = await invoicesGateway.GetInvoicesAsync(new InvoiceFilterDto());
            _allInvoices = list?.ToList() ?? [];
            ApplySearch();
        }
        catch (HttpRequestException ex)
        {
            ErrorMessage = ExtractErrorMessage(ex);
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    public void OnSearchTypeChanged(ChangeEventArgs e)
    {
        SearchType = e.Value?.ToString() ?? "all";
        ApplySearch();
    }

    public void OnSearchInput(ChangeEventArgs e)
    {
        SearchTerm = e.Value?.ToString() ?? "";
        ApplySearch();
    }

    public void ClearSearch()
    {
        SearchTerm = "";
        ApplySearch();
    }

    public void ResetSearch()
    {
        SearchTerm = "";
        SearchType = "all";
        ApplySearch();
    }

    public void ApplySearch()
    {
        if (string.IsNullOrWhiteSpace(SearchTerm))
        {
            Invoices = [.. _allInvoices];
            return;
        }

        var term = SearchTerm.Trim();
        Invoices = SearchType switch
        {
            "invoice" => _allInvoices.Where(i => i.InvoiceNumber != null && i.InvoiceNumber.Contains(term, StringComparison.OrdinalIgnoreCase)).ToList(),
            "customer_name" => _allInvoices.Where(i => i.CustomerFullName != null && i.CustomerFullName.Contains(term, StringComparison.OrdinalIgnoreCase)).ToList(),
            "customer_id" => _allInvoices.Where(i => i.CustomerId != null && i.CustomerId.Contains(term, StringComparison.OrdinalIgnoreCase)).ToList(),
            _ => _allInvoices.Where(i =>
                (i.InvoiceNumber != null && i.InvoiceNumber.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                (i.CustomerFullName != null && i.CustomerFullName.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                (i.CustomerId != null && i.CustomerId.Contains(term, StringComparison.OrdinalIgnoreCase))
            ).ToList()
        };
    }

    public string GetSearchPlaceholder() => SearchType switch
    {
        "invoice" => "Buscar por N° Factura (ej. FAC-000001)...",
        "customer_name" => "Buscar por Nombre del Cliente...",
        "customer_id" => "Buscar por Código del Cliente (ej. ALFKI)...",
        _ => "Buscar por N° Factura, Nombre o Código de Cliente..."
    };

    public Task ApplyFilterAsync()
    {
        ApplySearch();
        return Task.CompletedTask;
    }

    public Task ResetFilterAsync()
    {
        ResetSearch();
        return Task.CompletedTask;
    }

    // Modal Cliente
    public void OpenCustomerPicker()
    {
        CustomerPickerSearchTerm = "";
        ShowCustomerPickerModal = true;
    }

    public void CloseCustomerPicker()
    {
        ShowCustomerPickerModal = false;
    }

    public void SelectCustomer(CustomerDto customer)
    {
        SelectedCustomer = customer;
        CustomerId = customer.Id;
        ShowCustomerPickerModal = false;
    }

    // Modal Producto
    public void OpenProductPicker()
    {
        ProductPickerSearchTerm = "";
        ShowProductPickerModal = true;
    }

    public void CloseProductPicker()
    {
        ShowProductPickerModal = false;
    }

    public void SelectProduct(ProductDto product)
    {
        var existing = Items.FirstOrDefault(i => i.ProductId == product.Id);
        if (existing != null)
        {
            if (existing.Quantity < product.UnitsInStock)
            {
                existing.Quantity++;
            }
        }
        else
        {
            Items.Add(new InvoiceItemViewModel
            {
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.UnitPrice,
                Quantity = 1,
                AvailableStock = product.UnitsInStock
            });
        }
        ShowProductPickerModal = false;
    }

    public void RemoveItem(InvoiceItemViewModel item)
    {
        Items.Remove(item);
    }

    public void UpdateItemQuantity(InvoiceItemViewModel item, int newQuantity)
    {
        if (newQuantity <= 0)
        {
            item.Quantity = 1;
        }
        else if (newQuantity > item.AvailableStock)
        {
            item.Quantity = item.AvailableStock;
        }
        else
        {
            item.Quantity = newQuantity;
        }
    }

    public void ResetForm()
    {
        SelectedCustomer = null;
        CustomerId = null;
        CustomerAddress = null;
        CustomerPhone = null;
        CustomerEmail = null;
        Items.Clear();
        SuccessMessage = null;
        ErrorMessage = null;
    }

    public async Task EmitInvoiceAsync()
    {
        ErrorMessage = null;
        SuccessMessage = null;

        if (string.IsNullOrWhiteSpace(CustomerId))
        {
            ErrorMessage = "Debe seleccionar un cliente para emitir la factura.";
            return;
        }

        if (Items.Count == 0)
        {
            ErrorMessage = "Debe agregar al menos un producto a la factura.";
            return;
        }

        foreach (var item in Items)
        {
            if (item.Quantity <= 0)
            {
                ErrorMessage = $"La cantidad para el producto '{item.ProductName}' debe ser mayor a 0.";
                return;
            }
        }

        IsLoading = true;
        try
        {
            var createDto = new CreateInvoiceDto
            {
                CustomerId = CustomerId,
                CustomerAddress = CustomerAddress,
                CustomerPhone = CustomerPhone,
                CustomerEmail = CustomerEmail,
                Details = Items.Select(i => new CreateInvoiceDetailDto(i.ProductId, i.Quantity)).ToList()
            };

            var createdInvoice = await invoicesGateway.CreateInvoiceAsync(createDto);

            SuccessMessage = $"¡Factura {createdInvoice.InvoiceNumber} emitida exitosamente!";
            CurrentInvoiceVoucher = createdInvoice;
            ShowVoucherModal = true;

            ResetForm();
            await LoadInvoicesAsync();
            await PreloadCatalogDataAsync();
        }
        catch (HttpRequestException ex)
        {
            ErrorMessage = ExtractErrorMessage(ex);
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    public void OpenVoucher(InvoiceResponseDto invoice)
    {
        CurrentInvoiceVoucher = invoice;
        ShowVoucherModal = true;
    }

    public void CloseVoucher()
    {
        ShowVoucherModal = false;
        CurrentInvoiceVoucher = null;
    }

    private static string ExtractErrorMessage(HttpRequestException ex)
    {
        if (ex.Data.Contains("Errors") && ex.Data["Errors"] is IEnumerable<ValidationError> errors)
        {
            return string.Join(" | ", errors.Select(e => e.Message));
        }

        return !string.IsNullOrWhiteSpace(ex.Message)
            ? ex.Message
            : "Ocurrió un error inesperado al procesar la factura.";
    }
}
