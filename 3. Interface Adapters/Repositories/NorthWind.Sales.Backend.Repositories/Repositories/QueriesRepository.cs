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

    public async Task<PagedResultDto<ProductDto>> GetProducts(ProductFilterDto filter)
    {
        var query = context.Products.AsQueryable();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim();
                var hasNumericId = int.TryParse(term, out int numericId);
                query = query.Where(p => p.Name.Contains(term) || (hasNumericId && p.Id == numericId));
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

        var totalCount = await context.CountAsync(query);
        var pageNumber = filter?.PageNumber > 0 ? filter.PageNumber : 1;
        var pageSize = filter?.PageSize > 0 ? filter.PageSize : 10;

        var pagedQuery = query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize);

        var projected = pagedQuery.Select(p => new ProductDto(p.Id, p.Name, p.UnitsInStock, p.UnitPrice));
        var items = (await context.ToListAsync(projected)).ToList();
        return new PagedResultDto<ProductDto>(items, totalCount, pageNumber, pageSize);
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

    public async Task<PagedResultDto<CustomerDto>> GetCustomers(CustomerFilterDto filter)
    {
        var query = context.Customers.AsQueryable();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim();
                var criteria = filter.Criteria?.ToLowerInvariant();

                // Enfoque híbrido:
                // - Identificadores estructurados (Id, Identification) => StartsWith (LIKE 'x%', SARGable / Index Seek).
                // - Nombres descriptivos (BusinessName, TradeName, Name) => Contains (LIKE '%x%'), permite palabras intermedias.
                query = criteria switch
                {
                    "identification" => query.Where(c => c.Identification.StartsWith(term)),
                    "businessname" => query.Where(c => c.CustomerType == CustomerType.Legal && c.BusinessName != null && c.BusinessName.Contains(term)),
                    "tradename" => query.Where(c => c.TradeName != null && c.TradeName.Contains(term)),
                    "lastname" => query.Where(c => c.CustomerType == CustomerType.Natural && c.LastName != null && c.LastName.StartsWith(term)),
                    // Name es la columna calculada persistida "Apellidos Nombres", permite buscar nombres compuestos ("Trujillo Pérez").
                    "name" => query.Where(c => c.CustomerType == CustomerType.Natural && c.Name.Contains(term)),
                    "id" => query.Where(c => c.Id.StartsWith(term)),
                    _ => query.Where(c =>
                        c.Id.StartsWith(term) ||
                        c.Identification.StartsWith(term) ||
                        c.Name.Contains(term) ||
                        (c.BusinessName != null && c.BusinessName.Contains(term)) ||
                        (c.TradeName != null && c.TradeName.Contains(term)))
                };
            }

            if (!string.IsNullOrWhiteSpace(filter.CustomerType))
            {
                var typeStr = filter.CustomerType.Trim();
                if (int.TryParse(typeStr, out int typeInt) && Enum.IsDefined(typeof(CustomerType), typeInt))
                {
                    query = query.Where(c => c.CustomerType == (CustomerType)typeInt);
                }
                else if (Enum.TryParse<CustomerType>(typeStr, true, out var parsedType))
                {
                    query = query.Where(c => c.CustomerType == parsedType);
                }
                else if (typeStr.Equals("Empresa", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(c => c.CustomerType == CustomerType.Legal);
                }
                else if (typeStr.Equals("Persona", StringComparison.OrdinalIgnoreCase) || typeStr.Equals("Natural", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(c => c.CustomerType == CustomerType.Natural);
                }
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

        var totalCount = await context.CountAsync(query);
        var pageNumber = filter?.PageNumber > 0 ? filter.PageNumber : 1;
        var pageSize = filter?.PageSize > 0 ? filter.PageSize : 10;

        var pagedQuery = query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize);

        var projected = pagedQuery.Select(c => new CustomerDto(
            c.Id,
            c.Name,
            c.CurrentBalance,
            c.CustomerType,
            c.Identification,
            c.FirstName,
            c.SecondName,
            c.LastName,
            c.SecondLastName,
            c.BusinessName,
            c.TradeName));
        var items = (await context.ToListAsync(projected)).ToList();
        return new PagedResultDto<CustomerDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<CustomerDto> GetCustomerById(string id)
    {
        var query = context.Customers
            .Where(c => c.Id == id)
            .Select(c => new CustomerDto(
                c.Id,
                c.Name,
                c.CurrentBalance,
                c.CustomerType,
                c.Identification,
                c.FirstName,
                c.SecondName,
                c.LastName,
                c.SecondLastName,
                c.BusinessName,
                c.TradeName));
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

    public async Task<PagedResultDto<InvoiceResponseDto>> GetInvoices(InvoiceFilterDto filter)
    {
        var query = context.Invoices.AsQueryable();

        if (filter != null)
        {
            // Búsqueda global ('all'): códigos con StartsWith, nombre del cliente con Contains.
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim();
                var hasNumericId = int.TryParse(term, out int numericId);
                query = query.Where(i =>
                    i.InvoiceNumber.StartsWith(term) ||
                    (hasNumericId && i.Id == numericId) ||
                    i.CustomerId.StartsWith(term) ||
                    (i.CustomerDocumentSnapshot != null && i.CustomerDocumentSnapshot.StartsWith(term)) ||
                    (i.CustomerFullNameSnapshot != null && i.CustomerFullNameSnapshot.Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(filter.InvoiceNumber))
            {
                var term = filter.InvoiceNumber.Trim();
                // N° de factura: StartsWith => LIKE @term + '%' (Index Seek sobre IX_Invoices_InvoiceNumber).
                // Si se ingresa sólo el correlativo numérico (ej. "23"), se resuelve por Id (PK) en lugar de LIKE '%x%'.
                var hasNumericId = int.TryParse(term, out int numericId);
                query = query.Where(i => i.InvoiceNumber.StartsWith(term) || (hasNumericId && i.Id == numericId));
            }

            if (!string.IsNullOrWhiteSpace(filter.CustomerName))
            {
                var term = filter.CustomerName.Trim();
                // Cliente: CustomerId / documento por prefijo (identificadores), nombre por contención (lenguaje natural).
                query = query.Where(i =>
                    i.CustomerId.StartsWith(term) ||
                    (i.CustomerDocumentSnapshot != null && i.CustomerDocumentSnapshot.StartsWith(term)) ||
                    (i.CustomerFullNameSnapshot != null && i.CustomerFullNameSnapshot.Contains(term)));
            }
        }

        query = query.OrderByDescending(i => i.CreatedDate);

        var totalCount = await context.CountAsync(query);
        var pageNumber = filter?.PageNumber > 0 ? filter.PageNumber : 1;
        var pageSize = filter?.PageSize > 0 ? filter.PageSize : 10;

        var pagedQuery = query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize);

        var projected = pagedQuery.Select(i => new InvoiceResponseDto
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

        var items = (await context.ToListAsync(projected)).ToList();
        return new PagedResultDto<InvoiceResponseDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<int> GetLastInvoiceId()
    {
        var last = await context.FirstOrDefaultAsync(context.Invoices.OrderByDescending(i => i.Id).Select(i => new { i.Id }));
        return last?.Id ?? 0;
    }
}
