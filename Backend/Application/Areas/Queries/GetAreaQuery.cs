using Domain.Entities;
using MediatR;

namespace Application.Areas.Queries
{
    public record GetAreaQuery(int Id) : IRequest<Area?> { }
}
