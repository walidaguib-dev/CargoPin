using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Requests.Zones;

namespace Application.Zones
{
    public static class ZonesMapper
    {
        public static Zone MapToEntity(this CreateZoneDto dto)
        {
            var zoneType = Enum.TryParse<ZoneType>(dto.Type, true, out var type)
                ? type
                : ZoneType.OpenYard;
            return new Zone
            {
                Name = dto.Name,
                Code = dto.Code,
                Notes = dto.Notes,
                IsActive = dto.IsActive,
                Type = zoneType,
            };
        }

        public static UpdateZoneRequest MapToRequest(this UpdateZoneDto dto)
        {
            return new UpdateZoneRequest
            {
                Name = dto.Name,
                Code = dto.Code,
                Notes = dto.Notes,
                IsActive = dto.IsActive,
                Type = dto.Type,
            };
        }
    }
}
