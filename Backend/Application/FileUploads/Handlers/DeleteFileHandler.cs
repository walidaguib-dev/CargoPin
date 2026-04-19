using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.FileUploads.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.FileUploads.Handlers
{
    public class DeleteFileHandler(IFileUploads fileUploadsService)
        : IRequestHandler<DeleteFileCommand, bool?>
    {
        private readonly IFileUploads _fileUploadsService = fileUploadsService;

        public async Task<bool?> Handle(
            DeleteFileCommand request,
            CancellationToken cancellationToken
        )
        {
            return await _fileUploadsService.DeleteUploadAsync(request.PublicId);
        }
    }
}
