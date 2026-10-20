namespace NorthWind.Sales.Entities.Dtos.Products;

public class CreateProductDto
{
    public CreateProductDto() { }

    public CreateProductDto(string name, short unitsInStock, decimal unitPrice)
    {
        Name = name;
        UnitsInStock = unitsInStock;
        UnitPrice = unitPrice;
    }

    public string Name { get; set; }
    public short UnitsInStock { get; set; }
    public decimal UnitPrice { get; set; }
}
