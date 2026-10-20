namespace NorthWind.Sales.Backend.UseCases.Resources;

public static class CustomerUseCasesMessages
{
    public static string CustomerCreatedTemplate => "Cliente '{0}' ({1}) registrado con éxito.";
    public static string CustomerUpdatedTemplate => "Cliente '{0}' ({1}) actualizado con éxito.";
    public static string CustomerDeletedTemplate => "Cliente con ID '{0}' eliminado con éxito.";
    public static string CustomerNotFound => "El cliente especificado no fue encontrado.";
    public static string CustomerIdAlreadyExists => "Ya existe un cliente registrado con el identificador '{0}'.";
    public static string CustomerHasOrdersCannotDelete => "No se puede eliminar el cliente porque tiene órdenes registradas.";
}
