using Domain.Entities;
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

            position.FileUploadsId = request.FileUploadsId;
            position.IsEmergencyPlacement = request.IsEmergencyPlacement;
            position.Notes = request.Notes;
            position.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Zone?> FindContainingZoneAsync(Point point) =>
            await _context.Zones.FirstOrDefaultAsync(z =>
                z.Boundary != null && z.Boundary.Contains(point)
            );

        public async Task<Area?> FindContainingAreaAsync(int zoneId, Point point) =>
            await _context.Areas.FirstOrDefaultAsync(a =>
                a.ZoneId == zoneId && a.Boundary.Contains(point)
            );
    }
}

