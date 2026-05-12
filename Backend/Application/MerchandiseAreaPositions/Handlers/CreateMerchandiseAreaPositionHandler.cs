using Application.MerchandiseAreaPositions.Commands;
using Application.MerchandiseAreaPositions;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class CreateMerchandiseAreaPositionHandler(IMerchandiseAreaPositions service)
        : IRequestHandler<CreateMerchandiseAreaPositionCommand, MerchandiseAreaPosition>
    {
        public async Task<MerchandiseAreaPosition> Handle(
            CreateMerchandiseAreaPositionCommand request,
            CancellationToken cancellationToken
        )
        {
            var position = request.Dto.MapToEntity(request.TallymanId);
            return await service.CreateAsync(position);
        }
    }
}
