using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Requests.Vessels;

namespace Application.Vessels
{
    public static class VesselsMapper
    {
        public static Vessel MapToEntity(this CreateVesselDto dto)
        {
            var status = Enum.TryParse<VesselStatus>(dto.Status, true, out var vesselStatus)
                ? vesselStatus
                : VesselStatus.Berthed;
            return new Vessel
            {
                IMONumber = dto.IMONumber,
                Name = dto.Name,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Status = status,
            };
        }

        public static UpdateVesselRequest MapToRequest(this UpdateVesselDto dto)
        {
            return new UpdateVesselRequest
            {
                Name = dto.Name,
                Status = dto.Status,
                IMONumber = dto.IMONumber,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
            };
        }
    }
}
