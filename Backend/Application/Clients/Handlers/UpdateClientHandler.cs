using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Clients.Handlers
{
    public class UpdateClientHandler(IClients clientsService)
        : IRequestHandler<UpdateClientCommand, bool?>
    {
        private readonly IClients _clientsService = clientsService;

        public async Task<bool?> Handle(
            UpdateClientCommand request,
            CancellationToken cancellationToken
        )
        {
            var clientRequest = request.Dto.MapToRequest();
            return await _clientsService.UpdateAsync(request.Id, clientRequest);
        }
    }
}
