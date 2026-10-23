namespace NorthWind.Sales.Backend.DataContexts.EFCore.Configurations;

internal class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(i => i.InvoiceNumber).IsUnique();
        builder.HasIndex(i => i.CreatedDate);

        builder.Property(i => i.CustomerId)
            .IsRequired()
            .HasMaxLength(5);

        builder.Property(i => i.CustomerDocumentSnapshot).HasMaxLength(50);
        builder.Property(i => i.CustomerFullNameSnapshot).HasMaxLength(100);
        builder.Property(i => i.CustomerAddressSnapshot).HasMaxLength(200);
        builder.Property(i => i.CustomerPhoneSnapshot).HasMaxLength(50);
        builder.Property(i => i.CustomerEmailSnapshot).HasMaxLength(254);
        builder.Property(i => i.SellerFullNameSnapshot).HasMaxLength(100);

        builder.Property(i => i.SubTotal).HasPrecision(18, 2);
        builder.Property(i => i.Tax).HasPrecision(18, 2);
        builder.Property(i => i.Total).HasPrecision(18, 2);

        builder.HasOne(i => i.Customer)
            .WithMany()
            .HasForeignKey(i => i.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.Details)
            .WithOne(d => d.Invoice)
            .HasForeignKey(d => d.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
