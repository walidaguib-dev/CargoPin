using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Clients.Handlers
{
    public class DeleteClientHandler(IClients clientsService)
        : IRequestHandler<DeleteClientCommand, bool?>
    {
        private readonly IClients _clientsService = clientsService;

        public async Task<bool?> Handle(
            DeleteClientCommand request,
            CancellationToken cancellationToken
        )
        {
            return await _clientsService.DeleteAsync(request.Id);
        }
    }
}
