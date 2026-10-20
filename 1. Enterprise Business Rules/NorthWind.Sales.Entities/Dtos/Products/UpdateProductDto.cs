namespace NorthWind.Sales.Entities.Dtos.Products;

public class UpdateProductDto
{
    public UpdateProductDto() { }

    public UpdateProductDto(int id, string name, short unitsInStock, decimal unitPrice)
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
