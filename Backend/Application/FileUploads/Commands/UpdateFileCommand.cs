using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.FileUploads.Commands
{
    public record UpdateFileCommand(string UserId, IFormFile file, string OldPublicId)
        : IRequest<bool?>;
}
