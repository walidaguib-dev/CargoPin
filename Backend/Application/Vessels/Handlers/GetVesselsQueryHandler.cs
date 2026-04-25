using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Vessels.Handlers
{
    public class GetVesselsQueryHandler(IVessels vesselsService)
        : IRequestHandler<GetVesselsQuery, IQueryable<Vessel>>
    {
        private readonly IVessels _vesselsService = vesselsService;

        public async Task<IQueryable<Vessel>> Handle(
            GetVesselsQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _vesselsService.GetVesselsAsync();
        }
    }
}
