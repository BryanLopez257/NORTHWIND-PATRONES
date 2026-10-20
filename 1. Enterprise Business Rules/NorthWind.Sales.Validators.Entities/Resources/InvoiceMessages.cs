namespace NorthWind.Sales.Validators.Entities.Resources;

public static class InvoiceMessages
{
    public const string CustomerIdRequired = "El identificador del cliente es requerido.";
    public const string CustomerIdRequiredLength = "El identificador del cliente debe tener 5 caracteres.";
    public const string InvoiceDetailsRequired = "Debe proporcionar los detalles de la factura.";
    public const string InvoiceDetailsNotEmpty = "La factura debe contener al menos un producto.";
    public const string DuplicateProductsNotAllowed = "No se permiten productos duplicados en la misma factura.";
    public const string ProductIdRequired = "Debe especificar el identificador del producto.";
    public const string QuantityRequired = "La cantidad debe ser mayor a cero.";
}
