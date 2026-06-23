using Application.MerchandiseAreaPositions.Commands;
using Domain.Interfaces;
using Domain.Requests.MerchandiseAreaPositions;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class UpdateMerchandiseAreaPositionHandler(
        IMerchandiseAreaPositions service,
        IPositionsNotifier notifier
    ) : IRequestHandler<UpdateMerchandiseAreaPositionCommand, bool?>
    {
        public async Task<bool?> Handle(
            UpdateMerchandiseAreaPositionCommand request,
            CancellationToken cancellationToken
        )
        {
            var isReleased = string.Equals(
                request.Dto.State,
                "released",
                StringComparison.OrdinalIgnoreCase
            );

            // Capture the pre-update state so we only broadcast on the actual
            // active->released transition, not on every repeated "release" call.
            var wasActive = isReleased && (await service.GetPositionAsync(request.Id))?.IsActive == true;

            var updateRequest = request.Dto.MapToRequest();
            var result = await service.UpdateAsync(request.Id, updateRequest);

            if (result == true && isReleased && wasActive)
            {
                await notifier.NotifyPositionReleasedAsync(
                    new PositionReleasedNotification { PositionId = request.Id }
                );
            }

            return result;
        }
    }
}
