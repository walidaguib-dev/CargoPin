using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Queries;
using Domain.Entities;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class ZonesQuery
    {
        [UsePaging] // 1️⃣ Paging FIRST
        [UseProjection] // 2️⃣ Projection SECOND
        [UseFiltering] // 3️⃣ Filtering THIRD
        [UseSorting] // 4️⃣ Sorting LAST
        public async Task<IQueryable<Zone>> GetZones([Service] ISender sender)
        {
            var query = new GetZonesQuery();
            var result = await sender.Send(query);
            return result;
        }

        public async Task<Zone?> GetZone([Service] ISender sender, int Id)
        {
            var query = new GetZoneQuery(Id);
            var result = await sender.Send(query);
            return result;
        }
    }
}
