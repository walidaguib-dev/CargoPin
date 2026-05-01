using API.graphql.Types;
using Application.Areas.Queries;
using Domain.Entities;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class AreasQuery
    {
        [UsePaging]
        [UseFiltering(typeof(AreaFilterType))]
        [UseSorting(typeof(AreaSortType))]
        public async Task<IQueryable<Area>> GetAreas([Service] ISender sender)
        {
            var query = new GetAreasQuery();
            return await sender.Send(query);
        }

        public async Task<Area?> GetArea([Service] ISender sender, int Id)
        {
            var query = new GetAreaQuery(Id);
            return await sender.Send(query);
        }
    }
}
