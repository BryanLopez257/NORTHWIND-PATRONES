using Microsoft.JSInterop;

namespace NorthWind.Sales.Frontend.Views.Pages;

public partial class InvoicesPage
{
    [Inject]
    public InvoicesViewModel ViewModel { get; set; }

    [Inject]
    public IJSRuntime JSRuntime { get; set; }

    protected override async Task OnInitializedAsync()
    {
        await ViewModel.LoadInvoicesAsync();
    }

    private async Task PrintInvoiceAsync()
    {
        try
        {
            await JSRuntime.InvokeVoidAsync("window.print");
        }
        catch {}
    }
}
