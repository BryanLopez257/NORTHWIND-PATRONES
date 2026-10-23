namespace NorthWind.Sales.Entities.Dtos.Common;

public class PaginationFilterDto
{
    private int _pageNumber = 1;
    private int _pageSize = 10;
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 50;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? DefaultPageSize : (value > MaxPageSize ? MaxPageSize : value);
    }
}
