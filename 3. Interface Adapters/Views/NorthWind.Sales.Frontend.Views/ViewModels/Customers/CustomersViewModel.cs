namespace NorthWind.Sales.Frontend.Views.ViewModels.Customers;

public class CustomersViewModel(ICustomersGateway gateway)
{
    public List<CustomerDto> Customers { get; private set; } = [];
    public CustomerFilterDto Filter { get; set; } = new();
    public CustomerFormViewModel CurrentCustomer { get; set; } = new();
    public CustomerDto CustomerToDelete { get; private set; }

    public bool IsFormModalOpen { get; set; }
    public bool IsDeleteModalOpen { get; set; }
    public bool IsLoading { get; private set; }
    public string SuccessMessage { get; set; }
    public string ErrorMessage { get; set; }

    public async Task InitializeAsync()
    {
        await LoadCustomers();
    }

    public async Task LoadCustomers()
    {
        IsLoading = true;
        ErrorMessage = null;
        try
        {
            var result = await gateway.GetCustomersAsync(Filter);
            Customers = result?.ToList() ?? [];
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
        await LoadCustomers();
    }

    public async Task SetCustomerTypeFilter(string customerType)
    {
        Filter.CustomerType = string.IsNullOrWhiteSpace(customerType) ? null : customerType;
        await LoadCustomers();
    }

    public async Task ResetFilters()
    {
        Filter = new CustomerFilterDto();
        await LoadCustomers();
    }

    public void OpenCreateModal()
    {
        CurrentCustomer = new CustomerFormViewModel { IsEditMode = false };
        SuccessMessage = null;
        ErrorMessage = null;
        IsFormModalOpen = true;
    }

    public void OpenEditModal(CustomerDto customer)
    {
        CurrentCustomer = new CustomerFormViewModel
        {
            Id = customer.Id,
            Name = customer.Name,
            CurrentBalance = customer.CurrentBalance,
            CustomerType = customer.CustomerType ?? "Persona Natural",
            IsEditMode = true
        };
        SuccessMessage = null;
        ErrorMessage = null;
        IsFormModalOpen = true;
    }

    public void CloseFormModal()
    {
        IsFormModalOpen = false;
        CurrentCustomer.Reset();
    }

    public void OpenDeleteModal(CustomerDto customer)
    {
        CustomerToDelete = customer;
        SuccessMessage = null;
        ErrorMessage = null;
        IsDeleteModalOpen = true;
    }

    public void CloseDeleteModal()
    {
        IsDeleteModalOpen = false;
        CustomerToDelete = null;
    }

    public async Task SaveCustomer()
    {
        ErrorMessage = null;
        SuccessMessage = null;

        if (!CurrentCustomer.IsEditMode)
        {
            if (string.IsNullOrWhiteSpace(CurrentCustomer.Id))
            {
                ErrorMessage = "El identificador del cliente es obligatorio.";
                return;
            }
            if (CurrentCustomer.Id.Length != 5)
            {
                ErrorMessage = "El identificador del cliente debe tener exactamente 5 caracteres.";
                return;
            }
            if (!CurrentCustomer.Id.All(char.IsLetter))
            {
                ErrorMessage = "El identificador del cliente solo debe contener letras, no se permiten números.";
                return;
            }
        }

        if (string.IsNullOrWhiteSpace(CurrentCustomer.Name))
        {
            ErrorMessage = "El nombre o razón social del cliente es obligatorio.";
            return;
        }

        if (CurrentCustomer.Name.Any(char.IsDigit) || !CurrentCustomer.Name.All(c => char.IsLetter(c) || char.IsWhiteSpace(c)))
        {
            ErrorMessage = "El nombre del cliente solo debe contener letras, no se permiten números.";
            return;
        }

        if (string.IsNullOrWhiteSpace(CurrentCustomer.CustomerType))
        {
            ErrorMessage = "Debe seleccionar si el cliente es Persona Natural o Empresa.";
            return;
        }

        IsLoading = true;

        try
        {
            if (CurrentCustomer.IsEditMode)
            {
                var updated = await gateway.UpdateCustomerAsync((UpdateCustomerDto)CurrentCustomer);
                SuccessMessage = string.Format(CustomersMessages.CustomerUpdatedSuccess, updated.Name);
            }
            else
            {
                var created = await gateway.CreateCustomerAsync((CreateCustomerDto)CurrentCustomer);
                SuccessMessage = string.Format(CustomersMessages.CustomerCreatedSuccess, created.Name);
            }

            CloseFormModal();
            await LoadCustomers();
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
        if (CustomerToDelete == null) return;

        ErrorMessage = null;
        SuccessMessage = null;
        IsLoading = true;

        try
        {
            var success = await gateway.DeleteCustomerAsync(CustomerToDelete.Id);
            if (success)
            {
                SuccessMessage = CustomersMessages.CustomerDeletedSuccess;
            }
            CloseDeleteModal();
            await LoadCustomers();
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
