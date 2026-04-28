using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Requests.Zones;

namespace Domain.Interfaces
{
    public interface IZones
    {
        public Task<IQueryable<Zone>> GetZonesAsync();
        public Task<Zone?> GetZoneAsync(int Id);
        public Task<Zone> CreateAsync(Zone zone);
        public Task<bool?> DeleteAsync(int Id);
        public Task<bool?> UpdateAsync(int Id, UpdateZoneRequest request);
    }
}
