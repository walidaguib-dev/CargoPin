using Application.Areas.Commands;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Areas.Handlers
{
    public class CreateAreaHandler(IAreas areasService) : IRequestHandler<CreateAreaCommand, Area>
    {
        private readonly IAreas _areasService = areasService;

        public async Task<Area> Handle(
            CreateAreaCommand request,
            CancellationToken cancellationToken
        )
        {
            Area area = request.Dto.MapToEntity();
            return await _areasService.CreateAsync(area);
        }
    }
}
