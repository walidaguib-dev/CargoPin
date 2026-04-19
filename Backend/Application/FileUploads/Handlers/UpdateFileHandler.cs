using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.FileUploads.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.FileUploads.Handlers
{
    public class UpdateFileHandler(IFileUploads fileUploadsService)
        : IRequestHandler<UpdateFileCommand, bool?>
    {
        private readonly IFileUploads _fileUploadsService = fileUploadsService;

        public async Task<bool?> Handle(
            UpdateFileCommand request,
            CancellationToken cancellationToken
        )
        {
            var userId = request.UserId;
            var file = request.file;
            var oldPublicId = request.OldPublicId;
            var result = await _fileUploadsService.UpdateAsync(userId, file, oldPublicId);
            return result;
        }
    }
}
