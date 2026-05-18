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
        public Polygon Boundary { get; set; } = null!;
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public int ZoneId { get; set; }
        public Zone Zone { get; set; } = null!;
        public int DesignatedMerchandiseId { get; set; }
        public Merchandise DesignatedMerchandise { get; set; } = null!;
    }
}
