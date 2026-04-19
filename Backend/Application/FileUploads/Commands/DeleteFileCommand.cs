using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;
using MediatR;

namespace Application.FileUploads.Commands
{
    public record DeleteFileCommand(string PublicId) : IRequest<bool?>, IInvalidateCache
    {
        public List<string> CacheKeys => [""];

        public List<string> CacheTags => ["user_uploads", "user_upload"];
    }
}
