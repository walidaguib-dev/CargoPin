using Domain.Entities;
using Domain.GeoJson;
using Domain.Requests.MerchandiseAreaPositions;
using NetTopologySuite.Geometries;

namespace Domain.Interfaces
{
    public interface IMerchandiseAreaPositions
    {
        Task<IQueryable<MerchandiseAreaPosition>> GetPositionsAsync();
        Task<MerchandiseAreaPosition?> GetPositionAsync(int id);
        Task<MerchandiseAreaPosition> CreateAsync(MerchandiseAreaPosition position);
        Task<bool?> DeleteAsync(int id);
        Task<bool?> UpdateAsync(int id, UpdateMerchandiseAreaPositionRequest request);
        Task<Zone?> FindContainingZoneAsync(Point point);
        Task<Area?> FindContainingAreaAsync(Point point);
        Task<GeoJsonFeatureCollection> GetActivePositionsGeoJsonAsync();
        Task<List<MerchandiseAreaPosition>> GetNearbyPositionsAsync(Point point, double radiusInDegrees);
    }
}
