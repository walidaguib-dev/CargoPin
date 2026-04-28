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
    public class GetZoneQueryHandler(IZones zonesService) : IRequestHandler<GetZoneQuery, Zone?>
    {
        private readonly IZones _zonesService = zonesService;

        public Task<Zone?> Handle(GetZoneQuery request, CancellationToken cancellationToken)
        {
            return _zonesService.GetZoneAsync(request.Id);
        }
    }
}
