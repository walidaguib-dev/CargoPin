using Application.MerchandiseAreaPositions.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class DeleteMerchandiseAreaPositionHandler(IMerchandiseAreaPositions service)
        : IRequestHandler<DeleteMerchandiseAreaPositionCommand, bool?>
    {
        public async Task<bool?> Handle(
            DeleteMerchandiseAreaPositionCommand request,
            CancellationToken cancellationToken
        ) => await service.DeleteAsync(request.Id);
    }
}
