namespace NorthWind.Sales.Frontend.WebApiGateways;

internal class ProductsGateway(HttpClient client) : IProductsGateway
{
    public async Task<IEnumerable<ProductDto>> GetProductsAsync(ProductFilterDto filter)
    {
        var queryParams = new List<string>();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                queryParams.Add($"searchTerm={Uri.EscapeDataString(filter.SearchTerm)}");

            if (filter.MinPrice.HasValue)
                queryParams.Add($"minPrice={filter.MinPrice.Value}");

            if (filter.MaxPrice.HasValue)
                queryParams.Add($"maxPrice={filter.MaxPrice.Value}");

            if (filter.StockFilter.HasValue)
                queryParams.Add($"stockFilter={filter.StockFilter.Value}");

            if (!string.IsNullOrWhiteSpace(filter.OrderBy))
                queryParams.Add($"orderBy={Uri.EscapeDataString(filter.OrderBy)}");

            queryParams.Add($"ascending={filter.Ascending.ToString().ToLowerInvariant()}");
        }

        var queryString = queryParams.Count > 0 ? "?" + string.Join("&", queryParams) : "";
        var response = await client.GetFromJsonAsync<IEnumerable<ProductDto>>($"{Endpoints.Products}{queryString}");
        return response ?? [];
    }

    public async Task<ProductDto> GetProductByIdAsync(int id)
    {
        return await client.GetFromJsonAsync<ProductDto>($"{Endpoints.Products}/{id}");
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto product)
    {
        var response = await client.PostAsJsonAsync(Endpoints.Products, product);
        return await response.Content.ReadFromJsonAsync<ProductDto>();
    }

    public async Task<ProductDto> UpdateProductAsync(UpdateProductDto product)
    {
        var response = await client.PutAsJsonAsync(Endpoints.Products, product);
        return await response.Content.ReadFromJsonAsync<ProductDto>();
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var response = await client.DeleteAsync($"{Endpoints.Products}/{id}");
        return await response.Content.ReadFromJsonAsync<bool>();
    }
}
