using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Requests.Vessels;

namespace Domain.Interfaces
{
    public interface IVessels
    {
        public Task<IQueryable<Vessel>> GetVesselsAsync();
        public Task<Vessel?> GetVesselAsync(string name);
        public Task<Vessel> CreateAsync(Vessel vessel);
        public Task<bool?> DeleteAsync(string name);
        public Task<bool?> UpdateAsync(string name, UpdateVesselRequest request);
    }
}
