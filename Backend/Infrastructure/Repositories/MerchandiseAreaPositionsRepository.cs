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
    public class MerchandiseAreaPositionsRepository(ApplicationDbContext context)
        : IMerchandiseAreaPositions
    {
        private readonly ApplicationDbContext _context = context;

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

        // Deliberately uncached for now — diagnosing whether FusionCache/Redis is
        // still the cause of "Unexpected Execution Error" on the positions GraphQL
        // list query even after registering GeoJsonConverterFactory. If positions
        // load fine with caching off here, the Tallyman/Shipment/Area/FileUploads
        // navigation graph (not just Location) is what's failing to serialize.
        public async Task<MerchandiseAreaPosition?> GetPositionAsync(int id)
        {
            return await _context
                .MerchandiseAreaPositions.Include(x => x.Area)
                .Include(x => x.Zone)
                .Include(x => x.Shipment)
                    .ThenInclude(s => s.Client)
                .Include(x => x.Shipment)
                    .ThenInclude(s => s.Merchandise)
                .Include(x => x.Shipment)
                    .ThenInclude(s => s.Vessel)
                .Include(x => x.Tallyman)
                .Include(x => x.FileUploads)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IQueryable<MerchandiseAreaPosition>> GetPositionsAsync()
        {
            var result = await _context
                .MerchandiseAreaPositions.Include(x => x.Area)
                .Include(x => x.Zone)
                .Include(x => x.Shipment)
                    .ThenInclude(s => s.Client)
                .Include(x => x.Shipment)
                    .ThenInclude(s => s.Merchandise)
                .Include(x => x.Shipment)
                    .ThenInclude(s => s.Vessel)
                .Include(x => x.Tallyman)
                .Include(x => x.FileUploads)
                .AsNoTracking()
                .ToListAsync();
            return result.AsQueryable();
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

        // Deliberately uncached — every tallyman queries a different point/radius,
        // so there's no shared cache key worth keeping warm, and positions change
        // frequently enough that a stale "nearby" result would be actively
        // misleading for someone about to place cargo there.
        public async Task<List<MerchandiseAreaPosition>> GetNearbyPositionsAsync(
            Point point,
            double radiusInDegrees
        ) =>
            await _context
                .MerchandiseAreaPositions.AsNoTracking()
                .Include(p => p.Shipment)
                    .ThenInclude(s => s.Client)
                .Include(p => p.Shipment)
                    .ThenInclude(s => s.Merchandise)
                .Include(p => p.Shipment)
                    .ThenInclude(s => s.Vessel)
                .Include(p => p.Area)
                .Include(p => p.Zone)
                .Where(p => p.IsActive && p.state == PositionState.active)
                .Where(p => p.Location.IsWithinDistance(point, radiusInDegrees))
                .ToListAsync();

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

        // Deliberately uncached — see ZonesRepository.GetActiveZonesGeoJsonAsync
        // for why (same FusionCache/Redis staleness issue, same fix). The
        // dashboard map already stays current moment-to-moment via the
        // PositionCreated/PositionReleased SignalR events, so caching this
        // bought very little anyway — it only ever mattered for the first load.
        public async Task<GeoJsonFeatureCollection> GetActivePositionsGeoJsonAsync()
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
                .ToListAsync();

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
        }
    }
}
