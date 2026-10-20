BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012152657_AddInvoicesAndInvoiceDetails'
)
BEGIN
    CREATE TABLE [Invoices] (
        [Id] int NOT NULL IDENTITY,
        [InvoiceNumber] nvarchar(20) NOT NULL,
        [CustomerId] nchar(5) NOT NULL,
        [CustomerDocumentSnapshot] nvarchar(50) NULL,
        [CustomerFullNameSnapshot] nvarchar(100) NULL,
        [CustomerAddressSnapshot] nvarchar(200) NULL,
        [CustomerPhoneSnapshot] nvarchar(50) NULL,
        [CustomerEmailSnapshot] nvarchar(100) NULL,
        [SellerFullNameSnapshot] nvarchar(100) NULL,
        [SubTotal] decimal(18,2) NOT NULL,
        [Tax] decimal(18,2) NOT NULL,
        [Total] decimal(18,2) NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Invoices] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Invoices_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012152657_AddInvoicesAndInvoiceDetails'
)
BEGIN
    CREATE TABLE [InvoiceDetails] (
        [Id] int NOT NULL IDENTITY,
        [InvoiceId] int NOT NULL,
        [ProductId] int NOT NULL,
        [ProductNameSnapshot] nvarchar(100) NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_InvoiceDetails] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InvoiceDetails_Invoices_InvoiceId] FOREIGN KEY ([InvoiceId]) REFERENCES [Invoices] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_InvoiceDetails_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012152657_AddInvoicesAndInvoiceDetails'
)
BEGIN
    CREATE INDEX [IX_InvoiceDetails_InvoiceId] ON [InvoiceDetails] ([InvoiceId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012152657_AddInvoicesAndInvoiceDetails'
)
BEGIN
    CREATE INDEX [IX_InvoiceDetails_ProductId] ON [InvoiceDetails] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012152657_AddInvoicesAndInvoiceDetails'
)
BEGIN
    CREATE INDEX [IX_Invoices_CreatedDate] ON [Invoices] ([CreatedDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012152657_AddInvoicesAndInvoiceDetails'
)
BEGIN
    CREATE INDEX [IX_Invoices_CustomerId] ON [Invoices] ([CustomerId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012152657_AddInvoicesAndInvoiceDetails'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Invoices_InvoiceNumber] ON [Invoices] ([InvoiceNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261012152657_AddInvoicesAndInvoiceDetails'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261012152657_AddInvoicesAndInvoiceDetails', N'8.0.11');
END;
GO

COMMIT;
GO

