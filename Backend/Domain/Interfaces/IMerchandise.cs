using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Requests.Merchandises;

namespace Domain.Interfaces
{
    public interface IMerchandise
    {
        public Task<IQueryable<Merchandise>> GetAllAsync();
        public Task<Merchandise?> GetMerchandiseAsync(int Id);
        public Task<Merchandise> CreateAsync(Merchandise merchandise);
        public Task<bool?> DeleteAsync(int Id);
        public Task<bool?> UpdateAsync(int Id, UpdateMerchandiseRequest request);
    }
}
