namespace NorthWind.Membership.Backend.AspNetIdentity.DataContexts;

public class NorthWindMembershipContext : IdentityDbContext<NorthWindUser>
{
    readonly IOptions<MembershipDBOptions> dbOptions;

    public NorthWindMembershipContext(IOptions<MembershipDBOptions> dbOptions)
    {
        this.dbOptions = dbOptions;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured && dbOptions?.Value?.ConnectionString != null)
        {
            optionsBuilder.UseSqlServer(dbOptions.Value.ConnectionString);
        }
        base.OnConfiguring(optionsBuilder);
    }
}
