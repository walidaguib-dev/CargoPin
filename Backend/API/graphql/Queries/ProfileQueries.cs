using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Queries;
using Domain.Entities;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class ProfileQueries
    {
        public async Task<Profile?> GetProfileQuery(string userId, [Service] IMediator mediator)
        {
            var query = new GetProfileQuery(userId);
            var result = await mediator.Send(query);
            return result;
        }
    }
}
