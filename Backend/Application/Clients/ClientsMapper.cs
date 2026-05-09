using Application.Clients.Dtos;
using Domain.Entities;
using Domain.Requests.Clients;

namespace Application.Clients
{
    public static class ClientsMapper
    {
        public static Client MapToEntity(this CreateClientDto dto) =>
            new()
            {
                Name = dto.Name,
                ContactPerson = dto.ContactPerson,
                Phone = dto.Phone,
                Email = dto.Email,
                TaxId = dto.TaxId,
            };

        public static UpdateClientRequest MapToRequest(this UpdateClientDto dto) =>
            new()
            {
                Name = dto.Name,
                ContactPerson = dto.ContactPerson,
                Phone = dto.Phone,
                Email = dto.Email,
                TaxId = dto.TaxId,
            };
    }
}
