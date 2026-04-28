using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Dtos;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Clients.Commands
{
    public record CreateClientCommand(CreateClientDto Dto) : IRequest<Client>, IInvalidateCache
    {
        public List<string> CacheKeys => [];

        public List<string> CacheTags => ["client", "clients"];
    }
}
