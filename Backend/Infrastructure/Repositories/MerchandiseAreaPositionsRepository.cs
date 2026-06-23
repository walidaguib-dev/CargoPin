using Domain.Entities;
using Domain.Enums;
using Domain.GeoJson;
using Domain.Helpers;
using Domain.Interfaces;
using Domain.Requests.MerchandiseAreaPositions;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Infrastructure.Repositories
{
    public class MerchandiseAreaPositionsRepository(
        ApplicationDbContext context,
        ICaching cachingService
    ) : IMerchandiseAreaPositions
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<MerchandiseAreaPosition> CreateAsync(MerchandiseAreaPosition position)
        {
            var result = await _context.MerchandiseAreaPositions.AddAsync(position);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool?> DeleteAsync(int id)
        {
            var result = await _context
                .MerchandiseAreaPositions.Where(x => x.Id == id)
                .ExecuteDeleteAsync();
            return result is 0 ? null : true;
        }

        public async Task<MerchandiseAreaPosition?> GetPositionAsync(int id)
        {
            var key = $"position_{id}";
            return await _cachingService.GetOrSetAsync(
                key,
                async token =>
                    await _context
                        .MerchandiseAreaPositions.Include(x => x.Area)
                        .Include(x => x.Shipment)
                        .Include(x => x.Tallyman)
                        .Include(x => x.FileUploads)
                        .FirstOrDefaultAsync(x => x.Id == id, token),
                TimeSpan.FromMinutes(10),
                ["position"]
            );
        }

        public async Task<IQueryable<MerchandiseAreaPosition>> GetPositionsAsync()
        {
            var result = await _cachingService.GetOrSetAsync(
                "positions",
                async token =>
                    await _context
                        .MerchandiseAreaPositions.Include(x => x.Area)
                        .Include(x => x.Shipment)
                        .Include(x => x.Tallyman)
                        .Include(x => x.FileUploads)
                        .ToListAsync(token),
                TimeSpan.FromMinutes(10),
                ["positions"]
            );
            return (result ?? []).AsQueryable();
        }

        public async Task<bool?> UpdateAsync(int id, UpdateMerchandiseAreaPositionRequest request)
        {
            var position = await _context.MerchandiseAreaPositions.FindAsync(id);
            if (position is null)
                return null;

            if (request.Notes is not null)
                position.Notes = request.Notes;

            position.UpdatedAt = DateTime.UtcNow;

            if (
                !string.IsNullOrWhiteSpace(request.State)
                && Enum.TryParse<PositionState>(request.State, true, out var state)
            )
            {
                // Only stamp ClosedAt on the active->released transition, so
                // re-sending "released" doesn't clobber the original close time.
                if (state == PositionState.released && position.IsActive)
                {
                    position.IsActive = false;
                    position.ClosedAt = DateTime.UtcNow;
                }
                position.state = state;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Zone?> FindContainingZoneAsync(Point point) =>
            await _context
                .Zones.AsNoTracking()
                .Where(z => z.IsActive && z.Boundary != null && z.Boundary.Covers(point))
                .OrderBy(z => z.Id)
                .FirstOrDefaultAsync();

        public async Task<Area?> FindContainingAreaAsync(Point point) =>
            await _context
                .Areas.AsNoTracking()
                .Include(a => a.Zone)
                .Where(a => a.IsActive && a.Boundary.Covers(point))
                .OrderBy(a => a.Id)
                .FirstOrDefaultAsync();

        public async Task<GeoJsonFeatureCollection> GetActivePositionsGeoJsonAsync()
        {
            var result = await _cachingService.GetOrSetAsync(
                "positions:geojson",
                async token =>
                {
                    var positions = await _context
                        .MerchandiseAreaPositions.AsNoTracking()
                        .Include(p => p.Shipment)
                        .ThenInclude(s => s.Client)
                        .Include(p => p.Shipment)
                        .ThenInclude(s => s.Merchandise)
                        .Include(p => p.Shipment)
                        .ThenInclude(s => s.Vessel)
                        .Include(p => p.Area)
                        .Include(p => p.Zone)
                        .Where(p => p.IsActive)
                        .ToListAsync(token);

                    return new GeoJsonFeatureCollection
                    {
                        Features = positions
                            .Select(p => new GeoJsonFeature
                            {
                                Geometry = GeometryHelper.ToGeoJsonPoint(p.Location),
                                Properties = new PositionGeoJsonProperties
                                {
                                    Id = p.Id,
                                    ClientName = p.Shipment.Client.Name,
                                    MerchandiseDescription = p.Shipment.Merchandise.Description,
                                    VesselName = p.Shipment.Vessel.Name,
                                    AreaName = p.Area?.Name,
                                    ZoneName = p.Zone?.Name,
                                    IsEmergencyPlacement = p.IsEmergencyPlacement,
                                    PlacedAt = p.PlacedAt,
                                    Notes = p.Notes,
                                },
                            })
                            .ToList(),
                    };
                },
                TimeSpan.FromMinutes(2),
                ["positions:geojson"]
            );
            return result ?? new GeoJsonFeatureCollection();
        }
    }
}
