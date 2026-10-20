namespace NorthWind.Sales.Frontend.Views.ViewModels.Products;

public class ProductsViewModel(IProductsGateway gateway)
{
    public List<ProductDto> Products { get; private set; } = [];
    public ProductFilterDto Filter { get; set; } = new();
    public ProductFormViewModel CurrentProduct { get; set; } = new();
    public ProductDto ProductToDelete { get; private set; }

    public bool IsFormModalOpen { get; set; }
    public bool IsDeleteModalOpen { get; set; }
    public bool IsLoading { get; private set; }
    public string SuccessMessage { get; set; }
    public string ErrorMessage { get; set; }

    public async Task InitializeAsync()
    {
        await LoadProducts();
    }

    public async Task LoadProducts()
    {
        IsLoading = true;
        ErrorMessage = null;
        try
        {
            var result = await gateway.GetProductsAsync(Filter);
            Products = result?.ToList() ?? [];
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

    public async Task ApplyFilters()
    {
        await LoadProducts();
    }

    public async Task ResetFilters()
    {
        Filter = new ProductFilterDto();
        await LoadProducts();
    }

    public void OpenCreateModal()
    {
        CurrentProduct = new ProductFormViewModel();
        SuccessMessage = null;
        ErrorMessage = null;
        IsFormModalOpen = true;
    }

    public void OpenEditModal(ProductDto product)
    {
        CurrentProduct = new ProductFormViewModel
        {
            Id = product.Id,
            Name = product.Name,
            UnitPrice = product.UnitPrice,
            UnitsInStock = product.UnitsInStock
        };
        SuccessMessage = null;
        ErrorMessage = null;
        IsFormModalOpen = true;
    }

    public void CloseFormModal()
    {
        IsFormModalOpen = false;
        CurrentProduct.Reset();
    }

    public void OpenDeleteModal(ProductDto product)
    {
        ProductToDelete = product;
        SuccessMessage = null;
        ErrorMessage = null;
        IsDeleteModalOpen = true;
    }

    public void CloseDeleteModal()
    {
        IsDeleteModalOpen = false;
        ProductToDelete = null;
    }

    public async Task SaveProduct()
    {
        ErrorMessage = null;
        SuccessMessage = null;
        IsLoading = true;

        try
        {
            if (CurrentProduct.IsEditMode)
            {
                var updated = await gateway.UpdateProductAsync((UpdateProductDto)CurrentProduct);
                SuccessMessage = string.Format(ProductsMessages.ProductUpdatedSuccess, updated.Name);
            }
            else
            {
                var created = await gateway.CreateProductAsync((CreateProductDto)CurrentProduct);
                SuccessMessage = string.Format(ProductsMessages.ProductCreatedSuccess, created.Name);
            }

            CloseFormModal();
            await LoadProducts();
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

    public async Task ConfirmDelete()
    {
        if (ProductToDelete == null) return;

        ErrorMessage = null;
        SuccessMessage = null;
        IsLoading = true;

        try
        {
            var success = await gateway.DeleteProductAsync(ProductToDelete.Id);
            if (success)
            {
                SuccessMessage = ProductsMessages.ProductDeletedSuccess;
            }
            CloseDeleteModal();
            await LoadProducts();
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

    private static string ExtractErrorMessage(HttpRequestException ex)
    {
        if (ex.Data.Contains("Errors") && ex.Data["Errors"] is IEnumerable<ValidationError> errors)
        {
            return string.Join(" | ", errors.Select(e => e.Message));
        }

        return !string.IsNullOrWhiteSpace(ex.Message)
            ? ex.Message
            : "Ocurrió un error inesperado al procesar la solicitud.";
    }
}
