using Application.MerchandiseAreaPositions.Dtos;
using Domain.Entities;
using Domain.Requests.MerchandiseAreaPositions;
using NetTopologySuite.Geometries;

namespace Application.MerchandiseAreaPositions
{
    public static class MerchandiseAreaPositionsMapper
    {
        public static MerchandiseAreaPosition MapToEntity(
            this CreateMerchandiseAreaPositionDto dto,
            string tallymanId,
            Point point,
            int? areaId,
            int? zoneId,
            bool isEmergencyPlacement
        ) =>
            new()
            {
                ShipmentId = dto.ShipmentId,
                Location = point,
                AreaId = areaId,
                ZoneId = zoneId,
                IsEmergencyPlacement = isEmergencyPlacement,
                Notes = dto.Notes,
                TallymanId = tallymanId,
                PlacedAt = DateTime.UtcNow,
            };

        public static UpdateMerchandiseAreaPositionRequest MapToRequest(
            this UpdateMerchandiseAreaPositionDto dto
        ) => new() { Notes = dto.Notes, State = dto.State };

        public static NearbyPositionDto MapToNearbyDto(this MerchandiseAreaPosition position) =>
            new()
            {
                Id = position.Id,
                ClientName = position.Shipment.Client.Name,
                MerchandiseDescription = position.Shipment.Merchandise.Description,
                VesselName = position.Shipment.Vessel.Name,
                Latitude = position.Location.Y,
                Longitude = position.Location.X,
                PlacedAt = position.PlacedAt,
                Notes = position.Notes,
                IsEmergencyPlacement = position.IsEmergencyPlacement,
                AreaName = position.Area?.Name,
                ZoneName = position.Zone?.Name,
            };
    }
}
