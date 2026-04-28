using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Commands;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Zones.Handlers
{
    public class CreateZoneHandler(IZones zonesService) : IRequestHandler<CreateZoneCommand, Zone>
    {
        private readonly IZones _zonesService = zonesService;

        public async Task<Zone> Handle(
            CreateZoneCommand request,
            CancellationToken cancellationToken
        )
        {
            Zone zone = request.Dto.MapToEntity();
            return await _zonesService.CreateAsync(zone);
        }
    }
}
