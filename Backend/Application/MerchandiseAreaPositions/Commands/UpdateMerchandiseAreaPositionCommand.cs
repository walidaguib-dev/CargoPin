using Application.MerchandiseAreaPositions.Dtos;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Commands
{
    public record UpdateMerchandiseAreaPositionCommand(int Id, UpdateMerchandiseAreaPositionDto Dto)
        : IRequest<bool?>,
            IInvalidateCache
    {
        public List<string> CacheKeys => [$"position_{Id}"];
        public List<string> CacheTags => ["position", "positions", "positions:geojson"];
    }
}
