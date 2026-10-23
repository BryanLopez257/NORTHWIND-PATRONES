using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Migrations
{
    /// <inheritdoc />
    public partial class RefactorCustomerModel1FNAndSRI : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Normalizar datos existentes antes de alterar la columna CustomerType de string a int
            migrationBuilder.Sql("UPDATE [Customers] SET [CustomerType] = '2' WHERE [CustomerType] = 'Empresa' OR [CustomerType] IS NULL;");
            migrationBuilder.Sql("UPDATE [Customers] SET [CustomerType] = '1' WHERE [CustomerType] = 'Persona' OR [CustomerType] = 'Natural';");
            migrationBuilder.AlterColumn<int>(
                name: "CustomerType",
                table: "Customers",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Empresa");

            migrationBuilder.AddColumn<string>(
                name: "BusinessName",
                table: "Customers",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Customers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Identification",
                table: "Customers",
                type: "varchar(13)",
                unicode: false,
                maxLength: 13,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Customers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondLastName",
                table: "Customers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondName",
                table: "Customers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TradeName",
                table: "Customers",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Customers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                computedColumnSql: "CASE WHEN [CustomerType] = 2 THEN ISNULL([BusinessName], '') ELSE CONCAT_WS(' ', [LastName], [SecondLastName], [FirstName], [SecondName]) END",
                stored: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(40)",
                oldMaxLength: 40);
            migrationBuilder.Sql("DELETE FROM [Customers] WHERE [Id] NOT IN ('ALFKI', 'ANATR', 'ANTON');");

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: "ALFKI",
                columns: new[] { "BusinessName", "CustomerType", "FirstName", "Identification", "LastName", "SecondLastName", "SecondName", "TradeName" },
                values: new object[] { "ALFREDS FUTTERKISTE CIA. LTDA.", 2, null, "1790011674001", null, null, null, "Alfreds Futterkiste" });

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: "ANATR",
                columns: new[] { "BusinessName", "CustomerType", "FirstName", "Identification", "LastName", "SecondLastName", "SecondName", "TradeName" },
                values: new object[] { null, 1, "Ana", "0102030400", "Trujillo", "Pérez", "María", "Emparedados y helados" });

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: "ANTON",
                columns: new[] { "BusinessName", "CustomerType", "FirstName", "Identification", "LastName", "SecondLastName", "SecondName", "TradeName" },
                values: new object[] { null, 1, "Antonio", "1803456787", "Moreno", "Taquería", "José", "Taquería El Paso" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_BusinessName",
                table: "Customers",
                column: "BusinessName");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_FirstName",
                table: "Customers",
                column: "FirstName");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Identification",
                table: "Customers",
                column: "Identification",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_LastName_FirstName",
                table: "Customers",
                columns: new[] { "LastName", "FirstName" });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TradeName",
                table: "Customers",
                column: "TradeName");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Customers_CustomerType_Integrity",
                table: "Customers",
                sql: "([CustomerType] = 1 AND [FirstName] IS NOT NULL AND [LastName] IS NOT NULL AND [BusinessName] IS NULL) OR ([CustomerType] = 2 AND [BusinessName] IS NOT NULL AND [FirstName] IS NULL AND [LastName] IS NULL AND [SecondName] IS NULL AND [SecondLastName] IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Customers_Identification_Format",
                table: "Customers",
                sql: "([CustomerType] = 1 AND (LEN([Identification]) = 10 OR (LEN([Identification]) = 13 AND RIGHT([Identification], 3) <> '000'))) OR ([CustomerType] = 2 AND LEN([Identification]) = 13 AND RIGHT([Identification], 3) <> '000')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Customers_BusinessName",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_FirstName",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_Identification",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_LastName_FirstName",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_TradeName",
                table: "Customers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Customers_CustomerType_Integrity",
                table: "Customers");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Customers_Identification_Format",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "BusinessName",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "Identification",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "SecondLastName",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "SecondName",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "TradeName",
                table: "Customers");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Customers",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true,
                oldComputedColumnSql: "CASE WHEN [CustomerType] = 2 THEN ISNULL([BusinessName], '') ELSE CONCAT_WS(' ', [LastName], [SecondLastName], [FirstName], [SecondName]) END");

            migrationBuilder.AlterColumn<string>(
                name: "CustomerType",
                table: "Customers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Empresa",
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: "ALFKI",
                columns: new[] { "CustomerType", "Name" },
                values: new object[] { "Empresa", "Alfreds Futterkiste" });

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: "ANATR",
                columns: new[] { "CustomerType", "Name" },
                values: new object[] { "Empresa", "Ana Trujillo Emparedados y helados" });

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: "ANTON",
                columns: new[] { "CustomerType", "Name" },
                values: new object[] { "Empresa", "Antonio Moreno Taquería" });
        }
    }
}