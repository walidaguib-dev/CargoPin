using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.FileUploads.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.FileUploads.Handlers
{
    public class UploadFileHandler(IFileUploads fileUploadsService)
        : IRequestHandler<UploadFileCommand, Domain.Entities.FileUploads>
    {
        private readonly IFileUploads _fileUploadsService = fileUploadsService;

        public async Task<Domain.Entities.FileUploads> Handle(
            UploadFileCommand request,
            CancellationToken cancellationToken
        )
        {
            var result = await _fileUploadsService.UploadsAsync(request.UserId, request.File);
            return result;
        }
    }
}
