using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace Application.FileUploads.Commands
{
    public record DeleteFileCommand(string PublicId) : IRequest<bool?>;
}
