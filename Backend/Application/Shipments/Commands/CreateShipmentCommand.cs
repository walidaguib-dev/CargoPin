using Application.Shipments.Dtos;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Shipments.Commands
{
    public record CreateShipmentCommand(CreateShipmentDto Dto) : IRequest<Shipment>, IInvalidateCache
    {
        public List<string> CacheKeys => [];
        public List<string> CacheTags => ["shipment", "shipments"];
    }
}
