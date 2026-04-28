using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Zones.Handlers
{
    public class DeleteZoneHandler(IZones zonesService) : IRequestHandler<DeleteZoneCommand, bool?>
    {
        private readonly IZones _zonesService = zonesService;

        public async Task<bool?> Handle(
            DeleteZoneCommand request,
            CancellationToken cancellationToken
        )
        {
            return await _zonesService.DeleteAsync(request.Id);
        }
    }
}
