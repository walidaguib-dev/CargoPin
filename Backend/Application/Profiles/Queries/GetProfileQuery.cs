using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using MediatR;

namespace Application.Profiles.Queries
{
    public record GetProfileQuery(string userId) : IRequest<Profile?> { }
}
