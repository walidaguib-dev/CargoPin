using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Clients.Handlers
{
    public class GetClientHandler(IClients clientsService)
        : IRequestHandler<GetClientQuery, Client?>
    {
        private readonly IClients _clientsService = clientsService;

        public async Task<Client?> Handle(
            GetClientQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _clientsService.GetClientAsync(request.Id);
        }
    }
}
