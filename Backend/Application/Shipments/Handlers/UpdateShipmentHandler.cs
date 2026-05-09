using Application.Shipments.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Shipments.Handlers
{
    public class UpdateShipmentHandler(IShipments shipmentsService)
        : IRequestHandler<UpdateShipmentCommand, bool?>
    {
        private readonly IShipments _shipmentsService = shipmentsService;

        public Task<bool?> Handle(
            UpdateShipmentCommand request,
            CancellationToken cancellationToken
        )
        {
            var shipmentRequest = request.Dto.MapToRequest();
            return _shipmentsService.UpdateAsync(request.Id, shipmentRequest);
        }
    }
}
