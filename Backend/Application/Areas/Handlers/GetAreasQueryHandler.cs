using Application.Areas.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Areas.Handlers
{
    public class GetAreasQueryHandler(IAreas areasService)
        : IRequestHandler<GetAreasQuery, IQueryable<Area>>
    {
        private readonly IAreas _areasService = areasService;

        public async Task<IQueryable<Area>> Handle(GetAreasQuery request, CancellationToken cancellationToken)
        {
            return await _areasService.GetAreasAsync();
        }
    }
}
