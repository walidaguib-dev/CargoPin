using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Requests.Areas;

namespace Domain.Interfaces
{
    public interface IAreas
    {
        public Task<IQueryable<Area>> GetAreasAsync();
        public Task<Area?> GetAreaAsync(int Id);
        public Task<Area> CreateAsync(Area area);
        public Task<bool?> DeleteAsync(int Id);
        public Task<bool?> UpdateAsync(int Id, UpdateAreaRequest request);
    }
}
