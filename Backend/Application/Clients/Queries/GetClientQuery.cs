using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using MediatR;

namespace Application.Clients.Queries
{
    public record GetClientQuery(int Id) : IRequest<Client?> { }
}
