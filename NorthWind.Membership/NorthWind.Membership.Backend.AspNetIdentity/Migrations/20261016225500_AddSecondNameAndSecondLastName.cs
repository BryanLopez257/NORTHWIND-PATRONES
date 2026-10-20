using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NorthWind.Membership.Backend.AspNetIdentity.Migrations
{
    /// <inheritdoc />
    public partial class AddSecondNameAndSecondLastName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SecondName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondLastName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SecondName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "SecondLastName",
                table: "AspNetUsers");
        }
    }
}
