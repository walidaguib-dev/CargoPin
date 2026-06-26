using Domain.Entities;
using Domain.Enums;
using Domain.Helpers;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Infrastructure.Data.Seeders
{
    // Seeds Vessels -> Merchandises -> Clients -> Zones -> Areas -> Shipments,
    // in that FK order. Deliberately does NOT seed MerchandiseAreaPositions or
    // any User: MerchandiseAreaPosition.TallymanId is only ever populated by
    // MerchandiseAreaPositionsEndpoints.cs pulling ClaimTypes.NameIdentifier off
    // an authenticated request's JWT (see CreateMerchandiseAreaPositionCommand) —
    // there is no seed-time equivalent of "the logged-in tallyman", so positions
    // are created through the API after a real login instead.
    public class CargoDataSeeder(ApplicationDbContext context)
    {
        private readonly ApplicationDbContext _context = context;

        public async Task SeedAsync()
        {
            // Idempotent — skip entirely if this has already run.
            if (await _context.Vessels.AnyAsync())
                return;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var vessels = await SeedVesselsAsync();
                var merchandises = await SeedMerchandisesAsync();
                var clients = await SeedClientsAsync();
                var zones = await SeedZonesAsync(merchandises);
                await SeedAreasAsync(zones, merchandises);
                var shipments = await SeedShipmentsAsync(clients, vessels, merchandises);
                await SeedPositionsAsync(shipments);

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<Dictionary<string, Vessel>> SeedVesselsAsync()
        {
            var vessels = new List<Vessel>
            {
                new()
                {
                    Name = "Bao Nico",
                    IMONumber = "9876543",
                    Status = VesselStatus.Berthed,
                },
                new()
                {
                    Name = "Ocean Feather",
                    IMONumber = "1234567",
                    Status = VesselStatus.Berthed,
                },
                new()
                {
                    Name = "Mediterranean Star",
                    IMONumber = "7654321",
                    Status = VesselStatus.Expected,
                },
                new()
                {
                    Name = "Atlas Carrier",
                    IMONumber = "3456789",
                    Status = VesselStatus.Departed,
                },
            };

            _context.Vessels.AddRange(vessels);
            await _context.SaveChangesAsync();

            return vessels.ToDictionary(v => v.Name);
        }

        private async Task<Dictionary<string, Merchandise>> SeedMerchandisesAsync()
        {
            var merchandises = new List<Merchandise>
            {
                new()
                {
                    Description = "Steel Coils",
                    CargoType = CargoType.SteelCoils,
                    Weight = 25000m,
                    NumberOfHeat = 150,
                },
                new()
                {
                    Description = "Big Bags",
                    CargoType = CargoType.Colis,
                    Weight = 8000m,
                },
                new()
                {
                    Description = "Industrial Machinery",
                    CargoType = CargoType.Machinery,
                    Weight = 45000m,
                },
                new()
                {
                    Description = "General Goods",
                    CargoType = CargoType.GeneralCargo,
                    Weight = 12000m,
                },
            };

            _context.Merchandises.AddRange(merchandises);
            await _context.SaveChangesAsync();

            return merchandises.ToDictionary(m => m.Description);
        }

        private async Task<Dictionary<string, Client>> SeedClientsAsync()
        {
            var clients = new List<Client>
            {
                new()
                {
                    Name = "Houdna Metal",
                    ContactPerson = "Ahmed Houdna",
                    Phone = "+213550001111",
                },
                new()
                {
                    Name = "SGT",
                    ContactPerson = "Karim Slimani",
                    Phone = "+213550002222",
                },
                new()
                {
                    Name = "Enafor",
                    ContactPerson = "Mohamed Enafer",
                    Phone = "+213550003333",
                },
                new()
                {
                    Name = "Sonelgaz",
                    ContactPerson = "Ali Bouazza",
                    Phone = "+213550004444",
                },
                new()
                {
                    Name = "Naftal",
                    ContactPerson = "Omar Benali",
                    Phone = "+213550005555",
                },
            };

            _context.Clients.AddRange(clients);
            await _context.SaveChangesAsync();

            return clients.ToDictionary(c => c.Name);
        }

        private async Task<Dictionary<string, Zone>> SeedZonesAsync(
            Dictionary<string, Merchandise> merchandises
        )
        {
            // Domain.Enums.ZoneType only has Hangar/Quay — the task's "OpenYard"
            // and "Restricted" zone types don't exist on the real enum. Mapped to
            // the closest fit: open-air cargo / deep-water vessel areas -> Quay,
            // covered storage -> Hangar. CreateZoneValidator requires
            // DesignatedMerchandiseId for Hangar zones and forbids it for Quay
            // zones, so that rule is followed here too even though the seeder
            // bypasses the validator pipeline.
            var zones = new List<Zone>
            {
                new()
                {
                    Name = "General Cargo Zone",
                    Code = "GCZ",
                    Type = ZoneType.Quay,
                    IsActive = true,
                    DesignatedMerchandiseId = null,
                    Boundary = CreatePolygon(
                        (37.7340, 6.5700),
                        (37.7340, 6.5750),
                        (37.7310, 6.5750),
                        (37.7310, 6.5700),
                        (37.7340, 6.5700)
                    ),
                },
                new()
                {
                    Name = "Hangar Zone",
                    Code = "HGZ",
                    Type = ZoneType.Hangar,
                    IsActive = true,
                    DesignatedMerchandise = merchandises["Industrial Machinery"],
                    Boundary = CreatePolygon(
                        (37.7350, 6.5760),
                        (37.7350, 6.5800),
                        (37.7330, 6.5800),
                        (37.7330, 6.5760),
                        (37.7350, 6.5760)
                    ),
                },
                new()
                {
                    Name = "West Zone",
                    Code = "WZ",
                    Type = ZoneType.Quay,
                    IsActive = true,
                    DesignatedMerchandiseId = null,
                    Boundary = CreatePolygon(
                        (37.7300, 6.5680),
                        (37.7300, 6.5710),
                        (37.7280, 6.5710),
                        (37.7280, 6.5680),
                        (37.7300, 6.5680)
                    ),
                },
            };

            _context.Zones.AddRange(zones);
            await _context.SaveChangesAsync();

            return zones.ToDictionary(z => z.Name);
        }

        private async Task SeedAreasAsync(
            Dictionary<string, Zone> zones,
            Dictionary<string, Merchandise> merchandises
        )
        {
            // Area.DesignatedMerchandiseId is non-nullable — the task's area list
            // didn't specify one per area, so each is assigned the merchandise its
            // name/role implies (Hangar B and West Dock have no obvious match, so
            // both default to General Goods).
            var areas = new List<Area>
            {
                new()
                {
                    Name = "Steel Coils Area",
                    Code = "A1",
                    Status = AreaStatus.Occupied,
                    IsActive = true,
                    Zone = zones["General Cargo Zone"],
                    DesignatedMerchandise = merchandises["Steel Coils"],
                    Boundary = CreatePolygon(
                        (37.7338, 6.5705),
                        (37.7338, 6.5725),
                        (37.7320, 6.5725),
                        (37.7320, 6.5705),
                        (37.7338, 6.5705)
                    ),
                },
                new()
                {
                    Name = "Big Bags Area",
                    Code = "A2",
                    Status = AreaStatus.Available,
                    IsActive = true,
                    Zone = zones["General Cargo Zone"],
                    DesignatedMerchandise = merchandises["Big Bags"],
                    Boundary = CreatePolygon(
                        (37.7338, 6.5728),
                        (37.7338, 6.5748),
                        (37.7320, 6.5748),
                        (37.7320, 6.5728),
                        (37.7338, 6.5728)
                    ),
                },
                new()
                {
                    Name = "Hangar A",
                    Code = "HA",
                    Status = AreaStatus.Occupied,
                    IsActive = true,
                    Zone = zones["Hangar Zone"],
                    DesignatedMerchandise = merchandises["Industrial Machinery"],
                    Boundary = CreatePolygon(
                        (37.7348, 6.5765),
                        (37.7348, 6.5785),
                        (37.7335, 6.5785),
                        (37.7335, 6.5765),
                        (37.7348, 6.5765)
                    ),
                },
                new()
                {
                    Name = "Hangar B",
                    Code = "HB",
                    Status = AreaStatus.Available,
                    IsActive = true,
                    Zone = zones["Hangar Zone"],
                    DesignatedMerchandise = merchandises["General Goods"],
                    Boundary = CreatePolygon(
                        (37.7348, 6.5788),
                        (37.7348, 6.5798),
                        (37.7335, 6.5798),
                        (37.7335, 6.5788),
                        (37.7348, 6.5788)
                    ),
                },
                new()
                {
                    Name = "West Dock Area",
                    Code = "WDA",
                    Status = AreaStatus.Occupied,
                    IsActive = true,
                    Zone = zones["West Zone"],
                    DesignatedMerchandise = merchandises["General Goods"],
                    Boundary = CreatePolygon(
                        (37.7298, 6.5683),
                        (37.7298, 6.5707),
                        (37.7283, 6.5707),
                        (37.7283, 6.5683),
                        (37.7298, 6.5683)
                    ),
                },
            };

            _context.Areas.AddRange(areas);
            await _context.SaveChangesAsync();
        }

        private async Task<List<Shipment>> SeedShipmentsAsync(
            Dictionary<string, Client> clients,
            Dictionary<string, Vessel> vessels,
            Dictionary<string, Merchandise> merchandises
        )
        {
            var shipments = new List<Shipment>
            {
                new()
                {
                    Client = clients["Houdna Metal"],
                    Vessel = vessels["Bao Nico"],
                    Merchandise = merchandises["Steel Coils"],
                    BLNumbers = ["BL-2026-001", "BL-2026-002"],
                    ArrivalDate = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc),
                    Status = ShipmentStatus.Stored,
                },
                new()
                {
                    Client = clients["SGT"],
                    Vessel = vessels["Bao Nico"],
                    Merchandise = merchandises["Big Bags"],
                    BLNumbers = ["BL-2026-003"],
                    ArrivalDate = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc),
                    Status = ShipmentStatus.Stored,
                },
                new()
                {
                    Client = clients["Enafor"],
                    Vessel = vessels["Ocean Feather"],
                    Merchandise = merchandises["Industrial Machinery"],
                    BLNumbers = ["BL-2026-004", "BL-2026-005"],
                    ArrivalDate = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                    Status = ShipmentStatus.Stored,
                },
                new()
                {
                    Client = clients["Sonelgaz"],
                    Vessel = vessels["Ocean Feather"],
                    Merchandise = merchandises["General Goods"],
                    BLNumbers = ["BL-2026-006"],
                    ArrivalDate = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                    // ShipmentStatus has no "Receiving" value — PartiallyStored is
                    // the closest match (cargo actively being processed, not yet
                    // fully Stored and past just Awaiting).
                    Status = ShipmentStatus.PartiallyStored,
                },
                new()
                {
                    Client = clients["Naftal"],
                    Vessel = vessels["Mediterranean Star"],
                    Merchandise = merchandises["Steel Coils"],
                    BLNumbers = ["BL-2026-007"],
                    ArrivalDate = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                    Status = ShipmentStatus.Awaiting,
                },
            };

            _context.Shipments.AddRange(shipments);
            await _context.SaveChangesAsync();

            return shipments;
        }

        // Hardcoded TallymanId rather than creating a User here — the seeder is
        // explicitly forbidden from touching Users (TallymanId is only ever
        // populated for real via the JWT claim on an authenticated
        // /api/positions/create request). This assumes a user with this exact Id
        // already exists from registration; if it doesn't, SaveChangesAsync below
        // will fail on the FK constraint.
        private async Task SeedPositionsAsync(List<Shipment> shipments)
        {
            // Idempotent — skip entirely if this has already run, independent of
            // the outer Vessels check (so re-running after a partial/older seed
            // that predates positions still backfills this one safely).
            if (await _context.MerchandiseAreaPositions.AnyAsync())
                return;

            const string tallymanId = "4b0e2051-9c72-4495-8a1a-2bd4eb474011";

            var position = new MerchandiseAreaPosition
            {
                ShipmentId = shipments[0].Id,
                Location = GeometryHelper.ToPoint(latitude: 36.825236, longitude: 5.897694),
                TallymanId = tallymanId,
                IsEmergencyPlacement = false,
                IsActive = true,
                PlacedAt = DateTime.UtcNow,
                Notes = "Test position — Steel Coils near hangar",
            };

            await _context.MerchandiseAreaPositions.AddAsync(position);
            await _context.SaveChangesAsync();
        }

        // Input points are (latitude, longitude) pairs — the same authoring shape
        // as everywhere else boundaries are built in this codebase
        // (Domain.Helpers.BoundaryCoordinate is {Latitude, Longitude}). Delegates
        // to GeometryHelper.ToPolygon for the actual lat/lng -> PostGIS lng/lat
        // Coordinate conversion, ring-closing, and validity check, so seeded
        // polygons are constructed exactly the same way as polygons drawn through
        // the Map page's Draw Zone/Draw Area flow.
        private static Polygon CreatePolygon(params (double Latitude, double Longitude)[] points)
        {
            var boundary = points
                .Select(p => new BoundaryCoordinate
                {
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                })
                .ToList();
            return GeometryHelper.ToPolygon(boundary);
        }
    }
}
