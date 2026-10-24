using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NorthWind.Sales.Backend.Repositories.Entities;
using NorthWind.Sales.Entities.Enums;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Configurations;

internal class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers", t =>
        {
            t.HasCheckConstraint(
                "CK_Customers_CustomerType_Integrity",
                "([CustomerType] = 1 AND [FirstName] IS NOT NULL AND [LastName] IS NOT NULL AND [BusinessName] IS NULL) OR " +
                "([CustomerType] = 2 AND [BusinessName] IS NOT NULL AND [FirstName] IS NULL AND [LastName] IS NULL AND [SecondName] IS NULL AND [SecondLastName] IS NULL)"
            );

            t.HasCheckConstraint(
                "CK_Customers_Identification_Format",
                "([CustomerType] = 1 AND (LEN([Identification]) = 10 OR (LEN([Identification]) = 13 AND RIGHT([Identification], 3) <> '000'))) OR " +
                "([CustomerType] = 2 AND LEN([Identification]) = 13 AND RIGHT([Identification], 3) <> '000')"
            );
        });

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasMaxLength(5).IsFixedLength();
        builder.Property(c => c.CurrentBalance).HasPrecision(8, 2);
        builder.Property(c => c.CustomerType).IsRequired().HasConversion<int>();
        builder.Property(c => c.Identification).IsRequired().HasMaxLength(13).IsUnicode(false);

        builder.Property(c => c.FirstName).HasMaxLength(50).IsRequired(false);
        builder.Property(c => c.SecondName).HasMaxLength(50).IsRequired(false);
        builder.Property(c => c.LastName).HasMaxLength(50).IsRequired(false);
        builder.Property(c => c.SecondLastName).HasMaxLength(50).IsRequired(false);
        builder.Property(c => c.BusinessName).HasMaxLength(150).IsRequired(false);
        builder.Property(c => c.TradeName).HasMaxLength(150).IsRequired(false);

        builder.Property(c => c.Name)
            .HasMaxLength(200)
            .HasComputedColumnSql(
                "CASE WHEN [CustomerType] = 2 THEN ISNULL([BusinessName], '') " +
                "ELSE CONCAT_WS(' ', [LastName], [SecondLastName], [FirstName], [SecondName]) END",
                stored: true);

        // Índices B-Tree SARGables
        builder.HasIndex(c => c.Identification)
            .IsUnique()
            .HasDatabaseName("IX_Customers_Identification");

        builder.HasIndex(c => new { c.LastName, c.FirstName })
            .HasDatabaseName("IX_Customers_LastName_FirstName");

        builder.HasIndex(c => c.FirstName)
            .HasDatabaseName("IX_Customers_FirstName");

        builder.HasIndex(c => c.BusinessName)
            .HasDatabaseName("IX_Customers_BusinessName");

        builder.HasIndex(c => c.TradeName)
            .HasDatabaseName("IX_Customers_TradeName");

        // Seed data matemáticamente válido para SRI (Módulo 10 y Módulo 11)
        builder.HasData(
            new Customer
            {
                Id = "ALFKI",
                CurrentBalance = 0,
                CustomerType = CustomerType.Legal,
                Identification = "1790011674001",
                BusinessName = "ALFREDS FUTTERKISTE CIA. LTDA.",
                TradeName = "Alfreds Futterkiste"
            },
            new Customer
            {
                Id = "ANATR",
                CurrentBalance = 0,
                CustomerType = CustomerType.Natural,
                Identification = "0102030400",
                FirstName = "Ana",
                SecondName = "María",
                LastName = "Trujillo",
                SecondLastName = "Pérez",
                TradeName = "Emparedados y helados"
            },
            new Customer
            {
                Id = "ANTON",
                CurrentBalance = 100,
                CustomerType = CustomerType.Natural,
                Identification = "1803456787",
                FirstName = "Antonio",
                SecondName = "José",
                LastName = "Moreno",
                SecondLastName = "Taquería",
                TradeName = "Taquería El Paso"
            }
        );
    }
}
