using Application.MerchandiseAreaPositions.Dtos;
using Domain.Entities;
using Domain.Helpers;
using Domain.Requests.MerchandiseAreaPositions;

namespace Application.MerchandiseAreaPositions
{
    public static class MerchandiseAreaPositionsMapper
    {
        public static MerchandiseAreaPosition MapToEntity(
            this CreateMerchandiseAreaPositionDto dto,
            string tallymanId
        ) =>
            new()
            {
                ShipmentId = dto.ShipmentId,
                AreaId = dto.AreaId,
                Location = GeometryHelper.ToPoint(dto.Latitude, dto.Longitude),
                FileUploadsId = dto.FileUploadId,
                IsEmergencyPlacement = dto.IsEmergencyPlacement,
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
