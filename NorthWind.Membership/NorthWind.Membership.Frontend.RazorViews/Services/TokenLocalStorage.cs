namespace NorthWind.Membership.Frontend.RazorViews.Services;

internal class TokenLocalStorage(IJSRuntime jsRuntime) : ITokenStorage
{
    const string TokensKey = "tokens";

    public async Task StoreTokensAsync(TokensDto tokens) =>
        await jsRuntime.InvokeVoidAsync("localStorage.setItem", TokensKey, JsonSerializer.Serialize(tokens));

    public async Task<TokensDto> GetTokensAsync()
    {
        var Value = await jsRuntime.InvokeAsync<string>("localStorage.getItem", TokensKey);
        return string.IsNullOrEmpty(Value) ? null : JsonSerializer.Deserialize<TokensDto>(Value);
    }

    public async Task RemoveTokensAsync() =>
        await jsRuntime.InvokeVoidAsync("localStorage.removeItem", TokensKey);
}
