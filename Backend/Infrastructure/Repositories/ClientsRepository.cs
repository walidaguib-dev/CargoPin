using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Domain.Requests.Clients;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ClientsRepository(ApplicationDbContext context, ICaching cachingService) : IClients
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<Client> CreateAsync(Client client)
        {
            var result = await _context.Clients.AddAsync(client);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool?> DeleteAsync(int Id)
        {
            var result = await _context.Clients.Where(x => x.Id == Id).ExecuteDeleteAsync();
            return result is 0 ? null : true;
        }

        public async Task<Client?> GetClientAsync(int Id)
        {
            var key = $"client_{Id}";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context
                        .Clients.Include(x => x.Vessel)
                        .Include(x => x.Merchandise)
                        .FirstOrDefaultAsync(x => x.Id == Id);
                },
                TimeSpan.FromMinutes(10),
                ["client"]
            );
            return result;
        }

        public async Task<IQueryable<Client>> GetClientsAsync()
        {
            var key = $"clients";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context
                        .Clients.Include(x => x.Vessel)
                        .Include(x => x.Merchandise)
                        .ToListAsync();
                },
                TimeSpan.FromMinutes(10),
                ["clients"]
            );
            return (result ?? []).AsQueryable();
        }

        public async Task<bool?> UpdateAsync(int Id, UpdateClientRequest request)
        {
            var clientStatus = Enum.TryParse<ClientStatus>(request.Status, true, out var status)
                ? status
                : ClientStatus.Awaiting;
            var result = await _context
                .Clients.Where(x => x.Id == Id)
                .ExecuteUpdateAsync(p =>
                    p.SetProperty(x => x.Name, request.Name)
                        .SetProperty(x => x.BLNumbers, request.BLNumbers)
                        .SetProperty(x => x.ArrivalDate, request.ArrivalDate)
                        .SetProperty(x => x.Status, clientStatus)
                        .SetProperty(x => x.Note, request.Note)
                        .SetProperty(x => x.VesselId, request.VesselId)
                        .SetProperty(x => x.MerchandiseId, request.MerchandiseId)
                );
            return result is 0 ? null : true;
        }
    }
}
