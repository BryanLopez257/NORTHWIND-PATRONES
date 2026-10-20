namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;

public interface ICommandsRepository : IUnitOfWork
{
    Task CreateOrder(OrderAggregate order);
    Task<InvoiceResponseDto> CreateOrder(OrderAggregate order, string sellerName, Invoices.IInvoicePricingService pricingService);
    Task<ProductDto> CreateProduct(CreateProductDto product);
    Task<ProductDto> UpdateProduct(UpdateProductDto product);
    Task DeleteProduct(int id);
    Task<CustomerDto> CreateCustomer(CreateCustomerDto customer);
    Task<CustomerDto> UpdateCustomer(UpdateCustomerDto customer);
    Task DeleteCustomer(string id);
    Task<InvoiceResponseDto> CreateInvoice(CreateInvoiceDto invoiceDto, string sellerName, Invoices.IInvoicePricingService pricingService);
}
