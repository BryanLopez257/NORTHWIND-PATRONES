namespace NorthWind.Sales.Frontend.WebApiGateways;

internal class CustomersGateway(HttpClient client) : ICustomersGateway
{
    public async Task<IEnumerable<CustomerDto>> GetCustomersAsync(CustomerFilterDto filter)
    {
        var queryParams = new List<string>();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                queryParams.Add($"searchTerm={Uri.EscapeDataString(filter.SearchTerm)}");

            if (!string.IsNullOrWhiteSpace(filter.CustomerType))
                queryParams.Add($"customerType={Uri.EscapeDataString(filter.CustomerType)}");

            if (filter.BalanceFilter.HasValue)
                queryParams.Add($"balanceFilter={filter.BalanceFilter.Value}");

            if (filter.MinBalance.HasValue)
                queryParams.Add($"minBalance={filter.MinBalance.Value}");

            if (filter.MaxBalance.HasValue)
                queryParams.Add($"maxBalance={filter.MaxBalance.Value}");

            if (!string.IsNullOrWhiteSpace(filter.OrderBy))
                queryParams.Add($"orderBy={Uri.EscapeDataString(filter.OrderBy)}");

            queryParams.Add($"ascending={filter.Ascending.ToString().ToLowerInvariant()}");
        }

        var queryString = queryParams.Count > 0 ? "?" + string.Join("&", queryParams) : "";
        var response = await client.GetFromJsonAsync<IEnumerable<CustomerDto>>($"{Endpoints.Customers}{queryString}");
        return response ?? [];
    }

    public async Task<CustomerDto> GetCustomerByIdAsync(string id)
    {
        return await client.GetFromJsonAsync<CustomerDto>($"{Endpoints.Customers}/{id}");
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto customer)
    {
        var response = await client.PostAsJsonAsync(Endpoints.Customers, customer);
        return await response.Content.ReadFromJsonAsync<CustomerDto>();
    }

    public async Task<CustomerDto> UpdateCustomerAsync(UpdateCustomerDto customer)
    {
        var response = await client.PutAsJsonAsync(Endpoints.Customers, customer);
        return await response.Content.ReadFromJsonAsync<CustomerDto>();
    }

    public async Task<bool> DeleteCustomerAsync(string id)
    {
        var response = await client.DeleteAsync($"{Endpoints.Customers}/{id}");
        return await response.Content.ReadFromJsonAsync<bool>();
    }
}
