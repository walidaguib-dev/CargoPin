using Application.Shipments.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Shipments.Handlers
{
    public class GetShipmentsQueryHandler(IShipments shipmentsService)
        : IRequestHandler<GetShipmentsQuery, IQueryable<Shipment>>
    {
        private readonly IShipments _shipmentsService = shipmentsService;

        public async Task<IQueryable<Shipment>> Handle(
            GetShipmentsQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _shipmentsService.GetShipmentsAsync();
        }
    }
}
