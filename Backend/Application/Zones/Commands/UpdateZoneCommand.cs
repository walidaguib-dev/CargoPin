using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Dtos;
using Domain.Interfaces;
using MediatR;

namespace Application.Zones.Commands
{
    public record UpdateZoneCommand(int Id, UpdateZoneDto Dto) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"zone_{Id}"];

        public List<string> CacheTags => ["zone", "zones"];
    }
}
