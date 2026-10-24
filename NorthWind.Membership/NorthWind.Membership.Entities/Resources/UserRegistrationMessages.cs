namespace NorthWind.Membership.Entities.Resources;

public static class UserRegistrationMessages
{
    public static string RequiredFirstNameErrorMessage => "El primer nombre es requerido.";
    public static string FirstNameLengthErrorMessage => "El primer nombre debe tener entre 2 y 50 caracteres.";
    public static string FirstNameInvalidCharactersErrorMessage => "El primer nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).";

    public static string SecondNameLengthErrorMessage => "El segundo nombre debe tener entre 2 y 50 caracteres.";
    public static string SecondNameInvalidCharactersErrorMessage => "El segundo nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).";

    public static string RequiredLastNameErrorMessage => "El primer apellido es requerido.";
    public static string LastNameLengthErrorMessage => "El primer apellido debe tener entre 2 y 50 caracteres.";
    public static string LastNameInvalidCharactersErrorMessage => "El primer apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).";

    public static string SecondLastNameLengthErrorMessage => "El segundo apellido debe tener entre 2 y 50 caracteres.";
    public static string SecondLastNameInvalidCharactersErrorMessage => "El segundo apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).";

    public static string RequiredEmailErrorMessage => "El correo es requerido.";
    public static string InvalidEmailErrorMessage => "El formato de correo no es válido.";
    public static string EmailTooLongErrorMessage => "El correo no debe superar los 254 caracteres.";
    public static string EmailInvalidCharactersErrorMessage => "El correo solo puede contener caracteres válidos (letras, números, '.', '+', '-', '_', '@'). No se permiten otros caracteres especiales, espacios ni emojis.";

    public static string RequiredPasswordErrorMessage => "La contraseña es requerida.";
    public static string PasswordTooShortErrorMessage => "Se requiere al menos 6 caracteres en la contraseña.";
    public static string PasswordTooLongErrorMessage => "La contraseña no debe superar los 100 caracteres.";
    public static string PasswordInvalidCharactersErrorMessage => "La contraseña no debe contener emojis ni espacios en blanco.";
    public static string PasswordRequiresNonAlphanumericErrorMessage => "La contraseña requiere al menos un carácter no alfanumérico.";
    public static string PasswordRequiresDigitErrorMessage => "La contraseña requiere al menos un dígito.";
    public static string PasswordRequiresUpperErrorMessage => "La contraseña requiere al menos un carácter en mayúscula.";
}
