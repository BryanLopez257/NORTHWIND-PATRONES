namespace NorthWind.Membership.Entities.Resources;

public static class UserLoginMessages
{
    public static string RequiredEmailErrorMessage => "El correo es requerido.";
    public static string InvalidEmailErrorMessage => "El formato de correo no es válido.";
    public static string EmailTooLongErrorMessage => "El correo no debe superar los 254 caracteres.";
    public static string RequiredPasswordErrorMessage => "La contraseña es requerida.";
}
