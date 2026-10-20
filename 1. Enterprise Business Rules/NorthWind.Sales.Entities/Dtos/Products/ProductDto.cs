namespace NorthWind.Sales.Entities.Dtos.Products;

public class ProductDto
{
    public ProductDto() { }

    public ProductDto(int id, string name, short unitsInStock, decimal unitPrice)
    {
        Id = id;
        Name = name;
        UnitsInStock = unitsInStock;
        UnitPrice = unitPrice;
    }

    public int Id { get; set; }
    public string Name { get; set; }
    public short UnitsInStock { get; set; }
    public decimal UnitPrice { get; set; }
}
