using API.graphql.Types;
using Application.MerchandiseAreaPositions.Queries;
using Domain.Entities;
using HotChocolate;
using HotChocolate.Types;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(typeof(Query))]
    public class MerchandiseAreaPositionsQuery
    {
        [UsePaging]
        [UseFiltering(typeof(MerchandiseAreaPositionFilterType))]
        [UseSorting(typeof(MerchandiseAreaPositionSortType))]
        public async Task<IQueryable<MerchandiseAreaPosition>> GetPositions(
            [Service] ISender sender
        ) => await sender.Send(new GetMerchandiseAreaPositionsQuery());
    }
}
