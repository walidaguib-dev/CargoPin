using Domain.Interfaces;
using MediatR;

namespace Application.Areas.Commands
{
    public record DeleteAreaCommand(int Id) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"area_{Id}"];
        public List<string> CacheTags => ["area", "areas"];
    }
}
