using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;
using MediatR;

namespace Application.Zones.Commands
{
    public record DeleteZoneCommand(int Id) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"zone_{Id}"];

        public List<string> CacheTags => ["zone", "zones"];
    }
}
