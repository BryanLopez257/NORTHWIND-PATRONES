#nullable enable
namespace Microsoft.AspNetCore.Builder;

public static class CustomersController
{
    public static WebApplication UseCustomersController(this WebApplication app)
    {
        app.MapGet(Endpoints.Customers, GetCustomers)
           .RequireAuthorization();

        app.MapGet($"{Endpoints.Customers}/{{id}}", GetCustomerById)
           .RequireAuthorization();

        app.MapPost(Endpoints.Customers, CreateCustomer)
           .RequireAuthorization();

        app.MapPut(Endpoints.Customers, UpdateCustomer)
           .RequireAuthorization();

        app.MapDelete($"{Endpoints.Customers}/{{id}}", DeleteCustomer)
           .RequireAuthorization();

        return app;
    }

    private static async Task<IResult> GetCustomers(
        string? searchTerm,
        string? customerType,
        int? balanceFilter,
        decimal? minBalance,
        decimal? maxBalance,
        string? orderBy,
        bool? ascending,
        string? criteria,
        int? pageNumber,
        int? pageSize,
        IGetCustomersInputPort inputPort,
        GetCustomersPresenter presenter)
    {
        var filter = new CustomerFilterDto
        {
            SearchTerm = searchTerm,
            CustomerType = customerType,
            BalanceFilter = balanceFilter,
            MinBalance = minBalance,
            MaxBalance = maxBalance,
            OrderBy = orderBy ?? "name",
            Ascending = ascending ?? true,
            Criteria = criteria,
            PageNumber = pageNumber ?? 1,
            PageSize = pageSize ?? 10
        };

        await inputPort.Handle(filter);
        return Results.Ok(presenter.Customers);
    }

    private static async Task<IResult> GetCustomerById(
        string id,
        IGetCustomerByIdInputPort inputPort,
        GetCustomerByIdPresenter presenter)
    {
        await inputPort.Handle(id);
        return presenter.Customer is not null ? Results.Ok(presenter.Customer) : Results.NotFound();
    }

    private static async Task<IResult> CreateCustomer(
        CreateCustomerDto dto,
        ICreateCustomerInputPort inputPort,
        CreateCustomerPresenter presenter)
    {
        await inputPort.Handle(dto);
        return Results.Ok(presenter.Customer);
    }

    private static async Task<IResult> UpdateCustomer(
        UpdateCustomerDto dto,
        IUpdateCustomerInputPort inputPort,
        UpdateCustomerPresenter presenter)
    {
        await inputPort.Handle(dto);
        return Results.Ok(presenter.Customer);
    }

    private static async Task<IResult> DeleteCustomer(
        string id,
        IDeleteCustomerInputPort inputPort,
        DeleteCustomerPresenter presenter)
    {
        await inputPort.Handle(id);
        return Results.Ok(presenter.Success);
    }
}