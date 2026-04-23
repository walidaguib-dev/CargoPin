using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.FileUploads.Queries;
using Domain.Interfaces;
using MediatR;

namespace Application.FileUploads.Handlers
{
    public class GetUserUploadsQueryHandler(IFileUploads fileUploadsService)
        : IRequestHandler<GetUserUploadsQuery, IQueryable<Domain.Entities.FileUploads>>
    {
        private readonly IFileUploads _fileUploadsService = fileUploadsService;

        public async Task<IQueryable<Domain.Entities.FileUploads>> Handle(
            GetUserUploadsQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _fileUploadsService.GetAllFilesByUserAsync(request.UserId);
        }
    }
}
