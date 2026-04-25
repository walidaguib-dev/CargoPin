using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;
using MediatR;

namespace Application.Vessels.Commands
{
    public record DeleteVesselCommand(string Name) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"vessel_{Name}"];

        public List<string> CacheTags => ["vessel", "vessels"];
    }
}
