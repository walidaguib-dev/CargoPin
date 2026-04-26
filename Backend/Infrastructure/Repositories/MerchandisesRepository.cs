using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Domain.Requests.Merchandises;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class MerchandisesRepository(ApplicationDbContext context, ICaching cachingService)
        : IMerchandise
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<Merchandise> CreateAsync(Merchandise merchandise)
        {
            var result = await _context.Merchandises.AddAsync(merchandise);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool?> DeleteAsync(int Id)
        {
            var result = await _context.Merchandises.Where(x => x.Id == Id).ExecuteDeleteAsync();
            return result == 0 ? null : true;
        }

        public async Task<IQueryable<Merchandise>> GetAllAsync()
        {
            var key = "merchandises:all";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context.Merchandises.ToListAsync(token);
                },
                TimeSpan.FromMinutes(10),
                ["merchandises"]
            );

            return (result ?? []).AsQueryable();
        }

        public async Task<Merchandise?> GetMerchandiseAsync(int Id)
        {
            var key = $"merchandise_{Id}";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context.Merchandises.FirstOrDefaultAsync(x => x.Id == Id, token);
                },
                TimeSpan.FromMinutes(10),
                ["merchandise"]
            );
            return result;
        }

        public async Task<bool?> UpdateAsync(int Id, UpdateMerchandiseRequest request)
        {
            var cargoType = Enum.TryParse<CargoType>(request.CargoType, true, out var type)
                ? type
                : CargoType.GeneralCargo;
            var result = await _context
                .Merchandises.Where(x => x.Id == Id)
                .ExecuteUpdateAsync(p =>
                    p.SetProperty(x => x.Description, request.Description)
                        .SetProperty(x => x.Note, request.Note)
                        .SetProperty(x => x.CargoType, cargoType)
                        .SetProperty(x => x.Weight, request.Weight)
                        .SetProperty(x => x.NumberOfHeat, request.NumberOfHeat)
                );
            return result == 0 ? null : true;
        }
    }
}
