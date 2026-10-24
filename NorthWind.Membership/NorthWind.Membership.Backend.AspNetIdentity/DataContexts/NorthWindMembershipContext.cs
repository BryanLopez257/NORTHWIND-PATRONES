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
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<NorthWindUser>(b =>
        {
            b.Property(u => u.Email).HasMaxLength(254);
            b.Property(u => u.NormalizedEmail).HasMaxLength(254);
            b.Property(u => u.UserName).HasMaxLength(254);
            b.Property(u => u.NormalizedUserName).HasMaxLength(254);
        });
    }
}
