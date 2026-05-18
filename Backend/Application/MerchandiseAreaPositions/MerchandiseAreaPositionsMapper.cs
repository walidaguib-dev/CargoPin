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
            int? zoneId,
            int? areaId,
            bool isEmergency
        ) =>
            new()
            {
                ShipmentId = dto.ShipmentId,
                Location = point,
                ZoneId = zoneId,
                AreaId = areaId,
                FileUploadsId = dto.FileUploadId,
                IsEmergencyPlacement = isEmergency,
                Notes = dto.Notes,
                TallymanId = tallymanId,
                PlacedAt = DateTime.UtcNow,
            };

        public static UpdateMerchandiseAreaPositionRequest MapToRequest(
            this UpdateMerchandiseAreaPositionDto dto
        ) =>
            new()
            {
                FileUploadsId = dto.FileUploadId,
                IsEmergencyPlacement = dto.IsEmergencyPlacement,
                Notes = dto.Notes,
            };
    }
}
