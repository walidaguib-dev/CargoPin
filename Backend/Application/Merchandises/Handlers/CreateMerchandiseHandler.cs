using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Commands;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Merchandises.Handlers
{
    public class CreateMerchandiseHandler(IMerchandise merchandiseService)
        : IRequestHandler<CreateMerchandiseCommand, Merchandise>
    {
        private readonly IMerchandise _merchandiseService = merchandiseService;

        public async Task<Merchandise> Handle(
            CreateMerchandiseCommand request,
            CancellationToken cancellationToken
        )
        {
            var entity = request.Dto.MapToEntity();
            return await _merchandiseService.CreateAsync(entity);
        }
    }
}
