namespace NorthWind.Sales.Entities.Dtos.Invoices;

public class InvoiceFilterDto : PaginationFilterDto
{
    /// <summary>
    /// Término de búsqueda global (criterio 'all'): N° factura, código/documento o nombre del cliente.
    /// </summary>
    public string SearchTerm { get; set; }
    public string InvoiceNumber { get; set; }
    public string CustomerName { get; set; }
    public string CustomerId { get; set; }
}
