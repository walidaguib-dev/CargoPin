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
    }
}
