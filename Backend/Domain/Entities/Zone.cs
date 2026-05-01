using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace Domain.Entities
{
    public class Zone
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!; // "Hangar 6000"
        public string Code { get; set; } = null!; // "H6000"
        public ZoneType Type { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public List<Area> Areas { get; set; } = [];
    }
}
