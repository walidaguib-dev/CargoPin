using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;
using NetTopologySuite.Geometries;

namespace Domain.Entities
{
    public class Area
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public AreaStatus Status { get; set; }
        public Geometry Boundary { get; set; } = null!;
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;

        public int ZoneId { get; set; }
        public Zone Zone { get; set; } = null!;
    }
}
