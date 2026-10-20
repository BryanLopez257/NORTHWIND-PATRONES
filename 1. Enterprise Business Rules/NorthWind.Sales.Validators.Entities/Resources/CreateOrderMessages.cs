namespace NorthWind.Sales.Validators.Entities.Resources;

public static class CreateOrderMessages
{
    public static string ProductIdGreaterThanZero => "Debe especificar el identificador del producto.";
    public static string QuantityGreaterThanZero => "Debe especificar la cantidad ordenada del producto.";
    public static string UnitPriceGreaterThanZero => "Debe especificarse el precio del producto.";
    public static string CustomerIdRequired => "Debe proporcionar el identificador del cliente.";
    public static string CustomerIdRequiredLength => "La longitud del identificador debe ser 5.";
    public static string CustomerIdOnlyLetters => "El identificador del cliente solo debe contener letras, no se permiten números.";
    public static string CustomerDocumentRequired => "Debe proporcionar la Cédula o RUC del cliente.";
    public static string CustomerDocumentOnlyNumbers => "La Cédula o RUC solo debe contener números.";
    public static string CustomerDocumentInvalidFormat => "El número de documento no es una Cédula o RUC ecuatoriano válido.";
    public static string ShipAddressRequired => "Debe proporcionar la dirección de envío.";
    public static string ShipAddressMaximumLength => "La longitud máxima de la dirección es 60.";
    public static string ShipAddressSpecialCharactersNotAllowed => "La dirección no debe contener caracteres especiales no permitidos (solo letras, números y signos: . , - # / °).";
    public static string ShipCityRequired => "Debe proporcionar la ciudad de envío.";
    public static string ShipCityMinimumLength => "Debe especificar al menos 3 caracteres del nombre de la ciudad.";
    public static string ShipCityMaximumLength => "La longitud máxima de la ciudad es 15.";
    public static string ShipCityOnlyLetters => "La ciudad solo debe contener letras, no se permiten números.";
    public static string ShipCountryRequired => "Debe proporcionar el país de envío.";
    public static string ShipCountryMinimumLength => "Debe especificar al menos 3 caracteres del nombre del País.";
    public static string ShipCountryMaximumLength => "La longitud máxima del país es 15.";
    public static string ShipCountryOnlyLetters => "El país solo debe contener letras, no se permiten números.";
    public static string ShipPostalCodeMaximumLength => "La longitud máxima del código postal es 10.";
    public static string OrderDetailsRequired => "Debe especificar los productos de la orden.";
    public static string OrderDetailsNotEmpty => "Debe especificar al menos un producto de la orden.";
    public static string DuplicateProductsNotAllowed => "No se permiten productos duplicados en la misma orden.";
}
