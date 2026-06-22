using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace Domain.Requests.Vessels
{
    public class UpdateVesselRequest
    {
        public string Name { get; set; } = null!;
        public string? IMONumber { get; set; }
        public string Status { get; set; }
    }
}
