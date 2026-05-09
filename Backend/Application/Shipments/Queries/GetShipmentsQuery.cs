using Domain.Entities;
using MediatR;

namespace Application.Shipments.Queries
{
    public record GetShipmentsQuery : IRequest<IQueryable<Shipment>> { }
}
