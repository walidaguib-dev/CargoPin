using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class addVesselsEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Vessels",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IMONumber = table.Column<string>(type: "text", nullable: true),
                    ArrivalDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    DepartureDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    Status = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vessels", x => x.Id);
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Vessels");
        }
    }
}
