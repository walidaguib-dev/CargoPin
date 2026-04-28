using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
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
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context.Zones.FirstOrDefaultAsync(x => x.Id == Id, token);
                },
                TimeSpan.FromMinutes(10),
                ["zone"]
            );
            return result;
        }

        public async Task<IQueryable<Zone>> GetZonesAsync()
        {
            var key = $"zones";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context.Zones.ToListAsync(token);
                },
                TimeSpan.FromMinutes(10),
                ["zones"]
            );
            return (result ?? []).AsQueryable();
        }

        public async Task<bool?> UpdateAsync(int Id, UpdateZoneRequest request)
        {
            var zoneType = Enum.TryParse<ZoneType>(request.Type, true, out var type)
                ? type
                : ZoneType.OpenYard;
            var result = await _context
                .Zones.Where(x => x.Id == Id)
                .ExecuteUpdateAsync(p =>
                    p.SetProperty(x => x.Name, request.Name)
                        .SetProperty(x => x.Code, request.Code)
                        .SetProperty(x => x.IsActive, request.IsActive)
                        .SetProperty(x => x.Notes, request.Notes)
                        .SetProperty(x => x.Type, zoneType)
                );
            return result is 0 ? null : true;
        }
    }
}
