namespace NorthWind.Sales.Frontend.Views.Resources;

public static class CustomersMessages
{
    public const string PageTitle = "Gestión de Clientes";
    public const string Subtitle = "Administra los clientes comerciales, sus límites y balances de cuenta con segmentación de saldos.";
    public const string NewCustomerButton = "Nuevo Cliente";
    public const string EditCustomerTitle = "Editar Cliente";
    public const string CreateCustomerTitle = "Registrar Nuevo Cliente";
    public const string DeleteCustomerTitle = "Confirmar Eliminación";
    public const string DeleteConfirmationTemplate = "¿Está seguro de que desea eliminar al cliente '{0}' ({1})? Esta acción no se puede deshacer.";
    public const string CustomerCreatedSuccess = "Cliente '{0}' registrado correctamente.";
    public const string CustomerUpdatedSuccess = "Cliente '{0}' actualizado correctamente.";
    public const string CustomerDeletedSuccess = "Cliente eliminado correctamente.";
    public const string SearchPlaceholder = "Buscar por código o nombre de cliente...";
    public const string BalanceFilterLabel = "Estado de Saldo";
    public const string MinBalanceLabel = "Saldo Mínimo";
    public const string MaxBalanceLabel = "Saldo Máximo";
    public const string OrderByLabel = "Ordenar Por";
    public const string AllBalances = "Todos los estados";
    public const string PaidBalance = "Al Día ($0.00)";
    public const string OutstandingBalance = "Con Saldo Pendiente (> $0.00)";
    public const string HighBalance = "Saldo Elevado (≥ $100.00)";
    public const string IdColumn = "Código (ID)";
    public const string NameColumn = "Nombre / Razón Social";
    public const string BalanceColumn = "Saldo Actual";
    public const string StatusColumn = "Estado";
    public const string NoCustomersFound = "No se encontraron clientes que coincidan con los criterios de búsqueda.";
}
