using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace API.graphql.Queries.FileUploads
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class FileUploadsQuery
    {
        [UsePaging] // 1️⃣ Paging FIRST
        [UseProjection] // 2️⃣ Projection SECOND
        [UseFiltering] // 3️⃣ Filtering THIRD
        [UseSorting] // 4️⃣ Sorting LAST
        public IQueryable<Domain.Entities.FileUploads> GetAllFilesByUserQuery(
            string userId,
            [Service] ApplicationDbContext dbContext
        )
        {
            return dbContext
                .FileUploads.AsNoTracking()
                .Where(x => x.UserId == userId)
                .AsQueryable();
        }

        public async Task<Domain.Entities.FileUploads?> GetUploadByUser(
            string userId,
            [Service] ApplicationDbContext dbContext
        )
        {
            return await dbContext
                .FileUploads.AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId);
        }
    }
}
