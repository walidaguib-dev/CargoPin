using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Vessels.Handlers
{
    public class DeleteVesselHandler(IVessels vesselsService)
        : IRequestHandler<DeleteVesselCommand, bool?>
    {
        private readonly IVessels _vesselsService = vesselsService;

        public async Task<bool?> Handle(
            DeleteVesselCommand request,
            CancellationToken cancellationToken
        )
        {
            return await _vesselsService.DeleteAsync(request.Name);
        }
    }
}
