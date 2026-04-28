using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Requests.Clients;

namespace Application.Clients
{
    public static class ClientsMapper
    {
        public static Client MapToEntity(this CreateClientDto dto)
        {
            var clientStatus = Enum.TryParse<ClientStatus>(dto.Status, true, out var status)
                ? status
                : ClientStatus.Awaiting;
            return new Client
            {
                Name = dto.Name,
                BLNumbers = dto.BLNumbers,
                ArrivalDate = dto.ArrivalDate,
                Status = status,
                Note = dto.Note,
                MerchandiseId = dto.MerchandiseId,
                VesselId = dto.VesselId,
            };
        }

        public static UpdateClientRequest MapToRequest(this UpdateClientDto dto)
        {
            return new UpdateClientRequest
            {
                Name = dto.Name,
                BLNumbers = dto.BLNumbers,
                ArrivalDate = dto.ArrivalDate,
                Status = dto.Status,
                Note = dto.Note,
                MerchandiseId = dto.MerchandiseId,
                VesselId = dto.VesselId,
            };
        }
    }
}
