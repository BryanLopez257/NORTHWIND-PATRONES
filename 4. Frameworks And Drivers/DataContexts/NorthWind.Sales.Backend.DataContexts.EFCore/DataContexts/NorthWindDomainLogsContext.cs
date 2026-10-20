namespace NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;

internal class NorthWindDomainLogsContext(IOptions<DBOptions> dbOptions) : DbContext
{
    public DbSet<DomainLog> DomainLogs { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(dbOptions.Value.DomainLogsConnectionString)
        {
            Enlist = false
        };
        optionsBuilder.UseSqlServer(builder.ConnectionString);
    }
}
