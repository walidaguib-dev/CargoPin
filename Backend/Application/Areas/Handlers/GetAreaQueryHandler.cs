using Application.Areas.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Areas.Handlers
{
    public class GetAreaQueryHandler(IAreas areasService) : IRequestHandler<GetAreaQuery, Area?>
    {
        private readonly IAreas _areasService = areasService;

        public Task<Area?> Handle(GetAreaQuery request, CancellationToken cancellationToken)
        {
            return _areasService.GetAreaAsync(request.Id);
        }
    }
}
