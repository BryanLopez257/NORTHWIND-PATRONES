namespace NorthWind.Sales.Backend.Repositories.Repositories;

internal class QueriesRepository(INorthWindSalesQueriesDataContext context) : IQueriesRepository
{
    public async Task<decimal?> GetCustomerCurrentBalance(string customerId)
    {
        var queryable = context.Customers
            .Where(c => c.Id == customerId)
            .Select(c => new { c.CurrentBalance });
        var result = await context.FirstOrDefaultAsync(queryable);
        return result?.CurrentBalance;
    }

    public async Task<IEnumerable<ProductUnitsInStock>> GetProductsUnitsInStock(IEnumerable<int> productIds)
    {
        var queryable = context.Products
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new ProductUnitsInStock(p.Id, p.UnitsInStock));
        return await context.ToListAsync(queryable);
    }

    public async Task<IEnumerable<ProductDto>> GetProducts(ProductFilterDto filter)
    {
        var query = context.Products.AsQueryable();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim();
                query = query.Where(p => p.Name.Contains(term));
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.UnitPrice >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.UnitPrice <= filter.MaxPrice.Value);
            }

            if (filter.StockFilter.HasValue)
            {
                query = filter.StockFilter.Value switch
                {
                    1 => query.Where(p => p.UnitsInStock > 0),
                    2 => query.Where(p => p.UnitsInStock <= 10 && p.UnitsInStock > 0),
                    3 => query.Where(p => p.UnitsInStock == 0),
                    _ => query
                };
            }

            var orderBy = filter.OrderBy?.ToLowerInvariant() ?? "name";
            query = (orderBy, filter.Ascending) switch
            {
                ("price", true) => query.OrderBy(p => p.UnitPrice),
                ("price", false) => query.OrderByDescending(p => p.UnitPrice),
                ("stock", true) => query.OrderBy(p => p.UnitsInStock),
                ("stock", false) => query.OrderByDescending(p => p.UnitsInStock),
                ("name", false) => query.OrderByDescending(p => p.Name),
                _ => query.OrderBy(p => p.Name)
            };
        }
        else
        {
            query = query.OrderBy(p => p.Name);
        }

        var projected = query.Select(p => new ProductDto(p.Id, p.Name, p.UnitsInStock, p.UnitPrice));
        return await context.ToListAsync(projected);
    }

    public async Task<ProductDto> GetProductById(int id)
    {
        var query = context.Products
            .Where(p => p.Id == id)
            .Select(p => new ProductDto(p.Id, p.Name, p.UnitsInStock, p.UnitPrice));
        return await context.FirstOrDefaultAsync(query);
    }

    public async Task<bool> ProductHasOrders(int productId)
    {
        var query = context.OrderDetails.Where(d => d.ProductId == productId);
        return await context.AnyAsync(query);
    }

    public async Task<IEnumerable<CustomerDto>> GetCustomers(CustomerFilterDto filter)
    {
        var query = context.Customers.AsQueryable();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim();
                query = query.Where(c => c.Name.Contains(term) || c.Id.Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(filter.CustomerType))
            {
                var type = filter.CustomerType.Trim();
                query = query.Where(c => c.CustomerType == type);
            }

            if (filter.BalanceFilter.HasValue)
            {
                query = filter.BalanceFilter.Value switch
                {
                    1 => query.Where(c => c.CurrentBalance == 0),
                    2 => query.Where(c => c.CurrentBalance > 0),
                    3 => query.Where(c => c.CurrentBalance >= 100),
                    _ => query
                };
            }

            if (filter.MinBalance.HasValue)
            {
                query = query.Where(c => c.CurrentBalance >= filter.MinBalance.Value);
            }

            if (filter.MaxBalance.HasValue)
            {
                query = query.Where(c => c.CurrentBalance <= filter.MaxBalance.Value);
            }

            var orderBy = filter.OrderBy?.ToLowerInvariant() ?? "name";
            query = (orderBy, filter.Ascending) switch
            {
                ("id", true) => query.OrderBy(c => c.Id),
                ("id", false) => query.OrderByDescending(c => c.Id),
                ("balance", true) => query.OrderBy(c => c.CurrentBalance),
                ("balance", false) => query.OrderByDescending(c => c.CurrentBalance),
                ("name", false) => query.OrderByDescending(c => c.Name),
                _ => query.OrderBy(c => c.Name)
            };
        }
        else
        {
            query = query.OrderBy(c => c.Name);
        }

        var projected = query.Select(c => new CustomerDto(c.Id, c.Name, c.CurrentBalance, c.CustomerType));
        return await context.ToListAsync(projected);
    }

    public async Task<CustomerDto> GetCustomerById(string id)
    {
        var query = context.Customers
            .Where(c => c.Id == id)
            .Select(c => new CustomerDto(c.Id, c.Name, c.CurrentBalance, c.CustomerType));
        return await context.FirstOrDefaultAsync(query);
    }

    public async Task<bool> CustomerExists(string customerId)
    {
        var query = context.Customers.Where(c => c.Id == customerId);
        return await context.AnyAsync(query);
    }

    public async Task<bool> CustomerHasOrders(string customerId)
    {
        var query = context.Orders.Where(o => o.CustomerId == customerId);
        return await context.AnyAsync(query);
    }

    public async Task<InvoiceResponseDto> GetInvoiceById(int id)
    {
        var query = context.Invoices
            .Where(i => i.Id == id)
            .Select(i => new InvoiceResponseDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                CustomerId = i.CustomerId,
                CustomerFullName = i.CustomerFullNameSnapshot,
                CustomerDocument = i.CustomerDocumentSnapshot,
                CustomerAddress = i.CustomerAddressSnapshot,
                CustomerPhone = i.CustomerPhoneSnapshot,
                CustomerEmail = i.CustomerEmailSnapshot,
                SellerName = i.SellerFullNameSnapshot,
                SubTotal = i.SubTotal,
                Tax = i.Tax,
                Total = i.Total,
                CreatedDate = i.CreatedDate,
                Details = i.Details.Select(d => new InvoiceDetailResponseDto
                {
                    ProductId = d.ProductId,
                    ProductName = d.ProductNameSnapshot,
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice
                }).ToList()
            });

        return await context.FirstOrDefaultAsync(query);
    }

    public async Task<IEnumerable<InvoiceResponseDto>> GetInvoices(InvoiceFilterDto filter)
    {
        var query = context.Invoices.AsQueryable();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.InvoiceNumber))
            {
                var term = filter.InvoiceNumber.Trim();
                query = query.Where(i => i.InvoiceNumber.Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(filter.CustomerName))
            {
                var term = filter.CustomerName.Trim();
                query = query.Where(i => i.CustomerFullNameSnapshot.Contains(term) || i.CustomerId.Contains(term));
            }
        }

        query = query.OrderByDescending(i => i.CreatedDate);

        var projected = query.Select(i => new InvoiceResponseDto
        {
            Id = i.Id,
            InvoiceNumber = i.InvoiceNumber,
            CustomerId = i.CustomerId,
            CustomerFullName = i.CustomerFullNameSnapshot,
            CustomerDocument = i.CustomerDocumentSnapshot,
            CustomerAddress = i.CustomerAddressSnapshot,
            CustomerPhone = i.CustomerPhoneSnapshot,
            CustomerEmail = i.CustomerEmailSnapshot,
            SellerName = i.SellerFullNameSnapshot,
            SubTotal = i.SubTotal,
            Tax = i.Tax,
            Total = i.Total,
            CreatedDate = i.CreatedDate,
            Details = i.Details.Select(d => new InvoiceDetailResponseDto
            {
                ProductId = d.ProductId,
                ProductName = d.ProductNameSnapshot,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToList()
        });

        return await context.ToListAsync(projected);
    }

    public async Task<int> GetLastInvoiceId()
    {
        var last = await context.FirstOrDefaultAsync(context.Invoices.OrderByDescending(i => i.Id).Select(i => new { i.Id }));
        return last?.Id ?? 0;
    }
}