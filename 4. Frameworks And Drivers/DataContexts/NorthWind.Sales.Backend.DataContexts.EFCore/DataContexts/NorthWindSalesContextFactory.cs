namespace NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;

internal class NorthWindSalesContextFactory : IDesignTimeDbContextFactory<NorthWindSalesContext>
{
    public NorthWindSalesContext CreateDbContext(string[] args)
    {
        DotEnvLoader.Load();

        string connectionString = Environment.GetEnvironmentVariable("DBOptions__ConnectionString")
            ?? @"Server=localhost,1433;Database=NorthWindDB;User Id=sa;Password=YourPasswordHere!;TrustServerCertificate=True;";

        var options = Microsoft.Extensions.Options.Options.Create(new DBOptions
        {
            ConnectionString = connectionString
        });
        return new NorthWindSalesContext(options);
    }
}
