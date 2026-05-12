using Domain.Entities;
using MediatR;

namespace Application.MerchandiseAreaPositions.Queries
{
    public record GetMerchandiseAreaPositionsQuery : IRequest<IQueryable<MerchandiseAreaPosition>>;
}
