using Domain.Entities;
using Domain.Requests.MerchandiseAreaPositions;

namespace Domain.Interfaces
{
    public interface IMerchandiseAreaPositions
    {
        Task<IQueryable<MerchandiseAreaPosition>> GetPositionsAsync();
        Task<MerchandiseAreaPosition?> GetPositionAsync(int id);
        Task<MerchandiseAreaPosition> CreateAsync(MerchandiseAreaPosition position);
        Task<bool?> DeleteAsync(int id);
        Task<bool?> UpdateAsync(int id, UpdateMerchandiseAreaPositionRequest request);
    }
}
