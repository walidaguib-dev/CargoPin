using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Merchandises.Handlers
{
    public class UpdateMerchandiseHandler(IMerchandise merchandiseService)
        : IRequestHandler<UpdateMerchandiseCommand, bool?>
    {
        private readonly IMerchandise _merchandiseService = merchandiseService;

        public async Task<bool?> Handle(
            UpdateMerchandiseCommand request,
            CancellationToken cancellationToken
        )
        {
            return await _merchandiseService.UpdateAsync(request.Id, request.Dto.MapToRequest());
        }
    }
}
