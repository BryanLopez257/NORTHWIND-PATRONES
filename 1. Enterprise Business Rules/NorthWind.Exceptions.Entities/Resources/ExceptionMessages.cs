namespace NorthWind.Exceptions.Entities.Resources;

public static class ExceptionMessages
{
    public static string ValidationExceptionTitle => "Error en los datos de entrada.";
    public static string ValidationExceptionDetail => "Se encontraron uno o más errores de validación de datos.";
    public static string UpdateExceptionTitle => "Error de actualización.";
    public static string UpdateExceptionDetail => "Se encontraron uno o más errores al actualizar la base de datos.";
    public static string UnhandledExceptionTitle => "Error inesperado en el servidor.";
    public static string UnhandledExceptionDetail => "Ocurrió un error inesperado al procesar la solicitud. Contactese con el Administrador.";
    public static string UnauthorizedAccessExceptionTitle => "Acceso no autorizado.";
    public static string UnauthorizedAccessExceptionDetail => "El acceso al recurso solicitado está restringido a usuarios autorizados.";
}
