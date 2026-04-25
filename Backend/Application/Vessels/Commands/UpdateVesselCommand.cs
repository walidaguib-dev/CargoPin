using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Dtos;
using Domain.Interfaces;
using MediatR;

namespace Application.Vessels.Commands
{
    public record UpdateVesselCommand(string Name, UpdateVesselDto Dto)
        : IRequest<bool?>,
            IInvalidateCache
    {
        public List<string> CacheKeys => [$"vessel_{Name}"];

        public List<string> CacheTags => ["vessel", "vessels"];
    }
}
