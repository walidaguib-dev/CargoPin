using Application.FileUploads.Queries;
using Infrastructure.Data;
using MediatR;
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
        public async Task<IQueryable<Domain.Entities.FileUploads>> GetAllFilesByUserQuery(
            string userId,
            [Service] IMediator mediator
        )
        {
            var query = new GetUserUploadsQuery(userId);
            var result = await mediator.Send(query);
            return result;
        }

        public async Task<Domain.Entities.FileUploads?> GetUploadByUser(
            string userId,
            [Service] IMediator mediator
        )
        {
            var query = new GetUserUploadQuery(userId);
            var result = await mediator.Send(query);
            return result;
        }
    }
}
