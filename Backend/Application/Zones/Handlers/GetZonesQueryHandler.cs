using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Zones.Handlers
{
    public class GetZonesQueryHandler(IZones zonesService)
        : IRequestHandler<GetZonesQuery, IQueryable<Zone>>
    {
        private readonly IZones _zonesService = zonesService;

        public async Task<IQueryable<Zone>> Handle(
            GetZonesQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _zonesService.GetZonesAsync();
        }
    }
}
