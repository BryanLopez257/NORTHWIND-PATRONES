namespace NorthWind.Sales.Validators.Entities.Resources;

public static class ProductMessages
{
    public static string NameRequired => "El nombre del producto es obligatorio.";
    public static string NameMaxLength => "El nombre del producto no puede exceder los 40 caracteres.";
    public static string UnitPriceGreaterThanZero => "El precio unitario debe ser mayor que cero.";
    public static string UnitsInStockPositive => "Las unidades en stock no pueden ser negativas.";
    public static string IdGreaterThanZero => "El identificador del producto debe ser mayor que cero.";
}
