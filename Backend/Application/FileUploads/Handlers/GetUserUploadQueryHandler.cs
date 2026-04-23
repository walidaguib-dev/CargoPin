using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.FileUploads.Queries;
using Domain.Interfaces;
using MediatR;

namespace Application.FileUploads.Handlers
{
    public class GetUserUploadQueryHandler(IFileUploads fileUploadsService)
        : IRequestHandler<GetUserUploadQuery, Domain.Entities.FileUploads?>
    {
        private readonly IFileUploads _fileUploadsService = fileUploadsService;

        public async Task<Domain.Entities.FileUploads?> Handle(
            GetUserUploadQuery request,
            CancellationToken cancellationToken
        )
        {
            return await _fileUploadsService.GetUploadByUserAsync(request.UserId);
        }
    }
}
