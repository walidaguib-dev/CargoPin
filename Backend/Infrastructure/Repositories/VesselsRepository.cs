using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Domain.Requests.Vessels;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class VesselsRepository(ApplicationDbContext context, ICaching cachingService) : IVessels
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<Vessel> CreateAsync(Vessel vessel)
        {
            var result = await _context.Vessels.AddAsync(vessel);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool?> DeleteAsync(string name)
        {
            var affectedRow = await _context
                .Vessels.Where(x => x.Name == name)
                .ExecuteDeleteAsync();
            return affectedRow == 0 ? null : true;
        }

        public async Task<Vessel?> GetVesselAsync(string name)
        {
            var key = $"vessel_{name}";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context.Vessels.FirstOrDefaultAsync(x => x.Name == name);
                },
                TimeSpan.FromMinutes(10),
                ["vessel"]
            );
            return result;
        }

        public async Task<IQueryable<Vessel>> GetVesselsAsync()
        {
            var key = "vessels:all";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context.Vessels.ToListAsync();
                },
                TimeSpan.FromMinutes(10),
                ["vessels"]
            );

            return (result ?? []).AsQueryable();
        }

        public async Task<bool?> UpdateAsync(string name, UpdateVesselRequest request)
        {
            var status = Enum.TryParse<VesselStatus>(request.Status, true, out var vesselStatus)
                ? vesselStatus
                : VesselStatus.Berthed;
            var affectedRow = await _context
                .Vessels.Where(x => x.Name == name)
                .ExecuteUpdateAsync(p =>
                    p.SetProperty(x => x.Name, request.Name)
                        .SetProperty(x => x.IMONumber, request.IMONumber)
                        .SetProperty(x => x.Status, status)
                );
            return affectedRow == 0 ? null : true;
        }
    }
}
