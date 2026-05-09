using Domain.Entities;
using MediatR;

namespace Application.Shipments.Queries
{
    public record GetShipmentQuery(int Id) : IRequest<Shipment?> { }
}
