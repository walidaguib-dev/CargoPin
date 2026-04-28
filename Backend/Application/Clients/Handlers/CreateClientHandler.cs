using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Commands;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Clients.Handlers
{
    public class CreateClientHandler(IClients clientsService)
        : IRequestHandler<CreateClientCommand, Client>
    {
        private readonly IClients _clientsService = clientsService;

        public async Task<Client> Handle(
            CreateClientCommand request,
            CancellationToken cancellationToken
        )
        {
            var entity = request.Dto.MapToEntity();
            return await _clientsService.CreateAsync(entity);
        }
    }
}
