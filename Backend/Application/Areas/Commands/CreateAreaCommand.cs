using Application.Areas.Dtos;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Areas.Commands
{
    public record CreateAreaCommand(CreateAreaDto Dto) : IRequest<Area>, IInvalidateCache
    {
        public List<string> CacheKeys => [];
        public List<string> CacheTags => ["area", "areas"];
    }
}
