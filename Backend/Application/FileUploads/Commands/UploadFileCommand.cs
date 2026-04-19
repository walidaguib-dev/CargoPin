using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.FileUploads.Commands
{
    public record UploadFileCommand(IFormFile File, string UserId)
        : IRequest<Domain.Entities.FileUploads>,
            IInvalidateCache
    {
        public List<string> CacheKeys => [];

        public List<string> CacheTags => ["user_uploads", "user_upload"];
    }
}
