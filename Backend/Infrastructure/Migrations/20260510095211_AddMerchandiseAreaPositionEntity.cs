using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMerchandiseAreaPositionEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MerchandiseAreaPositions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AreaId = table.Column<int>(type: "integer", nullable: false),
                    Location = table.Column<Point>(type: "geometry", nullable: false),
                    ShipmentId = table.Column<int>(type: "integer", nullable: false),
                    TallymanId = table.Column<string>(type: "text", nullable: false),
                    PlacedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FileUploadsId = table.Column<int>(type: "integer", nullable: true),
                    IsEmergencyPlacement = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MerchandiseAreaPositions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MerchandiseAreaPositions_Areas_AreaId",
                        column: x => x.AreaId,
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MerchandiseAreaPositions_AspNetUsers_TallymanId",
                        column: x => x.TallymanId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MerchandiseAreaPositions_FileUploads_FileUploadsId",
                        column: x => x.FileUploadsId,
                        principalTable: "FileUploads",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MerchandiseAreaPositions_Shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "Shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MerchandiseAreaPositions_AreaId",
                table: "MerchandiseAreaPositions",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_MerchandiseAreaPositions_FileUploadsId",
                table: "MerchandiseAreaPositions",
                column: "FileUploadsId");

            migrationBuilder.CreateIndex(
                name: "IX_MerchandiseAreaPositions_ShipmentId",
                table: "MerchandiseAreaPositions",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_MerchandiseAreaPositions_TallymanId",
                table: "MerchandiseAreaPositions",
                column: "TallymanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MerchandiseAreaPositions");
        }
    }
}
