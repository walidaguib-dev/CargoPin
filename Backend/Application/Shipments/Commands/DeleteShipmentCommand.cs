using Domain.Interfaces;
using MediatR;

namespace Application.Shipments.Commands
{
    public record DeleteShipmentCommand(int Id) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"shipment_{Id}"];
        public List<string> CacheTags => ["shipment", "shipments"];
    }
}
