using Domain.Helpers;

namespace Domain.Requests.Zones
{
    public class UpdateZoneRequest
    {
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Type { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public List<BoundaryCoordinate>? Boundary { get; set; }
        public int? DesignatedMerchandiseId { get; set; }
    }
}
