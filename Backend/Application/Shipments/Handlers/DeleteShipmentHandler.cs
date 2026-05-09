using Application.Shipments.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Shipments.Handlers
{
    public class DeleteShipmentHandler(IShipments shipmentsService)
        : IRequestHandler<DeleteShipmentCommand, bool?>
    {
        private readonly IShipments _shipmentsService = shipmentsService;

        public async Task<bool?> Handle(
            DeleteShipmentCommand request,
            CancellationToken cancellationToken
        )
        {
            return await _shipmentsService.DeleteAsync(request.Id);
        }
    }
}
