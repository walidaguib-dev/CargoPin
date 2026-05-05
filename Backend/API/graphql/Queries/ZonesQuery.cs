using API.graphql.Types.Zones;
using Application.Zones.Queries;
using Domain.Entities;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class ZonesQuery
    {
        [UsePaging]
        [UseFiltering(typeof(ZoneFilterType))]
        [UseSorting(typeof(ZoneSortType))]
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
