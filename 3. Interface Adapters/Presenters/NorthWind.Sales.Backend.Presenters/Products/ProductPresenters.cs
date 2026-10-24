namespace NorthWind.Sales.Backend.Presenters.Products;

public class GetProductsPresenter : IGetProductsOutputPort
{
    public PagedResultDto<ProductDto> Products { get; private set; }

    public Task Handle(PagedResultDto<ProductDto> products)
    {
        Products = products;
        return Task.CompletedTask;
    }
}

public class GetProductByIdPresenter : IGetProductByIdOutputPort
{
    public ProductDto Product { get; private set; }

    public Task Handle(ProductDto product)
    {
        Product = product;
        return Task.CompletedTask;
    }
}

public class CreateProductPresenter : ICreateProductOutputPort
{
    public ProductDto Product { get; private set; }

    public Task Handle(ProductDto product)
    {
        Product = product;
        return Task.CompletedTask;
    }
}

public class UpdateProductPresenter : IUpdateProductOutputPort
{
    public ProductDto Product { get; private set; }

    public Task Handle(ProductDto product)
    {
        Product = product;
        return Task.CompletedTask;
    }
}

public class DeleteProductPresenter : IDeleteProductOutputPort
{
    public bool Success { get; private set; }

    public Task Handle(bool success)
    {
        Success = success;
        return Task.CompletedTask;
    }
}
