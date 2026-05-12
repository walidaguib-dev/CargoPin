using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Commands
{
    public record DeleteMerchandiseAreaPositionCommand(int Id) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"position_{Id}"];
        public List<string> CacheTags => ["position", "positions"];
    }
}
