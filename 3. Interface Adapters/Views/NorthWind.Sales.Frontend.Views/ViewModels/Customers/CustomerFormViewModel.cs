namespace NorthWind.Sales.Frontend.Views.ViewModels.Customers;

public class CustomerFormViewModel
{
    private string _id = "";
    public string Id
    {
        get => _id;
        set => _id = string.IsNullOrEmpty(value) ? "" : new string(value.Where(char.IsLetter).Take(5).ToArray()).ToUpperInvariant();
    }

    private string _name = "";
    public string Name
    {
        get => _name;
        set => _name = string.IsNullOrEmpty(value) ? "" : new string(value.Where(c => char.IsLetter(c) || char.IsWhiteSpace(c)).ToArray());
    }

    public decimal CurrentBalance { get; set; }

    public string CustomerType { get; set; } = "Persona Natural";

    public bool IsEditMode { get; set; }

    public void Reset()
    {
        _id = "";
        _name = "";
        CurrentBalance = 0;
        CustomerType = "Persona Natural";
        IsEditMode = false;
    }

    public static explicit operator CreateCustomerDto(CustomerFormViewModel model) =>
        new CreateCustomerDto(model.Id?.ToUpperInvariant()?.Trim() ?? "", model.Name?.Trim() ?? "", model.CurrentBalance, model.CustomerType ?? "Persona Natural");

    public static explicit operator UpdateCustomerDto(CustomerFormViewModel model) =>
        new UpdateCustomerDto(model.Id?.ToUpperInvariant()?.Trim() ?? "", model.Name?.Trim() ?? "", model.CurrentBalance, model.CustomerType ?? "Persona Natural");
}
