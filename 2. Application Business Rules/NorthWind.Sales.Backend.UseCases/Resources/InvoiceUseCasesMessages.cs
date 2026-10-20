namespace NorthWind.Sales.Backend.UseCases.Resources;

public static class InvoiceUseCasesMessages
{
    public const string CustomerNotFound = "El cliente seleccionado no existe en el sistema.";
    public const string ProductNotFoundTemplate = "El producto con ID {0} no existe.";
    public const string InsufficientStockTemplate = "Stock insuficiente para '{0}'. Requerido: {1}, Disponible: {2}.";
    public const string InvoiceCreatedTemplate = "Factura {0} emitida exitosamente para el cliente {1}.";
    public const string InvoiceCreationCancelledTemplate = "La emisión de la factura para el cliente {0} fue cancelada debido a un error.";
}
