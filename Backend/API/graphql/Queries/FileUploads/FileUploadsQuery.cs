using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.FileUploads.Dtos;
using Infrastructure.Data;
using MediatR;

namespace API.graphql.Queries.FileUploads
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class FileUploadsQuery
    {
        [UsePaging] // ✅ 1. Paging FIRST
        [UseProjection] // ✅ 2. Projection SECOND
        [UseFiltering] // ✅ 3. Filtering THIRD
        [UseSorting]
        public IQueryable<Domain.Entities.FileUploads> GetAllFilesByUserQuery(
            string userId,
            [Service] ApplicationDbContext dbContext
        )
        {
            var result = dbContext.FileUploads.Where(x => x.UserId == userId).AsQueryable();
            return result;
        }
    }
}
