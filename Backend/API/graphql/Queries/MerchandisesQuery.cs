using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Queries;
using Domain.Entities;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class MerchandisesQuery
    {
        [UsePaging] // 1️⃣ Paging FIRST
        [UseProjection] // 2️⃣ Projection SECOND
        [UseFiltering] // 3️⃣ Filtering THIRD
        [UseSorting] // 4️⃣ Sorting LAST
        public async Task<IQueryable<Merchandise>> GetMerchandises([Service] ISender sender)
        {
            var query = new GetMerchandisesQuery();
            var result = await sender.Send(query);
            return result;
        }

        public async Task<Merchandise?> GetMerchandise([Service] ISender sender, int Id)
        {
            var query = new GetMerchandiseQuery(Id);
            var result = await sender.Send(query);
            return result;
        }
    }
}
