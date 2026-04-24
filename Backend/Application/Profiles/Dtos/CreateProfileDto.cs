using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Profiles.Dtos
{
    public class CreateProfileDto
    {
        public string UserId { get; set; } = string.Empty; // FK to ApplicationUser.Id
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public int? UploadId { get; set; }
    }
}
