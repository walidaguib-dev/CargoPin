using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace Domain.Entities
{
    public class Vessel
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? IMONumber { get; set; }
        public DateTime? ArrivalDate { get; set; }
        public DateTime? DepartureDate { get; set; }
        public VesselStatus Status { get; set; }

        public List<Client> Clients { get; set; } = [];
    }
}
