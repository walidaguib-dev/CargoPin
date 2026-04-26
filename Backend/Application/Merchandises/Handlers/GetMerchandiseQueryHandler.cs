using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Merchandises.Handlers
{
    public class GetMerchandiseQueryHandler(IMerchandise merchandiseService)
        : IRequestHandler<GetMerchandiseQuery, Merchandise?>
    {
        private readonly IMerchandise _merchandiseService = merchandiseService;

        public async Task<Merchandise?> Handle(
            GetMerchandiseQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _merchandiseService.GetMerchandiseAsync(request.Id);
        }
    }
}
