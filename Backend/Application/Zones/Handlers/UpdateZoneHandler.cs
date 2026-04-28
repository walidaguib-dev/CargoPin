using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Commands;
using Domain.Interfaces;
using Domain.Requests.Zones;
using MediatR;

namespace Application.Zones.Handlers
{
    public class UpdateZoneHandler(IZones zonesService) : IRequestHandler<UpdateZoneCommand, bool?>
    {
        private readonly IZones _zonesService = zonesService;

        public Task<bool?> Handle(UpdateZoneCommand request, CancellationToken cancellationToken)
        {
            UpdateZoneRequest zoneRequest = request.Dto.MapToRequest();
            return _zonesService.UpdateAsync(request.Id, zoneRequest);
        }
    }
}
