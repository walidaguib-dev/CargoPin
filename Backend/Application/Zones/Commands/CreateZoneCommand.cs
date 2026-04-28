using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Dtos;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Zones.Commands
{
    public record CreateZoneCommand(CreateZoneDto Dto) : IRequest<Zone>, IInvalidateCache
    {
        public List<string> CacheKeys => [];

        public List<string> CacheTags => ["zone", "zones"];
    }
}
