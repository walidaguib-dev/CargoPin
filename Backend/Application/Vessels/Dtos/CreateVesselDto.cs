using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Vessels.Dtos
{
    public class CreateVesselDto
    {
        public string Name { get; set; } = null!;
        public string? IMONumber { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
