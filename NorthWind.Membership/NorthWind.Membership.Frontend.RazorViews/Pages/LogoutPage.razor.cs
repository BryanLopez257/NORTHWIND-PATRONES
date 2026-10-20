namespace NorthWind.Membership.Frontend.RazorViews.Pages;

public partial class LogoutPage
{
    [Inject]
    JWTAuthenticationStateProvider AuthenticationStateProvider { get; set; }

    [Inject]
    NavigationManager NavigationManager { get; set; }

    async ValueTask CloseSession()
    {
        await AuthenticationStateProvider.LogoutAsync();
        NavigationManager.NavigateTo("/");
    }
}
