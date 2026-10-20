namespace NorthWind.Sales.Validators.Entities.Resources;

public static class CustomerMessages
{
    public static string IdRequired => "El identificador del cliente es obligatorio.";
    public static string IdLength => "El identificador del cliente debe tener exactamente 5 caracteres.";
    public static string IdOnlyLetters => "El identificador del cliente solo debe contener letras, no se permiten números.";
    public static string NameRequired => "El nombre o razón social del cliente es obligatorio.";
    public static string NameMaxLength => "El nombre del cliente no debe exceder los 40 caracteres.";
    public static string NameOnlyLetters => "El nombre del cliente solo debe contener letras, no se permiten números.";
    public static string CurrentBalancePositive => "El saldo actual del cliente no puede ser negativo.";
}
