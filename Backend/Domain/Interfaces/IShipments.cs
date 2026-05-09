using Domain.Entities;
using Domain.Requests.Shipments;

namespace Domain.Interfaces
{
    public interface IShipments
    {
        Task<IQueryable<Shipment>> GetShipmentsAsync();
        Task<Shipment?> GetShipmentAsync(int Id);
        Task<Shipment> CreateAsync(Shipment shipment);
        Task<bool?> DeleteAsync(int Id);
        Task<bool?> UpdateAsync(int Id, UpdateShipmentRequest request);
    }
}
