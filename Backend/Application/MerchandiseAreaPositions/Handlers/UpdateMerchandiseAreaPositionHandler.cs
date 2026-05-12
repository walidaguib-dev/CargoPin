using Application.MerchandiseAreaPositions.Commands;
using Application.MerchandiseAreaPositions;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class UpdateMerchandiseAreaPositionHandler(IMerchandiseAreaPositions service)
        : IRequestHandler<UpdateMerchandiseAreaPositionCommand, bool?>
    {
        public async Task<bool?> Handle(
            UpdateMerchandiseAreaPositionCommand request,
            CancellationToken cancellationToken
        )
        {
            var updateRequest = request.Dto.MapToRequest();
            return await service.UpdateAsync(request.Id, updateRequest);
        }
    }
}
