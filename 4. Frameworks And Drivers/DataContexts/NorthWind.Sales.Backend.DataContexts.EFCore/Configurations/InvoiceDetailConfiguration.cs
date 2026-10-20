namespace NorthWind.Sales.Backend.DataContexts.EFCore.Configurations;

internal class InvoiceDetailConfiguration : IEntityTypeConfiguration<InvoiceDetail>
{
    public void Configure(EntityTypeBuilder<InvoiceDetail> builder)
    {
        builder.ToTable("InvoiceDetails");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.ProductNameSnapshot).HasMaxLength(100);
        builder.Property(d => d.UnitPrice).HasPrecision(18, 2);

        builder.HasOne(d => d.Product)
            .WithMany()
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
