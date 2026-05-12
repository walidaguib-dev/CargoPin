using Domain.Entities;
using MediatR;

namespace Application.MerchandiseAreaPositions.Queries
{
    public record GetMerchandiseAreaPositionQuery(int Id)
        : IRequest<MerchandiseAreaPosition?>;
}
