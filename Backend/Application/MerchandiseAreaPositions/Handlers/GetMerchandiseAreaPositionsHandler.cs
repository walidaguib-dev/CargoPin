using Application.MerchandiseAreaPositions.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class GetMerchandiseAreaPositionsHandler(IMerchandiseAreaPositions service)
        : IRequestHandler<GetMerchandiseAreaPositionsQuery, IQueryable<MerchandiseAreaPosition>>
    {
        public async Task<IQueryable<MerchandiseAreaPosition>> Handle(
            GetMerchandiseAreaPositionsQuery request,
            CancellationToken cancellationToken
        ) => await service.GetPositionsAsync();
    }
}
