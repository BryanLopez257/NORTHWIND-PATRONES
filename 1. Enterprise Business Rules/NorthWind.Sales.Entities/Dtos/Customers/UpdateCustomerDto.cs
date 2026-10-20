namespace NorthWind.Sales.Entities.Dtos.Customers;

public class UpdateCustomerDto
{
    public UpdateCustomerDto() { }

    public UpdateCustomerDto(string id, string name, decimal currentBalance, string customerType = "Empresa")
    {
        Id = id;
        Name = name;
        CurrentBalance = currentBalance;
        CustomerType = customerType;
    }

    public string Id { get; set; }
    public string Name { get; set; }
    public decimal CurrentBalance { get; set; }
    public string CustomerType { get; set; } = "Empresa";
}
