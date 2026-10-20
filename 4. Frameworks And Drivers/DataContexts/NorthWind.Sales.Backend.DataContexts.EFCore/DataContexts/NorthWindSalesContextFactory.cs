namespace NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;

internal class NorthWindSalesContextFactory : IDesignTimeDbContextFactory<NorthWindSalesContext>
{
    public NorthWindSalesContext CreateDbContext(string[] args)
    {
        var options = Microsoft.Extensions.Options.Options.Create(new DBOptions
        {
            ConnectionString = @"Server=127.0.0.1,1433;Database=NorthWindDB;User Id=sa;Password=1234;TrustServerCertificate=True;Encrypt=True;"
        });
        return new NorthWindSalesContext(options);
    }
}
