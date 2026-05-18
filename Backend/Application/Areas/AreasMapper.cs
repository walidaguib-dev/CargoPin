using Application.Areas.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Helpers;
using Domain.Requests.Areas;

namespace Application.Areas
{
    public static class AreasMapper
    {
        public static Area MapToEntity(this CreateAreaDto dto)
        {
            var status = Enum.TryParse<AreaStatus>(dto.Status, true, out var parsed)
                ? parsed
                : AreaStatus.Available;

            return new Area
            {
                Name = dto.Name,
                Code = dto.Code,
                Status = status,
                Notes = dto.Notes,
                IsActive = dto.IsActive,
                ZoneId = dto.ZoneId,
                DesignatedMerchandiseId = dto.DesignatedMerchandiseId,
                Boundary = GeometryHelper.ToPolygon(dto.Boundary),
            };
        }

        public static UpdateAreaRequest MapToRequest(this UpdateAreaDto dto) =>
            new()
            {
                Name = dto.Name,
                Code = dto.Code,
                Status = dto.Status,
                Notes = dto.Notes,
                IsActive = dto.IsActive,
                Boundary = dto.Boundary,
                DesignatedMerchandiseId = dto.DesignatedMerchandiseId,
            };
    }
}
