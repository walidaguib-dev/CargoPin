using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace Domain.Interfaces
{
    public interface IFileUploads
    {
        public Task<object> UploadImageAsync(IFormFile file);
        public Task<FileUploads> UploadsAsync(string userId, IFormFile file);
        public Task<bool?> DeleteUploadAsync(string publicId);
        public Task<bool?> UpdateAsync(string userId, IFormFile file, string oldPublicId);
    }
}
