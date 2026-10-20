namespace NorthWind.Sales.Backend.Repositories.Repositories;

internal class CommandsRepository(
    INorthWindSalesCommandsDataContext context,
    INorthWindSalesQueriesDataContext queriesContext) : ICommandsRepository
{
    private Entities.Invoice _lastInvoiceEntity;
    private InvoiceResponseDto _lastInvoiceDto;

    public async Task<InvoiceResponseDto> CreateOrder(
        OrderAggregate order,
        string sellerName,
        BusinessObjects.Interfaces.Invoices.IInvoicePricingService pricingService)
    {
        // 1. Guardar la orden y sus líneas
        await context.AddOrderAsync(order);
        await context.AddOrderDetailsAsync(
            order.OrderDetails.Select(d => new Entities.OrderDetail
            {
                Order = order,
                ProductId = d.ProductId,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToArray());

        // 2. Procesar líneas para la factura, validar y descontar inventario
        var customer = await context.FindCustomerAsync(order.CustomerId);

        decimal subTotal = 0;
        var invoiceDetails = new List<Entities.InvoiceDetail>();

        foreach (var item in order.OrderDetails)
        {
            var product = await context.FindProductAsync(item.ProductId);
            if (product == null)
                throw new InvalidOperationException($"El producto {item.ProductId} no fue encontrado.");

            if (product.UnitsInStock < item.Quantity)
                throw new InvalidOperationException($"Stock insuficiente para '{product.Name}'. Requerido: {item.Quantity}, disponible: {product.UnitsInStock}.");

            product.UnitsInStock -= (short)item.Quantity;
            context.UpdateProduct(product);

            decimal lineSubTotal = item.UnitPrice * item.Quantity;
            subTotal += lineSubTotal;

            invoiceDetails.Add(new Entities.InvoiceDetail
            {
                ProductId = product.Id,
                ProductNameSnapshot = product.Name,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });
        }

        // 3. Generar número correlativo de factura
        var lastInvoice = await queriesContext.FirstOrDefaultAsync(
            queriesContext.Invoices.OrderByDescending(i => i.Id).Select(i => new { i.Id }));
        int lastId = lastInvoice?.Id ?? 0;
        string invoiceNumber = pricingService.GenerateInvoiceNumber(lastId);

        decimal tax = pricingService.CalculateTax(subTotal);
        decimal total = subTotal + tax;

        var addressParts = new[] { order.ShipAddress, order.ShipCity, order.ShipCountry, order.ShipPostalCode }
            .Where(s => !string.IsNullOrWhiteSpace(s));
        string fullAddress = string.Join(", ", addressParts);

        var invoice = new Entities.Invoice
        {
            InvoiceNumber = invoiceNumber,
            CustomerId = order.CustomerId,
            CustomerDocumentSnapshot = !string.IsNullOrWhiteSpace(order.CustomerDocument)
                ? order.CustomerDocument
                : (customer?.Id ?? order.CustomerId),
            CustomerFullNameSnapshot = customer?.Name ?? order.CustomerId,
            CustomerAddressSnapshot = fullAddress,
            CustomerPhoneSnapshot = string.Empty,
            CustomerEmailSnapshot = string.Empty,
            SellerFullNameSnapshot = sellerName,
            SubTotal = subTotal,
            Tax = tax,
            Total = total,
            CreatedDate = DateTime.Now,
            Details = invoiceDetails
        };

        await context.AddInvoiceAsync(invoice);

        _lastInvoiceEntity = invoice;
        _lastInvoiceDto = new InvoiceResponseDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            CustomerFullName = invoice.CustomerFullNameSnapshot,
            CustomerDocument = invoice.CustomerDocumentSnapshot,
            CustomerAddress = invoice.CustomerAddressSnapshot,
            CustomerPhone = invoice.CustomerPhoneSnapshot,
            CustomerEmail = invoice.CustomerEmailSnapshot,
            SellerName = invoice.SellerFullNameSnapshot,
            SubTotal = invoice.SubTotal,
            Tax = invoice.Tax,
            Total = invoice.Total,
            CreatedDate = invoice.CreatedDate,
            Details = invoiceDetails.Select(d => new InvoiceDetailResponseDto
            {
                ProductId = d.ProductId,
                ProductName = d.ProductNameSnapshot,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToList()
        };

        return _lastInvoiceDto;
    }

    public async Task CreateOrder(OrderAggregate order)
    {
        await context.AddOrderAsync(order);
        await context.AddOrderDetailsAsync(
            order.OrderDetails.Select(d => new Entities.OrderDetail
            {
                Order = order,
                ProductId = d.ProductId,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToArray());
    }

    public async Task<ProductDto> CreateProduct(CreateProductDto product)
    {
        var entity = new Entities.Product
        {
            Name = product.Name,
            UnitPrice = product.UnitPrice,
            UnitsInStock = product.UnitsInStock
        };

        await context.AddProductAsync(entity);
        await context.SaveChangesAsync();
        return new ProductDto(entity.Id, entity.Name, entity.UnitsInStock, entity.UnitPrice);
    }

    public async Task<ProductDto> UpdateProduct(UpdateProductDto product)
    {
        var entity = await context.FindProductAsync(product.Id);
        if (entity != null)
        {
            entity.Name = product.Name;
            entity.UnitPrice = product.UnitPrice;
            entity.UnitsInStock = product.UnitsInStock;
            context.UpdateProduct(entity);
            await context.SaveChangesAsync();
        }
        return new ProductDto(product.Id, product.Name, product.UnitsInStock, product.UnitPrice);
    }

    public async Task DeleteProduct(int id)
    {
        var entity = await context.FindProductAsync(id);
        if (entity != null)
        {
            context.RemoveProduct(entity);
            await context.SaveChangesAsync();
        }
    }

    public async Task<CustomerDto> CreateCustomer(CreateCustomerDto customer)
    {
        var entity = new Entities.Customer
        {
            Id = customer.Id,
            Name = customer.Name,
            CurrentBalance = customer.CurrentBalance,
            CustomerType = string.IsNullOrWhiteSpace(customer.CustomerType) ? "Empresa" : customer.CustomerType
        };

        await context.AddCustomerAsync(entity);
        await context.SaveChangesAsync();
        return new CustomerDto(entity.Id, entity.Name, entity.CurrentBalance, entity.CustomerType);
    }

    public async Task<CustomerDto> UpdateCustomer(UpdateCustomerDto customer)
    {
        var entity = await context.FindCustomerAsync(customer.Id);
        if (entity != null)
        {
            entity.Name = customer.Name;
            entity.CurrentBalance = customer.CurrentBalance;
            if (!string.IsNullOrWhiteSpace(customer.CustomerType))
            {
                entity.CustomerType = customer.CustomerType;
            }
            context.UpdateCustomer(entity);
            await context.SaveChangesAsync();
        }
        return new CustomerDto(customer.Id, customer.Name, customer.CurrentBalance, entity?.CustomerType ?? customer.CustomerType);
    }

    public async Task DeleteCustomer(string id)
    {
        var entity = await context.FindCustomerAsync(id);
        if (entity != null)
        {
            context.RemoveCustomer(entity);
            await context.SaveChangesAsync();
        }
    }

    public async Task<InvoiceResponseDto> CreateInvoice(
        CreateInvoiceDto invoiceDto,
        string sellerName,
        BusinessObjects.Interfaces.Invoices.IInvoicePricingService pricingService)
    {
        var customer = await context.FindCustomerAsync(invoiceDto.CustomerId);

        decimal subTotal = 0;
        var invoiceDetails = new List<Entities.InvoiceDetail>();

        foreach (var item in invoiceDto.Details)
        {
            var product = await context.FindProductAsync(item.ProductId);
            if (product == null)
                throw new InvalidOperationException($"El producto {item.ProductId} no fue encontrado.");

            if (product.UnitsInStock < item.Quantity)
                throw new InvalidOperationException($"Stock insuficiente para '{product.Name}'. Requerido: {item.Quantity}, disponible: {product.UnitsInStock}.");

            product.UnitsInStock -= (short)item.Quantity;
            context.UpdateProduct(product);

            decimal lineSubTotal = product.UnitPrice * item.Quantity;
            subTotal += lineSubTotal;

            invoiceDetails.Add(new Entities.InvoiceDetail
            {
                ProductId = product.Id,
                ProductNameSnapshot = product.Name,
                Quantity = item.Quantity,
                UnitPrice = product.UnitPrice
            });
        }

        var lastInvoice = await queriesContext.FirstOrDefaultAsync(
            queriesContext.Invoices.OrderByDescending(i => i.Id).Select(i => new { i.Id }));
        int lastId = lastInvoice?.Id ?? 0;
        string invoiceNumber = pricingService.GenerateInvoiceNumber(lastId);

        decimal tax = pricingService.CalculateTax(subTotal);
        decimal total = subTotal + tax;

        var invoice = new Entities.Invoice
        {
            InvoiceNumber = invoiceNumber,
            CustomerId = invoiceDto.CustomerId,
            CustomerDocumentSnapshot = !string.IsNullOrWhiteSpace(invoiceDto.CustomerDocument)
                ? invoiceDto.CustomerDocument
                : (customer?.Id ?? invoiceDto.CustomerId),
            CustomerFullNameSnapshot = customer?.Name ?? invoiceDto.CustomerId,
            CustomerAddressSnapshot = invoiceDto.CustomerAddress ?? string.Empty,
            CustomerPhoneSnapshot = invoiceDto.CustomerPhone ?? string.Empty,
            CustomerEmailSnapshot = invoiceDto.CustomerEmail ?? string.Empty,
            SellerFullNameSnapshot = sellerName,
            SubTotal = subTotal,
            Tax = tax,
            Total = total,
            CreatedDate = DateTime.Now,
            Details = invoiceDetails
        };

        await context.AddInvoiceAsync(invoice);
        await context.SaveChangesAsync();

        return new InvoiceResponseDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            CustomerFullName = invoice.CustomerFullNameSnapshot,
            CustomerDocument = invoice.CustomerDocumentSnapshot,
            CustomerAddress = invoice.CustomerAddressSnapshot,
            CustomerPhone = invoice.CustomerPhoneSnapshot,
            CustomerEmail = invoice.CustomerEmailSnapshot,
            SellerName = invoice.SellerFullNameSnapshot,
            SubTotal = invoice.SubTotal,
            Tax = invoice.Tax,
            Total = invoice.Total,
            CreatedDate = invoice.CreatedDate,
            Details = invoiceDetails.Select(d => new InvoiceDetailResponseDto
            {
                ProductId = d.ProductId,
                ProductName = d.ProductNameSnapshot,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToList()
        };
    }

    public async Task SaveChanges()
    {
        await context.SaveChangesAsync();
        if (_lastInvoiceEntity != null && _lastInvoiceDto != null)
        {
            _lastInvoiceDto.Id = _lastInvoiceEntity.Id;
        }
    }
}
