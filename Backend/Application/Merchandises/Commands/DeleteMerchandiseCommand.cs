using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;
using MediatR;

namespace Application.Merchandises.Commands
{
    public record DeleteMerchandiseCommand(int Id) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [$"merchandise_{Id}"];

        public List<string> CacheTags => ["merchandise", "merchandises"];
    }
}
