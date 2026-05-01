using Domain.Entities;
using MediatR;

namespace Application.Areas.Queries
{
    public record GetAreasQuery : IRequest<IQueryable<Area>> { }
}
