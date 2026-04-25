using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Queries;
using Domain.Entities;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class VesselsQuery
    {
        [UsePaging]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<IQueryable<Vessel>> GetVessels([Service] ISender sender)
        {
            var query = new GetVesselsQuery();
            var result = await sender.Send(query);
            return result;
        }

        public async Task<Vessel?> GetVessel([Service] ISender sender, string name)
        {
            var query = new GetVesselQuery(name);
            var result = await sender.Send(query);
            return result;
        }
    }
}
