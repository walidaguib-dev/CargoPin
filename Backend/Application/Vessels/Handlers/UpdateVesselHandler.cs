using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Vessels.Handlers
{
    public class UpdateVesselHandler(IVessels vesselsService)
        : IRequestHandler<UpdateVesselCommand, bool?>
    {
        private readonly IVessels _vesselsService = vesselsService;

        public async Task<bool?> Handle(
            UpdateVesselCommand request,
            CancellationToken cancellationToken
        )
        {
            var result = request.Dto.MapToRequest();
            return await _vesselsService.UpdateAsync(request.Name, result);
        }
    }
}
