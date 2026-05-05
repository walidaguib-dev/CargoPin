using Domain.Helpers;

namespace Application.Zones.Dtos
{
    public class CreateZoneDto
    {
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Type { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public List<BoundaryCoordinate>? Boundary { get; set; }
    }
}
