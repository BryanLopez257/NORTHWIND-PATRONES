using NorthWind.Sales.Entities.Enums;

namespace NorthWind.Sales.Entities.Dtos.Customers;

public class UpdateCustomerDto
{
    public UpdateCustomerDto() { }

    public UpdateCustomerDto(
        string id,
        string name,
        decimal currentBalance,
        CustomerType customerType = CustomerType.Legal,
        string identification = "",
        string? firstName = null,
        string? secondName = null,
        string? lastName = null,
        string? secondLastName = null,
        string? businessName = null,
        string? tradeName = null)
    {
        Id = id;
        Name = name;
        CurrentBalance = currentBalance;
        CustomerType = customerType;
        Identification = identification;
        FirstName = firstName;
        SecondName = secondName;
        LastName = lastName;
        SecondLastName = secondLastName;
        BusinessName = businessName;
        TradeName = tradeName;
    }

    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal CurrentBalance { get; set; }
    public CustomerType CustomerType { get; set; } = CustomerType.Legal;
    public string Identification { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? SecondName { get; set; }
    public string? LastName { get; set; }
    public string? SecondLastName { get; set; }
    public string? BusinessName { get; set; }
    public string? TradeName { get; set; }
}
