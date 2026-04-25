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
    public class GetVesselQueryHandler(IVessels vesselsService)
        : IRequestHandler<GetVesselQuery, Vessel?>
    {
        private readonly IVessels _vesselsService = vesselsService;

        public async Task<Vessel?> Handle(
            GetVesselQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _vesselsService.GetVesselAsync(request.Name);
        }
    }
}
