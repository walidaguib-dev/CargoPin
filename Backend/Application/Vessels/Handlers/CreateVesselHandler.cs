using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Commands;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Vessels.Handlers
{
    public class CreateVesselHandler(IVessels vesselsService)
        : IRequestHandler<CreateVesselCommand, Vessel>
    {
        private readonly IVessels _vesselsService = vesselsService;

        public async Task<Vessel> Handle(
            CreateVesselCommand request,
            CancellationToken cancellationToken
        )
        {
            var vessel = request.Dto.MapToEntity();
            return await _vesselsService.CreateAsync(vessel);
        }
    }
}
