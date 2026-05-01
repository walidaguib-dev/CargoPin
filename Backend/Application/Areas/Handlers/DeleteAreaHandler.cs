using Application.Areas.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Areas.Handlers
{
    public class DeleteAreaHandler(IAreas areasService) : IRequestHandler<DeleteAreaCommand, bool?>
    {
        private readonly IAreas _areasService = areasService;

        public async Task<bool?> Handle(
            DeleteAreaCommand request,
            CancellationToken cancellationToken
        )
        {
            return await _areasService.DeleteAsync(request.Id);
        }
    }
}
