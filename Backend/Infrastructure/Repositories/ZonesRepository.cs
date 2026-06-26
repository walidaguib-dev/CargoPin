using Domain.Entities;
using Domain.Enums;
using Domain.GeoJson;
using Domain.Helpers;
using Domain.Interfaces;
using Domain.Requests.Zones;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ZonesRepository(ApplicationDbContext context, ICaching cachingService) : IZones
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<Zone> CreateAsync(Zone zone)
        {
            var result = await _context.Zones.AddAsync(zone);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool?> DeleteAsync(int Id)
        {
            var result = await _context.Zones.Where(x => x.Id == Id).ExecuteDeleteAsync();
            return result is 0 ? null : true;
        }

        public async Task<Zone?> GetZoneAsync(int Id)
        {
            var key = $"zone_{Id}";
            return await _cachingService.GetOrSetAsync(
                key,
                async token => await _context.Zones.FirstOrDefaultAsync(x => x.Id == Id, token),
                TimeSpan.FromMinutes(10),
                ["zone"]
            );
        }

        public async Task<IQueryable<Zone>> GetZonesAsync()
        {
            var result = await _cachingService.GetOrSetAsync(
                "zones",
                async token => await _context.Zones.ToListAsync(token),
                TimeSpan.FromMinutes(10),
                ["zones"]
            );
            return (result ?? []).AsQueryable();
        }

        public async Task<bool?> UpdateAsync(int Id, UpdateZoneRequest request)
        {
            var zone = await _context.Zones.FindAsync(Id);
            if (zone == null)
                return null;

            zone.Name = request.Name;
            zone.Code = request.Code;
            zone.IsActive = request.IsActive;
            zone.Notes = request.Notes;
            zone.DesignatedMerchandiseId = request.DesignatedMerchandiseId;
            zone.Type = Enum.TryParse<ZoneType>(request.Type, true, out var type)
                ? type
                : ZoneType.Quay;

            if (request.Boundary != null && request.Boundary.Any())
                zone.Boundary = GeometryHelper.ToPolygon(request.Boundary);

            await _context.SaveChangesAsync();
            return true;
        }

        // Deliberately uncached, unlike every other read method on this repository —
        // this only ever runs on a Map page load or an explicit refetch after a
        // mutation, and the 30-minute FusionCache/Redis cache this used to go
        // through repeatedly went stale whenever a Zone was inserted/updated
        // outside the normal command pipeline (seeders, direct SQL fixes), making
        // zones silently disappear from the map despite being in Postgres.
        public async Task<GeoJsonFeatureCollection> GetActiveZonesGeoJsonAsync()
        {
            var zones = await _context
                .Zones.AsNoTracking()
                .Where(z => z.IsActive && z.Boundary != null)
                .ToListAsync();

            return new GeoJsonFeatureCollection
            {
                Features = zones
                    .Select(z => new GeoJsonFeature
                    {
                        Geometry = GeometryHelper.ToGeoJsonPolygon(z.Boundary!),
                        Properties = new ZoneGeoJsonProperties
                        {
                            Id = z.Id,
                            Name = z.Name,
                            Code = z.Code,
                            Type = z.Type.ToString(),
                        },
                    })
                    .ToList(),
            };
        }
    }
}
