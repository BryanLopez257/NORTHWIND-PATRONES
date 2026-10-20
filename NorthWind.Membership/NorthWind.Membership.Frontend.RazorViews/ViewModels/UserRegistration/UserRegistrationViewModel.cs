namespace NorthWind.Membership.Frontend.RazorViews.ViewModels.UserRegistration;

public class UserRegistrationViewModel(
    MembershipGateway gateway,
    IModelValidatorHub<UserRegistrationViewModel> validator)
{
    public string FirstName { get; set; }
    public string SecondName { get; set; }
    public string LastName { get; set; }
    public string SecondLastName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string PasswordConfirmation { get; set; }

    public IModelValidatorHub<UserRegistrationViewModel> Validator => validator;
    public ModelValidator<UserRegistrationViewModel> ModelValidatorComponentReference { get; set; }
    public string InformationMessage { get; private set; }
    public string ErrorMessage { get; private set; }

    public async Task Register()
    {
        try
        {
            InformationMessage = "";
            ErrorMessage = "";
            await gateway.RegisterAsync((UserRegistrationDto)this);
            InformationMessage = UserRegistrationMessages.RegisteredUserMessage;
        }
        catch (HttpRequestException ex)
        {
            if (ex.Data.Contains("Errors"))
            {
                IEnumerable<ValidationError> Errors =
                    ex.Data["Errors"] as IEnumerable<ValidationError>;
                ModelValidatorComponentReference?.AddErrors(Errors);
            }
            else
            {
                ErrorMessage = string.IsNullOrWhiteSpace(ex.Message)
                    ? "Error inesperado en el servidor. Ocurrió un error inesperado al procesar la solicitud. Contactese con el Administrador."
                    : ex.Message;
                ModelValidatorComponentReference?.ClearErrors();
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = string.IsNullOrWhiteSpace(ex.Message)
                ? "Error inesperado en el servidor. Ocurrió un error inesperado al procesar la solicitud. Contactese con el Administrador."
                : ex.Message;
            ModelValidatorComponentReference?.ClearErrors();
        }
    }

    public static explicit operator UserRegistrationDto(UserRegistrationViewModel model) =>
        new UserRegistrationDto(
            model.Email,
            model.Password,
            model.FirstName,
            model.LastName,
            model.SecondName,
            model.SecondLastName);
}
