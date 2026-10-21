namespace NorthWind.Membership.Backend.AspNetIdentity.DataContexts;

internal class NorthWindMembershipContextFactory : IDesignTimeDbContextFactory<NorthWindMembershipContext>
{
    public NorthWindMembershipContext CreateDbContext(string[] args)
    {
        DotEnvLoader.Load();

        string connectionString = Environment.GetEnvironmentVariable("MembershipDBOptions__ConnectionString")
            ?? Environment.GetEnvironmentVariable("MembershipDB__ConnectionString")
            ?? @"Server=localhost,1433;Database=NorthWindUsersDB;User Id=sa;Password=YourPasswordHere!;TrustServerCertificate=True;";

        IOptions<MembershipDBOptions> DbOptions =
            Microsoft.Extensions.Options.Options.Create(new MembershipDBOptions
            {
                ConnectionString = connectionString
            });
        return new NorthWindMembershipContext(DbOptions);
    }
}
