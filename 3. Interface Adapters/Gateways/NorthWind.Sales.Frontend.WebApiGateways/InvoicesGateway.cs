namespace NorthWind.Sales.Frontend.WebApiGateways;

internal class InvoicesGateway(HttpClient client) : IInvoicesGateway
{
    public async Task<InvoiceResponseDto> CreateInvoiceAsync(CreateInvoiceDto invoiceDto)
    {
        var response = await client.PostAsJsonAsync(Endpoints.Invoices, invoiceDto);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<InvoiceResponseDto>();
    }

    public async Task<InvoiceResponseDto> GetInvoiceByIdAsync(int id)
    {
        return await client.GetFromJsonAsync<InvoiceResponseDto>($"{Endpoints.Invoices}/{id}");
    }

    public async Task<IEnumerable<InvoiceResponseDto>> GetInvoicesAsync(InvoiceFilterDto filter)
    {
        var queryParams = new List<string>();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.InvoiceNumber))
                queryParams.Add($"invoiceNumber={Uri.EscapeDataString(filter.InvoiceNumber)}");

            if (!string.IsNullOrWhiteSpace(filter.CustomerName))
                queryParams.Add($"customerName={Uri.EscapeDataString(filter.CustomerName)}");
        }

        var queryString = queryParams.Count > 0 ? "?" + string.Join("&", queryParams) : "";
        var response = await client.GetFromJsonAsync<IEnumerable<InvoiceResponseDto>>($"{Endpoints.Invoices}{queryString}");
        return response ?? [];
    }
}
