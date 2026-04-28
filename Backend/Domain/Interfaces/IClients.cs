using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Requests.Clients;

namespace Domain.Interfaces
{
    public interface IClients
    {
        public Task<IQueryable<Client>> GetClientsAsync();
        public Task<Client?> GetClientAsync(int Id);
        public Task<Client> CreateAsync(Client client);
        public Task<bool?> DeleteAsync(int Id);
        public Task<bool?> UpdateAsync(int Id, UpdateClientRequest request);
    }
}
