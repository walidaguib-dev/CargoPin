using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace Application.FileUploads.Queries
{
    public record GetUserUploadsQuery(string UserId)
        : IRequest<IQueryable<Domain.Entities.FileUploads>> { }
}
