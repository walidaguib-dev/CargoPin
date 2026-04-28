using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Requests.Clients
{
    public class UpdateClientRequest
    {
        public string Name { get; set; } = null!;
        public string[] BLNumbers { get; set; } = [];
        public DateTime ArrivalDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Note { get; set; }
        public int VesselId { get; set; }
        public int MerchandiseId { get; set; }
    }
}
