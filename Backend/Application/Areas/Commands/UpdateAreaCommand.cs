using Application.Areas.Dtos;
using Domain.Interfaces;
using MediatR;

namespace Application.Areas.Commands
{
    public record UpdateAreaCommand(int Id, UpdateAreaDto Dto) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"area_{Id}"];
        public List<string> CacheTags => ["area", "areas"];
    }
}
