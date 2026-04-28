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
    public class GetClientsHandler(IClients clientsService)
        : IRequestHandler<GetClientsQuery, IQueryable<Client>>
    {
        private readonly IClients _clientsService = clientsService;

        public async Task<IQueryable<Client>> Handle(
            GetClientsQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _clientsService.GetClientsAsync();
        }
    }
}
