using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.FileUploads.Dtos
{
    public class FileUploadDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty; // FK to ApplicationUser
        public string Url { get; set; } = string.Empty; // Cloudinary URL
        public string PublicId { get; set; } = string.Empty; // Cloudinary public ID
        public string FileType { get; set; } = string.Empty; // e.g., "image/png"
        public long FileSize { get; set; } // in bytes
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public string username { get; set; } = string.Empty;
    }
}
