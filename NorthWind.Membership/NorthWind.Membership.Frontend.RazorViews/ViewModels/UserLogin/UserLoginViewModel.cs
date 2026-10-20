namespace NorthWind.Membership.Frontend.RazorViews.ViewModels.UserLogin;

public class UserLoginViewModel(
    MembershipGateway gateway,
    IModelValidatorHub<UserLoginViewModel> validator,
    JWTAuthenticationStateProvider authenticationStateProvider)
{
    public event Action OnLogin;

    public string Email { get; set; }
    public string Password { get; set; }

    public IModelValidatorHub<UserLoginViewModel> Validator => validator;
    public ModelValidator<UserLoginViewModel> ModelValidatorComponentReference { get; set; }

    public string ErrorMessage { get; private set; }

    public async Task Login()
    {
        try
        {
            ErrorMessage = "";
            TokensDto Tokens = await gateway.LoginAsync((UserCredentialsDto)this);
            await authenticationStateProvider.LoginAsync(Tokens);
            OnLogin?.Invoke();
        }
        catch (HttpRequestException ex)
        {
            if (ex.Data.Contains("Errors"))
            {
                var Errors = ex.Data["Errors"] as IEnumerable<ValidationError>;
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

    public static explicit operator UserCredentialsDto(UserLoginViewModel model) =>
        new UserCredentialsDto(model.Email, model.Password);
}
