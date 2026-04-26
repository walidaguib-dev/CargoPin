using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using MediatR;

namespace Application.Merchandises.Queries
{
    public record GetMerchandisesQuery : IRequest<IQueryable<Merchandise>> { }
}
