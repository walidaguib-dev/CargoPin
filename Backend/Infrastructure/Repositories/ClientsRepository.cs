using Domain.Entities;
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
            return await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context.Clients
                        .Include(x => x.Shipments)
                        .FirstOrDefaultAsync(x => x.Id == Id, token);
                },
                TimeSpan.FromMinutes(10),
                ["client"]
            );
        }

        public async Task<IQueryable<Client>> GetClientsAsync()
        {
            var key = "clients";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context.Clients
                        .Include(x => x.Shipments)
                        .ToListAsync(token);
                },
                TimeSpan.FromMinutes(10),
                ["clients"]
            );
            return (result ?? []).AsQueryable();
        }

        public async Task<bool?> UpdateAsync(int Id, UpdateClientRequest request)
        {
            var result = await _context.Clients.Where(x => x.Id == Id)
                .ExecuteUpdateAsync(p =>
                    p.SetProperty(x => x.Name, request.Name)
                     .SetProperty(x => x.ContactPerson, request.ContactPerson)
                     .SetProperty(x => x.Phone, request.Phone)
                     .SetProperty(x => x.Email, request.Email)
                     .SetProperty(x => x.TaxId, request.TaxId)
                );
            return result is 0 ? null : true;
        }
    }
}
