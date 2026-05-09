using Application.Shipments.Dtos;
using Domain.Interfaces;
using MediatR;

namespace Application.Shipments.Commands
{
    public record UpdateShipmentCommand(int Id, UpdateShipmentDto Dto) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"shipment_{Id}"];
        public List<string> CacheTags => ["shipment", "shipments"];
    }
}
