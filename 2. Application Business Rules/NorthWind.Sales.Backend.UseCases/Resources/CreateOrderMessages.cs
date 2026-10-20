namespace NorthWind.Sales.Backend.UseCases.Resources;

public static class CreateOrderMessages
{
    public const string CustomerIdNotFoundError = "El identificador de cliente proporcionado no existe.";
    public const string CustomerWithBalanceErrorTemplate = "El cliente '{0}' tiene un adeudo pendiente de {1:C2}.";
    public const string ProductIdNotFoundErrorTemplate = "El producto con Id '{0}' no existe.";
    public const string UnitsInStockLessThanQuantityErrorTemplate = "Se solicitaron {0} unidades del producto '{2}', pero únicamente existen {1} unidades en almacén.";
    public const string StartingPurchaseOrderCreation = "Iniciando la creación de la orden de compra.";
    public const string PurchaseOrderCreatedTemplate = "Orden de compra {0} creada.";
    public const string OrderCreationCancelledTemplate = "Creación de la orden de compra {0} cancelada.";
    public const string SendEmailSubject = "Orden de compra especial creada.";
    public const string SendEmailBodyTemplate = "Se ha creado la orden de compra especial {0} con {1} productos.";
}
