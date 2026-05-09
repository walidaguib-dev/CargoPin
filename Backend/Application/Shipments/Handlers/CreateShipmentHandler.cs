using Application.Shipments.Commands;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Shipments.Handlers
{
    public class CreateShipmentHandler(IShipments shipmentsService)
        : IRequestHandler<CreateShipmentCommand, Shipment>
    {
        private readonly IShipments _shipmentsService = shipmentsService;

        public async Task<Shipment> Handle(
            CreateShipmentCommand request,
            CancellationToken cancellationToken
        )
        {
            Shipment shipment = request.Dto.MapToEntity();
            return await _shipmentsService.CreateAsync(shipment);
        }
    }
}
