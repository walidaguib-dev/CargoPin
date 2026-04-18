using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.FileUploads.Dtos;

namespace Application.FileUploads
{
    public static class FileUploadsMapper
    {
        public static FileUploadDto MapToDto(this Domain.Entities.FileUploads fileUploads)
        {
            return new FileUploadDto
            {
                Id = fileUploads.Id,
                UserId = fileUploads.UserId,
                Url = fileUploads.Url,
                PublicId = fileUploads.PublicId,
                FileType = fileUploads.FileType,
                FileSize = fileUploads.FileSize,
                UploadedAt = fileUploads.UploadedAt,
                username = fileUploads.User.UserName!,
            };
        }
    }
}
