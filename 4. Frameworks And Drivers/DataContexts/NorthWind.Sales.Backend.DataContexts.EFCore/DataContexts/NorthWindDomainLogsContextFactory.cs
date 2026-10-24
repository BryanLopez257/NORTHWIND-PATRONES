namespace NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;

internal class NorthWindDomainLogsContextFactory : IDesignTimeDbContextFactory<NorthWindDomainLogsContext>
{
    public NorthWindDomainLogsContext CreateDbContext(string[] args)
    {
        DotEnvLoader.Load();

        string connectionString = Environment.GetEnvironmentVariable("DBOptions__DomainLogsConnectionString")
            ?? @"Server=localhost,1433;Database=NorthWindLogsDB;User Id=sa;Password=YourPasswordHere!;TrustServerCertificate=True;";

        var options = Microsoft.Extensions.Options.Options.Create(new DBOptions
        {
            DomainLogsConnectionString = connectionString
        });
        return new NorthWindDomainLogsContext(options);
    }
}
