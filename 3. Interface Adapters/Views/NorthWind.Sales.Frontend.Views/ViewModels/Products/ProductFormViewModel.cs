namespace NorthWind.Sales.Frontend.Views.ViewModels.Products;

public class ProductFormViewModel
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public short UnitsInStock { get; set; }
    public decimal UnitPrice { get; set; }

    public bool IsEditMode => Id > 0;

    public void Reset()
    {
        Id = 0;
        Name = "";
        UnitsInStock = 0;
        UnitPrice = 0;
    }

    public static explicit operator CreateProductDto(ProductFormViewModel model) =>
        new CreateProductDto(model.Name, model.UnitsInStock, model.UnitPrice);

    public static explicit operator UpdateProductDto(ProductFormViewModel model) =>
        new UpdateProductDto(model.Id, model.Name, model.UnitsInStock, model.UnitPrice);
}
