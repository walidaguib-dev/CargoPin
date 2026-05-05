using Domain.Enums;
using NetTopologySuite.Geometries;

namespace Domain.Entities
{
    public class Zone
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public ZoneType Type { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public Geometry? Boundary { get; set; }
        public List<Area> Areas { get; set; } = [];
    }
}
