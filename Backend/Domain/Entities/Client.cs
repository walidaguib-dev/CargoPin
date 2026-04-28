using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace Domain.Entities
{
    public class Client
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!; // "Houdna Metal"
        public string[] BLNumbers { get; set; } = []; // ["BL-001", "BL-002"]
        public DateTime ArrivalDate { get; set; }
        public ClientStatus Status { get; set; }
        public string? Note { get; set; }

        // FKs
        public int VesselId { get; set; }
        public Vessel Vessel { get; set; } = null!;

        public int MerchandiseId { get; set; }
        public Merchandise Merchandise { get; set; } = null!;
    }
}
