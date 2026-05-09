using Application.Shipments.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Requests.Shipments;

namespace Application.Shipments
{
    public static class ShipmentsMapper
    {
        public static Shipment MapToEntity(this CreateShipmentDto dto)
        {
            var status = Enum.TryParse<ShipmentStatus>(dto.Status, true, out var parsed)
                ? parsed
                : ShipmentStatus.Awaiting;

            return new Shipment
            {
                BLNumbers = dto.BLNumbers,
                ArrivalDate = dto.ArrivalDate.ToUniversalTime(),
                Status = status,
                Note = dto.Note,
                ClientId = dto.ClientId,
                VesselId = dto.VesselId,
                MerchandiseId = dto.MerchandiseId,
            };
        }

        public static UpdateShipmentRequest MapToRequest(this UpdateShipmentDto dto) =>
            new()
            {
                BLNumbers = dto.BLNumbers,
                ArrivalDate = dto.ArrivalDate.ToUniversalTime(),
                Status = dto.Status,
                Note = dto.Note,
                ClientId = dto.ClientId,
                VesselId = dto.VesselId,
                MerchandiseId = dto.MerchandiseId,
            };
    }
}
