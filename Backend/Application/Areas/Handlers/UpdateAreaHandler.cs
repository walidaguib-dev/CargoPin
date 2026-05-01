using Application.Areas.Commands;
using Domain.Interfaces;
using Domain.Requests.Areas;
using MediatR;

namespace Application.Areas.Handlers
{
    public class UpdateAreaHandler(IAreas areasService) : IRequestHandler<UpdateAreaCommand, bool?>
    {
        private readonly IAreas _areasService = areasService;

        public Task<bool?> Handle(UpdateAreaCommand request, CancellationToken cancellationToken)
        {
            UpdateAreaRequest areaRequest = request.Dto.MapToRequest();
            return _areasService.UpdateAsync(request.Id, areaRequest);
        }
    }
}
