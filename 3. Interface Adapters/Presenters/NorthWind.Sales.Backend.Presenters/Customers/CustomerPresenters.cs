namespace NorthWind.Sales.Backend.Presenters.Customers;

public class GetCustomersPresenter : IGetCustomersOutputPort
{
    public IEnumerable<CustomerDto> Customers { get; private set; }

    public Task Handle(IEnumerable<CustomerDto> customers)
    {
        Customers = customers;
        return Task.CompletedTask;
    }
}

public class GetCustomerByIdPresenter : IGetCustomerByIdOutputPort
{
    public CustomerDto Customer { get; private set; }

    public Task Handle(CustomerDto customer)
    {
        Customer = customer;
        return Task.CompletedTask;
    }
}

public class CreateCustomerPresenter : ICreateCustomerOutputPort
{
    public CustomerDto Customer { get; private set; }

    public Task Handle(CustomerDto customer)
    {
        Customer = customer;
        return Task.CompletedTask;
    }
}

public class UpdateCustomerPresenter : IUpdateCustomerOutputPort
{
    public CustomerDto Customer { get; private set; }

    public Task Handle(CustomerDto customer)
    {
        Customer = customer;
        return Task.CompletedTask;
    }
}

public class DeleteCustomerPresenter : IDeleteCustomerOutputPort
{
    public bool Success { get; private set; }

    public Task Handle(bool success)
    {
        Success = success;
        return Task.CompletedTask;
    }
}
