using Domain.Entities;
using Domain.Enums;
using Domain.Helpers;
using Domain.Interfaces;
using Domain.Requests.Areas;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class AreasRepository(ApplicationDbContext context, ICaching cachingService) : IAreas
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<Area> CreateAsync(Area area)
        {
            var result = await _context.Areas.AddAsync(area);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool?> DeleteAsync(int Id)
        {
            var result = await _context.Areas.Where(x => x.Id == Id).ExecuteDeleteAsync();
            return result is 0 ? null : true;
        }

        public async Task<Area?> GetAreaAsync(int Id)
        {
            var key = $"area_{Id}";
            return await _cachingService.GetOrSetAsync(
                key,
                async token =>
                    await _context
                        .Areas.Include(x => x.Zone)
                        .FirstOrDefaultAsync(x => x.Id == Id, token),
                TimeSpan.FromMinutes(10),
                ["area"]
            );
        }

        public async Task<IQueryable<Area>> GetAreasAsync()
        {
            var result = await _cachingService.GetOrSetAsync(
                "areas",
                async token => await _context.Areas.Include(x => x.Zone).ToListAsync(token),
                TimeSpan.FromMinutes(10),
                ["areas"]
            );
            return (result ?? []).AsQueryable();
        }

        public async Task<bool?> UpdateAsync(int Id, UpdateAreaRequest request)
        {
            var area = await _context.Areas.FindAsync(Id);
            if (area == null)
                return null;

            area.Name = request.Name;
            area.Code = request.Code;
            area.IsActive = request.IsActive;
            area.Notes = request.Notes;
            area.DesignatedMerchandiseId = request.DesignatedMerchandiseId;
            area.Status = Enum.TryParse<AreaStatus>(request.Status, true, out var status)
                ? status
                : AreaStatus.Available;

            if (request.Boundary != null && request.Boundary.Any())
                area.Boundary = GeometryHelper.ToPolygon(request.Boundary);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
