namespace NorthWind.Sales.Entities.Dtos.Products;

public class ProductFilterDto
{
    public string SearchTerm { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    /// <summary>
    /// 0 = Todos, 1 = En Stock (> 0), 2 = Stock Bajo (<= 10 y > 0), 3 = Agotado (== 0)
    /// </summary>
    public int? StockFilter { get; set; }
    /// <summary>
    /// "name", "price", "stock"
    /// </summary>
    public string OrderBy { get; set; } = "name";
    public bool Ascending { get; set; } = true;
}
