using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Requests.Merchandises;

namespace Application.Merchandises
{
    public static class MerchandisesMapper
    {
        public static Merchandise MapToEntity(this CreateMerchandiseDto dto)
        {
            var cargoType = Enum.TryParse<CargoType>(dto.CargoType, true, out var type)
                ? type
                : CargoType.GeneralCargo;
            return new Merchandise
            {
                Note = dto.Note,
                Description = dto.Description,
                NumberOfHeat = dto.NumberOfHeat,
                Weight = dto.Weight,
                CargoType = cargoType,
            };
        }

        public static UpdateMerchandiseRequest MapToRequest(this UpdateMerchandiseDto dto)
        {
            return new UpdateMerchandiseRequest
            {
                Note = dto.Note,
                Description = dto.Description,
                NumberOfHeat = dto.NumberOfHeat,
                Weight = dto.Weight,
                CargoType = dto.CargoType,
            };
        }
    }
}
