namespace NorthWind.Membership.Backend.AspNetIdentity.DataContexts;

internal class NorthWindMembershipContextFactory : IDesignTimeDbContextFactory<NorthWindMembershipContext>
{
    public NorthWindMembershipContext CreateDbContext(string[] args)
    {
        IOptions<MembershipDBOptions> DbOptions =
            Microsoft.Extensions.Options.Options.Create(new MembershipDBOptions
            {
                ConnectionString = "Server=127.0.0.1,1433;Database=NorthWindUsersDB;User Id=sa;Password=1234;TrustServerCertificate=True;Encrypt=True;"
            });
        return new NorthWindMembershipContext(DbOptions);
    }
}
