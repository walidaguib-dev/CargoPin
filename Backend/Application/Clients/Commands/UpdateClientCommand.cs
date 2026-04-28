using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Dtos;
using Domain.Interfaces;
using MediatR;

namespace Application.Clients.Commands
{
    public record UpdateClientCommand(int Id, UpdateClientDto Dto)
        : IRequest<bool?>,
            IInvalidateCache
    {
        public List<string> CacheKeys => [$"client_{Id}"];

        public List<string> CacheTags => ["client", "clients"];
    }
}
