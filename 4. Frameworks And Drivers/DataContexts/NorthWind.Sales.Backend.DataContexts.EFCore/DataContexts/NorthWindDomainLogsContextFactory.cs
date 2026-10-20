namespace NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;

internal class NorthWindDomainLogsContextFactory : IDesignTimeDbContextFactory<NorthWindDomainLogsContext>
{
    public NorthWindDomainLogsContext CreateDbContext(string[] args)
    {
        var options = Microsoft.Extensions.Options.Options.Create(new DBOptions
        {
            DomainLogsConnectionString = @"Server=127.0.0.1,1433;Database=NorthWindLogsDB;User Id=sa;Password=1234;TrustServerCertificate=True;Encrypt=True;"
        });
        return new NorthWindDomainLogsContext(options);
    }
}
