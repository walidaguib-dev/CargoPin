using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Dtos;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Vessels.Commands
{
    public record CreateVesselCommand(CreateVesselDto Dto) : IRequest<Vessel>, IInvalidateCache
    {
        public List<string> CacheKeys => [];

        public List<string> CacheTags => ["vessel", "vessels"];
    }
}
