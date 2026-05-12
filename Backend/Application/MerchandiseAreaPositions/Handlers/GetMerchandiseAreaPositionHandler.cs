using Application.MerchandiseAreaPositions.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class GetMerchandiseAreaPositionHandler(IMerchandiseAreaPositions service)
        : IRequestHandler<GetMerchandiseAreaPositionQuery, MerchandiseAreaPosition?>
    {
        public async Task<MerchandiseAreaPosition?> Handle(
            GetMerchandiseAreaPositionQuery request,
            CancellationToken cancellationToken
        ) => await service.GetPositionAsync(request.Id);
    }
}
