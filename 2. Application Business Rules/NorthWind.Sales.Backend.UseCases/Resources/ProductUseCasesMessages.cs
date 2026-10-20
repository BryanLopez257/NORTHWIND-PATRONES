namespace NorthWind.Sales.Backend.UseCases.Resources;

public static class ProductUseCasesMessages
{
    public static string ProductCreatedTemplate => "Producto '{0}' (ID: {1}) creado con éxito.";
    public static string ProductUpdatedTemplate => "Producto '{0}' (ID: {1}) actualizado con éxito.";
    public static string ProductDeletedTemplate => "Producto con ID {0} eliminado con éxito.";
    public static string ProductNotFound => "El producto especificado no fue encontrado.";
    public static string ProductHasOrdersCannotDelete => "No se puede eliminar el producto porque tiene órdenes de compra asociadas.";
}
