using Application.MerchandiseAreaPositions.Dtos;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Commands
{
    public record CreateMerchandiseAreaPositionCommand(
        CreateMerchandiseAreaPositionDto Dto,
        string TallymanId
    ) : IRequest<CreatePositionResultDto>, IInvalidateCache
    {
        public List<string> CacheKeys => [];
        public List<string> CacheTags => ["position", "positions", "positions:geojson"];
    }
}
