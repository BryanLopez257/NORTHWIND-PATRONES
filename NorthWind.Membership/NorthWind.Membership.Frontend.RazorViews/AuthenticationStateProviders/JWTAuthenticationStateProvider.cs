namespace NorthWind.Membership.Frontend.RazorViews.AuthenticationStateProviders;

public class JWTAuthenticationStateProvider(ITokenStorage storage) : AuthenticationStateProvider
{
    AuthenticationState Anonymous => new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        var Tokens = await storage.GetTokensAsync();
        if (Tokens != null)
        {
            var Handler = new JsonWebTokenHandler();
            var Token = Handler.ReadJsonWebToken(Tokens.AccessToken);
            var Identity = new ClaimsIdentity(Token.Claims, "BearerToken");
            return new AuthenticationState(new ClaimsPrincipal(Identity));
        }
        return Anonymous;
    }

    public async ValueTask LoginAsync(TokensDto tokens)
    {
        await storage.StoreTokensAsync(tokens);
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    public async ValueTask LogoutAsync()
    {
        await storage.RemoveTokensAsync();
        NotifyAuthenticationStateChanged(Task.FromResult(Anonymous));
    }
}
