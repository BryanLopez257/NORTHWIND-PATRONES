#nullable enable
namespace Microsoft.AspNetCore.Builder;

public static class ProductsController
{
    public static WebApplication UseProductsController(this WebApplication app)
    {
        app.MapGet(Endpoints.Products, GetProducts)
           .RequireAuthorization();

        app.MapGet($"{Endpoints.Products}/{{id:int}}", GetProductById)
           .RequireAuthorization();

        app.MapPost(Endpoints.Products, CreateProduct)
           .RequireAuthorization();

        app.MapPut(Endpoints.Products, UpdateProduct)
           .RequireAuthorization();

        app.MapDelete($"{Endpoints.Products}/{{id:int}}", DeleteProduct)
           .RequireAuthorization();

        return app;
    }

    private static async Task<IResult> GetProducts(
        string? searchTerm,
        decimal? minPrice,
        decimal? maxPrice,
        int? stockFilter,
        string? orderBy,
        bool? ascending,
        int? pageNumber,
        int? pageSize,
        IGetProductsInputPort inputPort,
        GetProductsPresenter presenter)
    {
        var filter = new ProductFilterDto
        {
            SearchTerm = searchTerm,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            StockFilter = stockFilter,
            OrderBy = orderBy ?? "name",
            Ascending = ascending ?? true,
            PageNumber = pageNumber ?? 1,
            PageSize = pageSize ?? 10
        };

        await inputPort.Handle(filter);
        return Results.Ok(presenter.Products);
    }

    private static async Task<IResult> GetProductById(
        int id,
        IGetProductByIdInputPort inputPort,
        GetProductByIdPresenter presenter)
    {
        await inputPort.Handle(id);
        return presenter.Product is not null ? Results.Ok(presenter.Product) : Results.NotFound();
    }

    private static async Task<IResult> CreateProduct(
        CreateProductDto dto,
        ICreateProductInputPort inputPort,
        CreateProductPresenter presenter)
    {
        await inputPort.Handle(dto);
        return Results.Ok(presenter.Product);
    }

    private static async Task<IResult> UpdateProduct(
        UpdateProductDto dto,
        IUpdateProductInputPort inputPort,
        UpdateProductPresenter presenter)
    {
        await inputPort.Handle(dto);
        return Results.Ok(presenter.Product);
    }

    private static async Task<IResult> DeleteProduct(
        int id,
        IDeleteProductInputPort inputPort,
        DeleteProductPresenter presenter)
    {
        await inputPort.Handle(id);
        return Results.Ok(presenter.Success);
    }
}
