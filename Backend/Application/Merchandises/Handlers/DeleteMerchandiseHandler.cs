using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Merchandises.Handlers
{
    public class DeleteMerchandiseHandler(IMerchandise merchandiseService)
        : IRequestHandler<DeleteMerchandiseCommand, bool?>
    {
        private readonly IMerchandise _merchandiseService = merchandiseService;

        public async Task<bool?> Handle(
            DeleteMerchandiseCommand request,
            CancellationToken cancellationToken
        )
        {
            return await _merchandiseService.DeleteAsync(request.Id);
        }
    }
}
