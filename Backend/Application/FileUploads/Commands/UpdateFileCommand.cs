using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.FileUploads.Commands
{
    public record UpdateFileCommand(string UserId, IFormFile file, string OldPublicId)
        : IRequest<bool?>,
            IInvalidateCache
    {
        public List<string> CacheKeys => [];

        public List<string> CacheTags => ["user_uploads", "user_upload"];
    }
}
