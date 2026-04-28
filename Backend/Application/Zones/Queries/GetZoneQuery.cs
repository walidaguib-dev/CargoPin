using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using MediatR;

namespace Application.Zones.Queries
{
    public record GetZoneQuery(int Id) : IRequest<Zone?> { }
}
