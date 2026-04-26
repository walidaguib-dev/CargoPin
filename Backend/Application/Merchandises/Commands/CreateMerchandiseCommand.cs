using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Dtos;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Merchandises.Commands
{
    public record CreateMerchandiseCommand(CreateMerchandiseDto Dto)
        : IRequest<Merchandise>,
            IInvalidateCache
    {
        public List<string> CacheKeys => [];

        public List<string> CacheTags => ["merchandise", "merchandises"];
    }
}
