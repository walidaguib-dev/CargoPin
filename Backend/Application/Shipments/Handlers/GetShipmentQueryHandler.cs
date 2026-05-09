using Application.Shipments.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Shipments.Handlers
{
    public class GetShipmentQueryHandler(IShipments shipmentsService)
        : IRequestHandler<GetShipmentQuery, Shipment?>
    {
        private readonly IShipments _shipmentsService = shipmentsService;

        public Task<Shipment?> Handle(
            GetShipmentQuery request,
            CancellationToken cancellationToken
        )
        {
            return _shipmentsService.GetShipmentAsync(request.Id);
        }
    }
}
