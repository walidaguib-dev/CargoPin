using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMerchandisesEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Merchandises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CargoType = table.Column<int>(type: "integer", nullable: false),
                    Weight = table.Column<decimal>(type: "numeric", nullable: true),
                    NumberOfHeat = table.Column<int>(type: "integer", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Merchandises", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Merchandises");
        }
    }
}
