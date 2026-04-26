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
    public class GetMerchandisesQueryHandler(IMerchandise merchandiseService)
        : IRequestHandler<GetMerchandisesQuery, IQueryable<Merchandise>>
    {
        private readonly IMerchandise _merchandiseService = merchandiseService;

        public async Task<IQueryable<Merchandise>> Handle(
            GetMerchandisesQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _merchandiseService.GetAllAsync();
        }
    }
}
