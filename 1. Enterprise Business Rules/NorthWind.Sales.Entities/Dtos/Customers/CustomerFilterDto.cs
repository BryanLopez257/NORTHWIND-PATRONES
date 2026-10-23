namespace NorthWind.Sales.Entities.Dtos.Customers;

public class CustomerFilterDto : PaginationFilterDto
{
    public string? SearchTerm { get; set; }
    /// <summary>
    /// 0 = Todos, 1 = Al día (Saldo == 0), 2 = Con saldo pendiente (> 0), 3 = Saldo alto (>= 100)
    /// </summary>
    public int? BalanceFilter { get; set; }
    public decimal? MinBalance { get; set; }
    public decimal? MaxBalance { get; set; }
    /// <summary>
    /// "id", "name", "balance", "identification", "lastname", "businessname"
    /// </summary>
    public string OrderBy { get; set; } = "name";
    public bool Ascending { get; set; } = true;
    public string? CustomerType { get; set; }
    public string? Criteria { get; set; }
}
